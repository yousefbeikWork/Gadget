import { useState, useEffect } from "react";
import { 
  Loader2, 
  FlaskConical, 
  CalendarDays, 
  Clock, 
  ClipboardList, 
  TestTube2,
  ChevronRight, // 👈 اضافه شد
  ChevronLeft   // 👈 اضافه شد
} from "lucide-react";
import api from "../../services/api";
import { EmptyState } from "./EmptyState";

export default function LabAppointments({ filterDate }: { filterDate: string }) {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // === استیت‌های مربوط به صفحه‌بندی ===
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // تعداد آیتم در هر صفحه

  // وقتی تاریخ فیلتر عوض می‌شود، برگرد به صفحه ۱
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate]);

  useEffect(() => {
    const fetchLabs = async () => {
      setLoading(true);
      try {
        // 👈 ارسال پارامترهای صفحه‌بندی و تاریخ به سرور
        let url = `/users/laborator-reservations?page=${currentPage}&limit=${limit}`;
        if (filterDate) {
          url += `&date=${filterDate}`;
        }

        const res = await api.get(url);
        
        if (res.data?.reservations) {
          setReservations(res.data.reservations);
          
          // 👈 تنظیم کردن تعداد کل صفحات از روی آبجکت pagination بک‌اند
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages);
          } else {
            setTotalPages(1);
          }
        }
      } catch (err) {
        console.error("خطا در دریافت لیست نوبت‌های آزمایشگاه", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, [filterDate, currentPage]); // 👈 اضافه شدن currentPage به وابستگی‌ها

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gadget-light" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      {reservations.length === 0 ? (
        <EmptyState 
          icon={FlaskConical} 
          title="نوبت آزمایشگاهی یافت نشد" 
          desc="شما در این تاریخ هیچ نوبت آزمایشگاهی ندارید." 
        />
      ) : (
        <div className="space-y-4">
          {/* لیست کارت‌های آزمایشگاه */}
          {reservations.map((res) => (
            <div key={res.slotId} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              <div className="md:w-1/3 space-y-2">
                <h3 className="font-bold text-gray-800">{res.laboratory.centerName}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{res.laboratory.address}</p>
                <div className="flex items-center gap-2 text-sm text-gray-700 pt-2 border-t border-gray-50 mt-2">
                  <CalendarDays size={16} className="text-gadget-light" /> 
                  <span className="font-bold">{new Date(res.date).toLocaleDateString('fa-IR')}</span>
                  <Clock size={16} className="text-orange-400 mr-2" /> 
                  <span className="font-bold" dir="ltr">{res.time}</span>
                </div>
              </div>
              
              <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-3 border-b border-gray-200/50 pb-2">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <TestTube2 size={16} className="text-blue-500"/> 
                    {res.test.testName}
                  </h4>
                  <span className="font-bold text-emerald-600 text-sm">
                    {res.test.price.toLocaleString()} تومان
                  </span>
                </div>
                <p className="text-xs text-gray-600 flex gap-2 leading-relaxed">
                  <ClipboardList size={16} className="text-amber-500 shrink-0 mt-0.5"/> 
                  {res.test.preparationInstructions || "نیاز به آمادگی خاصی ندارد."}
                </p>
              </div>
            </div>
          ))}

          {/* ================= کنترل‌های صفحه‌بندی (Pagination) ================= */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl shadow-xs mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                بعدی
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}