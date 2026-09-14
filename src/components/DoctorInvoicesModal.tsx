import { useState, useEffect } from "react";
import {
  X,
  Receipt,
  Search,
  Calendar,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  User,
  ChevronRight,
  ChevronLeft,
  Hash,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  Expertise: string;
}

interface InvoiceItem {
  _id: string;
  amount: number;
  status: "SUCCESS" | "PAID" | "FAILED" | "PENDING" | string;
  refNum?: string | null;
  date: string;
  patientId?: {
    firstName?: string;
    lastName?: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

export default function DoctorInvoicesModal({ isOpen, onClose, doctor }: Props) {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);

  // استیت‌های فیلتر
  const [statusFilter, setStatusFilter] = useState("");
  const [refNumFilter, setRefNumFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // استیت‌های صفحه‌بندی
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchInvoices = async (page = 1) => {
    if (!doctor?._id) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "10");

      if (statusFilter) params.append("status", statusFilter);
      if (refNumFilter.trim()) params.append("refNum", refNumFilter.trim());
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await api.get(
        `/Admin/getDoctorInvoices/${doctor._id}?${params.toString()}`
      );

      if (response.data?.success) {
        setInvoices(response.data.data || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalCount(response.data.pagination.total || 0);
          setCurrentPage(response.data.pagination.currentPage || page);
        }
      } else {
        setInvoices([]);
      }
    } catch (err: any) {
      console.error("خطا در دریافت صورت‌حساب‌ها:", err);
      toast.error("خطا در دریافت لیست صورت‌حساب‌ها");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // اعمال فیلترها و ریست به صفحه ۱
  useEffect(() => {
    if (isOpen && doctor?._id) {
      setCurrentPage(1);
      fetchInvoices(1);
    }
  }, [isOpen, doctor?._id, statusFilter, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInvoices(1);
  };

  const resetFilters = () => {
    setStatusFilter("");
    setRefNumFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchInvoices(newPage);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <CheckCircle2 size={12} /> موفق
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <XCircle size={12} /> ناموفق
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <Clock size={12} /> در انتظار
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100 font-sans">
        
        {/* ================= هدر مودال ================= */}
        <div className="bg-emerald-700 p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center shadow-xs">
              <Receipt size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base">
                صورت‌حساب‌های مالی دکتر {doctor.firstName} {doctor.lastName}
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                تخصص: {doctor.Expertise} • تعداد کل تراکنش‌ها: {totalCount} عدد
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ================= نوار ابزار فیلترها ================= */}
        <div className="bg-gray-50/80 p-4 border-b border-gray-200/70 shrink-0">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* ۱. فیلتر وضعیت */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">وضعیت پرداخت:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="SUCCESS">موفق (SUCCESS)</option>
                <option value="FAILED">ناموفق (FAILED)</option>
                <option value="PENDING">در انتظار (PENDING)</option>
              </select>
            </div>

            {/* ۲. تاریخ شروع (از تاریخ) */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">از تاریخ:</label>
              <div className="relative">
                <Calendar className="absolute right-2.5 top-2.5 text-gray-400 z-10" size={14} />
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={startDate ? new Date(startDate) : ""}
                  onChange={(date: any) => {
                    if (date && date.isValid) {
                      const jsDate = date.toDate();
                      const y = jsDate.getFullYear();
                      const m = String(jsDate.getMonth() + 1).padStart(2, "0");
                      const d = String(jsDate.getDate()).padStart(2, "0");
                      setStartDate(`${y}-${m}-${d}`);
                    } else {
                      setStartDate("");
                    }
                  }}
                  format="YYYY/MM/DD"
                  containerClassName="w-full"
                  inputClass="w-full bg-white border border-gray-200 rounded-xl pr-8 pl-3 py-2 text-xs font-medium text-gray-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer shadow-2xs"
                  placeholder="شروع بازه..."
                />
              </div>
            </div>

            {/* ۳. تاریخ پایان (تا تاریخ) */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">تا تاریخ:</label>
              <div className="relative">
                <Calendar className="absolute right-2.5 top-2.5 text-gray-400 z-10" size={14} />
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={endDate ? new Date(endDate) : ""}
                  onChange={(date: any) => {
                    if (date && date.isValid) {
                      const jsDate = date.toDate();
                      const y = jsDate.getFullYear();
                      const m = String(jsDate.getMonth() + 1).padStart(2, "0");
                      const d = String(jsDate.getDate()).padStart(2, "0");
                      setEndDate(`${y}-${m}-${d}`);
                    } else {
                      setEndDate("");
                    }
                  }}
                  format="YYYY/MM/DD"
                  containerClassName="w-full"
                  inputClass="w-full bg-white border border-gray-200 rounded-xl pr-8 pl-3 py-2 text-xs font-medium text-gray-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer shadow-2xs"
                  placeholder="پایان بازه..."
                />
              </div>
            </div>

            {/* ۴. جستجوی کد پیگیری + دکمه بازنشانی */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">کد پیگیری (refNum):</label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Hash className="absolute right-2.5 top-2.5 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={refNumFilter}
                    onChange={(e) => setRefNumFilter(e.target.value)}
                    placeholder="جستجوی کد..."
                    className="w-full bg-white border border-gray-200 rounded-xl pr-8 pl-2 py-2 text-xs font-mono focus:outline-hidden focus:border-emerald-500 shadow-2xs"
                    dir="ltr"
                  />
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  title="پاک کردن فیلترها"
                  className="p-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-500 rounded-xl transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="submit"
                  title="اعمال جستجو"
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <Search size={15} />
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* ================= بدنه لیست تراکنش‌ها ================= */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-emerald-600">
              <Loader2 className="animate-spin mb-3" size={36} />
              <p className="text-sm font-bold">در حال بارگذاری تراکنش‌ها...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 text-gray-500">
              <Receipt size={44} className="mx-auto mb-2 text-gray-300" strokeWidth={1.2} />
              <p className="font-bold text-sm text-gray-700">تراکنشی با این مشخصات یافت نشد.</p>
              <p className="text-xs text-gray-400 mt-1">لطفاً فیلترهای جستجو یا بازه زمانی را تغییر دهید.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div
                  key={inv._id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500">بیمار:</span>
                      <span className="font-bold text-sm text-gray-800">
                        {inv.patientId
                          ? `${inv.patientId.firstName || ""} ${inv.patientId.lastName || ""}`.trim()
                          : "نامشخص"}
                      </span>
                      <span className="mr-2">{getStatusBadge(inv.status)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" />
                        <span>تاریخ:</span>
                        <span className="font-medium text-gray-700">
                          {new Date(inv.date).toLocaleDateString("fa-IR")}
                        </span>
                      </div>

                      {inv.refNum && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">کد پیگیری:</span>
                          <span className="font-mono text-gray-700 truncate max-w-45 sm:max-w-70" dir="ltr">
                            {inv.refNum}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* مبلغ */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 shrink-0">
                    <span className="text-[10px] text-gray-400">مبلغ واریزی</span>
                    <span className="font-black text-emerald-700 text-base flex items-center gap-1">
                      <Banknote size={16} className="text-emerald-500" />
                      {new Intl.NumberFormat("fa-IR").format(inv.amount)} <span className="text-xs font-bold">ریال</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= کنترل‌های صفحه‌بندی ================= */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronRight size={16} />
              صفحه قبل
            </button>

            <span className="text-xs font-bold text-gray-600">
              صفحه {currentPage} از {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
            >
              صفحه بعد
              <ChevronLeft size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}