#!/bin/bash

#
# rLogViewer installer v0.05.
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
trap 'echo "\"${last_command}\" command failed with exit code $?."' EXIT

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
echo "$(date +"%T") | 1/7 : Running apt-get update..."
apt-get -qqy update

#
# Install rsyslog :  https://www.rsyslog.com/ubuntu-repository/ (Although it's installed by default on Ubuntu 20.04)
#
echo
echo "$(date +"%T") | 2/7 : Installing rsyslog..."
add-apt-repository -y ppa:adiscon/v8-devel
apt-get -qqy install rsyslog 

#
# Install MySQL : https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/
# This is done by:
# This does not work anymore : (1- Manually install and configure the MySQL APT repository : https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/#repo-qg-apt-repo-manual-setup)
#

MYSQL_APT_REP_PATH=$MYSQL_APT_REP_DIR$MYSQL_APT_REP_PACKAGE

echo
echo "$(date +"%T") | 3/7 : Downloading MySQL APT repository package..."
mkdir -p $MYSQL_APT_REP_DIR
wget -q https://dev.mysql.com/get/$MYSQL_APT_REP_PACKAGE -O $MYSQL_APT_REP_PATH

echo
echo "$(date +"%T") | 4/7 : Installing MySQL APT repository package..."

DEBIAN_FRONTEND=noninteractive 
dpkg --skip-same-version -i $MYSQL_APT_REP_PATH

#
# 2- Update package information from the MySQL APT repository with the following command (this step is mandatory):
#
echo
echo "$(date +"%T") | 5/7 : Updating package information from the MySQL APT repository..."
apt-get -qqy update

#
# 3- Install MySQL Non-interactively : https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/index.html#repo-qg-apt-repo-non-insteractive
#

# For that we need debconf-utils. TODO: uninstall debconf-utils at the end of not already installed.

echo
apt-get install -qqy debconf-utils

echo
echo "$(date +"%T") | 6/7 : Installing MySQL..."
debconf-set-selections <<< "mysql-community-server mysql-community-server/root-pass password $password"
debconf-set-selections <<< "mysql-community-server mysql-community-server/re-root-pass password $password"
DEBIAN_FRONTEND=noninteractive apt-get -qqy install mysql-server

#
# TODO: Secure the installation using silently executing mysql_secure_installation: https://gist.github.com/coderua/5592d95970038944d099
# Done with MySQL.
#

#
# Install rsyslog-mysql plugin.
# The following script was generated using a method described here: https://askubuntu.com/a/859655
#
echo
echo "$(date +"%T") | 7/7 : Installing rsyslog-mysql..."

debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/password-confirm password $password"
# MySQL application password for rsyslog-mysql:
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/mysql/app-pass password $password "
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/app-password-confirm password $password "
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/mysql/admin-pass password $password "
# Connection method for MySQL database of rsyslog-mysql:
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/mysql/method select Unix socket"
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/missing-db-package-error select abort"
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/install-error select abort"
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/internal/reconfiguring boolean false"
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/internal/skip-preseed boolean false"
# Database type to be used by rsyslog-mysql:
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/database-type select mysql"
# Perform upgrade on database for rsyslog-mysql with dbconfig-common?
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/dbconfig-upgrade boolean true"
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/passwords-do-not-match string"
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/mysql/admin-user string root"
# Back up the database for rsyslog-mysql before upgrading?
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/upgrade-backup boolean true"
# Deconfigure database for rsyslog-mysql with dbconfig-common?
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/dbconfig-remove boolean true"
# Host name of the MySQL database server for rsyslog-mysql:
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/remote/host select localhost"
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/remote/port string"
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/remove-error select abort"
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/upgrade-error select abort"
# MySQL username for rsyslog-mysql:
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/db/app-user string rsyslog@localhost"
# Configure database for rsyslog-mysql with dbconfig-common?
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/dbconfig-install boolean true"
# Reinstall database for rsyslog-mysql?
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/dbconfig-reinstall boolean false"
# Host running the MySQL server for rsyslog-mysql:
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/remote/newhost string"
# Delete the database for rsyslog-mysql?
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/purge boolean false"
# MySQL database name for rsyslog-mysql:
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/db/dbname string Syslog"
debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/mysql/authplugin select default"

DEBIAN_FRONTEND=noninteractive apt-get -qqy install rsyslog-mysql

#
# Done, Alhamulillah.
#

echo
echo "$(date +"%T") | The setup is done."

#
# Self destruction :)
#
rm -- "$0"
