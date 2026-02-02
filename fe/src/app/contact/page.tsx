'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Send, User, CheckCircle, Globe, Briefcase, AlertCircle } from 'lucide-react';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [topic, setTopic] = useState('review');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="bg-blue-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Have a tool you want us to review? Need help or have feedback? We'd love to hear from you.
                    </p>
                </div>
            </section>

            {/* Form Section */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">

                    {/* Contact Info (Side) */}
                    <div className="bg-gray-50 p-8 md:w-1/3 border-r border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Get in Touch</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">Email</div>
                                    <div className="text-sm text-gray-600">hello@devtoolsnexus.com</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">Social</div>
                                    <div className="text-sm text-gray-600">@DevToolsNexus</div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-200 mt-8">
                                <h4 className="font-semibold text-gray-900 mb-2">Office (Mailing Only)</h4>
                                <p className="text-sm text-gray-600">
                                    123 Innovation Drive<br />
                                    Tech City, TC 90210<br />
                                    United States
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-8 md:w-2/3">
                        {submitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4 animate-bounce">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                <p className="text-gray-600 mb-6">
                                    Thanks for reaching out. We'll review your request and get back to you shortly.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-blue-600 font-medium hover:text-blue-700 underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="name"
                                                required
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                                        <select
                                            id="topic"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                                        >
                                            <option value="review">Request a Tool Review</option>
                                            <option value="feedback">Website Feedback</option>
                                            <option value="partnership">Partnership Inquiry</option>
                                            <option value="support">Technical Support</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                                        <select
                                            id="urgency"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="high">High Priority</option>
                                            <option value="low">Low Priority</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Conditional Fields for Tool Review */}
                                {topic === 'review' && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 grid md:grid-cols-2 gap-6 animate-fadeIn">
                                        <div>
                                            <label htmlFor="toolName" className="block text-sm font-medium text-blue-900 mb-2">Tool Name</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-3 w-5 h-5 text-blue-400" />
                                                <input
                                                    type="text"
                                                    id="toolName"
                                                    className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                                    placeholder="App Name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="toolUrl" className="block text-sm font-medium text-blue-900 mb-2">Website URL</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-3 w-5 h-5 text-blue-400" />
                                                <input
                                                    type="url"
                                                    id="toolUrl"
                                                    className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        rows={5}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                                        placeholder="Tell us more about your request..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            Send Message
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
