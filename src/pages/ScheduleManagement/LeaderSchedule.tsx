import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Save,
  Compass,
  DollarSign,
  Loader2,
  Plus,
  Trash2,
  Moon,
  Sun,
  Award,
  Lock // 👈 آیکون قفل برای نمایش رزرو
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

interface HourlySlot {
  time: string;
  isBooked: boolean;
}

type ShiftMode = "CLOSED" | "FULL_SHIFT" | "HOURLY";

export default function LeaderSchedule() {
  const { userProfile, refreshProfile } = useAuth();
  
  const [isSubmittingTime, setIsSubmittingTime] = useState(false);
  const [isSubmittingPrice, setIsSubmittingPrice] = useState(false);

  const [pricing, setPricing] = useState({
    fullDay: "",
    dayShift: "",
    nightShift: "",
    hourlyDay: "",
    hourlyNight: "",
  });

  const [currentDate, setCurrentDate] = useState("");
  
  // 👈 استیت جدید برای قفل کردن روزهایی که رزرو دارند
  const [isDayLocked, setIsDayLocked] = useState(false);

  const [dayShiftMode, setDayShiftMode] = useState<ShiftMode>("FULL_SHIFT");
  const [nightShiftMode, setNightShiftMode] = useState<ShiftMode>("CLOSED");

  const [dayStartTime, setDayStartTime] = useState("08:00");
  const [dayEndTime, setDayEndTime] = useState("18:00");
  const [nightStartTime, setNightStartTime] = useState("18:00");
  const [nightEndTime, setNightEndTime] = useState("23:00");

  const [dayHours, setDayHours] = useState<HourlySlot[]>([{ time: "08:00-09:00", isBooked: false }]);
  const [nightHours, setNightHours] = useState<HourlySlot[]>([{ time: "18:00-19:00", isBooked: false }]);

  const isFullDay = dayShiftMode === "FULL_SHIFT" && nightShiftMode === "FULL_SHIFT";

  // ۱. لود اولیه تعرفه‌های قیمت
  useEffect(() => {
    if (userProfile?.pricing) {
      setPricing({
        fullDay: userProfile.pricing.fullDay?.toString() || "",
        dayShift: userProfile.pricing.dayShift?.toString() || "",
        nightShift: userProfile.pricing.nightShift?.toString() || "",
        hourlyDay: userProfile.pricing.hourlyDay?.toString() || "",
        hourlyNight: userProfile.pricing.hourlyNight?.toString() || "",
      });
    }
  }, [userProfile]);

  // ۲. لود خودکار شیفت‌ها و ساعت‌ها با انتخاب تقویم
  useEffect(() => {
    if (!currentDate) {
      setIsDayLocked(false);
      return;
    }

    const existingDay = userProfile?.availableDays?.find((d: any) => d.date === currentDate);

    if (existingDay) {
      // 👈 بررسی اینکه آیا در این روز رزروی انجام شده یا خیر
      const hasBookings = 
        existingDay.isFullDayBooked ||
        existingDay.dayShift?.isBooked ||
        existingDay.nightShift?.isBooked ||
        existingDay.dayShift?.hours?.some((h: any) => h.isBooked) ||
        existingDay.nightShift?.hours?.some((h: any) => h.isBooked);

      setIsDayLocked(!!hasBookings); // اگر رزرو داشت، روز قفل می‌شود

      // --- بارگذاری تنظیمات شیفت روز ---
      if (existingDay.dayShift) {
        setDayStartTime(existingDay.dayShift.startTime || "08:00");
        setDayEndTime(existingDay.dayShift.endTime || "14:00");
        
        if (existingDay.dayShift.hours && existingDay.dayShift.hours.length > 0) {
          setDayShiftMode("HOURLY");
          setDayHours(existingDay.dayShift.hours.map((h: any) => ({ time: h.time, isBooked: h.isBooked })));
        } else {
          setDayShiftMode("FULL_SHIFT");
          setDayHours([{ time: "08:00-09:00", isBooked: false }]); 
        }
      } else {
        setDayShiftMode("CLOSED");
        setDayStartTime("08:00");
        setDayEndTime("14:00");
      }

      // --- بارگذاری تنظیمات شیفت شب ---
      if (existingDay.nightShift) {
        setNightStartTime(existingDay.nightShift.startTime || "17:00");
        setNightEndTime(existingDay.nightShift.endTime || "23:00");
        
        if (existingDay.nightShift.hours && existingDay.nightShift.hours.length > 0) {
          setNightShiftMode("HOURLY");
          setNightHours(existingDay.nightShift.hours.map((h: any) => ({ time: h.time, isBooked: h.isBooked })));
        } else {
          setNightShiftMode("FULL_SHIFT");
          setNightHours([{ time: "17:00-18:00", isBooked: false }]); 
        }
      } else {
        setNightShiftMode("CLOSED");
        setNightStartTime("17:00");
        setNightEndTime("23:00");
      }

    } else {
      // فرم خالی برای روز جدید
      setIsDayLocked(false);
      setDayShiftMode("FULL_SHIFT");
      setNightShiftMode("CLOSED");
      setDayStartTime("08:00");
      setDayEndTime("14:00");
      setNightStartTime("17:00");
      setNightEndTime("23:00");
      setDayHours([{ time: "08:00-09:00", isBooked: false }]);
      setNightHours([{ time: "17:00-18:00", isBooked: false }]);
    }
  }, [currentDate, userProfile]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPricing({ ...pricing, [e.target.name]: e.target.value.replace(/\D/g, "") });
  };

  const handleDateChange = (date: any) => {
    if (date && date.isValid) {
      const jsDate = date.toDate();
      const year = jsDate.getFullYear();
      const month = String(jsDate.getMonth() + 1).padStart(2, "0");
      const day = String(jsDate.getDate()).padStart(2, "0");
      setCurrentDate(`${year}-${month}-${day}`);
    } else {
      setCurrentDate("");
    }
  };

  const addDayHourRow = () => setDayHours([...dayHours, { time: "", isBooked: false }]);
  const removeDayHourRow = (idx: number) => setDayHours(dayHours.filter((_, i) => i !== idx));
  const handleDayHourChange = (idx: number, val: string) => {
    const updated = [...dayHours];
    updated[idx].time = val;
    setDayHours(updated);
  };

  const addNightHourRow = () => setNightHours([...nightHours, { time: "", isBooked: false }]);
  const removeNightHourRow = (idx: number) => setNightHours(nightHours.filter((_, i) => i !== idx));
  const handleNightHourChange = (idx: number, val: string) => {
    const updated = [...nightHours];
    updated[idx].time = val;
    setNightHours(updated);
  };

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPrice(true);
    try {
      const payload = {
        pricing: {
          fullDay: Number(pricing.fullDay) || 0,
          dayShift: Number(pricing.dayShift) || 0,
          nightShift: Number(pricing.nightShift) || 0,
          hourlyDay: Number(pricing.hourlyDay) || 0,
          hourlyNight: Number(pricing.hourlyNight) || 0,
        }
      };
      const response = await api.put("/leader/updateLeaderPricing", payload);
      if (response.data?.success) {
        toast.success(response.data.message || "تعرفه‌ها با موفقیت بروزرسانی شدند.");
        await refreshProfile();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در آپدیت لیست قیمت‌ها.");
    } finally {
      setIsSubmittingPrice(false);
    }
  };

  const handleAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDayLocked) return; // اطمینان از عدم ارسال اگر روز قفل است

    if (!currentDate) {
      toast.error("لطفاً ابتدا تاریخ مورد نظر خود را از تقویم انتخاب کنید.");
      return;
    }

    if (dayShiftMode === "CLOSED" && nightShiftMode === "CLOSED") {
      toast.error("لطفاً حداقل وضعیت یکی از شیفت‌ها را فعال کنید.");
      return;
    }

    setIsSubmittingTime(true);
    try {
      const payload = {
        availableDays: [
          {
            date: currentDate,
            isFullDayBooked: false, 
            dayShift: dayShiftMode !== "CLOSED" ? {
              startTime: dayStartTime,
              endTime: dayEndTime,
              isBooked: false,
              hours: dayShiftMode === "HOURLY" ? dayHours.filter(h => h.time !== "") : []
            } : null,
            nightShift: nightShiftMode !== "CLOSED" ? {
              startTime: nightStartTime,
              endTime: nightEndTime,
              isBooked: false,
              hours: nightShiftMode === "HOURLY" ? nightHours.filter(h => h.time !== "") : []
            } : null
          }
        ]
      };

      const response = await api.put("/leader/updateLeaderAvailability", payload);
      if (response.data?.success) {
        toast.success(response.data.message || "برنامه زمانی این تاریخ ثبت و تایید شد.");
        await refreshProfile();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در ثبت شیفت‌های کاری.");
    } finally {
      setIsSubmittingTime(false);
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return "---";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  // چک کردن اینکه آیا کل روز رزرو است یا خیر
  const isFullDayReserved = userProfile?.availableDays?.find((d: any) => d.date === currentDate)?.isFullDayBooked;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-xs border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* هدر صفحه */}
        <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-6">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Compass size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">مدیریت زمان‌بندی هوشمند لیدر</h1>
            <p className="text-gray-500 text-sm mt-1">تنظیم نوع فعالیت (روزانه، شیفتی یا ساعتی داینامیک) و هزینه خدمات</p>
          </div>
        </div>

        {/* ================= بخش مدیریت تعرفه‌ها ================= */}
        <form onSubmit={handlePricingSubmit} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-200 pb-2">
            <DollarSign size={16} className="text-emerald-500" /> مدیریت قیمت‌گذاری و دستمزدها
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">رزرو تمام روز</label>
              <input type="text" name="fullDay" value={pricing.fullDay} onChange={handlePriceChange} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-hidden font-medium text-left" dir="ltr" placeholder="0" />
              <span className="text-[10px] text-emerald-600 mt-1 block font-sans text-center">{formatPrice(Number(pricing.fullDay))}</span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">کل شیفت روز</label>
              <input type="text" name="dayShift" value={pricing.dayShift} onChange={handlePriceChange} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-hidden font-medium text-left" dir="ltr" placeholder="0" />
              <span className="text-[10px] text-emerald-600 mt-1 block font-sans text-center">{formatPrice(Number(pricing.dayShift))}</span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">کل شیفت شب</label>
              <input type="text" name="nightShift" value={pricing.nightShift} onChange={handlePriceChange} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-hidden font-medium text-left" dir="ltr" placeholder="0" />
              <span className="text-[10px] text-emerald-600 mt-1 block font-sans text-center">{formatPrice(Number(pricing.nightShift))}</span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">ساعتی روز</label>
              <input type="text" name="hourlyDay" value={pricing.hourlyDay} onChange={handlePriceChange} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-hidden font-medium text-left" dir="ltr" placeholder="0" />
              <span className="text-[10px] text-emerald-600 mt-1 block font-sans text-center">{formatPrice(Number(pricing.hourlyDay))}</span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">ساعتی شب</label>
              <input type="text" name="hourlyNight" value={pricing.hourlyNight} onChange={handlePriceChange} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-hidden font-medium text-left" dir="ltr" placeholder="0" />
              <span className="text-[10px] text-emerald-600 mt-1 block font-sans text-center">{formatPrice(Number(pricing.hourlyNight))}</span>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmittingPrice} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-70">
              {isSubmittingPrice ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              بروزرسانی تعرفه‌ها
            </button>
          </div>
        </form>

        {/* ================= تقویم و انتخاب روز ================= */}
        <div className="space-y-6">
          <div className="bg-blue-50/40 border border-blue-100 p-5 rounded-2xl space-y-4">
            <label className="block text-sm font-bold text-blue-900">۱. ابتدا تاریخ کاری مورد نظر را انتخاب کنید:</label>
            <div className="relative md:w-1/2">
              <Calendar className="absolute right-3 top-3 text-gadget-light" size={18} />
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={currentDate ? new Date(currentDate) : ""}
                onChange={handleDateChange}
                format="YYYY/MM/DD"
                containerClassName="w-full"
                inputClass="w-full bg-white border border-blue-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden cursor-pointer shadow-2xs font-bold text-gray-700"
                placeholder="انتخاب تاریخ فعال‌سازی شیفت..."
              />
            </div>
          </div>

          {/* 👈 هشدار قفل بودن روز (اگر رزروی ثبت شده باشد) */}
          {currentDate && isDayLocked && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
              <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-red-800">این روز دارای رزرو فعال است</h4>
                <p className="text-xs text-red-600 mt-1 leading-relaxed">
                  بخشی یا تمام این تاریخ توسط بیماران رزرو شده است. جهت جلوگیری از اختلال در برنامه‌ی بیماران، امکان ویرایش یا حذف شیفت‌های این روز وجود ندارد.
                </p>
              </div>
            </div>
          )}

          {/* ================= فرم تنظیمات داینامیک شیفت لیدر ================= */}
          <form onSubmit={handleAvailabilitySubmit} className={`space-y-6 transition-opacity duration-300 ${!currentDate ? "opacity-45 pointer-events-none" : "opacity-100"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1"><Award size={16} className="text-amber-500"/> ۲. نوع زمان‌بندی و ساعت‌های حضور خود را پیکربندی کنید:</h3>
              
              {isFullDay && (
                <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1 rounded-full animate-in fade-in flex items-center gap-1">
                  نوع پوشش: روزانه (تمام‌وقت) {isFullDayReserved && <Lock size={12} className="text-red-500 mr-1"/>}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ----------------- شیفت روز ----------------- */}
              <div className={`bg-white border ${isDayLocked ? "border-red-100 bg-red-50/20" : "border-gray-200"} rounded-2xl p-5 space-y-4 shadow-2xs relative`}>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="font-bold text-sm text-amber-700 flex items-center gap-1.5">
                    <Sun size={16} /> شیفت روز
                    {/* برچسب رزرو کل شیفت */}
                    {userProfile?.availableDays?.find((d: any) => d.date === currentDate)?.dayShift?.isBooked && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-md flex items-center gap-1"><Lock size={10}/> رزرو شده</span>
                    )}
                  </h4>
                  <select 
                    value={dayShiftMode} 
                    onChange={(e) => setDayShiftMode(e.target.value as ShiftMode)}
                    disabled={isDayLocked}
                    className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold px-2.5 py-1 text-gray-700 outline-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="FULL_SHIFT">کل شیفت (ثابت)</option>
                    <option value="HOURLY">ساعتی (انتخاب بازه)</option>
                    <option value="CLOSED">تعطیل / غیرفعال</option>
                  </select>
                </div>

                {dayShiftMode !== "CLOSED" ? (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex gap-3 text-xs">
                      <div className="flex-1">
                        <span className="text-gray-400 block mb-1">شروع شیفت</span>
                        <input type="time" disabled={isDayLocked} value={dayStartTime} onChange={(e) => setDayStartTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 font-bold disabled:opacity-60 disabled:cursor-not-allowed" />
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-400 block mb-1">پایان شیفت</span>
                        <input type="time" disabled={isDayLocked} value={dayEndTime} onChange={(e) => setDayEndTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 font-bold disabled:opacity-60 disabled:cursor-not-allowed" />
                      </div>
                    </div>

                    {dayShiftMode === "HOURLY" && (
                      <div className="space-y-2 pt-2 animate-in slide-in-from-top-2 duration-150">
                        <span className="text-xs font-bold text-gray-500 block">ساعت‌های آزاد روز:</span>
                        {dayHours.map((h, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 ${h.isBooked ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} px-2 py-1 rounded-lg border flex-1`}>
                              <Clock size={12} className={h.isBooked ? 'text-red-400' : 'text-gray-400'} />
                              <input type="text" disabled={isDayLocked} placeholder="مثال: 08:00-09:00" value={h.time} onChange={(e) => handleDayHourChange(index, e.target.value)} className={`bg-transparent border-none outline-hidden text-xs font-bold w-full ${h.isBooked ? 'text-red-700' : ''} disabled:cursor-not-allowed`} dir="ltr" />
                              {/* برچسب رزرو ساعت */}
                              {h.isBooked && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 shrink-0 bg-red-100 px-1.5 rounded"><Lock size={10}/> رزرو</span>}
                            </div>
                            {!isDayLocked && dayHours.length > 1 && (
                              <button type="button" onClick={() => removeDayHourRow(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        {!isDayLocked && (
                          <button type="button" onClick={addDayHourRow} className="text-[11px] text-blue-600 font-bold flex items-center gap-0.5 pt-1">
                            <Plus size={12}/> افزودن بازه جدید
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-100">
                    شیفت روز غیرفعال است.
                  </div>
                )}
              </div>

              {/* ----------------- شیفت شب ----------------- */}
              <div className={`bg-white border ${isDayLocked ? "border-red-100 bg-red-50/20" : "border-gray-200"} rounded-2xl p-5 space-y-4 shadow-2xs relative`}>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="font-bold text-sm text-blue-900 flex items-center gap-1.5">
                    <Moon size={16} /> شیفت شب
                    {/* برچسب رزرو کل شیفت */}
                    {userProfile?.availableDays?.find((d: any) => d.date === currentDate)?.nightShift?.isBooked && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-md flex items-center gap-1"><Lock size={10}/> رزرو شده</span>
                    )}
                  </h4>
                  <select 
                    value={nightShiftMode} 
                    onChange={(e) => setNightShiftMode(e.target.value as ShiftMode)}
                    disabled={isDayLocked}
                    className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold px-2.5 py-1 text-gray-700 outline-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="FULL_SHIFT">کل شیفت (ثابت)</option>
                    <option value="HOURLY">ساعتی (انتخاب بازه)</option>
                    <option value="CLOSED">تعطیل / غیرفعال</option>
                  </select>
                </div>

                {nightShiftMode !== "CLOSED" ? (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex gap-3 text-xs">
                      <div className="flex-1">
                        <span className="text-gray-400 block mb-1">شروع شیفت</span>
                        <input type="time" disabled={isDayLocked} value={nightStartTime} onChange={(e) => setNightStartTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 font-bold disabled:opacity-60 disabled:cursor-not-allowed" />
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-400 block mb-1">پایان شیفت</span>
                        <input type="time" disabled={isDayLocked} value={nightEndTime} onChange={(e) => setNightEndTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 font-bold disabled:opacity-60 disabled:cursor-not-allowed" />
                      </div>
                    </div>

                    {nightShiftMode === "HOURLY" && (
                      <div className="space-y-2 pt-2 animate-in slide-in-from-top-2 duration-150">
                        <span className="text-xs font-bold text-gray-500 block">ساعت‌های آزاد شب:</span>
                        {nightHours.map((h, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 ${h.isBooked ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} px-2 py-1 rounded-lg border flex-1`}>
                              <Clock size={12} className={h.isBooked ? 'text-red-400' : 'text-gray-400'} />
                              <input type="text" disabled={isDayLocked} placeholder="مثال: 19:00-20:00" value={h.time} onChange={(e) => handleNightHourChange(index, e.target.value)} className={`bg-transparent border-none outline-hidden text-xs font-bold w-full ${h.isBooked ? 'text-red-700' : ''} disabled:cursor-not-allowed`} dir="ltr" />
                              {/* برچسب رزرو ساعت */}
                              {h.isBooked && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 shrink-0 bg-red-100 px-1.5 rounded"><Lock size={10}/> رزرو</span>}
                            </div>
                            {!isDayLocked && nightHours.length > 1 && (
                              <button type="button" onClick={() => removeNightHourRow(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        {!isDayLocked && (
                          <button type="button" onClick={addNightHourRow} className="text-[11px] text-blue-600 font-bold flex items-center gap-0.5 pt-1">
                            <Plus size={12}/> افزودن بازه جدید
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-100">
                    شیفت شب غیرفعال است.
                  </div>
                )}
              </div>

            </div>

            {/* دکمه ارسال نهایی */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmittingTime || isDayLocked} // 👈 قفل شدن دکمه در صورت رزرو
                className={`text-sm font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-md transition-all ${isDayLocked ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gadget-dark hover:bg-gadget-dark/90 text-white cursor-pointer disabled:opacity-70"}`}
              >
                {isSubmittingTime ? <Loader2 className="animate-spin" size={16} /> : (isDayLocked ? <Lock size={16}/> : <Save size={16} />)}
                {isSubmittingTime ? "در حال ثبت برنامه..." : (isDayLocked ? "غیرقابل ویرایش" : "ثبت نهایی برنامه زمانی")}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}