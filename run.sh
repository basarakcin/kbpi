#!/bin/bash
args="$@"
#docker run $args -it --rm --privileged --network=host codesys:control
docker run -d --privileged --network=host codesys:control

# docker run $args --platform=linux/amd64 -it --rm  codesys


