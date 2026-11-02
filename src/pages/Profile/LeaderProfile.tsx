import { useState, useEffect } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  User,
  MapPin,
  Car,
  FileCheck,
  Loader2,
  Building,
  Calendar,
  Layers,
  Palette,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  UploadCloud,
  X,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import SecureImage from "../../components/common/SecureImage";
import FileUpload from "../../components/common/FileUpload";


interface Props {
  userProfile: any;
  refreshProfile: () => Promise<void>;
}

export default function LeaderProfile({ userProfile, refreshProfile }: Props) {
  const [docsLoading, setDocsLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewImageName, setPreviewImageName] = useState<string | null>(null);

  // استیت مشخصات خودرو
  const [carDetails, setCarDetails] = useState({
    brand: "",
    model: "",
    color: "",
    plateNumber: "",
    manufactureYear: "",
  });

  // استیت ذخیره فایل‌های آپلود شده در MinIO
  const [uploadedFiles, setUploadedFiles] = useState({
    nationalIdFront: "",
    nationalIdBack: "",
    vehicleCardFront: "",
    vehicleCardBack: "",
    insurancePhoto: "",
    drivingLicenseFront: "",
    drivingLicenseBack: "",
  });

  // پر کردن اولیه مشخصات خودرو از پروفایل در صورت وجود
  useEffect(() => {
    if (userProfile?.car) {
      setCarDetails({
        brand: userProfile.car.brand || "",
        model: userProfile.car.model || "",
        color: userProfile.car.color || "",
        plateNumber: userProfile.car.plateNumber || "",
        manufactureYear: userProfile.car.manufactureYear
          ? String(userProfile.car.manufactureYear)
          : "",
      });
    }
  }, [userProfile]);

  const handleCarDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCarDetails({ ...carDetails, [e.target.name]: e.target.value });
  };

  const handleUploadSuccess =
    (field: keyof typeof uploadedFiles) => (minioObjectName: string) => {
      setUploadedFiles((prev) => ({ ...prev, [field]: minioObjectName }));
    };

  const handleUploadRemove = (field: keyof typeof uploadedFiles) => () => {
    setUploadedFiles((prev) => ({ ...prev, [field]: "" }));
  };

  // ارسال مدارک و تطبیق هوش مصنوعی (OCR)
  const handleDocumentsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFiles.nationalIdFront || !uploadedFiles.nationalIdBack) {
      toast.error("بارگذاری تصویر روی کارت ملی و پشت آن الزامی است.");
      return;
    }

    if (userProfile?.hasCar) {
      if (
        !carDetails.brand.trim() ||
        !carDetails.model.trim() ||
        !carDetails.color.trim() ||
        !carDetails.plateNumber.trim() ||
        !carDetails.manufactureYear
      ) {
        toast.error("لطفاً مشخصات فنی خودرو را به طور کامل تکمیل فرمایید.");
        return;
      }
      if (
        !uploadedFiles.vehicleCardFront ||
        !uploadedFiles.vehicleCardBack ||
        !uploadedFiles.insurancePhoto ||
        !uploadedFiles.drivingLicenseFront ||
        !uploadedFiles.drivingLicenseBack
      ) {
        toast.error(
          "بارگذاری تمامی مدارک ترابری (کارت خودرو، بیمه و گواهینامه) الزامی است.",
        );
        return;
      }
    }

    setDocsLoading(true);
    const toastId = toast.loading(
      "در حال بررسی هوشمند کارت ملی و ارسال مدارک...",
    );

    try {
      const payload: any = {
        nationalIdFront: uploadedFiles.nationalIdFront,
        nationalIdBack: uploadedFiles.nationalIdBack,
      };

      if (userProfile?.hasCar) {
        payload.brand = carDetails.brand.trim();
        payload.model = carDetails.model.trim();
        payload.color = carDetails.color.trim();
        payload.plateNumber = carDetails.plateNumber.trim();
        payload.manufactureYear = Number(carDetails.manufactureYear) || 0;
        payload.vehicleCardFront = uploadedFiles.vehicleCardFront;
        payload.vehicleCardBack = uploadedFiles.vehicleCardBack;
        payload.insurancePhoto = uploadedFiles.insurancePhoto;
        payload.drivingLicenseFront = uploadedFiles.drivingLicenseFront;
        payload.drivingLicenseBack = uploadedFiles.drivingLicenseBack;
      }

      const response = await api.post("/leader/update-documents", payload);

      toast.success(
        response.data?.message ||
          "مدارک با موفقیت بارگذاری شد و در انتظار تایید ادمین می‌باشد.",
        { id: toastId },
      );

      setIsUploadOpen(false);
      await refreshProfile();
    } catch (err: any) {
      const status = err.response?.status;
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "خطا در ثبت مدارک لیدر.";

      if (
        status === 400 &&
        (errorMsg.includes("مطابقت ندارد") || errorMsg.includes("کیفیت"))
      ) {
        toast.error(errorMsg, { id: toastId, duration: 6000 });
      } else {
        toast.error(errorMsg, { id: toastId });
      }
    } finally {
      setDocsLoading(false);
    }
  };

  // محاسبه وضعیت مدارک لیدر
  const idVerification = userProfile?.nationalIdVerification;
  const status = userProfile?.isActive
    ? "APPROVED"
    : idVerification?.status || "NOT_UPLOADED";
  const rejectReason = idVerification?.rejectReason;

  // استخراج مدارک ثبت‌شده در پرونده جهت نمایش
  const existingDocs = {
    nationalIdFront:
      idVerification?.frontImage || userProfile?.nationalIdPhotos?.front,
    nationalIdBack:
      idVerification?.backImage || userProfile?.nationalIdPhotos?.back,
    vehicleCardFront: userProfile?.car?.documents?.vehicleCardFront,
    vehicleCardBack: userProfile?.car?.documents?.vehicleCardBack,
    insurancePhoto: userProfile?.car?.documents?.insurancePhoto,
    drivingLicenseFront: userProfile?.car?.documents?.drivingLicenseFront,
    drivingLicenseBack: userProfile?.car?.documents?.drivingLicenseBack,
  };

  const hasUploadedDocs = !!(
    existingDocs.nationalIdFront || existingDocs.nationalIdBack
  );

  return (
    <div
      className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 font-sans"
      dir="rtl"
    >
      {/* ================= ۲. مشخصات شناسنامه‌ای لیدر (Read-only) ================= */}
      <div className="space-y-4 bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs">
        <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <User size={17} className="text-gadget-light" />
          مشخصات فردی لیدر
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              نام و نام خانوادگی
            </label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold cursor-not-allowed">
              {userProfile?.firstName} {userProfile?.lastName}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              کد ملی
            </label>
            <div
              className="w-full bg-gray-50 border border-gray-200/70 text-gray-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono cursor-not-allowed"
              dir="ltr"
            >
              {userProfile?.nationalId || "---"}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              سن
            </label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm cursor-not-allowed">
              {userProfile?.age ? `${userProfile.age} سال` : "---"}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              تلفن همراه
            </label>
            <div
              className="w-full bg-gray-50 border border-gray-200/70 text-gray-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono cursor-not-allowed"
              dir="ltr"
            >
              {userProfile?.mobile}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              شهر محل فعالیت
            </label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold cursor-not-allowed flex items-center gap-1.5">
              <Building size={14} className="text-gray-400" />{" "}
              {userProfile?.city || "---"}
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              آدرس سکونت
            </label>
            <div
              className="w-full bg-gray-50 border border-gray-200/70 text-gray-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm cursor-not-allowed truncate"
              title={userProfile?.Address}
            >
              <MapPin size={14} className="text-gray-400 inline ml-1" />{" "}
              {userProfile?.Address || "---"}
            </div>
          </div>
        </div>
      </div>
      {/* ================= ۱. وضعیت تاییدیه و مدارک حساب لیدر ================= */}
      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all ${
          status === "APPROVED"
            ? "bg-emerald-50/70 border-emerald-200"
            : status === "PENDING"
              ? "bg-blue-50/70 border-blue-200"
              : status === "REJECTED"
                ? "bg-rose-50/80 border-rose-200"
                : "bg-amber-50/80 border-amber-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 sm:p-3 rounded-2xl shrink-0 shadow-2xs ${
                status === "APPROVED"
                  ? "bg-emerald-500 text-white"
                  : status === "PENDING"
                    ? "bg-blue-500 text-white"
                    : status === "REJECTED"
                      ? "bg-rose-500 text-white"
                      : "bg-amber-500 text-white"
              }`}
            >
              {status === "APPROVED" ? (
                <ShieldCheck size={22} className="sm:w-6 sm:h-6" />
              ) : status === "REJECTED" ? (
                <XCircle size={22} className="sm:w-6 sm:h-6" />
              ) : status === "PENDING" ? (
                <Clock size={22} className="sm:w-6 sm:h-6" />
              ) : (
                <AlertCircle size={22} className="sm:w-6 sm:h-6" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-gray-900">
                  وضعیت مدارک هویتی و ترابری لیدر
                </h3>

                {status === "APPROVED" && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={12} /> احراز هویت تایید شده
                  </span>
                )}
                {status === "PENDING" && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                    <Clock size={12} /> در صف بررسی کارشناس
                  </span>
                )}
                {status === "REJECTED" && (
                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <XCircle size={12} /> مدارک رد شده
                  </span>
                )}
                {status === "NOT_UPLOADED" && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <AlertCircle size={12} /> در انتظار بارگذاری مدارک
                  </span>
                )}
              </div>

              <p className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-relaxed">
                {status === "APPROVED" &&
                  "مدارک هویتی و مشخصات خودروی شما تایید شده و نام شما در لیست سرویس‌های ترابری بیماران نمایش داده می‌شود."}
                {status === "PENDING" &&
                  "مدارک شما با موفقیت از طریق هوش مصنوعی تطبیق داده شده و در صف بررسی کارشناس ادمین است. حساب شما تا زمان تایید نهایی در حالت غیرفعال باقی می‌ماند."}
                {status === "REJECTED" && (
                  <span className="text-rose-800">
                    {rejectReason ? (
                      <>
                        <strong>علت رد مدارک: </strong>
                        {rejectReason}
                      </>
                    ) : (
                      "مدارک بارگذاری‌شده با اطلاعات ثبت‌نامی مطابقت ندارد یا کیفیت تصاویر پایین است. لطفاً مدارک جدید بارگذاری کنید."
                    )}
                  </span>
                )}
                {status === "NOT_UPLOADED" &&
                  "جهت فعال‌سازی حساب لیدری و دریافت سفارش‌های ترابری، لطفاً اسناد هویتی و خودروی خود را تکمیل فرمایید."}
              </p>
            </div>
          </div>

          {(status === "REJECTED") && (
            <button
              type="button"
              onClick={() => setIsUploadOpen(!isUploadOpen)}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw
                size={14}
                className={
                  isUploadOpen ? "rotate-180 transition-transform" : ""
                }
              />
              <span>{isUploadOpen ? "بستن فرم آپلود" : "بارگذاری مدارک"}</span>
            </button>
          )}
        </div>

        {/* ================= نمایش مدارک ثبت‌شده در پرونده ================= */}
        {hasUploadedDocs && (
          <div className="mt-4 pt-4 border-t border-gray-200/60">
            <span className="text-[11px] font-bold text-gray-700 block mb-2.5">
              مدارک ثبت‌شده در سیستم:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* روی کارت ملی */}
              {existingDocs.nationalIdFront && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                      <SecureImage
                        fileName={existingDocs.nationalIdFront}
                        alt="روی کارت ملی"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-bold text-gray-800 truncate">
                        روی کارت ملی
                      </span>
                      <span
                        className="block text-[10px] text-gray-400 font-mono truncate"
                        dir="ltr"
                      >
                        {existingDocs.nationalIdFront}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImageName(existingDocs.nationalIdFront)
                    }
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="مشاهده اندازه اصلی"
                  >
                    <ExternalLink size={15} />
                  </button>
                </div>
              )}

              {/* پشت کارت ملی */}
              {existingDocs.nationalIdBack && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                      <SecureImage
                        fileName={existingDocs.nationalIdBack}
                        alt="پشت کارت ملی"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-bold text-gray-800 truncate">
                        پشت کارت ملی
                      </span>
                      <span
                        className="block text-[10px] text-gray-400 font-mono truncate"
                        dir="ltr"
                      >
                        {existingDocs.nationalIdBack}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImageName(existingDocs.nationalIdBack)
                    }
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="مشاهده اندازه اصلی"
                  >
                    <ExternalLink size={15} />
                  </button>
                </div>
              )}

              {/* روی کارت خودرو */}
              {existingDocs.vehicleCardFront && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                      <SecureImage
                        fileName={existingDocs.vehicleCardFront}
                        alt="روی کارت خودرو"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-bold text-gray-800 truncate">
                        روی کارت خودرو
                      </span>
                      <span
                        className="block text-[10px] text-gray-400 font-mono truncate"
                        dir="ltr"
                      >
                        {existingDocs.vehicleCardFront}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImageName(existingDocs.vehicleCardFront)
                    }
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="مشاهده اندازه اصلی"
                  >
                    <ExternalLink size={15} />
                  </button>
                </div>
              )}

              {/* بیمه‌نامه */}
              {existingDocs.insurancePhoto && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                      <SecureImage
                        fileName={existingDocs.insurancePhoto}
                        alt="بیمه‌نامه خودرو"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-bold text-gray-800 truncate">
                        بیمه‌نامه
                      </span>
                      <span
                        className="block text-[10px] text-gray-400 font-mono truncate"
                        dir="ltr"
                      >
                        {existingDocs.insurancePhoto}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImageName(existingDocs.insurancePhoto)
                    }
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="مشاهده اندازه اصلی"
                  >
                    <ExternalLink size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* ================= ۳. فرم بارگذاری مشخصات خودرو و اسناد ================= */}
      {(isUploadOpen || (!userProfile?.isActive && !hasUploadedDocs)) && (
        <form
          onSubmit={handleDocumentsSubmit}
          className="space-y-6 animate-in fade-in"
        >
          {/* مشخصات فنی خودرو (در صورت داشتن ماشین) */}
          {userProfile?.hasCar && (
            <div className="space-y-4 bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs">
              <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <Car size={18} className="text-amber-500" />
                مشخصات و اطلاعات ترابری خودرو
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    برند خودرو *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="مثال: Toyota"
                    required
                    value={carDetails.brand}
                    onChange={handleCarDetailsChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    مدل خودرو *
                  </label>
                  <input
                    type="text"
                    name="model"
                    placeholder="مثال: Corolla"
                    required
                    value={carDetails.model}
                    onChange={handleCarDetailsChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    رنگ خودرو *
                  </label>
                  <div className="relative">
                    <Palette
                      className="absolute right-3 top-3 text-gray-400"
                      size={14}
                    />
                    <input
                      type="text"
                      name="color"
                      placeholder="سفید، مشکی..."
                      required
                      value={carDetails.color}
                      onChange={handleCarDetailsChange}
                      className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    شماره پلاک *
                  </label>
                  <div className="relative">
                    <Layers
                      className="absolute right-3 top-3 text-gray-400"
                      size={14}
                    />
                    <input
                      type="text"
                      name="plateNumber"
                      placeholder="12الف345 ایران 99"
                      required
                      value={carDetails.plateNumber}
                      onChange={handleCarDetailsChange}
                      className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    سال تولید *
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute right-3 top-3 text-gray-400"
                      size={14}
                    />
                    <input
                      type="number"
                      name="manufactureYear"
                      placeholder="2023 یا 1402"
                      required
                      value={carDetails.manufactureYear}
                      onChange={handleCarDetailsChange}
                      className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* باکس‌های آپلود اسناد با FileUpload */}
          <div className="bg-white border border-gray-200/80 p-5 sm:p-6 rounded-2xl shadow-2xs space-y-5">
            <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileCheck size={18} className="text-gadget-dark" />
              بارگذاری مدارک هویتی و ترابری جهت احراز هویت
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* مدارک هویتی لیدر */}
              <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100">
                <FileUpload
                  label="تصویر روی کارت ملی لیدر *"
                  onUploadSuccess={handleUploadSuccess("nationalIdFront")}
                  onRemove={handleUploadRemove("nationalIdFront")}
                  acceptedTypes="image/jpeg,image/png,image/jpg"
                />
              </div>

              <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100">
                <FileUpload
                  label="تصویر پشت کارت ملی لیدر *"
                  onUploadSuccess={handleUploadSuccess("nationalIdBack")}
                  onRemove={handleUploadRemove("nationalIdBack")}
                  acceptedTypes="image/jpeg,image/png,image/jpg"
                />
              </div>

              {/* مدارک خودرو */}
              {userProfile?.hasCar && (
                <>
                  <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100">
                    <FileUpload
                      label="تصویر روی کارت خودرو *"
                      onUploadSuccess={handleUploadSuccess("vehicleCardFront")}
                      onRemove={handleUploadRemove("vehicleCardFront")}
                      acceptedTypes="image/jpeg,image/png,image/jpg"
                    />
                  </div>

                  <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100">
                    <FileUpload
                      label="تصویر پشت کارت خودرو *"
                      onUploadSuccess={handleUploadSuccess("vehicleCardBack")}
                      onRemove={handleUploadRemove("vehicleCardBack")}
                      acceptedTypes="image/jpeg,image/png,image/jpg"
                    />
                  </div>

                  <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100">
                    <FileUpload
                      label="تصویر روی گواهینامه رانندگی *"
                      onUploadSuccess={handleUploadSuccess(
                        "drivingLicenseFront",
                      )}
                      onRemove={handleUploadRemove("drivingLicenseFront")}
                      acceptedTypes="image/jpeg,image/png,image/jpg"
                    />
                  </div>

                  <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100">
                    <FileUpload
                      label="تصویر پشت گواهینامه رانندگی *"
                      onUploadSuccess={handleUploadSuccess(
                        "drivingLicenseBack",
                      )}
                      onRemove={handleUploadRemove("drivingLicenseBack")}
                      acceptedTypes="image/jpeg,image/png,image/jpg"
                    />
                  </div>

                  <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100 md:col-span-2">
                    <FileUpload
                      label="تصویر بیمه‌نامه شخص ثالث معتبر *"
                      onUploadSuccess={handleUploadSuccess("insurancePhoto")}
                      onRemove={handleUploadRemove("insurancePhoto")}
                      acceptedTypes="image/jpeg,image/png,image/jpg"
                    />
                  </div>
                </>
              )}
            </div>

            {/* دکمه ارسال */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={docsLoading}
                className="w-full sm:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3 px-8 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {docsLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>در حال بررسی OCR و ارسال اطلاعات...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>ارسال و ثبت نهایی مدارک برای بررسی</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= مودال پیش‌نمایش مدارک در ابعاد بزرگ ================= */}
      {previewImageName && (
        <div
          onClick={() => setPreviewImageName(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 sm:p-5 max-w-2xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-xs sm:text-sm font-bold text-gray-800">
                پیش‌نمایش مدرک بارگذاری‌شده
              </h4>
              <button
                type="button"
                onClick={() => setPreviewImageName(null)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <SecureImage
                fileName={previewImageName}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex justify-end pt-1"></div>
          </div>
        </div>
      )}
    </div>
  );
}
