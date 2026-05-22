export default function Header() {
  return (
    <div className="px-4 pt-6 pb-2 flex items-center gap-3 select-none">
      <div>
        <h1 className="text-xl font-black tracking-tight leading-none">
          <span className="text-white">IS</span>
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">Youth</span>
        </h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium mt-0.5">Worship</p>
      </div>
    </div>
  );
}
