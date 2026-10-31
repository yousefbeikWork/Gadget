import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Phone,
  MapPin,
  Activity,
  Loader2,
  Building2,
  CalendarDays,
  X,
  LogIn,
  Hospital as HospitalIcon,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// 👈 جایگزینی با کامپوننت مشترک بررسی مراکز درمانی
import CenterReviewModal from "../components/CenterReviewModal";
import SecureImage from "../components/SecureImage";

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  address: string;
  status: "فعال" | "غیرفعال";
  licenseCode?: string;
  centerType?: string;
  manager?: any;
  documents?: {
    establishmentLicenseFile?: string | null;
    exploitationLicenseFile?: string | null;
    managerIdFiles?: string[];
    introductionLetterFile?: string | null;
    liabilityInsuranceFile?: string | null;
    status?: string;
    rejectReason?: string | null;
  };
  doctors: any[];
  parentHospital?: string;
}

export default function Clinics() {
  const navigate = useNavigate();
  const { userRole, isLoggedIn } = useAuth();
  const isAdmin = userRole === "Admin" || userRole === "SUPER_ADMIN";

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // استیت‌های مودال بررسی ادمین
  const [reviewClinic, setReviewClinic] = useState<Clinic | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchClinics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = isAdmin ? "/Admin/listClincAdmin" : "/clinic/listClinc";
      const response = await api.get(endpoint);
      const result = response.data;

      if (result?.success && Array.isArray(result.data)) {
        const mappedData: Clinic[] = result.data.map((item: any) => ({
          id: item.id || item._id,
          name: item.centerName,
          specialty: item.specialty,
          phone: item.phones?.[0] || "نامشخص",
          address: item.address,
          status: item.isActive === false ? "غیرفعال" : "فعال",
          licenseCode: item.licenseCode,
          centerType: "MedicalCenter", // 👈 هماهنگ با بک‌اند
          manager: item.manager,
          documents: item.documents,
          parentHospital: item.parentHospital,
          doctors: item.doctors || [],
        }));
        setClinics(mappedData);
      } else {
        setClinics([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت لیست کلینیک‌ها.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [isAdmin]);

  const filteredClinics = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = isAdmin ? clinics : clinics.filter((c) => c.status === "فعال");
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.specialty?.toLowerCase().includes(q),
    );
  }, [clinics, searchTerm, isAdmin]);

  // ثبت تایید یا رد مدارک کلینیک توسط ادمین
  const handleReviewSubmit = async (
    action: "APPROVE" | "REJECT",
    reason?: string,
  ) => {
    if (!reviewClinic) return;
    setIsSubmittingReview(true);
    const toastId = toast.loading("در حال ثبت نتیجه بررسی مدارک کلینیک...");

    try {
      await api.put(`/Admin/${reviewClinic.id}/reviewCenterDocuments`, {
        action,
        centerType: "MedicalCenter", // 👈 ارسال مقدار قطعی MedicalCenter
        rejectReason: reason,
      });

      toast.success(
        action === "APPROVE"
          ? "مدارک کلینیک تایید و حساب آن فعال شد."
          : "مدارک رد شد.",
        { id: toastId },
      );

      // به‌روزرسانی آنی وضعیت کلینیک در جدول
      setClinics((prev) =>
        prev.map((c) =>
          c.id === reviewClinic.id
            ? {
                ...c,
                status: action === "APPROVE" ? "فعال" : "غیرفعال",
                documents: {
                  ...c.documents,
                  status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                  rejectReason: action === "REJECT" ? reason : null,
                },
              }
            : c,
        ),
      );

      setReviewClinic(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در بررسی مدارک مرکز.", {
        id: toastId,
      });
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
    <div
      className="bg-white rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* هدر و سرچ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Building2 size={26} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-800">
                مراکز درمانی و کلینیک‌ها
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                {isAdmin
                  ? "مدیریت جامع، احراز مجوزها و تایید کلینیک‌ها"
                  : "کلینیک مورد نظر را یافته و نوبت بگیرید"}
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="جستجوی نام کلینیک یا تخصص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-4 pl-10 py-2.5 text-xs sm:text-sm focus:border-gadget-light focus:bg-white outline-hidden transition-all shadow-2xs"
            />
            <Search
              className="absolute left-3.5 top-3 text-gray-400"
              size={17}
            />
          </div>
        </div>

        {/* لیست و کارت‌ها */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-3" size={38} />
            <p className="text-xs sm:text-sm font-bold text-gray-500">
              در حال بارگذاری لیست کلینیک‌ها...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center text-xs sm:text-sm font-bold border border-red-100 max-w-md mx-auto">
            {error}
          </div>
        ) : filteredClinics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredClinics.map((clinic) => (
              <div
                key={clinic.id}
                className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <h3
                        className="font-bold text-gray-900 text-base sm:text-lg truncate"
                        title={clinic.name}
                      >
                        {clinic.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {clinic.parentHospital && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            <HospitalIcon size={12} /> بخش بیمارستانی
                          </span>
                        )}
                        {isAdmin && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${clinic.status === "فعال" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-gray-100 text-gray-500"}`}
                          >
                            {clinic.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-2xl shrink-0 bg-gadget-dark text-white flex items-center justify-center text-lg font-black shadow-xs">
                      {clinic.name ? (
                        clinic.name.charAt(0)
                      ) : (
                        <Building2 size={20} />
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-100 mb-4" />

                  {/* مشخصات */}
                  <div className="space-y-2.5 text-xs text-gray-600 mb-6">
                    {isAdmin && (
                      <div className="flex items-center justify-between bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                        <span className="text-gray-500 font-medium">
                          وضعیت مدارک:
                        </span>
                        {getDocBadge(clinic.documents?.status)}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Activity size={15} /> تخصص:
                      </span>
                      <strong className="text-gray-800 truncate max-w-[65%]">
                        {clinic.specialty || "عمومی"}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Phone size={15} /> تلفن:
                      </span>
                      <strong className="text-gray-800 font-mono" dir="ltr">
                        {clinic.phone}
                      </strong>
                    </div>
                    <div className="flex items-start gap-1.5 pt-1 border-t border-gray-50">
                      <MapPin
                        size={15}
                        className="text-gray-400 shrink-0 mt-0.5"
                      />
                      <span className="line-clamp-2 leading-relaxed text-gray-600">
                        {clinic.address || "آدرس ثبت نشده است"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* دکمه عملیاتی کارت */}
                <div className="pt-3 border-t border-gray-100">
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => setReviewClinic(clinic)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      <FileCheck size={15} />
                      <span>بررسی مدارک و پروانه</span>
                    </button>
                  ) : isLoggedIn ? (
                    <button
                      onClick={() => navigate(`/clinics/${clinic.id}`)}
                      className="w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white text-center py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CalendarDays size={16} /> مشاهده پزشکان و رزرو
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
            <Building2
              size={44}
              strokeWidth={1.2}
              className="mx-auto mb-3 text-gray-300"
            />
            <p className="font-bold text-gray-700 text-base">
              مرکز درمانی یافت نشد
            </p>
          </div>
        )}
      </div>

      {/* 👈 استفاده از کامپوننت مشترک CenterReviewModal به جای ClinicReviewModal */}
      <CenterReviewModal
        isOpen={!!reviewClinic}
        onClose={() => setReviewClinic(null)}
        center={reviewClinic}
        centerType="MedicalCenter"
        onSubmitReview={handleReviewSubmit}
        onPreviewImage={(file) => setPreviewImage(file)}
        isSubmitting={isSubmittingReview}
      />

      {/* پیش‌نمایش تصویر در ابعاد بزرگ */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in font-sans"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 max-w-2xl w-full shadow-2xl space-y-3 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-800">
                پیش‌نمایش پروانه / مدرک
              </h4>
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
