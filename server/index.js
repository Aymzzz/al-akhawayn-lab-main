import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-change-this-in-prod';
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));


// Helper to read DB
const readDb = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            // Seed if not exists
            const seed = {
                people: [
                    { id: '1', name: "Dr. Hassan Darhmaoui", role: "Project Initiator", type: 'core', email: "h.darhmaoui@aui.ma", order: 0 },
                    { id: '2', name: "Rachid Lghoul", role: "Project Manager / Coordinator", type: 'core', email: "r.lghoul@aui.ma", order: 1 },
                    { id: '3', name: "Dr. Amine Abouaomar", role: "Research Supervisor", type: 'core', email: "a.abouaomar@aui.ma", order: 2 },
                ],
                events: [],
                auth: {
                    passwordHash: "admin123",
                    securityQuestion: "What is the name of the lab?",
                    securityAnswerHash: "AUI Immersive Lab"
                },
                logs: []
            };
            fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
            fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
            return seed;
        }
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (error) {
        console.error("Error reading DB:", error);
        return { people: [], events: [], auth: {}, logs: [] };
    }
};

// Helper to write DB
const writeDb = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing DB:", error);
    }
};

// Helper for logging
const logAction = (action, details, ip) => {
    const db = readDb();
    const newLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action,
        details,
        ip
    };
    db.logs.unshift(newLog); // Add to beginning
    // Keep only last 100 logs
    if (db.logs.length > 100) db.logs = db.logs.slice(0, 100);
    writeDb(db);
};

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    const db = readDb();

    if (password === db.auth.passwordHash) {
        const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
        logAction('LOGIN', 'Admin logged in', req.ip);
        res.json({ token });
    } else {
        logAction('LOGIN_FAILED', 'Invalid password attempt', req.ip);
        res.status(401).json({ message: "Invalid password" });
    }
});

app.get('/api/auth/question', (req, res) => {
    const db = readDb();
    res.json({ question: db.auth.securityQuestion });
});

app.post('/api/auth/recover', (req, res) => {
    const { answer } = req.body;
    const db = readDb();

    if (answer.toLowerCase() === db.auth.securityAnswerHash.toLowerCase()) {
        const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '15m' }); // Short lived token for reset
        logAction('RECOVERY', 'Password recovery successful', req.ip);
        res.json({ token, message: "Recovery successful" });
    } else {
        logAction('RECOVERY_FAILED', 'Invalid recovery answer', req.ip);
        res.status(401).json({ message: "Invalid answer" });
    }
});

// --- PROTECTED ROUTES ---

app.get('/api/settings', authenticateToken, (req, res) => {
    const db = readDb();
    // Don't send real passwords back
    res.json({
        securityQuestion: db.auth.securityQuestion
    });
});

app.post('/api/settings', authenticateToken, (req, res) => {
    const { passwordHash, securityQuestion, securityAnswerHash } = req.body;
    const db = readDb();

    if (passwordHash) db.auth.passwordHash = passwordHash;
    if (securityQuestion) db.auth.securityQuestion = securityQuestion;
    if (securityAnswerHash) db.auth.securityAnswerHash = securityAnswerHash;

    writeDb(db);
    logAction('SETTINGS_UPDATE', 'Admin settings updated', req.ip);
    res.json({ message: "Settings updated" });
});

app.get('/api/logs', authenticateToken, (req, res) => {
    const db = readDb();
    res.json(db.logs);
});

// --- DATA ROUTES (Public Read, Protected Write) ---

app.get('/api/people', (req, res) => {
    const db = readDb();
    res.json(db.people || []);
});

app.post('/api/people', authenticateToken, (req, res) => {
    const people = req.body;
    const db = readDb();
    db.people = people;
    writeDb(db);
    logAction('UPDATE_PEOPLE', `Updated ${people.length} people`, req.ip);
    res.json({ message: "People updated" });
});

app.get('/api/events', (req, res) => {
    const db = readDb();
    res.json(db.events || []);
});

app.post('/api/events', authenticateToken, (req, res) => {
    const events = req.body;
    const db = readDb();
    db.events = events;
    writeDb(db);
    logAction('UPDATE_EVENTS', `Updated ${events.length} events`, req.ip);
    res.json({ message: "Events updated" });
});

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
