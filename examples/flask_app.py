from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "framework": "Flask",
        "message": "REST API endpoint example"
    })

if __name__ == '__main__':
    app.run(port=5000)
