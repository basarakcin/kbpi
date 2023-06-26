FROM debian:bookworm

LABEL maintainer="basar.akcin@knorr-bremse.com" \
      description="CODESYS Control"

ARG DEBIAN_FRONTEND=noninteractive

USER root
ENV USER=root

COPY *.package *.sh /tmp/
WORKDIR /tmp/
RUN  chmod +x *.sh && ./setup-env.sh 
RUN install-codesys.sh

EXPOSE 22
EXPOSE 11740

COPY startup.sh /
WORKDIR /var/opt/codesys/

CMD [ "/startup.sh" ]
