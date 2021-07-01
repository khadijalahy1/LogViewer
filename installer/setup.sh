#!/bin/bash

#
# rLogViewer installer v0.2.
#

#################
#### as Root ####
#################

#
# It is rarely a good idea to have sudo inside scripts. 
# Instead, remove the sudo from the script and run the script itself with sudo:
# sudo myscript.sh
# source: https://askubuntu.com/a/425990
#
# Check the bash shell script is being run by root.
#
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root. Use: sudo bash ./setup.sh" 1>&2
   exit 1
fi

###################
#### Variables ####
###################

INSTALL_PACKAGE_URL="https://sourceforge.net/projects/rlogviewer/files/beta/rlogviewer-v0.0.1.tar.gz"
INTASLL_TEMP_DIR="/tmp/rlogviewer"
INSTALL_DIR="/opt"

PATH_RLOGVIEWER_DIR="${INTASLL_TEMP_DIR}/rlogviewer"
PATH_RLOGVIEWER_DB_FILE="${PATH_RLOGVIEWER_DIR}/db.js"
PATH_RSYSLOG_CONF="${INTASLL_TEMP_DIR}/rsyslog.conf"
PATH_SYSTEMD_UNIT="${INTASLL_TEMP_DIR}/rlogviewer.service"
PATH_MYSQL_APT_REP_PACKAGE="${INTASLL_TEMP_DIR}/mysql-apt-config_0.8.17-1_all.deb"

####################
#### Error=Exit ####
####################

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

#################
#### Cleanup ####
#################

#
# Register for cleanup: delete the installation temp dir.
#
trap 'rm -rf $INTASLL_TEMP_DIR > /dev/null' EXIT

#################
#### Welcome ####
#################

echo
echo "Welcome to rLogViewer Setup v0.2."
echo
echo "rLogViewer is a web based interface for viewing and analysing rsyslog logs."
echo "The setup will install rLogViewer on your machine with the following dependencies: rsyslog, MySQL, rsyslog-mysql and nodejs."
echo "The setup will try to update already installed packages, except for MySQL."
echo

####################
#### MySQL Root ####
####################

#
# Before we start, we check if MySQL is already installed:
# Check if MySQL is installed. This helped: https://stackoverflow.com/a/12137501/10280599.
# This will threw an error if MySQL is not installed, so we temporary disable the exit on error.
#
set +e

if [[ $(which mysqld) ]]; then
    IS_MYSQL_INSTALLED=true
else
    IS_MYSQL_INSTALLED=false
fi

# Get exit on error back.
set -e

#
# If MySQL is already installed, nothing is done, since the upgrade process, even if permitted by the user, 
# is sill complicated and can cause problems. Check https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/index.html#repo-qg-apt-upgrading.
# TODO: implement MySQL upgrade.
#

#
# Since we need to execute some MySQL queries, we need the root password.
# Since -p is unsecure, we use option files: https://dev.mysql.com/doc/refman/8.0/en/option-files.html.
# So we check if the root option file /root/.my.cnf is present, otherwise get the root password and create it.
# 
# MySQL is installed.
if [ "$IS_MYSQL_INSTALLED" = true ]; then

    # Check if root options file is present, otherwise get the password to create it.
    if [ ! -f /root/.my.cnf ]; then
        echo "The setup will create a new database with MySQL, which requires the password of its root user."
        echo
        read -s -r -p "Please type in MySQL root password: " MYSQL_ROOT_PASSWD

        while ! mysql -u root -p"$MYSQL_ROOT_PASSWD"  -e ";" ; do
            read -s -r -p "Can't connect, please retry: " MYSQL_ROOT_PASSWD
        done
    fi
# MySQL is not installed. 
else
    echo "Since MySQL requires a password, you'll be asked to type it in before we start."
    echo "When the installer is done InshaAllah, we encourage you to run mysql_secure_installation to improve the security of your MySQL installation."
    echo

    while true; do
        read -s -r -p "Password: " MYSQL_ROOT_PASSWD
        echo
        read -s -r -p "Confirm password: " passcheck
        echo
        [ "$MYSQL_ROOT_PASSWD" = "$passcheck" ] && break
        echo "Passwords mismatch! Please try again."
        echo
    done
