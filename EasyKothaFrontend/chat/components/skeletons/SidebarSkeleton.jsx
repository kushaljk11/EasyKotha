const SidebarSkeleton = () => {
  return (
    <div className="h-full w-full p-4 bg-white">
      <div className="h-10 w-40 rounded-xl bg-slate-200/70 animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 rounded-full bg-slate-200/70 animate-pulse" />
            <div className="flex-1 h-8 rounded-lg bg-slate-200/70 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarSkeleton;
