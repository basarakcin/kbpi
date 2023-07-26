#!/bin/bash

services=("ssh" "codesysedge" "codemeter")

create_directory() {
  sudo mkdir -p $1 | sudo tee -a /var/log/codesys/output.log
}

create_directory /run/sshd

service_start_status() {
  sudo service $1 start | sudo tee -a /var/log/codesys/output.log
  sudo service $1 status | sudo tee -a /var/log/codesys/output.log
}

for service in "${services[@]}"
do
  service_start_status $service
done

export LD_LIBRARY_PATH=/opt/codesys/lib

sudo script -q -c "sudo /opt/codesys/bin/codesyscontrol.bin -d /etc/CODESYSControl.cfg" /var/log/codesys/output.log | sudo tee -a /var/log/codesys/output.log

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
