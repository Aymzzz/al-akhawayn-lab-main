import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft, Check, GraduationCap, MessageSquare, Plus, Save, Send, Trash2,
    UserCog, Search, Upload, Play, Mic, FileText, Settings, MonitorPlay, Box,
    LayoutDashboard, BookOpen, Users, BrainCircuit, ShieldAlert, Target, Scan, X, QrCode
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// --- Types ---
type Role = "landing" | "professor" | "student";
type ProfessorMode = "dashboard" | "library" | "studio" | "grading" | "classroom";
type StudentMode = "dashboard" | "assignment" | "grades" | "scan";

interface Hotspot {
    id: string;
    position: string;
    normal: string;
    label: string;
    description?: string;
    audioUrl?: string;
}

interface QuizQuestion {
    id: string;
    type: 'mcq' | 'essay' | 'spatial';
    prompt: string;
    options?: string[]; // for MCQ
    correctAnswer?: string; // Option string for MCQ, Hotspot ID for Spatial, Keywords for Essay
    points: number;
}

interface StudentSubmission {
    studentId: string;
    studentName: string;
    answers: Record<string, string>; // questionId -> answer
    timestamp: Date;
    grade?: number;
    feedback?: string;
}

interface AssignmentSettings {
    allowAI: boolean;
    hasQuiz: boolean;
    questions: QuizQuestion[];
    instructions: string; // Agent instructions
    qrCode?: string; // Classroom QR Code
}

// --- Mock Data ---
const MOCK_ASSETS = [
    { id: "astronaut", name: "Astronaut", src: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "https://modelviewer.dev/shared-assets/models/Astronaut.webp" },
    { id: "engine", name: "V8 Engine", src: "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb", poster: "https://modelviewer.dev/shared-assets/models/NeilArmstrong.webp" },
    { id: "shuttle", name: "Space Shuttle", src: "https://modelviewer.dev/shared-assets/models/Shuttle.glb", poster: "" }
];

const MOCK_COURSES = [
    { id: "bio101", name: "CSC 3330: Intro to Aerospace", students: 45, avgGrade: 88 },
    { id: "eng202", name: "Bio 101: Human Anatomy", students: 112, avgGrade: 76 },
];

const MOCK_SUBMISSIONS: { id: string | number; student: string; grade: string | number | null; status: string; flagged: boolean }[] = [
    { id: 1, student: "Alice Baker", grade: 92, status: "Graded", flagged: false },
    { id: 2, student: "Chaminga Li", grade: 85, status: "Graded", flagged: false },
    { id: 3, student: "David Kim", grade: null, status: "Pending AI Review", flagged: true },
];

