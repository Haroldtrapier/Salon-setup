-- Migration: Add nail_profiles table for Phase 2
-- Run: node backend/migrations/run.js

CREATE TABLE IF NOT EXISTS nail_profiles (
  id SERIAL PRIMARY KEY,
  measurements JSONB NOT NULL,
  hand_type VARCHAR(10),
  reference_object VARCHAR(100),
  confidence INTEGER,
  notes TEXT,
  customer_id INTEGER REFERENCES customers(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nail_profiles_customer ON nail_profiles(customer_id);
CREATE INDEX idx_nail_profiles_created ON nail_profiles(created_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nail_profiles_updated_at
BEFORE UPDATE ON nail_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE nail_profiles IS 'Stores customer nail measurements from AI photo analysis';
COMMENT ON COLUMN nail_profiles.measurements IS 'JSON array with width/length for each finger';
COMMENT ON COLUMN nail_profiles.confidence IS 'AI confidence score 0-100';