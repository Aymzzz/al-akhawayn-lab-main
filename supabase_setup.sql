-- 0. Cleanup (Ensures schema updates like the new 'phone' column are applied)
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS auth CASCADE;
DROP TABLE IF EXISTS logs CASCADE;

-- 1. Create People table (Added phone column)
CREATE TABLE people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  type TEXT NOT NULL,
  email TEXT,
  phone TEXT,
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

-- 3. Create Projects table (New!)
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  students TEXT[],
  supervisors TEXT[]
);

-- 4. Create Logs table
CREATE TABLE logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  details TEXT,
  ip TEXT
);

-- 5. Create Auth table
CREATE TABLE auth (
  id INTEGER PRIMARY KEY DEFAULT 1,
  passwordHash TEXT NOT NULL,
  securityQuestion TEXT NOT NULL,
  securityAnswerHash TEXT NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- 6. Seed Auth (Force Reset)
INSERT INTO auth (id, passwordHash, securityQuestion, securityAnswerHash)
VALUES (1, 'admin123', 'What is the name of the lab?', 'AUI Immersive Lab')
ON CONFLICT (id) DO UPDATE SET
  passwordHash = EXCLUDED.passwordHash,
  securityQuestion = EXCLUDED.securityQuestion,
  securityAnswerHash = EXCLUDED.securityAnswerHash;

-- 7. Seed People (Clear & Reseed)
TRUNCATE TABLE people;
INSERT INTO people (id, name, role, type, email, phone, "order")
VALUES 
('1', 'Dr. Hassan Darhmaoui', 'Project Initiator', 'core', 'h.darhmaoui@aui.ma', '+212 535 86 21 18', 0),
('2', 'Rachid Lghoul', 'Project Manager / Coordinator', 'core', 'r.lghoul@aui.ma', '+212 661 23 45 67', 1),
('3', 'Dr. Amine Abouaomar', 'Research Supervisor', 'core', 'a.abouaomar@aui.ma', NULL, 2)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Projects (Move from static code to DB)
TRUNCATE TABLE projects;
INSERT INTO projects (id, title, description, category, students, supervisors)
VALUES
('1', 'AI-Driven AR Textbooks', 'Revolutionary integration of AI and AR in education using knowledge graphs and generative AI.', 'Education Technology', ARRAY['Imane Guessous'], ARRAY['Dr. Amine Abouaomar', 'Rachid Lghoul']),
('2', 'AI-Powered AR Tutoring System', 'Adaptive learning system for primary education combining augmented reality with personalized AI.', 'Adaptive Learning', ARRAY['Aymane Sbai'], ARRAY['Dr. Amine Abouaomar', 'Rachid Lghoul']),
('3', 'VR-Based Robotic Manipulation', 'VR simulation and control system for robotic manipulators.', 'Robotics & Engineering', ARRAY['Ahlam Mousa'], ARRAY['Rachid Lghoul']),
('4', 'Immersive Supply Chain Learning', 'Digital twin implementation of water distribution game using AR/VR.', 'Business & Logistics', ARRAY['Souhail El Bidaoui'], ARRAY['Rachid Lghoul']),
('5', 'AR Education for Engineering Labs', 'Integration of augmented reality into engineering curriculum and laboratory experiences.', 'Engineering Education', ARRAY['Oumaima Elhazzat', 'Hassan Amharech'], ARRAY['Dr. Hassan Darhmaoui', 'Rachid Lghoul']),
('6', 'Mixed Reality Factory Layout', 'MATLAB-based MR application for overlaying virtual 3D objects on real-world scenes.', 'Industry 4.0', ARRAY[]::TEXT[], ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;

-- 9. Disable RLS (Critical for Free Tier)
ALTER TABLE people DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth DISABLE ROW LEVEL SECURITY;
