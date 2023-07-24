from flask import Flask, Response
from flask_cors import CORS
import logging
import time

logging.basicConfig(filename='flask-app.log', level=logging.INFO, format='%(message)s')

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/logs', methods=['GET'])
def get_logs():
    log_file_path = "/var/log/codesys/output.log"
    logging.info('Fetching logs from file: %s', log_file_path)

    def tail_logs():
        with open(log_file_path, 'r') as f:
            lines = f.readlines()
            while True:
                new_line = f.readline()
                if not new_line:
                    time.sleep(0.1)
                    continue
                lines.append(new_line)
                yield 'data: {0}\n\n'.format("\n".join(lines))


    response = Response(tail_logs(), mimetype='text/event-stream')
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0')
