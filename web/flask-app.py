from flask import Flask, Response
from flask_cors import CORS
import logging
import time

logging.basicConfig(filename='flask-app.log', level=logging.INFO, format='%(message)s')
info_file_path = "app/logs/codesyscontrolinfo.log"
log_file_path = "app/logs/codesyscontrol.log"
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})  # This allows CORS for all routes and origins

@app.route('/info', methods=['GET'])
def get_info():
    logging.info('Fetching information from file: %s', info_file_path)
    try:
        with open(info_file_path, 'r') as f:
            info_content = f.read()
    except Exception as e:
        logging.error('Failed to read information from file: %s', info_file_path)
        return Response('Failed to read information', mimetype='text/plain'), 500

    logging.info('Successfully fetched information from file: %s', info_file_path)
    return Response(info_content, mimetype='text/plain')

@app.route('/logs', methods=['GET'])
def get_logs():
    logging.info('Fetching logs from file: %s', log_file_path)

    def tail_logs():
        with open(log_file_path, 'r') as f:
            f.seek(0, 2)  # Move to the end of the file
            while True:
                line = f.readline()
                if not line:
                    time.sleep(0.1)  # Sleep briefly
                    continue
                if line.strip() != '':
                    yield f'data: {line}\n\n'

    response = Response(tail_logs(), mimetype='text/event-stream')
    return response

@app.route('/current_logs', methods=['GET'])
def get_current_logs():
    logging.info('Fetching logs from file: %s', log_file_path)

    try:
        with open(log_file_path) as f:
            logs = f.read()
    except Exception as e:
        logging.error('Failed to read logs from file: %s', log_file_path)
        return Response('Failed to read logs', mimetype='text/plain'), 500

    logging.info('Successfully fetched logs from file: %s', log_file_path)
    return Response(logs, mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='0.0.0.0')
