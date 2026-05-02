-- =============================================
-- ShadowDB System - Database Schema (SQLite)
-- Criminal Record Management System
-- =============================================

-- TABLE: criminals
CREATE TABLE IF NOT EXISTS criminals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    alias TEXT DEFAULT NULL,
    date_of_birth DATE DEFAULT NULL,
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')) DEFAULT 'Male',
    height_cm REAL DEFAULT NULL,
    weight_kg REAL DEFAULT NULL,
    eye_color TEXT DEFAULT NULL,
    hair_color TEXT DEFAULT NULL,
    nationality TEXT DEFAULT NULL,
    address TEXT DEFAULT NULL,
    photo_url TEXT DEFAULT NULL,
    fingerprint_id TEXT UNIQUE DEFAULT NULL,
    status TEXT CHECK(status IN ('wanted', 'arrested', 'released', 'deceased')) DEFAULT 'wanted',
    danger_level TEXT CHECK(danger_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    description TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_status ON criminals(status);
CREATE INDEX IF NOT EXISTS idx_danger ON criminals(danger_level);
CREATE INDEX IF NOT EXISTS idx_name ON criminals(last_name, first_name);

-- TABLE: cases
CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    crime_type TEXT DEFAULT 'Other',
    status TEXT CHECK(status IN ('open', 'investigating', 'closed', 'cold')) DEFAULT 'open',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    location TEXT DEFAULT NULL,
    occurred_at DATETIME DEFAULT NULL,
    filed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_case_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_crime_type ON cases(crime_type);
CREATE INDEX IF NOT EXISTS idx_priority ON cases(priority);

-- TABLE: officers
CREATE TABLE IF NOT EXISTS officers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    badge_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    rank_title TEXT DEFAULT 'Officer',
    department TEXT DEFAULT NULL,
    phone TEXT DEFAULT NULL,
    email TEXT DEFAULT NULL,
    status TEXT CHECK(status IN ('active', 'inactive', 'retired')) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_badge ON officers(badge_number);
CREATE INDEX IF NOT EXISTS idx_officer_status ON officers(status);

-- TABLE: evidence
CREATE TABLE IF NOT EXISTS evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('physical', 'digital', 'documentary', 'testimonial')) DEFAULT 'physical',
    description TEXT NOT NULL,
    file_url TEXT DEFAULT NULL,
    location_found TEXT DEFAULT NULL,
    collected_by INTEGER DEFAULT NULL,
    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    chain_of_custody TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (collected_by) REFERENCES officers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence(type);

-- TABLE: case_assignments
CREATE TABLE IF NOT EXISTS case_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    criminal_id INTEGER DEFAULT NULL,
    officer_id INTEGER DEFAULT NULL,
    role TEXT CHECK(role IN ('suspect', 'witness', 'victim', 'investigator')) DEFAULT 'suspect',
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT DEFAULT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (criminal_id) REFERENCES criminals(id) ON DELETE CASCADE,
    FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_assignment_case ON case_assignments(case_id);
CREATE INDEX IF NOT EXISTS idx_assignment_criminal ON case_assignments(criminal_id);
CREATE INDEX IF NOT EXISTS idx_assignment_officer ON case_assignments(officer_id);

-- VIEWS
DROP VIEW IF EXISTS v_active_cases;
CREATE VIEW v_active_cases AS
SELECT 
    c.id, c.case_number, c.title, c.crime_type, c.status, c.priority,
    COUNT(DISTINCT ca.criminal_id) AS suspect_count,
    COUNT(DISTINCT e.id) AS evidence_count
FROM cases c
LEFT JOIN case_assignments ca ON c.id = ca.case_id AND ca.role = 'suspect'
LEFT JOIN evidence e ON c.id = e.case_id
WHERE c.status IN ('open', 'investigating')
GROUP BY c.id;

DROP VIEW IF EXISTS v_criminal_profiles;
CREATE VIEW v_criminal_profiles AS
SELECT 
    cr.id, cr.first_name, cr.last_name, cr.alias, cr.status, cr.danger_level,
    COUNT(DISTINCT ca.case_id) AS total_cases
FROM criminals cr
LEFT JOIN case_assignments ca ON cr.id = ca.criminal_id
GROUP BY cr.id;
