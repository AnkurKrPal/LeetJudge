-- Migration: Add problem visibility, editorial fields, contest tables, and submission extras
-- Date: 2026-06-26

ALTER TABLE problems ADD COLUMN IF NOT EXISTS editorial TEXT;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS is_editorial_visible BOOLEAN DEFAULT true;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

DO $$ BEGIN
    CREATE TYPE format_enum AS ENUM ('STANDARD', 'ICPC', 'IOI');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS contests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    format format_enum NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_by UUID REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS contest_problems (
    contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    problem_order INT NOT NULL,
    max_score INT NOT NULL,
    PRIMARY KEY (contest_id, problem_id),
    UNIQUE(contest_id, problem_order)
);

CREATE TABLE IF NOT EXISTS contest_participants (
    contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    final_rank INT,
    final_score INT DEFAULT 0,
    PRIMARY KEY (contest_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_contests_start_time ON contests(start_time);
CREATE INDEX IF NOT EXISTS idx_contest_problems_contest ON contest_problems(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_contest ON contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_user ON contest_participants(user_id);

CREATE TABLE IF NOT EXISTS problem_editors (
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (problem_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_problem_editors_problem_id ON problem_editors(problem_id);

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS contest_id UUID REFERENCES contests(id) ON DELETE SET NULL;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
