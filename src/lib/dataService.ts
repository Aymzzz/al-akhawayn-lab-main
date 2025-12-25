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

export interface AuthData {
    passwordHash: string;
    securityQuestion: string;
    securityAnswerHash: string;
}

const STORAGE_KEY_PEOPLE = 'lab_people';
const STORAGE_KEY_EVENTS = 'lab_events';
const STORAGE_KEY_AUTH = 'lab_auth';

const initialPeople: Person[] = [
    { id: '1', name: "Dr. Hassan Darhmaoui", role: "Project Initiator", type: 'core', email: "h.darhmaoui@aui.ma", order: 0 },
    { id: '2', name: "Rachid Lghoul", role: "Project Manager / Coordinator", type: 'core', email: "r.lghoul@aui.ma", order: 1 },
    { id: '3', name: "Dr. Amine Abouaomar", role: "Research Supervisor", type: 'core', email: "a.abouaomar@aui.ma", order: 2 },
    { id: '4', name: "Dr. Paul Love", role: "Collaborator", type: 'core', order: 3 },
    { id: '5', name: "Dr. Said Ennahid", role: "Collaborator", type: 'core', order: 4 },
    { id: '6', name: "Ms. Hannen Duprat", role: "Collaborator", type: 'core', order: 5 },
    { id: '7', name: "Samir Hajjaji", role: "Collaborator", type: 'core', order: 6 },
    { id: '8', name: "Karim Moustagfir", role: "Collaborator", type: 'core', order: 7 },
    { id: '9', name: "Houssam Octave", role: "External Partner", type: 'external', order: 8 },
    { id: '10', name: "Aloui Mountasir", role: "External Partner", type: 'external', order: 9 },
    { id: '11', name: "Omar Diouri", role: "External Partner", type: 'external', order: 10 },
    { id: '12', name: "Yassin EMSI", role: "External Partner", type: 'external', order: 11 },
];

const initialEvents: Event[] = [
    {
        id: '1',
        title: "AR/VR MEETUP",
        description: "Augmented Reality Education for Engineering Labs - Introducing AR/VR to SSE Engineering Curriculum",
        date: "January 22-23, 2023",
        location: "New Cairo, Egypt",
        type: "International Conference",
    },
    {
        id: '2',
        title: "Immersive Technologies: AR/VR Foundations",
        description: "Special Topics course covering AR/VR fundamentals for engineering students",
        date: "Fall 2025",
        location: "Al Akhawayn University",
        type: "Special Topics Course",
        schedule: "Tuesday 7:30 PM - 8:50 PM",
    },
    {
        id: '3',
        title: "3D Scanning & Reverse Engineering Workshop",
        description: "From Reality to Virtual Intelligence: 3D Scanning, Reverse Engineering, AR/VR, and AI Integration by ENGIMA Experts",
        date: "TBA 2025",
        location: "SSE, Al Akhawayn University",
        type: "Industry Workshop",
    },
    {
        id: '4',
        title: "Invisible Festival Brussels",
        description: "EMSI Casablanca students represented Morocco with a pioneering project merging AI, history, and immersive technology",
        date: "April 5, 2025",
        location: "Brussels, Belgium",
        type: "Student Showcase",
    },
    {
        id: '5',
        title: "Mixed Reality MATLAB Workshop",
        description: "Hands-on training for Mixed Reality Object Placement for Factory Layout using MATLAB",
        date: "Academic Year 2025-2026",
        location: "Engineering Lab, AUI",
        type: "Technical Workshop",
    },
];

const defaultAuth: AuthData = {
    passwordHash: "admin123", // Using simple string for this demo
    securityQuestion: "What is the name of the lab?",
    securityAnswerHash: "AUI Immersive Lab"
};

const getStoredData = <T>(key: string, initial: T): T => {
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error(`Error parsing stored data for ${key}`, e);
        }
    }
    return initial;
};

const setStoredData = <T>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const dataService = {
    getPeople: () => getStoredData<Person[]>(STORAGE_KEY_PEOPLE, initialPeople),
    savePeople: (people: Person[]) => setStoredData(STORAGE_KEY_PEOPLE, people),
    getEvents: () => getStoredData<Event[]>(STORAGE_KEY_EVENTS, initialEvents),
    saveEvents: (events: Event[]) => setStoredData(STORAGE_KEY_EVENTS, events),
    getAuth: () => getStoredData<AuthData>(STORAGE_KEY_AUTH, defaultAuth),
    saveAuth: (auth: AuthData) => setStoredData(STORAGE_KEY_AUTH, auth),
};
