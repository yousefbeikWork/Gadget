import { useState, useEffect } from "react";
import {
  Search,
  Phone,
  MapPin,
  Activity,
  Loader2,
  Building2,
  CalendarDays,
  User,
  ChevronRight,
  Calendar,
  AlignRight,
  X,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

interface ClinicDoctor {
  id: string;
  firstName: string;
  lastName: string;
}

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  address: string;
  status: "فعال" | "غیرفعال";
  doctors: ClinicDoctor[];
  medicalCenterId: string;
}

interface Slot {
  startTime: string;
  endTime: string;
}

export default function Clinics() {
  const navigate = useNavigate();
  const { userRole, isLoggedIn } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================= استیت‌های مودال رزرو برای بیمار =================
  const [bookingClinic, setBookingClinic] = useState<Clinic | null>(null);
  const [bookingStep, setBookingStep] = useState<
    "select-doctor" | "select-slot"
  >("select-doctor");
  const [bookingDoctor, setBookingDoctor] = useState<ClinicDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingNotes, setBookingNotes] = useState("");
  const [medicalCenterId, setMedicalCenterId] = useState("");

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/clinic/listClinc", {
          headers: { accept: "application/json" },
        });

        const result = response.data;

        if (result.success && result.data) {
          const mappedData: Clinic[] = result.data.map((item: any) => ({
            id: item.id || item._id,
            name: item.centerName,
            specialty: item.specialty,
            phone:
              item.phones && item.phones.length > 0 ? item.phones[0] : "نامشخص",
            address: item.address,
            status: item.isActive === false ? "غیرفعال" : "فعال",
            doctors: item.doctors || [],
            medicalCenterId: item.id,
          }));
          setClinics(mappedData);
        } else {
          throw new Error("داده‌ای یافت نشد");
        }
      } catch (err: any) {
        setError(err.message || "خطای ناشناخته رخ داده است");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClinics();
  }, []);

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name?.includes(searchTerm) ||
      clinic.specialty?.includes(searchTerm),
  );

  // --- توابع رزرو نوبت (برای بیمار) ---
  const openBookingProcess = (clinic: Clinic) => {
    if (!isLoggedIn) {
      toast.error("برای رزرو نوبت ابتدا باید وارد حساب کاربری خود شوید.");
      navigate("/login");
      return;
    }
    if (userRole && userRole !== "Patient") {
      toast.error("فقط کاربران با نقش «بیمار» قادر به رزرو نوبت هستند.");
      return;
    }

    setBookingClinic(clinic);
    setMedicalCenterId(clinic.id);
    setBookingStep("select-doctor");
    setBookingDoctor(null);
    setSelectedDate("");
    setAvailableSlots([]);
    setSelectedSlot(null);
    setBookingNotes("");
  };

  const closeBookingProcess = () => {
    setBookingClinic(null);
  };

  const selectDoctorToBook = (doc: ClinicDoctor) => {
    setBookingDoctor(doc);
    setBookingStep("select-slot");
  };

  const fetchSlotsForDate = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setAvailableSlots([]);

    if (!date || !bookingDoctor) return;

    try {
      setLoadingSlots(true);
      const response = await api.get(
        `/book/available-slots?doctorId=${bookingDoctor.id}&date=${date}`,
      );
      if (response.data && response.data.success) {
        setAvailableSlots(response.data.data);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setAvailableSlots([]);
      } else {
        toast.error("خطا در دریافت نوبت‌های خالی.");
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot || !selectedDate || !bookingDoctor) return;

    const payload = {
      doctorId: bookingDoctor.id,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes: bookingNotes,
      medicalCenterId: medicalCenterId ? medicalCenterId : null,
    };

    const bookingPromise = api.post("/book/bookslots", payload);

    toast.promise(bookingPromise, {
      loading: "در حال ثبت نوبت شما...",
      success: () => {
        closeBookingProcess();
        return "نوبت شما با موفقیت در کلینیک رزرو شد!";
      },
      error: (err) =>
        err.response?.data?.message ||
        "خطا در رزرو نوبت. لطفاً دوباره تلاش کنید.",
    });
  };

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ================= هدر و جستجو (دقیقاً هماهنگ با بقیه صفحات) ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="text-gadget-dark">
              <Building2 size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                مراکز درمانی و کلینیک‌ها
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {userRole === "Patient"
                  ? "کلینیک مورد نظر خود را انتخاب کرده و نوبت بگیرید"
                  : "لیست مراکز درمانی ثبت شده در سامانه"}
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-87.5">
            <input
              type="text"
              placeholder="جستجوی نام کلینیک یا تخصص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full pr-4 pl-10 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light transition-all shadow-sm text-gray-700"
            />
            <Search
              className="absolute left-4 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* ================= لیست کارت‌ها ================= */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">
              در حال دریافت اطلاعات کلینیک‌ها...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
            {error}
          </div>
        ) : filteredClinics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.map((clinic) => (
              <div
                key={clinic.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* بخش بالای کارت: نام و آواتار کپسولی */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1.5">
                      <h3
                        className="font-bold text-gray-900 text-lg line-clamp-1"
                        title={clinic.name}
                      >
                        {clinic.name}
                      </h3>
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            clinic.status === "فعال"
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {clinic.status}
                        </span>
                      </div>
                    </div>

                    {/* آواتار هوشمند با حرف اول نام کلینیک */}
                    <div className="w-12 h-12 rounded-xl shrink-0 bg-gadget-dark text-white flex items-center justify-center text-xl font-bold shadow-sm">
                      {clinic.name ? (
                        clinic.name.charAt(0)
                      ) : (
                        <Building2 size={20} />
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-100 mb-4" />

                  {/* بخش میانی: مشخصات با چینش دقیق راست‌چین */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="font-medium text-left truncate max-w-[70%]">
                        {clinic.specialty || "---"}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span>تخصص:</span>
                        <Activity size={16} strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="font-medium" dir="ltr">
                        {clinic.phone || "---"}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span>تلفن تماس:</span>
                        <Phone size={16} strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="flex items-start justify-between text-sm text-gray-600">
                      <span
                        className="font-medium text-left leading-relaxed max-w-[80%] line-clamp-2"
                        title={clinic.address}
                      >
                        {clinic.address || "---"}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500 shrink-0 mt-0.5">
                        <MapPin size={16} strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* دکمه پایین کارت با دکور تمام عرض */}
                <div className="pt-4 border-t border-gray-50">
                  <button
                    onClick={() => openBookingProcess(clinic)}
                    className="w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white text-center py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CalendarDays size={16} /> مشاهده پزشکان و رزرو
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 p-12 text-center rounded-2xl text-gray-500">
            <Building2
              size={48}
              strokeWidth={1}
              className="mx-auto mb-3 text-gray-300"
            />
            <p className="font-medium text-lg">کلینیکی یافت نشد.</p>
            <p className="text-sm mt-1">
              هیچ مرکز درمانی با این مشخصات در سیستم ثبت نشده است.
            </p>
          </div>
        )}
      </div>

      {/* ================= مودال رزرو کلینیک شکیل با متریال دیزاین جدید ================= */}
      {bookingClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-700/50 backdrop-blur-sm transition-opacity"
            onClick={closeBookingProcess}
          ></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* هدر مودال */}
            <div className="flex items-center justify-between bg-gray-50 border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                {bookingStep === "select-slot" && (
                  <button
                    onClick={() => setBookingStep("select-doctor")}
                    className="p-1.5 hover:bg-gray-200/70 rounded-xl transition-colors cursor-pointer text-gray-600"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
                <div>
                  <h3 className="font-bold text-gray-800 text-base">
                    {bookingClinic.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {bookingStep === "select-doctor"
                      ? "مرحله اول: انتخاب پزشک معالج"
                      : `مرحله دوم: رزرو نوبت دکتر ${bookingDoctor?.lastName}`}
                  </p>
                </div>
              </div>
              <button
                onClick={closeBookingProcess}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* بدنه مودال */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-100">
              {bookingStep === "select-doctor" && (
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    لیست پزشکان فعال کلینیک:
                  </label>
                  {bookingClinic.doctors && bookingClinic.doctors.length > 0 ? (
                    <div className="space-y-2.5">
                      {bookingClinic.doctors.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => selectDoctorToBook(doc)}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-gadget-light hover:bg-gadget-light/5 cursor-pointer transition-all group shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 group-hover:bg-white text-gray-400 group-hover:text-gadget-light rounded-xl border border-gray-100 flex items-center justify-center transition-colors shadow-2xs">
                              <User size={18} />
                            </div>
                            <p className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                              دکتر {doc.firstName} {doc.lastName}
                            </p>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-gray-400 rotate-180 group-hover:text-gadget-light transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                      <p className="text-sm font-medium">
                        پزک فعال مستقلی در این کلینیک یافت نشد.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {bookingStep === "select-slot" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      تاریخ حضور در کلینیک:
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute right-3 top-3 text-gadget-light z-10"
                        size={18}
                      />
                      <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={selectedDate ? new Date(selectedDate) : ""}
                        fixMainPosition={true}
                        onChange={(date: any) => {
                          if (date && date.isValid) {
                            const jsDate = date.toDate();
                            const year = jsDate.getFullYear();
                            const month = String(
                              jsDate.getMonth() + 1,
                            ).padStart(2, "0");
                            const day = String(jsDate.getDate()).padStart(
                              2,
                              "0",
                            );
                            fetchSlotsForDate(`${year}-${month}-${day}`);
                          } else {
                            fetchSlotsForDate("");
                          }
                        }}
                        format="YYYY/MM/DD"
                        containerClassName="w-full"
                        inputClass="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors cursor-pointer text-gray-700"
                        placeholder="انتخاب روز از تقویم..."
                      />
                    </div>
                  </div>

                  {loadingSlots ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gadget-light">
                      <Loader2 className="animate-spin mb-2" size={26} />
                      <p className="text-xs font-medium">
                        بررسی تقویم کلینیک...
                      </p>
                    </div>
                  ) : selectedDate ? (
                    availableSlots.length > 0 ? (
                      <div className="space-y-5 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            ساعت‌های ویزیت خالی:
                          </label>
                          <div className="grid grid-cols-2 gap-2.5">
                            {availableSlots.map((slot, index) => {
                              const isSelected =
                                selectedSlot?.startTime === slot.startTime;
                              return (
                                <button
                                  key={index}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                                    isSelected
                                      ? "bg-gadget-dark text-white border-gadget-dark transform scale-[1.02]"
                                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                                  }`}
                                >
                                  <span dir="ltr">{slot.startTime}</span>
                                  <span className="text-[10px] font-normal mx-1 opacity-60">
                                    تا
                                  </span>
                                  <span dir="ltr">{slot.endTime}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {selectedSlot && (
                          <div className="animate-in fade-in duration-200">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              علت نوبت یا یادداشت (اختیاری):
                            </label>
                            <div className="relative">
                              <AlignRight
                                className="absolute right-3 top-3 text-gray-400"
                                size={16}
                              />
                              <textarea
                                value={bookingNotes}
                                onChange={(e) =>
                                  setBookingNotes(e.target.value)
                                }
                                placeholder="توضیحات کوتاه برای پزشک..."
                                rows={2}
                                className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-xs focus:outline-hidden focus:border-gadget-light transition-colors resize-none shadow-2xs text-gray-700"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-orange-50/60 rounded-2xl border border-orange-100">
                        <p className="text-xs font-bold text-orange-700">
                          هیچ نوبت خالی برای این پزشک ثبت نشده است.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-400 border border-dashed border-gray-100 rounded-2xl">
                      <p className="text-xs">
                        لطفاً برای بارگذاری زمان‌ها یک تاریخ را انتخاب کنید.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* فوتر مودال */}
            {bookingStep === "select-slot" && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                <button
                  disabled={!selectedSlot}
                  onClick={handleConfirmBooking}
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedSlot
                      ? "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-md cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {selectedSlot
                    ? `تایید و ثبت نهایی رزرو ساعت ${selectedSlot.startTime}`
                    : "انتخاب ساعت ویزیت الزامی است"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
