'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, User, Lock, Mail, MapPin, Phone, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'customer',
    address: '',
    mobile_number: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/auth/', formData);
      alert('Account created successfully! Please login.');
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 flex items-center justify-center p-6">
      {/* atmospheric sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-blue-50 to-slate-100" />
      
      {/* sun glow */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-white/70 blur-3xl" />

      {/* -------- HUGE ROTATING EARTH -------- */}
      <motion.div
        animate={{ x:[0,-70,0], y:[0,-30,0] }}
        transition={{ repeat:Infinity, duration:40, ease:'linear' }}
        className="absolute bottom-[-700px] left-[-350px] w-[1900px] h-[1900px] rounded-full overflow-hidden shadow-[0_-40px_120px_rgba(0,0,0,.2)]"
      >
        <motion.img
          src="/images/earth.jpg"
          alt=""
          animate={{ rotate:[0,-8] }}
          transition={{ repeat:Infinity, duration:80, ease:'linear' }}
          className="absolute inset-0 w-full h-full object-cover scale-125"
        />
        <motion.img
          src="/images/clouds.png"
          alt=""
          animate={{ rotate:[0,12] }}
          transition={{ repeat:Infinity, duration:120, ease:'linear' }}
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110"
        />
        <motion.img
          src="/images/clouds.png"
          alt=""
          animate={{ rotate:[0,-16] }}
          transition={{ repeat:Infinity, duration:160, ease:'linear' }}
          className="absolute inset-0 w-full h-full object-cover opacity-30 scale-125"
        />
        <div className="absolute inset-0 rounded-full border-[14px] border-white/60" />
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_100px_rgba(255,255,255,1)]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 to-transparent mix-blend-overlay" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="backdrop-blur-3xl bg-white/30 border border-white/60 rounded-[36px] p-10 shadow-[0_20px_80px_rgba(0,0,0,.18)]">
          <div className="text-center mb-10">
            <div className="mx-auto mb-8 w-24 h-24 rounded-3xl bg-white/45 backdrop-blur-xl flex items-center justify-center shadow-xl">
              <Plane size={42} className="text-slate-700" />
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-3">Create Account</h2>
            <p className="text-slate-500">Join SkyTrack Airline Operations</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  required
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                  className="w-full pl-12 p-4 rounded-xl bg-white/50 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email Address"
                  className="w-full pl-12 p-4 rounded-xl bg-white/50 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                  className="w-full pl-12 p-4 rounded-xl bg-white/50 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  value={formData.mobile_number}
                  onChange={e => setFormData({ ...formData, mobile_number: e.target.value })}
                  placeholder="Phone Number"
                  className="w-full pl-12 p-4 rounded-xl bg-white/50 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
              <input
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Address"
                className="w-full pl-12 p-4 rounded-xl bg-white/50 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            <div className="relative">
              <Briefcase className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full pl-12 p-4 rounded-xl bg-white/50 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500 transition-all appearance-none"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full p-4 mt-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-slate-600 via-cyan-600 to-sky-500 shadow-xl"
            >
              {loading ? 'Creating...' : 'Sign Up'}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
