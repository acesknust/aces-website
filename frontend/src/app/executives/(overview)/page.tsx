'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Linkedin, Twitter, Instagram, Facebook, Mail, Globe, MessageCircle, Send, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

// Types for our API response
interface SocialLink {
    platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'email' | 'website' | 'whatsapp' | 'telegram' | 'other';
    url: string;
}

interface Executive {
    id: number;
    name: string;
    position: string;
    display_position: string;
    image: string;
    sort_order: number;
    social_links: SocialLink[];
}

interface AcademicYear {
    id: number;
    name: string;
    hero_banner: string | null;
    description: string;
    show_description: boolean;
    is_current: boolean;
    executives: Executive[];
}

interface ApiResponse {
    current_year: string;
    years: AcademicYear[];
}

// Loading placeholder with shimmer effect
const LoadingPlaceholder = () => (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
);

// Card skeleton for loading state
const CardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
        </div>
        <div className="p-6 text-center space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
    </div>
);

const ExecutivePage = () => {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedExecutive, setSelectedExecutive] = useState<Executive | null>(null);

    // Fallback hero banner
    const fallbackBanner = 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756565095/executives_ahwozc.jpg';

    // Default description
    const defaultDescription = `We are a student-led association that aims to provide an environment where students can grow and develop their skills. It is with great honor and enthusiasm that we, the executives leading the Noble Association, extend our warmest welcome to each and every one of you.`;

    useEffect(() => {
        const fetchExecutives = async () => {
            try {
                setIsLoading(true);
                let apiUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!apiUrl) {
                    apiUrl = process.env.NODE_ENV === 'development'
                        ? 'http://127.0.0.1:8000'
                        : 'https://aces-shop-backend-w8ro7.ondigitalocean.app';
                }

                const res = await fetch(`${apiUrl}/api/executives/years/`);
                if (!res.ok) throw new Error('Failed to fetch executives');

                const json: ApiResponse = await res.json();
                setData(json);
                setSelectedYear(json.current_year || (json.years[0]?.name ?? ''));
            } catch (err) {
                console.error('Error fetching executives:', err);
                setError('Failed to load executives. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchExecutives();
    }, []);

    const handleImageLoad = (id: number) => {
        setLoadedImages(prev => new Set(prev).add(id));
    };

    const handleYearSelect = (year: string) => {
        setSelectedYear(year);
        setIsDropdownOpen(false);
        setLoadedImages(new Set());
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.year-dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get current year data
    const currentYearData = data?.years.find(y => y.name === selectedYear);
    const heroBanner = currentYearData?.hero_banner || fallbackBanner;
    const description = currentYearData?.show_description && currentYearData?.description
        ? currentYearData.description
        : defaultDescription;

    const renderSocialLinks = (exec: Executive, iconSize = 20, isDarkBg = false) => {
        if (!exec.social_links || exec.social_links.length === 0) return null;

        return (
            <div className={`flex justify-center items-center flex-wrap gap-4 mt-3 pt-3 ${!isDarkBg ? 'border-t border-gray-100' : ''}`} onClick={(e) => e.stopPropagation()}>
                {exec.social_links.map((link, idx) => {
                    let IconComponent = LinkIcon;
                    let hoverColor = "hover:text-gray-900";
                    let href = link.url;

                    switch (link.platform) {
                        case 'linkedin':
                            IconComponent = Linkedin;
                            hoverColor = "hover:text-[#0077b5]";
                            break;
                        case 'twitter':
                            IconComponent = Twitter;
                            hoverColor = isDarkBg ? "hover:text-white" : "hover:text-black";
                            break;
                        case 'instagram':
                            IconComponent = Instagram;
                            hoverColor = "hover:text-[#E4405F]";
                            break;
                        case 'facebook':
                            IconComponent = Facebook;
                            hoverColor = "hover:text-[#1877F2]";
                            break;
                        case 'email':
                            IconComponent = Mail;
                            hoverColor = "hover:text-red-500";
                            if (!href.startsWith('mailto:')) href = `mailto:${href}`;
                            break;
                        case 'website':
                            IconComponent = Globe;
                            hoverColor = "hover:text-blue-600";
                            break;
                        case 'whatsapp':
                            IconComponent = MessageCircle;
                            hoverColor = "hover:text-[#25D366]";
                            if (!href.startsWith('https://wa.me/') && /^\+?\d+$/.test(href)) {
                                href = `https://wa.me/${href.replace(/\+/g, '')}`;
                            }
                            break;
                        case 'telegram':
                            IconComponent = Send;
                            hoverColor = "hover:text-[#0088cc]";
                            if (!href.startsWith('https://t.me/') && !href.startsWith('tg://')) {
                                href = `https://t.me/${href.replace('@', '')}`;
                            }
                            break;
                    }

                    const baseColor = isDarkBg ? 'text-gray-300' : 'text-gray-400';

                    return (
                        <a
                            key={idx}
                            href={href}
                            target={link.platform === 'email' ? undefined : "_blank"}
                            rel="noopener noreferrer"
                            className={`${baseColor} ${hoverColor} transition-colors duration-300 transform hover:scale-110`}
                            aria-label={`${link.platform} Profile`}
                        >
                            <IconComponent size={iconSize} />
                        </a>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section - Responsive Image (Auto Height) */}
            <div className="relative w-full bg-slate-900">
                <div className="relative w-full">
                    {/* Dark overlay for text readability - only visible if we have an image */}
                    <div className="absolute inset-0 bg-black/40 z-10" />

                    {/* The Image itself - Scales naturally, no cropping */}
                    <Image
                        src={heroBanner}
                        alt="Executives Banner"
                        width={1920}
                        height={1080}
                        className="w-full h-auto object-contain min-h-[200px]"
                        priority
                    />

                    {/* Centered Title Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-3xl md:text-6xl lg:text-7xl font-bold text-white text-center drop-shadow-2xl px-4"
                        >
                            Our Executives
                        </motion.h1>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">

                {/* Intro Section with Heading & Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-16 text-center max-w-4xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Meet Your Leaders</h2>
                    <div className="w-24 h-1 bg-blue-600 mx-auto mb-8 rounded-full" />
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed">{description}</p>
                </motion.div>

                {/* Left-Aligned Year Dropdown */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-12 flex justify-start year-dropdown-container"
                >
                    <div className="relative inline-block w-full sm:w-auto">
                        <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider ml-1">
                            Academic Year
                        </label>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-label="Select academic year"
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="listbox"
                            className="bg-blue-900 text-white px-8 py-4 rounded-full flex items-center justify-between space-x-4 hover:bg-blue-800 transition-all duration-200 w-full sm:min-w-[280px] shadow-lg hover:shadow-xl text-lg group"
                        >
                            <span className="font-semibold">{selectedYear || 'Select Year'} Executives</span>
                            <ChevronDown
                                className={`w-5 h-5 text-white/80 group-hover:text-white transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && data && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 w-full min-w-[280px] overflow-hidden ring-1 ring-black/5"
                                    role="listbox"
                                >
                                    {data.years.map((year) => (
                                        <button
                                            key={year.name}
                                            onClick={() => handleYearSelect(year.name)}
                                            role="option"
                                            aria-selected={selectedYear === year.name}
                                            className={`w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors duration-200 text-base flex justify-between items-center ${selectedYear === year.name ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-gray-700'
                                                }`}
                                        >
                                            <span>{year.name}</span>
                                            {year.is_current && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                                                    Current
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-20 bg-red-50 rounded-3xl">
                        <p className="text-red-600 text-xl mb-6 font-medium">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-100 text-red-700 px-6 py-2 rounded-full hover:bg-red-200 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Executive Layout */}
                {!isLoading && !error && currentYearData && currentYearData.executives.length > 0 && (
                    <motion.div
                        key={selectedYear}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-16"
                    >
                        {/* President */}
                        <div className="flex justify-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                whileHover={{
                                    y: -10,
                                    transition: { duration: 0.3 }
                                }}
                                onClick={() => setSelectedExecutive(currentYearData.executives[0])}
                                className="bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer 
                                           hover:shadow-2xl transition-all duration-300 border border-gray-100
                                           w-full max-w-md group"
                            >
                                {/* Image container - gray bg, full bleed image */}
                                <div className="aspect-[4/5] bg-gray-100 relative">
                                    {!loadedImages.has(currentYearData.executives[0].id) && <LoadingPlaceholder />}
                                    <Image
                                        src={currentYearData.executives[0].image}
                                        alt={`${currentYearData.executives[0].name} - ${currentYearData.executives[0].display_position}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 448px"
                                        className={`object-cover object-top transition-all duration-700 group-hover:scale-[1.02] ${loadedImages.has(currentYearData.executives[0].id) ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        onLoad={() => handleImageLoad(currentYearData.executives[0].id)}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x500/e5e7eb/6b7280?text=President';
                                        }}
                                        priority
                                    />
                                </div>
                                <div className="p-8 text-center bg-white relative">
                                    <h3 className="font-bold text-2xl text-gray-900 mb-2">
                                        {currentYearData.executives[0].name}
                                    </h3>
                                    <p className="text-blue-600 text-lg font-medium mb-4">
                                        {currentYearData.executives[0].display_position}
                                    </p>

                                    {renderSocialLinks(currentYearData.executives[0])}
                                </div>
                            </motion.div>
                        </div>

                        {/* Other executives */}
                        {currentYearData.executives.length > 1 && (
                            <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
                                {currentYearData.executives.slice(1).map((executive, index) => (
                                    <motion.div
                                        key={`${selectedYear}-${executive.id}`}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: (index + 1) * 0.08 }}
                                        whileHover={{
                                            y: -8,
                                            transition: { duration: 0.2 }
                                        }}
                                        onClick={() => setSelectedExecutive(executive)}
                                        className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer 
                                                   hover:shadow-xl transition-all duration-300 border border-gray-100
                                                   w-full sm:w-[calc(50%-20px)] lg:w-[calc(33.333%-32px)] max-w-sm group"
                                    >
                                        {/* Image container - gray bg, full bleed image */}
                                        <div className="aspect-[4/5] bg-gray-100 relative">
                                            {!loadedImages.has(executive.id) && <LoadingPlaceholder />}
                                            <Image
                                                src={executive.image}
                                                alt={`${executive.name} - ${executive.display_position}`}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className={`object-cover object-top transition-all duration-500 group-hover:scale-[1.02] ${loadedImages.has(executive.id) ? 'opacity-100' : 'opacity-0'
                                                    }`}
                                                onLoad={() => handleImageLoad(executive.id)}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x500/e5e7eb/6b7280?text=Executive';
                                                }}
                                            />
                                        </div>
                                        <div className="p-6 text-center bg-white">
                                            <h3 className="font-bold text-xl text-gray-900 mb-1">
                                                {executive.name}
                                            </h3>
                                            <p className="text-blue-600 text-base font-medium mb-3">
                                                {executive.display_position}
                                            </p>

                                            {renderSocialLinks(executive)}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Empty State */}
                {!isLoading && !error && currentYearData?.executives.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-xl font-medium">No executives found for this academic year.</p>
                    </div>
                )}
            </div>

            {/* LIGHTBOX MODAL */}
            <AnimatePresence>
                {selectedExecutive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md"
                        onClick={() => setSelectedExecutive(null)}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedExecutive(null)}
                            className="fixed top-6 right-6 z-[60] bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-all shadow-xl hover:shadow-2xl focus:outline-none ring-1 ring-white/20 backdrop-blur-sm"
                            aria-label="Close"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3, type: "spring", damping: 25 }}
                            className="relative w-full max-w-5xl flex flex-col items-center justify-center outline-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Large Image - Floating */}
                            <div className="relative w-full h-[50vh] md:h-[65vh] mb-8 flex items-center justify-center">
                                <Image
                                    src={selectedExecutive.image}
                                    alt={`${selectedExecutive.name}`}
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                    priority
                                    sizes="100vw"
                                />
                            </div>

                            {/* Info - White Text */}
                            <div className="text-center z-10 space-y-2">
                                <h2 className="font-bold text-3xl md:text-5xl text-white tracking-tight drop-shadow-lg">
                                    {selectedExecutive.name}
                                </h2>
                                <p className="text-blue-400 text-xl md:text-2xl font-medium tracking-wide drop-shadow-md">
                                    {selectedExecutive.display_position}
                                </p>

                                {renderSocialLinks(selectedExecutive, 28, true)}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExecutivePage;
