CREATE TABLE IF NOT EXISTS error_patterns (
    id SERIAL PRIMARY KEY,
    user_session TEXT DEFAULT 'default',
    preposition TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    sentence TEXT NOT NULL,
    error_count INTEGER DEFAULT 1,
    last_error_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_session, preposition, rule_type)
);

CREATE TABLE IF NOT EXISTS rule_statistics (
    id SERIAL PRIMARY KEY,
    user_session TEXT DEFAULT 'default',
    preposition TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    accuracy_percentage INTEGER DEFAULT 0,
    last_attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_session, preposition, rule_type)
);

CREATE INDEX idx_error_patterns_session ON error_patterns(user_session, error_count DESC);
CREATE INDEX idx_rule_stats_session ON rule_statistics(user_session, accuracy_percentage ASC);