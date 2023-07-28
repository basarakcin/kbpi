#!/bin/bash

log_file="/var/log/codesys/output.log"
log_with_timestamp() {
    while IFS= read -r line; do
        timestamp=$(date "+%Y-%m-%d %H:%M:%S")
        echo "[${timestamp}] $line"
    done
}

# Executes and logs the command
EXEC() {
  username=$(whoami)
  hostname=$(hostname)
  current_dir=$(pwd)
  if [ "$current_dir" = "$HOME" ]; then
    current_dir="~"
  fi

  command=("$@")
  timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  echo "$timestamp $username@$hostname:$current_dir\$ ${command[*]}" | sudo tee -a "$log_file"
  "${command[@]}" 2>&1 | log_with_timestamp | sudo tee -a "$log_file"
}

if [[ -z `grep "docker0" /proc/net/dev` ]]; then
  EXEC echo "Container not running in host mode. Sure you configured host network mode? Container stopped."
  exit 143
fi

# SIGNAL-handler
term_handler() {
  if [ -f /etc/init.d/edgegateway ]
  then
    EXEC echo "Terminating CODESYS Edge Gateway ..."
    EXEC /etc/init.d/codesysedge stop
  fi

  if [ -f /etc/init.d/codesyscontrol ]
  then
    EXEC echo "Terminating CODESYS Runtime ..."
    EXEC /etc/init.d/codesyscontrol stop
  fi

  EXEC echo "Terminating ssh ..."
  EXEC /etc/init.d/ssh stop

  exit 143; # 128 + 15 -- SIGTERM
}

# On callback, stop all started processes in term_handler
trap 'kill ${!}; term_handler' SIGINT SIGKILL SIGTERM SIGQUIT SIGTSTP SIGSTOP SIGHUP

EXEC export LD_LIBRARY_PATH=/opt/codesys/lib

EXEC sudo mkdir -p /run/sshd
EXEC echo "Starting SSH server ..."
if [ "SSHPORT" ]; then
  # User defined ssh port
  EXEC echo "The container binds the SSH server port to the configured port: $SSHPORT"
  EXEC sudo sed -i -e "s;#Port 22;Port $SSHPORT;" /etc/ssh/sshd_config
else
  EXEC echo "The container binds the SSH server port to the default port: 2222"
fi
EXEC sudo /etc/init.d/ssh start &

if [ -f /etc/init.d/codesyscontrol ]
then
  EXEC echo "Starting CODESYS Runtime ..."
  EXEC sudo /etc/init.d/codesyscontrol start &
else
  EXEC echo "CODESYS runtime not installed. Download from here https://store.codesys.com/codesys-control-for-raspberry-pi-sl.html and install via CODESYS Development System."
fi

if [ -f /etc/init.d/codesysedge ]
then
  EXEC echo "Starting CODESYS Edge Gateway ..."
  EXEC sudo /etc/init.d/codesysedge start >/dev/null &
else
  EXEC echo "CODESYS Edge Gateway not installed. Download from here https://store.codesys.com/codesys-edge-gateway.html and install via CODESYS Development System."
fi

# Wait forever not to exit the container
while true
do
  tail -f /dev/null & wait ${!}
done

exit 0
