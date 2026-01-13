import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { dataService, AuthData } from "@/lib/dataService";
import { ShieldAlert, KeyRound, HelpCircle } from "lucide-react";

const Login = () => {
    const [password, setPassword] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [authData, setAuthData] = useState<AuthData | null>(null);
    const navigate = useNavigate();

    const loadQuestion = async () => {
        try {
            const { question } = await dataService.getSecurityQuestion();
            setAuthData({ securityQuestion: question } as any);
        } catch (error: any) {
            console.error("Failed to load security question");
            toast.error("Could not load security question. Please check if your Supabase tables are set up and RLS is disabled.");
        }
    };

    useEffect(() => {
        loadQuestion();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { token } = await dataService.login(password);
            localStorage.setItem("lab_admin_token", token);
            toast.success("Logged in successfully");
            navigate("/admin");
        } catch (error: any) {
            const message = error.message || "Invalid password";
            toast.error(`Login failed: ${message}`);
        }
    };

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { token } = await dataService.recoverPassword(securityAnswer);
            localStorage.setItem("lab_admin_token", token);
            toast.success("Identity verified. You can now reset your password in settings.");
            navigate("/admin");
        } catch (error: any) {
            const message = error.message || "Incorrect answer";
            toast.error(`Recovery failed: ${message}`);
        }
    };

    return (
        <div className="min-h-screen bg-muted/50 flex flex-col">
            <Navigation />
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-lg border-2">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                            {isForgotPassword ? <HelpCircle className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {isForgotPassword ? "Password Recovery" : "Admin Login"}
                        </CardTitle>
                        <CardDescription>
                            {isForgotPassword
                                ? "Answer your security question to gain access"
                                : "Enter the admin password to access the dashboard"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isForgotPassword ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 text-center text-lg tracking-widest font-mono"
                                        autoFocus
                                    />
                                </div>
                                <Button type="submit" className="w-full h-12 text-lg">
                                    Login to Dashboard
                                </Button>
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsForgotPassword(true);
                                            loadQuestion();
                                        }}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Forgot your password?
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleRecovery} className="space-y-4">
                                <div className="space-y-4">
                                    <div className="p-3 bg-muted rounded-md text-center">
                                        <p className="text-xs uppercase text-muted-foreground mb-1 font-bold">Security Question</p>
                                        <p className="font-medium">{authData?.securityQuestion || "Loading question..."}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Your answer"
                                            value={securityAnswer}
                                            onChange={(e) => setSecurityAnswer(e.target.value)}
                                            className="h-12 text-center"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-12 text-lg">
                                    Verify & Access
                                </Button>
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPassword(false)}
                                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center border-t py-4 bg-muted/30">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <KeyRound className="h-3 w-3" />
                            <span>Secure Administrative Portal</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Login;
