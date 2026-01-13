import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataService, Person, Event, Project, AuthData, LogEntry } from "@/lib/dataService";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Plus, Trash2, Edit2, LogOut, ArrowUp, ArrowDown, Settings, User, ShieldCheck, Activity, FolderGit2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [people, setPeople] = useState<Person[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    // Not loading full auth object anymore for security
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Settings Form State
    const [settingsForm, setSettingsForm] = useState({
        newPassword: '',
        confirmPassword: '',
        securityQuestion: '',
        securityAnswer: ''
    });

    // Person Form State
    const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [personForm, setPersonForm] = useState<Partial<Person>>({ type: 'core', order: 0 });

    // Event Form State
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [eventForm, setEventForm] = useState<Partial<Event>>({ type: 'Technical Workshop' });

    // Project Form State
    const [projects, setProjects] = useState<Project[]>([]);
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [projectForm, setProjectForm] = useState<Partial<Project>>({ students: [], supervisors: [] });


    useEffect(() => {
        const token = localStorage.getItem("lab_admin_token");
        if (!token) {
            navigate("/login");
            return;
        }

        const loadData = async () => {
            try {
                const [loadedPeople, loadedEvents, loadedProjects, loadedLogs] = await Promise.all([
                    dataService.getPeople(),
                    dataService.getEvents(),
                    dataService.getProjects(),
                    dataService.getLogs()
                ]);

                setPeople(loadedPeople.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
                setEvents(loadedEvents);
                setProjects(loadedProjects);
                setLogs(loadedLogs);

                // Get security question separately
                const { question } = await dataService.getSecurityQuestion();
                setSettingsForm(prev => ({
                    ...prev,
                    securityQuestion: question || ''
                }));

            } catch (error) {
                console.error("Failed to load admin data", error);
                // navigate("/login"); // Optional: redirect on error
            }
        };

        loadData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("lab_admin_token");
        navigate("/login");
    };

    // --- Person CRUD & Reordering ---
    const openPersonDialog = (person?: Person) => {
        if (person) {
            setEditingPerson(person);
            setPersonForm(person);
        } else {
            setEditingPerson(null);
            setPersonForm({ type: 'core', name: '', role: '', email: '', phone: '', image: '', order: people.length });
        }
        setIsPersonDialogOpen(true);
    };

    const savePerson = async () => {
        if (!personForm.name || !personForm.role) {
            toast.error("Name and Role are required");
            return;
        }

        let updatedPeople;
        if (editingPerson) {
            updatedPeople = people.map(p => p.id === editingPerson.id ? { ...p, ...personForm } as Person : p);
        } else {
            const newPerson = {
                ...personForm,
                id: Math.random().toString(36).substr(2, 9),
                order: people.length
            } as Person;
            updatedPeople = [...people, newPerson];
        }

        try {
            const sorted = updatedPeople.sort((a, b) => a.order - b.order);
            await dataService.savePeople(sorted);
            toast.success(editingPerson ? "Person updated" : "Person added");

            // Refresh local state and logs
            setPeople(sorted);
            setIsPersonDialogOpen(false);
            const loadedLogs = await dataService.getLogs();
            setLogs(loadedLogs);
        } catch (e) {
            toast.error("Failed to save person");
        }
    };

    const deletePerson = async (id: string) => {
        if (confirm("Are you sure you want to remove this person?")) {
            const updated = people.filter(p => p.id !== id).map((p, i) => ({ ...p, order: i }));
            try {
                await dataService.savePeople(updated);
                setPeople(updated);
                toast.success("Person removed");
                const loadedLogs = await dataService.getLogs();
                setLogs(loadedLogs);
            } catch (e) {
                toast.error("Failed to delete person");
            }
        }
    };

    const movePerson = async (index: number, direction: 'up' | 'down') => {
        const newPeople = [...people];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newPeople.length) return;

        // Swap order values
        const tempOrder = newPeople[index].order;
        newPeople[index].order = newPeople[targetIndex].order;
        newPeople[targetIndex].order = tempOrder;

        const sorted = newPeople.sort((a, b) => a.order - b.order);
        try {
            await dataService.savePeople(sorted);
            setPeople(sorted);
        } catch (e) {
            toast.error("Failed to reorder");
        }
    };

    // --- Event CRUD ---
    const openEventDialog = (event?: Event) => {
        if (event) {
            setEditingEvent(event);
            setEventForm(event);
        } else {
            setEditingEvent(null);
            setEventForm({ title: '', description: '', date: '', location: '', type: 'Technical Workshop' });
        }
        setIsEventDialogOpen(true);
    };

    const saveEvent = async () => {
        if (!eventForm.title || !eventForm.date) {
            toast.error("Title and Date are required");
            return;
        }

        let updatedEvents;
        if (editingEvent) {
            updatedEvents = events.map(e => e.id === editingEvent.id ? { ...e, ...eventForm } as Event : e);
        } else {
            const newEvent = { ...eventForm, id: Math.random().toString(36).substr(2, 9) } as Event;
            updatedEvents = [...events, newEvent];
        }

        try {
            await dataService.saveEvents(updatedEvents);
            setEvents(updatedEvents);
            toast.success(editingEvent ? "Event updated" : "Event added");
            setIsEventDialogOpen(false);
            const loadedLogs = await dataService.getLogs();
            setLogs(loadedLogs);
        } catch (e) {
            toast.error("Failed to save event");
        }
    };

    const deleteEvent = async (id: string) => {
        if (confirm("Are you sure you want to remove this event?")) {
            const updated = events.filter(e => e.id !== id);
            try {
                await dataService.saveEvents(updated);
                setEvents(updated);
                toast.success("Event removed");
                const loadedLogs = await dataService.getLogs();
                setLogs(loadedLogs);
            } catch (e) {
                toast.error("Failed to delete event");
            }
        }
    };

    // --- Project CRUD ---
    const openProjectDialog = (project?: Project) => {
        if (project) {
            setEditingProject(project);
            setProjectForm(project);
        } else {
            setEditingProject(null);
            setProjectForm({ title: '', description: '', category: 'Research', students: [], supervisors: [] });
        }
        setIsProjectDialogOpen(true);
    };

    const saveProject = async () => {
        if (!projectForm.title || !projectForm.description) {
            toast.error("Title and Description are required");
            return;
        }

        let updatedProjects;
        if (editingProject) {
            updatedProjects = projects.map(p => p.id === editingProject.id ? { ...p, ...projectForm } as Project : p);
        } else {
            const newProject = { ...projectForm, id: Math.random().toString(36).substr(2, 9) } as Project;
            updatedProjects = [...projects, newProject];
        }

        try {
            await dataService.saveProjects(updatedProjects);
            setProjects(updatedProjects);
            toast.success(editingProject ? "Project updated" : "Project added");
            setIsProjectDialogOpen(false);
            const loadedLogs = await dataService.getLogs();
            setLogs(loadedLogs);
        } catch (e) {
            toast.error("Failed to save project");
        }
    };

    const deleteProject = async (id: string) => {
        if (confirm("Are you sure you want to remove this project?")) {
            const updated = projects.filter(p => p.id !== id);
            try {
                await dataService.saveProjects(updated);
                setProjects(updated);
                toast.success("Project removed");
                const loadedLogs = await dataService.getLogs();
                setLogs(loadedLogs);
            } catch (e) {
                toast.error("Failed to delete project");
            }
        }
    };

    // --- Settings ---
    const updateSettings = async () => {
        const updateData: any = {};

        if (settingsForm.newPassword) {
            if (settingsForm.newPassword !== settingsForm.confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
            updateData.passwordHash = settingsForm.newPassword;
        }

        if (settingsForm.securityQuestion) {
            updateData.securityQuestion = settingsForm.securityQuestion;
        }

        if (settingsForm.securityAnswer) {
            updateData.securityAnswerHash = settingsForm.securityAnswer;
        }

        try {
            await dataService.updateSettings(updateData);
            toast.success("Settings updated successfully");
            setSettingsForm(prev => ({ ...prev, newPassword: '', confirmPassword: '', securityAnswer: '' }));
            const loadedLogs = await dataService.getLogs();
            setLogs(loadedLogs);
        } catch (e) {
            toast.error("Failed to update settings");
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 pt-24 pb-12">
            <Navigation />
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage your lab's content and security</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
                <Tabs defaultValue="people" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
                        <TabsTrigger value="people" className="flex items-center gap-2">
                            <User className="h-4 w-4" /> Team
                        </TabsTrigger>
                        <TabsTrigger value="events" className="flex items-center gap-2">
                            Show Events
                        </TabsTrigger>
                        <TabsTrigger value="projects" className="flex items-center gap-2">
                            <FolderGit2 className="h-4 w-4" /> Projects
                        </TabsTrigger>
                        <TabsTrigger value="logs" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Logs
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" /> Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="people" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Team Members</h2>
                            <Button size="sm" onClick={() => openPersonDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> Add Member
                            </Button>
                        </div>
                        <div className="grid gap-4">
                            {people.map((person, index) => (
                                <Card key={person.id} className="hover:shadow-sm transition-shadow">
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    disabled={index === 0}
                                                    onClick={() => movePerson(index, 'up')}
                                                >
                                                    <ArrowUp className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    disabled={index === people.length - 1}
                                                    onClick={() => movePerson(index, 'down')}
                                                >
                                                    <ArrowDown className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div>
                                                <p className="font-semibold">{person.name}</p>
                                                <p className="text-sm text-muted-foreground">{person.role} • <span className="capitalize">{person.type}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openPersonDialog(person)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deletePerson(person.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="events" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Workshops & Events</h2>
                            <Button size="sm" onClick={() => openEventDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> Add Event
                            </Button>
                        </div>
                        <div className="grid gap-4">
                            {events.map(event => (
                                <Card key={event.id} className="hover:shadow-sm transition-shadow">
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="font-semibold">{event.title}</p>
                                            <p className="text-sm text-muted-foreground">{event.date} • {event.location}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEventDialog(event)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteEvent(event.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Research Projects</h2>
                            <Button size="sm" onClick={() => openProjectDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> Add Project
                            </Button>
                        </div>
                        <div className="grid gap-4">
                            {projects.map(project => (
                                <Card key={project.id} className="hover:shadow-sm transition-shadow">
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="font-semibold">{project.title}</p>
                                            <p className="text-sm text-muted-foreground">{project.category}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openProjectDialog(project)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteProject(project.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="logs" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" /> Audit Logs
                                </CardTitle>
                                <CardDescription>View recent administrative actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Details</TableHead>
                                            <TableHead>IP</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map(log => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</TableCell>
                                                <TableCell className="font-medium">{log.action}</TableCell>
                                                <TableCell>{log.details}</TableCell>
                                                <TableCell className="text-muted-foreground">{log.ip}</TableCell>
                                            </TableRow>
                                        ))}
                                        {logs.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No logs found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5" /> Security Settings
                                </CardTitle>
                                <CardDescription>Update your admin password and password recovery settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-medium border-b pb-2">Change Password</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <label className="text-sm">New Password</label>
                                            <Input
                                                type="password"
                                                value={settingsForm.newPassword}
                                                onChange={e => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm">Confirm Password</label>
                                            <Input
                                                type="password"
                                                value={settingsForm.confirmPassword}
                                                onChange={e => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-medium border-b pb-2">Password Recovery</h3>
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <label className="text-sm">Security Question</label>
                                            <Input
                                                value={settingsForm.securityQuestion}
                                                onChange={e => setSettingsForm({ ...settingsForm, securityQuestion: e.target.value })}
                                                placeholder="e.g., What was the name of your first pet?"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm">Security Answer</label>
                                            <Input
                                                type="password"
                                                value={settingsForm.securityAnswer}
                                                onChange={e => setSettingsForm({ ...settingsForm, securityAnswer: e.target.value })}
                                                placeholder="Leave blank to keep current answer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={updateSettings} className="w-full md:w-auto">Save All Settings</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Person Dialog */}
            <Dialog open={isPersonDialogOpen} onOpenChange={setIsPersonDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingPerson ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={personForm.name}
                                onChange={e => setPersonForm({ ...personForm, name: e.target.value })}
                                placeholder="Dr. John Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Role</label>
                            <Input
                                value={personForm.role}
                                onChange={e => setPersonForm({ ...personForm, role: e.target.value })}
                                placeholder="Research Supervisor"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Profile Image URL</label>
                            <Input
                                value={personForm.image}
                                onChange={e => setPersonForm({ ...personForm, image: e.target.value })}
                                placeholder="https://example.com/photo.jpg"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    value={personForm.email}
                                    onChange={e => setPersonForm({ ...personForm, email: e.target.value })}
                                    placeholder="email@aui.ma"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input
                                    value={personForm.phone}
                                    onChange={e => setPersonForm({ ...personForm, phone: e.target.value })}
                                    placeholder="+212 ..."
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select
                                value={personForm.type}
                                onValueChange={val => setPersonForm({ ...personForm, type: val as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="core">Core Team</SelectItem>
                                    <SelectItem value="external">External Collaborator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPersonDialogOpen(false)}>Cancel</Button>
                        <Button onClick={savePerson}>Save Member</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Event Dialog */}
            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={eventForm.title}
                                onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                                placeholder="AR/VR Workshop"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={eventForm.description}
                                onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                                placeholder="Brief description of the event..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    value={eventForm.date}
                                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                                    placeholder="Jan 20, 2025"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Type</label>
                                <Input
                                    value={eventForm.type}
                                    onChange={e => setEventForm({ ...eventForm, type: e.target.value })}
                                    placeholder="Conference, Workshop..."
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Location</label>
                            <Input
                                value={eventForm.location}
                                onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                                placeholder="Building 4, AUI"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Schedule (Optional)</label>
                            <Input
                                value={eventForm.schedule}
                                onChange={e => setEventForm({ ...eventForm, schedule: e.target.value })}
                                placeholder="e.g., 2:00 PM - 4:00 PM"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveEvent}>Save Event</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Project Dialog */}
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={projectForm.title}
                                onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                                placeholder="Project Title"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={projectForm.description}
                                onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                                placeholder="Project Description..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input
                                value={projectForm.category}
                                onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                                placeholder="e.g. Education Technology"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Students (comma separated)</label>
                            <Input
                                value={projectForm.students?.join(', ')}
                                onChange={e => setProjectForm({ ...projectForm, students: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                                placeholder="Student 1, Student 2..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Supervisors (comma separated)</label>
                            <Input
                                value={projectForm.supervisors?.join(', ')}
                                onChange={e => setProjectForm({ ...projectForm, supervisors: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                                placeholder="Dr. X, Dr. Y..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveProject}>Save Project</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default AdminDashboard;
