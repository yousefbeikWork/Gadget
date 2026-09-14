import { useState, useEffect } from "react";
import {
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
  Stethoscope,
  Building2,
  Phone,
  Hash,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
} from "lucide-react";
import api from "../services/api";
// import toast from "react-hot-toast";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

interface PatientInfo {
  firstName?: string;
  lastName?: string;
  mobile?: string;
}

interface DoctorInfo {
  firstName?: string;
  lastName?: string;
  specialization?: string;
}

interface MedicalCenterInfo {
  name?: string;
}

interface InvoiceItem {
  _id: string;
  amount: number;
  status: "SUCCESS" | "PAID" | "FAILED" | "PENDING" | string;
  refNum?: string | null;
  resNum?: string | null;
  date: string;
  patientId?: PatientInfo | null;
  doctorId?: DoctorInfo | null;
  medicalCenterId?: MedicalCenterInfo | null;
}

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // استیت‌های فیلتر
  const [statusFilter, setStatusFilter] = useState("");
  const [refNumFilter, setRefNumFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // استیت‌های صفحه‌بندی
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // استیت کپی کردن کدها
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchInvoices = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "10");

      if (statusFilter) params.append("status", statusFilter);
      if (refNumFilter.trim()) params.append("refNum", refNumFilter.trim());
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await api.get(`/Admin/getInvoice?${params.toString()}`);

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
      console.error("خطا در دریافت لیست تراکنش‌ها:", err);
      setError("خطا در دریافت لیست صورت‌حساب‌ها از سرور.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(currentPage);
  }, [currentPage, statusFilter, startDate, endDate]);

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold">
            <CheckCircle2 size={13} /> موفق
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-bold">
            <XCircle size={13} /> ناموفق
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold">
            <Clock size={13} /> در انتظار
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= هدر صفحه ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <Receipt size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">مدیریت کل صورت‌حساب‌های سامانه</h1>
              <p className="text-gray-500 text-sm mt-1">
                مشاهده، پیگیری و فیلتر تمام تراکنش‌های مالی پزشکان و مراکز درمانی
              </p>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 px-4 py-2 rounded-2xl flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold text-gray-500">تعداد کل تراکنش‌ها:</span>
            <span className="text-base font-black text-emerald-700">
              {new Intl.NumberFormat("fa-IR").format(totalCount)}
            </span>
          </div>
        </div>

        {/* ================= نوار ابزار فیلترها ================= */}
        <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 md:p-5 shadow-2xs">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* فیلتر وضعیت */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">وضعیت تراکنش:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="SUCCESS">موفق (SUCCESS)</option>
                <option value="FAILED">ناموفق (FAILED)</option>
                <option value="PENDING">در انتظار (PENDING)</option>
              </select>
            </div>

            {/* از تاریخ */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">از تاریخ:</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-3 text-gray-400 z-10" size={16} />
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
                    setCurrentPage(1);
                  }}
                  format="YYYY/MM/DD"
                  containerClassName="w-full"
                  inputClass="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer shadow-2xs"
                  placeholder="شروع بازه..."
                />
              </div>
            </div>

            {/* تا تاریخ */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">تا تاریخ:</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-3 text-gray-400 z-10" size={16} />
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
                    setCurrentPage(1);
                  }}
                  format="YYYY/MM/DD"
                  containerClassName="w-full"
                  inputClass="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-xs font-medium text-gray-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer shadow-2xs"
                  placeholder="پایان بازه..."
                />
              </div>
            </div>

            {/* جستجوی کد پیگیری و دکمه‌ها */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">کد رهگیری درگاه (refNum):</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute right-3 top-3 text-gray-400" size={15} />
                  <input
                    type="text"
                    value={refNumFilter}
                    onChange={(e) => setRefNumFilter(e.target.value)}
                    placeholder="جستجوی کد..."
                    className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-xs font-mono focus:outline-hidden focus:border-emerald-500 shadow-2xs"
                    dir="ltr"
                  />
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  title="پاک کردن فیلترها"
                  className="p-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-500 rounded-xl transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="submit"
                  title="جستجو"
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* ================= نمایش وضعیت‌ها و داده‌ها ================= */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-emerald-600">
            <Loader2 className="animate-spin mb-3" size={40} />
            <p className="text-sm font-bold">در حال بارگذاری تراکنش‌ها...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-center text-sm font-medium">
            {error}
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-24 bg-gray-50/70 rounded-3xl border border-dashed border-gray-200 text-gray-500">
            <Receipt size={48} className="mx-auto mb-3 text-gray-300" strokeWidth={1.2} />
            <p className="font-bold text-base text-gray-700">هیچ صورت‌حسابی یافت نشد.</p>
            <p className="text-xs text-gray-400 mt-1">تراکنشی مطابق با فیلترهای انتخابی در سیستم ثبت نشده است.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv._id}
                className="bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* ستون راست: اطلاعات نوبت و طرفین */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 font-bold text-gray-800 text-sm">
                      <User size={16} className="text-gadget-dark" />
                      <span>
                        بیمار: {inv.patientId ? `${inv.patientId.firstName || ""} ${inv.patientId.lastName || ""}`.trim() : "نامشخص"}
                      </span>
                    </div>

                    {inv.patientId?.mobile && (
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 flex items-center gap-1" dir="ltr">
                        <Phone size={11} /> {inv.patientId.mobile}
                      </span>
                    )}

                    {getStatusBadge(inv.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-xs text-gray-600 pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Stethoscope size={14} className="text-emerald-600 shrink-0" />
                      <span>پزشک:</span>
                      <span className="font-bold text-gray-800 truncate">
                        {inv.doctorId ? `${inv.doctorId.firstName || ""} ${inv.doctorId.lastName || ""}`.trim() : "ثبت نشده"}
                      </span>
                      {inv.doctorId?.specialization && (
                        <span className="text-gray-400 text-[11px]">({inv.doctorId.specialization})</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 size={14} className="text-blue-500 shrink-0" />
                      <span>مرکز:</span>
                      <span className="font-bold text-gray-700 truncate">
                        {inv.medicalCenterId?.name || "مطب شخصی"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-amber-500 shrink-0" />
                      <span>تاریخ:</span>
                      <span className="font-medium text-gray-800">
                        {new Date(inv.date).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                  </div>

                  {/* ردیف شناسه‌ها و کد رهگیری */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-gray-400 pt-1 font-mono border-t border-gray-50">
                    {inv.refNum && (
                      <div className="flex items-center gap-1">
                        <span className="font-sans text-gray-500">کد رهگیری (refNum):</span>
                        <span className="text-gray-700 font-bold" dir="ltr">{inv.refNum}</span>
                        <button
                          onClick={() => handleCopy(inv.refNum!)}
                          className="hover:text-gadget-dark transition-colors cursor-pointer mr-1"
                          title="کپی کد"
                        >
                          {copiedText === inv.refNum ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}

                    {inv.resNum && (
                      <div className="flex items-center gap-1">
                        <span className="font-sans text-gray-500">شماره ارجاع (resNum):</span>
                        <span className="text-gray-600" dir="ltr">{inv.resNum}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ستون چپ: مبلغ پرداختی */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100 shrink-0">
                  <span className="text-xs text-gray-400">مبلغ واریزی</span>
                  <span className="font-black text-emerald-700 text-lg flex items-center gap-1">
                    <Banknote size={18} className="text-emerald-500" />
                    {new Intl.NumberFormat("fa-IR").format(inv.amount)} <span className="text-xs font-bold">ریال</span>
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* ================= کنترل‌های صفحه‌بندی ================= */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronRight size={16} />
              صفحه قبل
            </button>

            <span className="text-xs font-bold text-gray-600">
              صفحه {currentPage} از {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
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