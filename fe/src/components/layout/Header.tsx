'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 1. LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              N
            </div>
            <span className="text-xl font-bold text-gray-900">DevTools Nexus</span>
          </Link>

          {/* 2. DESKTOP NAVIGATION (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/articles" className="text-gray-600 hover:text-blue-600 font-medium">
              Articles
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-blue-600 font-medium">
              Categories
            </Link>
            <Link href="/tools" className="text-gray-600 hover:text-blue-600 font-medium">
              Tools
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 font-medium">
              About
            </Link>
          </nav>

          {/* 3. SEARCH & ACTIONS */}
          <div className="flex items-center gap-4">
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <Link href="/contact" className="hidden md:block text-sm font-medium text-gray-600 hover:text-blue-600">
              Contact
            </Link>

            {/* Mobile Menu Button (Visible on Mobile) */}
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="p-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
            <nav className="flex flex-col gap-2">
              <Link href="/articles" className="block py-2 text-gray-700 font-medium hover:text-blue-600">Articles</Link>
              <Link href="/categories" className="block py-2 text-gray-700 font-medium hover:text-blue-600">Categories</Link>
              <Link href="/tools" className="block py-2 text-gray-700 font-medium hover:text-blue-600">Tools</Link>
              <Link href="/about" className="block py-2 text-gray-700 font-medium hover:text-blue-600">About</Link>
              <Link href="/contact" className="block py-2 text-gray-700 font-medium hover:text-blue-600">Contact</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
