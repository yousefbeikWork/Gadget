import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full font-sans text-gray-800 bg-gadget-dark p-0 md:p-4 md:gap-6 relative overflow-hidden">
      
      {/* هدر مخصوص موبایل */}
      <div className="md:hidden absolute top-0 left-0 w-full h-16 bg-gadget-dark z-20 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="text-white p-1 cursor-pointer hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={28} />
          </button>
          <span className="text-white font-bold text-lg">پلتفرم سلامت</span>
        </div>
      </div>

      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* یک نگهدارنده ساده و منعطف که دسکتاپ را خراب نکند */}
      <main className="flex-1 flex overflow-hidden pt-16 md:pt-0">
        <Outlet />
      </main>

    </div>
  );
}