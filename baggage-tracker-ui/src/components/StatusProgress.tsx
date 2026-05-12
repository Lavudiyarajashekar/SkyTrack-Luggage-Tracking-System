import { Check, Clock, Package, Shield, PlaneTakeoff, RefreshCcw, MapPin, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 'CHECKED_IN', label: 'Checked In', icon: Package },
  { id: 'SECURITY_SCAN', label: 'Security', icon: Shield },
  { id: 'LOADED_ON_FLIGHT', label: 'Loaded', icon: PlaneTakeoff },
  { id: 'TRANSFERRED', label: 'Transfer', icon: RefreshCcw },
  { id: 'ARRIVED', label: 'Arrived', icon: MapPin },
  { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
];

export default function StatusProgress({ events }: { events: any[] }) {
  const completed = events.map(e => e.event_type);
  const currentStepIndex = [...steps].reverse().findIndex(s => completed.includes(s.id));
  const activeIndex = currentStepIndex >= 0 ? steps.length - 1 - currentStepIndex : -1;

  return (
    <div className="relative">
      {/* Background Line */}
      <div className="absolute top-8 left-[10%] right-[10%] h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-1000 ease-out"
          style={{ width: `${activeIndex >= 0 ? (activeIndex / (steps.length - 1)) * 100 : 0}%` }}
        />
      </div>

      <div className="grid grid-cols-6 relative z-10 gap-2">
        {steps.map((step, idx) => {
          const isCompleted = completed.includes(step.id);
          const isActive = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                } ${isActive ? 'ring-4 ring-blue-100 scale-110' : ''}`}
              >
                {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
              </div>
              <p className={`text-sm font-semibold text-center ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}