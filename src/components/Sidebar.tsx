import { NavLink, Link } from "react-router-dom";
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
  Compass,
  Stamp,
  User,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

const menuItems = [
  { key: "home", path: "/", icon: Home },
  { key: "doctors", path: "/doctors", icon: Stethoscope },
  { key: "patients", path: "/patients", icon: User },
  { key: "hospitals", path: "/hospitals", icon: Building2 },
  { key: "clinics", path: "/clinics", icon: Hospital },
  { key: "airplanes", path: "/airplanes", icon: Plane },
  { key: "travel", path: "/travel", icon: Map },
  { key: "leader", path: "/leader", icon: Compass },
  { key: "visa", path: "/visa", icon: Stamp },
  { key: "guides", path: "/guides", icon: List },
  { key: "search", path: "/search", icon: Search },
];

// تعریف پراپ‌های جدید برای کنترل منو
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* بک‌گراند تاریک برای موبایل وقتی منو باز است */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gadget-dark/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* کانتینر اصلی سایدبار */}
      <aside
        className={`fixed inset-y-0 rtl:right-0 ltr:left-0 z-50 w-64 bg-white md:rounded-2xl flex flex-col shrink-0 shadow-2xl md:shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:rtl:translate-x-0 md:ltr:translate-x-0 ${
          isOpen
            ? "translate-x-0"
            : "rtl:translate-x-full ltr:-translate-x-full"
        }`}
      >
        {/* دکمه بستن منو (فقط در موبایل) */}
        <div className="flex items-center justify-between p-5 md:hidden border-b border-gray-100">
          <span className="font-bold text-gadget-dark">منوی کاربری</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* بخش لیست لینک‌ها */}
        <div className="flex-1 py-6 md:py-8 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-2 md:space-y-6">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={onClose} // با کلیک روی هر لینک، منو در موبایل خودکار بسته می‌شود
                  className="flex items-center gap-4 px-6 py-2 md:py-0 cursor-pointer group transition-all duration-300 md:hover:scale-105 rtl:origin-right ltr:origin-left"
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`p-1 transition-colors ${isActive ? "text-gadget-dark" : "text-gray-400 group-hover:text-gadget-dark"}`}
                      >
                        <Icon strokeWidth={1.5} size={26} />
                      </div>
                      <div>
                        <h3
                          className={`text-sm transition-colors ${isActive ? "font-bold text-gadget-dark" : "font-medium text-gray-600 group-hover:text-gadget-dark"}`}
                        >
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

        {/* بخش پایین سایدبار (احراز هویت + تغییر زبان) */}
        <div className="mt-auto shrink-0 border-t border-gray-100 bg-gray-50/50 md:rounded-2xl">
          {/* دکمه‌های ورود و ثبت‌نام */}
          <div className="p-5 flex flex-col gap-3">
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-100 text-gadget-dark py-2.5 rounded-xl text-sm font-bold transition-colors border border-gray-200"
            >
              <LogIn size={18} />
              <span>ورود به سیستم</span>
            </Link>

            <Link
              to="/register"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              <UserPlus size={18} />
              <span>ثبت‌نام جدید</span>
            </Link>
          </div>

          {/* بخش زبان در پایین‌ترین قسمت */}
          <div className="px-6 pb-6 pt-2 flex justify-center w-full">
            <LanguageSwitcher />
          </div>
        </div>
      </aside>
    </>
  );
}
