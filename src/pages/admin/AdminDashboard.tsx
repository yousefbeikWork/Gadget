import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Stethoscope,
  Compass,
  FlaskConical,
  Building2,
  Hospital as HospitalIcon,
  ShieldAlert,
  Activity,
  Server,
  Database,
  RefreshCcw,
  Settings,
  BellRing,
  CreditCard,
  Edit,
  Check,
  X,
} from "lucide-react";
import api from "../../services/api";

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
  Legend,
} from "recharts";

interface SystemStats {
  patients: number;
  doctors: number;
  leaders: number;
  laboratories: number;
  medicalCenters: number;
  Hospital: number;
  admins?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // استیت‌های مربوط به مدیریت قیمت RFID
  const [rfidPrice, setRfidPrice] = useState<number | null>(null);
  const [isEditingRfid, setIsEditingRfid] = useState(false);
  const [editPriceValue, setEditPriceValue] = useState("");
  const [isUpdatingRfid, setIsUpdatingRfid] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, rfidRes] = await Promise.all([
        api.get("/Admin/getAllItemsCount"),
        api.get("/Admin/rfid-price").catch(() => null),
      ]);

      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (rfidRes?.data?.success) {
        setRfidPrice(rfidRes.data.data.price);
        setEditPriceValue(
          Number(rfidRes.data.data.price).toLocaleString("en-US"),
        );
      }
    } catch (err) {
      setError("خطا در دریافت اطلاعات سیستم. لطفا دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRfidPrice = async () => {
    // 👈 حذف کاماها برای محاسبه مقدار عددی خالص
    const numericValue = Number(editPriceValue.replace(/,/g, ""));

    if (!numericValue || numericValue <= 0) {
      toast.error("لطفاً یک مبلغ معتبر وارد کنید.");
      return;
    }

    setIsUpdatingRfid(true);
    try {
      const response = await api.put("/Admin/rfid-price", {
        price: numericValue,
      });
      if (response.data.success) {
        setRfidPrice(response.data.data.price);
        setIsEditingRfid(false);
        toast.success("قیمت کارت RFID با موفقیت بروزرسانی شد.");
      }
    } catch (error) {
      toast.error("خطا در بروزرسانی قیمت.");
    } finally {
      setIsUpdatingRfid(false);
    }
  };

  // ================= اسکلتون لودینگ ریسپانسیو =================
  if (loading) {
    return (
      <div
        className="bg-gray-50 rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-3 sm:p-5 md:p-8 font-sans animate-pulse"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* اسکلتون هدر */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs">
            <div className="space-y-2">
              <div className="h-6 sm:h-7 w-48 sm:w-64 bg-gray-200 rounded-xl"></div>
              <div className="h-3.5 sm:h-4 w-36 sm:w-48 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
              <div className="w-28 sm:w-32 h-10 bg-gray-200 rounded-xl"></div>
            </div>
          </div>

          {/* اسکلتون کارت‌های آماری */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3.5 sm:p-5 border border-gray-100 shadow-2xs flex flex-col items-center justify-center space-y-2.5"
              >
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gray-100 rounded-2xl"></div>
                <div className="h-6 sm:h-7 w-14 sm:w-16 bg-gray-200 rounded-lg"></div>
                <div className="h-3 w-16 sm:w-20 bg-gray-100 rounded-md"></div>
              </div>
            ))}
          </div>

          {/* اسکلتون نمودارها */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-2xs space-y-4">
              <div className="h-5 w-44 bg-gray-200 rounded-lg"></div>
              <div className="h-60 sm:h-75 w-full bg-gray-50 rounded-xl"></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-2xs flex flex-col space-y-4">
              <div className="h-5 w-36 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 flex items-center justify-center py-6">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-8 border-gray-100"></div>
              </div>
            </div>
          </div>

          {/* اسکلتون ۳ ویجت پایینی */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gray-800 rounded-2xl p-5 shadow-lg h-52"></div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs h-52"></div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs h-52"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-bold border border-red-100 max-w-md mx-auto mt-16 font-sans"
        dir="rtl"
      >
        <ShieldAlert size={40} className="mx-auto mb-3 text-red-400" />
        {error || "داده‌ای برای نمایش وجود ندارد."}
      </div>
    );
  }

  const barChartData = [
    { name: "بیماران", count: stats.patients, color: "#3b82f6" },
    { name: "پزشکان", count: stats.doctors, color: "#10b981" },
    { name: "لیدرها", count: stats.leaders, color: "#f59e0b" },
    { name: "آزمایشگاه", count: stats.laboratories, color: "#8b5cf6" },
    { name: "کلینیک", count: stats.medicalCenters, color: "#ec4899" },
    { name: "بیمارستان", count: stats.Hospital, color: "#14b8a6" },
  ];

  const pieChartData = [
    { name: "پزشکان", value: stats.doctors, color: "#10b981" },
    { name: "لیدرها", value: stats.leaders, color: "#f59e0b" },
    { name: "آزمایشگاه‌ها", value: stats.laboratories, color: "#8b5cf6" },
    { name: "کلینیک‌ها", value: stats.medicalCenters, color: "#ec4899" },
    { name: "بیمارستان‌ها", value: stats.Hospital, color: "#14b8a6" },
  ];

  const statCards = [
    {
      title: "کل بیماران",
      value: stats.patients || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-blue-200",
    },
    {
      title: "پزشکان فعال",
      value: stats.doctors || 0,
      icon: Stethoscope,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      border: "border-emerald-200",
    },
    {
      title: "لیدرهای سیستم",
      value: stats.leaders || 0,
      icon: Compass,
      color: "text-amber-600",
      bg: "bg-amber-100",
      border: "border-amber-200",
    },
    {
      title: "آزمایشگاه‌ها",
      value: stats.laboratories || 0,
      icon: FlaskConical,
      color: "text-violet-600",
      bg: "bg-violet-100",
      border: "border-violet-200",
    },
    {
      title: "کلینیک‌ها",
      value: stats.medicalCenters || 0,
      icon: Building2,
      color: "text-pink-600",
      bg: "bg-pink-100",
      border: "border-pink-200",
    },
    {
      title: "بیمارستان‌ها",
      value: stats.Hospital || 0,
      icon: HospitalIcon,
      color: "text-teal-600",
      bg: "bg-teal-100",
      border: "border-teal-200",
    },
  ];

  return (
    <div
      className="bg-gray-50 rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-3 sm:p-5 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">
        {/* ================= هدر داشبورد ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Activity className="text-gadget-dark shrink-0" size={24} />
              پنل مدیریت کلان (Super Admin)
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              مرور کلی بر وضعیت و آمار کاربران سامانه نوریا
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
            <button
              className="p-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors relative cursor-pointer shrink-0"
              title="اعلانات"
            >
              <BellRing size={18} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            </button>
            <button
              onClick={fetchData}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gadget-dark/10 hover:bg-gadget-dark/20 text-gadget-dark font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-xs sm:text-sm border border-gadget-dark/20"
            >
              <RefreshCcw size={15} />
              <span>بروزرسانی</span>
            </button>
          </div>
        </div>

        {/* ================= کارت‌های آماری بالا ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-3 sm:p-5 border ${card.border} shadow-2xs hover:shadow-sm transition-all flex flex-col items-center justify-center text-center group`}
            >
              <div
                className={`w-11 h-11 sm:w-14 sm:h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform duration-200 shrink-0`}
              >
                <card.icon size={22} className="sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 truncate max-w-full">
                {card.value.toLocaleString()}
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-gray-500 mt-0.5 truncate max-w-full">
                {card.title}
              </p>
            </div>
          ))}
        </div>

        {/* ================= بخش نمودارها ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* نمودار میله‌ای مقایسه‌ای */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-2xs">
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Users size={17} className="text-blue-500 shrink-0" />
              نمودار مقایسه‌ای کاربران سامانه
            </h3>
            <div className="h-64 sm:h-75 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280", fontSize: 11, fontWeight: "bold" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
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

          {/* نمودار دایره‌ای ارائه‌دهندگان */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-2xs flex flex-col">
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-2 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building2 size={17} className="text-purple-500 shrink-0" />
              توزیع ارائه‌دهندگان خدمات
            </h3>
            <div
              className="flex-1 min-h-60 sm:min-h-64 w-full relative"
              dir="ltr"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-7">
                <div className="text-center">
                  <span className="block text-xl sm:text-2xl font-black text-gray-800">
                    {stats.doctors +
                      stats.leaders +
                      stats.laboratories +
                      stats.medicalCenters +
                      (stats.Hospital || 0)}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-bold">
                    مجموع مراکز
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= وضعیت سرور، تنظیمات و RFID (ردیف ۳ ستونه) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* باکس ۱: وضعیت سرور */}
          <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg text-white flex flex-col justify-between">
            <h3 className="text-xs sm:text-sm font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-3 text-gray-100">
              <Server size={17} className="text-emerald-400 shrink-0" />
              وضعیت پایداری سرور و دیتابیس
            </h3>
            <div className="space-y-4 flex-1 justify-center flex flex-col py-1">
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-gray-400">مصرف CPU (پایدار)</span>
                  <span className="text-emerald-400">24%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: "24%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-gray-400">فضای RAM</span>
                  <span className="text-blue-400">4.2GB / 16GB</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "35%" }}
                  ></div>
                </div>
              </div>
              <div className="pt-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Database size={13} /> وضعیت دیتابیس
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    متصل و آنلاین
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* باکس ۲: تنظیمات کارت هوشمند RFID */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-2xs flex flex-col justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <CreditCard size={17} className="text-orange-500 shrink-0" />
              تنظیمات مالی و کارت RFID
            </h3>

            <div className="flex-1 flex flex-col justify-center">
              {!isEditingRfid ? (
                <div className="bg-orange-50/60 rounded-2xl p-5 border border-orange-100/80 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2.5 shadow-2xs">
                    <CreditCard size={24} />
                  </div>

                  <span className="block text-xs text-gray-500 mb-1 font-medium">
                    هزینه صدور و فعال‌سازی کارت RFID
                  </span>

                  <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 flex items-center justify-center gap-1.5">
                    {rfidPrice ? rfidPrice.toLocaleString() : "---"}
                    <span className="text-xs font-bold text-gray-400 mt-1">
                      ریال
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsEditingRfid(true);
                      setEditPriceValue(
                        rfidPrice
                          ? Number(rfidPrice).toLocaleString("en-US")
                          : "",
                      );
                    }}
                    className="w-full py-2.5 bg-white border border-gray-200 hover:border-orange-500 hover:text-orange-600 text-gray-700 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Edit size={15} />
                    <span>ویرایش مبلغ کارت</span>
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3.5 sm:p-4 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-gray-600">
                      مبلغ جدید هزینه صدور
                    </label>
                    <span className="text-[10px] font-bold text-gray-400">
                      واحد: ریال
                    </span>
                  </div>

                  {/* 👈 اینپوت با فرمت خودکار سه رقم سه رقم */}
                  <input
                    type="text"
                    value={editPriceValue}
                    onChange={(e) => {
                      // حذف تمام کاراکترهای غیرعددی
                      const rawDigits = e.target.value.replace(/\D/g, "");
                      // فرمت سه رقم سه رقم
                      setEditPriceValue(
                        rawDigits
                          ? Number(rawDigits).toLocaleString("en-US")
                          : "",
                      );
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-gadget-dark outline-hidden text-left font-mono font-bold text-gray-800"
                    dir="ltr"
                    placeholder="مثال: ۲,۵۰۰,۰۰۰"
                  />

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleUpdateRfidPrice}
                      disabled={isUpdatingRfid}
                      className="flex-1 py-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingRfid ? (
                        "..."
                      ) : (
                        <>
                          <Check size={15} /> تایید
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingRfid(false);
                        setEditPriceValue(
                          rfidPrice
                            ? Number(rfidPrice).toLocaleString("en-US")
                            : "",
                        );
                      }}
                      disabled={isUpdatingRfid}
                      className="flex-1 py-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <X size={15} /> انصراف
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* باکس ۳: دسترسی‌های سریع */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-2xs flex flex-col md:col-span-2 lg:col-span-1">
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Settings size={17} className="text-gray-500 shrink-0" />
              عملیات و دسترسی‌های سریع
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 flex-1">
              <button className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gadget-light/10 border border-gray-100 rounded-xl transition-colors cursor-pointer group">
                <Users
                  className="text-gray-400 group-hover:text-gadget-dark mb-1 transition-colors"
                  size={20}
                />
                <span className="text-[11px] sm:text-xs font-bold text-gray-600 group-hover:text-gadget-dark">
                  مدیریت کاربران
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gadget-light/10 border border-gray-100 rounded-xl transition-colors cursor-pointer group">
                <Activity
                  className="text-gray-400 group-hover:text-gadget-dark mb-1 transition-colors"
                  size={20}
                />
                <span className="text-[11px] sm:text-xs font-bold text-gray-600 group-hover:text-gadget-dark">
                  گزارش‌گیری
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gadget-light/10 border border-gray-100 rounded-xl transition-colors cursor-pointer group">
                <ShieldAlert
                  className="text-gray-400 group-hover:text-gadget-dark mb-1 transition-colors"
                  size={20}
                />
                <span className="text-[11px] sm:text-xs font-bold text-gray-600 group-hover:text-gadget-dark">
                  لاگ‌های امنیتی
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gadget-light/10 border border-gray-100 rounded-xl transition-colors cursor-pointer group">
                <Settings
                  className="text-gray-400 group-hover:text-gadget-dark mb-1 transition-colors"
                  size={20}
                />
                <span className="text-[11px] sm:text-xs font-bold text-gray-600 group-hover:text-gadget-dark">
                  تنظیمات اصلی
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
