import { useState, useEffect } from "react";
import {
  CalendarDays,
  MapPin,
  Phone,
  Clock,
  Search,
  Loader2,
  CalendarX2,
  CreditCard,
  FlaskConical,
  TestTube2,
  Banknote,
  ClipboardList,
  Stethoscope,
} from "lucide-react";
import api from "../services/api";
// import toast from "react-hot-toast";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DoctorAvatar from "../components/DoctorAvatar";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

// === اینترفیس‌های نوبت پزشک ===
interface DoctorInfo {
  id: string;
  firstName: string;
  lastName: string;
  expertise: string;
  clinicPhone: string;
  clinicAddress: string;
  imageProfile?: string;
}

interface Appointment {
  appointmentId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  notes: string;
  doctor: DoctorInfo;
}

// === اینترفیس‌های نوبت آزمایشگاه ===
interface LabReservation {
  slotId: string;
  date: string;
  time: string;
  status: string;
  laboratory: {
    id: string;
    centerName: string;
    centerType: string;
    address: string;
    phones: string[];
  };
  test: {
    id: string;
    testName: string;
    price: number;
    preparationInstructions: string;
  };
}

export default function PatientAppointments() {
  // === تب فعال ===
  const [activeTab, setActiveTab] = useState<"doctor" | "lab">("doctor");

  // === استیت‌های نوبت پزشک ===
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingDoctor, setLoadingDoctor] = useState(false);

  // === استیت‌های نوبت آزمایشگاه ===
  const [labReservations, setLabReservations] = useState<LabReservation[]>([]);
  const [loadingLab, setLoadingLab] = useState(false);

  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // تابع دریافت نوبت‌های پزشک
  const fetchDoctorAppointments = async (dateFilter = "") => {
    try {
      setLoadingDoctor(true);
      setError("");
      let url = `/book/patientAppointmentBooking?page=1&limit=10`;
      if (dateFilter) {
        url += `&date=${dateFilter}`;
      }

      const response = await api.get(url);
      if (response.data && response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (err) {
      setError("خطا در دریافت لیست نوبت‌های پزشک. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoadingDoctor(false);
    }
  };

  // تابع دریافت نوبت‌های آزمایشگاه
  const fetchLabReservations = async (dateFilter = "") => {
    try {
      setLoadingLab(true);
      setError("");

      // ارسال درخواست به سرور (پارامتر date را هم می‌فرستیم برای زمانی که بک‌اند آپدیت شد)
      let url = `/users/laborator-reservations`;
      if (dateFilter) {
        url += `?date=${dateFilter}`;
      }

      const response = await api.get(url);

      if (response.data && response.data.reservations) {
        let fetchedData = response.data.reservations;

        // 👈 راه‌حل قطعی: فیلتر کردن دستی رکوردها در سمت فرانت‌اند
        if (dateFilter) {
          fetchedData = fetchedData.filter(
            (reservation: LabReservation) => reservation.date === dateFilter,
          );
        }

        setLabReservations(fetchedData);
      } else {
        setLabReservations([]);
      }
    } catch (err) {
      setError(
        "خطا در دریافت لیست نوبت‌های آزمایشگاه. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setLoadingLab(false);
    }
  };

  // هوک برای فراخوانی API بر اساس تب فعال و فیلتر تاریخ
  useEffect(() => {
    if (activeTab === "doctor") {
      fetchDoctorAppointments(filterDate);
    } else {
      fetchLabReservations(filterDate);
    }
  }, [filterDate, activeTab]);

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    if (!price) return "نامشخص";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto">
        {/* ================= هدر صفحه و فیلتر ================= */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 border-b border-gray-50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
              <CalendarDays size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">نوبت‌های من</h1>
              <p className="text-gray-500 text-sm mt-1">
                مدیریت قرارهای ملاقات و آزمایشات شما
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={18}
              />
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={filterDate ? new Date(filterDate) : ""}
                onChange={(date: any) => {
                  if (date && date.isValid) {
                    const jsDate = date.toDate();
                    const year = jsDate.getFullYear();
                    const month = String(jsDate.getMonth() + 1).padStart(
                      2,
                      "0",
                    );
                    const day = String(jsDate.getDate()).padStart(2, "0");
                    setFilterDate(`${year}-${month}-${day}`);
                  } else {
                    setFilterDate("");
                  }
                }}
                format="YYYY/MM/DD"
                containerClassName="w-full"
                inputClass="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light cursor-pointer shadow-sm font-medium text-gray-700"
                placeholder="انتخاب تاریخ از تقویم..."
              />
            </div>
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                لغو فیلتر
              </button>
            )}
          </div>
        </div>

        {/* ================= تب‌ها ================= */}
        <div className="flex gap-2 mb-6 bg-gray-50/50 p-1 rounded-xl border border-gray-100 w-full md:w-fit">
          <button
            onClick={() => setActiveTab("doctor")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "doctor"
                ? "bg-white text-gadget-dark shadow-sm border border-gray-200/60"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Stethoscope size={16} />
            نوبت‌های پزشک
          </button>
          <button
            onClick={() => setActiveTab("lab")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "lab"
                ? "bg-white text-gadget-dark shadow-sm border border-gray-200/60"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FlaskConical size={16} />
            نوبت‌های آزمایشگاه
          </button>
        </div>

        {/* ================= مدیریت وضعیت خطا و لودینگ ================= */}
        {(loadingDoctor || loadingLab) && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال دریافت لیست نوبت‌ها...</p>
          </div>
        )}

        {error && !loadingDoctor && !loadingLab && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* ================= محتوای تب پزشکان ================= */}
        {activeTab === "doctor" && !loadingDoctor && !error && (
          <>
            {appointments.length === 0 ? (
              <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center animate-in fade-in">
                <div className="w-16 h-16 bg-white text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <CalendarX2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">
                  نوبتی یافت نشد
                </h3>
                <p className="text-gray-500 text-sm">
                  شما در این تاریخ هیچ قرار ملاقاتی با پزشک ندارید.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.appointmentId}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                  >
                    {/* اطلاعات پزشک */}
                    <div className="flex items-center gap-4 md:w-1/3">
                      <DoctorAvatar
                        imageProfile={appointment.doctor.imageProfile}
                        firstName={appointment.doctor.firstName}
                        className="w-14 h-14 text-xl"
                      />
                      <div>
                        <h3 className="font-bold text-md text-gray-800">
                          دکتر {appointment.doctor.firstName}{" "}
                          {appointment.doctor.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {appointment.doctor.expertise}
                        </p>
                      </div>
                    </div>

                    {/* اطلاعات زمان و آدرس */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t md:border-t-0 md:border-r border-gray-100 pt-4 md:pt-0 md:pr-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDays
                            size={16}
                            className="text-gadget-light"
                          />
                          <span className="font-medium">
                            {formatDate(appointment.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="text-orange-400" />
                          <span>
                            ساعت{" "}
                            <span className="font-bold text-gray-800" dir="ltr">
                              {appointment.startTime} - {appointment.endTime}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <Phone
                            size={16}
                            className="text-gray-400 mt-0.5 shrink-0"
                          />
                          <span dir="ltr">
                            {appointment.doctor.clinicPhone}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin
                            size={16}
                            className="text-gray-400 mt-0.5 shrink-0"
                          />
                          <span
                            className="line-clamp-1"
                            title={appointment.doctor.clinicAddress}
                          >
                            {appointment.doctor.clinicAddress}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* وضعیت نوبت */}
                    <div className="shrink-0 flex md:flex-col items-center justify-between border-t md:border-t-0 md:border-r border-gray-100 pt-4 md:pt-0 md:pr-6 gap-3">
                      <button
                        disabled
                        className="flex items-center justify-center gap-1.5 bg-gray-50 text-gray-400 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 cursor-not-allowed w-full md:w-auto"
                        title="درگاه پرداخت به زودی فعال می‌شود"
                      >
                        <CreditCard size={16} />
                        پرداخت (بزودی)
                      </button>
                      {appointment.notes && (
                        <span
                          className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md max-w-30 truncate"
                          title={appointment.notes}
                        >
                          یادداشت: {appointment.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ================= محتوای تب آزمایشگاه ================= */}
        {activeTab === "lab" && !loadingLab && !error && (
          <>
            {labReservations.length === 0 ? (
              <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center animate-in fade-in">
                <div className="w-16 h-16 bg-white text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <FlaskConical size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">
                  نوبت آزمایشگاهی یافت نشد
                </h3>
                <p className="text-gray-500 text-sm">
                  شما در این تاریخ هیچ نوبت آزمایشگاهی رزرو نکرده‌اید.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                {labReservations.map((reservation) => (
                  <div
                    key={reservation.slotId}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
                  >
                    {/* هدر کارت آزمایشگاه (نام و اطلاعات تماس) */}
                    <div className="bg-blue-50/50 p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gadget-dark text-white flex items-center justify-center text-xl font-bold shadow-sm shrink-0">
                          {reservation.laboratory.centerName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-md text-gray-800">
                            {reservation.laboratory.centerName}
                          </h3>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100 mt-1 inline-block">
                            {reservation.laboratory.centerType || "آزمایشگاه"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 md:items-end">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin size={14} className="text-gray-400" />
                          <span
                            className="line-clamp-1 max-w-62.5"
                            title={reservation.laboratory.address}
                          >
                            {reservation.laboratory.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          <span dir="ltr">
                            {reservation.laboratory.phones?.[0] || "نامشخص"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* اطلاعات شیفت و تست */}
                    <div className="p-4 flex flex-col md:flex-row gap-6">
                      {/* مشخصات زمانی */}
                      <div className="md:w-1/3 space-y-3 md:border-r border-gray-100 md:pr-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CalendarDays
                            size={18}
                            className="text-gadget-light"
                          />
                          <span className="font-medium">
                            {formatDate(reservation.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock size={18} className="text-orange-400" />
                          <span className="font-bold text-gray-800" dir="ltr">
                            {reservation.time}
                          </span>
                        </div>
                        {/* دکمه موقت پرداخت */}
                        <button
                          disabled
                          className="mt-2 w-full flex items-center justify-center gap-1.5 bg-gray-50 text-gray-400 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 cursor-not-allowed"
                        >
                          <CreditCard size={14} />
                          پرداخت و قطعی‌سازی (بزودی)
                        </button>
                      </div>

                      {/* اطلاعات تست */}
                      <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                          <div className="flex items-center gap-2">
                            <TestTube2 size={16} className="text-blue-500" />
                            <span className="font-bold text-gray-800 text-sm">
                              {reservation.test.testName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                            <Banknote size={16} />
                            {formatPrice(reservation.test.price)}
                          </div>
                        </div>

                        {reservation.test.preparationInstructions ? (
                          <div className="flex items-start gap-2 pt-1">
                            <ClipboardList
                              size={16}
                              className="text-amber-500 shrink-0 mt-0.5"
                            />
                            <p className="text-xs text-gray-600 font-medium leading-relaxed">
                              <span className="font-bold text-gray-700">
                                دستورالعمل آمادگی:{" "}
                              </span>
                              {reservation.test.preparationInstructions}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">
                            نیاز به آمادگی خاصی پیش از انجام آزمایش نیست.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
