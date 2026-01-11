import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const app = express();
const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-change-this-in-prod';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

app.use(cors());
app.use(express.json());

// Helper for logging
const logAction = async (action, details, ip) => {
    if (!supabase) return;
    try {
        await supabase.from('logs').insert([{
            action,
            details,
            ip,
            timestamp: new Date().toISOString()
        }]);
    } catch (error) {
        console.error("Error logging action:", error);
    }
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

app.post('/api/auth/login', async (req, res) => {
    const { password } = req.body;
    if (!supabase) return res.status(503).json({ message: "Supabase not configured" });

    try {
        const { data: auth, error } = await supabase.from('auth').select('*').single();
        if (error) throw error;

        if (password === auth.passwordHash) {
            const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
            await logAction('LOGIN', 'Admin logged in', req.ip);
            res.json({ token });
        } else {
            await logAction('LOGIN_FAILED', 'Invalid password attempt', req.ip);
            res.status(401).json({ message: "Invalid password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/auth/question', async (req, res) => {
    if (!supabase) return res.status(503).json({ message: "Supabase not configured" });
    try {
        const { data: auth, error } = await supabase.from('auth').select('securityQuestion').single();
        if (error) throw error;
        res.json({ question: auth.securityQuestion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/auth/recover', async (req, res) => {
    const { answer } = req.body;
    if (!supabase) return res.status(503).json({ message: "Supabase not configured" });

    try {
        const { data: auth, error } = await supabase.from('auth').select('*').single();
        if (error) throw error;

        if (answer.toLowerCase() === auth.securityAnswerHash.toLowerCase()) {
            const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '15m' });
            await logAction('RECOVERY', 'Password recovery successful', req.ip);
            res.json({ token, message: "Recovery successful" });
        } else {
            await logAction('RECOVERY_FAILED', 'Invalid recovery answer', req.ip);
            res.status(401).json({ message: "Invalid answer" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- PROTECTED ROUTES ---

app.get('/api/settings', authenticateToken, async (req, res) => {
    if (!supabase) return res.status(503).json({ message: "Supabase not configured" });
    try {
        const { data: auth, error } = await supabase.from('auth').select('securityQuestion').single();
        if (error) throw error;
        res.json({ securityQuestion: auth.securityQuestion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
    const { passwordHash, securityQuestion, securityAnswerHash } = req.body;
    if (!supabase) return res.status(503).json({ message: "Supabase not configured" });

    try {
        const updates = {};
        if (passwordHash) updates.passwordHash = passwordHash;
        if (securityQuestion) updates.securityQuestion = securityQuestion;
        if (securityAnswerHash) updates.securityAnswerHash = securityAnswerHash;

        const { error } = await supabase.from('auth').update(updates).eq('id', 1); // Assuming single row with id 1
        if (error) throw error;

        await logAction('SETTINGS_UPDATE', 'Admin settings updated', req.ip);
        res.json({ message: "Settings updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/logs', authenticateToken, async (req, res) => {
    if (!supabase) return res.status(503).json({ message: "Supabase not configured" });
    try {
        const { data: logs, error } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(100);
        if (error) throw error;
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- DATA ROUTES (Public Read, Protected Write) ---

app.get('/api/people', async (req, res) => {
    if (!supabase) return res.status(503).json({ message: "Supabase not configured" });
    try {
        const { data: people, error } = await supabase.from('people').select('*').order('order', { ascending: true });
        if (error) throw error;
        res.json(people || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/people', authenticateToken, async (req, res) => {
    const people = req.body;
    if (!supabase) return res.status(503).json({ message: "Supabase not configured" });

    try {
        // Simple approach: delete all and insert new (or use upsert if IDs are consistent)
        const { error: deleteError } = await supabase.from('people').delete().neq('id', '0');
        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase.from('people').insert(people);
        if (insertError) throw insertError;

        await logAction('UPDATE_PEOPLE', `Updated ${people.length} people`, req.ip);
        res.json({ message: "People updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/events', async (req, res) => {
    if (!supabase) return res.status(503).json({ message: "Supabase not configured" });
    try {
        const { data: events, error } = await supabase.from('events').select('*').order('date', { ascending: false });
        if (error) throw error;
        res.json(events || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/events', authenticateToken, async (req, res) => {
    const events = req.body;
    if (!supabase) return res.status(503).json({ message: "Supabase not configured" });

    try {
        const { error: deleteError } = await supabase.from('events').delete().neq('id', '0');
        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase.from('events').insert(events);
        if (insertError) throw insertError;

        await logAction('UPDATE_EVENTS', `Updated ${events.length} events`, req.ip);
        res.json({ message: "Events updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default app;

// Support local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3001;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
