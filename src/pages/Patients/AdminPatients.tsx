import { useState, useEffect } from "react";
import {
  Users, Search, Phone, CreditCard, Loader2, Wifi, WifiOff,
  ChevronRight, ChevronLeft, ScanLine, FileSpreadsheet,
  FileCheck, CheckCircle2, XCircle, Clock, X
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

import ExcelImportModal from "../../components/modals/misc/ExcelImportModal";
import PatientReviewModal from "../../components/modals/review/PatientReviewModal";
import PatientRfidModal from "../../components/modals/misc/PatientRfidModal";
import SecureImage from "../../components/common/SecureImage";


interface NationalIdVerification {
  frontImage?: string | null;
  backImage?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NOT_UPLOADED";
  rejectReason?: string | null;
}

interface AdminPatientItem {
  _id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile: string;
  rfid?: string;
  hasPaidRfid?: boolean;
  nationalIdVerification?: NationalIdVerification;
}

interface PaginationData {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export default function AdminPatients() {
  const [patients, setPatients] = useState<AdminPatientItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [rfidFilter, setRfidFilter] = useState<"ALL" | "WITH_RFID" | "WITHOUT_RFID">("ALL");
  const [docStatusFilter, setDocStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "NOT_UPLOADED">("ALL");

  // استیت‌های مودال‌ها
  const [rfidPatient, setRfidPatient] = useState<AdminPatientItem | null>(null);
  const [reviewPatient, setReviewPatient] = useState<AdminPatientItem | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [previewImageName, setPreviewImageName] = useState<string | null>(null);

  // Debounce روی جستجو
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const params: any = {
        page: currentPage,
        limit: 12,
        search: debouncedSearch.trim() || undefined,
        status: docStatusFilter !== "ALL" ? docStatusFilter : undefined,
      };
      if (rfidFilter === "WITH_RFID") params.hasRfid = true;
      if (rfidFilter === "WITHOUT_RFID") params.hasRfid = false;

      const response = await api.get("/Admin/getPatients", { params });
      if (response.data?.success) {
        setPatients(response.data.data.patients || []);
        setPagination(response.data.data.pagination);
      }
    } catch {
      setError("خطا در دریافت لیست بیماران از سرور.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage, debouncedSearch, rfidFilter, docStatusFilter]);

  // ثبت تایید یا رد مدارک هویتی بیمار
  const handleReviewDocuments = async (action: "APPROVE" | "REJECT", reason?: string) => {
    if (!reviewPatient) return;
    setIsSubmittingReview(true);
    const toastId = toast.loading("در حال ثبت نتیجه بررسی مدارک...");

    try {
      await api.put(`/Admin/${reviewPatient._id}/reviewPatientDocuments`, {
        action,
        rejectReason: reason,
      });

      toast.success(action === "APPROVE" ? "مدارک بیمار تایید شد." : "مدارک رد شد.", { id: toastId });

      // بروزرسانی آنی لیست بیماران
      setPatients((prev) =>
        prev.map((p) =>
          p._id === reviewPatient._id
            ? {
                ...p,
                nationalIdVerification: {
                  ...p.nationalIdVerification!,
                  status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                  rejectReason: action === "REJECT" ? reason : null,
                },
              }
            : p
        )
      );

      setReviewPatient(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در بررسی مدارک بیمار.", { id: toastId });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderDocBadge = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md"><CheckCircle2 size={11} /> تایید شده</span>;
      case "REJECTED":
        return <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md"><XCircle size={11} /> رد شده</span>;
      case "PENDING":
        return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse"><Clock size={11} /> در انتظار بررسی</span>;
      default:
        return <span className="text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">بارگذاری نشده</span>;
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl md:rounded-3xl border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-3 sm:p-6 md:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col space-y-5">
        
        {/* ================== هدر، فیلترها، اکسل و جستجو ================== */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/70 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl shrink-0">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black text-gray-800">بانک جامع بیماران</h1>
              <p className="text-gray-500 text-xs mt-0.5">
                {pagination ? `کل بیماران: ${pagination.total.toLocaleString()} نفر` : "مدیریت و احراز هویت بیماران"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <FileSpreadsheet size={15} /> <span>بارگذاری با اکسل</span>
            </button>

            {/* دراپ‌داون وضعیت مدارک */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-gray-400 ml-1.5 font-medium hidden sm:inline">مدارک:</span>
              <select
                value={docStatusFilter}
                onChange={(e) => { setDocStatusFilter(e.target.value as any); setCurrentPage(1); }}
                className="bg-transparent font-bold text-gray-700 outline-hidden cursor-pointer text-xs"
              >
                <option value="ALL">همه وضعیت‌ها</option>
                <option value="PENDING">در انتظار بررسی</option>
                <option value="APPROVED">تایید شده</option>
                <option value="REJECTED">رد شده</option>
                <option value="NOT_UPLOADED">بارگذاری نشده</option>
              </select>
            </div>

            {/* فیلتر کارت RFID */}
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
              {(["ALL", "WITH_RFID", "WITHOUT_RFID"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setRfidFilter(type); setCurrentPage(1); }}
                  className={`px-2.5 py-1.5 font-bold rounded-lg cursor-pointer transition-all ${
                    rfidFilter === type ? "bg-white shadow-2xs text-gadget-dark font-black" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {type === "ALL" && "همه"}
                  {type === "WITH_RFID" && <span className="flex items-center gap-1"><Wifi size={11} /> با کارت</span>}
                  {type === "WITHOUT_RFID" && <span className="flex items-center gap-1"><WifiOff size={11} /> بی کارت</span>}
                </button>
              ))}
            </div>

            {/* کادر جستجو */}
            <div className="relative w-full sm:w-52">
              <Search className="absolute right-3 top-3 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="جستجو (نام، کدملی)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-xs focus:border-gadget-dark focus:bg-white outline-hidden shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* لودینگ و خطا */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-dark">
            <Loader2 className="animate-spin mb-3" size={36} />
            <p className="text-xs font-bold text-gray-500">در حال دریافت لیست بیماران...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-center text-xs font-bold border border-red-100 max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* گرید بیماران */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {patients.map((patient) => (
                <div key={patient._id} className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between group">
                  <div>
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      {patient.rfid ? (
                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                          <Wifi size={11} /> دارای کارت
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-gray-50 text-gray-500 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-gray-200">
                          <WifiOff size={11} /> بدون کارت
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 bg-gray-50/70 p-3 rounded-xl border border-gray-100 text-xs mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-1"><CreditCard size={13} /> کد ملی:</span>
                        <strong className="text-gray-800 font-mono" dir="ltr">{patient.nationalId || "---"}</strong>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200/40 pt-1.5">
                        <span className="text-gray-400 flex items-center gap-1"><Phone size={13} /> موبایل:</span>
                        <strong className="text-gray-800 font-mono" dir="ltr">{patient.mobile || "---"}</strong>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200/40 pt-1.5">
                        <span className="text-gray-400">هزینه RFID:</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${patient.hasPaidRfid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                          {patient.hasPaidRfid ? "پرداخت شده" : "پرداخت نشده"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200/40 pt-1.5">
                        <span className="text-gray-400">مدارک هویتی:</span>
                        {renderDocBadge(patient.nationalIdVerification?.status)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setReviewPatient(patient)}
                      className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                    >
                      <FileCheck size={14} /> <span>بررسی مدارک</span>
                    </button>

                    <button
                      disabled={!patient.hasPaidRfid}
                      onClick={() => setRfidPatient(patient)}
                      className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        !patient.hasPaidRfid
                          ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-75"
                          : patient.rfid
                          ? "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer"
                          : "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-xs cursor-pointer"
                      }`}
                    >
                      <ScanLine size={14} />
                      <span>{patient.rfid ? "ویرایش RFID" : "ثبت RFID"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* صفحه‌بندی */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-gray-200/80 shadow-2xs mt-4">
                <span className="text-xs font-bold text-gray-500">
                  صفحه {pagination.currentPage} از {pagination.totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* مودال بررسی مدارک بیمار (با استیت ایزوله و ریست خودکار) */}
      <PatientReviewModal
        isOpen={!!reviewPatient}
        onClose={() => setReviewPatient(null)}
        patient={reviewPatient}
        onSubmitReview={handleReviewDocuments}
        onPreviewImage={(file) => setPreviewImageName(file)}
        isSubmitting={isSubmittingReview}
      />

      {/* مودال اختصاص RFID */}
      <PatientRfidModal
        isOpen={!!rfidPatient}
        onClose={() => setRfidPatient(null)}
        patient={rfidPatient}
        onSuccess={(id, newRfid) => {
          setPatients((prev) => prev.map((p) => (p._id === id ? { ...p, rfid: newRfid } : p)));
        }}
      />

      {/* مودال ایمپورت اکسل */}
      <ExcelImportModal
        importType="patients"
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccessRefresh={fetchPatients}
      />

      {/* مودال پیش‌نمایش تمام‌صفحه */}
      {previewImageName && (
        <div onClick={() => setPreviewImageName(null)} className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-4 max-w-2xl w-full shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-800">مشاهده مدرک کارت ملی</h4>
              <button onClick={() => setPreviewImageName(null)} className="text-gray-400 hover:text-red-500 p-1 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <SecureImage fileName={previewImageName} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}