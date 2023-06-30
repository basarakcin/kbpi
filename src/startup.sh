#!/bin/bash

service codesysedge start

# start tunnel to license server or start codemeter
if [ ! -z ${LICENSE_SERVER} ]; then
	echo "[codemeter] connecting to network server ${LICENSE_SERVER}."
	echo "[codemeter] you need to forward port 22350 on the server *locally* to 22357."
	echo "e.g.: socat tcp-listen:22357,fork,reuseaddr tcp:localhost:22350&"
	socat tcp-listen:22350,fork,reuseaddr,bind=127.0.0.1 tcp:${LICENSE_SERVER}:22357&

	# one potential other possible solutions to use a network server
    #/etc/init.d/codemeter start
    #cmu --add-server ${LICENSE_SERVER}
else
	service codemeter start
fi

mkdir -p /run/sshd
service ssh start

export LD_LIBRARY_PATH=/opt/codesys/lib
/opt/codesys/bin/codesyscontrol.bin -d /etc/CODESYSControl.cfg
