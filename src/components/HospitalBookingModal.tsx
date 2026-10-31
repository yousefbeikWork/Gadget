import { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  Building2,
  User,
  Calendar,
  AlignRight,
  Loader2,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hospital: any;
}

export default function HospitalBookingModal({ isOpen, onClose, hospital }: Props) {
  const [bookingStep, setBookingStep] = useState<"select-clinic" | "select-doctor" | "select-slot">("select-clinic");
  const [hospitalClinics, setHospitalClinics] = useState<any[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<any | null>(null);

  const [clinicDoctors, setClinicDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [bookingNotes, setBookingNotes] = useState("");

  useEffect(() => {
    if (!isOpen || !hospital) return;

    setBookingStep("select-clinic");
    setSelectedClinic(null);
    setSelectedDoctor(null);
    setSelectedDate("");
    setAvailableSlots([]);
    setSelectedSlot(null);
    setBookingNotes("");

    // دریافت کلینیک‌های این بیمارستان
    const fetchHospitalClinics = async () => {
      setLoadingClinics(true);
      try {
        const res = await api.get("/Hospital/clinics", {
          params: { hospitalId: hospital._id },
        });
        if (res.data?.success && res.data?.data) {
          setHospitalClinics(
            res.data.data.map((item: any) => ({
              id: item._id || item.id,
              name: item.centerName || item.name,
              specialty: item.specialty || "ثبت نشده",
            }))
          );
        }
      } catch {
        toast.error("خطا در دریافت لیست کلینیک‌های این بیمارستان.");
      } finally {
        setLoadingClinics(false);
      }
    };

    fetchHospitalClinics();
  }, [isOpen, hospital]);

  if (!isOpen || !hospital) return null;

  const handleSelectClinic = async (clinic: any) => {
    setSelectedClinic(clinic);
    setBookingStep("select-doctor");
    setClinicDoctors([]);
    setLoadingDoctors(true);

    try {
      const res = await api.post("/doctor/listDctorsClinic", { clinicId: clinic.id });
      if (res.data?.success && res.data?.doctors) {
        setClinicDoctors(res.data.doctors);
      }
    } catch {
      toast.error("خطا در دریافت لیست پزشکان کلینیک.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSelectDoctor = (doc: any) => {
    setSelectedDoctor(doc);
    setBookingStep("select-slot");
  };

  const fetchSlotsForDate = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setAvailableSlots([]);

    if (!date || !selectedDoctor || !selectedClinic) return;

    try {
      setLoadingSlots(true);
      const res = await api.get(
        `/book/available-slots?doctorId=${selectedDoctor._id}&date=${date}&clinicId=${selectedClinic.id}`
      );
      if (res.data?.success) {
        setAvailableSlots(res.data.data || []);
      }
    } catch (err: any) {
      setAvailableSlots([]);
      if (err.response?.status !== 404) {
        toast.error("خطا در دریافت نوبت‌های خالی.");
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot || !selectedDate || !selectedDoctor || !selectedClinic) return;

    const payload = {
      doctorId: selectedDoctor._id,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes: bookingNotes,
      medicalCenterId: selectedClinic.id,
    };

    const bookingPromise = api.post("/book/bookslots", payload);

    toast.promise(bookingPromise, {
      loading: "در حال ثبت نوبت شما...",
      success: () => {
        onClose();
        return `نوبت شما در کلینیک ${selectedClinic.name} با موفقیت ثبت شد!`;
      },
      error: (err) => err.response?.data?.message || "خطا در رزرو نوبت.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-150 border border-gray-100">
        
        {/* هدر */}
        <div className="flex items-center justify-between bg-gray-50 border-b border-gray-100 px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {bookingStep !== "select-clinic" && (
              <button
                onClick={() => setBookingStep(bookingStep === "select-slot" ? "select-doctor" : "select-clinic")}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer text-gray-600"
              >
                <ChevronRight size={20} />
              </button>
            )}
            <div className="truncate">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{hospital.hospitalName}</h3>
              <p className="text-[11px] text-gray-500 font-medium truncate">
                {bookingStep === "select-clinic" && "مرحله ۱: انتخاب کلینیک"}
                {bookingStep === "select-doctor" && `مرحله ۲: پزشک (${selectedClinic?.name})`}
                {bookingStep === "select-slot" && `مرحله ۳: نوبت دکتر ${selectedDoctor?.lastName}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* محتوای مراحل */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-h-90">
          {/* مرحله اول: کلینیک‌ها */}
          {bookingStep === "select-clinic" && (
            <div className="space-y-3.5">
              <label className="block text-xs sm:text-sm font-bold text-gray-700">دپارتمان‌ها و کلینیک‌های فعال:</label>
              {loadingClinics ? (
                <div className="flex flex-col items-center justify-center py-10 text-gadget-light">
                  <Loader2 className="animate-spin mb-2" size={26} />
                  <p className="text-xs text-gray-500">در حال دریافت کلینیک‌ها...</p>
                </div>
              ) : hospitalClinics.length > 0 ? (
                <div className="space-y-2">
                  {hospitalClinics.map((clinic) => (
                    <div
                      key={clinic.id}
                      onClick={() => handleSelectClinic(clinic)}
                      className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:border-gadget-light hover:bg-gadget-light/5 cursor-pointer transition-all group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-gadget-dark">{clinic.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{clinic.specialty}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 rotate-180 group-hover:text-gadget-light shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
                  کلینیکی برای این بیمارستان ثبت نشده است.
                </div>
              )}
            </div>
          )}

          {/* مرحله دوم: پزشکان */}
          {bookingStep === "select-doctor" && (
            <div className="space-y-3.5 animate-in slide-in-from-right-4">
              <label className="block text-xs sm:text-sm font-bold text-gray-700">پزشکان فعال {selectedClinic?.name}:</label>
              {loadingDoctors ? (
                <div className="flex flex-col items-center justify-center py-10 text-gadget-light">
                  <Loader2 className="animate-spin mb-2" size={26} />
                  <p className="text-xs text-gray-500">در حال دریافت پزشکان...</p>
                </div>
              ) : clinicDoctors.length > 0 ? (
                <div className="space-y-2">
                  {clinicDoctors.map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => handleSelectDoctor(doc)}
                      className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:border-gadget-light hover:bg-gadget-light/5 cursor-pointer transition-all group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-gadget-light">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-gadget-dark">
                            دکتر {doc.firstName} {doc.lastName}
                          </p>
                          <p className="text-[10px] text-gadget-light font-medium mt-0.5">{doc.Expertise || "پزشک عمومی"}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 rotate-180 group-hover:text-gadget-light shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
                  پزشک فعالی برای این کلینیک ثبت نشده است.
                </div>
              )}
            </div>
          )}

          {/* مرحله سوم: انتخاب ساعت */}
          {bookingStep === "select-slot" && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">تاریخ حضور در بیمارستان:</label>
                <div className="relative">
                  <Calendar className="absolute right-3.5 top-3 text-gadget-light z-10" size={17} />
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    value={selectedDate ? new Date(selectedDate) : ""}
                    portal={true}
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
                    inputClass="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden cursor-pointer"
                    placeholder="انتخاب تاریخ از تقویم..."
                  />
                </div>
              </div>

              {loadingSlots ? (
                <div className="flex flex-col items-center justify-center py-8 text-gadget-light">
                  <Loader2 className="animate-spin mb-2" size={26} />
                  <p className="text-xs text-gray-500">در حال دریافت تقویم ویزیت...</p>
                </div>
              ) : selectedDate ? (
                availableSlots.length > 0 ? (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">ساعت‌های ویزیت خالی:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((slot, index) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-gadget-dark text-white border-gadget-dark shadow-xs scale-102"
                                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {slot.startTime} تا {slot.endTime}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedSlot && (
                      <div className="space-y-1.5 animate-in fade-in">
                        <label className="block text-xs font-bold text-gray-700">یادداشت یا علت مراجعه (اختیاری):</label>
                        <div className="relative">
                          <AlignRight className="absolute right-3 top-3 text-gray-400" size={16} />
                          <textarea
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                            placeholder="توضیحات کوتاه برای پزشک..."
                            rows={2}
                            className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-xs focus:border-gadget-light outline-hidden resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-center text-orange-700 bg-orange-50 border border-orange-100 p-3.5 rounded-xl">
                    هیچ نوبت خالی در این تاریخ وجود ندارد.
                  </p>
                )
              ) : null}
            </div>
          )}
        </div>

        {/* فوتر */}
        {bookingStep === "select-slot" && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/70 shrink-0">
            <button
              disabled={!selectedSlot}
              onClick={handleConfirmBooking}
              className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                selectedSlot
                  ? "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-md cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {selectedSlot ? `تایید نوبت ساعت ${selectedSlot.startTime}` : "انتخاب ساعت ویزیت الزامی است"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}