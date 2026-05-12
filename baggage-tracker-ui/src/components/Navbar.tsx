'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plane, User, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{username: string, role: string} | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.sub, role: payload.role });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (pathname === '/login' || pathname === '/signup' || pathname === '/') return null;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/40 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Plane className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-800">SkyTrack</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Airline Ops</p>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 border border-white/60 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-800 leading-tight">{user.username}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}