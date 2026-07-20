import { useState, useEffect } from "react";
import {
  Users,
  Stethoscope,
  Compass,
  FlaskConical,
  Building2,
  ShieldAlert,
  Loader2,
  Activity,
  Server,
  Database,
  RefreshCcw,
  Settings,
  BellRing
} from "lucide-react";
import api from "../../services/api";

// ایمپورت کامپوننت‌های نمودار از Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface SystemStats {
  patients: number;
  doctors: number;
  leaders: number;
  laboratories: number;
  medicalCenters: number;
  admins: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/Admin/getAllItemsCount");
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      setError("خطا در دریافت آمار سیستم. لطفا دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-gadget-light">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold text-gray-500">در حال بارگذاری داشبورد مدیریت...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-bold border border-red-100 max-w-md mx-auto mt-20">
        <ShieldAlert size={40} className="mx-auto mb-3 text-red-400" />
        {error || "داده‌ای برای نمایش وجود ندارد."}
      </div>
    );
  }

  // داده‌های نمودار میله‌ای (تمامی کاربران)
  const barChartData = [
    { name: "بیماران", count: stats.patients, color: "#3b82f6" },
    { name: "پزشکان", count: stats.doctors, color: "#10b981" },
    { name: "لیدرها", count: stats.leaders, color: "#f59e0b" },
    { name: "آزمایشگاه‌ها", count: stats.laboratories, color: "#8b5cf6" },
    { name: "کلینیک‌ها", count: stats.medicalCenters, color: "#ec4899" },
    // { name: "مدیران", count: stats.admins, color: "#ef4444" },
  ];

  // داده‌های نمودار دایره‌ای (توزیع ارائه‌دهندگان خدمات - بدون بیماران برای وضوح بهتر)
  const pieChartData = [
    { name: "پزشکان", value: stats.doctors, color: "#10b981" },
    { name: "لیدرها", value: stats.leaders, color: "#f59e0b" },
    { name: "آزمایشگاه‌ها", value: stats.laboratories, color: "#8b5cf6" },
    { name: "کلینیک‌ها", value: stats.medicalCenters, color: "#ec4899" },
  ];

  // آرایه کارت‌های آماری برای رندر راحت‌تر
  // آرایه کارت‌های آماری برای رندر راحت‌تر
  const statCards = [
    { title: "کل بیماران", value: stats.patients || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
    { title: "پزشکان فعال", value: stats.doctors || 0, icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
    { title: "لیدرهای سیستم", value: stats.leaders || 0, icon: Compass, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" },
    { title: "آزمایشگاه‌ها", value: stats.laboratories || 0, icon: FlaskConical, color: "text-violet-600", bg: "bg-violet-100", border: "border-violet-200" },
    { title: "کلینیک‌ها", value: stats.medicalCenters || 0, icon: Building2, color: "text-pink-600", bg: "bg-pink-100", border: "border-pink-200" },
    // { title: "مدیران (ادمین)", value: stats.admins || 0, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-100", border: "border-red-200" },
  ];

  return (
    <div className="bg-gray-50 rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ================= هدر داشبورد ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <Activity className="text-gadget-dark" size={28} />
              پنل مدیریت کلان (Super Admin)
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">مرور کلی بر وضعیت و آمار کاربران سامانه نوریان</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors relative cursor-pointer">
              <BellRing size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            </button>
            <button onClick={fetchStats} className="flex items-center gap-2 bg-gadget-dark/10 hover:bg-gadget-dark/20 text-gadget-dark font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer text-sm border border-gadget-dark/20">
              <RefreshCcw size={16} /> بروزرسانی آمار
            </button>
          </div>
        </div>

        {/* ================= کارت‌های آماری بالا ================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, idx) => (
            <div key={idx} className={`bg-white rounded-2xl p-5 border ${card.border} shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center group`}>
              <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={28} />
              </div>
              <h3 className="text-3xl font-black text-gray-800">{card.value.toLocaleString()}</h3>
              <p className="text-xs font-bold text-gray-500 mt-1">{card.title}</p>
            </div>
          ))}
        </div>

        {/* ================= بخش نمودارها ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* نمودار میله‌ای (کل کاربران) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Users size={18} className="text-blue-500" />
              نمودار مقایسه‌ای کل کاربران سامانه
            </h3>
            <div className="h-75 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* نمودار دایره‌ای (توزیع ارائه‌دهندگان) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building2 size={18} className="text-purple-500" />
              توزیع ارائه‌دهندگان خدمات
            </h3>
            <div className="flex-1 min-h-62.5 w-full relative" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-7.5">
                <div className="text-center">
                  <span className="block text-2xl font-black text-gray-800">
                    {stats.doctors + stats.leaders + stats.laboratories + stats.medicalCenters}
                  </span>
                  <span className="block text-[10px] text-gray-500 font-bold">مرکز/شخص</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= بخش ابزارها و وضعیت سرور (UI نمایشی) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* وضعیت سرور */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-white">
            <h3 className="font-bold mb-5 flex items-center gap-2 border-b border-gray-700 pb-3 text-gray-100">
              <Server size={18} className="text-emerald-400" />
              وضعیت پایداری سرور و دیتابیس
            </h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-400">مصرف CPU (نرمال)</span>
                  <span className="text-emerald-400">24%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-400">فضای RAM (پایدار)</span>
                  <span className="text-blue-400">4.2GB / 16GB</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-400 flex items-center gap-1"><Database size={12}/> وضعیت دیتابیس</span>
                  <span className="text-emerald-400 flex items-center gap-1"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div> متصل و آنلاین</span>
                </div>
              </div>
            </div>
          </div>

          {/* دسترسی‌های سریع */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Settings size={18} className="text-gray-500" />
              عملیات و دسترسی‌های سریع
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gadget-light/10 border border-gray-100 rounded-xl transition-colors cursor-pointer group">
                <Users className="text-gray-400 group-hover:text-gadget-dark mb-2 transition-colors" size={24} />
                <span className="text-xs font-bold text-gray-600 group-hover:text-gadget-dark">مدیریت کاربران</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gadget-light/10 border border-gray-100 rounded-xl transition-colors cursor-pointer group">
                <Activity className="text-gray-400 group-hover:text-gadget-dark mb-2 transition-colors" size={24} />
                <span className="text-xs font-bold text-gray-600 group-hover:text-gadget-dark">گزارش‌گیری سیستم</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gadget-light/10 border border-gray-100 rounded-xl transition-colors cursor-pointer group">
                <ShieldAlert className="text-gray-400 group-hover:text-gadget-dark mb-2 transition-colors" size={24} />
                <span className="text-xs font-bold text-gray-600 group-hover:text-gadget-dark">بررسی لاگ‌های امنیتی</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gadget-light/10 border border-gray-100 rounded-xl transition-colors cursor-pointer group">
                <Settings className="text-gray-400 group-hover:text-gadget-dark mb-2 transition-colors" size={24} />
                <span className="text-xs font-bold text-gray-600 group-hover:text-gadget-dark">تنظیمات اصلی سایت</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}