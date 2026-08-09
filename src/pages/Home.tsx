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
  Info,
  PhoneCall,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// 👈 فوتر جدید را اینجا ایمپورت کنید
import Footer from "../components/Footer";

interface TranslatedService {
  title: string;
  desc: string;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const numberFormatter = new Intl.NumberFormat(i18n.language);

  const { isLoggedIn, userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      if (userRole === "Admin" || userRole === "SUPER_ADMIN") {
        navigate("/admin-panel", { replace: true });
      }
    }
  }, [isLoggedIn, userRole, isLoading, navigate]);

  if (isLoading) return null;

  const stats = [
    { titleKey: "active_clinics", value: 124, icon: Building, color: "text-blue-600", bg: "bg-blue-100" },
    { titleKey: "registered_doctors", value: 850, icon: Users, color: "text-green-600", bg: "bg-green-100" },
    { titleKey: "todays_flights", value: 42, icon: Plane, color: "text-orange-600", bg: "bg-orange-100" },
    { titleKey: "system_visits", value: 1204, icon: Activity, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  const translatedServices = t("services_list", { returnObjects: true }) as TranslatedService[];
  const features = t("features_list", { returnObjects: true }) as string[];
  const specialties = t("specialties_list", { returnObjects: true }) as string[];

  const servicesIcons = [Activity, FileText, HeartPulse, Globe2, Plane, Building, CalendarCheck];
  const services = translatedServices.map((service, index) => ({
    ...service,
    icon: servicesIcons[index],
  }));

  const isLtr = i18n.dir() === "ltr";

  return (
    <div className="flex-1 bg-gray-50 md:rounded-2xl shadow-lg overflow-y-auto overflow-x-hidden" dir={i18n.dir()}>
      
      {/* 1. هدر اصلی (شعار سایت) */}
      <div className="bg-linear-to-r from-gadget-dark to-gadget-light p-10 md:p-14 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-40 mix-blend-overlay"></div>
        <div className={`absolute -top-24 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full ${isLtr ? '-left-24' : '-right-24'}`}></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-4 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold tracking-wider mb-4 border border-white/10">
            {t("hero_tag")}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-md">
            {t("hero_title")}
          </h1>
          <p className="text-gray-100 text-sm md:text-base leading-relaxed md:leading-loose max-w-3xl mx-auto drop-shadow-sm mb-8">
            {t("hero_desc")}
          </p>
        </div>
      </div>

      <div className="pt-8 px-8">
        {/* 2. کارت‌های آماری */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 -mt-14 relative z-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:-translate-y-1 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <span className={`flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full ${isLtr ? 'flex-row' : 'flex-row-reverse'}`}>
                    <TrendingUp size={12} className="mx-1" /> {numberFormatter.format(12)}٪
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{t(stat.titleKey)}</h3>
                <p className="text-2xl font-bold text-gray-800">{numberFormatter.format(stat.value)}</p>
              </div>
            );
          })}
        </div>

        {/* 3. خدمات ما */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Stethoscope className="text-gadget-dark" size={28} />
            <h2 className="text-2xl font-bold text-gadget-dark">{t("our_services")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-gadget-light/50 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gadget-light/10 transition-colors">
                    <Icon size={24} className="text-gadget-dark group-hover:text-gadget-light" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. دو ستونه: چرا ما؟ + تخصص‌ها */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gadget-dark mb-6">{t("why_our_platform")}</h2>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-gadget-light shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
              <Link to="/about" className="w-full sm:flex-1 bg-gadget-dark hover:bg-gadget-dark/90 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer">
                <Info size={16} /> <span>{t("btn_about")}</span>
              </Link>
              <Link to="/contact" className="w-full sm:flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                <PhoneCall size={16} className="text-gadget-dark" /> <span>{t("btn_contact")}</span>
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h2 className="text-xl font-bold text-gadget-dark mb-6">{t("treatments_specialties")}</h2>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty, index) => (
                <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100 hover:bg-blue-100 transition-colors cursor-default">
                  {specialty}
                </span>
              ))}
            </div>
            <div className="mt-auto pt-8 border-t border-gray-100">
              <div className="flex items-start gap-4 bg-gadget-dark/5 p-5 rounded-xl border border-gadget-dark/10">
                <BookOpen size={24} className="text-gadget-dark shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-gadget-dark mb-2">{t("latest_health_articles")}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{t("latest_articles_desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* 5. فوتر کامل که نماد اینماد هم داخلش است */}
      <Footer />
      
    </div>
  );
}