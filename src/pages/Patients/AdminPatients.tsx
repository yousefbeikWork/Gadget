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
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import ExcelImportModal from "../../components/ExcelImportModal"; // 👈 ایمپورت با نام جدید و عمومی

interface AdminPatientItem {
  _id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile: string;
  rfid?: string;
  hasPaidRfid?: boolean;
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

  // استیت فیلتر RFID
  const [rfidFilter, setRfidFilter] = useState<
    "ALL" | "WITH_RFID" | "WITHOUT_RFID"
  >("ALL");

  // استیت‌های مودال RFID
  const [isRfidModalOpen, setIsRfidModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] =
    useState<AdminPatientItem | null>(null);
  const [rfidInput, setRfidInput] = useState("");
  const [isSubmittingRfid, setIsSubmittingRfid] = useState(false);

  // 👈 استیت مودال بارگذاری اکسل بیماران
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

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
  }, [currentPage, debouncedSearch, rfidFilter]);

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (filter: "ALL" | "WITH_RFID" | "WITHOUT_RFID") => {
    setRfidFilter(filter);
    setCurrentPage(1);
  };

  // ثبت RFID
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

        setPatients((prevPatients) =>
          prevPatients.map((p) =>
            p._id === selectedPatient._id
              ? { ...p, rfid: rfidInput.trim() }
              : p,
          ),
        );

        setIsRfidModalOpen(false);
        setRfidInput("");
      }
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 400) {
        toast.error(
          error.response?.data?.message ||
            "این کارت قبلاً به بیمار دیگری اختصاص داده شده است.",
        );
      } else if (status === 403) {
        toast.error("شما دسترسی لازم برای این عملیات را ندارید.");
      } else if (status === 404) {
        toast.error("بیمار یافت نشد.");
      } else {
        toast.error("خطای ناشناخته در ارتباط با سرور رخ داد.");
      }
    } finally {
      setIsSubmittingRfid(false);
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

  return (
    <div
      className="bg-gray-50 rounded-2xl md:rounded-3xl border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col h-full space-y-6">
        {/* ================== هدر، دکمه اکسل و جستجو ================== */}
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
                  ? `تعداد کل کاربران یافت‌شده: ${pagination.total.toLocaleString()} نفر`
                  : "مدیریت و نظارت بر بیماران سامانه"}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full xl:w-auto">
            {/* 👈 دکمه بارگذاری اکسل بیماران */}
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <FileSpreadsheet size={17} />
              <span>بارگذاری با اکسل</span>
            </button>

            {/* دکمه‌های فیلتر RFID */}
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 w-full md:w-auto">
              <button
                onClick={() => handleFilterChange("ALL")}
                className={`flex-1 md:flex-none px-3.5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  rfidFilter === "ALL"
                    ? "bg-white shadow-2xs text-gadget-dark border border-gray-100"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                همه
              </button>
              <button
                onClick={() => handleFilterChange("WITH_RFID")}
                className={`flex-1 md:flex-none px-3.5 py-2 text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                  rfidFilter === "WITH_RFID"
                    ? "bg-emerald-50 text-emerald-700 shadow-2xs border border-emerald-100"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Wifi size={13} /> دارای کارت
              </button>
              <button
                onClick={() => handleFilterChange("WITHOUT_RFID")}
                className={`flex-1 md:flex-none px-3.5 py-2 text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                  rfidFilter === "WITHOUT_RFID"
                    ? "bg-white shadow-2xs text-gray-800 border border-gray-100"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <WifiOff size={13} /> بدون کارت
              </button>
            </div>

            {/* باکس جستجو */}
            <div className="relative w-full md:w-64">
              <Search
                className="absolute right-3 top-3 text-gray-400"
                size={17}
              />
              <input
                type="text"
                placeholder="جستجو (نام، کدملی، موبایل)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-dark focus:bg-white transition-all shadow-2xs"
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

        {/* بدون نتیجه */}
        {!loading && !error && patients.length === 0 && (
          <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-200 text-center flex-1 flex flex-col items-center justify-center my-auto">
            <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-3">
              <Filter size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              بیماری یافت نشد
            </h3>
            <p className="text-gray-500 text-xs">
              هیچ کاربری با این مشخصات در سیستم ثبت نشده است.
            </p>
            {rfidFilter !== "ALL" && (
              <button
                onClick={() => handleFilterChange("ALL")}
                className="mt-3 text-xs font-bold text-gadget-light hover:underline cursor-pointer"
              >
                نمایش تمامی بیماران
              </button>
            )}
          </div>
        )}

        {/* ================== لیست کارت بیماران ================== */}
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

                  {/* بج وضعیت کارت */}
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

                {/* اطلاعات مشخصات */}
                <div className="space-y-2.5 bg-gray-50/70 p-3 rounded-xl border border-gray-100 mb-4 text-xs">
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

                  <div className="flex items-center justify-between border-t border-gray-200/50 pt-2">
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

                  {/* وضعیت پرداخت هزینه RFID */}
                  <div className="flex items-center justify-between border-t border-gray-200/50 pt-2">
                    <span className="text-gray-500 font-medium">
                      وضعیت پرداخت RFID:
                    </span>
                    <span
                      className={`font-bold text-[11px] px-2 py-0.5 rounded-md ${
                        patient.hasPaidRfid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {patient.hasPaidRfid ? "پرداخت شده" : "پرداخت نشده"}
                    </span>
                  </div>
                </div>

                {/* دکمه اختصاص / ویرایش RFID */}
                <div className="mt-auto border-t border-gray-100 pt-3">
                  <button
                    disabled={!patient.hasPaidRfid}
                    onClick={() => openRfidModal(patient)}
                    title={
                      !patient.hasPaidRfid
                        ? "هزینه صدور کارت توسط بیمار پرداخت نشده است"
                        : ""
                    }
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      !patient.hasPaidRfid
                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-75"
                        : patient.rfid
                          ? "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer shadow-2xs"
                          : "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-sm cursor-pointer"
                    }`}
                  >
                    {!patient.hasPaidRfid ? (
                      <>
                        <AlertCircle size={15} />
                        <span>عدم پرداخت هزینه کارت</span>
                      </>
                    ) : (
                      <>
                        <ScanLine size={15} />
                        <span>
                          {patient.rfid ? "ویرایش کد RFID" : "اختصاص کارت RFID"}
                        </span>
                      </>
                    )}
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

      {/* ================== 👈 مودال ایمپورت اکسل بیماران ================== */}
      <ExcelImportModal
        importType="patients"
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccessRefresh={fetchPatients}
      />

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
    </div>
  );
}
