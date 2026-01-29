import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const signupSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function SignupPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.id]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = signupSchema.safeParse(formData);
        if (!validation.success) {
            toast.error(validation.error.errors[0].message);
            return;
        }

        setLoading(true);

        try {
            const { error } = await signUp(formData.email, formData.password);

            if (error) {
                if (error.message.includes('already registered')) {
                    toast.error('This email is already registered. Please sign in instead.');
                } else {
                    toast.error(error.message);
                }
            } else {
                toast.success('Account created successfully! Please check your email to verify your account.');
                // Generally, after signup with email verification, we shouldn't redirect to dashboard immediately usually
                // but Supabase behavior depends on email confirmation settings.
                // Assuming email confirmation is on, we might want to show a success message.
                navigate('/auth/login');
            }
        } catch (err) {
            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center lg:text-left space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
                <p className="text-muted-foreground">
                    Join thousands of affiliates managing their links efficiently
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-10 h-11"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            placeholder="Min 6. characters"
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-10 h-11"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="pl-10 h-11"
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full h-11 gradient-primary text-base" disabled={loading}>
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            Create Account <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
