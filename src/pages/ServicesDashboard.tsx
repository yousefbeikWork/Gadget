import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  Stethoscope,
  Users,
  Building2,
  Building,
  FlaskConical,
  Plane,
  Map,
  Flag,
  FileCheck,
  HelpCircle,
  Search,
  Wrench,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface ServiceItem {
  id: string;
  title: string;
  icon: any;
  path: string;
  allowedRoles: string[];
  color: string;
  description: string;
}

export default function ServicesDashboard() {
  const { userRole, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const currentRole = isLoggedIn ? userRole : "guest";

  const allServices: ServiceItem[] = [
    {
      id: "home",
      title: t("home"),
      icon: Home,
      path: "/",
      allowedRoles: [
        "Patient",
        "Doctor",
        "MedicalCenter",
        "laboratorCenter",
        "Leader",
        "guest",
        "Hospital",
      ],
      color: "bg-blue-50 text-blue-600 border-blue-100",
      description: t("desc_home"),
    },
    {
      id: "patients",
      title: t("patients"),
      icon: Users,
      path: "/patients",
      allowedRoles: [
        "Doctor",
        "MedicalCenter",
        "laboratorCenter",
        "Leader",
        "Hospital",
      ],
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      description: t("desc_patients"),
    },
    {
      id: "doctors",
      title: t("doctors"),
      icon: Stethoscope,
      path: "/doctors",
      allowedRoles: ["Patient", "Leader", "guest"],
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      description: t("desc_doctors"),
    },
    {
      id: "hospital",
      title: t("hospitals"),
      icon: Building2,
      path: "/hospitals",
      allowedRoles: ["Patient", "Doctor", "Leader", "guest"],
      color: "bg-rose-50 text-rose-600 border-rose-100",
      description: t("desc_hospitals"),
    },
    {
      id: "clinic",
      title: t("clinics"),
      icon: Building,
      path: "/clinics",
      allowedRoles: ["Patient", "Doctor", "Leader", "guest"],
      color: "bg-teal-50 text-teal-600 border-teal-100",
      description: t("desc_clinics"),
    },
    {
      id: "lab",
      title: t("laboratories"),
      icon: FlaskConical,
      path: "/laboratories",
      allowedRoles: ["Patient", "guest"],
      color: "bg-purple-50 text-purple-600 border-purple-100",
      description: t("desc_laboratories"),
    },
    {
      id: "calibration",
      title: t("calibration"),
      icon: Wrench,
      path: "/calibration",
      allowedRoles: ["MedicalCenter", "laboratorCenter", "Hospital"],
      color: "bg-slate-50 text-slate-600 border-slate-200",
      description: t("desc_calibration"),
    },
    {
      id: "flight",
      title: t("airplanes"),
      icon: Plane,
      path: "/flights",
      allowedRoles: ["Patient", "guest"],
      color: "bg-sky-50 text-sky-600 border-sky-100",
      description: t("desc_flights"),
    },
    {
      id: "travel",
      title: t("travel"),
      icon: Map,
      path: "/travels",
      allowedRoles: ["MedicalCenter", "Leader", "guest", "Patient"],
      color: "bg-amber-50 text-amber-600 border-amber-100",
      description: t("desc_travels"),
    },
    {
      id: "leader",
      title: t("leader"),
      icon: Flag,
      path: "/leaders",
      allowedRoles: ["Patient", "MedicalCenter", "guest"],
      color: "bg-orange-50 text-orange-600 border-orange-100",
      description: t("desc_leaders"),
    },
    {
      id: "visa",
      title: t("visa"),
      icon: FileCheck,
      path: "/visas",
      allowedRoles: ["Patient", "guest"],
      color: "bg-cyan-50 text-cyan-600 border-cyan-100",
      description: t("desc_visas"),
    },
    {
      id: "guide",
      title: t("guides"),
      icon: HelpCircle,
      path: "/guide",
      allowedRoles: [
        "Patient",
        "Doctor",
        "MedicalCenter",
        "laboratorCenter",
        "guest",
        "Leader",
        "Hospital",
      ],
      color: "bg-gray-50 text-gray-600 border-gray-200",
      description: t("desc_guides"),
    },
    {
      id: "search",
      title: t("search"),
      icon: Search,
      path: "/search",
      allowedRoles: [
        "Patient",
        "Doctor",
        "MedicalCenter",
        "laboratorCenter",
        "guest",
        "Leader",
        "Hospital",
      ],
      color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
      description: t("desc_search"),
    },
  ];

  const visibleServices =
    currentRole === "guest"
      ? allServices
      : allServices.filter((service) =>
          service.allowedRoles.includes(currentRole || ""),
        );

  const handleServiceNavigation = (path: string, allowedRoles: string[]) => {
    if (!isLoggedIn && !allowedRoles.includes("guest")) {
      toast.error(t("loginToastMsg"));
      navigate("/login");
      return;
    }
    navigate(path);
  };

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans"
      dir={i18n.language === "fa" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 border-b border-gray-50 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("servicesTitle")}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {!isLoggedIn ? t("guestWelcome") : t("userWelcome")}
            </p>
          </div>
          {!isLoggedIn && (
            <button
              onClick={() => navigate("/login")}
              className="bg-gadget-dark hover:bg-gadget-dark/90 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
            >
              {t("quickLoginReg")}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {visibleServices.map((service) => {
            const Icon = service.icon;
            const isLockedForGuest =
              !isLoggedIn && !service.allowedRoles.includes("guest");

            return (
              <button
                key={service.id}
                onClick={() =>
                  handleServiceNavigation(service.path, service.allowedRoles)
                }
                className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden w-full outline-hidden border-none cursor-pointer"
              >
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${service.color.split(" ")[0]}`}
                ></div>

                {isLockedForGuest && (
                  <div className="absolute top-3 left-3 bg-gray-100 text-gray-400 p-1 rounded-md text-[10px] font-bold border border-gray-200">
                    {t("loginRequired")}
                  </div>
                )}

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 border ${service.color}`}
                >
                  <Icon size={28} strokeWidth={1.5} />
                </div>

                <h3 className="font-bold text-gray-800 mb-1 text-sm md:text-base">
                  {service.title}
                </h3>
                <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {service.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
