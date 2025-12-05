CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('patient', 'doctor', 'admin') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    language_preference VARCHAR(10) DEFAULT 'hi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES users(id),
    date_of_birth DATE,
    blood_group VARCHAR(5),
    allergies TEXT,
    emergency_contact VARCHAR(20),
    address TEXT
);

CREATE TABLE doctors (
    id UUID PRIMARY KEY REFERENCES users(id),
    specialization VARCHAR(100),
    qualification TEXT,
    license_number VARCHAR(50) UNIQUE,
    experience_years INTEGER,
    consultation_fee DECIMAL(10,2),
    available BOOLEAN DEFAULT true
);

CREATE TABLE symptom_history (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    symptoms_text TEXT,
    transcribed_text TEXT,
    diagnosis_json JSONB,
    urgency_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES doctors(id),
    appointment_time TIMESTAMP,
    status ENUM('scheduled', 'completed', 'cancelled'),
    notes TEXT,
    prescription_id UUID REFERENCES prescriptions(id)
);

CREATE TABLE medical_documents (
    id UUID PRIMARY KEY,
    source_name VARCHAR(255),
    document_type VARCHAR(50),
    disease_focus VARCHAR(100),
    language VARCHAR(10),
    chunk_count INTEGER,
    embedding_model VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);