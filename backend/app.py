from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from models import db
from datetime import datetime

# Import route blueprints
from routes import (
    auth_bp,
    organizations_bp,
    users_bp,
    subscriptions_bp,
    roles_bp,
    permissions_bp,
    specialties_bp,
    role_permissions_bp,
    user_specialties_bp,
    patients_bp,
    patient_contacts_bp,
    allergies_bp,
    patient_allergies_bp,
    medications_bp,
    patient_medications_bp,
    patient_conditions_bp
)

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app, 
     origins=app.config['CORS_ORIGINS'],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
jwt = JWTManager(app)
db.init_app(app)

# Register blueprints
from routes import (
    auth_bp, organizations_bp, users_bp, subscriptions_bp,
    roles_bp, permissions_bp, specialties_bp,
    role_permissions_bp, user_specialties_bp, webhooks_bp,
    patients_bp, patient_contacts_bp,
    allergies_bp, patient_allergies_bp, medications_bp, patient_medications_bp, patient_conditions_bp
)

app.register_blueprint(auth_bp)
app.register_blueprint(organizations_bp)
app.register_blueprint(users_bp)
app.register_blueprint(subscriptions_bp)
app.register_blueprint(roles_bp)
app.register_blueprint(permissions_bp)
app.register_blueprint(specialties_bp)
app.register_blueprint(role_permissions_bp)
app.register_blueprint(user_specialties_bp)
app.register_blueprint(webhooks_bp)
app.register_blueprint(patients_bp)
app.register_blueprint(patient_contacts_bp)
app.register_blueprint(allergies_bp)
app.register_blueprint(patient_allergies_bp)
app.register_blueprint(medications_bp)
app.register_blueprint(patient_medications_bp)
app.register_blueprint(patient_conditions_bp)

# Create tables
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")
    print("\n📍 Registered API Routes:")
    print("  - /api/auth")
    print("  - /api/organizations")
    print("  - /api/users")
    print("  - /api/subscriptions")
    print("  - /api/roles")
    print("  - /api/permissions")
    print("  - /api/specialties")
    print("  - /api/role-permissions")
    print("  - /api/user-specialties")
    print("  - /api/webhooks")
    print("  - /api/patients")
    print("  - /api/patient-contacts")
    print("  - /api/allergies")
    print("  - /api/patient-allergies")
    print("  - /api/patient-medications")
    print("  - /api/patient-conditions")

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'DoctorCRM API is running',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

