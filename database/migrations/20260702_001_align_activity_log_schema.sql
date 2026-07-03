-- Align legacy activity_log tables with the current academic-service contract.
-- This migration is idempotent and preserves existing rows.

ALTER TABLE activity_log
    ADD COLUMN IF NOT EXISTS resource_id INTEGER REFERENCES resources(id);

ALTER TABLE activity_log
    ADD COLUMN IF NOT EXISTS resource_title VARCHAR(150);

ALTER TABLE activity_log
    ADD COLUMN IF NOT EXISTS activity_type VARCHAR(100) DEFAULT 'RESOURCE_COMPLETED';

ALTER TABLE activity_log
    ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE activity_log
    ADD COLUMN IF NOT EXISTS thread_name VARCHAR(100);

ALTER TABLE activity_log
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_activity_log_student_id ON activity_log(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource_id ON activity_log(resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_completed_at ON activity_log(completed_at);
