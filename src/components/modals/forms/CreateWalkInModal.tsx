import { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Calendar,
  Clock,
  Banknote,
  Loader2,
  CheckCircle2,
  Search,
  UserCheck,
  RotateCcw,
  CreditCard,
  Phone,
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

interface PatientData {
  _id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile: string;
  age?: number;
  role: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateWalkInModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  // استیت‌های استعلام بیمار با کد ملی
  const [searchNationalId, setSearchNationalId] = useState("");
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [foundPatient, setFoundPatient] = useState<PatientData | null>(null);

  // فرم ثبت نوبت
  const [formData, setFormData] = useState({
    amount: "250000",
    notes: "",
    locationType: "personal" as "personal" | "clinic" | "hospital",
    centerId: "",
    date: "",
    startTime: "16:30",
    endTime: "16:50",
  });

  // تنظیم زمان جاری و ریست مقادیر هنگام باز شدن مودال
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");

      const endMinutesVal = (now.getMinutes() + 20) % 60;
      const endHoursVal =
        now.getHours() + Math.floor((now.getMinutes() + 20) / 60);
      const endHours = String(endHoursVal % 24).padStart(2, "0");
      const endMinutes = String(endMinutesVal).padStart(2, "0");

      setSearchNationalId("");
      setFoundPatient(null);
      setFormData({
        amount: "250000",
        notes: "",
        locationType: "personal",
        centerId: "",
        date: "",
        startTime: `${currentHours}:${currentMinutes}`,
        endTime: `${endHours}:${endMinutes}`,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // استعلام اطلاعات بیمار با کد ملی
  const handleSearchPatient = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanNationalId = searchNationalId.trim();
    if (cleanNationalId.length !== 10) {
      toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد.");
      return;
    }

    setIsSearchingPatient(true);
    setFoundPatient(null);

    try {
      const response = await api.get(
        `/doctor/getPatientByNationalId/${cleanNationalId}`,
      );

      if (response.data && response.data.success && response.data.data) {
        setFoundPatient(response.data.data);
        toast.success(
          `بیمار ${response.data.data.firstName} ${response.data.data.lastName} شناسایی شد.`,
        );
      }
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (status === 404) {
        toast.error("بیماری با این کد ملی در سیستم یافت نشد.");
      } else {
        toast.error(msg || "خطا در استعلام اطلاعات بیمار.");
      }
    } finally {
      setIsSearchingPatient(false);
    }
  };

  // ثبت نهایی نوبت بین مریض
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foundPatient) {
      toast.error("لطفاً ابتدا کد ملی بیمار را جستجو و تایید فرمایید.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("مبلغ ویزیت باید بیشتر از صفر باشد.");
      return;
    }

    if (!formData.date) {
      toast.error("لطفاً تاریخ ویزیت را از تقویم مشخص کنید.");
      return;
    }

    if (
      formData.locationType !== "personal" &&
      !formData.centerId.trim()
    ) {
      toast.error(
        `لطفاً شناسه ${formData.locationType === "clinic" ? "کلینیک" : "بیمارستان"} را وارد فرمایید.`,
      );
      return;
    }

    setLoading(true);
    const toastId = toast.loading("در حال ثبت نوبت بین مریض...");

    try {
      // تعیین منبع رزرو و شناسه‌های محل ویزیت
      const isClinic = formData.locationType === "clinic";
      const isHospital = formData.locationType === "hospital";

      const bookingSource = isClinic
        ? "CLINIC"
        : isHospital
        ? "HOSPITAL"
        : "DIRECT";

      const clinicTargetId =
        isClinic && formData.centerId.trim() ? formData.centerId.trim() : null;
      const hospitalTargetId =
        isHospital && formData.centerId.trim()
          ? formData.centerId.trim()
          : null;

      const payload = {
        patientId: foundPatient._id,
        amount: Number(formData.amount),
        notes: formData.notes.trim() || undefined,
        bookingSource, // DIRECT | CLINIC | HOSPITAL
        clinicId: clinicTargetId,
        medicalCenterId: clinicTargetId,
        hospitalId: hospitalTargetId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      const response = await api.post(
        "/doctor/createWalkInAppointment",
        payload,
      );

      if (response.data && response.data.success) {
        toast.success(
          response.data.message || "نوبت بین مریض با موفقیت ثبت شد.",
          { id: toastId },
        );
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(msg || "خطا در ثبت نوبت بین مریض.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in"
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-150 border border-gray-100"
      >
        {/* ================= هدر ================= */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-800">
                ثبت نوبت بین مریض (مراجعه حضوری)
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                استعلام بیمار با کد ملی و ثبت نوبت در تقویم کاری
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= بدنه فرم ================= */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 text-xs sm:text-sm flex-1"
        >
          {/* ۱. فیلد استعلام کد ملی و نمایش اطلاعات بیمار */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-gray-700">
              کد ملی بیمار *
            </label>

            {!foundPatient ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <CreditCard
                    className="absolute right-3 top-2.5 text-gray-400"
                    size={17}
                  />
                  <input
                    type="text"
                    maxLength={10}
                    dir="ltr"
                    value={searchNationalId}
                    onChange={(e) =>
                      setSearchNationalId(e.target.value.replace(/\D/g, ""))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchPatient();
                      }
                    }}
                    placeholder="کد ملی ۱۰ رقمی بیمار..."
                    className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-3.5 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden font-mono text-left"
                  />
                </div>
                <button
                  type="button"
                  disabled={
                    isSearchingPatient || searchNationalId.trim().length !== 10
                  }
                  onClick={() => handleSearchPatient()}
                  className="px-4 py-2.5 bg-gadget-dark hover:bg-gadget-dark/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSearchingPatient ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Search size={15} />
                  )}
                  <span>استعلام</span>
                </button>
              </div>
            ) : (
              /* کارت نمایش بیمار شناسایی‌شده */
              <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <UserCheck size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 truncate">
                      {foundPatient.firstName} {foundPatient.lastName}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-gray-600 mt-0.5">
                      <span className="font-mono" dir="ltr">
                        کد ملی: {foundPatient.nationalId}
                      </span>
                      {foundPatient.mobile && (
                        <span
                          className="font-mono flex items-center gap-1"
                          dir="ltr"
                        >
                          <Phone size={11} className="text-gray-400" />{" "}
                          {foundPatient.mobile}
                        </span>
                      )}
                      {foundPatient.age && (
                        <span>{foundPatient.age} سال</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFoundPatient(null);
                    setSearchNationalId("");
                  }}
                  className="p-1.5 bg-white border border-teal-200 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  title="تغییر بیمار"
                >
                  <RotateCcw size={13} />
                  <span className="hidden sm:inline">تغییر</span>
                </button>
              </div>
            )}
          </div>

          {/* ۲. مبلغ ویزیت */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              مبلغ ویزیت (تومان) *
            </label>
            <div className="relative">
              <Banknote
                className="absolute right-3 top-2.5 text-gray-400"
                size={17}
              />
              <input
                type="number"
                required
                dir="ltr"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="250000"
                className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-3.5 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden font-mono text-left"
              />
            </div>
            {formData.amount && (
              <span className="text-[11px] font-bold text-teal-700 mt-1 block">
                {Number(formData.amount).toLocaleString("fa-IR")} تومان
              </span>
            )}
          </div>

          {/* ۳. تاریخ ویزیت (شمسی) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              تاریخ مراجعه *
            </label>
            <div className="relative">
              <Calendar
                className="absolute right-3 top-2.5 text-gray-400 z-10"
                size={17}
              />
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={formData.date ? new Date(formData.date) : ""}
                onChange={(dateObj: any) => {
                  if (dateObj && dateObj.isValid) {
                    const jsDate = dateObj.toDate();
                    const year = jsDate.getFullYear();
                    const month = String(jsDate.getMonth() + 1).padStart(
                      2,
                      "0",
                    );
                    const day = String(jsDate.getDate()).padStart(2, "0");
                    setFormData((prev) => ({
                      ...prev,
                      date: `${year}-${month}-${day}`,
                    }));
                  } else {
                    setFormData((prev) => ({ ...prev, date: "" }));
                  }
                }}
                format="YYYY/MM/DD"
                containerClassName="w-full"
                inputClass="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden cursor-pointer"
                placeholder="انتخاب تاریخ ویزیت..."
              />
            </div>
          </div>

          {/* ۴. زمان شروع و پایان */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                ساعت شروع ویزیت *
              </label>
              <div className="relative">
                <Clock
                  className="absolute right-3 top-2.5 text-gray-400"
                  size={16}
                />
                <input
                  type="time"
                  required
                  dir="ltr"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-2.5 py-2 text-xs sm:text-sm focus:border-gadget-light outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                ساعت پایان ویزیت *
              </label>
              <div className="relative">
                <Clock
                  className="absolute right-3 top-2.5 text-gray-400"
                  size={16}
                />
                <input
                  type="time"
                  required
                  dir="ltr"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-2.5 py-2 text-xs sm:text-sm focus:border-gadget-light outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          {/* ۵. انتخاب موقعیت پزشک (مطب، کلینیک یا بیمارستان) */}
          <div className="space-y-2 bg-gray-50/70 p-3 rounded-2xl border border-gray-200/70">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700">
                محل ویزیت:
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                Booking Source:{" "}
                {formData.locationType === "personal"
                  ? "DIRECT"
                  : formData.locationType === "clinic"
                  ? "CLINIC"
                  : "HOSPITAL"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "personal", label: "مطب شخصی" },
                { id: "clinic", label: "کلینیک" },
                { id: "hospital", label: "بیمارستان" },
              ].map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      locationType: loc.id as "personal" | "clinic" | "hospital",
                      centerId: loc.id === "personal" ? "" : formData.centerId,
                    })
                  }
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.locationType === loc.id
                      ? "bg-white text-teal-800 border-teal-300 shadow-2xs"
                      : "bg-gray-100/70 text-gray-500 border-transparent hover:bg-gray-200/50"
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            {formData.locationType !== "personal" && (
              <div className="pt-2 animate-in fade-in">
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={formData.centerId}
                  onChange={(e) =>
                    setFormData({ ...formData, centerId: e.target.value })
                  }
                  placeholder={`شناسه اختصاصی ${
                    formData.locationType === "clinic" ? "کلینیک" : "بیمارستان"
                  } (Center ID) *`}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-gadget-light outline-hidden font-mono"
                />
              </div>
            )}
          </div>

          {/* ۶. علت مراجعه یا یادداشت */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              یادداشت یا علت مراجعه بیمار
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="مثال: مراجعه اورژانسی با درد حاد معده..."
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs sm:text-sm focus:border-gadget-light outline-hidden resize-none"
            />
          </div>

          {/* ================= فوتر اکشن‌ها ================= */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading || !foundPatient}
              className="px-6 py-2.5 bg-gadget-dark hover:bg-gadget-dark/90 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              <span>{loading ? "در حال ثبت..." : "ثبت قطعی نوبت"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}