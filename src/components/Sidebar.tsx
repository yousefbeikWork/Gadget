import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  Stethoscope,
  Building2,
  Hospital,
  Plane,
  Map,
  List,
  Search,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

// اینجا فقط کلیدهای انگلیسی (key) رو می‌ذاریم تا متن‌ها مستقیماً از فایل ترجمه خوانده شوند
const menuItems = [
  { key: "home", path: "/", icon: Home },
  { key: "doctors", path: "/doctors", icon: Stethoscope },
  { key: "hospitals", path: "/hospitals", icon: Building2 },
  { key: "clinics", path: "/clinics", icon: Hospital },
  { key: "airplanes", path: "/airplanes", icon: Plane },
  { key: "travel", path: "/travel", icon: Map },
  { key: "guides", path: "/guides", icon: List },
  { key: "search", path: "/search", icon: Search },
];

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="w-64 h-full bg-white rounded-2xl flex flex-col shrink-0 shadow-lg overflow-hidden relative">
      {/* بخش منوها */}
      <div className="flex-1 py-8 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                // کلاس‌های rtl و ltr اضافه شدند تا انیمیشن در هر دو زبان درست کار کند
                className="flex items-center gap-4 px-6 cursor-pointer group transition-all duration-300 hover:scale-105 rtl:origin-right ltr:origin-left"
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1 transition-colors ${isActive ? "text-gadget-dark" : "text-gray-400 group-hover:text-gadget-dark"}`}
                    >
                      <Icon strokeWidth={1.5} size={28} />
                    </div>
                    <div>
                      <h3
                        className={`text-sm transition-colors ${isActive ? "font-bold text-gadget-dark" : "font-medium text-gray-600 group-hover:text-gadget-dark"}`}
                      >
                        {/* فراخوانی متن دقیقاً از روی دیکشنری فایل i18n.ts */}
                        {t(item.key)}
                      </h3>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </ul>
      </div>

      {/* بخش ثابت پایین سایدبار برای دکمه تغییر زبان */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/50 mt-auto">
        <div className="flex justify-center w-full">
          <LanguageSwitcher />
        </div>
      </div>
    </aside>
  );
}
