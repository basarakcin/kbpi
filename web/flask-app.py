from flask import Flask, Response
from flask_cors import CORS
import logging
import time
import shutil

logging.basicConfig(filename='flask-app.log', level=logging.INFO, format='%(message)s')
log_file_path = "/var/log/codesys/output.log"
control_log_path = "/var/log/codesys/codesyscontrol.log"
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})  # This allows CORS for all routes and origins

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

@app.route('/append_logs', methods=['POST'])
def append_logs():
    logging.info('Appending logs from file: %s to %s', control_log_path, log_file_path)

    try:
        with open(control_log_path, 'rb') as src_file, open(log_file_path, 'ab') as dst_file:
            shutil.copyfileobj(src_file, dst_file)
        logging.info('Successfully appended logs from file: %s to %s', control_log_path, log_file_path)
        return Response('Successfully appended logs', mimetype='text/plain')
    except Exception as e:
        logging.error('Failed to append logs from file: %s to %s', control_log_path, log_file_path)
        return Response('Failed to append logs', mimetype='text/plain'), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0')
