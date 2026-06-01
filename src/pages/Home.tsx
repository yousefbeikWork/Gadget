import { Link } from 'react-router-dom';
import { Activity, Users, Building, Plane, ArrowLeft, TrendingUp } from 'lucide-react';

export default function Home() {
  // دیتای تستی برای نمایش آمار
  const stats = [
    { title: 'کلینیک‌های فعال', value: '۱۲۴', icon: Building, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'پزشکان ثبت‌شده', value: '۸۵۰', icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'پروازهای امروز', value: '۴۲', icon: Plane, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'بازدیدهای سیستم', value: '۱,۲۰۴', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 overflow-y-auto" dir="rtl">
      
      {/* بخش خوش‌آمدگویی */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gadget-dark mb-2">
          سلام حسین، به گجت خوش اومدی! 👋
        </h1>
        <p className="text-gray-500 text-sm">
          امروز دوشنبه است، بیا یک نگاه سریع به وضعیت سیستم بندازیم.
        </p>
      </div>

      {/* شبکه کارت‌های آماری */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon size={24} strokeWidth={2} />
                </div>
                <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  +۱۲٪ <TrendingUp size={12} className="mr-1" />
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* بنر دسترسی سریع */}
      <div className="bg-gadget-dark/5 border border-gadget-dark/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* یک افکت تزئینی برای پس‌زمینه بنر */}
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-gadget-dark opacity-5 rounded-full blur-3xl"></div>
        
        <div className="z-10 text-center md:text-right">
          <h2 className="text-xl font-bold text-gadget-dark mb-2">آماده‌ای برای شروع کار؟</h2>
          <p className="text-sm text-gray-600 max-w-lg leading-relaxed">
            سیستم آماده بهره‌برداری است. می‌توانی از بخش کلینیک‌ها شروع کنی، اطلاعات جدیدی ثبت کنی و یا داده‌های قبلی را مدیریت کنی.
          </p>
        </div>
        
        <Link 
          to="/clinics" 
          className="z-10 shrink-0 flex items-center gap-2 bg-gadget-dark hover:bg-opacity-90 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md"
        >
          رفتن به مدیریت کلینیک‌ها
          <ArrowLeft size={18} />
        </Link>
      </div>

    </div>
  );
}