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
  Shield,
  Info,
  PhoneCall,
  Warehouse,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import DoctorAvatar from "./DoctorAvatar";

const menuItems = [
  // ... (آرایه menuItems دقیقاً مثل قبل باقی می‌ماند، نیازی به تغییر کلیدها نیست)
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
      "Hospital",
    ],
  },
  {
    key: "Adminpanel",
    path: "admin-panel",
    icon: Shield,
    allowedRoles: ["Admin"],
  },
  {
    key: "schedule",
    path: "/schedule",
    icon: Calendar,
    allowedRoles: [
      "Doctor",
      "MedicalCenter",
      "laboratorCenter",
      "Leader",
      "Hospital",
    ],
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
    allowedRoles: [
      "Doctor",
      "MedicalCenter",
      "laboratorCenter",
      "Leader",
      "Admin",
      "Hospital",
    ],
  },
  {
    key: "doctors",
    path: "/doctors",
    icon: Stethoscope,
    allowedRoles: ["Patient", "Leader", "guest", "Admin"],
  },
  {
    key: "hospitals",
    path: "/hospitals",
    icon: Building2,
    allowedRoles: ["Patient", "Leader", "guest", "Doctor", "Admin"],
  },
  {
    key: "clinics",
    path: "/clinics",
    icon: Hospital,
    allowedRoles: ["Patient", "Leader", "guest", "Doctor", "Admin"],
  },
  {
    key: "HospitalClinics",
    path: "/hospital-clinics",
    icon: Hospital,
    allowedRoles: ["Hospital"],
  },
  {
    key: "laboratories",
    path: "/laboratories",
    icon: FlaskConical,
    allowedRoles: ["Patient", "guest", "Admin"],
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
    allowedRoles: ["MedicalCenter", "laboratorCenter", "Hospital"],
  },
  {
    key: "inventoryManagement",
    path: "/inventory-management",
    icon: Warehouse,
    allowedRoles: ["Hospital"],
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
    allowedRoles: ["MedicalCenter", "guest", "Patient", "Admin"],
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
      "Hospital",
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
      "Hospital",
    ],
  },
  {
    key: "aboutUs",
    path: "/about",
    icon: Info,
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
    key: "contactUs",
    path: "/contact",
    icon: PhoneCall,
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
        return t("roles.Doctor");
      case "Patient":
        return t("roles.Patient");
      case "MedicalCenter":
        return t("roles.MedicalCenter");
      case "laboratorCenter":
        return t("roles.laboratorCenter");
      case "Leader":
        return t("roles.Leader");
      case "Hospital":
        return t("roles.Hospital");
      default:
        return t("roles.SystemUser");
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
        <div className="flex items-center justify-between mt-1 pl-2 md:hidden border-b border-gray-100 shrink-0">
          <div className="flex items-center">
            <img src="/logo1.png" alt="Logo" className="w-15 h-15 mt-2.5" />
            <span className="font-bold text-gray-800 text-sm">
              {t("userMenu")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="hidden md:flex flex-col items-center text-center pb-1 shrink-0">
          <div className="w-60 h-60 flex items-center justify-center hover:scale-105 transition-transform duration-300">
            <img src="/logo1.png" alt="System Logo" className="w-full h-full" />
          </div>
        </div>

        <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <ul className="space-y-2 md:space-y-3 px-3">
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={onClose}
                  className="group relative block cursor-pointer"
                >
                  {({ isActive }) => (
                    <div
                      className={`
                relative flex items-center gap-3
                px-3 py-2.5
                rounded-2xl
                transition-all duration-300 ease-out
                overflow-hidden

                ${
                  isActive
                    ? "bg-gadget-dark text-white shadow-lg shadow-gadget-dark/20"
                    : "text-gray-500 hover:bg-gray-100/80 hover:text-gadget-dark"
                }

                hover:translate-x-1
                rtl:hover:-translate-x-1
              `}
                    >
                      {/* Active glow */}
                      {isActive && (
                        <div className="absolute inset-0 bg-linear-to-r from-white/10 via-transparent to-transparent pointer-events-none" />
                      )}

                      {/* Active indicator */}
                      <div
                        className={`
                  absolute top-1/2 -translate-y-1/2
                  w-1 h-7
                  rounded-full
                  transition-all duration-300
                  rtl:right-0 ltr:left-0
                  ${
                    isActive
                      ? "bg-white opacity-100"
                      : "bg-transparent opacity-0"
                  }
                `}
                      />

                      {/* Icon */}
                      <div
                        className={`
                  relative z-10
                  flex items-center justify-center
                  w-10 h-10
                  rounded-xl
                  transition-all duration-300

                  ${
                    isActive
                      ? "bg-white/15 text-white shadow-inner"
                      : "bg-gray-100 text-gray-400 group-hover:bg-gadget-dark/10 group-hover:text-gadget-dark group-hover:scale-110"
                  }
                `}
                      >
                        <Icon
                          size={21}
                          strokeWidth={isActive ? 2 : 1.7}
                          className="transition-transform duration-300 group-hover:rotate-[-4deg]"
                        />
                      </div>

                      {/* Text */}
                      <div className="relative z-10 flex-1 min-w-0">
                        <h3
                          className={`
                    text-sm
                    truncate
                    transition-all duration-300
                    ${
                      isActive
                        ? "font-bold text-white"
                        : "font-medium text-gray-600 group-hover:text-gadget-dark"
                    }
                  `}
                        >
                          {t(item.key)}
                        </h3>

                        {/* Small active text */}
                        {isActive && (
                          <span className="block mt-0.5 text-[10px] text-white/60 font-normal">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Arrow */}
                      <div
                        className={`
                  relative z-10
                  text-xs
                  transition-all duration-300
                  ${
                    isActive
                      ? "opacity-100 text-white translate-x-0"
                      : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-gadget-dark"
                  }
                `}
                      >
                        <span className="rtl:rotate-180 inline-block">›</span>
                      </div>
                    </div>
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
                  title={t("viewProfile")}
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
                        : userRole === "Hospital"
                          ? userProfile?.hospitalName
                          : userProfile
                            ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`
                            : t("loading")}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                      {userRole === "Doctor" && userProfile?.Expertise
                        ? `${t("specialistPrefix")} ${userProfile.Expertise}`
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
                  <span>{t("logout")}</span>
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
                  <span>{t("login")}</span>
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  <UserPlus size={18} />
                  <span>{t("register")}</span>
                </Link>
              </>
            )}
          </div>
          <div className="px-6 pb-0 pt-1 flex justify-center w-full">
            <LanguageSwitcher />
          </div>
        </div>
      </aside>
    </>
  );
}
