FROM debian:bookworm

LABEL maintainer="basar.akcin@knorr-bremse.com" \
      description="CODESYS Control"

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
        apt-utils \   
        ca-certificates \
        net-tools \
        openssh-server && \
    apt-get autoremove -y && \
    apt-get clean  && \
    rm -rf /var/lib/apt/lists/*
       
RUN mkdir -p /var/run/sshd && \ 
    useradd -ms /bin/bash codesys-user && \
    echo 'codesys-user:nxb@KB' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config && 
EXPOSE 22

COPY start.sh /start.sh
RUN chmod +x /start.sh   
CMD ["/start.sh"]
