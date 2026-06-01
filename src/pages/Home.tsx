import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, Users, Building, Plane, ArrowLeft, TrendingUp } from 'lucide-react';

export default function Home() {
  const { t, i18n } = useTranslation(); // اضافه کردن i18n برای دسترسی به زبان فعلی

  // ۱. تغییر مقادیر به عدد واقعی (Number) به جای رشته متنی فارسی
  const stats = [
    { titleKey: 'active_clinics', value: 124, icon: Building, color: 'text-blue-600', bg: 'bg-blue-100' },
    { titleKey: 'registered_doctors', value: 850, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { titleKey: 'todays_flights', value: 42, icon: Plane, color: 'text-orange-600', bg: 'bg-orange-100' },
    { titleKey: 'system_visits', value: 1204, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  // ۲. یک فرمت‌کننده هوشمند که بر اساس زبان فعلی (fa یا en) اعداد را تبدیل می‌کند
  const numberFormatter = new Intl.NumberFormat(i18n.language);

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 overflow-y-auto">
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gadget-dark mb-2">
          {t('welcome')}
        </h1>
        <p className="text-gray-500 text-sm">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon size={24} strokeWidth={2} />
                </div>
                <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full ltr:flex-row-reverse">
                  {/* فرمت کردن عدد درصد پیشرفت */}
                  <TrendingUp size={12} className="mx-1" /> {numberFormatter.format(12)}٪
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{t(stat.titleKey)}</h3>
              
              {/* ۳. استفاده از فرمت‌کننده برای تبدیل خودکار اعداد کارت‌ها */}
              <p className="text-2xl font-bold text-gray-800">
                {numberFormatter.format(stat.value)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-gadget-dark/5 border border-gadget-dark/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-gadget-dark opacity-5 rounded-full blur-3xl"></div>
        
        <div className="z-10 text-center md:text-start">
          <h2 className="text-xl font-bold text-gadget-dark mb-2">{t('ready_to_start')}</h2>
          <p className="text-sm text-gray-600 max-w-lg leading-relaxed">
            {t('system_ready_desc')}
          </p>
        </div>
        
        <Link 
          to="/clinics" 
          className="z-10 shrink-0 flex items-center gap-2 bg-gadget-dark hover:bg-opacity-90 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md"
        >
          {t('go_to_clinics')}
          <ArrowLeft size={18} className="rtl:rotate-0 ltr:rotate-180" />
        </Link>
      </div>

    </div>
  );
}