fi

#
# Finally, whether MySQL is installed or not, we will create the root options file is not already present. 
#
if [ ! -f /root/.my.cnf ]; then
    echo "[client]" > /root/.my.cnf
    echo "user=root" >> /root/.my.cnf
    echo "password=$MYSQL_ROOT_PASSWD" >> /root/.my.cnf
    # Change permission to prevent other users from reading it.
    chmod 0600 /root/.my.cnf
fi

echo
echo "Please ensure that the file /root/.my.cnf is kept safe until the installation is done."
echo
echo "Installation has started, it will take a couple minutes to setup rLogViewer ..."
echo

###############################################
#### Step 1: Download installation package ####
###############################################

echo
echo "$(date +"%T") | 1/10 : Downloading rLogViewer installation package ..."
mkdir -p $INTASLL_TEMP_DIR
wget --no-cache -qO- $INSTALL_PACKAGE_URL | tar xz -C $INTASLL_TEMP_DIR


#
# The use of -qqy tells apt to assume YES to all queries and reduce its output.
#

#########################
#### Step 2: rsyslog ####
#########################

#
# Install rsyslog :  https://www.rsyslog.com/ubuntu-repository/ (Although it's installed by default on Ubuntu 20.06)
#
echo
echo "$(date +"%T") | 2/10 : Installing rsyslog ..."
add-apt-repository -y ppa:adiscon/v8-devel > /dev/null
apt-get -qqy update
apt-get -qqy install rsyslog > /dev/null

#######################
#### Step 3: MySQL ####
#######################

#
# Install MySQL (only if not already installed): https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/
# This is done by:
# This does not work anymore : (1- Manually install and configure the MySQL APT repository : https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/#repo-qg-apt-repo-manual-setup)
#

# MySQL in not installed.
if [ "$IS_MYSQL_INSTALLED" = false ]; then

    #
    # 1- Adding the MySQL APT Repository Non-interactively.
    #
    echo
    echo "$(date +"%T") | 3/10 : Installing MySQL APT repository package ..."

    DEBIAN_FRONTEND=noninteractive dpkg --skip-same-version -i $PATH_MYSQL_APT_REP_PACKAGE > /dev/null

    #
    # 2- Update package information from the MySQL APT repository with the following command (this step is mandatory):
    #
    echo
    echo "$(date +"%T") | 4/10 : Updating package information from the MySQL APT repository ..."
    apt-get -qqy update > /dev/null

    #
    # 3- Install MySQL Non-interactively : https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/index.html#repo-qg-apt-repo-non-insteractive
    #

    # For that we need debconf-utils. TODO: uninstall debconf-utils at the end if it has not been installed.

    echo
    apt-get install -qqy debconf-utils > /dev/null

    echo
    echo "$(date +"%T") | 5/10 : Installing MySQL ..."
    debconf-set-selections <<< "mysql-community-server mysql-community-server/root-pass password $MYSQL_ROOT_PASSWD"
    debconf-set-selections <<< "mysql-community-server mysql-community-server/re-root-pass password $MYSQL_ROOT_PASSWD"
    DEBIAN_FRONTEND=noninteractive apt-get -qqy install mysql-server > /dev/null

    #
    # TODO: Secure the installation using silently executing mysql_secure_installation: https://gist.github.com/coderua/5592d95970038944d099    
    #

# MySQL in installed.
else
    echo "$(date +"%T") | 3-5/10 : Installing MySQL [Skipped] (A version of MySQL is already installed.)"
fi

#
# Done with MySQL.
#

###############################
#### Step 4: rsyslog-mysql ####
###############################

#
# Install rsyslog-mysql plugin.
# Decline dbconfig installation, the database will be "manually" installed.
#
echo
echo "$(date +"%T") | 6/10 : Installing rsyslog-mysql ..."

