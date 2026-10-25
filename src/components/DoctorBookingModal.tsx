import { useState } from "react";
import { X, Calendar, Banknote, CalendarPlus, Loader2 } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DoctorAvatar from "./DoctorAvatar";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  doctor: any;
}

export default function DoctorBookingModal({ isOpen, onClose, doctor }: Props) {
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !doctor) return null;

  const fetchSlotsForDate = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setAvailableSlots([]);
    if (!date) return;

    try {
      setLoadingSlots(true);
      const res = await api.get(
        `/book/available-slots?doctorId=${doctor._id}&date=${date}`,
      );
      if (res.data?.success) {
        setAvailableSlots(res.data.data);
        if (res.data.data.length === 0)
          toast("در این تاریخ نوبت خالی وجود ندارد.", { icon: "ℹ️" });
      }
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !selectedDate || isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading(
      "در حال ثبت درخواست و اتصال به درگاه پرداخت...",
    );

    try {
      const res = await api.post("/book/bookslots", {
        doctorId: doctor._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: bookingNotes,
        amount: selectedSlot.price ?? 0,
      });

      if (res.data?.success && res.data?.data?.paymentUrl) {
        toast.success("در حال انتقال به درگاه...", { id: toastId });
        window.location.href = res.data.data.paymentUrl;
      } else {
        toast.error(res.data?.message || "خطا در اتصال به درگاه پرداخت.", {
          id: toastId,
        });
        setIsSubmitting(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در برقراری ارتباط.", {
        id: toastId,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in"
      dir="rtl"
    >
      {/* 👈 کادر مودال با طراحی ریسپانسیو و مدیریت ارتفاع خودکار */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-150">
        {/* هدر */}
        <div className="bg-gadget-dark p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <DoctorAvatar
              imageProfile={doctor.imageProfile}
              firstName={doctor.firstName}
              className="w-10 h-10 text-sm border border-white/20 shrink-0"
            />
            <div className="truncate">
              <h3 className="font-bold text-sm truncate">
                دکتر {doctor.firstName} {doctor.lastName}
              </h3>
              <p className="text-xs text-gray-300 truncate">
                {doctor.Expertise}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white bg-white/10 p-2 rounded-xl cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 👈 اضافه شدن min-h-[360px] جهت جلوگیری از برش خوردن پنجره تقویم */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 min-h-90">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
              تاریخ مراجعه را انتخاب کنید:
            </label>
            <div className="relative">
              <Calendar
                className="absolute right-3.5 top-3 text-gadget-light z-10"
                size={17}
              />
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={selectedDate ? new Date(selectedDate) : ""}
                portal={true} // 👈 رندر تقویم خارج از کادر اسکرول تا زیر پاپ‌آپ گیر نکند
                zIndex={9999}
                fixMainPosition={true}
                onChange={(date: any) => {
                  if (date?.isValid) {
                    const js = date.toDate();
                    const formatted = `${js.getFullYear()}-${String(js.getMonth() + 1).padStart(2, "0")}-${String(js.getDate()).padStart(2, "0")}`;
                    fetchSlotsForDate(formatted);
                  } else {
                    fetchSlotsForDate("");
                  }
                }}
                format="YYYY/MM/DD"
                containerClassName="w-full"
                inputClass="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm focus:border-gadget-light focus:bg-white outline-hidden cursor-pointer"
                placeholder="انتخاب تاریخ از تقویم..."
              />
            </div>
          </div>

          {loadingSlots ? (
            <div className="flex flex-col items-center justify-center py-8 text-gadget-light">
              <Loader2 className="animate-spin mb-2" size={26} />
              <p className="text-xs text-gray-500 font-medium">
                در حال بررسی نوبت‌ها...
              </p>
            </div>
          ) : selectedDate && availableSlots.length > 0 ? (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  ساعت‌های خالی:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map((slot, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSlot?.startTime === slot.startTime
                          ? "bg-gadget-light text-white shadow-md shadow-gadget-light/30 scale-102"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {slot.startTime} تا {slot.endTime}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSlot && (
                <div className="space-y-3 pt-2">
                  {selectedSlot.price !== undefined && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <Banknote size={16} className="text-emerald-600" /> مبلغ
                        نوبت:
                      </span>
                      <span className="font-black text-emerald-700" dir="ltr">
                        {new Intl.NumberFormat("fa-IR").format(
                          selectedSlot.price,
                        )}{" "}
                        ریال
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      توضیحات یا علت مراجعه (اختیاری):
                    </label>
                    <textarea
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="علت مراجعه یا علائم بیماری..."
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:border-gadget-light outline-hidden resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : selectedDate ? (
            <p className="text-xs text-center text-orange-600 bg-orange-50 border border-orange-100 p-4 rounded-xl">
              نوبت خالی در این تاریخ وجود ندارد.
            </p>
          ) : null}
        </div>

        {/* فوتر */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            disabled={!selectedSlot || isSubmitting}
            onClick={handleConfirmBooking}
            className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              selectedSlot && !isSubmitting
                ? "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-md cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <CalendarPlus size={16} />
            )}
            <span>
              {isSubmitting
                ? "در حال اتصال به بانک..."
                : selectedSlot
                  ? `تایید و پرداخت نوبت ساعت ${selectedSlot.startTime}`
                  : "انتخاب ساعت نوبت"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
