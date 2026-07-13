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
  X,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

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
  const [isDeleting, setIsDeleting] = useState(false);

  // استیت باز یا بسته بودن مودال تایید حذف اختصاصی
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [existingReservations, setExistingReservations] = useState<ExistingLabSlot[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const formatShamsi = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
        const allSlots = Object.values(response.data.reservations).flat() as ExistingLabSlot[];
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

  useEffect(() => {
    fetchExistingReservations();
  }, [currentDate, userProfile?._id]);

  // 👈 درخواست واقعی حذف زمان‌بندی روزانه به سرور
  const confirmDeleteDaySchedule = async () => {
    setIsDeleting(true);
    try {
      await api.delete("/laboratory/slots/daily", {
        data: { date: currentDate },
      });

      toast.success(`برنامه‌ی تاریخ ${formatShamsi(currentDate)} با موفقیت لغو و حذف شد.`);
      setExistingReservations([]);
      setShowDeleteConfirm(false); // بستن مودال اختصاصی
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در حذف برنامه‌ی روزانه.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDeleteModal = () => {
    const hasBookedPatient = existingReservations.some((slot) => slot.reservedCount > 0);
    if (hasBookedPatient) {
      toast.error("به دلیل وجود نوبت‌های رزرو شده توسط بیماران، امکان لغو برنامه این روز وجود ندارد.");
      return;
    }
    setShowDeleteConfirm(true);
  };

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

  const handleSlotChange = (index: number, field: keyof LabSlot, value: any) => {
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

    const invalidSlots = slots.filter((s) => !s.startTime || !s.endTime || s.capacity <= 0);
    if (invalidSlots.length > 0) {
      toast.error("لطفاً ساعت شروع، پایان و ظرفیت را برای همه ردیف‌ها بررسی کنید.");
      return;
    }

    const startTimes = slots.map((s) => s.startTime);
    const uniqueStartTimes = new Set(startTimes);
    if (uniqueStartTimes.size !== startTimes.length) {
      toast.error("شما در همین فرم، دو بازه با ساعت شروع یکسان وارد کرده‌اید. لطفاً آن‌ها را اصلاح کنید.");
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

      const response = await api.post("/laboratory/createLaboratorSlot", payload);

      if (response.data) {
        toast.success("نوبت‌های آزمایشگاه با موفقیت ثبت شدند.");
        setSlots([{ date: currentDate, startTime: "08:30", endTime: "09:00", capacity: 5 }]);
        await fetchExistingReservations();
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.details && errorData.details.includes("E11000 duplicate key")) {
        const matchedTime = errorData.details.match(/startTime:\s*"([^"]+)"/);
        const duplicateTime = matchedTime ? matchedTime[1] : "";
        toast.error(`شما قبلاً برای ساعت ${duplicateTime} در این تاریخ شیفت ثبت کرده‌اید. لطفاً ساعت دیگری انتخاب کنید.`, { duration: 5000 });
      } else {
        toast.error(errorData?.message || errorData?.error || "خطا در ثبت نوبت‌های آزمایشگاه.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTests = userProfile?.availableTests || [];
  const hasPatientsInSelectedDate = existingReservations.some((slot) => slot.reservedCount > 0);

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans relative" dir="rtl">
      
      {/* ================== 👈 مودال تایید حذف جدید و شکیل ================== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          ></div>
          
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between bg-red-50/50 border-b border-red-100/50 px-5 py-4">
              <h3 className="font-bold text-red-700 text-sm flex items-center gap-2">
                <Trash2 size={16} /> لغو شیفت‌های روزانه
              </h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-red-50 text-red-500 rounded-full">
                <HelpCircle size={32} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-gray-800">حذف زمان‌بندی تاریخ {formatShamsi(currentDate)}</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  آیا از حذف تمامی ظرفیت‌ها و شیفت‌های ثبت‌شده در این روز کاملاً مطمئن هستید؟ این عملیات قابل بازگشت نیست.
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={confirmDeleteDaySchedule}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {isDeleting ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Trash2 size={14} />
                )}
                {isDeleting ? "در حال حذف..." : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== بدنه اصلی صفحه ================== */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
          <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
            <FlaskConical size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">مدیریت ظرفیت و نوبت‌دهی تست‌ها</h1>
            <p className="text-gray-500 text-sm mt-1">زمان‌بندی، تعیین ظرفیت پذیرش و مشاهده لیست بیماران روزانه</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ابتدا تاریخ مورد نظر خود را انتخاب کنید:</label>
              <div className="relative md:w-1/2">
                <Calendar className="absolute right-3 top-3 text-gadget-light" size={18} />
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
                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <LayoutList size={16} className="text-gadget-dark" />
                    وضعیت شیفت‌ها و بیماران در تاریخ {formatShamsi(currentDate)}
                  </h3>

                  {existingReservations.length > 0 && (
                    <button
                      onClick={handleOpenDeleteModal} // 👈 باز کردن مودال اختصاصی به جای ویندوز آلرت
                      disabled={hasPatientsInSelectedDate}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border ${
                        hasPatientsInSelectedDate
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100 cursor-pointer"
                      }`}
                      title={hasPatientsInSelectedDate ? "به دلیل وجود نوبت رزرو شده امکان حذف وجود ندارد" : "حذف کل برنامه این روز"}
                    >
                      <Trash2 size={14} />
                      {hasPatientsInSelectedDate ? "غیرقابل حذف" : "لغو برنامه این روز"}
                    </button>
                  )}
                </div>

                {loadingExisting ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gadget-light">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <p className="text-xs font-medium">در حال دریافت لیست شیفت‌ها...</p>
                  </div>
                ) : existingReservations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-100 overflow-y-auto custom-scrollbar pr-2">
                    {existingReservations.map((slot, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                          <div>
                            <h4 className="font-bold text-gadget-dark text-sm flex items-center gap-1.5">
                              <Activity size={16} /> {slot.testName}
                            </h4>
                            <span className="text-[10px] text-gray-500 mt-1 block">بخش: {slot.department}</span>
                          </div>
                          <div className="bg-gray-100 text-gray-800 font-bold px-3 py-1 rounded-lg text-sm" dir="ltr">
                            {slot.time}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium mb-4">
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md">ظرفیت کل: {slot.capacity}</span>
                          <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-md">رزرو شده: {slot.reservedCount}</span>
                          <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md">ظرفیت خالی: {slot.remainingCapacity}</span>
                        </div>

                        <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                          <h5 className="text-[11px] font-bold text-gray-500 mb-2 flex items-center gap-1">
                            <Users size={12} /> لیست بیماران رزرو شده:
                          </h5>
                          {slot.bookedPatients && slot.bookedPatients.length > 0 ? (
                            <ul className="space-y-2">
                              {slot.bookedPatients.map((patient, pIdx) => (
                                <li key={pIdx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-gray-200 shadow-xs">
                                  <div className="flex items-center gap-1.5 font-bold text-gray-700">
                                    <User size={14} className="text-gray-400" />
                                    {patient.firstName} {patient.lastName}
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-500 font-medium" dir="ltr">
                                    <Phone size={12} /> {patient.mobile}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[11px] text-gray-400 text-center py-2">هنوز بیماری برای این نوبت رزرو نکرده است.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle size={32} strokeWidth={1.5} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">هیچ ظرفیتی برای این تاریخ ثبت نشده است.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================== فرم افزودن نوبت جدید ================== */}
          <div className={`transition-opacity duration-300 ${!currentDate ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-md font-bold text-gray-700 flex items-center gap-2 border-b border-gray-50 pb-3">
                <Plus size={18} className="text-gadget-light" />
                ایجاد ظرفیت پذیرش جدید {currentDate ? `برای ${formatShamsi(currentDate)}` : "..."}
              </h2>

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <label className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <ListPlus size={16} /> انتخاب تست جهت نوبت‌دهی:
                </label>
                {availableTests.length === 0 ? (
                  <div className="text-xs text-red-500 font-medium bg-white p-2 rounded border border-red-100">تستی ثبت نشده است.</div>
                ) : (
                  <select
                    value={selectedTestId}
                    onChange={(e) => setSelectedTestId(e.target.value)}
                    className="w-full md:w-1/2 bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-blue-400 font-bold"
                  >
                    <option value="" disabled>انتخاب کنید...</option>
                    {availableTests.map((test: any) => (
                      <option key={test._id} value={test._id}>
                        {test.testName} (بخش: {test.department})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">بازه‌های زمانی و ظرفیت هر بازه را وارد کنید:</label>

                {slots.map((slot, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-full sm:w-auto flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
                      <span className="text-xs text-gray-500 font-bold">از ساعت</span>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleSlotChange(index, "startTime", e.target.value)}
                        className="bg-transparent text-sm font-bold outline-hidden w-24"
                      />
                    </div>

                    <div className="w-full sm:w-auto flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
                      <span className="text-xs text-gray-500 font-bold">تا ساعت</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleSlotChange(index, "endTime", e.target.value)}
                        className="bg-transparent text-sm font-bold outline-hidden w-24"
                      />
                    </div>

                    <div className="w-full sm:w-auto flex items-center gap-2 bg-blue-50/70 px-3 py-2 rounded-lg border border-blue-200 flex-1 shadow-xs">
                      <span className="text-xs text-blue-800 font-bold">ظرفیت:</span>
                      <input
                        type="number"
                        min="1"
                        value={slot.capacity}
                        onChange={(e) => handleSlotChange(index, "capacity", e.target.value)}
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
                  <Plus size={14} /> افزودن بازه زمانی دیگر
                </button>

                <div className="pt-6 border-t border-gray-50">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {isSubmitting ? "در حال ثبت..." : "ثبت نهایی ظرفیت‌ها در سیستم"}
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