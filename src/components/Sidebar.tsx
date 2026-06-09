import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
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
  LogOut,
  Calendar,
  CalendarDays,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

// اضافه کردن ویژگی hideFor به منوها
const menuItems = [
  { key: "home", path: "/", icon: Home },
  {
    key: "schedule",
    path: "/schedule",
    icon: Calendar,
    hideFor: ["Patient", "guest", "Hospital"],
  },
  {
    key: "myAppointments",
    path: "/my-appointments",
    icon: CalendarDays,
    hideFor: ["Doctor", "guest", "Hospital"],
  },
  // لیست پزشکان: برای دکتری که لاگین کرده مخفی می‌شود
  { key: "doctors", path: "/doctors", icon: Stethoscope, hideFor: ["Doctor"] },

  // لیست بیماران: برای بیمار (و احتمالاً مهمان که لاگین نکرده) مخفی می‌شود
  // اگر می‌خواهی کسی که لاگین نکرده هم لیست بیماران را نبیند، کلمه 'guest' را هم به آرایه اضافه می‌کنیم
  {
    key: "patients",
    path: "/patients",
    icon: User,
    hideFor: ["Patient", "guest"],
  },

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
  const { isLoggedIn, userRole, logout, userProfile } = useAuth();
  // تعیین نقش فعلی (اگر لاگین نکرده بود، 'guest' در نظر می‌گیریم)
  const currentRole = isLoggedIn ? userRole : "guest";

  // فیلتر کردن منوها بر اساس نقش
  const filteredMenuItems = menuItems.filter((item) => {
    // اگر ویژگی hideFor وجود داشت و نقش کاربر داخل آن آرایه بود، این آیتم را حذف کن (رندر نکن)
    if (item.hideFor && item.hideFor.includes(currentRole as string)) {
      return false;
    }
    return true; // در غیر این صورت نمایش بده
  });
  const getRoleName = (role: string | null) => {
    switch (role) {
      case "Doctor":
        return "پزشک متخصص";
      case "Patient":
        return "بیمار";
      case "Hospital":
        return "مرکز درمانی";
      default:
        return "کاربر سامانه";
    }
  };
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
            {filteredMenuItems.map((item, index) => {
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
        {/* بخش پایین سایدبار (احراز هویت + تغییر زبان) */}
        <div className="mt-auto shrink-0 border-t border-gray-100 bg-gray-50/50 md:rounded-2xl">
          <div className="p-5 flex flex-col gap-3">
            {/* اگر کاربر لاگین بود، کارت پروفایل را نشان بده */}
            {/* اگر کاربر لاگین بود، کارت پروفایل هوشمند را نشان بده */}
            {isLoggedIn ? (
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
                <Link 
                  to="/profile"
                  onClick={onClose}
                  className="flex items-center gap-3 mb-2 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                  title="مشاهده و ویرایش پروفایل"
                >
                  {/* دایره آواتار شامل حرف اول نام کاربر */}
                  <div className="w-10 h-10 bg-gadget-light/10 text-gadget-light rounded-lg flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                    {userProfile?.firstName ? (
                      userProfile.firstName[0]
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    {/* نمایش نام و نام خانوادگی واقعی از API */}
                    <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-gadget-light transition-colors">
                      {userProfile
                        ? `${userProfile.firstName} ${userProfile.lastName}`
                        : "در حال بارگذاری..."}
                    </h4>
                    {/* نمایش تخصص برای پزشکان، یا نام نقش برای بقیه */}
                    <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                      {userRole === "Doctor" && userProfile?.Expertise
                        ? `متخصص ${userProfile.Expertise}`
                        : getRoleName(userRole)}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 w-full text-red-500 hover:bg-red-50 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>خروج از سیستم</span>
                </button>
              </div>
            ) : (
              /* اگر کاربر لاگین نبود، همان دکمه‌های ورود و ثبت‌نام را نشان بده */
              <>
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
              </>
            )}
          </div>

          <div className="px-6 pb-6 pt-2 flex justify-center w-full">
            <LanguageSwitcher />
          </div>
        </div>
      </aside>
    </>
  );
}