debconf-set-selections <<< "rsyslog-mysql rsyslog-mysql/dbconfig-install boolean false"
DEBIAN_FRONTEND=noninteractive apt-get -qqy install rsyslog-mysql > /dev/null

#
# This installation creates an invalid configuration file: /etc/rsyslog.d/mysql.conf.
# We will delete it, so even if the user wan't to include the config files at /etc/rsyslog.d, he will not get into trouble.
# 
rm -f /etc/rsyslog.d/mysql.conf

###########################
#### Step 5: Create DB ####
###########################

#
# Install the databse (Syslog).
# The database name and user name and password must be identical to the ones set in rsyslog.conf.
#
echo
echo "$(date +"%T") | 7/10 : Setting up Syslog database ..."

#
# Database options
#
DB_NAME="Syslog"
DB_USER_NAME="rsyslog"
DB_USER_PASSWORD=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c12) # random password : https://unix.stackexchange.com/questions/230673/how-to-generate-a-random-string#comment393789_230676.

#
# Now let's create the Syslog database and give the rsyslog user full privileges.
# After that, we create the SystemEvents table.
# The official table is here: https://github.com/rsyslog/rsyslog/blob/master/plugins/ommysql/createDB.sql
# But it's so confusing: the columns doesn't correspond to the properties listed in their docs. 
# I couldn't even find the default template that could help me find out the meaning of those columns.
# So we will go with this simple (not perfect) table (taken from the docs' examples), and add its appropriate template in rsyslog.conf.
#

mysql -u root << EOF
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER_NAME}@localhost IDENTIFIED BY '${DB_USER_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER_NAME}'@'localhost';
FLUSH PRIVILEGES;

USE ${DB_NAME};

CREATE TABLE SystemEvents
(
    ID int unsigned not null auto_increment primary key,
    ReceivedAt datetime NULL,
    DeviceReportedTime datetime NULL,
    Facility smallint NULL,
    Priority smallint NULL,
    Host varchar(60) NULL,
    Message text,
    SysLogTag varchar(60)
);
EOF

##############################################
#### Step 6: Update rsyslog configuration ####
##############################################

#
# Update rsyslog configuration to start writing logs into the database.
#
echo
echo "$(date +"%T") | 8/10 : Updating rsyslog configuration, the old current configuration will be moved to /etc/rsyslog-old.conf ..."

# Backup configuration
mv /etc/rsyslog.conf /etc/rsyslog-old.conf

# Update configuration
mv $PATH_RSYSLOG_CONF /etc/rsyslog.conf

# Place the rsyslog user password in configuration file
sed -i "s/{password}/$DB_USER_PASSWORD/" /etc/rsyslog.conf

############################
#### Step 7: rLogViewer ####
############################

#
# The installation of rLogViewer consists of:
# 1- Installing node.js
# 2- Copying files(public, app.js) to a proper directory (/opt).
# 3- Place rsyslog user password into the db file.
# 4- Register rlogviewer as a service with a systemd unit file.
#

echo
echo "$(date +"%T") | 9/10 : Installing rLogViewer ..."

# INtall node.js
apt-get -qqy update > /dev/null
apt-get -qqy install nodejs > /dev/null

# Place the rsyslog user password in the db file
sed -i "s/{password}/$DB_USER_PASSWORD/" $PATH_RLOGVIEWER_DB_FILE

# Place server folder in installation folder
mv $PATH_RLOGVIEWER_DIR $INSTALL_DIR

# Place unit file in its location : https://www.axllent.org/docs/nodejs-service-with-systemd/
mv $PATH_SYSTEMD_UNIT /etc/systemd/system

################################
#### Step 8: Start Services ####
#################################

echo
echo "$(date +"%T") | 10/10 : Starting services ..."

# Restart rsyslog to reload the configuration (reload is not supported by rsyslog)
systemctl restart rsyslog > /dev/null

# Starting rLogViewer service <3
systemctl enable rlogviewer.service > /dev/null
systemctl start rlogviewer.service > /dev/null

#############################
#### Done, Alhamulillah. ####
#############################

echo
echo "$(date +"%T") | The setup is done."