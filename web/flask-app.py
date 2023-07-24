from flask import Flask, Response
from flask_cors import CORS
import logging
import time
import os
import threading

logging.basicConfig(filename='flask-app.log', level=logging.INFO, format='%(message)s')

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

log_file_path = "/var/log/codesys/output.log"
last_known_position = 0
last_mod_time = None
clients = []

def watch_logs():
    global last_known_position, last_mod_time, clients
    while True:
        current_mod_time = os.stat(log_file_path).st_mtime
        if last_mod_time and current_mod_time == last_mod_time:
            time.sleep(1)
            continue
        last_mod_time = current_mod_time
        with open(log_file_path, 'r') as f:
            f.seek(last_known_position)
            new_logs = f.read()
            last_known_position = f.tell()
        if new_logs:
            for client in clients:
                client.put(new_logs)
        time.sleep(1)

@app.route('/logs', methods=['GET'])
def get_logs():
    def tail_logs(q):
        while True:
            data = q.get()
            yield 'data: {0}\n\n'.format(data)
    q = queue.Queue()
    clients.append(q)
    return Response(tail_logs(q), mimetype='text/event-stream')

if __name__ == '__main__':
    threading.Thread(target=watch_logs).start()
    app.run(host='0.0.0.0')
