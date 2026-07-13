import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  UserX,
  UserCheck,
  Mail,
  Phone
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

interface Leader {
  _id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string;
  isActive: boolean;
  createdAt?: string;
}

interface PaginationInfo {
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export default function Leaders() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // استیت‌های مربوط به صفحه‌بندی
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  const fetchLeaders = async (page = 1, search = "") => {
    try {
      setLoading(true);
      
      // ساخت آدرس اندپوینت به همراه پارامترهای سرچ و صفحه‌بندی
      let url = `/users/LedearList?page=${page}&limit=10`;
      if (search) {
        url += `&search=${search}`; // یا هر پارامتری که بک‌اند برای سرچ فامیل دریافت می‌کند
      }

      const response = await api.get(url);

      if (response.data && response.data.success) {
        setLeaders(response.data.data || []);
        setPagination({
          totalItems: response.data.pagination?.totalItems || 0,
          currentPage: response.data.pagination?.currentPage || 1,
          totalPages: response.data.pagination?.totalPages || 0,
        });
      }
    } catch (err) {
      console.error("خطا در دریافت لیست لیدرها:", err);
      toast.error("مشکلی در دریافت اطلاعات لیدرها از سرور پیش آمد.");
    } finally {
      setLoading(false);
    }
  };

  // دیبانس یا تریگر کردن سرچ با تغییر استیت متنی
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLeaders(1, searchTerm);
    }, 400); // تاخیر ۴۰۰ میلی‌ثانیه‌ای برای جلوگیری از تعداد درخواست بالا به سرور

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLeaders(newPage, searchTerm);
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ================= هدر و باکس جستجو ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gadget-dark">مدیریت و لیست لیدرها</h1>
              <p className="text-gray-500 text-sm mt-1">
                مشاهده، جستجو و ارزیابی لیدرهای فعال در سامانه‌ی مرکزی
              </p>
            </div>
          </div>

          {/* سرچ بر اساس نام خانوادگی */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="جستجو بر اساس نام خانوادگی..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full pr-4 pl-10 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light transition-all shadow-sm text-gray-700"
            />
            <Search className="absolute left-4 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* ================= وضعیت بارگذاری ================= */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال بارگذاری لیست لیدرها...</p>
          </div>
        ) : leaders.length === 0 ? (
          /* ================= حالت خالی بودن سیستم (Empty State) ================= */
          <div className="bg-white border border-dashed border-gray-200 p-16 text-center rounded-2xl text-gray-500 max-w-2xl mx-auto shadow-2xs">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-300">
              <UserX size={32} />
            </div>
            <h3 className="font-bold text-lg text-gray-700 mb-1">هیچ لیدری در سیستم ثبت نشده است</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed mt-2">
              در حال حاضر هیچ لیدری مطابق با معیارهای تنظیم شده یا در کل سامانه وجود ندارد.
            </p>
          </div>
        ) : (
          /* ================= رندر کردن کارت لیدرها در صورت وجود دیتای سرور ================= */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaders.map((leader) => (
                <div
                  key={leader._id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-gadget-dark opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {leader.firstName} {leader.lastName}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                          leader.isActive ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {leader.isActive ? <UserCheck size={12} /> : <ShieldAlert size={12} />}
                          {leader.isActive ? "حساب فعال" : "غیرفعال"}
                        </span>
                      </div>

                      <div className="w-11 h-11 rounded-xl bg-gadget-dark/5 border border-gray-100 text-gadget-dark flex items-center justify-center text-lg font-bold">
                        {leader.lastName.charAt(0)}
                      </div>
                    </div>

                    <hr className="border-gray-50 mb-4" />

                    <div className="space-y-2.5 mb-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100/50" dir="ltr">
                        <Phone size={14} className="text-gray-400 shrink-0" />
                        <span className="w-full text-right font-medium">{leader.mobile}</span>
                      </div>
                      
                      {leader.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100/50" dir="ltr">
                          <Mail size={14} className="text-gray-400 shrink-0" />
                          <span className="w-full text-right font-medium truncate">{leader.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {leader.createdAt && (
                    <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] text-gray-400 flex justify-between items-center">
                      <span>تاریخ عضویت:</span>
                      <span>{new Date(leader.createdAt).toLocaleDateString("fa-IR")}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ================= کنترلر صفحه‌بندی (Pagination UI) ================= */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
                
                <div className="text-xs font-bold text-gray-600 px-3">
                  صفحه {pagination.currentPage} از {pagination.totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}