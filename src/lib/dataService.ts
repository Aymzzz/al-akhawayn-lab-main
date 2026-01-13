// dataService.ts
export interface Person {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
    type: 'core' | 'external';
    image?: string;
    order: number;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    type: string;
    schedule?: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    students: string[];
    supervisors: string[];
}

export interface AuthData {
    // Only used for minimal local types, real auth is server-side
    passwordHash?: string;
    securityQuestion?: string;
    securityAnswerHash?: string;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    action: string;
    details: string;
    ip: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('lab_admin_token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const dataService = {
    // People
    getPeople: async (): Promise<Person[]> => {
        const res = await fetch('/api/people');
        if (!res.ok) throw new Error('Failed to fetch people');
        // Filter out nulls if any, and ensure order exists
        const data = await res.json();
        return data.map((p: Person) => ({
            ...p,
            order: p.order ?? 999
        }));
    },
    savePeople: async (people: Person[]) => {
        const res = await fetch('/api/people', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(people)
        });
        if (!res.ok) throw new Error('Failed to save people');
        return res.json();
    },

    // Events
    getEvents: async (): Promise<Event[]> => {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('Failed to fetch events');
        return res.json();
    },
    saveEvents: async (events: Event[]) => {
        const res = await fetch('/api/events', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(events)
        });
        if (!res.ok) throw new Error('Failed to save events');
        return res.json();
    },

    // Projects
    getProjects: async (): Promise<Project[]> => {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
    },
    saveProjects: async (projects: Project[]) => {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(projects)
        });
        if (!res.ok) throw new Error('Failed to save projects');
        return res.json();
    },

    // Auth & Settings
    login: async (password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Invalid password');
        }
        return res.json(); // returns { token }
    },

    getSecurityQuestion: async () => {
        const res = await fetch('/api/auth/question');
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to fetch question');
        }
        return res.json(); // returns { question }
    },

    recoverPassword: async (answer: string) => {
        const res = await fetch('/api/auth/recover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer })
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Invalid answer');
        }
        return res.json(); // returns { token }
    },

    updateSettings: async (settings: any) => {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(settings)
        });
        if (!res.ok) throw new Error('Failed to update settings');
        return res.json();
    },

    // Logs
    getLogs: async (): Promise<LogEntry[]> => {
        const res = await fetch('/api/logs', {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch logs');
        return res.json();
    }
};
