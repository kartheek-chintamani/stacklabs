import { Outlet, useLocation, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function AuthLayout() {
    const location = useLocation();
    const isLogin = location.pathname.includes('/login');
    const isSignup = location.pathname.includes('/signup');

    // Decide what text to show based on the current route
    const isAuthPage = isLogin || isSignup;

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Form Area */}
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-background relative order-2 lg:order-1">
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                            <Zap className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold gradient-text">AffiliateHub</span>
                    </Link>
                </div>

                <div className="w-full max-w-md mx-auto animate-fade-in">
                    <Outlet />
                </div>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    {isLogin && (
                        <p>
                            Don't have an account?{' '}
                            <Link to="/auth/signup" className="font-medium text-primary hover:underline transition-colors">
                                Sign up
                            </Link>
                        </p>
                    )}
                    {isSignup && (
                        <p>
                            Already have an account?{' '}
                            <Link to="/auth/login" className="font-medium text-primary hover:underline transition-colors">
                                Sign in
                            </Link>
                        </p>
                    )}
                </div>
            </div>

            {/* Right Side - Branding/Decoration */}
            <div className="hidden lg:flex flex-col bg-muted relative overflow-hidden order-1 lg:order-2">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background z-0" />

                {/* Abstract shapes/decoration */}
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex-1 flex flex-col p-12 text-foreground">
                    <Link to="/" className="flex items-center gap-2 mb-auto">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                            <Zap className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">AffiliateHub</span>
                    </Link>

                    <div className="mt-auto max-w-lg">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">
                            Turn your audience into revenue
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Powerful tools to track, manage, and optimize your affiliate marketing campaigns all in one place.
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-background/50 backdrop-blur border border-border/50">
                                <h3 className="font-semibold mb-1">Analytics</h3>
                                <p className="text-sm text-muted-foreground">Real-time performance tracking</p>
                            </div>
                            <div className="p-4 rounded-xl bg-background/50 backdrop-blur border border-border/50">
                                <h3 className="font-semibold mb-1">Automation</h3>
                                <p className="text-sm text-muted-foreground">Streamlined link management</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
