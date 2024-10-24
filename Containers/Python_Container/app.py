from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/run', methods=['POST'])
def run_code():
    try:
        # Extract the code from the request
        code = request.json.get('code', '')

        # Save the code to a file
        with open('code.py', 'w') as f:
            f.write(code)

        # Run the code using subprocess
        result = subprocess.run(['python3', 'code.py'], capture_output=True, text=True, timeout=10)
        
        # Return the result (stdout and stderr)
        return jsonify({
            'output': result.stdout,
            'error': result.stderr
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
