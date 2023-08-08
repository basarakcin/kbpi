#!/bin/bash

SUDO=""
if ! which dpkg >/dev/null; then 
	echo "This install script only runs on debian based distributions"
	exit 1
fi

if [ "$USER" != "root" ]; then
	if ! which sudo >/dev/null; then
		echo "You are not running as root, and don't have sudo installed."
		exit 1
	fi
	echo "You are running as non-root user. We try to get sudo access to dpkg."
	if ! sudo dpkg --version >/dev/null; then
		echo "You have no access to dpkg. Please rerun the script as root"
		exit 1
	fi
	SUDO="sudo"
fi

if [ ! -d /lib64 ]; then
	echo "Seems that you are not running on a traditional multi arch system."
	echo "As a workaround, you can link /lib to /lib64."
	echo "ln -s /lib /lib64"
fi

if [ -z "${TRY_RUN}" ]; then
	${SUDO} dpkg -i /tmp/*codemeter*.deb
	${SUDO} dpkg -i /tmp/*edge*.deb
	${SUDO} dpkg -i /tmp/*control*.deb
fi

rm -rf /var/opt/codesys/*.deb
