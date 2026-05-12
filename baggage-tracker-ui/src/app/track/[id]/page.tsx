'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import Timeline from '@/components/Timeline';
import StatusProgress from '@/components/StatusProgress';
import Navbar from '@/components/Navbar';
import FlightMap from '@/components/FlightMap';
import { motion } from 'framer-motion';

export default function Track() {
  const params = useParams();
  const id = params.id as string;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = () => {
      api.get(`/admin/luggage/${id}/events`)
        .then(r => {
          setEvents(r.data);
          setLoading(false);
        })
        .catch(console.error);
    };

    load(); // initial fetch
    const interval = setInterval(load, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 mt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-slate-800">
            Tracking Bag <span className="text-sky-600">#{id}</span>
          </h1>
          <p className="text-slate-500 mt-2 flex items-center justify-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Live Updates
          </p>
        </motion.div>

        <div className="mb-10">
          <FlightMap />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-[32px] p-10 mb-10 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Flight Progress</h2>
          <StatusProgress events={events} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-[32px] p-10 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Live Feed</h2>
          <Timeline events={events} />
        </motion.div>
      </div>
    </div>
  );
}
