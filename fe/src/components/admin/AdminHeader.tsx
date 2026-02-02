'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { LogOut, LayoutDashboard, FileText, Home, Settings } from 'lucide-react';

export default function AdminHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/admin/topics" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="hidden md:inline font-bold text-gray-900">Admin Console</span>
                    </Link>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <Link
                            href="/admin/topics"
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isActive('/admin/topics') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Topics
                        </Link>
                        <Link
                            href="/admin/articles"
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isActive('/admin/articles') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <FileText className="w-4 h-4" />
                            Articles
                        </Link>
                        <Link
                            href="/"
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900"
                        >
                            <Home className="w-4 h-4" />
                            View Site
                        </Link>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-100"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </div>
        </nav>
    );
}
