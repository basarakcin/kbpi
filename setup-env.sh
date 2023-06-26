#!/bin/bash

apt-get update -y
apt-get install -y \
    libfontconfig1 \
    libfreetype6 \
    libice6 \
    libsm6 \
    libusb-1.0-0 \
    libxcb1 \
    lsb-base \
    multiarch-support \
    procps \
    socat \
    unzip \
    wget

apt-get update && \
apt-get upgrade -y && \
apt-get install -y \
    apt-utils \
    ca-certificates \
    libfontconfig1 \
    libfreetype6 \
    libice6 \
    libsm6 \
    libusb-1.0-0 \
    libxcb1 \
    lsb-base \
    multiarch-support \
    net-tools \
    openssh-server \
    procps \
    socat \
    unzip \
    wget

apt-get autoremove -y
apt-get clean
rm -rf /var/lib/apt/lists/*
