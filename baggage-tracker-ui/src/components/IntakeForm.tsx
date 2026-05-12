'use client';

import { useState, useEffect } from 'react';
import { Package, Hash, Weight, Ruler, User } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function IntakeForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [pendingTickets, setPendingTickets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    ticket_id: '',
    weight: '',
    size: 'Medium'
  });

  const fetchPending = async () => {
    try {
      const res = await api.get('/admin/pending-tickets');
      setPendingTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/admin/luggage', {
        ticket_id: parseInt(formData.ticket_id),
        weight: parseInt(formData.weight),
        size: formData.size
      });
      setFormData({ ticket_id: '', weight: '', size: 'Medium' });
      fetchPending();
      onSuccess();
      alert('Luggage successfully registered and checked in!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to register luggage. Make sure the Ticket ID is valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-[32px] p-8 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Package className="text-sky-500" /> New Luggage Intake
      </h2>

      {/* Pending Drop-offs Queue */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Pending Drop-offs</label>
        <div className="bg-white/50 border border-slate-200 rounded-xl overflow-hidden max-h-[120px] overflow-y-auto">
          {pendingTickets.length === 0 ? (
            <p className="p-4 text-sm text-slate-400 text-center italic">No passengers waiting.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendingTickets.map(t => (
                <li 
                  key={t.ticket_number}
                  onClick={() => setFormData({ ...formData, ticket_id: t.ticket_number.toString() })}
                  className="p-3 hover:bg-sky-50 cursor-pointer transition-colors flex justify-between items-center group"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <User className="w-4 h-4 text-sky-500" /> {t.customer_name}
                  </div>
                  <div className="text-xs text-slate-400 group-hover:text-sky-600 font-mono">
                    TKT#{t.ticket_number} ({t.origin}→{t.destination})
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-end">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Ticket Number</label>
          <div className="relative">
            <Hash className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              required
              type="number"
              min="1"
              placeholder="e.g. 1"
              className="w-full pl-12 p-3 rounded-xl bg-white/50 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              value={formData.ticket_id}
              onChange={e => setFormData({ ...formData, ticket_id: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Weight (kg)</label>
            <div className="relative">
              <Weight className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                required
                type="number"
                min="1"
                placeholder="e.g. 23"
                className="w-full pl-12 p-3 rounded-xl bg-white/50 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Size</label>
            <div className="relative">
              <Ruler className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <select
                className="w-full pl-12 p-3 rounded-xl bg-white/50 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500 transition-all appearance-none"
                value={formData.size}
                onChange={e => setFormData({ ...formData, size: e.target.value })}
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full p-4 mt-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-teal-500/30 hover:scale-[1.02] transition-transform"
        >
          {loading ? 'Processing...' : 'Register Bag'}
        </button>
      </form>
    </div>
  );
}
