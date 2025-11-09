from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from models import db, User, Patient, Appointment
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app, origins=app.config['CORS_ORIGINS'])
jwt = JWTManager(app)
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'DoctorCRM API is running',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

# Auth endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            role=data.get('role', 'user')
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Patient endpoints
@app.route('/api/patients', methods=['GET'])
@jwt_required()
def get_patients():
    try:
        patients = Patient.query.all()
        return jsonify([patient.to_dict() for patient in patients]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    try:
        patient = Patient.query.get_or_404(patient_id)
        return jsonify(patient.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients', methods=['POST'])
@jwt_required()
def create_patient():
    try:
        data = request.get_json()
        
        patient = Patient(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data.get('email'),
            phone=data.get('phone'),
            date_of_birth=datetime.fromisoformat(data['date_of_birth']) if data.get('date_of_birth') else None,
            address=data.get('address'),
            medical_history=data.get('medical_history')
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({
            'message': 'Patient created successfully',
            'patient': patient.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    try:
        patient = Patient.query.get_or_404(patient_id)
        data = request.get_json()
        
        patient.first_name = data.get('first_name', patient.first_name)
        patient.last_name = data.get('last_name', patient.last_name)
        patient.email = data.get('email', patient.email)
        patient.phone = data.get('phone', patient.phone)
        if data.get('date_of_birth'):
            patient.date_of_birth = datetime.fromisoformat(data['date_of_birth'])
        patient.address = data.get('address', patient.address)
        patient.medical_history = data.get('medical_history', patient.medical_history)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Patient updated successfully',
            'patient': patient.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    try:
        patient = Patient.query.get_or_404(patient_id)
        db.session.delete(patient)
        db.session.commit()
        
        return jsonify({'message': 'Patient deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Appointment endpoints
@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    try:
        appointments = Appointment.query.all()
        return jsonify([appointment.to_dict() for appointment in appointments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments/<int:appointment_id>', methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    try:
        appointment = Appointment.query.get_or_404(appointment_id)
        return jsonify(appointment.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    try:
        data = request.get_json()
        
        appointment = Appointment(
            patient_id=data['patient_id'],
            doctor_name=data['doctor_name'],
            appointment_date=datetime.fromisoformat(data['appointment_date']),
            duration_minutes=data.get('duration_minutes', 30),
            status=data.get('status', 'scheduled'),
            notes=data.get('notes')
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment created successfully',
            'appointment': appointment.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    try:
        appointment = Appointment.query.get_or_404(appointment_id)
        data = request.get_json()
        
        appointment.patient_id = data.get('patient_id', appointment.patient_id)
        appointment.doctor_name = data.get('doctor_name', appointment.doctor_name)
        if data.get('appointment_date'):
            appointment.appointment_date = datetime.fromisoformat(data['appointment_date'])
        appointment.duration_minutes = data.get('duration_minutes', appointment.duration_minutes)
        appointment.status = data.get('status', appointment.status)
        appointment.notes = data.get('notes', appointment.notes)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    try:
        appointment = Appointment.query.get_or_404(appointment_id)
        db.session.delete(appointment)
        db.session.commit()
        
        return jsonify({'message': 'Appointment deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
