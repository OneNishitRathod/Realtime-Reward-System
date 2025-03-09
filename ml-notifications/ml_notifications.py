from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import numpy as np

app = Flask(__name__)

# Apply CORS to allow cross-origin requests
CORS(app)

@app.route('/')
def home():
    return "ML Notifications Service is up and running!"

# Dummy ML model: returns "promo" if sum(features) > 10, else "reminder"
def load_model():
    return lambda features: "promo" if np.sum(features) > 10 else "reminder"

model = load_model()

@app.route('/notify', methods=['POST'])
def notify():
    data = request.json
    features = data.get('features')
    if features is None:
        return jsonify({'error': 'Missing features data'}), 400
     
    # Convert features list to a numpy array
    features = np.array(features)
    notification_type = model(features)
    
    message = ("You have an exclusive promotional offer waiting!" 
               if notification_type == "promo" 
               else "Don't forget to check your rewards and stay updated!")
    
    return jsonify({'notification': message}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5002)
