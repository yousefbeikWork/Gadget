import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Trash2,
  Save,
  FlaskConical,
  ListPlus,
  LayoutList,
  Loader2,
  AlertCircle,
  Users,
  User,
  Phone,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

// === تایپ‌های مربوط به دریافت رزروهای موجود ===
interface BookedPatient {
  patientId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  nationalId: string;
}

interface ExistingLabSlot {
  slotId: string;
  testId: string;
  testName: string;
  department: string;
  time: string;
  status: string;
  capacity: number;
  reservedCount: number;
  remainingCapacity: number;
  bookedPatients: BookedPatient[];
}

// === تایپ‌های مربوط به فرم ثبت شیفت جدید ===
interface LabSlot {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export default function LaboratorySchedule() {
  const { userProfile } = useAuth();

  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState("");
  const [slots, setSlots] = useState<LabSlot[]>([
    { date: "", startTime: "08:30", endTime: "09:00", capacity: 5 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // استیت‌های مربوط به نمایش نوبت‌های فعلی
  const [existingReservations, setExistingReservations] = useState<
    ExistingLabSlot[]
  >([]);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const formatShamsi = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // گرفتن نوبت‌های روز انتخاب شده از سرور
  useEffect(() => {
    const fetchExistingReservations = async () => {
      if (!currentDate || !userProfile?._id) {
        setExistingReservations([]);
        return;
      }

      try {
        setLoadingExisting(true);
        const response = await api.get(
          `/laboratory/getDailyReservations?date=${currentDate}&laboratoryId=${userProfile._id}`,
        );

        if (response.data && response.data.reservations) {
          // چون ساختار بک‌اند keys داینامیک دارد (مثل additionalProp1)، تمام مقادیر را فلت می‌کنیم
          const allSlots = Object.values(
            response.data.reservations,
          ).flat() as ExistingLabSlot[];
          setExistingReservations(allSlots);
        } else {
          setExistingReservations([]);
        }
      } catch (err) {
        setExistingReservations([]);
        console.error("خطا در دریافت لیست رزروها:", err);
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchExistingReservations();
  }, [currentDate, userProfile?._id]);

  const addSlotRow = () => {
    setSlots([
      ...slots,
      { date: currentDate, startTime: "", endTime: "", capacity: 5 },
    ]);
  };

  const removeSlotRow = (index: number) => {
    if (slots.length > 1) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const handleSlotChange = (
    index: number,
    field: keyof LabSlot,
    value: any,
  ) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const handleDateChange = (date: any) => {
    if (date && date.isValid) {
      const jsDate = date.toDate();
      const year = jsDate.getFullYear();
      const month = String(jsDate.getMonth() + 1).padStart(2, "0");
      const day = String(jsDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      setCurrentDate(formattedDate);
      const updatedSlots = slots.map((slot) => ({
        ...slot,
        date: formattedDate,
      }));
      setSlots(updatedSlots);
    } else {
      setCurrentDate("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedTestId) {
      toast.error("لطفاً ابتدا یک تست را انتخاب کنید.");
      return;
    }
    if (!currentDate) {
      toast.error("لطفاً تاریخ را انتخاب کنید.");
      return;
    }

    // ۱. بررسی معتبر بودن فیلدها
    const invalidSlots = slots.filter(
      (s) => !s.startTime || !s.endTime || s.capacity <= 0,
    );
    if (invalidSlots.length > 0) {
      toast.error(
        "لطفاً ساعت شروع، پایان و ظرفیت را برای همه ردیف‌ها بررسی کنید.",
      );
      return;
    }

    // ۲. بررسی تکراری نبودن ساعت‌ها در خود فرم (همین الان)
    const startTimes = slots.map((s) => s.startTime);
    const uniqueStartTimes = new Set(startTimes);
    if (uniqueStartTimes.size !== startTimes.length) {
      toast.error(
        "شما در همین فرم، دو بازه با ساعت شروع یکسان وارد کرده‌اید. لطفاً آن‌ها را اصلاح کنید.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        laboratoryId: userProfile?._id,
        testId: selectedTestId,
        slots: slots.map((s) => ({
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          capacity: Number(s.capacity),
        })),
      };

      const response = await api.post(
        "/laboratory/createLaboratorSlot",
        payload,
      );

      if (response.data) {
        toast.success("نوبت‌های آزمایشگاه با موفقیت ثبت شدند.");
        setSlots([
          {
            date: currentDate,
            startTime: "08:30",
            endTime: "09:00",
            capacity: 5,
          },
        ]);

        // به‌روزرسانی خودکار لیست نوبت‌های این روز
        const refreshResponse = await api.get(
          `/laboratory/getDailyReservations?date=${currentDate}&laboratoryId=${userProfile?._id}`,
        );
        if (refreshResponse.data?.reservations) {
          setExistingReservations(
            Object.values(
              refreshResponse.data.reservations,
            ).flat() as ExistingLabSlot[],
          );
        }
      }
    } catch (err: any) {
      // ۳. هندل کردن خطای ۵۰۰ و Duplicate Key از سمت سرور
      const errorData = err.response?.data;

      if (
        errorData?.details &&
        errorData.details.includes("E11000 duplicate key")
      ) {
        // استخراج ساعت تکراری از متن ارور برای راهنمایی بهتر (اختیاری اما جذاب)
        const matchedTime = errorData.details.match(/startTime:\s*"([^"]+)"/);
        const duplicateTime = matchedTime ? matchedTime[1] : "";

        toast.error(
          `شما قبلاً برای ساعت ${duplicateTime} در این تاریخ شیفت ثبت کرده‌اید. لطفاً ساعت دیگری انتخاب کنید.`,
          { duration: 5000 },
        );
      } else {
        // خطاهای دیگر بک‌اند
        toast.error(
          errorData?.message ||
            errorData?.error ||
            "خطا در ثبت نوبت‌های آزمایشگاه.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTests = userProfile?.availableTests || [];

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
          <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
            <FlaskConical size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              مدیریت ظرفیت و نوبت‌دهی تست‌ها
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              زمان‌بندی، تعیین ظرفیت پذیرش و مشاهده لیست بیماران روزانه
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* انتخاب تاریخ */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ابتدا تاریخ مورد نظر خود را انتخاب کنید:
              </label>
              <div className="relative md:w-1/2">
                <Calendar
                  className="absolute right-3 top-3 text-gadget-light"
                  size={18}
                />
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={currentDate ? new Date(currentDate) : ""}
                  onChange={handleDateChange}
                  format="YYYY/MM/DD"
                  containerClassName="w-full"
                  inputClass="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light cursor-pointer shadow-sm font-medium text-gray-700"
                  placeholder="انتخاب تاریخ..."
                />
              </div>
            </div>

            {/* ================== بخش نمایش نوبت‌های ثبت‌شده ================== */}
            {currentDate && (
              <div className="pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col mb-4 border-b border-gray-50 pb-3 gap-2">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <LayoutList size={16} className="text-gadget-dark" />
                    وضعیت شیفت‌ها و بیماران در تاریخ {formatShamsi(currentDate)}
                  </h3>
                </div>

                {loadingExisting ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gadget-light">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <p className="text-xs font-medium">
                      در حال دریافت لیست شیفت‌ها...
                    </p>
                  </div>
                ) : existingReservations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-100 overflow-y-auto custom-scrollbar pr-2">
                    {existingReservations.map((slot, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                          <div>
                            <h4 className="font-bold text-gadget-dark text-sm flex items-center gap-1.5">
                              <Activity size={16} /> {slot.testName}
                            </h4>
                            <span className="text-[10px] text-gray-500 mt-1 block">
                              بخش: {slot.department}
                            </span>
                          </div>
                          <div
                            className="bg-gray-100 text-gray-800 font-bold px-3 py-1 rounded-lg text-sm"
                            dir="ltr"
                          >
                            {slot.time}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium mb-4">
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                            ظرفیت کل: {slot.capacity}
                          </span>
                          <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-md">
                            رزرو شده: {slot.reservedCount}
                          </span>
                          <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md">
                            ظرفیت خالی: {slot.remainingCapacity}
                          </span>
                        </div>

                        <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                          <h5 className="text-[11px] font-bold text-gray-500 mb-2 flex items-center gap-1">
                            <Users size={12} /> لیست بیماران رزرو شده:
                          </h5>
                          {slot.bookedPatients &&
                          slot.bookedPatients.length > 0 ? (
                            <ul className="space-y-2">
                              {slot.bookedPatients.map((patient, pIdx) => (
                                <li
                                  key={pIdx}
                                  className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-gray-200 shadow-xs"
                                >
                                  <div className="flex items-center gap-1.5 font-bold text-gray-700">
                                    <User size={14} className="text-gray-400" />
                                    {patient.firstName} {patient.lastName}
                                  </div>
                                  <div
                                    className="flex items-center gap-1 text-gray-500 font-medium"
                                    dir="ltr"
                                  >
                                    <Phone size={12} /> {patient.mobile}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[11px] text-gray-400 text-center py-2">
                              هنوز بیماری برای این نوبت رزرو نکرده است.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle
                      size={32}
                      strokeWidth={1.5}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p className="text-sm font-medium text-gray-500">
                      هیچ ظرفیتی برای این تاریخ ثبت نشده است.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================== فرم افزودن نوبت جدید ================== */}
          <div
            className={`transition-opacity duration-300 ${!currentDate ? "opacity-50 pointer-events-none" : "opacity-100"}`}
          >
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-md font-bold text-gray-700 flex items-center gap-2 border-b border-gray-50 pb-3">
                <Plus size={18} className="text-gadget-light" />
                ایجاد ظرفیت پذیرش جدید{" "}
                {currentDate ? `برای ${formatShamsi(currentDate)}` : "..."}
              </h2>

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <label className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <ListPlus size={16} />
                  انتخاب تست جهت نوبت‌دهی:
                </label>
                {availableTests.length === 0 ? (
                  <div className="text-xs text-red-500 font-medium bg-white p-2 rounded border border-red-100">
                    تستی ثبت نشده است.
                  </div>
                ) : (
                  <select
                    value={selectedTestId}
                    onChange={(e) => setSelectedTestId(e.target.value)}
                    className="w-full md:w-1/2 bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-blue-400 font-bold"
                  >
                    <option value="" disabled>
                      انتخاب کنید...
                    </option>
                    {availableTests.map((test: any) => (
                      <option key={test._id} value={test._id}>
                        {test.testName} (بخش: {test.department})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">
                  بازه‌های زمانی و ظرفیت هر بازه را وارد کنید:
                </label>

                {slots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"
                  >
                    <div className="w-full sm:w-auto flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
                      <span className="text-xs text-gray-500 font-bold">
                        از ساعت
                      </span>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          handleSlotChange(index, "startTime", e.target.value)
                        }
                        className="bg-transparent text-sm font-bold outline-hidden w-24"
                      />
                    </div>

                    <div className="w-full sm:w-auto flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
                      <span className="text-xs text-gray-500 font-bold">
                        تا ساعت
                      </span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          handleSlotChange(index, "endTime", e.target.value)
                        }
                        className="bg-transparent text-sm font-bold outline-hidden w-24"
                      />
                    </div>

                    <div className="w-full sm:w-auto flex items-center gap-2 bg-blue-50/70 px-3 py-2 rounded-lg border border-blue-200 flex-1 shadow-xs">
                      <span className="text-xs text-blue-800 font-bold">
                        ظرفیت:
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={slot.capacity}
                        onChange={(e) =>
                          handleSlotChange(index, "capacity", e.target.value)
                        }
                        className="bg-transparent text-sm font-bold text-blue-900 outline-hidden w-16"
                      />
                      <span className="text-xs text-blue-800">نفر</span>
                    </div>

                    {slots.length > 1 && (
                      <button
                        onClick={() => removeSlotRow(index)}
                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors shadow-xs border border-transparent hover:border-red-100 bg-white"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={addSlotRow}
                  className="flex items-center gap-2 text-xs font-bold text-gadget-light hover:opacity-80 py-2 transition-opacity"
                >
                  <Plus size={14} />
                  افزودن بازه زمانی دیگر
                </button>

                <div className="pt-6 border-t border-gray-50">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    {isSubmitting
                      ? "در حال ثبت..."
                      : "ثبت نهایی ظرفیت‌ها در سیستم"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
