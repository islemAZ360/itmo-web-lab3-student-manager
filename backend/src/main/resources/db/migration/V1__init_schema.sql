CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'ADMIN'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    isu_id VARCHAR(6) PRIMARY KEY CHECK (isu_id ~ '^\d{6}$'),
    full_name VARCHAR(50) NOT NULL,
    student_group VARCHAR(5) NOT NULL CHECK (student_group ~ '^[A-Z]\d{4}$'),
    dormitory_number INT NOT NULL CHECK (dormitory_number BETWEEN 1 AND 99),
    room INT NOT NULL CHECK (room BETWEEN 1 AND 9999),
    accommodation_period DATE NOT NULL,
    is_international BOOLEAN NOT NULL DEFAULT FALSE,
    notes VARCHAR(150)
);

INSERT INTO students (isu_id, full_name, student_group, dormitory_number, room, accommodation_period, is_international, notes)
VALUES
    ('470449', 'Islam Azai', 'P3278', 51, 9996, '2025-02-12', true, 'Exchange student'),
    ('365412', 'Alexey Smirnov', 'M3301', 8, 314, '2025-09-01', false, 'Quiet room requested'),
    ('378945', 'Maria Ivanova', 'M3301', 8, 315, '2025-09-01', false, 'Allergic to dust')
ON CONFLICT (isu_id) DO NOTHING;
