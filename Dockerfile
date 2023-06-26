# Codesys Edge Gateway architecture is amd64
FROM amd64/debian:bookworm

LABEL maintainer="basar.akcin@knorr-bremse.com" \
      description="CODESYS Control"

ARG DEBIAN_FRONTEND=noninteractive

USER root
ENV USER=root

COPY /src/*.package setup.sh /tmp/
WORKDIR /tmp/
RUN chmod +x setup.sh && ./setup.sh 
COPY /src/install.sh /tmp/
WORKDIR /tmp/
RUN chmod +x install.sh && ./install.sh
COPY /src/startup.sh /

WORKDIR /var/opt/codesys/
RUN rm -rf /tmp/

EXPOSE 22 11740

CMD [ "/startup.sh" ]
