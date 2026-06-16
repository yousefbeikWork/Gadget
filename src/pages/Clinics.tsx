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
import { Link } from "react-router-dom";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

// تایپ پزشک داخل کلینیک
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
}

interface Slot {
  startTime: string;
  endTime: string;
}

export default function Clinics() {
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

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/clinic/listClinc", {
          headers: { accept: "application/json" },
        });

        const result = await response.data;

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
    setBookingClinic(clinic);
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
    <div className="flex-1 bg-white md:rounded-2xl shadow-lg p-6 md:p-8 overflow-y-auto custom-scrollbar relative">
      {/* ================= هدر ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gadget-dark">
            مراکز درمانی و کلینیک‌ها
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {userRole === "Patient"
              ? "کلینیک مورد نظر خود را انتخاب کرده و نوبت بگیرید"
              : "لیست مراکز درمانی ثبت شده در سامانه"}
          </p>
        </div>
      </div>

      {/* ================= جستجو ================= */}
      <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-8 flex items-center max-w-md focus-within:border-gadget-light focus-within:bg-white transition-colors">
        <div className="text-gray-400 ml-3">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="جستجوی نام کلینیک یا تخصص..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm text-gray-700 bg-transparent outline-hidden"
        />
      </div>

      {/* ================= لیست کلینیک‌ها ================= */}
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
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col h-full group"
            >
              <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gadget-light/10 text-gadget-light rounded-xl flex items-center justify-center font-bold shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    {clinic.name ? clinic.name[0] : <Building2 size={24} />}
                  </div>
                  <div>
                    <h3
                      className="font-bold text-md text-gray-800 line-clamp-1"
                      title={clinic.name}
                    >
                      {clinic.name}
                    </h3>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${clinic.status === "فعال" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                    >
                      {clinic.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 flex-1 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="text-gray-400 shrink-0" size={16} />
                  <span className="text-gray-600 font-medium truncate">
                    {clinic.specialty}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="text-gray-400 shrink-0" size={16} />
                  <span className="text-gray-600 font-medium" dir="ltr">
                    {clinic.phone}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="text-gray-400 shrink-0 mt-0.5" size={16} />
                  <span
                    className="text-gray-600 leading-relaxed line-clamp-2 text-xs"
                    title={clinic.address}
                  >
                    {clinic.address}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                {/* دکمه رزرو فقط برای بیمار و مهمان نمایش داده می‌شود */}
                {(userRole === "Patient" ||
                  userRole === "guest" ||
                  userRole === "Doctor" ||
                  !userRole) &&
                  (isLoggedIn ? (
                    <button
                      onClick={() => openBookingProcess(clinic)}
                      className="w-full flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <CalendarDays size={16} /> مشاهده پزشکان و رزرو
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 hover:border-gadget-light text-gray-600 hover:text-gadget-light py-2.5 rounded-xl text-xs font-bold transition-all"
                    >
                      <User size={16} /> برای رزرو وارد شوید
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center">
          <div className="w-16 h-16 bg-white text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Building2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">
            کلینیکی یافت نشد
          </h3>
          <p className="text-gray-500 text-sm">
            هیچ مرکز درمانی با این مشخصات در سیستم ثبت نشده است.
          </p>
        </div>
      )}

      {/* ================= مودال رزرو کلینیک (دو مرحله‌ای) ================= */}
      {bookingClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* هدر مودال */}
            <div className="bg-gadget-dark p-5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                {bookingStep === "select-slot" && (
                  <button
                    onClick={() => setBookingStep("select-doctor")}
                    className="hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                  {bookingClinic.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{bookingClinic.name}</h3>
                  <p className="text-xs text-gray-300">
                    {bookingStep === "select-doctor"
                      ? "انتخاب پزشک"
                      : `رزرو نوبت دکتر ${bookingDoctor?.lastName}`}
                  </p>
                </div>
              </div>
              <button
                onClick={closeBookingProcess}
                className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer border-none outline-hidden"
              >
                <X size={20} />
              </button>
            </div>

            {/* بدنه مودال */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-105">
              {/* مرحله 1: لیست پزشکان */}
              {bookingStep === "select-doctor" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4">
                    پزشک مورد نظر را انتخاب کنید:
                  </label>
                  {bookingClinic.doctors && bookingClinic.doctors.length > 0 ? (
                    <div className="space-y-3">
                      {bookingClinic.doctors.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => selectDoctorToBook(doc)}
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-gadget-light hover:bg-gadget-light/5 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 group-hover:bg-white text-gray-500 group-hover:text-gadget-light rounded-lg flex items-center justify-center">
                              <User size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">
                                دکتر {doc.firstName} {doc.lastName}
                              </p>
                            </div>
                          </div>
                          <CalendarDays
                            size={18}
                            className="text-gray-400 group-hover:text-gadget-light"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-sm text-gray-500 font-medium">
                        این کلینیک هنوز پزشکی ثبت نکرده است.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* مرحله 2: انتخاب تاریخ و ساعت */}
              {bookingStep === "select-slot" && (
                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      تاریخ مراجعه:
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

                            const gregorianDate = `${year}-${month}-${day}`;
                            fetchSlotsForDate(gregorianDate);
                          } else {
                            fetchSlotsForDate("");
                          }
                        }}
                        format="YYYY/MM/DD"
                        containerClassName="w-full"
                        inputClass="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors cursor-pointer text-gray-700"
                        placeholder="انتخاب تاریخ از تقویم..."
                      />
                    </div>
                  </div>

                  {loadingSlots ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gadget-light">
                      <Loader2 className="animate-spin mb-2" size={30} />
                      <p className="text-xs font-medium">
                        در حال بررسی نوبت‌های خالی...
                      </p>
                    </div>
                  ) : selectedDate ? (
                    availableSlots.length > 0 ? (
                      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            ساعت‌های خالی:
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {availableSlots.map((slot, index) => {
                              const isSelected =
                                selectedSlot?.startTime === slot.startTime;
                              return (
                                <button
                                  key={index}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`py-2.5 px-2 rounded-xl text-sm font-bold transition-all outline-hidden border-none cursor-pointer ${
                                    isSelected
                                      ? "bg-gadget-light text-white shadow-md transform scale-105"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  <span dir="ltr">{slot.startTime}</span>{" "}
                                  <span className="text-[10px] font-normal opacity-80 mx-0.5">
                                    تا
                                  </span>{" "}
                                  <span dir="ltr">{slot.endTime}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {selectedSlot && (
                          <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              توضیحات یا علت مراجعه (اختیاری):
                            </label>
                            <div className="relative">
                              <AlignRight
                                className="absolute right-3 top-3 text-gray-400"
                                size={18}
                              />
                              <textarea
                                value={bookingNotes}
                                onChange={(e) =>
                                  setBookingNotes(e.target.value)
                                }
                                placeholder="مثال: سردرد شدید دارم..."
                                rows={2}
                                className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors resize-none"
                              ></textarea>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-orange-50 rounded-2xl border border-orange-100">
                        <p className="text-sm font-bold text-orange-600">
                          نوبت خالی در این تاریخ وجود ندارد.
                        </p>
                        <p className="text-xs text-orange-400 mt-1">
                          لطفاً روز دیگری را بررسی کنید.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <Calendar
                        size={40}
                        strokeWidth={1}
                        className="mx-auto mb-2 opacity-50"
                      />
                      <p className="text-sm">
                        برای مشاهده ساعت‌ها، تقویم را انتخاب کنید
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* فوتر مودال (فقط در مرحله دوم) */}
            {bookingStep === "select-slot" && (
              <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0">
                <button
                  disabled={!selectedSlot}
                  onClick={handleConfirmBooking}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all outline-hidden border-none ${
                    selectedSlot
                      ? "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-lg cursor-pointer transform hover:-translate-y-0.5"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {selectedSlot
                    ? `تایید و رزرو ساعت ${selectedSlot.startTime}`
                    : "لطفاً یک ساعت را انتخاب کنید"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
