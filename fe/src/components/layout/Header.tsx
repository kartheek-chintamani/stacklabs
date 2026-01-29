// AI Generated Code by Deloitte + Cursor (BEGIN)
'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DevTools Nexus</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/articles" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Articles
            </Link>
            <Link href="/tools" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Tools
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              About
            </Link>
            <Link href="/admin/topics" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Admin
            </Link>
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Search className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Search tools...</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <Link href="/articles" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                Articles
              </Link>
              <Link href="/tools" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                Tools
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                Categories
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                About
              </Link>
              <Link href="/admin/topics" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                Admin
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
// AI Generated Code by Deloitte + Cursor (END)
