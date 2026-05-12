'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import FlightMap from '@/components/FlightMap';
import Navbar from '@/components/Navbar';
import IntakeForm from '@/components/IntakeForm';
import { motion } from 'framer-motion';
import { Activity, Package, CheckCircle, Navigation, MapPin, Search } from 'lucide-react';

export default function AdminDashboard() {
  const [luggage, setLuggage] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    arrived: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== "admin") {
          window.location.href = "/dashboard";
          return;
        }
      }

      const lugRes = await api.get('/admin/luggage');
      const trackingRes = await api.get('/admin/luggage-tracking');
      const statsRes = await api.get('/admin/stats');

      setLuggage(lugRes.data);
      setStats(statsRes.data);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (id: string) => {
    try {
      const res = await api.get(`/admin/luggage/${id}/events`);
      setEvents(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const sendEvent = async (type: string) => {
    if (!selectedId) {
      alert('Enter luggage id');
      return;
    }
    try {
      // Defaulting location to 'DEL' for simulation, could add an input field
      await api.post(`/admin/luggage/${selectedId}/events`, {
        event_type: type,
        location: 'DEL' 
      });
      loadData();
      loadEvents(selectedId);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 mt-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Operations Center
            </h1>
            <p className="text-slate-500 mt-2 font-medium">System-wide baggage tracking & logistics</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 text-sm font-medium text-emerald-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            System Online
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Bags Tracked" value={stats.total} icon={<Package className="text-blue-500 w-8 h-8" />} />
          <StatCard title="In Transit" value={stats.inTransit} icon={<Navigation className="text-sky-500 w-8 h-8" />} />
          <StatCard title="Arrived/Delivered" value={stats.arrived} icon={<CheckCircle className="text-emerald-500 w-8 h-8" />} />
        </div>

        {/* MAP */}
        <div className="mb-10">
          <FlightMap />
        </div>

        {/* INTAKE & SCAN CONSOLE (Top row of operations) */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <IntakeForm onSuccess={loadData} />

          {/* SCANNER */}
          <div className="glass-card rounded-[32px] p-8 h-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="text-sky-500" /> Scan Console
            </h2>
            
            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Selected Bag ID</label>
              <input
                placeholder="Select a bag from the table below"
                className="w-full bg-white border border-slate-200 p-4 rounded-xl font-mono text-lg outline-none focus:border-blue-500 transition-colors"
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button text="Check In" onClick={() => sendEvent('CHECKED_IN')} color="from-sky-500 to-blue-600" disabled={!selectedId || events.some(e => e.event_type === 'CHECKED_IN')} />
              <Button text="Security" onClick={() => sendEvent('SECURITY_SCAN')} color="from-blue-500 to-indigo-600" disabled={!selectedId || events.some(e => e.event_type === 'SECURITY_SCAN')} />
              <Button text="Loaded" onClick={() => sendEvent('LOADED_ON_FLIGHT')} color="from-indigo-500 to-purple-600" disabled={!selectedId || events.some(e => e.event_type === 'LOADED_ON_FLIGHT')} />
              <Button text="Transfer" onClick={() => sendEvent('TRANSFERRED')} color="from-purple-500 to-fuchsia-600" disabled={!selectedId || events.some(e => e.event_type === 'TRANSFERRED')} />
              <Button text="Arrived" onClick={() => sendEvent('ARRIVED')} color="from-fuchsia-500 to-pink-600" disabled={!selectedId || events.some(e => e.event_type === 'ARRIVED')} />
              <Button text="Delivered" onClick={() => sendEvent('DELIVERED')} color="from-emerald-500 to-teal-600" disabled={!selectedId || events.some(e => e.event_type === 'DELIVERED')} />
            </div>
          </div>
        </div>

        {/* TABLE & FEED (Bottom row of operations) */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LUGGAGE TABLE */}
          <div className="lg:col-span-2 glass-card rounded-[32px] p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Live Monitor</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search ID..." 
                  className="pl-9 pr-4 py-2 bg-white/50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-slate-400 border-b border-slate-200">
                    <th className="pb-3 font-medium">Bag ID</th>
                    <th className="pb-3 font-medium">Ticket</th>
                    <th className="pb-3 font-medium">Weight</th>
                    <th className="pb-3 font-medium">Size</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {luggage.map((lug: any) => (
                    <tr 
                      key={lug.id} 
                      onClick={() => {
                        setSelectedId(lug.id);
                        loadEvents(lug.id);
                      }}
                      className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${selectedId === lug.id ? 'bg-blue-50/80' : ''}`}
                    >
                      <td className="py-4 font-semibold text-slate-700">#{lug.id}</td>
                      <td className="py-4 text-slate-500">{lug.ticket_id}</td>
                      <td className="py-4 text-slate-500">{lug.weight} kg</td>
                      <td className="py-4 text-slate-500">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          {lug.size}
                        </span>
                      </td>
                      <td className="py-4">
                        <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FEED */}
          <div className="glass-card rounded-[32px] p-8 h-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Live Feed {selectedId && <span className="text-sm font-normal text-slate-400 ml-2">Bag #{selectedId}</span>}</h2>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {events.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Select a bag to view its timeline</p>
              ) : (
                events.slice().reverse().map((e: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-700 text-sm">{e.event_type.replace(/_/g, ' ')}</p>
                      <p className="text-xs font-medium text-blue-600">{new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {e.location}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="glass-card rounded-[32px] p-8 flex items-center justify-between">
      <div>
        <p className="text-slate-500 font-medium mb-1">{title}</p>
        <h2 className="text-4xl font-bold text-slate-800">{value}</h2>
      </div>
      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

function Button({ text, onClick, color, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-xl text-white font-medium transition-all ${disabled ? 'bg-slate-300 cursor-not-allowed opacity-50' : `shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-br ${color}`}`}
    >
      {text}
    </button>
  );
}