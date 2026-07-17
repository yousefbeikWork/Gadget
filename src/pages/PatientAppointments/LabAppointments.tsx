import { useState, useEffect } from "react";
import { Loader2, FlaskConical, CalendarDays, Clock, ClipboardList, TestTube2 } from "lucide-react";
import api from "../../services/api";
import { EmptyState } from "./EmptyState";

export default function LabAppointments({ filterDate }: { filterDate: string }) {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabs = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/laborator-reservations${filterDate ? `?date=${filterDate}` : ""}`);
        if (res.data?.reservations) {
          let data = res.data.reservations;
          if (filterDate) data = data.filter((r: any) => r.date === filterDate);
          setReservations(data);
        }
      } catch (err) {
        console.error("خطا در دریافت لیست آزمایشگاه", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, [filterDate]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="space-y-4 animate-in fade-in">
      {reservations.length === 0 ? (
        <EmptyState icon={FlaskConical} title="نوبت آزمایشگاهی یافت نشد" desc="شما در این تاریخ هیچ نوبت آزمایشگاهی ندارید." />
      ) : (
        reservations.map((res) => (
          <div key={res.slotId} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 space-y-2">
              <h3 className="font-bold text-gray-800">{res.laboratory.centerName}</h3>
              <p className="text-xs text-gray-500">{res.laboratory.address}</p>
              <div className="flex items-center gap-2 text-sm text-gray-700 pt-2">
                <CalendarDays size={16} className="text-gadget-light" /> {new Date(res.date).toLocaleDateString('fa-IR')}
                <Clock size={16} className="text-orange-400 mr-2" /> {res.time}
              </div>
            </div>
            <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-800 flex items-center gap-2"><TestTube2 size={16} className="text-blue-500"/> {res.test.testName}</h4>
                <span className="font-bold text-emerald-600 text-sm">{res.test.price.toLocaleString()} تومان</span>
              </div>
              <p className="text-xs text-gray-600 flex gap-2"><ClipboardList size={16} className="text-amber-500 shrink-0"/> {res.test.preparationInstructions}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}