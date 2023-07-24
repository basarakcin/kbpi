from flask import Flask, Response
from flask_cors import CORS, cross_origin
import logging

logging.basicConfig(filename='flask-app.log', level=logging.INFO, format='%(message)s')

app = Flask(__name__)
CORS(app)

@app.route('/logs', methods=['GET'])
@cross_origin()
def get_logs():
    log_file_path = "/var/log/codesys/output.log"
    logging.info('Fetching logs from file: %s', log_file_path)

    def tail_logs():
        with open(log_file_path, 'r') as f:
            f.seek(0, 2)  # Move to the end of the file
            while True:
                line = f.readline()
                if not line:
                    time.sleep(0.1)  # Sleep briefly
                    continue
                yield f'data: {line}\n\n'

    return Response(tail_logs(), mimetype='text/event-stream')


@app.route('/current_logs', methods=['GET'])
@cross_origin()
def get_current_logs():
    log_file_path = "/var/log/codesys/output.log"
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
