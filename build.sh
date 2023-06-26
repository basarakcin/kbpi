#!/bin/bash

log_flag=false
extra_args=""

for arg in "$@"; do
  if [[ $arg == "--log" ]]; then
    log_flag=true
    continue
  fi
  extra_args="$extra_args $arg"
done

# if [[ $log_flag == true ]]; then
#   echo "==================================================" | tee -a build.log
#   echo "Starting new build: $(date)" | tee -a build.log
#   echo "==================================================" | tee -a build.log

#   docker build $extra_args --platform=linux/amd64 --progress=plain -t codesys:control . 2>&1 | tee -a build.log
# else
#   docker build $extra_args --platform=linux/amd64 -t codesys:control .
# fi

# Enable QEMU in Docker
# This step makes Docker use the QEMU emulator when it runs containers
# for architectures different from the host.
# docker run --rm --privileged multiarch/qemu-user-static --reset -p yes

for arg in "$@"; do
  if [[ $arg == "--log" ]]; then
    log_flag=true
  elif [[ $arg != "--platform=linux/amd64" ]]; then
    extra_args="$extra_args $arg"
  fi
done

if [[ $log_flag == true ]]; then
  echo "==================================================" | tee -a build.log
  echo "Starting new build: $(date)" | tee -a build.log
  echo "==================================================" | tee -a build.log

  docker build $extra_args --platform=linux/amd64 --progress=plain -t codesys:control . 2>&1 | tee -a build.log
else
  docker build $extra_args --platform=linux/amd64 -t codesys:control .
fi
