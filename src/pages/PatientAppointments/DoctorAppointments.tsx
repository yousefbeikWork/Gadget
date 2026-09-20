import { useState, useEffect } from "react";
import { 
  Loader2, 
  CalendarDays, 
  Clock, 
  Phone, 
  MapPin, 
  CalendarX2, 
  Building2,
  Hospital as HospitalIcon,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText
} from "lucide-react";
import api from "../../services/api";
import { EmptyState } from "./EmptyState";
import DoctorAvatar from "../../components/DoctorAvatar";

interface ClinicInfo {
  id: string;
  name: string;
  address: string;
  phones: string[];
}

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
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | string;
  notes?: string;
  bookingSource: "DIRECT" | "CLINIC" | "HOSPITAL";
  clinic: ClinicInfo | null;
  doctor: DoctorInfo;
}

export default function DoctorAppointments({ filterDate }: { filterDate: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // استیت‌های صفحه‌بندی
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        let url = `/book/patientAppointmentBooking?page=${currentPage}&limit=${limit}`;
        if (filterDate) url += `&date=${filterDate}`;
        
        const res = await api.get(url);
        
        if (res.data?.success) {
          setAppointments(res.data.data || []);
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages || 1);
          }
        }
      } catch (err) {
        console.error("خطا در دریافت لیست نوبت‌ها", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [filterDate, currentPage]);

  // بج وضعیت نوبت
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <CheckCircle2 size={12} className="text-emerald-600" />
            تایید شده
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/80 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <XCircle size={12} className="text-rose-600" />
            لغو شده
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <AlertCircle size={12} className="text-amber-600" />
            در انتظار
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gadget-light font-sans">
        <Loader2 className="animate-spin mb-3" size={38} />
        <span className="text-xs font-bold text-gray-400">در حال بارگذاری نوبت‌ها...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in font-sans" dir="rtl">
      {appointments.length === 0 ? (
        <EmptyState 
          icon={CalendarX2} 
          title="نوبتی یافت نشد" 
          desc="شما در این تاریخ هیچ قرار ملاقاتی با پزشک ندارید." 
        />
      ) : (
        <div className="space-y-4">
          {/* لیست کارت‌ها */}
          {appointments.map((app) => {
            const isHospital = app.bookingSource === "HOSPITAL" && app.clinic;
            const isClinic = app.bookingSource === "CLINIC" && app.clinic;
            const isMedicalCenter = isHospital || isClinic;

            const displayPhone = isMedicalCenter ? app.clinic?.phones?.[0] : app.doctor.clinicPhone;
            const displayAddress = isMedicalCenter ? app.clinic?.address : app.doctor.clinicAddress;

            return (
              <div 
                key={app.appointmentId} 
                className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col gap-4"
              >
                {/* بخش اول: هدر کارت (اطلاعات پزشک + وضعیت نوبت) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <DoctorAvatar 
                      imageProfile={app.doctor.imageProfile} 
                      firstName={app.doctor.firstName} 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 text-lg border border-gray-100 shadow-2xs" 
                    />
                    <div className="min-w-0">
                      <h3 className="font-black text-gray-900 text-sm sm:text-base truncate">
                        دکتر {app.doctor.firstName} {app.doctor.lastName}
                      </h3>
                      <p className="text-xs text-gadget-dark/80 font-bold mt-0.5 truncate">
                        {app.doctor.expertise || "پزشک عمومی"}
                      </p>
                    </div>
                  </div>

                  {/* وضعیت نوبت در گوشه بالا */}
                  <div className="shrink-0">
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* تگ مرکز درمانی یا مطب شخصی */}
                <div>
                  {isHospital ? (
                    <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-teal-100 max-w-full truncate">
                      <HospitalIcon size={13} className="shrink-0 text-teal-600" />
                      <span className="truncate">بیمارستان {app.clinic?.name}</span>
                    </span>
                  ) : isClinic ? (
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-blue-100 max-w-full truncate">
                      <Building2 size={13} className="shrink-0 text-blue-600" />
                      <span className="truncate">کلینیک {app.clinic?.name}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-gray-200">
                      ویزیت در مطب شخصی
                    </span>
                  )}
                </div>

                {/* بخش دوم: باکس زمان و تاریخ نوبت (Ticket Block) */}
                <div className="grid grid-cols-2 gap-2 bg-gray-50/90 border border-gray-100 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gadget-light shadow-2xs shrink-0">
                      <CalendarDays size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] text-gray-400 font-medium">تاریخ ویزیت</span>
                      <span className="block text-xs font-bold text-gray-800 truncate">
                        {new Date(app.date).toLocaleDateString('fa-IR', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-r border-gray-200/70 pr-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-orange-500 shadow-2xs shrink-0">
                      <Clock size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] text-gray-400 font-medium">ساعت حضور</span>
                      <span className="block text-xs font-bold text-gray-800" dir="ltr">
                        {app.startTime} - {app.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* بخش سوم: آدرس و تلفن تماس */}
                <div className="space-y-2 text-xs text-gray-600 pt-1 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed line-clamp-2" title={displayAddress || ""}>
                      {displayAddress || "آدرس ثبت نشده است"}
                    </span>
                  </div>

                  {displayPhone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 shrink-0" />
                      <a 
                        href={`tel:${displayPhone}`}
                        className="font-mono text-gray-700 hover:text-gadget-dark font-bold transition-colors"
                        dir="ltr"
                      >
                        {displayPhone}
                      </a>
                    </div>
                  )}

                  {/* نمایش یادداشت در صورت وجود */}
                  {app.notes && (
                    <div className="flex items-start gap-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100/80 text-[11px] text-amber-900 mt-2">
                      <FileText size={13} className="shrink-0 mt-0.5 text-amber-600" />
                      <span className="line-clamp-2">یادداشت: {app.notes}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}

          {/* ================= کنترل‌های صفحه‌بندی ================= */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-gray-200 p-3 sm:p-4 rounded-2xl shadow-2xs mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
              >
                <ChevronRight size={16} />
                <span>قبلی</span>
              </button>
              
              <span className="text-xs sm:text-sm font-bold text-gray-700">
                صفحه {currentPage} از {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
              >
                <span>بعدی</span>
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}