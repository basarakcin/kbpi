#!/bin/bash +x


#check if container is running in host mode
if [[ -z `grep "docker0" /proc/net/dev` ]]; then
  echo "Container not running in host mode. Sure you configured host network mode? Container stopped."
  exit 143
fi

#check if container is running in privileged mode
ip link add dummy0 type dummy >/dev/null 2>&1
if [[ -z `grep "dummy0" /proc/net/dev` ]]; then
  echo "Container not running in privileged mode. Sure you configured privileged mode? Container stopped."
  exit 143
else
  # clean the dummy0 link
  ip link delete dummy0 >/dev/null 2>&1
fi

# SIGNAL-handler
term_handler() {
#   if [ -f /etc/init.d/edgegateway ]
#   then
#     echo "Terminating CODESYS Edge Gateway ..."
#     /etc/init.d/codesysedge stop
#   fi

#   if [ -f /etc/init.d/codesyscontrol ]
#   then
#     echo "Terminating CODESYS Runtime ..."
#     /etc/init.d/codesyscontrol stop
#   fi

  
#   echo "Terminating ssh ..."
#   /etc/init.d/ssh stop

  exit 143; # 128 + 15 -- SIGTERM
}
# on callback, stop all started processes in term_handler
trap 'kill ${!}; term_handler' SIGINT SIGKILL SIGTERM SIGQUIT SIGTSTP SIGSTOP SIGHUP
#resolve HOST just in case
if ! ( grep -q "127.0.0.1 localhost localhost.localdomain ${HOSTNAME}" /etc/hosts > /dev/null);
then
  echo "127.0.0.1 localhost localhost.localdomain ${HOSTNAME}" >> /etc/hosts
fi

# /etc/init.d/ssh start &


# if [ -f /etc/init.d/codesyscontrol ]
# then
#   echo "Starting CODESYS Runtime ..."
#   /etc/init.d/codesyscontrol start &
# else
#   echo "CODESYS runtime not installed. Download from here https://store.codesys.com/codesys-control-for-raspberry-pi-sl.html and install via CODESYS Development System."
# fi

# if [ -f /etc/init.d/codesysedge ]
# then
#   echo "Starting CODESYS Edge Gateway ..."
#   /etc/init.d/codesysedge start >/dev/null &
# else
#   echo "CODESYS Edge Gateway not installed. Download from here https://store.codesys.com/codesys-edge-gateway.html and install via CODESYS Development System."
# fi

# # wait forever not to exit the container
# while true
# do
#   tail -f /dev/null & wait ${!}
# done




# Start the services
echo "Starting codemeter..."
service codemeter start
echo "Starting codesys..."
service codesys start

# Keep the container running
tail -f /dev/null
exit 0

# ssh -R 0:localhost:22 v2@connect.ngrok-agent.com tcp 22 