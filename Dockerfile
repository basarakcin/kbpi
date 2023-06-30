FROM debian:bookworm

LABEL maintainer="basar.akcin@knorr-bremse.com" \
      description="CODESYS Control"

ARG DEBIAN_FRONTEND=noninteractive

USER root
ENV USER=root

COPY /src/*.deb /src/setup.sh /tmp/
WORKDIR /tmp/
RUN chmod +x setup.sh && ./setup.sh 
COPY /src/install.sh /tmp/
WORKDIR /tmp/
RUN chmod +x install.sh && ./install.sh
COPY /src/startup.sh /
WORKDIR /
RUN chmod +x startup.sh && rm -rf /tmp/
WORKDIR /var/opt/codesys/

EXPOSE 22 11740

CMD [ "/startup.sh" ]
