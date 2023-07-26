# CODESYS Control and Web Application in Docker

Made for Raspberry Pi 4 Model B Rev 1.1 (ARM64)

## Project Overview

This project deploys a CODESYS Control system and an accompanying web application within Docker containers. CODESYS Control is a comprehensive SoftPLC system that provides versatile capabilities in industrial automation and PLC programming. The web application presents an intuitive interface for management and interaction, while the Docker containerization ensures robust, portable, and reproducible deployment.

## System Mechanics

The Docker containers for the CODESYS Control system and the web application are orchestrated by the Docker Compose tool. The system consists of three main elements:

1. **CODESYS Control**: Executes within a Docker container configured and prepared by scripts in the `codesys` directory:

   - `setup.sh`: Updates packages, installs required libraries, and cleans up unnecessary files.
   - `install.sh`: Handles the installation of CODESYS Control packages, ensuring that the system is Debian-based and the user has root or sudo access.
   - `startup.sh`: Initiates necessary services for the CODESYS Control system, logs system status, and creates requisite directories.

2. **Flask API server**: A Python Flask-based web server running within a Docker container, provides endpoints for fetching system logs.

3. **Nginx web server**: Serves the web application's HTML interface and handles requests to the Flask API. Runs within its own Docker container.

## Docker Configuration

The Docker images for the system components are created using Dockerfiles located in the `web` directory:

1. `Dockerfile.api`: Constructs a Python 3.8 slim Docker image for the Flask API server. This image includes the Flask application and an HTML file, with port 5000 exposed for application requests.
2. `Dockerfile.web`: Establishes the Nginx server within the latest Nginx Docker image. The image overrides the default Nginx configuration with a custom configuration, copies static files into the image, and listens on port 80.

## Key Components

Two main elements constitute the heart of this system:

- **CODESYS Control**: Provides the core functionality for PLC operations, enabling automation of electromechanical processes.
- **Web application**: A user interface that allows users to monitor the CODESYS Control system. The real-time log data fetched from the Flask API is displayed on this web interface.

## System Operation

Running this system involves the following steps:

1. Clone the repository.
2. Build the Docker images for the Flask API server and the Nginx server using the Docker Compose command `docker compose build`.
3. Start the Docker containers using `docker compose up`.
4. Access the web application in your browser at `http://localhost` to interact with the CODESYS Control system and view the logs in real-time.

Before you begin, ensure Docker and Docker Compose are installed on your system.

## Important notes

### Host network

The container needs to run in `host` network mode.

### Privileged mode

The privileged mode option needs to be activated to lift the standard Docker enforced container limitations. With this setting the container and the applications inside are the getting (almost) all capabilities as if running on the Host directly.

## Container access

The container starts the SSH server automatically when deployed.

For an SSH terminal session as used by the CODESYS development system to communicate with a target hardware use the Docker host IP address with the port number 2222.


## Conclusion

This project exhibits the seamless integration of industrial automation technology with modern web applications, encapsulated within Docker containers for ease of deployment and scalability. The user-friendly web-based interface enables convenient system management and observation, while the containerized design allows for diverse applications in the field of industrial automation and PLC programming.
