#
# Install CODESYS on a plain Debian container
#
# armv7hf compatible base image
# FROM balenalib/armv7hf-debian:buster-20191223
FROM debian:bookworm

LABEL maintainer="basar.akcin@knorr-bremse.com" \
      description="CODESYS Control"

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
        apt-utils \   
        build-essential \
        ca-certificates \
        net-tools \
        openssh-server \
        psmisc \
        ifupdown \
        isc-dhcp-client \
        libusb-1.0-0 
RUN mkdir -p /var/run/sshd && \
    # Create some necessary files for CODESYS
    touch /usr/bin/modprobe && \
    chmod +x /usr/bin/modprobe && \
    mkdir /etc/modprobe.d && \
    touch /etc/modprobe.d/blacklist.conf && \
    touch /etc/modules

COPY *.deb *.sh /tmp/
WORKDIR /tmp
RUN dpkg -i *.deb || true  && \
    apt-get install -fy  && \
    apt-get remove -y build-essential && \ 
    apt-get autoremove -y && \
    apt-get clean  && \
    rm -rf *.deb  && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /var/opt/codesys/
RUN ls
CMD [ "/opt/codesys/bin/codesyscontrol.bin", "/etc/CODESYSControl.cfg", "/app/start.sh"]
