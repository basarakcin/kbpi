# CODESYS Control and Web Application in Docker
Made for Raspberry Pi(rbpi) 4 Model B Rev 1.1 (ARM64)

## Project Overview
This project deploys a CODESYS Control system and an accompanying web application within Docker containers. CODESYS Control is a comprehensive SoftPLC system that provides versatile capabilities in industrial automation and PLC programming. The web application presents an intuitive interface for management and interaction, while the Docker containerization ensures robust, portable, and reproducible deployment.

## System Operation

### 0. Docker

1) **Check if Docker is installed**  
To see if Docker is installed, you can use the command which to determine the path of the Docker binary, if it exists.  
`which docker`  
If Docker is installed, this command will return a path (usually `/usr/bin/docker`). If nothing is returned, then Docker isn't installed.  

1.1) **Install Docker**  
If Docker is not installed, install it following the instructions in it's official page:  
`https://docs.docker.com/engine/install/debian/`  
Suggested installation method: Install using the Apt repository.
Make sure not to skip any of the steps!  

1.2) **Linux post-installation steps for Docker Engine**  
The post-installation procedures are optional but highly suggested. This shows you how to configure your Linux host machine to work better with Docker.  
`https://docs.docker.com/engine/install/linux-postinstall/`  

2) **Check if Docker Service is Running**  
`systemctl status docker`  
Look for the `Active:` line in the output. If Docker is running, it should say `Active: active (running)`. If it's not running, you can start it with:  
`sudo systemctl start docker`  
To enable Docker to start on boot:  
`sudo systemctl enable docker`

### 1. Building a New Version  
After making changes in the code, a new docker image should be built.
+ **Build all images:** `docker compose build`
+ **Build only one specific image:** `docker compose build <service_name>`

### 2. Create and start the containers:  
 + `docker compose up`  
This command will create and start the containers according to the settings defined in the `docker-compose.yml` file.  
More information can be found in:  
`https://docs.docker.com/engine/reference/commandline/compose/` 

### 3. Access the web interface application on rbpi
Open your browser at `http://localhost` to interact with the CODESYS Control system and view the logs in real-time.

## Remote Connection with CODESYS
In order to connect CODESYS, which is running on the PC, with the CODESYS Control, which is running on the rbpi, they must be in the same network. For this we have 3 options:  

### 1. KB-WLAN  
This option would be the best option IF the rbpi is registered to KB Network and have access to the KB-WLAN. In the current state, this is not the case.  
### 2. Router via Ethernet



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
