CREATE TABLE IF NOT EXISTS test_results (
    id SERIAL PRIMARY KEY,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    prepositions TEXT[] NOT NULL,
    score_percentage INTEGER NOT NULL,
    answers JSONB NOT NULL
);

CREATE INDEX idx_test_date ON test_results(test_date DESC);