const Demo = () => {
    // Global State
    const [role, setRole] = useState<Role>("landing");

    // Professor State
    const [profMode, setProfMode] = useState<ProfessorMode>("dashboard");
    const [selectedAsset, setSelectedAsset] = useState<typeof MOCK_ASSETS[0] | null>(null);
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [settings, setSettings] = useState<AssignmentSettings>({
        allowAI: true,
        hasQuiz: false,
        questions: [],
        instructions: "You are a helpful teaching assistant. Briefly explain concepts.",

        qrCode: "AUI-LAB-LIVE"
    });
    const [files, setFiles] = useState<File[]>([]);

    // Student State
    const [studentMode, setStudentMode] = useState<StudentMode>("dashboard");
    const [activeQuizQuestion, setActiveQuizQuestion] = useState(0);
    const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});

    // Tools State
    const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
    const modelViewerRef = useRef<any>(null);
    const [newHotspotTemp, setNewHotspotTemp] = useState<{ position: string, normal: string } | null>(null);
    const [tempLabel, setTempLabel] = useState("");
    const [tempDesc, setTempDesc] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [hasAudio, setHasAudio] = useState(false);

    // Chat State
    const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([]);
    const [chatInput, setChatInput] = useState("");

    // Quiz Builder State
    const [newQuestionType, setNewQuestionType] = useState<'mcq' | 'essay' | 'spatial'>('mcq');
    const [newQuestionPrompt, setNewQuestionPrompt] = useState("");
    const [newQuestionCorrect, setNewQuestionCorrect] = useState(""); // Stores correct answer

    // Initialize Chat
    useEffect(() => {
        if (role === "student" && studentMode === "assignment") {
            setChatMessages([
                { role: 'ai', text: settings.allowAI ? "Hello! How can I help you with this assignment?" : "AI Assistant is disabled." }
            ]);
        }
    }, [role, studentMode, settings]);

    // --- Handlers ---

    const handleModelClick = (event: React.MouseEvent<HTMLElement>) => {
        // Professor Studio: Add Hotspot on click
        if (role === "professor" && profMode === "studio") {
            const { clientX, clientY } = event;
            if (modelViewerRef.current) {
                const hit = modelViewerRef.current.positionAndNormalFromPoint(clientX, clientY);
                if (hit) {
                    setNewHotspotTemp({
                        position: `${hit.position.x} ${hit.position.y} ${hit.position.z}`,
                        normal: `${hit.normal.x} ${hit.normal.y} ${hit.normal.z}`
                    });
                    setTempLabel("New Component");
                    setTempDesc("");
                    setHasAudio(false);
                }
            }
        }
        // Student Quiz: Record spatial answer if the current question is spatial
        if (role === "student" && studentMode === "assignment") {
            const currentQ = settings.questions[activeQuizQuestion];
            if (currentQ?.type === 'spatial' || (!currentQ && activeQuizQuestion === 0)) {
                toast.success("Answering via 3D interaction recorded!");
            }
        }
    };

    const confirmHotspot = () => {
        if (newHotspotTemp && tempLabel) {
            const newHotspot: Hotspot = {
                id: Date.now().toString(),
                position: newHotspotTemp.position,
                normal: newHotspotTemp.normal,
                label: tempLabel,
                description: tempDesc,
                audioUrl: hasAudio ? "mock_audio.mp3" : undefined
            };
            setHotspots([...hotspots, newHotspot]);
            setNewHotspotTemp(null);
            setTempLabel("");
            setTempDesc("");
            setHasAudio(false);
            toast.success("Annotation added!");
        }
    };



    // ... (rest of state)

    const addQuizQuestion = () => {
        const q: QuizQuestion = {
            id: Date.now().toString(),
            type: newQuestionType,
            prompt: newQuestionPrompt || "New Question",
            options: newQuestionType === 'mcq' ? ["Option A", "Option B", "Option C"] : undefined,
            correctAnswer: newQuestionCorrect,
            points: 10
        };
        setSettings({ ...settings, questions: [...settings.questions, q] });
        setNewQuestionPrompt("");
        setNewQuestionCorrect("");
        toast.success("Question added to quiz.");
    };

    const handleGenerateQR = () => {
        const code = Math.random().toString(36).substring(7).toUpperCase();
        setSettings({ ...settings, qrCode: `AUI-LAB-${code}` });
        toast.success(`Classroom QR Generated: AUI-LAB-${code}`);
    };

    const handlePublish = () => {
        setRole("landing");
        toast.success("Course published! Assignment sent to student dashboard.");
    };

    const handleChat = () => {
        if (!chatInput.trim() || !settings.allowAI) return;
        const msg = chatInput;
        setChatMessages([...chatMessages, { role: 'user', text: msg }]);
        setChatInput("");
        setTimeout(() => {
            setChatMessages(prev => [...prev, { role: 'ai', text: `(AI Agent): Based on Prof instructions: "${settings.instructions}", I should explain that...` }]);
        }, 1000);
    };

    // --- Renderers ---

    const renderModelViewer = (interactive: boolean, arEnabled: boolean = false) => {
        if (!selectedAsset) return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                <Box className="w-16 h-16 mb-4 opacity-20" />
                <p>No 3D Asset Loaded</p>
            </div>
        );

        const selectedHotspot = hotspots.find(h => h.id === selectedHotspotId);

        return (
            <div className="w-full h-full relative bg-slate-900/5 rounded-xl overflow-hidden border border-slate-200">
                {/* @ts-ignore */}
                <model-viewer
                    ref={modelViewerRef}
                    src={selectedAsset.src}
                    poster={selectedAsset.poster}
                    alt={selectedAsset.name}
                    shadow-intensity="1"
                    camera-controls
                    touch-action="pan-y"
                    disable-tap={interactive}
                    onClick={handleModelClick}
                    {...(arEnabled ? { ar: true, "ar-placement": "floor" } : {})}
                    ar-modes="webxr scene-viewer quick-look"
                    ar-scale="auto"
                    style={{ width: '100%', height: '100%' }}
                >
                    {hotspots.map((h) => (
                        <button
                            key={h.id}
                            className={`hotspot w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all 
              ${selectedHotspotId === h.id ? 'bg-yellow-400 scale-125' : 'bg-blue-600 hover:scale-110'}`}
                            slot={`hotspot-${h.id}`}
                            data-position={h.position}
                            data-normal={h.normal}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedHotspotId(h.id);
                            }}
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                {h.label}
                            </div>
                        </button>
                    ))}

                    {newHotspotTemp && (
                        <button
                            className="hotspot bg-green-500 w-5 h-5 rounded-full border-2 border-white animate-pulse"
                            slot="hotspot-temp"
                            data-position={newHotspotTemp.position}
                            data-normal={newHotspotTemp.normal}
                        />
                    )}
                </model-viewer>

                {/* Hotspot Detail Overlay */}
                {selectedHotspot && (
                    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur p-5 rounded-xl shadow-2xl w-80 animate-in slide-in-from-bottom-5 border z-20">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-900">{selectedHotspot.label}</h3>
                            <Button size="icon" variant="ghost" className="h-6 w-6 -mr-2 text-slate-400 hover:text-slate-900" onClick={() => setSelectedHotspotId(null)}><X className="w-4 h-4" /></Button>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">{selectedHotspot.description || "No description provided."}</p>
                        {selectedHotspot.audioUrl && (
                            <Button variant="secondary" size="sm" className="w-full gap-2 text-blue-700 bg-blue-50 hover:bg-blue-100"><Play className="w-4 h-4" /> Play Audio Explanation</Button>
                        )}
                    </div>
                )}


                {/* AR Button Hint (Student Only) */}
                {arEnabled && (
                    <div className="absolute bottom-4 right-4 pointer-events-none z-20">
                        <span className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">
                            AR Enabled
                        </span>
                    </div>
                )}

                {/* Student Desktop AR QR Trigger */}
                {role === "student" && settings.qrCode && !arEnabled && (
                    <div className="absolute top-4 right-4 z-50 pointer-events-auto">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur shadow-sm hover:bg-white">
                                    <QrCode className="w-4 h-4 mr-2" /> Switch to AR
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <div className="text-center space-y-6 py-4">
                                    <div>
                                        <h3 className="font-bold text-xl">Scan for AR Room Mode</h3>
                                        <p className="text-sm text-slate-500">Use your phone or headset to view this in your room.</p>
                                    </div>
                                    <div className="bg-white border-2 border-dashed p-4 inline-block rounded-xl">
                                        <div className="w-48 h-48 bg-slate-900 text-white flex items-center justify-center font-mono text-xl font-bold tracking-widest">
                                            {settings.qrCode}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400">Point camera at code to launch.</p>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                {/* Studio Overlay: Back & Mode Info */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                    <div className="pointer-events-auto">
                        {role === "professor" && profMode !== "dashboard" && profMode !== "library" && (
                            <Button variant="secondary" size="sm" onClick={() => setProfMode("library")} className="mr-2">
                                <Search className="w-4 h-4 mr-2" /> Library
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setRole("landing")} className="bg-white/80 backdrop-blur">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Exit
                        </Button>
                    </div>
                </div>

                {/* Annotation Creation Dialog (Prof Studio Only) */}
                {newHotspotTemp && role === "professor" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl border w-96 space-y-4 pointer-events-auto animate-in zoom-in-95 z-50">
                        <h3 className="font-bold text-lg">Add Annotation</h3>
                        <div className="space-y-3">
                            <div>
                                <Label>Component Name</Label>
                                <input
                                    autoFocus
                                    className="w-full border p-2 rounded text-sm mt-1"
                                    placeholder="e.g. Oxygen Valve"
                                    value={tempLabel}
                                    onChange={(e) => setTempLabel(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <textarea
                                    className="w-full border p-2 rounded text-sm mt-1 h-20 resize-none"
                                    placeholder="Explain the function..."
                                    value={tempDesc}
                                    onChange={(e) => setTempDesc(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between border p-2 rounded bg-slate-50">
                                <span className="text-sm text-slate-600 flex items-center gap-2">
                                    <Mic className="w-4 h-4" />
                                    {isRecording ? "Recording..." : hasAudio ? "Audio Attached" : "Add Voice Note"}
                                </span>
                                <Button
                                    size="sm"
                                    variant={isRecording ? "destructive" : hasAudio ? "secondary" : "outline"}
                                    onClick={() => {
                                        setIsRecording(!isRecording);
                                        if (!isRecording) setTimeout(() => { setIsRecording(false); setHasAudio(true); toast.success("Recorded"); }, 1500);
                                    }}
                                >
                                    {isRecording ? "Stop" : hasAudio ? "Redo" : "Record"}
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={() => setNewHotspotTemp(null)}>Cancel</Button>
                            <Button onClick={confirmHotspot}>Save Annotation</Button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-8 px-4 font-sans">
            <div className="max-w-[1600px] mx-auto h-[85vh] flex flex-col">

                {/* === LANDING === */}
                {role === "landing" && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-500">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">AUI Immersive Lab</h1>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                                Service-First Spatial Learning Platform
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                            <button onClick={() => { setRole("professor"); setProfMode("dashboard"); }} className="group text-left">
                                <Card className="h-full border-2 border-transparent hover:border-blue-500 transition-all hover:shadow-2xl">
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                            <UserCog className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="text-2xl">Professor Portal</CardTitle>
                                        <CardDescription>Manage Courses, Assignments & Grading</CardDescription>
                                    </CardHeader>
                                </Card>
                            </button>

                            <button onClick={() => { setRole("student"); setStudentMode("dashboard"); }} className="group text-left">
                                <Card className="h-full border-2 border-transparent hover:border-emerald-500 transition-all hover:shadow-2xl">
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="text-2xl">Student Canvas</CardTitle>
                                        <CardDescription>My Assignments & Grades</CardDescription>
                                    </CardHeader>
                                </Card>
                            </button>
                        </div>
                    </div>
                )}

                {/* === PROFESSOR === */}
                {role === "professor" && (
                    <div className="flex-1 flex gap-6 overflow-hidden animate-in fade-in">
                        {/* Sidebar */}
                        <div className="w-64 flex flex-col bg-white rounded-xl border shadow-sm p-4 space-y-6 shrink-0">
                            <div>
                                <h2 className="font-bold text-lg flex items-center gap-2 text-blue-900">
                                    <UserCog className="w-5 h-5" /> Faculty Portal
                                </h2>
                                <p className="text-xs text-slate-500">AUI Immersive Lab</p>
                            </div>

                            <nav className="space-y-1">
                                <Button variant={profMode === "dashboard" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setProfMode("dashboard")}>
                                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                                </Button>
                                <Button variant={profMode === "grading" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setProfMode("grading")}>
                                    <BrainCircuit className="w-4 h-4 mr-2" /> AI Grading
                                </Button>
                                <div className="pt-4 pb-2 text-xs font-semibold text-slate-400">Content Creation</div>
                                <Button variant={profMode === "library" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setProfMode("library")}>
                                    <Search className="w-4 h-4 mr-2" /> Asset Library
                                </Button>
                                <Button variant={profMode === "studio" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => {
                                    if (!selectedAsset) {
                                        toast.error("Please select an asset from the Library first.");
                                        setProfMode("library");
                                    } else {
                                        setProfMode("studio");
                                    }
                                }}>
                                    <Box className="w-4 h-4 mr-2" /> Studio
                                </Button>
                            </nav>

                            <div className="mt-auto pt-4 border-t">
                                <Button variant="outline" className="w-full text-red-500 hover:text-red-600" onClick={() => setRole("landing")}>
                                    Log Out
                                </Button>
                            </div>
                        </div>

                        {/* Professor Content Areas */}
                        <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">

                            {/* DASHBOARD VIEW */}
                            {profMode === "dashboard" && (
                                <div className="p-8 h-full overflow-y-auto">
                                    <h2 className="text-3xl font-bold mb-6">Course Dashboard</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        {MOCK_COURSES.map(course => (
                                            <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-lg">{course.name}</CardTitle>
                                                    <CardDescription>{course.students} Students Enrolled</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Avg. Performance</span>
                                                        <span className="font-bold">{course.avgGrade}%</span>
                                                    </div>
                                                    <Progress value={course.avgGrade} className="h-2" />
                                                    <div className="mt-4 flex gap-2">
                                                        <Button size="sm" variant="secondary" onClick={() => setProfMode("grading")}>View Grades</Button>
                                                        <Button size="sm" onClick={() => { setProfMode("library"); toast.info("Select an asset to assign."); }}>+ New Assignment</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <h3 className="font-bold text-xl mb-4">Recent Activity</h3>
                                    <div className="space-y-4">
                                        {MOCK_SUBMISSIONS.map(sub => (
                                            <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                                        {sub.student.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{sub.student}</div>
                                                        <div className="text-xs text-slate-500">Submitted "Orbit Mechanics"</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {sub.flagged && <Badge variant="destructive" className="flex gap-1"><ShieldAlert className="w-3 h-3" /> Cheat Flag</Badge>}
                                                    <Badge variant={sub.status === "Graded" ? "default" : "secondary"}>{sub.status}</Badge>
                                                    <span className="font-bold w-8 text-right">{sub.grade ? sub.grade : "--"}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* GRADING VIEW */}
                            {profMode === "grading" && (
                                <div className="p-8 h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-3xl font-bold">AI Grading Assistant</h2>
                                        <Button variant="outline"><BrainCircuit className="w-4 h-4 mr-2" /> Re-Analyze All</Button>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 flex gap-4">
                                        <BrainCircuit className="w-8 h-8 text-blue-600 shrink-0" />
                                        <div>
                                            <h3 className="font-bold text-blue-900">Performance Summary</h3>
                                            <p className="text-blue-800 text-sm mt-1">
                                                I've graded 12 submissions. Most students identified the <span className="font-bold">Thruster Assembly</span> correctly,
                                                but 40% struggled with the spatial question regarding the <span className="font-bold">Intake Valve</span>.
                                                I suggest reviewing intake mechanics in the next lecture.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1 border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 border-b">
                                                <tr>
                                                    <th className="p-4 font-medium">Student</th>
                                                    <th className="p-4 font-medium">Submission</th>
                                                    <th className="p-4 font-medium">AI Feedback</th>
                                                    <th className="p-4 font-medium">Auto-Grade</th>
                                                    <th className="p-4 font-medium">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {MOCK_SUBMISSIONS.map(sub => (
                                                    <tr key={sub.id} className="border-b last:border-0 hover:bg-slate-50">
                                                        <td className="p-4 font-medium">{sub.student}</td>
                                                        <td className="p-4 text-slate-500">Jan 28, 10:45 AM</td>
                                                        <td className="p-4 text-slate-600 max-w-xs truncate">
                                                            {sub.flagged ? "Flagged: Tab swich detected." : "Good understanding of spatial relations."}
                                                        </td>
                                                        <td className="p-4 font-bold">{sub.grade || "?"}</td>
                                                        <td className="p-4"><Button variant="link" size="sm" onClick={() => toast.info("Opening Student Submission Preview...")}>Review</Button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* LIBRARY VIEW */}
                            {profMode === "library" && (
                                <div className="p-8 h-full flex flex-col">
                                    <h2 className="text-2xl font-bold mb-6">Asset Discovery Hub</h2>
                                    <div className="relative mb-8">
                                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                        <input className="w-full pl-10 pr-4 py-2 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Search sketchfab, poly, or uploads..." onChange={() => toast.info("Simulating search results...")} />
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4">
                                        {MOCK_ASSETS.map(asset => (
                                            <div key={asset.id} className="group cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-all" onClick={() => { setSelectedAsset(asset); setProfMode("studio"); }}>
                                                <div className="aspect-square bg-slate-100 relative">
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                        <Box className="w-16 h-16" />
                                                    </div>
                                                    <img src={asset.poster || "https://placehold.co/400x400/png?text=3D+Asset"} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt={asset.name} />
                                                </div>
                                                <div className="p-3">
                                                    <h3 className="font-semibold">{asset.name}</h3>
                                                    <p className="text-xs text-slate-500">Source: Sketchfab (CC-BY)</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STUDIO VIEW (Original + Quiz Builder) */}
                            {profMode === "studio" && (
                                <div className="flex-1 flex h-full">
                                    <div className="flex-1 relative">
                                        {renderModelViewer(true)}
                                    </div>
                                    <div className="w-96 border-l border-slate-100 flex flex-col bg-slate-50">
                                        <Tabs defaultValue="annotate" className="flex-1 flex flex-col">
                                            <div className="p-2 border-b bg-white">
                                                <TabsList className="w-full grid grid-cols-3">
                                                    <TabsTrigger value="annotate">Annotate</TabsTrigger>
                                                    <TabsTrigger value="quiz">Quiz</TabsTrigger>
                                                    <TabsTrigger value="qr">Deploy</TabsTrigger>
                                                </TabsList>
                                            </div>

                                            <TabsContent value="annotate" className="flex-1 flex flex-col p-4 space-y-4 data-[state=inactive]:hidden">
                                                <div className="space-y-2">
                                                    <h3 className="font-bold text-sm">Agent Settings</h3>
                                                    <Label className="text-xs text-slate-500">Agent Persona Prompt</Label>
                                                    <textarea
                                                        className="w-full text-xs border rounded p-2 h-20"
                                                        value={settings.instructions}
                                                        onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                                                    />
                                                </div>
                                                {/* Existing Annotations List */}
                                                <div className="flex-1 overflow-y-auto space-y-2">
                                                    {hotspots.map((h, i) => (
                                                        <div key={h.id} className="bg-white p-3 rounded border flex justify-between">
                                                            <span className="font-medium text-sm">{i + 1}. {h.label}</span>
                                                            <Trash2 className="w-4 h-4 cursor-pointer text-slate-300 hover:text-red-500" onClick={() => setHotspots(hotspots.filter(x => x.id !== h.id))} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="quiz" className="flex-1 flex flex-col p-4 space-y-4 data-[state=inactive]:hidden">
                                                <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
                                                    <div>
                                                        <Label className="font-bold">Assignment Mode</Label>
                                                        <p className="text-xs text-slate-500">Enable for Graded Assessment. Disable for Visualization Only.</p>
                                                    </div>
                                                    <Switch checked={settings.hasQuiz} onCheckedChange={(v) => setSettings({ ...settings, hasQuiz: v })} />
                                                </div>

                                                <h3 className="font-bold text-sm">Assessment Review</h3>
                                                <div className="space-y-3 p-3 bg-white rounded border">
                                                    <Label>Question Type</Label>
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant={newQuestionType === 'mcq' ? 'default' : 'outline'} onClick={() => setNewQuestionType('mcq')} className="flex-1 text-xs">MCQ</Button>
                                                        <Button size="sm" variant={newQuestionType === 'spatial' ? 'default' : 'outline'} onClick={() => setNewQuestionType('spatial')} className="flex-1 text-xs">Spatial</Button>
                                                        <Button size="sm" variant={newQuestionType === 'essay' ? 'default' : 'outline'} onClick={() => setNewQuestionType('essay')} className="flex-1 text-xs">Essay</Button>
                                                    </div>

                                                    <Label>Prompt</Label>
                                                    <input
                                                        className="w-full border p-2 rounded text-sm"
                                                        placeholder="Question text..."
                                                        value={newQuestionPrompt}
                                                        onChange={(e) => setNewQuestionPrompt(e.target.value)}
                                                    />

                                                    {newQuestionType === 'mcq' && (
                                                        <div className="space-y-1">
                                                            <Label>Correct Answer (A, B, or C)</Label>
                                                            <input className="w-full border p-2 rounded text-sm" placeholder="e.g. Option A" value={newQuestionCorrect} onChange={e => setNewQuestionCorrect(e.target.value)} />
                                                        </div>
                                                    )}

                                                    {newQuestionType === 'spatial' && (
                                                        <div className="space-y-1">
                                                            <Label>Focus Check</Label>
                                                            <div className="text-xs text-slate-500">Correct Answer will be the Hotspot ID clicked by student.</div>
                                                        </div>
                                                    )}

                                                    <Button className="w-full" size="sm" onClick={addQuizQuestion}>Add Question</Button>
                                                </div>

                                                <div className="flex-1 overflow-y-auto space-y-2">
                                                    {settings.questions.map((q, i) => (
                                                        <div key={q.id} className="bg-white p-3 rounded border text-sm relative group">
                                                            <div className="font-bold text-slate-700">Q{i + 1} ({q.type})</div>
                                                            <div>{q.prompt}</div>
                                                            <Trash2 className="w-4 h-4 absolute top-3 right-3 text-slate-300 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100"
                                                                onClick={() => setSettings({ ...settings, questions: settings.questions.filter(qt => qt.id !== q.id) })}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="qr" className="flex-1 flex flex-col p-4 space-y-6 data-[state=inactive]:hidden text-center">
                                                <div className="space-y-2">
                                                    <h3 className="font-bold">Room-Scale Deployment</h3>
                                                    <p className="text-xs text-slate-500">Generate a code for students to scan and place this lab in their physical space.</p>
                                                </div>

                                                <div className="flex-1 flex items-center justify-center bg-slate-100 rounded-lg border-2 border-dashed">
                                                    {settings.qrCode ? (
                                                        <div className="space-y-4">
                                                            <div className="bg-white p-4 rounded shadow-lg mx-auto w-48 h-48 flex items-center justify-center border">
                                                                {/* Mock QR */}
                                                                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-mono text-2xl font-bold tracking-widest break-all p-2 text-center">
                                                                    {settings.qrCode}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-700">Room Code Active</p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-400">
                                                            <Scan className="w-12 h-12 mx-auto mb-2" />
                                                            <p>No Active Session</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <Button size="lg" onClick={handleGenerateQR} className="w-full">
                                                    {settings.qrCode ? "Regenerate Code" : "Generate Room QR"}
                                                </Button>
                                            </TabsContent>
                                        </Tabs>

                                        <div className="p-4 border-t bg-white">
                                            <Button className="w-full" onClick={handlePublish}>Publish to Course</Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === STUDENT === */}
                {role === "student" && (
                    <div className="flex-1 flex gap-6 overflow-hidden animate-in zoom-in-95 duration-500">
                        {/* CANVAS STYLE DASHBOARD */}
                        {studentMode === "dashboard" && (
                            <div className="w-full bg-white rounded-xl border shadow-sm p-8 overflow-y-auto">
                                <div className="flex justify-between items-end mb-8 border-b pb-6">
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900">Student Canvas</h1>
                                        <p className="text-slate-500 mt-1">Welcome back, Student.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-emerald-600">88.5%</div>
                                            <div className="text-xs text-slate-500">GPA</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <h3 className="font-bold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5" /> Active Assignments</h3>
                                        {[1].map(i => (
                                            <div key={i} className="border rounded-lg p-6 hover:border-emerald-500 transition-colors cursor-pointer group" onClick={() => setStudentMode("assignment")}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <Badge className="mb-2">CSC 3330</Badge>
                                                        <h4 className="text-xl font-bold group-hover:text-emerald-700">Shuttle Systems Components</h4>
                                                    </div>
                                                    <Button onClick={(e) => { e.stopPropagation(); setStudentMode("assignment"); }}>Launch Lab</Button>
                                                </div>
                                                <div className="flex gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1"><BrainCircuit className="w-4 h-4" /> AI Allowed</span>
                                                    <span className="flex items-center gap-1"><Target className="w-4 h-4" /> Spatial Quiz</span>
                                                    <span className="text-orange-500 font-medium">Due Tomorrow</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="font-bold text-lg">Recent Grades</h3>
                                        <div className="border rounded-lg divide-y">
                                            <div className="p-4 flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium">Fluid Dynamics</div>
                                                    <div className="text-xs text-slate-500">Lab 3</div>
                                                </div>
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">92/100</Badge>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        )}

                        {/* QR SCAN mode */}


                        {/* ASSIGNMENT ATTEMPT MODE */}
                        {studentMode === "assignment" && (
                            <>
                                <div className="flex-1 relative rounded-xl overflow-hidden shadow-xl border bg-black">
                                    {renderModelViewer(false, true)}

                                    {/* Anti-Cheat Warning */}
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur flex items-center gap-2">
                                        <ShieldAlert className="w-3 h-3" /> Anti-Cheat Active: Tab switching monitored
                                    </div>
                                </div>

                                <div className="w-96 flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden">
                                    <Tabs defaultValue="quiz" className="flex-1 flex flex-col">
                                        <div className="p-2 border-b bg-slate-50">
                                            <TabsList className="w-full">
                                                <TabsTrigger value="quiz" className="flex-1">Quiz</TabsTrigger>
                                                <TabsTrigger value="ai" className="flex-1">AI Assistant</TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <TabsContent value="quiz" className="flex-1 p-6 space-y-6 overflow-y-auto">
                                            {settings.hasQuiz ? (
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-lg">Question {activeQuizQuestion + 1} of {settings.questions.length || 1}</h3>
                                                    <p className="text-slate-700 text-lg">
                                                        {settings.questions[activeQuizQuestion]?.prompt || "No questions assigned."}
                                                    </p>

                                                    {/* Dynamic Input based on Question Type */}
                                                    <div className="p-6 bg-slate-50 rounded-xl border space-y-4">

                                                        {settings.questions[activeQuizQuestion]?.type === 'mcq' && settings.questions[activeQuizQuestion].options?.map((opt, i) => (
                                                            <div key={i} className="flex items-center space-x-2 p-3 rounded hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer" onClick={() => {
                                                                const newAnswers = { ...studentAnswers, [settings.questions[activeQuizQuestion].id]: opt };
                                                                setStudentAnswers(newAnswers);
                                                            }}>
                                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${studentAnswers[settings.questions[activeQuizQuestion].id] === opt ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400'}`}>
                                                                    {studentAnswers[settings.questions[activeQuizQuestion].id] === opt && <Check className="w-3 h-3 text-white" />}
                                                                </div>
                                                                <span>{opt}</span>
                                                            </div>
                                                        ))}

                                                        {settings.questions[activeQuizQuestion]?.type === 'essay' && (
                                                            <textarea
                                                                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                                                placeholder="Type your answer here..."
                                                                value={studentAnswers[settings.questions[activeQuizQuestion].id] || ""}
                                                                onChange={e => setStudentAnswers({ ...studentAnswers, [settings.questions[activeQuizQuestion].id]: e.target.value })}
                                                            />
                                                        )}

                                                        {(settings.questions[activeQuizQuestion]?.type === 'spatial' || !settings.questions.length) && (
                                                            <div className="text-center py-8 text-slate-500">
                                                                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                                {studentAnswers[settings.questions[activeQuizQuestion]?.id] ? (
                                                                    <div className="font-bold text-emerald-600 flex items-center justify-center gap-2">
                                                                        <Check className="w-5 h-5" /> Location Recorded
                                                                    </div>
                                                                ) : (
                                                                    "Click the component on the 3D model to answer."
                                                                )}
                                                            </div>
                                                        )}

                                                    </div>

                                                    <div className="flex justify-between pt-4">
                                                        <Button variant="outline" disabled={activeQuizQuestion === 0} onClick={() => setActiveQuizQuestion(Math.max(0, activeQuizQuestion - 1))}>Prev</Button>
                                                        <Button onClick={() => {
                                                            if (activeQuizQuestion < (settings.questions.length - 1)) {
                                                                setActiveQuizQuestion(activeQuizQuestion + 1);
                                                            } else {
                                                                setStudentMode("dashboard");
                                                                // Verify submissions
                                                                const submission: StudentSubmission = {
                                                                    studentId: "student-1",
                                                                    studentName: "Current Student",
                                                                    answers: studentAnswers,
                                                                    timestamp: new Date()
                                                                };
                                                                // Mock adding to global submissions
                                                                MOCK_SUBMISSIONS.unshift({
                                                                    id: Date.now().toString(),
                                                                    student: submission.studentName,
                                                                    grade: "Pending",
                                                                    status: "Needs Grading",
                                                                    flagged: false
                                                                });
                                                                toast.success("Assignment Submitted successfully!");
                                                            }
                                                        }}>
                                                            {activeQuizQuestion < (settings.questions.length - 1) ? "Next" : "Submit Assignment"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                                                    <MonitorPlay className="w-16 h-16 opacity-20" />
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-700">Exploration Mode</h3>
                                                        <p className="max-w-xs mx-auto">This assignment is for study and verification only. No quiz is required.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="ai" className="flex-1 flex flex-col p-0">
                                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                                {chatMessages.map((msg, i) => (
                                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-800'
                                                            }`}>
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 border-t">
                                                <div className="flex gap-2">
                                                    <input
                                                        className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        placeholder={settings.allowAI ? "Ask a question..." : "AI disabled"}
                                                        onPaste={(e) => { e.preventDefault(); toast.error("Copy/Paste disabled for Academic Integrity"); }}
                                                        value={chatInput}
                                                        onChange={(e) => setChatInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                                                        disabled={!settings.allowAI}
                                                    />
                                                    <Button size="icon" className="rounded-full" onClick={handleChat} disabled={!settings.allowAI}>
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>
        </div >
    );
};

export default Demo;
