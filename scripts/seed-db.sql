-- Limpiar DB existente (CUIDADO: Borra todo)
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS metal_tests CASCADE;
DROP TABLE IF EXISTS patient_guardians CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS guardians CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Doctores (Acceso total)
CREATE TABLE doctors (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- Vincula con Supabase Auth
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100),
  license_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Tutores/Padres (Acceso limitado)
CREATE TABLE guardians (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- Vincula con Supabase Auth
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100) UNIQUE NOT NULL, -- Email para contacto
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Pacientes (Simplificada)
CREATE TABLE patients (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(10),
  birth_date DATE,
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'normal', -- normal, alert, critical
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Relación Pacientes-Tutores
CREATE TABLE patient_guardians (
  patient_id BIGINT REFERENCES patients(id) ON DELETE CASCADE,
  guardian_id BIGINT REFERENCES guardians(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL, -- Padre, Madre, Tío, etc.
  is_primary BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (patient_id, guardian_id)
);

-- 5. Tabla de Tests
CREATE TABLE metal_tests (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  lead_level DECIMAL(8, 2),    -- Plomo
  cadmium_level DECIMAL(8, 2), -- Cadmio
  arsenic_level DECIMAL(8, 2), -- Arsénico
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Alertas (Con vinculación a tests)
CREATE TABLE alerts (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_id BIGINT REFERENCES metal_tests(id) ON DELETE CASCADE, -- Nueva vinculación
  metal_type VARCHAR(50),
  level DECIMAL(8, 2),
  severity VARCHAR(20), -- 'normal', 'alert', 'critical'
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged BOOLEAN DEFAULT FALSE
);

-- Índices
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_metal_tests_patient ON metal_tests(patient_id);
CREATE INDEX idx_alerts_test_id ON alerts(test_id);

-- RLS (Seguridad a nivel de fila)
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE metal_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_guardians ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------
-- POLÍTICAS DE SEGURIDAD (Simplificadas para desarrollo)
--------------------------------------------------------------

-- 1. Doctores: Ven TODO
CREATE POLICY "Doctores ven todo doctors" ON doctors FOR ALL USING (true);
CREATE POLICY "Doctores ven todo guardians" ON guardians FOR ALL USING (true);
CREATE POLICY "Doctores ven todo patients" ON patients FOR ALL USING (true);
CREATE POLICY "Doctores ven todo tests" ON metal_tests FOR ALL USING (true);
CREATE POLICY "Doctores ven todo alerts" ON alerts FOR ALL USING (true);
CREATE POLICY "Doctores ven todo rels" ON patient_guardians FOR ALL USING (true);

-- 2. Tutores: Solo ven datos vinculados (Lógica compleja, por ahora permitimos lectura autenticada general para facilitar dev)
-- En producción, aquí filtraríamos por auth.uid() -> guardian -> patient_guardians -> patients
CREATE POLICY "Lectura general autenticada" ON patients FOR SELECT USING (auth.role() = 'authenticated');

--------------------------------------------------------------
-- DATOS DE MUESTRA (SEED)
--------------------------------------------------------------

-- 1. Doctores
-- USA EL UUID REAL DE SUPABASE AUTH (Dr. Juan Perez)
INSERT INTO doctors (user_id, first_name, last_name, specialty, license_number) VALUES
('b06b1b09-1287-4378-b8ae-0a1d5e0fadb3', 'Juan', 'Perez', 'Toxicología', 'CMP-12345');

-- 2. Tutores
-- USA EL UUID REAL DE SUPABASE AUTH (Padre - Guillermo Galvez)
INSERT INTO guardians (user_id, first_name, last_name, phone, email) VALUES
('4f313c55-8d02-4ae0-8ef5-dc7d4a31c268', 'Guillermo', 'Galvez', '987654321', 'guillermogalvez777@gmail.com');

-- 3. Pacientes (Hijos de Guillermo)
INSERT INTO patients (first_name, last_name, age, gender, location, status, birth_date, notes) VALUES
('Juanito', 'Galvez', 8, 'M', 'La Oroya Centro', 'critical', '2018-05-15', 'Antecedentes de asma leve.'),
('Maria', 'Galvez', 6, 'F', 'La Oroya Centro', 'normal', '2020-08-20', 'Sin alergias conocidas.'),
('Pedrito', 'Galvez', 10, 'M', 'La Oroya Centro', 'alert', '2016-02-10', 'Requiere seguimiento en nutrición.');

-- 4. Vinculación (Guillermo es padre de los 3)
INSERT INTO patient_guardians (patient_id, guardian_id, relationship, is_primary) VALUES
(1, 1, 'Padre', true), -- Juanito -> Guillermo
(2, 1, 'Padre', true), -- Maria -> Guillermo
(3, 1, 'Padre', true); -- Pedrito -> Guillermo

-- 5. Tests (Históricos)
INSERT INTO metal_tests (patient_id, test_date, lead_level, cadmium_level, arsenic_level, notes) VALUES
-- Juanito (Critical)
(1, '2025-12-01', 52.5, 1.2, 5.0, 'Niveles muy altos de plomo.'),
(1, '2025-10-15', 48.0, 1.1, 4.5, 'Seguimiento mensual.'),

-- Maria (Normal)
(2, '2026-01-10', 5.0, 0.5, 2.0, 'Valores dentro del rango normal.'),

-- Pedrito (Alert)
(3, '2026-01-15', 28.0, 1.8, 6.0, 'Niveles de plomo en alerta.');

-- 6. Alertas (Generadas manualmente para los tests históricos)
-- Test de Juanito (ID 1)
INSERT INTO alerts (patient_id, test_id, metal_type, level, severity, timestamp) VALUES
(1, 1, 'Plomo', 52.5, 'critical', '2025-12-01 10:00:00');

-- Test de Pedrito (ID 4)
INSERT INTO alerts (patient_id, test_id, metal_type, level, severity, timestamp) VALUES
(3, 4, 'Plomo', 28.0, 'alert', '2026-01-15 09:30:00');
