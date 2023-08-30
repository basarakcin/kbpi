#!/bin/bash

log_file="/var/opt/codesys/startup.log"

log_with_timestamp() {
    while IFS= read -r line; do
        timestamp=$(date "+%Y-%m-%d %H:%M:%S")
        echo "[${timestamp}] > $line"
    done
}

EXEC() {
  local cmd=("$@")
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  local username=$(whoami)
  local hostname=$(hostname)
  local current_dir=$(pwd)
  
  if [ "$current_dir" = "$HOME" ]; then
    current_dir="~"
  fi
  
  echo "[$timestamp] $username@$hostname:$current_dir\$ ${cmd[*]}" | sudo tee -a "$log_file"
  
  # Execute the command, capture both stdout and stderr
  "${cmd[@]}" 2>&1 | log_with_timestamp | sudo tee -a "$log_file"
}

if [[ -z `grep "docker0" /proc/net/dev` ]]; then
  EXEC echo "Container not running in host mode. Sure you configured host network mode? Container stopped."
  exit 143
fi

term_handler() {
  if [ -f /etc/init.d/edgegateway ]; then
    EXEC /etc/init.d/codesysedge stop
  fi

  if [ -f /etc/init.d/codesyscontrol ]; then
    EXEC /etc/init.d/codesyscontrol stop
  fi

  EXEC /etc/init.d/ssh stop
  sudo rm /var/opt/codesys/codesyscontrol.log
  exit 143; # 128 + 15 -- SIGTERM
}

trap 'kill ${!}; term_handler' SIGINT SIGKILL SIGTERM SIGQUIT SIGTSTP SIGSTOP SIGHUP

EXEC sudo mkdir -p /run/sshd

if [ "$SSHPORT" ]; then
  EXEC echo "The container binds the SSH server port to the configured port: $SSHPORT"
  EXEC sudo sed -i -e "s;#Port 22;Port $SSHPORT;" /etc/ssh/sshd_config
else
  EXEC echo "The container binds the SSH server port to the default port: 2222"
fi

EXEC sudo /etc/init.d/ssh start

if [ -f /etc/init.d/codesysedge ]; then
  EXEC sudo /etc/init.d/codesysedge start
else
  EXEC echo "CODESYS Edge Gateway not installed. Download from here https://store.codesys.com/codesys-edge-gateway.html and install via CODESYS Development System."
fi

if [ -f /etc/init.d/codesyscontrol ]; then
   sudo script -q -c "sudo /opt/codesys/bin/codesyscontrol.bin -d /etc/CODESYSControl.cfg" /var/opt/codesys/codesyscontrolinfo.log| sudo tee -a /var/opt/codesys/codesyscontrolinfo.log
else
  EXEC echo "CODESYS runtime not installed. Download from here https://store.codesys.com/codesys-control-for-raspberry-pi-sl.html and install via CODESYS Development System."
fi



# Wait forever not to exit the container
while true; do
  tail -f /dev/null & wait ${!}
done

exit 0
