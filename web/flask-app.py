from flask import Flask, jsonify
import subprocess
import logging
import json
import os

logging.basicConfig(filename='flask-app.log', level=logging.INFO)

app = Flask(__name__)

@app.route('/logs', methods=['GET'])
def get_logs():
    container_name = "/codesys_control"
    logging.info('Fetching logs for container: %s', container_name)

    container_id = None
    for candidate in os.listdir('/var/lib/docker/containers'):
        try:
            with open(f'/var/lib/docker/containers/{candidate}/config.v2.json') as f:
                config = json.load(f)
            if config['Name'] == container_name:
                container_id = candidate
                break
        except Exception as e:
            logging.error('Failed to read config for candidate container id %s: %s', candidate, e)

    if container_id is None:
        logging.error('Could not find container with name: %s', container_name)
        return jsonify(error='Could not find container'), 500

    try:
        with open(f'/var/lib/docker/containers/{container_id}/{container_id}-json.log') as f:
            logs = f.read()
    except Exception as e:
        logging.error('Failed to read logs for container: %s', container_name)
        return jsonify(error='Failed to read logs'), 500

    logging.info('Successfully fetched logs for container: %s', container_name)
    return jsonify(logs=logs)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
