import { NavLink } from 'react-router-dom';
import { Home, Stethoscope, Building2, Hospital, Plane, Map, List, Search } from 'lucide-react';

const menuItems = [
  { title: 'خانه', path: '/', subtitle: '', icon: Home },
  { title: 'پزشک', path: '/doctors', subtitle: '', icon: Stethoscope },
  { title: 'بیمارستان', path: '/hospitals', subtitle: '', icon: Building2 },
  { title: 'کلینیک', path: '/clinics', subtitle: '', icon: Hospital },
  { title: 'هواپیما', path: '/airplanes', subtitle: '', icon: Plane },
  { title: 'سفر', path: '/travel', subtitle: '', icon: Map },
  { title: 'راهنما', path: '/guides', subtitle: '', icon: List },
  { title: 'جست و جو', path: '/search', subtitle: '', icon: Search },
];

export default function Sidebar() {
  return (
    // سایدبار حالا یک کارت سفید با گوشه‌های گرد است
    <aside className="w-64 h-full bg-white rounded-2xl flex flex-col overflow-y-auto shrink-0 shadow-lg">
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
                {({ isActive }) => (
                  <>
                    {/* رنگ‌ها برای روی پس‌زمینه سفید تنظیم شدند */}
                    <div className={`p-1 transition-colors ${isActive ? 'text-gadget-dark' : 'text-gray-400 group-hover:text-gadget-dark'}`}>
                      <Icon strokeWidth={1.5} size={28} />
                    </div>
                    <div>
                      <h3 className={`text-sm transition-colors ${isActive ? 'font-bold text-gadget-dark' : 'font-medium text-gray-600 group-hover:text-gadget-dark'}`}>
                        {item.title}
                      </h3>
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