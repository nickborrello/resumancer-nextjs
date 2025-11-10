'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    pathname: string;
    onClick: () => void;
}

function NavLink({ href, children, pathname, onClick }: NavLinkProps) {
    const isActive = pathname === href;
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive
                    ? 'text-amethyst-400 bg-amethyst-500/10'
                    : 'text-gray-300 hover:text-amethyst-400 hover:bg-amethyst-500/5'
            }`}
        >
            {children}
            {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-amethyst-500 to-transparent rounded-full"></span>
            )}
        </Link>
    );
}

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const isAuthenticated = status === "authenticated";
    const credits = session?.user?.credits ?? 0;

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
        setMobileMenuOpen(false);
    };

    // Handle scroll to show/hide navbar
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show navbar when scrolling up or at the top
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            }
            // Hide navbar when scrolling down (and past 80px)
            else if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setIsVisible(false);
                setMobileMenuOpen(false); // Close mobile menu when hiding
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Helper to get display name from session
    const getDisplayName = () => {
        if (session?.user?.name) {
            return session.user.name.split(' ')[0]; // First name only
        }
        return session?.user?.email?.split('@')[0] || 'User';
    };

    const getAvatarLetter = () => {
        if (session?.user?.name) return session.user.name[0]?.toUpperCase() ?? 'U';
        if (session?.user?.email) return session.user.email[0]?.toUpperCase() ?? 'U';
        return 'U';
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-amethyst-900/30 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="text-2xl font-bold bg-gradient-to-r from-amethyst-400 via-amethyst-500 to-amethyst-600 bg-clip-text text-transparent hover:from-amethyst-300 hover:via-amethyst-400 hover:to-amethyst-500 transition-all duration-300"
                    >
                        Resumancer
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-2">
                        {isAuthenticated && (
                            <>
                                <NavLink href="/profile" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>Profile</NavLink>
                                <NavLink href="/builder" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>Resume Builder</NavLink>
                                <NavLink href="/resumes" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>Previous Resumes</NavLink>
                                <Link
                                    href="/credits"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        pathname === '/credits'
                                            ? 'text-amethyst-400 bg-amethyst-500/10'
                                            : 'text-gray-300 hover:text-amethyst-400 hover:bg-amethyst-500/5'
                                    }`}
                                >
                                    <span className="flex items-center justify-center bg-gradient-to-r from-amethyst-500 to-amethyst-600 text-white px-2.5 py-1 rounded-lg text-sm font-bold shadow-lg shadow-amethyst-500/30">
                                        {credits}
                                    </span>
                                    Credits
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Auth Section */}
                    <div className="hidden lg:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-3 px-4 py-2 bg-amethyst-500/5 rounded-lg border border-amethyst-500/10">
                                    {session?.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt={session.user.name || 'User'}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amethyst-500/30">
                                            {getAvatarLetter()}
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-300 font-medium">
                                        {getDisplayName()}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2.5 bg-gradient-to-r from-amethyst-500 to-amethyst-600 hover:from-amethyst-600 hover:to-amethyst-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-amethyst-500/30 hover:shadow-amethyst-500/50 hover:scale-105"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="px-5 py-2.5 bg-gradient-to-r from-amethyst-500 to-amethyst-600 hover:from-amethyst-600 hover:to-amethyst-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-amethyst-500/30 hover:shadow-amethyst-500/50 hover:scale-105"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 text-gray-300 hover:text-amethyst-400 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-amethyst-500/20 mt-4 pt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {isAuthenticated && (
                            <>
                                <NavLink href="/profile" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>Profile</NavLink>
                                <NavLink href="/builder" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>Resume Builder</NavLink>
                                <NavLink href="/resumes" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>Previous Resumes</NavLink>
                                <NavLink href="/credits" pathname={pathname} onClick={() => setMobileMenuOpen(false)}>
                                    <span className="flex items-center gap-2">
                                        <span className="bg-gradient-to-r from-amethyst-500 to-amethyst-600 text-white px-2.5 py-1 rounded-lg text-sm font-bold">
                                            {credits}
                                        </span>
                                        Credits
                                    </span>
                                </NavLink>
                                <div className="pt-4 border-t border-amethyst-500/20 space-y-3">
                                    <div className="flex items-center gap-3 px-4 py-2 bg-amethyst-500/5 rounded-lg">
                                        {session?.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt={getDisplayName() || 'User'}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-white font-bold text-sm">
                                                {getAvatarLetter()}
                                            </div>
                                        )}
                                        <span className="text-sm text-gray-300 font-medium">
                                            {getDisplayName()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-5 py-2.5 bg-gradient-to-r from-amethyst-500 to-amethyst-600 hover:from-amethyst-600 hover:to-amethyst-700 text-white rounded-lg font-semibold transition-all duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                        {!isAuthenticated && (
                            <div className="pt-4 border-t border-amethyst-500/20 space-y-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full px-5 py-2.5 bg-gradient-to-r from-amethyst-500 to-amethyst-600 text-white rounded-lg font-semibold text-center"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
