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
  Receipt,
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RotateCcw,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import DoctorAvatar from "../components/DoctorAvatar";
import DoctorInvoicesModal from "../components/DoctorInvoicesModal";
import ExcelImportModal from "../components/ExcelImportModal";
import DoctorReviewModal from "../components/DoctorReviewModal";
import DoctorBookingModal from "../components/DoctorBookingModal";
import SecureImage from "../components/SecureImage";

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
  mobile?: string;
  nationalIdVerification?: {
    frontImage?: string | null;
    backImage?: string | null;
    status?: string;
    rejectReason?: string | null;
  };
  medicalDocuments?: {
    medicalCouncilCard?: string | null;
    medicalLicense?: string | null;
    status?: string;
    rejectReason?: string | null;
  };
}

export default function Doctors() {
  const { isLoggedIn, userRole } = useAuth();
  const isAdmin = userRole === "Admin" || userRole === "SUPER_ADMIN";

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // فیلترهای جستجو بر اساس Swagger API
  const [searchQuery, setSearchQuery] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  // استیت‌های مودال‌ها
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [invoiceDoctor, setInvoiceDoctor] = useState<Doctor | null>(null);
  const [reviewDoctor, setReviewDoctor] = useState<Doctor | null>(null);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // دریافت پزشکان از سرور
  const fetchDoctors = async (
    page = 1,
    search = searchQuery,
    expertise = expertiseFilter,
    city = cityFilter
  ) => {
    try {
      setLoading(true);
      setError("");

      const params: Record<string, any> = {
        page,
        limit,
        search: search.trim() || undefined,
        expertise: expertise.trim() || undefined,
        city: city.trim() || undefined,
      };

      // در صورت پشتیبانی سرور، برای غیر ادمین‌ها فقط فعال‌ها فرستاده شود
      if (!isAdmin) {
        params.isActive = true;
      }

      const res = await api.get("/users/doctorsList", { params });

      if (res.data?.success) {
        setDoctors(res.data.data || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setCurrentPage(res.data.pagination.currentPage || page);
        }
      }
    } catch {
      setError("خطا در برقراری ارتباط با سرور پزشکان.");
    } finally {
      setLoading(false);
    }
  };

  // اعمال Debounce روی تغییرات فیلترها
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchDoctors(1, searchQuery, expertiseFilter, cityFilter);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, expertiseFilter, cityFilter]);

  // ریست کردن تمامی فیلترها
  const handleClearFilters = () => {
    setSearchQuery("");
    setExpertiseFilter("");
    setCityFilter("");
    setCurrentPage(1);
  };

  // فیلتر اطمینان در فرانت‌اند: بیمار فقط فعال‌ها را ببیند، ادمین همه را
  const displayedDoctors = isAdmin
    ? doctors
    : doctors.filter((doc) => doc.isActive === true);

  // ثبت تایید یا رد مدارک پزشک توسط ادمین
  const handleReviewSubmit = async (
    action: "APPROVE" | "REJECT",
    reason?: string
  ) => {
    if (!reviewDoctor) return;
    setIsSubmittingReview(true);
    const toastId = toast.loading("در حال ثبت نتیجه بررسی...");

    try {
      await api.put(`/Admin/${reviewDoctor._id}/reviewDoctorDocuments`, {
        action,
        rejectReason: reason,
      });

      toast.success(
        action === "APPROVE" ? "حساب پزشک تایید و فعال شد." : "مدارک رد شد.",
        { id: toastId }
      );

      // بروزرسانی وضعیت پزشک در جدول بدون لودینگ مجدد
      setDoctors((prev) =>
        prev.map((d) =>
          d._id === reviewDoctor._id
            ? {
                ...d,
                isActive: action === "APPROVE",
                nationalIdVerification: {
                  ...d.nationalIdVerification,
                  status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                },
                medicalDocuments: {
                  ...d.medicalDocuments,
                  status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                },
              }
            : d
        )
      );
      setReviewDoctor(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در بررسی مدارک.", {
        id: toastId,
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getDocBadge = (doctor: Doctor) => {
    const med = doctor.medicalDocuments?.status || "NOT_UPLOADED";
    const id = doctor.nationalIdVerification?.status || "NOT_UPLOADED";

    if (med === "APPROVED" && id === "APPROVED") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          <CheckCircle2 size={11} /> تایید شده
        </span>
      );
    }
    if (med === "REJECTED" || id === "REJECTED") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
          <XCircle size={11} /> رد شده
        </span>
      );
    }
    if (med === "PENDING" || id === "PENDING") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse">
          <Clock size={11} /> در انتظار بررسی
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
        ثبت‌نشده
      </span>
    );
  };

  const hasActiveFilters = !!(searchQuery || expertiseFilter || cityFilter);

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-3 sm:p-6 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* ================= هدر صفحه و دکمه اکسل ================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-gadget-dark flex items-center gap-2">
              <Stethoscope className="text-gadget-light shrink-0" size={26} />
              لیست پزشکان و متخصصان
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              {isAdmin
                ? "مدیریت پزشکان، احراز مدارک و گزارش‌های مالی"
                : "پزشک خود را بیابید و آنلاین نوبت رزرو کنید"}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsExcelOpen(true)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs shrink-0 self-end sm:self-auto"
            >
              <FileSpreadsheet size={16} />
              <span>بارگذاری با اکسل</span>
            </button>
          )}
        </div>

        {/* ================= نوار جستجو و فیلترهای تخصصی و شهری ================= */}
        <div className="bg-gray-50/80 p-3 sm:p-4 rounded-2xl border border-gray-200/70 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            
            {/* ۱. جستجوی نام یا نام خانوادگی */}
            <div className="relative">
              <Search className="absolute right-3.5 top-3 text-gray-400" size={17} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="نام خانوادگی یا نام پزشک..."
                className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden transition-all shadow-2xs"
              />
            </div>

            {/* ۲. فیلتر تخصص پزشک */}
            <div className="relative">
              <Award className="absolute right-3.5 top-3 text-gray-400" size={17} />
              <input
                type="text"
                value={expertiseFilter}
                onChange={(e) => setExpertiseFilter(e.target.value)}
                placeholder="تخصص (مثلاً: اطفال، جراح، دندان)..."
                className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden transition-all shadow-2xs"
              />
            </div>

            {/* ۳. فیلتر شهر مطب */}
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3 text-gray-400" size={17} />
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="شهر (مثلاً: تهران، شیراز)..."
                className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden transition-all shadow-2xs"
              />
            </div>

            {/* ۴. دکمه پاکسازی فیلترها */}
            <div className="flex items-center">
              <button
                type="button"
                disabled={!hasActiveFilters}
                onClick={handleClearFilters}
                className="w-full h-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 shadow-2xs"
              >
                <RotateCcw size={14} />
                <span>حذف فیلترها</span>
              </button>
            </div>

          </div>
        </div>

        {/* ================= لودینگ ================= */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-3" size={36} />
            <p className="text-xs sm:text-sm font-bold text-gray-500">
              در حال دریافت لیست پزشکان...
            </p>
          </div>
        )}

        {/* ================= خطا ================= */}
        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center text-xs sm:text-sm font-bold border border-red-100 max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* ================= پیام پزشک یافت نشد (کامپوننت خالی بودن لیست) ================= */}
        {!loading && !error && displayedDoctors.length === 0 && (
          <div className="bg-gray-50/70 p-10 rounded-3xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center my-6">
            <div className="w-16 h-16 bg-white text-gray-400 rounded-2xl flex items-center justify-center mb-3 shadow-2xs border border-gray-100">
              {hasActiveFilters ? <Filter size={28} /> : <Stethoscope size={28} />}
            </div>
            <h3 className="text-base font-black text-gray-800 mb-1">
              پزشکی با این مشخصات یافت نشد
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm max-w-sm leading-relaxed">
              {hasActiveFilters
                ? "هیچ پزشکی با فیلترهای انتخابی شما مطابقت ندارد. لطفاً فیلترها را تغییر دهید."
                : "در حال حاضر هیچ پزشکی با حساب فعال در سامانه ثبت نشده است."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 text-xs font-bold text-gadget-light hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={13} />
                نمایش تمام پزشکان
              </button>
            )}
          </div>
        )}

        {/* ================= گرید کارت‌های پزشکان ================= */}
        {!loading && !error && displayedDoctors.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {displayedDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div>
                    {/* اطلاعات بالای کارت */}
                    <div className="flex items-center gap-3 mb-3.5 pb-3.5 border-b border-gray-100">
                      <DoctorAvatar
                        imageProfile={doctor.imageProfile}
                        firstName={doctor.firstName}
                        className="w-13 h-13 rounded-2xl shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">
                            دکتر {doctor.firstName} {doctor.lastName}
                          </h3>
                          {isAdmin && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                                doctor.isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {doctor.isActive ? "فعال" : "غیرفعال"}
                            </span>
                          )}
                        </div>
                        <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-lg truncate max-w-full">
                          {doctor.Expertise}
                        </span>
                      </div>
                    </div>

                    {/* مشخصات و بَج وضعیت مدارک برای ادمین */}
                    <div className="space-y-2 text-xs mb-4">
                      {isAdmin && (
                        <div className="flex items-center justify-between bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                          <span className="text-gray-500 font-medium">مدارک:</span>
                          {getDocBadge(doctor)}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-600">
                        <Award size={15} className="text-gray-400 shrink-0" />
                        <span>
                          نظام پزشکی:{" "}
                          <strong className="text-gray-800 font-mono">
                            {doctor.medicalCouncilCode}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={15} className="text-gray-400 shrink-0" />
                        <span dir="ltr" className="font-mono text-gray-800">
                          {doctor.clinicPhone}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">
                          {doctor.clinicAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* دکمه‌های عملیاتی پایین کارت */}
                  <div className="pt-3 border-t border-gray-100">
                    {isAdmin ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setReviewDoctor(doctor)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                        >
                          <FileCheck size={14} /> بررسی مدارک
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoiceDoctor(doctor)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
                        >
                          <Receipt size={14} /> صورت‌حساب
                        </button>
                      </div>
                    ) : isLoggedIn ? (
                      <button
                        onClick={() => setBookingDoctor(doctor)}
                        className="w-full flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <CalendarPlus size={16} /> دریافت نوبت
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-gray-200 transition-all"
                      >
                        <LogIn size={16} /> ورود برای رزرو
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* کنترل‌های صفحه‌بندی */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white border border-gray-200 p-3 sm:p-4 rounded-2xl shadow-2xs mt-6">
                <button
                  onClick={() => {
                    const prev = Math.max(1, currentPage - 1);
                    setCurrentPage(prev);
                    fetchDoctors(prev, searchQuery, expertiseFilter, cityFilter);
                  }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={15} /> <span>قبلی</span>
                </button>

                <span className="text-xs font-bold text-gray-700">
                  صفحه {currentPage} از {totalPages}
                </span>

                <button
                  onClick={() => {
                    const next = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(next);
                    fetchDoctors(next, searchQuery, expertiseFilter, cityFilter);
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>بعدی</span> <ChevronLeft size={15} />
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* مودال‌های ماژولار */}
      <DoctorReviewModal
        isOpen={!!reviewDoctor}
        onClose={() => setReviewDoctor(null)}
        doctor={reviewDoctor}
        onSubmitReview={handleReviewSubmit}
        onPreviewImage={(file) => setPreviewImage(file)}
        isSubmitting={isSubmittingReview}
      />

      <DoctorBookingModal
        isOpen={!!bookingDoctor}
        onClose={() => setBookingDoctor(null)}
        doctor={bookingDoctor}
      />

      <DoctorInvoicesModal
        isOpen={!!invoiceDoctor}
        onClose={() => setInvoiceDoctor(null)}
        doctor={invoiceDoctor}
      />

      <ExcelImportModal
        importType="doctors"
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
        onSuccessRefresh={() =>
          fetchDoctors(1, searchQuery, expertiseFilter, cityFilter)
        }
      />

      {/* پیش‌نمایش تصویر تمام‌صفحه */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 max-w-2xl w-full shadow-2xl space-y-3 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-800">مشاهده تصویر مدرک</h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-red-500 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <SecureImage
                fileName={previewImage}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}