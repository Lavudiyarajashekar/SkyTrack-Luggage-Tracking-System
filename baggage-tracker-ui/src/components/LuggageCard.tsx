export default function LuggageCard({
  title,
  value,
  icon
}: any) {
  return (
    <div className="glass-card rounded-[32px] p-8 hover:scale-105 transition-all duration-300 group cursor-default relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-200/40 rounded-full blur-3xl group-hover:bg-blue-300/40 transition-colors" />
      <div className="text-5xl mb-4 relative z-10 bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center">
        {icon}
      </div>
      <p className="text-slate-500 font-medium relative z-10">
        {title}
      </p>
      <h3 className="text-3xl font-bold mt-2 text-slate-800 relative z-10">
        {value}
      </h3>
    </div>
  )
}