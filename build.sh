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

if [[ $log_flag == true ]]; then
  echo "==================================================" | tee -a build.log
  echo "Starting new build: $(date)" | tee -a build.log
  echo "==================================================" | tee -a build.log

  docker build $extra_args --progress=plain -t codesys:control . 2>&1 | tee -a build.log
else
  docker build $extra_args  -t codesys:control .
fi
