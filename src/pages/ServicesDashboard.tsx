import { useNavigate } from "react-router-dom";
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
  const { userRole, isLoggedIn } = useAuth(); // گرفتن وضعیت لاگین و نقش کاربر
  const navigate = useNavigate();

  // تعیین نقش فعلی (مهمان یا نقش لاگین شده)
  const currentRole = isLoggedIn ? userRole : "guest";

  const allServices: ServiceItem[] = [
    {
      id: "home",
      title: "خانه",
      icon: Home,
      path: "/",
      allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"], // مهمان دسترسی دارد
      color: "bg-blue-50 text-blue-600 border-blue-100",
      description: "داشبورد اصلی و خلاصه وضعیت",
    },
    {
      id: "patients",
      title: "بیماران",
      icon: Users,
      path: "/patients",
      allowedRoles: ["Doctor", "MedicalCenter"], // مهمان دسترسی ندارد
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      description: "مدیریت و مشاهده لیست بیماران",
    },
    {
      id: "doctors",
      title: "پزشک",
      icon: Stethoscope,
      path: "/doctors",
      allowedRoles: ["Patient", "Doctor", "guest"], // مهمان دسترسی دارد (برای مشاهده لیست پزشکان)
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      description: "لیست پزشکان و رزرو نوبت",
    },
    {
      id: "hospital",
      title: "بیمارستان",
      icon: Building2,
      path: "/hospitals",
      allowedRoles: ["Patient", "Doctor", "guest"], // مهمان دسترسی دارد
      color: "bg-rose-50 text-rose-600 border-rose-100",
      description: "مراکز درمانی و بیمارستان‌ها",
    },
    {
      id: "clinic",
      title: "کلینیک",
      icon: Building,
      path: "/clinics",
      allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"], // مهمان دسترسی دارد
      color: "bg-teal-50 text-teal-600 border-teal-100",
      description: "درمانگاه‌ها و کلینیک‌های تخصصی",
    },
    {
      id: "lab",
      title: "آزمایشگاه",
      icon: FlaskConical,
      path: "/laboratories",
      allowedRoles: ["Patient", "Doctor", "guest"], // مهمان دسترسی دارد
      color: "bg-purple-50 text-purple-600 border-purple-100",
      description: "مراکز پاتولوژی و آزمایشگاهی",
    },
    {
      id: "calibration",
      title: "کالیبراسیون",
      icon: Wrench,
      path: "/calibration",
      allowedRoles: ["MedicalCenter"], // مهمان دسترسی ندارد
      color: "bg-slate-50 text-slate-600 border-slate-200",
      description: "تنظیم و کالیبراسیون تجهیزات",
    },
    {
      id: "flight",
      title: "هواپیما",
      icon: Plane,
      path: "/flights",
      allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"], // مهمان دسترسی دارد
      color: "bg-sky-50 text-sky-600 border-sky-100",
      description: "رزرو بلیت هواپیما و پرواز",
    },
    {
      id: "travel",
      title: "سفر",
      icon: Map,
      path: "/travels",
      allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"], // مهمان دسترسی دارد
      color: "bg-amber-50 text-amber-600 border-amber-100",
      description: "خدمات گردشگری و اقامت",
    },
    {
      id: "leader",
      title: "لیدر",
      icon: Flag,
      path: "/leaders",
      allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"], // مهمان دسترسی دارد
      color: "bg-orange-50 text-orange-600 border-orange-100",
      description: "راهنمای تور و مترجم",
    },
    {
      id: "visa",
      title: "ویزا",
      icon: FileCheck,
      path: "/visas",
      allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"], // مهمان دسترسی دارد
      color: "bg-cyan-50 text-cyan-600 border-cyan-100",
      description: "خدمات اخذ ویزای درمانی",
    },
    {
      id: "guide",
      title: "راهنما",
      icon: HelpCircle,
      path: "/guide",
      allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"], // مهمان دسترسی دارد
      color: "bg-gray-50 text-gray-600 border-gray-200",
      description: "پشتیبانی و راهنمای سیستم",
    },
    {
      id: "search",
      title: "جستوجو",
      icon: Search,
      path: "/search",
      allowedRoles: ["Patient", "Doctor", "MedicalCenter", "guest"], // مهمان دسترسی دارد
      color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
      description: "جستجوی جامع در سامانه",
    },
  ];

  // ==========================================
  // منطق فیلتر هوشمند: مهمان همه را می‌بیند، کاربر لاگین شده فقط روت‌های خودش را
  // ==========================================
  const visibleServices =
    currentRole === "guest"
      ? allServices
      : allServices.filter((service) =>
          service.allowedRoles.includes(currentRole || ""),
        );

  // ==========================================
  // مدیریت کلیک روی خدمات جهت احراز هویت
  // ==========================================
  const handleServiceNavigation = (path: string, allowedRoles: string[]) => {
    // اگر کاربر لاگین نکرده بود و این صفحه روتِ مجاز برای مهمان نبود
    if (!isLoggedIn && !allowedRoles.includes("guest")) {
      toast.error(
        "برای استفاده از این بخش، لطفا ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید.",
      );
      navigate("/login");
      return;
    }

    // در غیر این صورت اجازه ورود داده می‌شود
    navigate(path);
  };

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* هدر بخش خدمات */}
        <div className="mb-8 border-b border-gray-50 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              خدمات سامانه TAP.NET
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {!isLoggedIn
                ? "به عنوان کاربر مهمان خوش آمدید. برای استفاده از تمامی امکانات عملیاتی، وارد سیستم شوید."
                : "دسترسی سریع به امکانات پنل کاربری شما"}
            </p>
          </div>
          {!isLoggedIn && (
            <button
              onClick={() => navigate("/login")}
              className="bg-gadget-dark hover:bg-gadget-dark/90 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
            >
              ورود سریع / ثبت‌نام
            </button>
          )}
        </div>

        {/* گرید نمایش کارت‌های خدمات */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {visibleServices.map((service) => {
            const Icon = service.icon;
            // بررسی اینکه آیا این بخش برای مهمان قفل است یا خیر
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
                {/* افکت نوری پس‌زمینه در حالت هاور */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${service.color.split(" ")[0]}`}
                ></div>

                {/* آیکون وضعیت قفل برای کاربر مهمان */}
                {isLockedForGuest && (
                  <div className="absolute top-3 left-3 bg-gray-100 text-gray-400 p-1 rounded-md text-[10px] font-bold border border-gray-200">
                    نیازمند ورود
                  </div>
                )}

                {/* آیکون خدمت */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 border ${service.color}`}
                >
                  <Icon size={28} strokeWidth={1.5} />
                </div>

                {/* عنوان و توضیحات */}
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
