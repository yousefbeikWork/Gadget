import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  MapPin,
  Phone,
  Award,
  CalendarPlus,
  LogIn,
  Search,
  Loader2,
  X,
  Calendar,
  AlignRight,
  Banknote,
  Receipt,
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DoctorAvatar from "../components/DoctorAvatar";
import DoctorInvoicesModal from "../components/DoctorInvoicesModal";
import ExcelImportModal from "../components/ExcelImportModal";
import SecureImage from "../components/SecureImage";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

interface NationalIdVerification {
  frontImage?: string | null;
  backImage?: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "NOT_UPLOADED" | string;
  rejectReason?: string | null;
}

interface MedicalDocuments {
  medicalCouncilCard?: string | null;
  medicalLicense?: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "NOT_UPLOADED" | string;
  rejectReason?: string | null;
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  Expertise: string;
  clinicAddress: string;
  clinicPhone: string;
  medicalCouncilCode: string;
  imageProfile?: string | null;
  isActive?: boolean;
  nationalId?: string;
  age?: number;
  mobile?: string;
  nationalIdVerification?: NationalIdVerification;
  medicalDocuments?: MedicalDocuments;
}

interface Slot {
  startTime: string;
  endTime: string;
  locationId?: string | null;
  price?: number;
}

export default function Doctors() {
  const { isLoggedIn, userRole } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // استیت‌های جستجو و صفحه‌بندی سمت سرور
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  // استیت‌های مودال رزرو نوبت (بیمار)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // استیت مودال صورت‌حساب (ادمین)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedDoctorForInvoice, setSelectedDoctorForInvoice] =
    useState<Doctor | null>(null);

  // استیت مودال اکسل (ادمین)
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // استیت‌های مودال بررسی مدارک پزشک (ادمین)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedDocDoctor, setSelectedDocDoctor] = useState<Doctor | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // استیت پیش‌نمایش تصویر در اندازه بزرگ
  const [previewImageName, setPreviewImageName] = useState<string | null>(null);

  const isAdmin = userRole === "Admin" || userRole === "SUPER_ADMIN";

  // تابع دریافت پزشکان از سرور
  const fetchDoctors = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/doctorsList", {
        params: {
          page,
          limit,
          search: search.trim() || undefined,
        },
      });

      if (response.data && response.data.success) {
        setDoctors(response.data.data || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setCurrentPage(response.data.pagination.currentPage || page);
        }
      }
    } catch (err) {
      setError("خطا در دریافت لیست پزشکان. لطفاً ارتباط با سرور را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
      fetchDoctors(1, searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      fetchDoctors(newPage, searchQuery);
    }
  };

  // مودال رزرو نوبت
  const openBookingModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
    setSelectedDate("");
    setAvailableSlots([]);
    setSelectedSlot(null);
    setBookingNotes("");
    setIsSubmitting(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setIsSubmitting(false);
  };

  const fetchSlotsForDate = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setAvailableSlots([]);
    if (!date || !selectedDoctor) return;

    try {
      setLoadingSlots(true);
      const response = await api.get(
        `/book/available-slots?doctorId=${selectedDoctor._id}&date=${date}`
      );

      if (response.data && response.data.success) {
        setAvailableSlots(response.data.data);
        if (response.data.data.length === 0) {
          toast("در این تاریخ نوبت خالی وجود ندارد.", { icon: "ℹ️" });
        }
      }
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setAvailableSlots([]);
      } else {
        toast.error("خطا در دریافت نوبت‌های خالی.");
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !selectedDate || !selectedDoctor || isSubmitting) return;

    const payload = {
      doctorId: selectedDoctor._id,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes: bookingNotes,
      amount: selectedSlot.price ?? 0,
    };

    setIsSubmitting(true);
    const toastId = toast.loading("در حال ثبت درخواست و اتصال به درگاه پرداخت...");

    try {
      const response = await api.post("/book/bookslots", payload);

      if (response.data?.success && response.data?.data?.paymentUrl) {
        toast.success("در حال انتقال به درگاه پرداخت بانکی...", { id: toastId });
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.error(response.data?.message || "آدرس درگاه پرداخت یافت نشد.", { id: toastId });
        setIsSubmitting(false);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "خطا در اتصال به درگاه پرداخت.",
        { id: toastId }
      );
      setIsSubmitting(false);
    }
  };

  const openInvoiceModal = (doctor: Doctor) => {
    setSelectedDoctorForInvoice(doctor);
    setIsInvoiceModalOpen(true);
  };

  const openDocReviewModal = (doctor: Doctor) => {
    setSelectedDocDoctor(doctor);
    const reason =
      doctor.medicalDocuments?.rejectReason ||
      doctor.nationalIdVerification?.rejectReason ||
      "";
    setRejectReason(reason);
    setShowRejectInput(false);
    setIsDocModalOpen(true);
  };

  // ثبت تایید یا رد مدارک پزشک
  const handleReviewDoctorDocuments = async (action: "APPROVE" | "REJECT") => {
    if (!selectedDocDoctor) return;

    if (action === "REJECT" && !rejectReason.trim()) {
      toast.error("لطفاً علت رد مدارک را بنویسید.");
      return;
    }

    setIsSubmittingReview(true);
    const toastId = toast.loading("در حال ثبت نتیجه بررسی مدارک...");

    try {
      const payload: { action: "APPROVE" | "REJECT"; rejectReason?: string } = { action };
      if (action === "REJECT") {
        payload.rejectReason = rejectReason.trim();
      }

      const response = await api.put(
        `/Admin/${selectedDocDoctor._id}/reviewDoctorDocuments`,
        payload
      );

      if (response.status === 200 || response.data) {
        toast.success(
          response.data?.message ||
            (action === "APPROVE" ? "مدارک تایید و حساب پزشک فعال شد." : "مدارک پزشک رد شد."),
          { id: toastId }
        );

        // بروزرسانی وضعیت پزشک در جدول بدون لودینگ مجدد
        setDoctors((prev) =>
          prev.map((d) =>
            d._id === selectedDocDoctor._id
              ? {
                  ...d,
                  isActive: action === "APPROVE",
                  nationalIdVerification: {
                    ...d.nationalIdVerification,
                    status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                    rejectReason: action === "REJECT" ? rejectReason.trim() : null,
                  },
                  medicalDocuments: {
                    ...d.medicalDocuments,
                    status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                    rejectReason: action === "REJECT" ? rejectReason.trim() : null,
                  },
                }
              : d
          )
        );

        setIsDocModalOpen(false);
        setSelectedDocDoctor(null);
        setRejectReason("");
        setShowRejectInput(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در بررسی مدارک پزشک.", { id: toastId });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // رندر بَج وضعیت مدارک پزشک
  const renderDoctorDocBadge = (doctor: Doctor) => {
    const medStatus = doctor.medicalDocuments?.status || "NOT_UPLOADED";
    const idStatus = doctor.nationalIdVerification?.status || "NOT_UPLOADED";

    if (medStatus === "APPROVED" && idStatus === "APPROVED") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          <CheckCircle2 size={11} /> مدارک تایید شده
        </span>
      );
    }
    if (medStatus === "REJECTED" || idStatus === "REJECTED") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
          <XCircle size={11} /> مدارک رد شده
        </span>
      );
    }
    if (medStatus === "PENDING" || idStatus === "PENDING") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse">
          <Clock size={11} /> در انتظار بررسی
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
        مدارک ثبت‌نشده
      </span>
    );
  };

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 font-sans relative"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ================= هدر صفحه، دکمه اکسل و سرچ ================= */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gadget-dark flex items-center gap-2">
              <Stethoscope className="text-gadget-light" size={28} />
              لیست پزشکان و متخصصان
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {isAdmin
                ? "مدیریت، بررسی مدارک، بارگذاری گروهی و صورت‌حساب‌های مالی پزشکان"
                : "پزشک مورد نظر خود را پیدا کنید و نوبت بگیرید"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <FileSpreadsheet size={18} />
                <span>بارگذاری با اکسل</span>
              </button>
            )}

            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام یا تخصص..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* وضعیت لودینگ */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال دریافت اطلاعات پزشکان...</p>
          </div>
        )}

        {/* وضعیت خطا */}
        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* وضعیت بدون نتیجه */}
        {!loading && !error && doctors.length === 0 && (
          <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-white text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              {searchQuery ? <Search size={32} /> : <Stethoscope size={32} />}
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">
              {searchQuery ? "نتیجه‌ای یافت نشد" : "پزشکی یافت نشد"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? `پزشکی با نام یا تخصص "${searchQuery}" در سیستم وجود ندارد.`
                : "در حال حاضر هیچ پزشکی در سیستم ثبت نشده است."}
            </p>
          </div>
        )}

        {/* ================= گرید کارت‌های پزشکان ================= */}
        {!loading && doctors.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col h-full group relative"
                >
                  <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-4">
                    <DoctorAvatar
                      imageProfile={doctor.imageProfile ?? undefined}
                      firstName={doctor.firstName}
                      className="w-14 h-14 text-xl group-hover:scale-105 transition-transform"
                    />
                    <div className="overflow-hidden min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h3 className="font-bold text-base text-gray-800 truncate">
                          دکتر {doctor.firstName} {doctor.lastName}
                        </h3>
                        {/* بج فعال/غیرفعال بودن اکانت برای ادمین */}
                        {isAdmin && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                              doctor.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            {doctor.isActive ? "حساب فعال" : "غیرفعال"}
                          </span>
                        )}
                      </div>

                      <span className="inline-block bg-gadget-light/10 text-[#239c97] text-xs font-bold px-2 py-1 rounded-md truncate max-w-full">
                        {doctor.Expertise}
                      </span>
                    </div>
                  </div>

                  {/* اطلاعات جزئیات و مدارک */}
                  <div className="space-y-2.5 flex-1 mb-5">
                    {/* بَج وضعیت مدارک برای ادمین */}
                    {isAdmin && (
                      <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs mb-2">
                        <span className="text-gray-500 font-medium">وضعیت مدارک:</span>
                        {renderDoctorDocBadge(doctor)}
                      </div>
                    )}

                    <div className="flex items-start gap-2 text-sm">
                      <Award className="text-gray-400 shrink-0 mt-0.5" size={16} />
                      <span className="text-gray-600">
                        نظام پزشکی:{" "}
                        <span className="font-medium text-gray-800 font-mono">
                          {doctor.medicalCouncilCode}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <Phone className="text-gray-400 shrink-0 mt-0.5" size={16} />
                      <span className="text-gray-600 font-medium font-mono" dir="ltr">
                        {doctor.clinicPhone}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="text-gray-400 shrink-0 mt-0.5" size={16} />
                      <span className="text-gray-600 leading-relaxed line-clamp-2">
                        {doctor.clinicAddress}
                      </span>
                    </div>
                  </div>

                  {/* دکمه‌های عملیاتی کارت */}
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    {isAdmin ? (
                      <div className="grid grid-cols-2 gap-2">
                        {/* دکمه بررسی مدارک پزشک */}
                        <button
                          type="button"
                          onClick={() => openDocReviewModal(doctor)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          <FileCheck size={15} />
                          <span>بررسی مدارک</span>
                        </button>

                        {/* دکمه صورت‌حساب مالی */}
                        <button
                          type="button"
                          onClick={() => openInvoiceModal(doctor)}
                          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        >
                          <Receipt size={15} />
                          <span>صورت‌حساب‌ها</span>
                        </button>
                      </div>
                    ) : isLoggedIn ? (
                      <button
                        onClick={() => openBookingModal(doctor)}
                        className="w-full flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                      >
                        <CalendarPlus size={18} />
                        دریافت نوبت
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 hover:border-gadget-light text-gray-600 hover:text-gadget-light py-2.5 rounded-xl text-sm font-bold transition-all"
                      >
                        <LogIn size={18} />
                        برای رزرو وارد شوید
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* کنترل‌های صفحه‌بندی */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white border border-gray-200 p-3 sm:p-4 rounded-2xl shadow-2xs mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                >
                  <ChevronRight size={16} />
                  <span>قبلی</span>
                </button>

                <span className="text-xs sm:text-sm font-bold text-gray-700">
                  صفحه {currentPage} از {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                >
                  <span>بعدی</span>
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ================== مودال بررسی مدارک هویتی و پزشکی پزشک (ادمین) ================== */}
      {isAdmin && isDocModalOpen && selectedDocDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs font-sans animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            
            {/* هدر مودال */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/80 shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck className="text-gadget-dark" size={22} />
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                    بررسی مدارک پزشک: دکتر {selectedDocDoctor.firstName} {selectedDocDoctor.lastName}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    کد نظام پزشکی: {selectedDocDoctor.medicalCouncilCode} | تخصص: {selectedDocDoctor.Expertise}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDocModalOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* بدنه اسکرول‌خورده مودال */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
              
              {/* کادر مشخصات هویتی و کاری */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-gray-500">کد ملی ثبت‌شده: </span>
                  <strong className="text-gray-900 font-mono text-sm" dir="ltr">
                    {selectedDocDoctor.nationalId || "ثبت‌نشده"}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500">شماره موبایل: </span>
                  <strong className="text-gray-900 font-mono text-sm" dir="ltr">
                    {selectedDocDoctor.mobile || "ثبت‌نشده"}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500">وضعیت حساب: </span>
                  <strong className={selectedDocDoctor.isActive ? "text-emerald-700" : "text-amber-700"}>
                    {selectedDocDoctor.isActive ? "فعال" : "غیرفعال"}
                  </strong>
                </div>
              </div>

              {/* علت رد قبلی (در صورت وجود) */}
              {(selectedDocDoctor.medicalDocuments?.rejectReason ||
                selectedDocDoctor.nationalIdVerification?.rejectReason) && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">علت رد قبلی: </span>
                    <span>
                      {selectedDocDoctor.medicalDocuments?.rejectReason ||
                        selectedDocDoctor.nationalIdVerification?.rejectReason}
                    </span>
                  </div>
                </div>
              )}

              {/* گرید مدارک (۴ مدرک: رو/پشت کارت ملی، نظام پزشکی، پروانه مطب) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* ۱. روی کارت ملی */}
                <div className="border border-gray-200 rounded-2xl p-3 space-y-2 bg-white flex flex-col justify-between shadow-2xs">
                  <span className="text-xs font-bold text-gray-700 block">۱. تصویر روی کارت ملی</span>
                  {selectedDocDoctor.nationalIdVerification?.frontImage ? (
                    <div className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                      <SecureImage
                        fileName={selectedDocDoctor.nationalIdVerification.frontImage}
                        alt="روی کارت ملی"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImageName(selectedDocDoctor.nationalIdVerification!.frontImage!)
                        }
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        <ExternalLink size={16} />
                        <span>مشاهده اندازه اصلی</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                      تصویر بارگذاری نشده است
                    </div>
                  )}
                </div>

                {/* ۲. پشت کارت ملی */}
                <div className="border border-gray-200 rounded-2xl p-3 space-y-2 bg-white flex flex-col justify-between shadow-2xs">
                  <span className="text-xs font-bold text-gray-700 block">۲. تصویر پشت کارت ملی</span>
                  {selectedDocDoctor.nationalIdVerification?.backImage ? (
                    <div className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                      <SecureImage
                        fileName={selectedDocDoctor.nationalIdVerification.backImage}
                        alt="پشت کارت ملی"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImageName(selectedDocDoctor.nationalIdVerification!.backImage!)
                        }
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        <ExternalLink size={16} />
                        <span>مشاهده اندازه اصلی</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                      تصویر بارگذاری نشده است
                    </div>
                  )}
                </div>

                {/* ۳. کارت نظام پزشکی */}
                <div className="border border-gray-200 rounded-2xl p-3 space-y-2 bg-white flex flex-col justify-between shadow-2xs">
                  <span className="text-xs font-bold text-gray-700 block">۳. کارت نظام پزشکی *</span>
                  {selectedDocDoctor.medicalDocuments?.medicalCouncilCard ? (
                    <div className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                      <SecureImage
                        fileName={selectedDocDoctor.medicalDocuments.medicalCouncilCard}
                        alt="کارت نظام پزشکی"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImageName(
                            selectedDocDoctor.medicalDocuments!.medicalCouncilCard!
                          )
                        }
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        <ExternalLink size={16} />
                        <span>مشاهده اندازه اصلی</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                      تصویر بارگذاری نشده است
                    </div>
                  )}
                </div>

                {/* ۴. پروانه مطب / مجوز طبابت */}
                <div className="border border-gray-200 rounded-2xl p-3 space-y-2 bg-white flex flex-col justify-between shadow-2xs">
                  <span className="text-xs font-bold text-gray-700 block">۴. پروانه مطب (اختیاری)</span>
                  {selectedDocDoctor.medicalDocuments?.medicalLicense ? (
                    <div className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                      <SecureImage
                        fileName={selectedDocDoctor.medicalDocuments.medicalLicense}
                        alt="پروانه مطب"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImageName(
                            selectedDocDoctor.medicalDocuments!.medicalLicense!
                          )
                        }
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        <ExternalLink size={16} />
                        <span>مشاهده اندازه اصلی</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                      پروانه مطب ارسال نشده است
                    </div>
                  )}
                </div>

              </div>

              {/* کادر ثبت دلیل رد مدارک */}
              {showRejectInput && (
                <div className="space-y-2 bg-rose-50/80 border border-rose-200 p-3.5 rounded-2xl animate-in fade-in">
                  <label className="block text-xs font-bold text-rose-900">
                    علت رد مدارک را بنویسید (برای پزشک پیام داده می‌شود) *:
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="مثال: تصویر کارت نظام پزشکی ناخوانا است یا تاریخ اعتبار آن منقضی شده است..."
                    className="w-full bg-white border border-rose-300 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-rose-500 resize-none"
                  ></textarea>
                </div>
              )}

            </div>

            {/* فوتر دکمه‌های تایید یا رد */}
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
                      disabled={isSubmittingReview}
                      onClick={() => setShowRejectInput(true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <XCircle size={15} /> رد مدارک
                    </button>

                    <button
                      type="button"
                      disabled={
                        isSubmittingReview ||
                        !selectedDocDoctor.medicalDocuments?.medicalCouncilCard ||
                        !selectedDocDoctor.nationalIdVerification?.frontImage
                      }
                      onClick={() => handleReviewDoctorDocuments("APPROVE")}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                    >
                      {isSubmittingReview ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      <span>تایید مدارک و فعال‌سازی حساب پزشک</span>
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
                      onClick={() => handleReviewDoctorDocuments("REJECT")}
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
                مشاهده تصویر مدرک
              </h4>
              <button
                type="button"
                onClick={() => setPreviewImageName(null)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-80 sm:h-[450px] w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <SecureImage
                fileName={previewImageName}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setPreviewImageName(null)}
                className="px-5 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= کامپوننت اختصاصی ایمپورت اکسل ================= */}
      <ExcelImportModal
        importType="doctors"
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccessRefresh={() => fetchDoctors(1, searchQuery)}
      />

      {/* ================= مودال صورت‌حساب‌ها (ادمین) ================= */}
      <DoctorInvoicesModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedDoctorForInvoice(null);
        }}
        doctor={selectedDoctorForInvoice}
      />

      {/* ================= مودال رزرو نوبت (بیمار) ================= */}
      {isModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="bg-gadget-dark p-5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <DoctorAvatar
                  imageProfile={selectedDoctor.imageProfile ?? undefined}
                  firstName={selectedDoctor.firstName}
                  className="w-10 h-10 text-sm border border-white/20"
                />
                <div>
                  <h3 className="font-bold text-sm">
                    دکتر {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h3>
                  <p className="text-xs text-gray-300">
                    {selectedDoctor.Expertise}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer border-none outline-hidden"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-105">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ابتدا تاریخ مراجعه را انتخاب کنید:
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute right-3 top-3 text-gadget-light z-10"
                    size={18}
                  />
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    value={selectedDate ? new Date(selectedDate) : ""}
                    fixMainPosition={true}
                    onChange={(date: any) => {
                      if (date && date.isValid) {
                        const jsDate = date.toDate();
                        const year = jsDate.getFullYear();
                        const month = String(jsDate.getMonth() + 1).padStart(2, "0");
                        const day = String(jsDate.getDate()).padStart(2, "0");
                        const gregorianDate = `${year}-${month}-${day}`;
                        fetchSlotsForDate(gregorianDate);
                      } else {
                        fetchSlotsForDate("");
                      }
                    }}
                    format="YYYY/MM/DD"
                    containerClassName="w-full"
                    inputClass="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors cursor-pointer text-gray-700"
                    placeholder="انتخاب تاریخ از تقویم..."
                  />
                </div>
              </div>

              {loadingSlots ? (
                <div className="flex flex-col items-center justify-center py-10 text-gadget-light">
                  <Loader2 className="animate-spin mb-2" size={30} />
                  <p className="text-xs font-medium">در حال بررسی نوبت‌های خالی...</p>
                </div>
              ) : selectedDate ? (
                availableSlots.length > 0 ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        ساعت‌های خالی:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableSlots.map((slot, index) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2.5 px-2 rounded-xl text-sm font-bold transition-all outline-hidden border-none cursor-pointer ${
                                isSelected
                                  ? "bg-gadget-light text-white shadow-md shadow-gadget-light/30 transform scale-105"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {slot.startTime}{" "}
                              <span className="text-[10px] font-normal opacity-80 mx-0.5">تا</span>{" "}
                              {slot.endTime}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedSlot && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        {selectedSlot.price !== undefined && (
                          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                            <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                              <Banknote size={18} className="text-emerald-600" />
                              مبلغ قابل پرداخت:
                            </span>
                            <span className="text-base font-black text-emerald-700" dir="ltr">
                              {new Intl.NumberFormat("fa-IR").format(selectedSlot.price)}{" "}
                              <span className="text-xs font-bold">ریال</span>
                            </span>
                          </div>
                        )}

                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          توضیحات یا علت مراجعه (اختیاری):
                        </label>
                        <div className="relative">
                          <AlignRight className="absolute right-3 top-3 text-gray-400" size={18} />
                          <textarea
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                            placeholder="مثال: سردرد شدید دارم..."
                            rows={2}
                            className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors resize-none"
                          ></textarea>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-orange-50 rounded-2xl border border-orange-100">
                    <p className="text-sm font-bold text-orange-600">نوبت خالی در این تاریخ وجود ندارد.</p>
                    <p className="text-xs text-orange-400 mt-1">لطفاً روز دیگری را بررسی کنید.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <Calendar size={40} strokeWidth={1} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">برای مشاهده ساعت‌ها، تقویم را انتخاب کنید</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0">
              <button
                disabled={!selectedSlot || isSubmitting}
                onClick={handleConfirmBooking}
                className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all outline-hidden border-none ${
                  selectedSlot && !isSubmitting
                    ? "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-lg cursor-pointer transform hover:-translate-y-0.5"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>در حال انتقال به درگاه بانک...</span>
                  </>
                ) : selectedSlot ? (
                  `تایید و پرداخت ساعت ${selectedSlot.startTime}`
                ) : (
                  "لطفاً یک ساعت را انتخاب کنید"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}