-- 1. Create People table
CREATE TABLE people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  type TEXT NOT NULL,
  email TEXT,
  "order" INTEGER DEFAULT 0,
  image TEXT
);

-- 2. Create Events table
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  schedule TEXT
);

-- 3. Create Logs table
CREATE TABLE logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  details TEXT,
  ip TEXT
);

-- 4. Create Auth table (Single row for settings)
CREATE TABLE auth (
  id INTEGER PRIMARY KEY DEFAULT 1,
  passwordHash TEXT NOT NULL,
  securityQuestion TEXT NOT NULL,
  securityAnswerHash TEXT NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- 5. Seed initial data
INSERT INTO auth (id, passwordHash, securityQuestion, securityAnswerHash)
VALUES (1, 'admin123', 'What is the name of the lab?', 'AUI Immersive Lab')
ON CONFLICT (id) DO NOTHING;

INSERT INTO people (id, name, role, type, email, "order")
VALUES 
('1', 'Dr. Hassan Darhmaoui', 'Project Initiator', 'core', 'h.darhmaoui@aui.ma', 0),
('2', 'Rachid Lghoul', 'Project Manager / Coordinator', 'core', 'r.lghoul@aui.ma', 1),
('3', 'Dr. Amine Abouaomar', 'Research Supervisor', 'core', 'a.abouaomar@aui.ma', 2)
ON CONFLICT (id) DO NOTHING;
