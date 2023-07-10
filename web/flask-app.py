from flask import Flask, jsonify
import subprocess
import logging

logging.basicConfig(filename='/app/logs/flask-app.log', level=logging.INFO)

app = Flask(__name__)

@app.route('/logs', methods=['GET'])
def get_logs():
    container_name = "codesys_control"
    logging.info('Fetching logs for container: %s', container_name)
    result = subprocess.run(["docker", "logs", container_name], capture_output=True, text=True)
    if result.returncode == 0:
        logging.info('Successfully fetched logs for container: %s', container_name)
        return jsonify(logs=result.stdout)
    else:
        logging.error('Failed to fetch logs for container: %s', container_name)
        return jsonify(error=result.stderr), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0')
