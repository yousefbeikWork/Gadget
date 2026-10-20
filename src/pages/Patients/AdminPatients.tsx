import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Phone,
  CreditCard,
  Loader2,
  Wifi,
  WifiOff,
  ChevronRight,
  ChevronLeft,
  ScanLine,
  X,
  Save,
  Filter,
  AlertCircle,
  FileSpreadsheet,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import ExcelImportModal from "../../components/ExcelImportModal";
import FileDownload from "../../components/FileDownload"; // 👈 ایمپورت کامپوننت دانلود فایل
import SecureImage from "../../components/SecureImage";

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

  // استیت‌های جستجو و صفحه‌بندی
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // استیت فیلتر RFID و فیلتر وضعیت مدارک
  const [rfidFilter, setRfidFilter] = useState<
    "ALL" | "WITH_RFID" | "WITHOUT_RFID"
  >("ALL");
  const [docStatusFilter, setDocStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "NOT_UPLOADED"
  >("ALL");

  // استیت‌های مودال RFID
  const [isRfidModalOpen, setIsRfidModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] =
    useState<AdminPatientItem | null>(null);
  const [rfidInput, setRfidInput] = useState("");
  const [isSubmittingRfid, setIsSubmittingRfid] = useState(false);

  // استیت مودال بارگذاری اکسل
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // استیت‌های مودال بررسی مدارک هویتی
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedDocPatient, setSelectedDocPatient] =
    useState<AdminPatientItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [previewImageName, setPreviewImageName] = useState<string | null>(null);

  // ایجاد تاخیر در جستجو (Debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // فراخوانی API دریافت بیماران
  const fetchPatients = async () => {
    try {
      setLoading(true);

      let hasRfidParam: boolean | undefined = undefined;
      if (rfidFilter === "WITH_RFID") hasRfidParam = true;
      if (rfidFilter === "WITHOUT_RFID") hasRfidParam = false;

      const response = await api.get("/Admin/getPatients", {
        params: {
          page: currentPage,
          limit: 12,
          hasRfid: hasRfidParam,
          status: docStatusFilter !== "ALL" ? docStatusFilter : undefined,
          search: debouncedSearch || undefined,
        },
      });

      if (response.data && response.data.success) {
        setPatients(response.data.data.patients);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      setError("خطا در دریافت لیست کل بیماران سیستم.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage, debouncedSearch, rfidFilter, docStatusFilter]);

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };
  // ثبت و تخصیص RFID
  const handleSetRfid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !rfidInput.trim()) {
      toast.error("لطفاً کد RFID را وارد کنید.");
      return;
    }

    try {
      setIsSubmittingRfid(true);
      const response = await api.post("/RfId/setRfid", {
        patientId: selectedPatient._id,
        rfidCode: rfidInput.trim(),
      });

      if (response.status === 200) {
        toast.success(
          response.data.message || "کارت با موفقیت به بیمار اختصاص یافت.",
        );
        setPatients((prev) =>
          prev.map((p) =>
            p._id === selectedPatient._id
              ? { ...p, rfid: rfidInput.trim() }
              : p,
          ),
        );
        setIsRfidModalOpen(false);
        setRfidInput("");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "خطا در ثبت کارت RFID.";
      toast.error(msg);
    } finally {
      setIsSubmittingRfid(false);
    }
  };

  // تایید یا رد مدارک هویتی توسط ادمین
  const handleReviewDocuments = async (action: "APPROVE" | "REJECT") => {
    if (!selectedDocPatient) return;

    if (action === "REJECT" && !rejectReason.trim()) {
      toast.error("لطفاً علت رد مدارک را یادداشت فرمایید.");
      return;
    }

    setIsSubmittingReview(true);
    const toastId = toast.loading("در حال ثبت نتیجه بررسی مدارک...");

    try {
      const payload: { action: "APPROVE" | "REJECT"; rejectReason?: string } = {
        action,
      };
      if (action === "REJECT") {
        payload.rejectReason = rejectReason.trim();
      }

      const response = await api.put("/Admin/reviewPatientDocuments", payload, {
        params: { patientId: selectedDocPatient._id },
      });

      if (response.status === 200 || response.data?.success) {
        toast.success(
          action === "APPROVE"
            ? "مدارک بیمار با موفقیت تایید شد."
            : "مدارک بیمار رد شد.",
          { id: toastId },
        );

        setPatients((prev) =>
          prev.map((p) =>
            p._id === selectedDocPatient._id
              ? {
                  ...p,
                  nationalIdVerification: {
                    ...p.nationalIdVerification!,
                    status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                    rejectReason:
                      action === "REJECT" ? rejectReason.trim() : null,
                  },
                }
              : p,
          ),
        );

        setIsDocModalOpen(false);
        setSelectedDocPatient(null);
        setRejectReason("");
        setShowRejectInput(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در بررسی مدارک بیمار.", {
        id: toastId,
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const openRfidModal = (patient: AdminPatientItem) => {
    if (!patient.hasPaidRfid) {
      toast.error("هزینه صدور کارت توسط بیمار پرداخت نشده است.");
      return;
    }
    setSelectedPatient(patient);
    setRfidInput(patient.rfid || "");
    setIsRfidModalOpen(true);
  };

  const openDocModal = (patient: AdminPatientItem) => {
    setSelectedDocPatient(patient);
    setRejectReason(patient.nationalIdVerification?.rejectReason || "");
    setShowRejectInput(false);
    setIsDocModalOpen(true);
  };

  const renderDocBadge = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <CheckCircle2 size={12} /> مدارک تایید شده
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
            <XCircle size={12} /> مدارک رد شده
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse">
            <Clock size={12} /> در انتظار بررسی
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
            بارگذاری نشده
          </span>
        );
    }
  };

  return (
    <div
      className="bg-gray-50 rounded-2xl md:rounded-3xl border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col h-full space-y-6">
        {/* ================== هدر، فیلترها، اکسل و جستجو ================== */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-800 rounded-2xl shrink-0">
              <Users size={26} />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-gray-800">
                بانک جامع بیماران
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">
                {pagination
                  ? `تعداد کل بیماران یافت‌شده: ${pagination.total.toLocaleString()} نفر`
                  : "مدیریت، بررسی مدارک و نظارت بر بیماران"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
            {/* دکمه بارگذاری اکسل بیماران */}
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <FileSpreadsheet size={16} />
              <span>بارگذاری با اکسل</span>
            </button>

            {/* دراپ‌داون فیلتر وضعیت مدارک */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-gray-400 ml-1.5 font-medium hidden sm:inline">
                مدارک:
              </span>
              <select
                value={docStatusFilter}
                onChange={(e) => {
                  setDocStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-bold text-gray-700 outline-hidden cursor-pointer"
              >
                <option value="ALL">همه وضعیت‌ها</option>
                <option value="PENDING">در انتظار بررسی</option>
                <option value="APPROVED">تایید شده</option>
                <option value="REJECTED">رد شده</option>
                <option value="NOT_UPLOADED">بارگذاری نشده</option>
              </select>
            </div>

            {/* فیلتر کارت RFID */}
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => {
                  setRfidFilter("ALL");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  rfidFilter === "ALL"
                    ? "bg-white shadow-2xs text-gadget-dark border border-gray-100"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                همه
              </button>
              <button
                onClick={() => {
                  setRfidFilter("WITH_RFID");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all ${
                  rfidFilter === "WITH_RFID"
                    ? "bg-emerald-50 text-emerald-700 shadow-2xs border border-emerald-100"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Wifi size={12} /> با کارت
              </button>
              <button
                onClick={() => {
                  setRfidFilter("WITHOUT_RFID");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all ${
                  rfidFilter === "WITHOUT_RFID"
                    ? "bg-white shadow-2xs text-gray-800 border border-gray-100"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <WifiOff size={12} /> بی کارت
              </button>
            </div>

            {/* کادر جستجو */}
            <div className="relative w-full sm:w-56">
              <Search
                className="absolute right-3 top-3 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="جستجو (نام، کدملی)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-dark focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* وضعیت لودینگ */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-dark flex-1">
            <Loader2 className="animate-spin mb-3" size={38} />
            <p className="text-xs sm:text-sm font-bold text-gray-500">
              در حال دریافت اطلاعات از سرور...
            </p>
          </div>
        )}

        {/* وضعیت خطا */}
        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center text-xs sm:text-sm font-bold border border-red-100 max-w-md mx-auto my-auto">
            {error}
            <button
              onClick={fetchPatients}
              className="block mt-4 mx-auto bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* وضعیت بدون نتیجه */}
        {!loading && !error && patients.length === 0 && (
          <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-200 text-center flex-1 flex flex-col items-center justify-center my-auto">
            <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-3">
              <Filter size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              بیماری یافت نشد
            </h3>
            <p className="text-gray-500 text-xs">
              هیچ کاربری با این مشخصات و فیلترها ثبت نشده است.
            </p>
          </div>
        )}

        {/* ================== گرید کارت بیماران ================== */}
        {!loading && patients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mb-6">
            {patients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-full h-1 bg-linear-to-r from-gray-200 to-gray-100 group-hover:from-green-400 group-hover:to-green-600 transition-all"></div>

                <div className="flex items-start justify-between mb-3 mt-1 gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-sm sm:text-base text-gray-800 truncate">
                      {patient.firstName} {patient.lastName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {patient.rfid ? (
                      <div
                        className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-bold border border-emerald-100"
                        title={`RFID: ${patient.rfid}`}
                      >
                        <Wifi size={12} /> دارای کارت
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-gray-50 text-gray-500 px-2 py-1 rounded-lg text-[10px] font-bold border border-gray-200">
                        <WifiOff size={12} /> بدون کارت
                      </div>
                    )}
                  </div>
                </div>

                {/* مشخصات و وضعیت‌ها */}
                <div className="space-y-2 bg-gray-50/70 p-3 rounded-xl border border-gray-100 mb-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <CreditCard size={13} className="text-gray-400" /> کد ملی:
                    </span>
                    <span
                      className="font-bold text-gray-800 font-mono"
                      dir="ltr"
                    >
                      {patient.nationalId || "---"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200/50 pt-1.5">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <Phone size={13} className="text-gray-400" /> موبایل:
                    </span>
                    <span
                      className="font-bold text-gray-800 font-mono"
                      dir="ltr"
                    >
                      {patient.mobile || "---"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200/50 pt-1.5">
                    <span className="text-gray-500 font-medium">
                      پرداخت هزینه RFID:
                    </span>
                    <span
                      className={`font-bold text-[10px] px-2 py-0.5 rounded-md ${
                        patient.hasPaidRfid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {patient.hasPaidRfid ? "پرداخت شده" : "پرداخت نشده"}
                    </span>
                  </div>

                  {/* وضعیت مدارک هویتی */}
                  <div className="flex items-center justify-between border-t border-gray-200/50 pt-1.5">
                    <span className="text-gray-500 font-medium">
                      وضعیت مدارک:
                    </span>
                    {renderDocBadge(patient.nationalIdVerification?.status)}
                  </div>
                </div>

                {/* دکمه‌های عملیاتی کارت */}
                <div className="mt-auto grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => openDocModal(patient)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                  >
                    <FileCheck size={14} />
                    <span>بررسی مدارک</span>
                  </button>

                  <button
                    disabled={!patient.hasPaidRfid}
                    onClick={() => openRfidModal(patient)}
                    title={
                      !patient.hasPaidRfid
                        ? "هزینه صدور کارت توسط بیمار پرداخت نشده است"
                        : ""
                    }
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      !patient.hasPaidRfid
                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-75"
                        : patient.rfid
                          ? "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer"
                          : "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-xs cursor-pointer"
                    }`}
                  >
                    <ScanLine size={14} />
                    <span className="truncate">
                      {patient.rfid ? "ویرایش RFID" : "ثبت RFID"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================== صفحه‌بندی ================== */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="mt-auto flex items-center justify-between bg-white px-4 sm:px-6 py-3.5 rounded-2xl border border-gray-100 shadow-2xs">
            <p className="text-xs font-bold text-gray-500">
              صفحه{" "}
              <span className="text-gray-800">{pagination.currentPage}</span> از{" "}
              <span className="text-gray-800">{pagination.totalPages}</span>
            </p>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight size={17} />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === pagination.totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                          currentPage === pageNumber
                            ? "bg-gadget-dark text-white shadow-2xs"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="text-gray-400 text-xs px-0.5"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="p-1.5 sm:p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={17} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================== مودال بررسی مدارک هویتی توسط ادمین ================== */}
      {isDocModalOpen && selectedDocPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            {/* هدر مودال بررسی */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/80 shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck className="text-gadget-dark" size={20} />
                <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                  بررسی مدارک کارت ملی بیمار
                </h3>
              </div>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* بدنه اسکرول‌خورده مودال */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
              {/* مشخصات هویتی بیمار */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-gray-500">نام بیمار: </span>
                  <strong className="text-gray-900">
                    {selectedDocPatient.firstName} {selectedDocPatient.lastName}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500">کد ملی ثبت‌شده: </span>
                  <strong className="text-gray-900 font-mono text-sm" dir="ltr">
                    {selectedDocPatient.nationalId}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500">وضعیت فعلی: </span>
                  {renderDocBadge(
                    selectedDocPatient.nationalIdVerification?.status,
                  )}
                </div>
              </div>

              {/* علت رد قبلی (در صورت وجود) */}
              {selectedDocPatient.nationalIdVerification?.rejectReason && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle
                    size={16}
                    className="text-rose-600 shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="font-bold">علت رد قبلی: </span>
                    <span>
                      {selectedDocPatient.nationalIdVerification.rejectReason}
                    </span>
                  </div>
                </div>
              )}

              {/* تصاویر رو و پشت کارت ملی */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ================= تصویر روی کارت ملی ================= */}
                <div className="border border-gray-200 rounded-2xl p-3 space-y-3 bg-white flex flex-col justify-between shadow-2xs">
                  <span className="text-xs font-bold text-gray-700 block">
                    تصویر روی کارت ملی
                  </span>

                  {selectedDocPatient.nationalIdVerification?.frontImage ? (
                    <div className="space-y-3">
                      {/* نمایش امن تصویر کارت ملی از طریق SecureImage */}
                      <div className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                        <SecureImage
                          fileName={
                            selectedDocPatient.nationalIdVerification.frontImage
                          }
                          alt="روی کارت ملی"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImageName(
                              selectedDocPatient.nationalIdVerification!
                                .frontImage!,
                            )
                          }
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-1.5 text-xs font-bold cursor-pointer"
                        >
                          <ExternalLink size={16} />
                          <span>مشاهده اندازه اصلی</span>
                        </button>
                      </div>

                      {/* دکمه دانلود فایل باینری با کامپوننت FileDownload */}
                      <div className="pt-1">
                        <FileDownload
                          fileName={
                            selectedDocPatient.nationalIdVerification.frontImage
                          }
                          className="w-full justify-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold shadow-2xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                      تصویر بارگذاری نشده است
                    </div>
                  )}
                </div>

                {/* ================= تصویر پشت کارت ملی ================= */}
                <div className="border border-gray-200 rounded-2xl p-3 space-y-3 bg-white flex flex-col justify-between shadow-2xs">
                  <span className="text-xs font-bold text-gray-700 block">
                    تصویر پشت کارت ملی
                  </span>

                  {selectedDocPatient.nationalIdVerification?.backImage ? (
                    <div className="space-y-3">
                      {/* نمایش امن تصویر کارت ملی از طریق SecureImage */}
                      <div className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                        <SecureImage
                          fileName={
                            selectedDocPatient.nationalIdVerification.backImage
                          }
                          alt="پشت کارت ملی"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImageName(
                              selectedDocPatient.nationalIdVerification!
                                .backImage!,
                            )
                          }
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-1.5 text-xs font-bold cursor-pointer"
                        >
                          <ExternalLink size={16} />
                          <span>مشاهده اندازه اصلی</span>
                        </button>
                      </div>

                      {/* دکمه دانلود فایل باینری با کامپوننت FileDownload */}
                      <div className="pt-1">
                        <FileDownload
                          fileName={
                            selectedDocPatient.nationalIdVerification.backImage
                          }
                          className="w-full justify-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold shadow-2xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                      تصویر بارگذاری نشده است
                    </div>
                  )}
                </div>
              </div>

              {/* کادر ثبت دلیل رد مدرک */}
              {showRejectInput && (
                <div className="space-y-2 bg-rose-50/70 border border-rose-200 p-3.5 rounded-2xl animate-in fade-in">
                  <label className="block text-xs font-bold text-rose-900">
                    علت رد مدارک را بنویسید (برای بیمار پیامک/نمایش داده می‌شود)
                    *:
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="مثال: عکس ناواضح است یا کدملی روی کارت با مشخصات ثبت‌نامی همخوانی ندارد..."
                    className="w-full bg-white border border-rose-300 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-rose-500 resize-none"
                  ></textarea>
                </div>
              )}
            </div>

            {/* فوتر و دکمه‌های تایید یا رد */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsDocModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                انصراف
              </button>

              <div className="flex items-center gap-2">
                {!showRejectInput ? (
                  <>
                    <button
                      type="button"
                      disabled={
                        isSubmittingReview ||
                        !selectedDocPatient.nationalIdVerification?.frontImage
                      }
                      onClick={() => setShowRejectInput(true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <XCircle size={15} /> رد مدارک
                    </button>

                    <button
                      type="button"
                      disabled={
                        isSubmittingReview ||
                        !selectedDocPatient.nationalIdVerification?.frontImage
                      }
                      onClick={() => handleReviewDocuments("APPROVE")}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                    >
                      {isSubmittingReview ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      <span>تایید و احراز هویت مدارک</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-2 text-gray-600 text-xs font-bold hover:underline cursor-pointer"
                    >
                      بازگشت
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingReview || !rejectReason.trim()}
                      onClick={() => handleReviewDocuments("REJECT")}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSubmittingReview ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <XCircle size={15} />
                      )}
                      <span>ثبت رد مدارک</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================== مودال ثبت RFID ================== */}
      {isRfidModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                <ScanLine className="text-gadget-light" size={19} />
                {selectedPatient.rfid
                  ? "ویرایش کارت سلامت"
                  : "اختصاص کارت سلامت"}
              </h3>
              <button
                onClick={() => setIsRfidModalOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSetRfid} className="p-5 sm:p-6 space-y-4">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                <p className="text-gray-500 mb-1">بیمار انتخاب شده:</p>
                <p className="font-black text-gray-900 text-sm">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
                <p className="text-gray-500 mt-1 font-mono" dir="ltr">
                  کد ملی: {selectedPatient.nationalId}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-gray-700">
                  کد یکتای کارت RFID
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  dir="ltr"
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  placeholder="مثال: RFID123456"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-2 focus:ring-gadget-light/20 transition-all text-left font-mono"
                />
                <p className="text-[11px] text-gray-400">
                  کد خوانده‌شده توسط دستگاه کارت‌خوان را وارد فرمایید.
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRfidModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRfid || !rfidInput.trim()}
                  className="flex-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gadget-dark hover:bg-gadget-dark/90 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmittingRfid ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>
                    {isSubmittingRfid ? "در حال ثبت..." : "ثبت و تخصیص کارت"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================== مودال ایمپورت اکسل ================== */}
      <ExcelImportModal
        importType="patients"
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccessRefresh={fetchPatients}
      />
      {/* ================= مودال پیش‌نمایش تصویر در ابعاد اصلی ================= */}
      {previewImageName && (
        <div
          onClick={() => setPreviewImageName(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in font-sans"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 sm:p-5 max-w-3xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-xs sm:text-sm font-bold text-gray-800">
                مشاهده مدرک کارت ملی
              </h4>
              <button
                type="button"
                onClick={() => setPreviewImageName(null)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-80 sm:h-112.5 w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <SecureImage
                fileName={previewImageName}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
