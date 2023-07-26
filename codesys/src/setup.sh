#!/bin/bash

apt-get update -y
apt-get upgrade -y
apt-get install -y \
            apt-utils \
            ca-certificates \
            iptables \
            libfontconfig1 \
            libfreetype6 \
            libice6 \
            libsm6 \
            libusb-1.0-0 \
            libxcb1 \
            lsb-base \
            nano \
            net-tools \
            openssh-server \
            procps \
            socat \
            sudo
apt-get autoremove -y
apt-get clean
rm -rf /var/lib/apt/lists/*
