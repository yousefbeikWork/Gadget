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
  X,
  LogIn,
  UserPlus,
  LogOut,
  Calendar,
  CalendarDays,
  Users,
  FlaskConical,
  Wrench,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import DoctorAvatar from "./DoctorAvatar";

const menuItems = [
  {
    key: "home",
    path: "/dashboard",
    icon: Home,
    allowedRoles: [
      "Patient",
      "Doctor",
      "MedicalCenter",
      "laboratorCenter",
      "Leader",
      "guest",
    ],
  },
  {
    key: "schedule",
    path: "/schedule",
    icon: Calendar,
    allowedRoles: ["Doctor", "MedicalCenter", "laboratorCenter"],
  },
  {
    key: "myAppointments",
    path: "/my-appointments",
    icon: CalendarDays,
    allowedRoles: ["Patient", "Doctor"],
  },
  {
    key: "myDoctors",
    path: "/clinic-doctors",
    icon: Stethoscope,
    allowedRoles: ["MedicalCenter"],
  },
  {
    key: "patients",
    path: "/patients",
    icon: Users,
    allowedRoles: ["Doctor", "MedicalCenter", "laboratorCenter"],
  },
  {
    key: "doctors",
    path: "/doctors",
    icon: Stethoscope,
    allowedRoles: ["Patient", "Leader", "guest"],
  },
  {
    key: "hospitals",
    path: "/hospitals",
    icon: Building2,
    allowedRoles: ["Patient", "Leader", "guest", "Doctor"],
  },
  {
    key: "clinics",
    path: "/clinics",
    icon: Hospital,
    allowedRoles: ["Patient", "Leader", "guest", "Doctor"],
  },
  {
    key: "laboratories",
    path: "/laboratories",
    icon: FlaskConical,
    allowedRoles: ["Patient", "guest"],
  },
  {
    key: "myLaboratories",
    path: "/Collaborating-lab",
    icon: FlaskConical,
    allowedRoles: ["laboratorCenter"],
  },
  {
    key: "calibration",
    path: "/calibration",
    icon: Wrench,
    allowedRoles: ["MedicalCenter", "laboratorCenter"],
  },
  {
    key: "airplanes",
    path: "/flights",
    icon: Plane,
    allowedRoles: ["Patient", "guest"],
  },
  {
    key: "travel",
    path: "/travels",
    icon: Map,
    allowedRoles: ["MedicalCenter", "Leader", "guest", "Patient"],
  },
  {
    key: "leader",
    path: "/leaders",
    icon: Compass,
    allowedRoles: ["MedicalCenter", "guest", "Patient"],
  },
  {
    key: "visa",
    path: "/visas",
    icon: Stamp,
    allowedRoles: ["Patient", "guest"],
  },
  {
    key: "guides",
    path: "/guide",
    icon: List,
    allowedRoles: [
      "Patient",
      "Doctor",
      "MedicalCenter",
      "laboratorCenter",
      "Leader",
      "guest",
    ],
  },
  {
    key: "search",
    path: "/search",
    icon: Search,
    allowedRoles: [
      "Patient",
      "Doctor",
      "MedicalCenter",
      "laboratorCenter",
      "Leader",
      "guest",
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { isLoggedIn, userRole, logout, userProfile } = useAuth();

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
      case "laboratorCenter":
        return "مرکز آزمایشگاهی";
      case "Leader":
        return "لیدر (راهنما)";
      default:
        return "کاربر سامانه";
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gadget-dark/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 royal-sidebar right-0 z-50 w-64 bg-white md:rounded-2xl flex flex-col shrink-0 shadow-2xl md:shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:rtl:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ================== هدر موبایل به همراه لوگو ================== */}
        <div className="flex items-center justify-between mt-2 pl-2 md:hidden border-b border-gray-100 shrink-0">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="لوگو"
              className="w-25 h-15"
            />
            <span className="font-bold text-gray-800 text-sm">منوی کاربری</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ================== بخش لوگوی ثابت در دسکتاپ (ساختار عمودی و بزرگتر) ================== */}
        <div className="hidden md:flex flex-col items-center text-center pb-1 shrink-0">
          <div className="w-60 h-40 flex items-center justify-center hover:scale-105 transition-transform duration-300">
            <img
              src="/logo.png"
              alt="لوگوی سامانه"
              className="w-full h-full"
            />
          </div>
          {/* <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-base tracking-tight">
              سامانه هوشمند سلامت
            </span>
            <span className="text-gadget-light text-xs font-bold mt-2 opacity-90">
              مدیریت درمان و ترابری
            </span>
          </div> */}
        </div>

        {/* لیست منوها */}
        <div className="flex-1 py-6 md:py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
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
                          {item.key === "myLaboratories"
                            ? "آزمایشگاه‌های همکار"
                            : t(item.key)}
                        </h3>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </ul>
        </div>

        {/* بخش کاربری پایین سایدبار */}
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
                  <DoctorAvatar
                    imageProfile={userProfile?.imageProfile}
                    firstName={
                      userRole === "MedicalCenter" ||
                      userRole === "laboratorCenter"
                        ? userProfile?.centerName
                        : userProfile?.firstName
                    }
                    className="w-10 h-10 text-sm group-hover:scale-105 transition-transform shrink-0"
                  />

                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-gadget-light transition-colors">
                      {userRole === "MedicalCenter" ||
                      userRole === "laboratorCenter"
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
