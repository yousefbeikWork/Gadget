import { useState, useEffect } from "react";
import {
  Loader2,
  CalendarDays,
  Compass,
  Phone,
  MapPin,
  Banknote,
  Clock,
  Car,
  CheckCircle2,
  Layers,
  ChevronRight, // 👈 اضافه شد
  ChevronLeft,  // 👈 اضافه شد
} from "lucide-react";
import api from "../../services/api";

export default function LeaderAppointments({
  filterDate,
}: {
  filterDate: string;
}) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // === استیت‌های مربوط به صفحه‌بندی ===
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // تعداد آیتم در هر صفحه

  // وقتی تاریخ فیلتر عوض می‌شود، برگرد به صفحه ۱
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate]);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        // 👈 ارسال page، limit و date به سمت سرور
        let url = `/Leader/getUserBookings?page=${currentPage}&limit=${limit}`;
        if (filterDate) {
          url += `&date=${filterDate}`;
        }

        const response = await api.get(url);
        if (response.data && response.data.success) {
          setBookings(response.data.data);
          
          // 👈 تنظیم کردن تعداد کل صفحات از روی آبجکت pagination بک‌اند
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages);
          } else {
            setTotalPages(1);
          }
        }
      } catch (err) {
        setError("خطا در دریافت لیست نوبت‌های لیدر.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [filterDate, currentPage]); // 👈 اضافه شدن currentPage به وابستگی‌ها

  const translateBookingType = (type: string, shift: string) => {
    if (type === "FULL_DAY") return "روزانه (تمام‌وقت)";
    if (type === "DAY_SHIFT") return "شیفت روز";
    if (type === "NIGHT_SHIFT") return "شیفت شب";
    if (type === "HOURLY")
      return `ساعتی (${shift === "DAY" ? "شیفت روز" : "شیفت شب"})`;
    return type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1">
            <Clock size={12} /> در انتظار تایید
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 size={12} /> تایید شده
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-md text-[11px] font-bold">
            لغو شده
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gadget-light" size={40} />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
        {error}
      </div>
    );

  if (bookings.length === 0) {
    return (
      <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center animate-in fade-in">
        <div className="w-16 h-16 bg-white text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Compass size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-1">رزروی یافت نشد</h3>
        <p className="text-gray-500 text-sm">
          شما در این تاریخ هیچ رزروی برای لیدر ندارید.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      {bookings.map((booking) => (
        <div
          key={booking._id}
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        >
          {/* نوار کناری رنگی بر اساس وضعیت */}
          <div
            className={`absolute top-0 right-0 w-1.5 h-full ${booking.status === "PENDING" ? "bg-amber-400" : booking.status === "CONFIRMED" ? "bg-emerald-400" : "bg-gray-300"}`}
          ></div>

          {/* اطلاعات لیدر */}
          <div className="flex items-center gap-4 md:w-1/3">
            <div className="w-14 h-14 bg-gadget-dark/10 text-gadget-dark rounded-xl flex items-center justify-center font-bold text-xl border border-gadget-dark/20 shrink-0">
              {booking.leader.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-md text-gray-800 flex items-center gap-2">
                لیدر {booking.leader.firstName} {booking.leader.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <MapPin size={10} /> {booking.leader.city}
                </span>
                {booking.leader.hasCar && (
                  <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md flex items-center gap-1 border border-blue-100">
                    <Car size={10} /> با خودرو
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* اطلاعات زمان و نوع رزرو */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t md:border-t-0 md:border-r border-gray-100 pt-4 md:pt-0 md:pr-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays size={16} className="text-gadget-light" />
                <span className="font-bold">
                  {new Date(booking.date).toLocaleDateString("fa-IR")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Layers size={16} className="text-blue-500" />
                <span className="font-medium">
                  {translateBookingType(booking.bookingType, booking.shiftType)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} className="text-gray-400" />
                <span dir="ltr" className="font-medium">
                  {booking.leader.mobile}
                </span>
              </div>
              {booking.bookingType === "HOURLY" &&
              booking.timeSlots?.length > 0 ? (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Clock
                    size={16}
                    className="text-orange-400 shrink-0 mt-0.5"
                  />
                  <div className="flex flex-wrap gap-1">
                    {booking.timeSlots.map((slot: string, i: number) => (
                      <span
                        key={i}
                        className="bg-gray-50 border border-gray-200 text-xs px-1.5 py-0.5 rounded font-bold"
                        dir="ltr"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Clock
                    size={16}
                    className="text-orange-400 shrink-0 mt-0.5"
                  />
                  <div className="flex flex-wrap gap-1">
                    <span
                      className="bg-gray-50 border border-gray-200 text-xs px-2 py-0.5 rounded font-bold"
                      dir="rtl"
                    >
                      {booking.startTime} الی {booking.endTime}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* وضعیت و مبلغ */}
          <div className="shrink-0 flex md:flex-col items-center justify-between md:justify-center border-t md:border-t-0 md:border-r border-gray-100 pt-4 md:pt-0 md:pr-6 gap-3 min-w-30">
            {getStatusBadge(booking.status)}
            <div className="text-center">
              <span className="block text-[10px] text-gray-400 mb-0.5">
                مبلغ پرداختی
              </span>
              <span className="font-bold text-emerald-600 text-sm flex items-center justify-center gap-1">
                <Banknote size={14} />{" "}
                {new Intl.NumberFormat("fa-IR").format(booking.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* ================= کنترل‌های صفحه‌بندی (Pagination) ================= */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl shadow-xs mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
            قبلی
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gadget-dark">
              صفحه {currentPage} از {totalPages}
            </span>
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            بعدی
            <ChevronLeft size={18} />
          </button>
        </div>
      )}
    </div>
  );
}