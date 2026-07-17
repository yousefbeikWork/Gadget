import { useState, useEffect } from "react";
import { Loader2, CalendarDays, Clock, Phone, MapPin, CalendarX2 } from "lucide-react";
import api from "../../services/api";
import { EmptyState } from "./EmptyState";
import DoctorAvatar from "../../components/DoctorAvatar";

export default function DoctorAppointments({ filterDate }: { filterDate: string }) {
  const [appointments, setAppointments] = useState<any[]>([]);
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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="space-y-4 animate-in fade-in">
      {appointments.length === 0 ? (
        <EmptyState icon={CalendarX2} title="نوبتی یافت نشد" desc="شما در این تاریخ هیچ قرار ملاقاتی با پزشک ندارید." />
      ) : (
        appointments.map((app) => (
          <div key={app.appointmentId} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-4 md:w-1/3">
              <DoctorAvatar imageProfile={app.doctor.imageProfile} firstName={app.doctor.firstName} className="w-14 h-14" />
              <div>
                <h3 className="font-bold text-gray-800">دکتر {app.doctor.firstName} {app.doctor.lastName}</h3>
                <p className="text-sm text-gray-500">{app.doctor.expertise}</p>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t md:border-t-0 md:border-r border-gray-100 pt-4 md:pt-0 md:pr-6">
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><CalendarDays size={16} className="text-gadget-light"/> {new Date(app.date).toLocaleDateString('fa-IR')}</p>
                <p className="flex items-center gap-2"><Clock size={16} className="text-orange-400"/> {app.startTime} - {app.endTime}</p>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><Phone size={16} className="text-gray-400"/> {app.doctor.clinicPhone}</p>
                <p className="flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> {app.doctor.clinicAddress}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}