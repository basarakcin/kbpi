# Codesys Edge Gateway architecture is amd64
FROM amd64/debian:bookworm

LABEL maintainer="basar.akcin@knorr-bremse.com" \
      description="CODESYS Control"

ARG DEBIAN_FRONTEND=noninteractive

USER root
ENV USER=root

COPY /src/*.package /src/*.sh /tmp/
WORKDIR /tmp/
RUN chmod +x *.sh && ./setup.sh 
RUN ./install.sh
RUN mv /tmp/startup.sh / 

EXPOSE 22 11740

WORKDIR /var/opt/codesys/
CMD [ "/startup.sh" ]
