'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Calendar, ExternalLink, CalendarPlus, X } from 'lucide-react';
import { format } from 'date-fns';

export interface Event {
    id: number;
    name: string;
    slug: string;
    description: string;
    date: string;
    time: string;
    location: string;
    location_url?: string; // Google Maps link
    image: string;
    status: string; // 'Upcoming' | 'Completed'
}

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    const [showModal, setShowModal] = useState(false);

    const eventDate = new Date(`${event.date}T${event.time}`);
    const isUpcoming = new Date() < eventDate;

    // Countdown Logic
    const useCountdown = (targetDate: Date) => {
        const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

        useEffect(() => {
            const interval = setInterval(() => {
                const now = new Date();
                const difference = targetDate.getTime() - now.getTime();

                if (difference > 0) {
                    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                    const minutes = Math.floor((difference / 1000 / 60) % 60);
                    const seconds = Math.floor((difference / 1000) % 60);
                    setTimeLeft({ days, hours, minutes, seconds });
                } else {
                    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                    clearInterval(interval);
                }
            }, 1000);

            return () => clearInterval(interval);
        }, [targetDate]);

        return timeLeft;
    };

    const timeLeft = useCountdown(eventDate);

    // Google Calendar Link
    const googleCalendarUrl = () => {
        const start = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const end = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, ""); // Assume 2 hours
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&sf=true&output=xml`;
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
            >
                {/* Image Section */}
                <div className="relative h-56 w-full overflow-hidden cursor-pointer" onClick={() => setShowModal(true)}>
                    <Image
                        src={event.image || '/images/placeholder.jpg'}
                        alt={event.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Badge */}
                    <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${isUpcoming ? 'bg-blue-600/90 text-white' : 'bg-gray-800/80 text-gray-300'}`}>
                            {isUpcoming ? 'Upcoming' : 'Past Event'}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                    {/* Date & Time Row */}
                    <div className="flex items-center gap-4 text-sm text-blue-600 font-bold mb-3 uppercase tracking-wide">
                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(eventDate, 'MMM d, yyyy')}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {format(eventDate, 'h:mm a')}</div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {event.name}
                    </h3>

                    <div className="flex items-start gap-2 text-gray-500 text-sm mb-4">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        {event.location_url ? (
                            <a
                                href={event.location_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="line-clamp-1 hover:text-blue-600 hover:underline z-10 relative"
                            >
                                {event.location}
                            </a>
                        ) : (
                            <span className="line-clamp-1">{event.location}</span>
                        )}
                    </div>

                    <p className="text-gray-600 line-clamp-3 mb-6 text-sm flex-1">
                        {event.description}
                    </p>

                    {/* Footer Actions */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                        {isUpcoming ? (
                            <a
                                href={googleCalendarUrl()}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                <CalendarPlus className="w-4 h-4" /> Add to Calendar
                            </a>
                        ) : (
                            <span className="text-sm text-gray-400 font-medium">Event Concluded</span>
                        )}

                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Details <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Modal Detail View */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row relative shadow-2xl"
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 z-10 p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition-colors text-white md:text-gray-800 md:bg-gray-100 md:hover:bg-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Image Side */}
                            <div className="w-full md:w-1/2 relative h-48 md:h-auto md:min-h-[400px] bg-gray-100 shrink-0">
                                <Image src={event.image || '/images/placeholder.jpg'} alt={event.name} fill className="object-cover" />
                            </div>

                            {/* Content Side */}
                            <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto">
                                <div className="mb-6">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${isUpcoming ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {isUpcoming ? 'Upcoming Event' : 'Past Event'}
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{event.name}</h2>

                                    <div className="space-y-3 text-gray-600">
                                        <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-blue-500 shrink-0" /> {format(eventDate, 'EEEE, MMMM do, yyyy')}</div>
                                        <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-blue-500 shrink-0" /> {format(eventDate, 'h:mm a')}</div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                                            {event.location_url ? (
                                                <a href={event.location_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                    {event.location} ↗
                                                </a>
                                            ) : (
                                                <span>{event.location}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Countdown (Only if upcoming) */}
                                {isUpcoming && (
                                    <div className="bg-blue-50 rounded-xl p-4 mb-8 grid grid-cols-4 gap-2 text-center">
                                        <div><div className="text-xl font-bold text-blue-700">{timeLeft.days}</div><div className="text-xs text-blue-500 font-bold uppercase">Days</div></div>
                                        <div><div className="text-xl font-bold text-blue-700">{timeLeft.hours}</div><div className="text-xs text-blue-500 font-bold uppercase">Hrs</div></div>
                                        <div><div className="text-xl font-bold text-blue-700">{timeLeft.minutes}</div><div className="text-xs text-blue-500 font-bold uppercase">Mins</div></div>
                                        <div><div className="text-xl font-bold text-blue-700">{timeLeft.seconds}</div><div className="text-xs text-blue-500 font-bold uppercase">Secs</div></div>
                                    </div>
                                )}

                                <div className="prose prose-blue max-w-none text-gray-600 mb-8">
                                    <p className="whitespace-pre-line leading-relaxed">{event.description}</p>
                                </div>

                                {isUpcoming && (
                                    <a
                                        href={googleCalendarUrl()}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                    >
                                        <CalendarPlus className="w-5 h-5" /> Add to Google Calendar
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
