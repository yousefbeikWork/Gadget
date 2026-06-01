import { NavLink } from 'react-router-dom';
import { Home, Stethoscope, Building2, Hospital, Plane, Map, List, Search } from 'lucide-react';

const menuItems = [
  { title: 'خانه', path: '/', subtitle: '', icon: Home },
  { title: 'پزشک', path: '/doctors', subtitle: '', icon: Stethoscope },
  { title: 'بیمارستان', path: '/hospitals', subtitle: '', icon: Building2 },
  { title: 'کلینیک ', path: '/clinics', subtitle: '', icon: Hospital },
  { title: 'هواپیما', path: '/airplanes', subtitle: '', icon: Plane },
  { title: 'سفر', path: '/travel', subtitle: '', icon: Map },
  { title: 'راهنما', path: '/guides', subtitle: '', icon: List },
  { title: 'جست و جو', path: '/search', subtitle: '', icon: Search },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-full bg-white border-l-[6px] border-[#29b6b0] flex flex-col overflow-y-auto shrink-0 shadow-sm">
      <div className="flex-1 py-8">
        <ul className="space-y-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={index} 
                to={item.path}
                className="flex items-center gap-4 px-6 cursor-pointer group"
              >
                {/* این تابع چک می‌کند که آیا کاربر در این مسیر قرار دارد یا خیر */}
                {({ isActive }) => (
                  <>
                    <div className={`p-1 transition-colors ${isActive ? 'text-[#29b6b0]' : 'text-gray-600 group-hover:text-[#29b6b0]'}`}>
                      <Icon strokeWidth={1.5} size={28} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">{item.title}</h3>
                      <p className="text-[10px] text-gray-400">{item.subtitle}</p>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}