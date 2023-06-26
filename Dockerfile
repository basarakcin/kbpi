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

# Configure SSH access
RUN echo 'root:YOURPASSWORD' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
EXPOSE 22

COPY *.deb *.sh /tmp/
WORKDIR /tmp
RUN dpkg -i *.deb || true  && \
    apt-get install -fy  && \
    apt-get remove -y build-essential && \ 
    apt-get autoremove -y && \
    apt-get clean  && \
    rm -rf *.deb  && \
    rm -rf /var/lib/apt/lists/*

COPY start.sh /start.sh
RUN chmod +x /start.sh

WORKDIR /var/opt/codesys/
RUN ls
CMD ["/start.sh"]
