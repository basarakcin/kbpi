from flask import Flask, Response, stream_with_context
from flask_cors import CORS, cross_origin
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import logging
import time

logging.basicConfig(filename='flask-app.log', level=logging.INFO, format='%(message)s')

app = Flask(__name__)
CORS(app)

log_file_path = "/var/log/codesys/output.log"

class FileChangeHandler(FileSystemEventHandler):
    def __init__(self):
        self.last_modified = time.time()

    def on_modified(self, event):
        # Only act on changes to the log file
        if event.src_path == log_file_path:
            # Throttle updates to once per second
            if time.time() - self.last_modified > 1:
                self.last_modified = time.time()
                with open(log_file_path) as f:
                    logs = f.read()
                self.latest_logs = logs

    def get_logs(self):
        while True:
            if hasattr(self, 'latest_logs'):
                yield self.latest_logs + '\n'
                del self.latest_logs
            time.sleep(1)

change_handler = FileChangeHandler()
observer = Observer()
observer.schedule(change_handler, path=log_file_path, recursive=False)
observer.start()

@app.route('/logs', methods=['GET'])
@cross_origin()
def get_logs():
    return Response(change_handler.get_logs(), mimetype='text/event-stream')

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0')
    finally:
        observer.stop()
    observer.join()

