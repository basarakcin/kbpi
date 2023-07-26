# CODESYS Control
Made for Raspberry Pi 4 (ARM64)
## Container setup
### Host network
The container needs to run in `host` network mode.
### Privileged mode
The privileged mode option needs to be activated to lift the standard Docker enforced container limitations. With this setting the container and the applications inside are the getting (almost) all capabilities as if running on the Host directly.
## Container access
The container starts the SSH server automatically when deployed.

For an SSH terminal session as used by the CODESYS development system to communicate with a target hardware use the Docker host IP address with the port number 2222.

## Usage
Create a CODESYS new project. Choose `Standard Project` and as `Device` "CODESYS Control for Raspberry Pi xx" and then ok. After project creation double click the topmost `Device(CODESYS Control for Raspberry Pi)` in the project tree.

Setup a communication from the CODESYS development system to the container Edge Gateway. Use the function `Gateway->Add New Gateway` in the dialog `Device`. As gateway IP-address use the Docker host `IP address` at port 1217 and click `ok`. Use the option `Device->Scan Network...` option and click the found device found. e.g. NTB827EBEA02D0 [0000.0539] and `ok`.
