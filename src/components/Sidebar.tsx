import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import api from "../services/api"; // 👈 اضافه شدن ایمپورت api برای دریافت عکس
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
  Users,
  FlaskConical,
  Wrench,
  Loader2 // 👈 اضافه شدن لودر
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

const menuItems = [
  { key: "home", path: "/dashboard", icon: Home, allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"] },
  { key: "schedule", path: "/schedule", icon: Calendar, allowedRoles: ["Doctor", "MedicalCenter"] },
  { key: "myAppointments", path: "/my-appointments", icon: CalendarDays, allowedRoles: ["Patient","Doctor"] },
  { key: "myDoctors", path: "/clinic-doctors", icon: Stethoscope, allowedRoles: ["MedicalCenter"] },
  { key: "patients", path: "/patients", icon: Users, allowedRoles: ["Doctor", "MedicalCenter"] },
  { key: "doctors", path: "/doctors", icon: Stethoscope, allowedRoles: ["Patient", "Doctor", "guest"] },
  { key: "hospitals", path: "/hospitals", icon: Building2, allowedRoles: ["Patient", "Doctor", "guest"] },
  { key: "clinics", path: "/clinics", icon: Hospital, allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"] },
  { key: "laboratories", path: "/laboratories", icon: FlaskConical, allowedRoles: ["Patient", "Doctor", "guest"] },
  { key: "calibration", path: "/calibration", icon: Wrench, allowedRoles: ["MedicalCenter"] },
  { key: "airplanes", path: "/flights", icon: Plane, allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"] },
  { key: "travel", path: "/travels", icon: Map, allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"] },
  { key: "leader", path: "/leaders", icon: Compass, allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"] },
  { key: "visa", path: "/visas", icon: Stamp, allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"] },
  { key: "guides", path: "/guide", icon: List, allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"] },
  { key: "search", path: "/search", icon: Search, allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { isLoggedIn, userRole, logout, userProfile } = useAuth();
  
  // 👈 استیت‌های مربوط به دریافت و نمایش آواتار
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loadingAvatar, setLoadingAvatar] = useState<boolean>(false);

  const currentRole = isLoggedIn ? userRole : "guest";

  const filteredMenuItems = menuItems.filter((item) => {
    return item.allowedRoles.includes(currentRole as string);
  });

  const getRoleName = (role: string | null) => {
    switch (role) {
      case "Doctor":
        return "پزشک متخصص";
      case "Patient":
        return "بیمار";
      case "MedicalCenter":
        return "مرکز درمانی";
      default:
        return "کاربر سامانه";
    }
  };

  // 👈 افکت برای دریافت باینری عکس پروفایل از سرور
  useEffect(() => {
    let objectUrl = "";
    
    if (userProfile?.imageProfile) {
      const fetchAvatar = async () => {
        try {
          setLoadingAvatar(true);
          const response = await api.post(
            "/recive/api/reciveListFile",
            { minioObjectName: userProfile.imageProfile },
            { responseType: "blob" }
          );
          const blob = new Blob([response.data]);
          objectUrl = URL.createObjectURL(blob);
          setAvatarUrl(objectUrl);
        } catch (err) {
          console.error("خطا در دریافت عکس سایدبار", err);
        } finally {
          setLoadingAvatar(false);
        }
      };

      fetchAvatar();
    } else {
      setAvatarUrl("");
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [userProfile?.imageProfile]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gadget-dark/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 rtl:right-0 ltr:left-0 z-50 w-64 bg-white md:rounded-2xl flex flex-col shrink-0 shadow-2xl md:shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:rtl:translate-x-0 md:ltr:translate-x-0 ${
          isOpen
            ? "translate-x-0"
            : "rtl:translate-x-full ltr:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 md:hidden border-b border-gray-100">
          <span className="font-bold text-gadget-dark">منوی کاربری</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-6 md:py-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <ul className="space-y-1.5 md:space-y-4">
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={onClose} 
                  className="flex items-center gap-4 px-6 py-2 md:py-0 cursor-pointer group transition-all duration-300 md:hover:scale-105 rtl:origin-right ltr:origin-left"
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${isActive ? "text-white bg-gadget-dark shadow-md" : "text-gray-400 group-hover:text-gadget-dark"}`}
                      >
                        <Icon strokeWidth={1.5} size={22} />
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

        <div className="mt-auto shrink-0 border-t border-gray-100 bg-gray-50/50 md:rounded-2xl">
          <div className="p-5 flex flex-col gap-3">
            {isLoggedIn ? (
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="flex items-center gap-3 mb-2 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                  title="مشاهده و ویرایش پروفایل"
                >
                  {/* 👈 رندر هوشمند دایره پروفایل */}
                  <div className="w-10 h-10 bg-gadget-light/10 text-gadget-light rounded-lg flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative">
                    {loadingAvatar ? (
                      <Loader2 size={16} className="animate-spin text-gadget-light" />
                    ) : avatarUrl ? (
                      <img src={avatarUrl} alt="پروفایل" className="w-full h-full object-cover" />
                    ) : userRole === "MedicalCenter" && userProfile?.centerName ? (
                      userProfile.centerName[0]
                    ) : userProfile?.firstName ? (
                      userProfile.firstName[0]
                    ) : (
                      <User size={20} />
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-gadget-light transition-colors">
                      {userRole === "MedicalCenter"
                        ? userProfile?.centerName
                        : userProfile
                          ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`
                          : "در حال بارگذاری..."}
                    </h4>
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