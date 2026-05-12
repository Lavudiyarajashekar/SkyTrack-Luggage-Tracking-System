'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, MapPin, Briefcase, Utensils, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function BookingForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    class_type: 'Economy',
    meal_included: 'No'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/customers/tickets', formData);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000); // Wait 2 seconds so user can read the success message
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to book flight. Make sure airport codes are valid (e.g., DEL, BOM).');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[36px] p-10 max-w-2xl mx-auto shadow-xl relative overflow-hidden"
    >
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <CheckCircle className="w-24 h-24 text-emerald-500 mb-6 mx-auto" />
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Ticket Created!</h2>
            <p className="text-lg text-slate-600">Your ticket has been generated. You can now proceed to drop off your luggage.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg mx-auto mb-4">
          <Plane className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Book Your Flight</h2>
        <p className="text-slate-500 mt-2">Enter your travel details to generate a ticket</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="text-sm font-semibold text-slate-500 mb-1 block">Origin Airport</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                required
                placeholder="e.g. DEL"
                maxLength={3}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none uppercase"
                value={formData.origin}
                onChange={e => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-sm font-semibold text-slate-500 mb-1 block">Destination Airport</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                required
                placeholder="e.g. BOM"
                maxLength={3}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none uppercase"
                value={formData.destination}
                onChange={e => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="text-sm font-semibold text-slate-500 mb-1 block">Cabin Class</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <select
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none appearance-none"
                value={formData.class_type}
                onChange={e => setFormData({ ...formData, class_type: e.target.value })}
              >
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
                <option value="First Class">First Class</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="text-sm font-semibold text-slate-500 mb-1 block">Meal Included</label>
            <div className="relative">
              <Utensils className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <select
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none appearance-none"
                value={formData.meal_included}
                onChange={e => setFormData({ ...formData, meal_included: e.target.value })}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full py-4 mt-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {loading ? 'Booking...' : 'Book Flight'}
        </button>
      </form>
    </motion.div>
  );
}
