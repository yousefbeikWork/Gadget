import { useTranslation } from "react-i18next";
import {
  Activity,
  Users,
  Building,
  Plane,
  TrendingUp,
  HeartPulse,
  Globe2,
  FileText,
  CalendarCheck,
  CheckCircle2,
  BookOpen,
  Stethoscope,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Home() {
  const { t, i18n } = useTranslation();
  const numberFormatter = new Intl.NumberFormat(i18n.language);

  const { isLoggedIn, userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      // 👈 هدایت خودکار ادمین در صورت ورود به روت ریشه
      if (userRole === "Admin" || userRole === "SUPER_ADMIN") {
        navigate("/admin-panel", { replace: true });
      }
    }
  }, [isLoggedIn, userRole, isLoading, navigate]);

  if (isLoading) return null;
  // دیتای آماری بالا
  const stats = [
    {
      titleKey: "active_clinics",
      value: 124,
      icon: Building,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      titleKey: "registered_doctors",
      value: 850,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      titleKey: "todays_flights",
      value: 42,
      icon: Plane,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      titleKey: "system_visits",
      value: 1204,
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  // لیست خدمات ما
  const services = [
    {
      icon: Activity,
      title: "پایش هوشمند علائم حیاتی",
      desc: "ثبت و تحلیل مستمر شاخص‌های سلامت مانند ضربان قلب، فشار خون، اکسیژن خون و دمای بدن با ارائه هشدارهای هوشمند.",
    },
    {
      icon: FileText,
      title: "پرونده سلامت الکترونیکی",
      desc: "ایجاد و نگهداری پرونده پزشکی دیجیتال بین‌المللی، قابل دسترس در هر زمان و قابل اشتراک‌گذاری در سراسر جهان.",
    },
    {
      icon: HeartPulse,
      title: "ارزیابی بیماری‌های قلبی",
      desc: "بهره‌گیری از ابزارهای هوشمند و تحلیل داده‌ها برای شناسایی زودهنگام ریسک بیماری‌های قلبی.",
    },
    {
      icon: Globe2,
      title: "ارتباط با پزشکان معتبر",
      desc: "دریافت مشاوره، ویزیت آنلاین و ارتباط مستقیم با متخصصان و مراکز درمانی در داخل و خارج از کشور.",
    },
    {
      icon: Plane,
      title: "گردشگری سلامت",
      desc: "برنامه‌ریزی سفر درمانی شامل انتخاب پزشک، هماهنگی اقامت، خدمات مترجم و راهنمای اختصاصی.",
    },
    {
      icon: Building,
      title: "مدیریت مراکز درمانی",
      desc: "سامانه جامع مدیریت بیمار، پرونده پزشکی، نوبت‌دهی و مدیریت فرآیندهای درمانی برای کلینیک‌ها.",
    },
    {
      icon: CalendarCheck,
      title: "رزرو نوبت و خدمات",
      desc: "رزرو سریع و آنلاین ویزیت حضوری یا آنلاین، آزمایش‌ها، تصویربرداری‌ها و سایر خدمات سلامت.",
    },
  ];

  // لیست چرا پلتفرم ما
  const features = [
    "ایجاد اولین پرونده سلامت الکترونیکی و بین‌المللی",
    "پایش لحظه‌ای سلامت و هشدارهای هوشمند",
    "دسترسی به شبکه‌ای از پزشکان و مراکز درمانی معتبر",
    "مدیریت کامل فرآیند درمان از تشخیص تا پیگیری",
    "کاهش هزینه‌ها و زمان دریافت خدمات پزشکی",
    "پشتیبانی از بیماران داخلی و بین‌المللی",
    "امکان انتخاب راهنما و لیدر تخصصی سفر درمانی",
    "امنیت و محرمانگی اطلاعات مطابق استانداردهای روز",
    "یکپارچه‌سازی خدمات سلامت، درمان و گردشگری",
  ];

  // لیست تخصص‌ها
  const specialties = [
    "قلب و عروق",
    "جراحی‌های تخصصی",
    "ارتوپدی و مفاصل",
    "ناباروری",
    "زیبایی و پلاستیک",
    "دندانپزشکی",
    "چشم پزشکی",
    "مغز و اعصاب",
    "آنکولوژی و سرطان",
    "چکاپ‌های جامع",
  ];

  return (
    <div className="flex-1 bg-gray-50 md:rounded-2xl shadow-lg overflow-y-auto overflow-x-hidden">
      {/* 1. هدر اصلی (شعار سایت) */}
      {/* تغییر اصلی: جایگزینی bg-gadget-dark با یک گرادیانت جذاب */}
      <div className="bg-linear-to-r from-gadget-dark to-gadget-light p-10 md:p-14 text-center relative overflow-hidden ">
        {/* یک افکت نوری جذاب برای پس‌زمینه هدر */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-40 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* تغییر استایل تگ بالایی برای هماهنگی با گرادیانت */}
          <span className="inline-block py-1 px-4 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold tracking-wider mb-4 border border-white/10">
            پلتفرم جامع سلامت
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-md">
            سلامت هوشمند، بدون مرز
          </h1>
          <p className="text-gray-100 text-sm md:text-base leading-relaxed md:leading-loose max-w-3xl mx-auto drop-shadow-sm">
            اولین پلتفرم یکپارچه سلامت و گردشگری درمانی که با بهره‌گیری از
            فناوری‌های نوین، امکان پایش لحظه‌ای سلامت، مدیریت پرونده پزشکی
            بین‌المللی، ارتباط با پزشکان و مراکز درمانی معتبر و برنامه‌ریزی کامل
            سفر درمانی را در یک بستر امن فراهم می‌کند.
          </p>
        </div>
      </div>

      <div className="p-8">
        {/* 2. کارت‌های آماری */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 -mt-14 relative z-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full ltr:flex-row-reverse">
                    <TrendingUp size={12} className="mx-1" />{" "}
                    {numberFormatter.format(12)}٪
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">
                  {t(stat.titleKey)}
                </h3>
                <p className="text-2xl font-bold text-gray-800">
                  {numberFormatter.format(stat.value)}
                </p>
              </div>
            );
          })}
        </div>

        {/* 3. خدمات ما */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Stethoscope className="text-gadget-dark" size={28} />
            <h2 className="text-2xl font-bold text-gadget-dark">خدمات ما</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-gadget-light/50 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gadget-light/10 transition-colors">
                    <Icon
                      size={24}
                      className="text-gadget-dark group-hover:text-gadget-light"
                    />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. دو ستونه: چرا ما؟ + تخصص‌ها */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* چرا پلتفرم ما */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gadget-dark mb-6">
              چرا پلتفرم ما؟
            </h2>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-gadget-light shrink-0 mt-0.5"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* درمان‌ها و تخصص‌ها */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h2 className="text-xl font-bold text-gadget-dark mb-6">
              درمان‌ها و تخصص‌ها
            </h2>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100 hover:bg-blue-100 transition-colors cursor-default"
                >
                  {specialty}
                </span>
              ))}
            </div>

            {/* 5. باکس آخرین مقالات در انتهای همین ستون */}
            <div className="mt-auto pt-8 border-t border-gray-100">
              <div className="flex items-start gap-4 bg-gadget-dark/5 p-5 rounded-xl border border-gadget-dark/10">
                <BookOpen size={24} className="text-gadget-dark shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-gadget-dark mb-2">
                    آخرین مقالات سلامت
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    جدیدترین مطالب و مقالات علمی در حوزه سلامت دیجیتال، پیشگیری
                    از بیماری‌ها، گردشگری درمانی، فناوری‌های پزشکی و سبک زندگی
                    سالم را در این بخش دنبال کنید.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
