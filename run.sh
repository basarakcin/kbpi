#!/bin/bash
docker run -it --rm -p 1202:22 -p 11740:11740 -p 1217:1217 -p 11743:11743 --privileged --name codesys_control codesys:control 


