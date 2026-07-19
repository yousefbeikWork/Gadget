import { useState, useEffect } from "react";
import {
  Users,
  Loader2,
  Calendar,
  //   Clock,
  Phone,
  User,
  CreditCard,
  Banknote,
  Activity,
  Layers,
  //   MapPin,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

interface PatientUser {
  _id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  nationalId: string;
  gender: string;
  age: number;
}

interface Booking {
  _id: string;
  user: PatientUser;
  date: string;
  bookingType: "FULL_DAY" | "SHIFT" | "HOURLY";
  shiftType?: "DAY" | "NIGHT";
  timeSlots: string[];
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  startTime: string;
  endTime: string;
}

export default function LeaderPatients() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/Leader/getLeaderBookings");
      if (response.data && response.data.success) {
        setBookings(response.data.data || []);
      }
    } catch (err) {
      console.error("خطا در دریافت لیست رزروها:", err);
      toast.error("مشکلی در دریافت اطلاعات رزروها پیش آمد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  // دیکشنری ترجمه نوع رزرو
  const translateBookingType = (type: string, shift?: string) => {
    if (type === "FULL_DAY") return "روزانه (تمام‌وقت)";
    let shiftFa = shift === "DAY" ? "روز" : shift === "NIGHT" ? "شب" : "";
    if (type === "SHIFT") return `شیفت کامل ${shiftFa}`;
    if (type === "HOURLY") return `ساعتی (شیفت ${shiftFa})`;
    return type;
  };

  // دیکشنری وضعیت رزرو
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <Clock3 size={14} /> در انتظار تایید
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <CheckCircle2 size={14} /> تایید شده
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-lg text-xs font-bold">
            لغو شده
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-bold">
            پایان یافته
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      className="bg-gray-50 rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* هدر صفحه */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                مدیریت بیماران و رزروها
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                مشاهده لیست مسافران/بیمارانی که شما را به عنوان لیدر انتخاب
                کرده‌اند
              </p>
            </div>
          </div>
        </div>

        {/* وضعیت بارگذاری */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال دریافت لیست رزروها...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 p-16 text-center rounded-2xl text-gray-500 max-w-2xl mx-auto shadow-2xs">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-300">
              <Calendar size={32} />
            </div>
            <h3 className="font-bold text-lg text-gray-700 mb-1">
              هیچ رزروی یافت نشد
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto mt-2">
              تا کنون هیچ بیماری برای خدمات راهنمایی و ترابری، شما را رزرو نکرده
              است.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* نوار کناری رنگی بر اساس وضعیت */}
                <div
                  className={`absolute top-0 right-0 w-1.5 h-full transition-opacity ${booking.status === "PENDING" ? "bg-amber-400" : booking.status === "CONFIRMED" ? "bg-emerald-400" : "bg-gray-300"}`}
                ></div>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gadget-dark/5 text-gadget-dark rounded-xl flex items-center justify-center font-bold text-lg border border-gadget-dark/10">
                      {booking.user.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {booking.user.firstName} {booking.user.lastName}
                      </h3>
                      <p
                        className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"
                        dir="ltr"
                      >
                        {booking.user.mobile} <Phone size={12} />
                      </p>
                    </div>
                  </div>
                  <div>{getStatusBadge(booking.status)}</div>
                </div>

                {/* اطلاعات بیمار */}
                <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                      <CreditCard size={12} /> کد ملی
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {booking.user.nationalId}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                      <User size={12} /> سن مسافر
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {booking.user.age} سال
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                      <Activity size={12} /> جنسیت
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {booking.user.gender === "MALE"
                        ? "مرد"
                        : booking.user.gender === "FEMALE"
                          ? "زن"
                          : "نامشخص"}
                    </span>
                  </div>
                </div>

                {/* اطلاعات رزرو (تاریخ و شیفت) */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-gadget-dark font-bold bg-gadget-dark/5 px-3 py-1.5 rounded-lg">
                      <Calendar size={16} />
                      <span dir="ltr">
                        {new Date(booking.date).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      <Layers size={16} />
                      <span>
                        {translateBookingType(
                          booking.bookingType,
                          booking.shiftType,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* اگر رزرو ساعتی بود، ساعت‌ها را نشان بده */}
                  {booking.bookingType === "HOURLY" &&
                  booking.timeSlots?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-50 mt-3">
                      <span className="text-xs text-gray-500 font-bold block w-full mb-1">
                        ساعت‌های رزرو شده:
                      </span>
                      {booking.timeSlots.map((slot, i) => (
                        <span
                          key={i}
                          className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md shadow-2xs"
                          dir="ltr"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-50 mt-3">
                      <span className="text-xs text-gray-500 font-bold block w-full mb-1">
                        بازه زمانی شیفت:
                      </span>
                      <span
                        className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md shadow-2xs"
                        dir="rtl"
                      >
                        {booking.startTime} الی {booking.endTime}
                      </span>
                    </div>
                  )}

                  {/* مبلغ */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                      <Banknote size={14} /> مبلغ پرداختی بیمار:
                    </span>
                    <span className="text-emerald-600 font-bold text-base bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                      {formatPrice(booking.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
