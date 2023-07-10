from flask import Flask, Response
import logging

logging.basicConfig(filename='flask-app.log', level=logging.INFO, format='%(message)s')

app = Flask(__name__)

@app.route('/logs', methods=['GET'])
def get_logs():
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
