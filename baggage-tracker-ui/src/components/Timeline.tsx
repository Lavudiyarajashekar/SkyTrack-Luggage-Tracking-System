'use client';
import { motion } from 'framer-motion';

export default function Timeline({ events }: { events: any[] }) {
  if (!events || events.length === 0) {
    return <div className="text-slate-500 italic">No tracking events available yet.</div>;
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-sky-300 before:to-blue-600">
      {events.map((event, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          key={index}
          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
        >
          {/* Timeline Dot */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          
          {/* Card */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass-card p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800 text-lg">
                {event.event_type.replace(/_/g, ' ')}
              </h3>
              <time className="text-sm font-medium text-sky-600">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
            
            <p className="text-slate-600 font-medium mb-2">📍 {event.location}</p>
            
            {event.notes && (
              <p className="text-sm text-slate-500 bg-white/50 p-2 rounded-lg border border-slate-100">
                {event.notes}
              </p>
            )}
            
            <p className="text-xs text-slate-400 mt-2">
              {new Date(event.timestamp).toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}