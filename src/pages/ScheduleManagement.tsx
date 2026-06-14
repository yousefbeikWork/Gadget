import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Calendar,
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  LayoutList,
  Users, // اضافه شدن آیکون
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// === تایپ‌های مربوط به دیتای موجود (GET) ===
interface ExistingSlot {
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | string;
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

interface ClinicDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  Expertise: string;
}

export default function ScheduleManagement() {
  const { userProfile, userRole } = useAuth();
  const location = useLocation();

  // === استیت‌های مربوط به کلینیک ===
  const [clinicDoctors, setClinicDoctors] = useState<ClinicDoctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // === استیت‌های فرم و تقویم ===
  const [currentDate, setCurrentDate] = useState("");
  const [currentDuration, setCurrentDuration] = useState(30);
  const [currentPeriods, setCurrentPeriods] = useState<Period[]>([
    { startTime: "08:00", endTime: "12:00" },
  ]);
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([]);

  const [existingSchedule, setExistingSchedule] =
    useState<DailySchedule | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // 1️⃣ تعیین آیدی پزشکی که باید تقویمش مدیریت شود
  const targetDoctorId =
    userRole === "MedicalCenter" ? selectedDoctorId : userProfile?._id;

  // 2️⃣ دریافت لیست پزشکان (فقط اگر کاربر کلینیک باشد)
  useEffect(() => {
    if (userRole === "MedicalCenter" && userProfile?._id) {
      const fetchDoctors = async () => {
        setLoadingDoctors(true);
        try {
          const response = await api.post("/doctor/listDctorsClinic", {
            clinicId: userProfile._id,
          });
          if (response.data && response.data.success) {
            setClinicDoctors(response.data.doctors);

            // بررسی استیت ارسالی از صفحه پزشکان کلینیک
            if (location.state?.doctorId) {
              setSelectedDoctorId(location.state.doctorId);
            } else if (response.data.doctors.length > 0) {
              setSelectedDoctorId(response.data.doctors[0]._id);
            }
          }
        } catch (err) {
          toast.error("خطا در دریافت لیست پزشکان کلینیک");
        } finally {
          setLoadingDoctors(false);
        }
      };
      fetchDoctors();
    }
  }, [userRole, userProfile?._id, location.state?.doctorId]);

  // 3️⃣ واکشی خودکار برنامه فعلی پزشک هدف
  useEffect(() => {
    const fetchExistingSchedule = async () => {
      // اگر تاریخ انتخاب نشده یا آیدی دکتری وجود نداشت، چیزی لود نکن
      if (!currentDate || !targetDoctorId) {
        setExistingSchedule(null);
        return;
      }

      try {
        setLoadingExisting(true);
        // ارسال doctorId به همراه تاریخ برای دریافت تقویم مختص همان پزشک
        const response = await api.get(
          `/doctor/getDoctorDailySchedule?date=${currentDate}&doctorId=${targetDoctorId}`,
        );
        if (response.data && response.data.success) {
          setExistingSchedule(response.data);
        }
      } catch (err) {
        setExistingSchedule(null);
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchExistingSchedule();
  }, [currentDate, targetDoctorId]);

  // --- توابع مدیریت فرم ---
  const addPeriodRow = () =>
    setCurrentPeriods([...currentPeriods, { startTime: "", endTime: "" }]);

  const removePeriodRow = (index: number) => {
    if (currentPeriods.length > 1) {
      setCurrentPeriods(currentPeriods.filter((_, i) => i !== index));
    }
  };

  const handlePeriodChange = (
    index: number,
    field: keyof Period,
    value: string,
  ) => {
    const updated = [...currentPeriods];
    updated[index][field] = value;
    setCurrentPeriods(updated);
  };

  const addToBatch = () => {
    if (!targetDoctorId) {
      toast.error("لطفاً ابتدا یک پزشک را انتخاب کنید");
      return;
    }
    if (!currentDate) {
      toast.error("لطفاً ابتدا تاریخ را انتخاب کنید");
      return;
    }
    if (scheduleList.find((item) => item.date === currentDate)) {
      toast.error("برنامه این تاریخ قبلاً در لیست انتظار اضافه شده است.");
      return;
    }

    const newItem: ScheduleItem = {
      date: currentDate,
      slotDuration: currentDuration,
      periods: [...currentPeriods],
    };

    setScheduleList([...scheduleList, newItem]);
    toast.success(`برنامه تاریخ ${currentDate} به لیست انتظار اضافه شد`);

    setCurrentDate("");
  };

  const removeFromBatch = (index: number) => {
    setScheduleList(scheduleList.filter((_, i) => i !== index));
  };

  // 4️⃣ ارسال تمامی نوبت‌های لیست به سرور
  const handleSubmitAll = async () => {
    if (scheduleList.length === 0) {
      toast.error("لیست برنامه خالی است!");
      return;
    }

    // ارسال doctorId در کنار لیست نوبت‌ها
    const payload = {
      doctorId: targetDoctorId,
      schedules: scheduleList,
    };

    const savePromise = api.post("/book/schedule", payload);

    toast.promise(savePromise, {
      loading: "در حال ثبت برنامه‌ها در سیستم...",
      success: () => {
        setScheduleList([]);
        if (currentDate) {
          setCurrentDate("");
          setTimeout(
            () => setCurrentDate(scheduleList[scheduleList.length - 1].date),
            100,
          );
        }
        return "تمامی برنامه‌ها با موفقیت ثبت شدند";
      },
      error: (err) =>
        err.response?.data?.message ||
        "خطا در ثبت برنامه. لطفاً زمان‌ها را بررسی کنید.",
    });
  };

  // 5️⃣ تابع حذف برنامه یک روز کامل
  const handleDeleteDaySchedule = () => {
    if (!currentDate || !existingSchedule || !targetDoctorId) return;

    if (existingSchedule.bookedSlots > 0) {
      toast.error(
        "به دلیل وجود نوبت‌های رزرو شده، امکان حذف برنامه این روز وجود ندارد.",
      );
      return;
    }

    if (
      !window.confirm(
        `آیا از لغو و حذف تمامی نوبت‌های تاریخ ${currentDate} کاملاً مطمئن هستید؟ این عملیات قابل بازگشت نیست.`,
      )
    ) {
      return;
    }

    // ارسال doctorId همراه با درخواست حذف
    const deletePromise = api.delete("/book/schedule/day", {
      data: {
        date: currentDate,
        doctorId: targetDoctorId,
      },
    });

    toast.promise(deletePromise, {
      loading: "در حال حذف برنامه‌های این روز...",
      success: () => {
        setExistingSchedule(null);
        return `تمامی نوبت‌های تاریخ ${currentDate} با موفقیت حذف شدند`;
      },
      error: (err) => err.response?.data?.message || "خطا در حذف برنامه.",
    });
  };

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
          <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
            <CalendarCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              مدیریت جامع تقویم ویزیت‌ها
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {userRole === "MedicalCenter"
                ? "برنامه‌ریزی و مدیریت ساعات حضور پزشکان کلینیک"
                : "برنامه فعلی را ببینید و شیفت‌های جدید را اضافه کنید"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            {/* ================= منوی انتخاب پزشک (مخصوص کلینیک) ================= */}
            {userRole === "MedicalCenter" && (
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 animate-in fade-in">
                <label className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Users size={18} />
                  پزشک مورد نظر را انتخاب کنید:
                </label>

                {loadingDoctors ? (
                  <div className="flex items-center gap-2 text-blue-600 text-sm py-2">
                    <Loader2 className="animate-spin" size={16} /> در حال
                    بارگذاری پزشکان...
                  </div>
                ) : clinicDoctors.length === 0 ? (
                  <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                    هیچ پزشکی در کلینیک شما ثبت نشده است. ابتدا یک پزشک اضافه
                    کنید.
                  </div>
                ) : (
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-blue-400 text-gray-700 font-bold shadow-sm cursor-pointer"
                  >
                    <option value="" disabled>
                      لطفاً یک پزشک را انتخاب کنید
                    </option>
                    {clinicDoctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        دکتر {doc.firstName} {doc.lastName} ({doc.Expertise})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div
              className={`bg-gray-50 p-6 rounded-2xl border border-gray-100 transition-opacity duration-300 ${!targetDoctorId ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ابتدا تاریخ مورد نظر را انتخاب کنید:
              </label>
              <div className="relative">
                <Calendar
                  className="absolute right-3 top-3 text-gadget-light"
                  size={18}
                />
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light cursor-pointer shadow-sm font-medium"
                />
              </div>
            </div>

            {currentDate && (
              <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-xs animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <LayoutList size={16} className="text-gadget-dark" />
                    وضعیت نوبت‌ها در این تاریخ
                  </h3>

                  {existingSchedule &&
                    existingSchedule.slots.length > 0 &&
                    (existingSchedule.bookedSlots > 0 ? (
                      <button
                        disabled
                        className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-not-allowed border border-gray-200"
                        title="به دلیل داشتن نوبت رزرو شده، امکان حذف وجود ندارد"
                      >
                        <Trash2 size={14} className="opacity-50" />
                        غیرقابل حذف
                      </button>
                    ) : (
                      <button
                        onClick={handleDeleteDaySchedule}
                        className="text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="حذف کل برنامه این روز"
                      >
                        <Trash2 size={14} />
                        لغو این روز
                      </button>
                    ))}
                </div>

                {loadingExisting ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gadget-light">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <p className="text-xs font-medium">در حال بررسی تقویم...</p>
                  </div>
                ) : existingSchedule && existingSchedule.slots.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md">
                        {existingSchedule.availableSlots} خالی
                      </span>
                      <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-md">
                        {existingSchedule.bookedSlots} رزرو شده
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-75 overflow-y-auto custom-scrollbar pr-1">
                      {existingSchedule.slots.map((slot, index) => {
                        const isAvailable = slot.status === "AVAILABLE";
                        return (
                          <div
                            key={index}
                            className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1
                              ${isAvailable ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100 opacity-70"}`}
                          >
                            <span
                              className="font-bold text-sm tracking-wider text-gray-800"
                              dir="ltr"
                            >
                              {slot.startTime}
                            </span>
                            {isAvailable ? (
                              <span className="text-[9px] font-bold text-gadget-light flex items-center gap-0.5">
                                <CheckCircle2 size={10} /> خالی
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-orange-500 flex items-center gap-0.5">
                                <XCircle size={10} /> رزرو شده
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle
                      size={28}
                      strokeWidth={1.5}
                      className="mx-auto mb-2 text-gray-300"
                    />
                    <p className="text-sm font-medium text-gray-500">
                      هیچ شیفتی در این روز ثبت نشده است.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div
              className={`transition-opacity duration-300 ${!currentDate || !targetDoctorId ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <h2 className="text-md font-bold text-gray-700 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Plus size={18} className="text-gadget-light" />
                  اضافه کردن شیفت جدید برای {currentDate || "..."}
                </h2>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    مدت زمان هر ویزیت (دقیقه)
                  </label>
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
                  <label className="block text-sm font-bold text-gray-700">
                    بازه های زمانی حضورتان را وارد کنید
                  </label>
                  {currentPeriods.map((period, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">از</span>
                          <input
                            type="time"
                            value={period.startTime}
                            onChange={(e) =>
                              handlePeriodChange(
                                index,
                                "startTime",
                                e.target.value,
                              )
                            }
                            className="w-full bg-transparent text-sm font-bold outline-hidden"
                          />
                        </div>
                        <div className="flex items-center gap-2 border-r border-gray-200 pr-2">
                          <span className="text-[10px] text-gray-400">تا</span>
                          <input
                            type="time"
                            value={period.endTime}
                            onChange={(e) =>
                              handlePeriodChange(
                                index,
                                "endTime",
                                e.target.value,
                              )
                            }
                            className="w-full bg-transparent text-sm font-bold outline-hidden"
                          />
                        </div>
                      </div>
                      {currentPeriods.length > 1 && (
                        <button
                          onClick={() => removePeriodRow(index)}
                          className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={addPeriodRow}
                    className="flex items-center gap-2 text-xs font-bold text-gadget-light hover:opacity-80 py-2 transition-opacity cursor-pointer"
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

            {scheduleList.length > 0 && (
              <div className="bg-gadget-dark/5 border border-gadget-dark/10 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-sm font-bold text-gadget-dark mb-3">
                  آماده برای ثبت نهایی در سرور:
                </h3>
                <div className="space-y-2 mb-5">
                  {scheduleList.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {item.date}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {item.periods.length} شیفت (ویزیت‌های{" "}
                          {item.slotDuration} دقیقه‌ای)
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromBatch(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
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
