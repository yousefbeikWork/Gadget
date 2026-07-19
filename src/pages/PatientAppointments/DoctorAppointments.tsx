import { useState, useEffect } from "react";
import { Loader2, CalendarDays, Clock, Phone, MapPin, CalendarX2, Building2 } from "lucide-react";
import api from "../../services/api";
import { EmptyState } from "./EmptyState";
import DoctorAvatar from "../../components/DoctorAvatar";

// === آپدیت اینترفیس‌ها بر اساس خروجی جدید ===
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
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  notes: string;
  bookingSource: "DIRECT" | "CLINIC";
  clinic: ClinicInfo | null;
  doctor: DoctorInfo;
}

export default function DoctorAppointments({ filterDate }: { filterDate: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        let url = `/book/patientAppointmentBooking?page=1&limit=10`;
        if (filterDate) url += `&date=${filterDate}`;
        const res = await api.get(url);
        if (res.data?.success) setAppointments(res.data.data);
      } catch (err) {
        console.error("خطا در دریافت لیست پزشک", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [filterDate]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gadget-light" size={40} /></div>;

  return (
    <div className="space-y-4 animate-in fade-in">
      {appointments.length === 0 ? (
        <EmptyState icon={CalendarX2} title="نوبتی یافت نشد" desc="شما در این تاریخ هیچ قرار ملاقاتی با پزشک ندارید." />
      ) : (
        appointments.map((app) => {
          // 👈 بررسی اینکه آیا رزرو از طریق کلینیک بوده یا مطب شخصی
          const isClinic = app.bookingSource === "CLINIC" && app.clinic;
          
          // تعیین آدرس و شماره تماس بر اساس نوع رزرو
          const displayPhone = isClinic ? app.clinic?.phones.join(" - ") : app.doctor.clinicPhone;
          const displayAddress = isClinic ? app.clinic?.address : app.doctor.clinicAddress;

          return (
            <div key={app.appointmentId} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6">
              
              {/* === اطلاعات پزشک و نوع مرکز === */}
              <div className="flex items-center gap-4 md:w-1/3">
                <DoctorAvatar imageProfile={app.doctor.imageProfile} firstName={app.doctor.firstName} className="w-14 h-14 text-xl" />
                <div>
                  <h3 className="font-bold text-gray-800">دکتر {app.doctor.firstName} {app.doctor.lastName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{app.doctor.expertise}</p>
                  
                  {/* برچسب نمایش نوع مرکز درمانی */}
                  {isClinic ? (
                    <div className="flex items-center gap-1 mt-2 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold w-fit border border-blue-100">
                      <Building2 size={12} />
                      رزرو در {app.clinic?.name}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-2 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-bold w-fit border border-gray-200">
                      مطب شخصی
                    </div>
                  )}
                </div>
              </div>

              {/* === اطلاعات زمان و آدرس (داینامیک) === */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t md:border-t-0 md:border-r border-gray-100 pt-4 md:pt-0 md:pr-6">
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-gadget-light shrink-0"/> 
                    <span className="font-medium">{new Date(app.date).toLocaleDateString('fa-IR')}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={16} className="text-orange-400 shrink-0"/> 
                    <span className="font-bold text-gray-800" dir="ltr">{app.startTime} - {app.endTime}</span>
                  </p>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-start gap-2">
                    <Phone size={16} className="text-gray-400 shrink-0 mt-0.5"/> 
                    <span dir="ltr" className="font-medium">{displayPhone || "نامشخص"}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5"/> 
                    <span className="line-clamp-2" title={displayAddress}>{displayAddress || "ثبت نشده"}</span>
                  </p>
                </div>
              </div>

            </div>
          );
        })
      )}
    </div>
  );
}