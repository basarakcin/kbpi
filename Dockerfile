FROM debian:bookworm

LABEL maintainer="basar.akcin@knorr-bremse.com" \
      description="CODESYS Control"

ARG DEBIAN_FRONTEND=noninteractive

RUN useradd -rm -d /home/nxbdocker -s /bin/bash -g root -G sudo -u 1001 nxbdocker

COPY /src/*.deb /src/setup.sh /tmp/
WORKDIR /tmp/
RUN chmod +x setup.sh && ./setup.sh 

COPY /src/install.sh /tmp/
RUN chmod +x install.sh && ./install.sh

COPY /src/startup.sh /home/nxbdocker
WORKDIR /home/nxbdocker
RUN chmod +x startup.sh && rm -rf /tmp/

RUN ssh-keygen -t ed25519 -f /home/nxbdocker/.ssh/id_ed25519 -N "" && \
    echo "    LogLevel ERROR" >> /home/nxbdocker/.ssh/config && \
    echo "    StrictHostKeyChecking no" >> /home/nxbdocker/.ssh/config && \
    echo "    UserKnownHostsFile=/dev/null" >> /home/nxbdocker/.ssh/config 

RUN echo 'nxbdocker:kbpi' | chpasswd && \
    sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

WORKDIR /var/opt/codesys/

EXPOSE 22 11740

CMD [ "/startup.sh" ]
