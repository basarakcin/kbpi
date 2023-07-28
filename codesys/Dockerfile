FROM debian:bookworm

LABEL maintainer="basar.akcin@knorr-bremse.com" \
      description="CODESYS Control"

ARG DEBIAN_FRONTEND=noninteractive

COPY /src/code*.deb /src/setup.sh /tmp/
WORKDIR /tmp/
RUN ./setup.sh 

COPY /src/install.sh /tmp/
RUN ./install.sh && rm -rf /tmp/

RUN useradd -rm -d /home/nxbdocker -s /bin/bash -G sudo -u 1001 -U nxbdocker && \
    echo 'nxbdocker ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

RUN mkdir -p /home/nxbdocker/.ssh/ && \
    chown -R nxbdocker:nxbdocker /home/nxbdocker/.ssh/ && \
    ssh-keygen -t ed25519 -f /home/nxbdocker/.ssh/id_ed25519 -N "" && \
    echo "    LogLevel ERROR" >> /home/nxbdocker/.ssh/config && \
    echo "    StrictHostKeyChecking no" >> /home/nxbdocker/.ssh/config && \
    echo "    UserKnownHostsFile=/dev/null" >> /home/nxbdocker/.ssh/config 

RUN echo 'nxbdocker:kbpi' | chpasswd && \
    sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

WORKDIR /var/opt/codesys/

# Manually port 2222:22 since we use network=host
# RUN sed -i 's/\(^Port\)/#\1/' /etc/ssh/sshd_config && echo Port 2222 >> /etc/ssh/sshd_config

COPY /src/startup.sh /home/nxbdocker
USER nxbdocker
CMD [ "/home/nxbdocker/startup.sh" ]
