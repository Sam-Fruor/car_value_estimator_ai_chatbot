# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

@app.route('/estimate', methods=['POST'])
def estimate():
    data = request.get_json()
    make = data.get('make', '').capitalize()
    model = data.get('model', '').capitalize()
    year = int(data.get('year', 2020))
    mileage = int(data.get('mileage', 0))
    condition = data.get('condition', 'Good').capitalize()

    # Simulated base price (could be from database or external API)
    base_price = 1200000  # ₹12 lakhs base for standard cars

    # Depreciation logic
    current_year = datetime.now().year
    age = current_year - year
    depreciation_rate = 0.12  # 12% per year
    depreciation = base_price * (depreciation_rate * age)

    # Mileage penalty
    mileage_penalty = (mileage / 1000) * 200  # ₹200 per 1000 km

    # Condition multiplier
    condition_factor = {"Excellent": 1.1, "Good": 1.0, "Fair": 0.85}
    factor = condition_factor.get(condition, 1.0)

    estimated_value = (base_price - depreciation - mileage_penalty) * factor
    estimated_value = max(estimated_value, 50000)  # Floor price

    return jsonify({"estimated_value": int(estimated_value)})


if __name__ == '__main__':
    app.run(debug=True)
