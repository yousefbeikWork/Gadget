import { useState, useEffect } from "react";
import { Loader2, Calendar, Banknote, Layers, Clock3, CheckCircle2 } from "lucide-react";
import api from "../../services/api";

export default function LeaderAppointments() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/Leader/getUserBookings").then(res => {
      if (res.data?.success) setBookings(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in">
      {bookings.map((booking) => (
        <div key={booking._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-4 border-b pb-4">
            <div className="w-12 h-12 bg-gadget-dark/10 rounded-xl flex items-center justify-center font-bold text-gadget-dark">
              {booking.leader.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{booking.leader.firstName} {booking.leader.lastName}</h3>
              <p className="text-xs text-gray-500">{booking.leader.city}</p>
            </div>
            <span className="mr-auto text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-lg">{booking.status}</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">تاریخ:</span> <span className="font-bold" dir="ltr">{new Date(booking.date).toLocaleDateString('fa-IR')}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">نوع رزرو:</span> <span className="font-bold">{booking.bookingType}</span></div>
            <div className="flex justify-between border-t mt-2 pt-2"><span className="text-gray-400">مبلغ:</span> <span className="font-bold text-emerald-600">{booking.totalPrice.toLocaleString()} تومان</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}