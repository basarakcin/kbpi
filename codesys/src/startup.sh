#!/bin/bash

services=("ssh" "codesysedge" "codemeter")
log_file="/var/log/codesys/output.log"
username=$(whoami)
hostname=$(hostname)
current_dir=$(pwd)

log_and_execute() {
  echo "$username@$hostname:$current_dir \$" | sudo tee -a $log_file
  "$@" 2>&1 | sudo tee -a $log_file
}

create_directory() {
  log_and_execute sudo mkdir -p $1
}

create_directory /run/sshd

service_start_status() {
  log_and_execute sudo service $1 start
  log_and_execute sudo service $1 status
}

for service in "${services[@]}"
do
  service_start_status $service
done

export LD_LIBRARY_PATH=/opt/codesys/lib

log_and_execute sudo script -q -c "sudo /opt/codesys/bin/codesyscontrol.bin -d /etc/CODESYSControl.cfg" $log_file

# Not needed but keeping it just in case
# # start tunnel to license server or start codemeter
# if [ ! -z ${LICENSE_SERVER} ]; then
# 	echo "[codemeter] connecting to network server ${LICENSE_SERVER}."
# 	echo "[codemeter] you need to forward port 22350 on the server *locally* to 22357."
# 	echo "e.g.: socat tcp-listen:22357,fork,reuseaddr tcp:localhost:22350&"
# 	socat tcp-listen:22350,fork,reuseaddr,bind=127.0.0.1 tcp:${LICENSE_SERVER}:22357&

# 	# one potential other possible solutions to use a network server
#     #/etc/init.d/codemeter start
#     #cmu --add-server ${LICENSE_SERVER}
# fi
