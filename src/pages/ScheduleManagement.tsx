import { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Trash2, Save, 
  ChevronLeft, AlertCircle, CalendarCheck,
  CheckCircle2, XCircle, Loader2, LayoutList
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

// === تایپ‌های مربوط به دیتای موجود (GET) ===
interface ExistingSlot {
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | string;
}

interface DailySchedule {
  date: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  slots: ExistingSlot[];
}

// === تایپ‌های مربوط به فرم ثبت (POST) ===
interface Period {
  startTime: string;
  endTime: string;
}

interface ScheduleItem {
  date: string;
  slotDuration: number;
  periods: Period[];
}

export default function ScheduleManagement() {
  // --- استیت‌های مشترک و فرم ---
  const [currentDate, setCurrentDate] = useState('');
  const [currentDuration, setCurrentDuration] = useState(30);
  const [currentPeriods, setCurrentPeriods] = useState<Period[]>([{ startTime: '08:00', endTime: '12:00' }]);
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([]);

  // --- استیت‌های مربوط به واکشی دیتای موجود (GET) ---
  const [existingSchedule, setExistingSchedule] = useState<DailySchedule | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // واکشی خودکار برنامه فعلی وقتی پزشک تاریخی را انتخاب می‌کند
  useEffect(() => {
    const fetchExistingSchedule = async () => {
      if (!currentDate) {
        setExistingSchedule(null);
        return;
      }
      
      try {
        setLoadingExisting(true);
        const response = await api.get(`/doctor/getDoctorDailySchedule?date=${currentDate}`);
        if (response.data && response.data.success) {
          setExistingSchedule(response.data);
        }
      } catch (err) {
        // اگر دیتایی نبود یا ارور داد، یعنی برنامه‌ای برای این روز ثبت نشده
        setExistingSchedule(null);
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchExistingSchedule();
  }, [currentDate]);

  // --- توابع مدیریت فرم ---
  const addPeriodRow = () => setCurrentPeriods([...currentPeriods, { startTime: '', endTime: '' }]);
  
  const removePeriodRow = (index: number) => {
    if (currentPeriods.length > 1) {
      setCurrentPeriods(currentPeriods.filter((_, i) => i !== index));
    }
  };

  const handlePeriodChange = (index: number, field: keyof Period, value: string) => {
    const updated = [...currentPeriods];
    updated[index][field] = value;
    setCurrentPeriods(updated);
  };

  const addToBatch = () => {
    if (!currentDate) {
      toast.error('لطفاً ابتدا تاریخ را انتخاب کنید');
      return;
    }
    if (scheduleList.find(item => item.date === currentDate)) {
      toast.error('برنامه این تاریخ قبلاً در لیست انتظار اضافه شده است.');
      return;
    }

    const newItem: ScheduleItem = {
      date: currentDate,
      slotDuration: currentDuration,
      periods: [...currentPeriods]
    };

    setScheduleList([...scheduleList, newItem]);
    toast.success(`برنامه تاریخ ${currentDate} به لیست انتظار اضافه شد`);
    
    // آماده‌سازی برای روز بعدی اما نگه‌داشتن تنظیمات ساعت
    setCurrentDate('');
  };

  const removeFromBatch = (index: number) => {
    setScheduleList(scheduleList.filter((_, i) => i !== index));
  };

  const handleSubmitAll = async () => {
    if (scheduleList.length === 0) {
      toast.error('لیست برنامه خالی است!');
      return;
    }

    const payload = { schedules: scheduleList };
    const savePromise = api.post('/book/schedule', payload);

    toast.promise(
      savePromise,
      {
        loading: 'در حال ثبت برنامه‌ها در سیستم...',
        success: () => {
          setScheduleList([]);
          // اگر تاریخ فعلی پر است، دیتای موجود را رفرش کن تا تغییرات را ببیند
          if (currentDate) {
            setCurrentDate(''); // ترفند ساده برای رفرش کردن صفحه از طریق useEffect
            setTimeout(() => setCurrentDate(scheduleList[scheduleList.length - 1].date), 100);
          }
          return 'تمامی برنامه‌ها با موفقیت ثبت شدند';
        },
        error: (err) => err.response?.data?.message || 'خطا در ثبت برنامه. لطفاً زمان‌ها را بررسی کنید.'
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* هدر صفحه */}
        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
          <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
            <CalendarCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">مدیریت جامع تقویم ویزیت‌ها</h1>
            <p className="text-gray-500 text-sm mt-1">برنامه فعلی را ببینید و شیفت‌های جدید را اضافه کنید</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- ستون اول: انتخاب تاریخ و نمایش برنامه فعلی (GET) --- */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* انتخاب تاریخ (مرکز فرماندهی این صفحه) */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">ابتدا تاریخ مورد نظر را انتخاب کنید:</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-3 text-gadget-light" size={18} />
                <input 
                  type="date" 
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light cursor-pointer shadow-sm font-medium" 
                />
              </div>
            </div>

            {/* باکسی که به صورت زنده دیتای API را نشان می‌دهد */}
            {currentDate && (
              <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-xs animate-in fade-in slide-in-from-bottom-2">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <LayoutList size={16} className="text-gadget-dark" />
                  وضعیت نوبت‌ها در این تاریخ
                </h3>

                {loadingExisting ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gadget-light">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <p className="text-xs font-medium">در حال بررسی تقویم...</p>
                  </div>
                ) : existingSchedule && existingSchedule.slots.length > 0 ? (
                  <div className="space-y-4">
                    {/* آمارهای کوچک */}
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md">{existingSchedule.availableSlots} خالی</span>
                      <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-md">{existingSchedule.bookedSlots} رزرو شده</span>
                    </div>

                    {/* لیست ساعت‌ها */}
                    <div className="grid grid-cols-2 gap-2 max-h-75 overflow-y-auto custom-scrollbar pr-1">
                      {existingSchedule.slots.map((slot, index) => {
                        const isAvailable = slot.status === 'AVAILABLE';
                        return (
                          <div 
                            key={index} 
                            className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1
                              ${isAvailable ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-70'}`}
                          >
                            <span className="font-bold text-sm tracking-wider text-gray-800" dir="ltr">{slot.startTime}</span>
                            {isAvailable ? (
                              <span className="text-[9px] font-bold text-gadget-light flex items-center gap-0.5"><CheckCircle2 size={10}/> خالی</span>
                            ) : (
                              <span className="text-[9px] font-bold text-orange-500 flex items-center gap-0.5"><XCircle size={10}/> رزرو شده</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle size={28} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">هیچ شیفتی در این روز ثبت نشده است.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- ستون دوم: فرم ایجاد شیفت جدید و ثبت نهایی (POST) --- */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className={`transition-opacity duration-300 ${!currentDate ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <h2 className="text-md font-bold text-gray-700 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Plus size={18} className="text-gadget-light" />
                  اضافه کردن شیفت جدید برای {currentDate || '...'}
                </h2>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">مدت زمان هر ویزیت (دقیقه)</label>
                  <select 
                    value={currentDuration}
                    onChange={(e) => setCurrentDuration(Number(e.target.value))}
                    className="w-full sm:w-1/2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-gadget-light"
                  >
                    <option value={15}>۱۵ دقیقه</option>
                    <option value={20}>۲۰ دقیقه</option>
                    <option value={30}>۳۰ دقیقه</option>
                    <option value={45}>۴۵ دقیقه</option>
                    <option value={60}>۱ ساعت</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">بازه های زمانی حضورتان را وارد کنید</label>
                  {currentPeriods.map((period, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">از</span>
                          <input 
                            type="time" value={period.startTime} 
                            onChange={(e) => handlePeriodChange(index, 'startTime', e.target.value)}
                            className="w-full bg-transparent text-sm font-bold outline-hidden" 
                          />
                        </div>
                        <div className="flex items-center gap-2 border-r border-gray-200 pr-2">
                          <span className="text-[10px] text-gray-400">تا</span>
                          <input 
                            type="time" value={period.endTime} 
                            onChange={(e) => handlePeriodChange(index, 'endTime', e.target.value)}
                            className="w-full bg-transparent text-sm font-bold outline-hidden" 
                          />
                        </div>
                      </div>
                      {currentPeriods.length > 1 && (
                        <button onClick={() => removePeriodRow(index)} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button 
                    onClick={addPeriodRow}
                    className="flex items-center gap-2 text-xs font-bold text-gadget-light hover:text-[#239c97] py-2 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    افزودن شیفت دیگر به این روز
                  </button>
                </div>

                <button 
                  onClick={addToBatch}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer"
                >
                  اضافه کردن به لیست ارسال
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            {/* لیست انتظار (Batch) و دکمه نهایی */}
            {scheduleList.length > 0 && (
              <div className="bg-gadget-dark/5 border border-gadget-dark/10 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-sm font-bold text-gadget-dark mb-3">آماده برای ثبت نهایی در سرور:</h3>
                <div className="space-y-2 mb-5">
                  {scheduleList.map((item, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.date}</p>
                        <p className="text-[10px] text-gray-500">{item.periods.length} شیفت (ویزیت‌های {item.slotDuration} دقیقه‌ای)</p>
                      </div>
                      <button onClick={() => removeFromBatch(idx)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                        <XCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={handleSubmitAll}
                  className="w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3.5 rounded-xl text-md font-bold shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer"
                >
                  <Save size={20} />
                  ثبت نهایی تقویم در سیستم
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}