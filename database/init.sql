CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id),
    title VARCHAR(150) NOT NULL,
    description TEXT
);

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(150) NOT NULL,
    type VARCHAR(50),
    url TEXT
);

CREATE TABLE student_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    resource_id INTEGER REFERENCES resources(id),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP
);

CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    activity_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);