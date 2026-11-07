'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import EventCard, { Event } from '@/components/event/card';
import { motion } from 'framer-motion';
import { Calendar, Loader2 } from 'lucide-react';

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    useEffect(() => {
        async function fetchEvents() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/events/`);
                if (!res.ok) throw new Error('Failed to fetch events');

                const data = await res.json();
                // Backend returns simple list. We need to sort and parse in frontend or use backend filtering.
                // Assuming backend returns all events.
                setEvents(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load events. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    // Filter Logic
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        const now = new Date();
        if (activeTab === 'upcoming') return eventDate >= now;
        return eventDate < now;
    }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`).getTime();
        const dateB = new Date(`${b.date}T${b.time}`).getTime();
        // Ascending for upcoming (soonest first), Descending for past (most recent first)
        return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA;
    });

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 pt-20 md:py-16 md:pt-24">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16 px-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 md:mb-6 tracking-tight">
                        ACES <span className="text-blue-600">Events</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                        Stay updated with the latest workshops, tech talks, social gatherings, and departmental activities. Don&apos;t miss out on what&apos;s happening!
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8 md:mb-12">
                    <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm inline-flex">
                        {(['upcoming', 'past'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-4 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 capitalize ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-blue-600 rounded-full shadow-md"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{tab} Events</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-red-100 shadow-sm">
                        <p className="text-red-500 font-medium">{error}</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200"
                    >
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab} events found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            {activeTab === 'upcoming'
                                ? "We're currently planning new exciting events! Check back soon."
                                : "No past events to show."}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
