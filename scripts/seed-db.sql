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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id), -- Vincula con Supabase Auth
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100),
  license_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Tutores/Padres (Acceso limitado)
CREATE TABLE guardians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id), -- Vincula con Supabase Auth
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100) UNIQUE NOT NULL, -- Email para contacto
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Pacientes (Simplificada)
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL, -- Padre, Madre, Tío, etc.
  is_primary BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (patient_id, guardian_id)
);

-- 5. Tabla de Tests
CREATE TABLE metal_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  lead_level DECIMAL(8, 2),    -- Plomo
  cadmium_level DECIMAL(8, 2), -- Cadmio
  arsenic_level DECIMAL(8, 2), -- Arsénico
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Alertas (Con vinculación a tests)
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_id UUID REFERENCES metal_tests(id) ON DELETE CASCADE, -- Nueva vinculación
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
INSERT INTO doctors (id, user_id, first_name, last_name, specialty, license_number) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'b06b1b09-1287-4378-b8ae-0a1d5e0fadb3', 'Juan', 'Perez', 'Toxicología', 'CMP-12345');

-- 2. Tutores
-- USA EL UUID REAL DE SUPABASE AUTH (Padre - Guillermo Galvez)
INSERT INTO guardians (id, user_id, first_name, last_name, phone, email) VALUES
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '4f313c55-8d02-4ae0-8ef5-dc7d4a31c268', 'Guillermo', 'Galvez', '987654321', 'guillermogalvez777@gmail.com');

-- 3. Pacientes (Hijos de Guillermo)
INSERT INTO patients (id, first_name, last_name, age, gender, location, status, birth_date, notes) VALUES
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Juanito', 'Galvez', 8, 'M', 'La Oroya Centro', 'critical', '2018-05-15', 'Antecedentes de asma leve.'),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Maria', 'Galvez', 6, 'F', 'La Oroya Centro', 'normal', '2020-08-20', 'Sin alergias conocidas.'),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Pedrito', 'Galvez', 10, 'M', 'La Oroya Centro', 'alert', '2016-02-10', 'Requiere seguimiento en nutrición.');

-- 4. Vinculación (Guillermo es padre de los 3)
INSERT INTO patient_guardians (patient_id, guardian_id, relationship, is_primary) VALUES
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Padre', true), -- Juanito -> Guillermo
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Padre', true), -- Maria -> Guillermo
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Padre', true); -- Pedrito -> Guillermo

-- 5. Tests (Históricos)
INSERT INTO metal_tests (id, patient_id, test_date, lead_level, cadmium_level, arsenic_level, notes) VALUES
-- Juanito (Critical)
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '2025-12-01', 52.5, 1.2, 5.0, 'Niveles muy altos de plomo.'),
('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '2025-10-15', 48.0, 1.1, 4.5, 'Seguimiento mensual.'),

-- Maria (Normal)
('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '2026-01-10', 5.0, 0.5, 2.0, 'Valores dentro del rango normal.'),

-- Pedrito (Alert)
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '2026-01-15', 28.0, 1.8, 6.0, 'Niveles de plomo en alerta.');

-- 6. Alertas (Generadas manualmente para los tests históricos)
-- Test de Juanito (UUID del primer test)
INSERT INTO alerts (id, patient_id, test_id, metal_type, level, severity, timestamp) VALUES
('d0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Plomo', 52.5, 'critical', '2025-12-01 10:00:00');

-- Test de Pedrito (UUID del cuarto test)
INSERT INTO alerts (id, patient_id, test_id, metal_type, level, severity, timestamp) VALUES
('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'Plomo', 28.0, 'alert', '2026-01-15 09:30:00');
