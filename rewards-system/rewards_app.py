from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

# In-memory storage for user data
# Format: { user_id: { 'password': '...', 'transactions': [...], 'total_points': 0 } }
user_data = {}

@app.route('/')
def home():
    return "Welcome to the Reward System!"

# Signup endpoint
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    user_id = data.get('user_id')
    password = data.get('password')
    
    if not user_id or not password:
        return jsonify({'error': 'Missing credentials'}), 400
    if user_id in user_data:
        return jsonify({'error': 'User already exists'}), 400
    
    # Create a new user account
    user_data[user_id] = {
        'password': password,
        'transactions': [],
        'total_points': 0,
    }
    return jsonify({'message': 'Signup successful', 'user_id': user_id}), 200

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user_id = data.get('user_id')
    password = data.get('password')
    
    if not user_id or not password:
        return jsonify({'error': 'Missing credentials'}), 400
    if user_id not in user_data:
        return jsonify({'error': 'User does not exist'}), 400
    if user_data[user_id]['password'] != password:
        return jsonify({'error': 'Incorrect password'}), 400
    
    # On successful login, return the user data (excluding the password)
    user_info = {
        'user_id': user_id,
        'transactions': user_data[user_id]['transactions'],
        'total_points': user_data[user_id]['total_points'],
    }
    return jsonify({'message': 'Login successful', 'user': user_info}), 200

# Transaction endpoint: For every dollar spent, reward 10% of it as points.
@app.route('/transaction', methods=['POST'])
def transaction():
    data = request.json
    user_id = data.get('user_id')
    amount = data.get('amount')
    
    if user_id is None or amount is None:
        return jsonify({'error': 'Missing user_id or amount'}), 400
    
    if user_id not in user_data:
        return jsonify({'error': 'User does not exist'}), 400
    
    # Calculate points: 10% of the amount
    points_awarded = int(float(amount) * 0.10)
    user_data[user_id]['total_points'] += points_awarded
    
    transaction_details = {
        'type': 'transaction',
        'amount': float(amount),
        'points_awarded': points_awarded,
        'total_points': user_data[user_id]['total_points'],
    }
    user_data[user_id]['transactions'].append(transaction_details)
    
    return jsonify(transaction_details)

@app.route('/redeem', methods=['POST'])
def redeem():
    data = request.json
    user_id = data.get('user_id')
    redeem_amount = data.get('redeem_amount')

    if user_id is None or redeem_amount is None:
        return jsonify({'error': 'Missing user_id or redeem_amount'}), 400
    
    if user_id not in user_data:
        return jsonify({'error': 'User does not exist'}), 400

    # Check if the user has enough rewards to redeem
    if float(redeem_amount) > user_data[user_id]['total_points']:
        return jsonify({'error': 'Not enough rewards to redeem'}), 400

    # Deduct the redeem amount from total points
    user_data[user_id]['total_points'] -= float(redeem_amount)
    redeem_txn = {
        'type': 'redeem',
        'amount': 0,
        'points_deducted': float(redeem_amount),
        'total_points': user_data[user_id]['total_points'],
    }
    user_data[user_id]['transactions'].append(redeem_txn)
    
    return jsonify(redeem_txn)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
