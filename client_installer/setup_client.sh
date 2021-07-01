#!/bin/bash

# It is rarely a good idea to have sudo inside scripts. 
# Instead, remove the sudo from the script and run the script itself with sudo:
# sudo myscript.sh
# source: https://askubuntu.com/a/425990

############## Step1:Welcome and install rsyslog #####################################################################
# Check the bash shell script is being run by root
#
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root. Use: sudo bash ./setup.sh" 1>&2
   exit 1
fi

# Check if user passed the password.

echo
echo "Welcome to rsyslog client  setup.Once this setup is configured all your Logs machine will be forwarded to the server that you've choosed. "

# Get the latest package lists

echo
echo "$(date +"%T") | 1/7 : Running apt-get update..."
apt-get -qqy update


# Install rsyslog :  https://www.rsyslog.com/ubuntu-repository/ (Although it's installed by default on Ubuntu 20.04)

echo
echo "$(date +"%T") | 2/7 : Installing rsyslog..."
echo
echo
add-apt-repository -y ppa:adiscon/v8-devel
echo
apt-get -qqy install rsyslog 

echo
echo "$(date +"%T") |  3/7 :The installation  is done."

#request the ip address of the server from the client:

echo "$(date +"%T") |  4/7 :Please enter the server ip address :"
read  server_ip
echo "$(date +"%T") |  5/7 :All the Logs of your machine will be moved to the server :"
echo "$server_ip"

############## Step2:Update the file /etc/rsyslog.conf ###############################################################

FILE="/etc/rsyslog.conf"

#check if the ip_address already exists in  the /etc/rsyslog.conf or not:

#the config is already done and we should exit the program
if grep -q "$server_ip" /etc/rsyslog.conf; then
       
        echo 'the server entered is already associated to your machine nothing to be done.'
        exit 

else
        #since the name of the file should  be also unique we'll name it as server_ip_fwd
        #this action is more recommended by rsyslog since even if the user went offline or facing a problem
        #the logs that should be forworded to the server are saved and moved to it once the problem is resolved

        echo '.action(type="omfwd"'>>/etc/rsyslog.conf
        echo   ' queue.type="linkedlist"'>>/etc/rsyslog.conf
        echo    "queue.filename='${server_ip}_fwd'">>/etc/rsyslog.conf #the name of the file where logs are storred
        echo    'action.resumeRetryCount="-1"'>>/etc/rsyslog.conf
        echo     'queue.saveOnShutdown="on"'>>/etc/rsyslog.conf
        echo      "target='$server_ip' protocol='tcp' ">>/etc/rsyslog.conf #the ip address of the server
	echo     ")">>/etc/rsyslog.conf

fi
#reconfigure rsyslog
echo "$(date +"%T") |6/7 : ready to forword logs to the server."
systemctl restart rsyslog
echo "$(date +"%T") |7/7 : The setup is done."
#
# Done, Alhamulillah.
#
#
# Done, Alhamulillah.
#
