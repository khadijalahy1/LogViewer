#!/bin/bash

#
# rLogViewer installer v0.03.
#

#
# Variables
#

MYSQL_APT_REP_PACKAGE="mysql-apt-config_0.8.17-1_all.deb"
MYSQL_APT_REP_DIR="/tmp/rLogViewer/"

#
# Exit on failure : https://intoli.com/blog/exit-on-errors-in-bash-scripts/
#
set -e

#
# keep track of the last executed command
#
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
#
# echo an error message before exiting
#
trap 'echo The setup has failed due to the following command: "\"${last_command}\" [Exit code|$?]."' EXIT

#
# Register for cleanup
#
trap 'rm -rf $MYSQL_APT_REP_DIR > /dev/null' EXIT

# It is rarely a good idea to have sudo inside scripts. 
# Instead, remove the sudo from the script and run the script itself with sudo:
# sudo myscript.sh
# source: https://askubuntu.com/a/425990

#
# Check the bash shell script is being run by root
#
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root. Use: sudo bash ./setup.sh" 1>&2
   exit 1
fi

#
# Check if user passed the password.
#
echo
echo "Welcome to rLogViewer setup."
echo
echo "The setup will install the following packages (if not already present): rsyslog, MySQL and rsyslog-mysql."
echo "A password is required through the installation. Type in this password and please don't forget it:"
echo

while true; do
    read -s -r -p "Password: " password
    echo
    read -s -r -p "Confirm password: " password2
    echo
    [ "$password" = "$password2" ] && break
    echo "Passwords mismatch! Please try again."
    echo
done

#
# Get the latest package lists
# Use -qqy  to assume YES to all queries and do not prompt and reduce the log.
#
echo
echo "$(date +"%T") | 1/9 : Running apt-get update..."
apt-get -qqy update

#
# Install rsyslog :  https://www.rsyslog.com/ubuntu-repository/ (Although it's installed by default on Ubuntu 20.04)
#
echo
echo "$(date +"%T") | 2/9 : Installing rsyslog..."
add-apt-repository -y ppa:adiscon/v8-devel
apt-get -qqy install rsyslog 

#
# Install MySQL : https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/
# This is done by:
# This does not work anymore : (1- Manually install and configure the MySQL APT repository : https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/#repo-qg-apt-repo-manual-setup)
#

MYSQL_APT_REP_PATH=$MYSQL_APT_REP_DIR$MYSQL_APT_REP_PACKAGE

echo
echo "$(date +"%T") | 3/9 : Downloading MySQL APT repository package..."
mkdir -p $MYSQL_APT_REP_DIR
wget -q https://dev.mysql.com/get/$MYSQL_APT_REP_PACKAGE -O $MYSQL_APT_REP_PATH

echo
echo "$(date +"%T") | 4/9 : Installing MySQL APT repository package..."

DEBIAN_FRONTEND=noninteractive dpkg --skip-same-version -i $MYSQL_APT_REP_PATH

#
# 2- Update package information from the MySQL APT repository with the following command (this step is mandatory):
#
echo
echo "$(date +"%T") | 5/9 : Updating package information from the MySQL APT repository..."
apt-get -qqy update

#
# 3- Install MySQL Non-interactively : https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/index.html#repo-qg-apt-repo-non-insteractive
#

# For that we need debconf-utils. TODO: uninstall debconf-utils at the end of not already installed.

echo
apt-get install -qqy debconf-utils

echo
echo "$(date +"%T") | 6/9 : Installing MySQL..."
debconf-set-selections <<< "mysql-community-server mysql-community-server/root-pass password $password"
debconf-set-selections <<< "mysql-community-server mysql-community-server/re-root-pass password $password"
DEBIAN_FRONTEND=noninteractive apt-get -qqy install mysql-server

#
# TODO: Secure the installation using silently executing mysql_secure_installation: https://gist.github.com/coderua/5592d95970038944d099
# Done with MySQL.
#

#
# Install rsyslog-mysql plugin.
# Decline dbconfig installation, the database will be manually installed.
#
echo
echo "$(date +"%T") | 7/9 : Installing rsyslog-mysql..."

debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/dbconfig-install boolean false"
DEBIAN_FRONTEND=noninteractive apt-get -qqy install rsyslog-mysql

#
# Install the databse (Syslog).
# The database name and user name and password must be identical to the ones set in rsyslog.conf.
#
echo
echo "$(date +"%T") | 8/9 : Setting up Syslog database..."

DB_NAME="Syslog"
USER_NAME="rsyslog"

mysql -uroot -p${password} -e "CREATE DATABASE ${DB_NAME} /*\!40100 DEFAULT CHARACTER SET utf8 */;"
mysql -uroot -p${password} -e "CREATE USER ${USER_NAME}@localhost IDENTIFIED BY '${password}';"
mysql -uroot -p${password} -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${USER_NAME}'@'localhost';"
mysql -uroot -p${password} -e "FLUSH PRIVILEGES;"

#
# Update rsyslog configuration to start writing logs into the database.
#
echo
echo "$(date +"%T") | 9/9 : Updating rsyslog configuration, the current configuration is moved to /etc/rsyslog-old.conf..."

# Backup
mv /etc/rsyslog.conf /etc/rsyslog-old.conf

# Update
wget --no-cache -O /etc/rsyslog.conf https://gitlab.com/GZPERRA/rlogviewer/-/raw/main/installer/rsyslog.conf

# Update the password
sed -i "s/password/$password/" /etc/rsyslog.conf

# Reload the configuration
systemctl reload rsyslog

#
# Done, Alhamulillah.
#

echo
echo "$(date +"%T") | The setup is done."

#
# Self destruction :)
#
rm -- "$0"