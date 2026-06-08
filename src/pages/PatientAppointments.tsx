import { useState, useEffect } from "react";
import {
  CalendarDays,
  MapPin,
  Phone,
  User,
  Clock,
  Search,
  Loader2,
  CalendarX2,
  CheckCircle2,
  Clock4,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

// تایپ‌های مربوط به خروجی API
interface DoctorInfo {
  id: string;
  firstName: string;
  lastName: string;
  expertise: string;
  clinicPhone: string;
  clinicAddress: string;
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

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // استیت برای فیلتر تاریخ (اختیاری در API شما)
  const [filterDate, setFilterDate] = useState("");

  const fetchAppointments = async (dateFilter = "") => {
    try {
      setLoading(true);
      setError("");
      // ساخت URL با پیجینیشن و فیلتر تاریخ (در صورت وجود)
      let url = `/book/patientAppointmentBooking?page=1&limit=10`;
      if (dateFilter) {
        url += `&date=${dateFilter}`;
      }

      const response = await api.get(url);

      if (response.data && response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (err) {
      setError("خطا در دریافت لیست نوبت‌ها. لطفاً دوباره تلاش کنید.");
      toast.error("مشکلی در ارتباط با سرور پیش آمد.");
    } finally {
      setLoading(false);
    }
  };

  // دریافت اطلاعات در زمان لود اولیه و هر بار که فیلتر تاریخ عوض می‌شود
  useEffect(() => {
    fetchAppointments(filterDate);
  }, [filterDate]);

  // تابع کمکی برای استایل‌دهی به وضعیت نوبت
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-bold border border-green-100">
            <CheckCircle2 size={14} />
            تایید شده
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold border border-orange-100">
            <Clock4 size={14} />
            در انتظار تایید
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold border border-red-100">
            <CalendarX2 size={14} />
            لغو شده
          </span>
        );
      default:
        return null;
    }
  };

  // تابع کمکی برای فرمت کردن تاریخ میلادی به یک شکل خواناتر (برای نمایش)
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto">
        {/* هدر صفحه و فیلتر */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b border-gray-50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
              <CalendarDays size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">نوبت‌های من</h1>
              <p className="text-gray-500 text-sm mt-1">
                لیست و وضعیت قرارهای ملاقات شما با پزشکان
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors text-gray-600"
              />
            </div>
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                لغو فیلتر
              </button>
            )}
          </div>
        </div>

        {/* وضعیت لودینگ */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال دریافت لیست نوبت‌ها...</p>
          </div>
        )}

        {/* وضعیت خطا */}
        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* حالت خالی (وقتی نوبتی وجود ندارد) */}
        {!loading && !error && appointments.length === 0 && (
          <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-white text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CalendarX2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">
              نوبتی یافت نشد
            </h3>
            <p className="text-gray-500 text-sm">
              شما در این تاریخ هیچ قرار ملاقاتی ندارید.
            </p>
          </div>
        )}

        {/* لیست نوبت‌ها */}
        {!loading && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.appointmentId}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 group"
              >
                {/* اطلاعات پزشک */}
                <div className="flex items-center gap-4 md:w-1/3">
                  <div className="w-14 h-14 bg-linear-to-br from-gadget-light to-gadget-dark text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm shrink-0">
                    {appointment.doctor?.firstName ? (
                      appointment.doctor.firstName[0]
                    ) : (
                      <User size={24} />
                    )}
                  </div>
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

                {/* اطلاعات زمان و وضعیت */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t md:border-t-0 md:border-r border-gray-100 pt-4 md:pt-0 md:pr-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays size={16} className="text-gadget-light" />
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
                      <span dir="ltr">{appointment.doctor.clinicPhone}</span>
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
                  {getStatusBadge(appointment.status)}
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
      </div>
    </div>
  );
}
