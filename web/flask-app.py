from flask import Flask, Response
from flask_cors import CORS
import time
import os
import logging

logging.basicConfig(filename='flask-app.log', level=logging.INFO, format='%(message)s')

app = Flask(__name__)
CORS(app)

@app.route('/logs', methods=['GET'])
def get_logs():
    log_file_path = "/var/log/codesys/output.log"
    logging.info('Fetching logs from file: %s', log_file_path)
    
    try:
        with open(log_file_path, 'r') as f:
            lines = f.read().splitlines()
            last_line_sent = lines[-1] if lines else None
            logging.info('Successfully fetched logs from file: %s', log_file_path)
        
        def generate():
            nonlocal last_line_sent
            while True:
                with open(log_file_path, 'r') as f:
                    lines = f.read().splitlines()
                    if lines and lines[-1] != last_line_sent:
                        logging.info('New logs detected.')
                        last_line_sent = lines[-1]
                        yield f'data: {last_line_sent}\n\n'
                    time.sleep(1)
        
        return Response(generate(), mimetype='text/event-stream')
    except Exception as e:
        logging.error(f'Failed to read logs from file: {log_file_path}. Error: {str(e)}')
        return Response(f'Failed to read logs due to error: {str(e)}', mimetype='text/plain'), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
