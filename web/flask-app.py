from flask import Flask, jsonify
import subprocess

app = Flask(__name__)

@app.route('/logs', methods=['GET'])
def get_logs():
    container_name = "codesys_control"
    result = subprocess.run(["docker", "logs", container_name], capture_output=True, text=True)
    if result.returncode == 0:
        return jsonify(logs=result.stdout)
    else:
        return jsonify(error=result.stderr), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0')
