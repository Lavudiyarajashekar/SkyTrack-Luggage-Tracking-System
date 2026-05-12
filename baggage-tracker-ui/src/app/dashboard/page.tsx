'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Timeline from '@/components/Timeline';
import StatusProgress from '@/components/StatusProgress';
import LuggageCard from '@/components/LuggageCard';
import FlightMap from '@/components/FlightMap';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Package, MapPin, PlaneTakeoff, RefreshCcw } from 'lucide-react';
import BookingForm from '@/components/BookingForm';

export default function Dashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [bag, setBag] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === "admin") {
          window.location.href = "/admin";
          return;
        }
      }

      const ticketRes = await api.get('/customers/tickets');
      const tickets = ticketRes.data;

      if (!tickets.length) {
        setLoading(false);
        return;
      }

      const ticketId = tickets[0].ticket_number;

      const trackingRes = await api.get(`/customers/luggage-tracking/status/${ticketId}`);
      const tracking = trackingRes.data;

      if (!tracking.luggages || !tracking.luggages.length) {
        throw new Error('No luggage found');
      }

      const lug = tracking.luggages[0];

      setBag({
        id: lug.luggage_id,
        ticket_id: tracking.ticket_id,
        origin: tracking.origin,
        destination: tracking.destination,
        weight: lug.weight,
        size: lug.size,
        status: lug.status
      });

      const eventsRes = await api.get(`/customers/luggage/${lug.luggage_id}/events`);
      setEvents(eventsRes.data);

    } catch (error) {
      console.error('Dashboard load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!bag) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-20 px-6">
          <BookingForm onSuccess={loadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 mt-10">
        
        {/* HERO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[40px] shadow-xl p-12 mb-10 overflow-hidden glass-card"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-600/10" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-800">
                Your Journey
              </h1>
              <p className="text-xl text-slate-500 font-medium">
                Real-time baggage intelligence
              </p>
            </div>

            <div className="px-8 py-4 rounded-3xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_10px_30px_rgba(14,165,233,0.3)] flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="font-bold tracking-wide">
                {events.length ? events[events.length - 1].event_type.replace(/_/g, ' ') : bag.status}
              </span>
            </div>
          </div>

          <div className="mt-12">
            <FlightMap origin={bag.origin} destination={bag.destination} />
          </div>
        </motion.div>

        {/* CARDS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-8 mb-10"
        >
          <LuggageCard
            title="Current Location"
            value={events.length ? events[events.length - 1].location : bag.origin}
            icon={<MapPin className="text-sky-500 w-8 h-8" />}
          />
          <LuggageCard
            title="Destination"
            value={bag.destination || '-'}
            icon={<PlaneTakeoff className="text-blue-500 w-8 h-8" />}
          />
          <LuggageCard
            title="Luggage Weight"
            value={bag.weight ? `${bag.weight} kg` : '-'}
            icon={<Package className="text-indigo-500 w-8 h-8" />}
          />
        </motion.div>

        {/* Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-[36px] shadow-sm p-10 mb-10"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-10">Flight Progress</h2>
          <StatusProgress events={events} />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-[36px] shadow-sm p-10"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <RefreshCcw className="w-6 h-6 text-sky-500" />
              Baggage Details
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <Detail label="Luggage ID" value={`#${bag.id}`} />
              <Detail label="Ticket Number" value={bag.ticket_id} />
              <Detail label="Size Type" value={bag.size} />
              <Detail label="Last Update" value={events.length ? new Date(events[events.length - 1].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'} />
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-[36px] shadow-sm p-10"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Live Feed</h2>
            <Timeline events={events} />
          </motion.div>
        </div>

      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string, value: any }) {
  return (
    <div className="p-5 rounded-3xl bg-white/60 border border-white shadow-sm hover:shadow-md transition-shadow">
      <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value || '-'}</p>
    </div>
  );
}


