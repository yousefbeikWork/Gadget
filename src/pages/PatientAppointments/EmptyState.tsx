export function EmptyState({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center animate-in fade-in">
      <div className="w-16 h-16 bg-white text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-gray-700 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}