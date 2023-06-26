#!/bin/bash

SUDO=""
# check if this linux system is debian based
if ! which dpkg >/dev/zero; then 
	echo "This install script only runs on debian based distributions"
	exit 1
fi

# check if we are running as root, or we have sudoers access to dpkg
if [ "$USER" != "root" ]; then
	if ! which sudo >/dev/zero; then
		echo "You are not running as root, and don't have sudo installed."
		exit 1
	fi
	echo "You are running as non-root user. We try to get sudo access to dpkg."
	if ! sudo dpkg --version >/dev/zero; then
		echo "You have no access to dpkg. Please rerun the script as root"
		exit 1
	fi
	SUDO="sudo"
fi

if ! which wget >/dev/zero; then
	echo "We need the tool 'wget' to download the CODESYS package."
	echo "You may try:"
	echo "  apt-get install wget"
	exit 1;
fi

if ! which unzip >/dev/zero; then
	echo "We need the tool 'unzip' to unpack the CODESYS package."
	echo "You may try:"
	echo "  apt-get install unzip"
	exit 1;
fi

if ! -d /lib64; then
	echo "Seems that you are not running on a traditional multi arch system."
	echo "As a workaround, you can link /lib to /lib64."
	echo "ln -s /lib /lib64"
fi

if [ -z "${TRY_RUN}" ]; then
	unzip -p /tmp/edge.package '*.deb'> /tmp/edge.deb && ${SUDO} dpkg -i /tmp/edge.deb
    unzip -p /tmp/codesys.package '*codemeter*.deb' > /tmp/codemeter.deb && ${SUDO} dpkg -i /tmp/codemeter.deb
	unzip -p /tmp/codesys.package '*codesyscontrol*.deb' > /tmp/codesys.deb && ${SUDO} dpkg -i /tmp/codesys.deb
fi