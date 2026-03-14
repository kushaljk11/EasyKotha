const MessageSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <div className="max-w-[70%] rounded-2xl bg-slate-200/70 h-14 w-56 animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
