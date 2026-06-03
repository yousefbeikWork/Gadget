import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  return (
    // همان ساختار شناور و پس‌زمینه تیره که در App.tsx داشتیم
    <div className="flex h-screen w-full font-sans text-gray-800 bg-gadget-dark p-4 gap-6">
      <Sidebar />
      {/* کامپوننت Outlet به ریکت روتر می‌گوید که محتوای صفحات داخلی (مثل کلینیک، هوم و...) را اینجا رندر کن */}
      <Outlet />
    </div>
  );
}