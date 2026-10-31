import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Phone,
  MapPin,
  Loader2,
  Building2,
  Hospital as HospitalIcon,
  Ambulance,
  Activity,
  CalendarDays,
  LogIn,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  X,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import CenterReviewModal from "../components/CenterReviewModal";
import HospitalBookingModal from "../components/HospitalBookingModal";
import SecureImage from "../components/SecureImage";

interface HospitalItem {
  id: string;
  hospitalName: string;
  hospitalType: string;
  mobile: string;
  isActive: boolean;
  address: string;
  phones: string[];
  emergencyMobile: string;
  clinics: any[];
  manager?: any;
  licenseCode?: string;
  documents?: {
    establishmentLicenseFile?: string | null;
    exploitationLicenseFile?: string | null;
    managerIdFiles?: string[];
    introductionLetterFile?: string | null;
    liabilityInsuranceFile?: string | null;
    status?: string;
    rejectReason?: string | null;
  };
}

export default function Hospitals() {
  const navigate = useNavigate();
  const { userRole, isLoggedIn } = useAuth();
  const isAdmin = userRole === "Admin" || userRole === "SUPER_ADMIN";

  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // استیت‌های مودال‌ها
  const [bookingHospital, setBookingHospital] = useState<HospitalItem | null>(null);
  const [reviewHospital, setReviewHospital] = useState<HospitalItem | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchHospitals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = isAdmin ? "/Admin/listHospitallAdmin" : "/Hospital/listHospitall";
      const response = await api.get(endpoint);

      if (response.data?.success && Array.isArray(response.data.data)) {
        setHospitals(response.data.data);
      } else {
        setHospitals([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت لیست بیمارستان‌ها.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [isAdmin]);

  const filteredHospitals = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = isAdmin ? hospitals : hospitals.filter((h) => h.isActive === true);
    if (!q) return list;
    return list.filter(
      (h) => h.hospitalName?.toLowerCase().includes(q) || h.address?.toLowerCase().includes(q)
    );
  }, [hospitals, searchTerm, isAdmin]);

  const getHospitalType = (type: string) => {
    switch (type) {
      case "PRIVATE":
        return "خصوصی";
      case "PUBLIC":
        return "دولتی";
      case "CHARITY":
        return "خیریه";
      default:
        return "نامشخص";
    }
  };

  // ثبت تایید یا رد مدارک بیمارستان توسط ادمین
  const handleReviewSubmit = async (action: "APPROVE" | "REJECT", reason?: string) => {
    if (!reviewHospital) return;
    setIsSubmittingReview(true);
    const toastId = toast.loading("در حال ثبت نتیجه بررسی مدارک بیمارستان...");

    try {
      await api.put(`/Admin/${reviewHospital.id}/reviewCenterDocuments`, {
        action,
        centerType: "Hospital", // 👈 هماهنگ با بک‌اند
        rejectReason: reason,
      });

      toast.success(
        action === "APPROVE" ? "مدارک بیمارستان تایید و حساب آن فعال شد." : "مدارک رد شد.",
        { id: toastId }
      );

      // بروزرسانی آنی استیت
      setHospitals((prev) =>
        prev.map((h) =>
          h.id === reviewHospital.id
            ? {
                ...h,
                isActive: action === "APPROVE",
                documents: {
                  ...h.documents,
                  status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                  rejectReason: action === "REJECT" ? reason : null,
                },
              }
            : h
        )
      );

      setReviewHospital(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در بررسی مدارک بیمارستان.", { id: toastId });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getDocBadge = (status?: string) => {
    if (status === "APPROVED") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          <CheckCircle2 size={11} /> تایید شده
        </span>
      );
    }
    if (status === "REJECTED") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
          <XCircle size={11} /> رد شده
        </span>
      );
    }
    if (status === "PENDING") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse">
          <Clock size={11} /> در انتظار بررسی
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
        بدون مدرک
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* هدر و سرچ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl shrink-0">
              <HospitalIcon size={28} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-800">بیمارستان‌های تحت پوشش</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                {isAdmin ? "مدیریت بیمارستان‌ها، احراز پروانه و کلینیک‌های تابعه" : "بیمارستان مورد نظر را برای دریافت نوبت انتخاب کنید"}
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="جستجوی نام بیمارستان یا آدرس..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-4 pl-10 py-2.5 text-xs sm:text-sm focus:border-gadget-light focus:bg-white outline-hidden transition-all shadow-2xs"
            />
            <Search className="absolute left-3.5 top-3 text-gray-400" size={17} />
          </div>
        </div>

        {/* لیست و وضعیت‌ها */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-3" size={38} />
            <p className="text-xs sm:text-sm font-bold text-gray-500">در حال دریافت لیست بیمارستان‌ها...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center text-xs sm:text-sm font-bold border border-red-100 max-w-md mx-auto">
            {error}
          </div>
        ) : filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate" title={hospital.hospitalName}>
                        {hospital.hospitalName}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {getHospitalType(hospital.hospitalType)}
                        </span>
                        {isAdmin && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              hospital.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            {hospital.isActive ? "فعال" : "غیرفعال"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-2xl shrink-0 bg-gadget-dark text-white flex items-center justify-center text-lg font-black shadow-xs">
                      {hospital.hospitalName ? hospital.hospitalName.replace("بیمارستان", "").trim().charAt(0) : <Building2 size={20} />}
                    </div>
                  </div>

                  <hr className="border-gray-100 mb-4" />

                  {/* مشخصات تماس */}
                  <div className="space-y-2.5 text-xs text-gray-600 mb-4">
                    {isAdmin && (
                      <div className="flex items-center justify-between bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                        <span className="text-gray-500 font-medium">وضعیت مدارک:</span>
                        {getDocBadge(hospital.documents?.status)}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5"><Phone size={14} /> پذیرش:</span>
                      <strong className="text-gray-800 font-mono" dir="ltr">
                        {hospital.phones?.[0] || hospital.mobile}
                      </strong>
                    </div>
                    {hospital.emergencyMobile && (
                      <div className="flex items-center justify-between text-rose-700 bg-rose-50/50 p-2 rounded-xl border border-rose-100/60">
                        <span className="flex items-center gap-1.5"><Ambulance size={14} /> اورژانس:</span>
                        <strong className="font-mono" dir="ltr">{hospital.emergencyMobile}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/50 text-xs font-bold text-blue-800">
                    <span className="flex items-center gap-1.5"><Activity size={15} /> کلینیک‌های وابسته:</span>
                    <span>{hospital.clinics?.length || 0} مرکز</span>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-gray-500">
                    <MapPin size={15} className="shrink-0 mt-0.5 text-gray-400" />
                    <span className="line-clamp-2 leading-relaxed" title={hospital.address}>{hospital.address || "آدرس ثبت نشده است"}</span>
                  </div>

                  {/* دکمه عملیاتی کارت */}
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => setReviewHospital(hospital)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      <FileCheck size={15} />
                      <span>بررسی مدارک و پروانه بیمارستان</span>
                    </button>
                  ) : isLoggedIn ? (
                    <button
                      onClick={() => setBookingHospital(hospital)}
                      className="w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white text-center py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CalendarDays size={16} /> مشاهده کلینیک‌ها و رزرو
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn size={16} /> برای رزرو وارد شوید
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 p-12 text-center rounded-3xl text-gray-400 max-w-md mx-auto">
            <Building2 size={44} strokeWidth={1.2} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-700 text-base">بیمارستانی یافت نشد</p>
          </div>
        )}
      </div>

      {/* مودال بررسی مدارک مرکز (مشترک برای بیمارستان، کلینیک و آزمایشگاه) */}
      <CenterReviewModal
        isOpen={!!reviewHospital}
        onClose={() => setReviewHospital(null)}
        center={reviewHospital}
        centerType="Hospital"
        onSubmitReview={handleReviewSubmit}
        onPreviewImage={(file) => setPreviewImage(file)}
        isSubmitting={isSubmittingReview}
      />

      {/* مودال رزرو ۳ مرحله‌ای بیمارستان */}
      <HospitalBookingModal
        isOpen={!!bookingHospital}
        onClose={() => setBookingHospital(null)}
        hospital={bookingHospital}
      />

      {/* پیش‌نمایش تصویر در ابعاد اصلی */}
      {previewImage && (
        <div onClick={() => setPreviewImage(null)} className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in font-sans">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-4 max-w-2xl w-full shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-800">پیش‌نمایش مدرک</h4>
              <button onClick={() => setPreviewImage(null)} className="text-gray-400 hover:text-red-500 p-1 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <SecureImage fileName={previewImage} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}