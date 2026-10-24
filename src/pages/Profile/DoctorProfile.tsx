import { useState, useEffect } from "react";
import {
  User,
  Activity,
  Phone,
  MapPin,
  Building,
  Save,
  Loader2,
  ShieldCheck,
  XCircle,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  UploadCloud,
  X,
  Award,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import FileUpload from "../../components/FileUpload";
import DoctorAvatar from "../../components/DoctorAvatar";
import SecureImage from "../../components/SecureImage";

interface Props {
  userProfile: any;
  refreshProfile: () => Promise<void>;
}

export default function DoctorProfile({ userProfile, refreshProfile }: Props) {
  const [loading, setLoading] = useState(false);

  // استیت‌های آپلود و ارسال مدارک هویتی و پزشکی
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [nationalIdFront, setNationalIdFront] = useState("");
  const [nationalIdBack, setNationalIdBack] = useState("");
  const [medicalCouncilCard, setMedicalCouncilCard] = useState("");
  const [medicalLicense, setMedicalLicense] = useState("");
  const [isSubmittingDocs, setIsSubmittingDocs] = useState(false);

  // استیت مودال پیش‌نمایش تصویر در اندازه بزرگ
  const [previewImageName, setPreviewImageName] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    clinicAddress: "",
    orgAddress: "",
    clinicPhone: "",
    avatar: "",
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        age: userProfile.age ? String(userProfile.age) : "",
        clinicAddress: userProfile.clinicAddress || "",
        orgAddress: userProfile.orgAddress || "",
        clinicPhone: userProfile.clinicPhone || "",
        avatar: userProfile.imageProfile || "",
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUploadSuccess = async (minioObjectName: string) => {
    const loadingToast = toast.loading(
      "در حال ثبت تصویر پروفایل شما در دیتابیس...",
    );
    try {
      await api.post("/doctor/addDoctorProfileImage", {
        minioobjectName: minioObjectName,
      });

      setFormData((prev) => ({ ...prev, avatar: minioObjectName }));
      await refreshProfile();

      toast.success("تصویر پروفایل پزشک با موفقیت تغییر کرد", {
        id: loadingToast,
      });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "خطا در ثبت نهایی تصویر پروفایل",
        { id: loadingToast },
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age ? Number(formData.age) : undefined,
        clinicAddress: formData.clinicAddress,
        orgAddress: formData.orgAddress,
        clinicPhone: formData.clinicPhone,
        avatar: formData.avatar,
      };

      const response = await api.put("/users/profile", payload);

      if (response.data) {
        toast.success("اطلاعات حساب کاربری با موفقیت بروزرسانی شد");
        await refreshProfile();
      }
    } catch (err) {
      toast.error("خطا در بروزرسانی اطلاعات. لطفاً دوباره تلاش کنید.");
      setFormData((prev) => ({
        ...prev,
        avatar: userProfile?.imageProfile || "",
      }));
    } finally {
      setLoading(false);
    }
  };

  // ارسال مدارک هویتی و پزشکی پزشک
  const handleUploadDoctorDocuments = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nationalIdFront || !nationalIdBack || !medicalCouncilCard) {
      toast.error("تصویر رو و پشت کارت ملی و کارت نظام پزشکی الزامی است.");
      return;
    }

    setIsSubmittingDocs(true);
    const toastId = toast.loading(
      "در حال بررسی هوشمند مدارک توسط هوش مصنوعی...",
    );

    try {
      const response = await api.post("/doctor/updateDoctorDocuments", {
        nationalIdFront,
        nationalIdBack,
        medicalCouncilCard,
        medicalLicense: medicalLicense || undefined,
      });

      toast.success(
        response.data?.message ||
          "مدارک با موفقیت بارگذاری شد و در انتظار تایید ادمین می‌باشد.",
        { id: toastId },
      );

      setIsUploadOpen(false);
      setNationalIdFront("");
      setNationalIdBack("");
      setMedicalCouncilCard("");
      setMedicalLicense("");
      await refreshProfile();
    } catch (err: any) {
      const status = err.response?.status;
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "خطا در ثبت مدارک پزشک.";

      if (
        status === 400 &&
        (errorMsg.includes("مطابقت ندارد") || errorMsg.includes("پایین است"))
      ) {
        toast.error(errorMsg, { id: toastId, duration: 6000 });
      } else {
        toast.error(errorMsg, { id: toastId });
      }
    } finally {
      setIsSubmittingDocs(false);
    }
  };

  const idVerification = userProfile?.nationalIdVerification;
  const medVerification = userProfile?.medicalDocuments;

  // محاسبه وضعیت کلی مدارک
  const getOverallStatus = () => {
    const idStatus = idVerification?.status || "NOT_UPLOADED";
    const medStatus = medVerification?.status || "NOT_UPLOADED";

    if (idStatus === "REJECTED" || medStatus === "REJECTED") return "REJECTED";
    if (idStatus === "PENDING" || medStatus === "PENDING") return "PENDING";
    if (idStatus === "APPROVED" && medStatus === "APPROVED") return "APPROVED";
    return "NOT_UPLOADED";
  };

  const overallStatus = getOverallStatus();
  const rejectReason =
    medVerification?.rejectReason || idVerification?.rejectReason;

  const hasUploadedDocs = !!(
    idVerification?.frontImage ||
    idVerification?.backImage ||
    medVerification?.medicalCouncilCard
  );

  return (
    <div
      className="space-y-6 sm:space-y-8 animate-in fade-in font-sans"
      dir="rtl"
    >
      {/* ================== ۱. وضعیت مدارک هویتی و پزشکی پزشک ================== */}
      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all ${
          overallStatus === "APPROVED"
            ? "bg-emerald-50/70 border-emerald-200"
            : overallStatus === "PENDING"
              ? "bg-blue-50/70 border-blue-200"
              : overallStatus === "REJECTED"
                ? "bg-rose-50/80 border-rose-200"
                : "bg-gray-50/90 border-gray-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 sm:p-3 rounded-2xl shrink-0 shadow-2xs ${
                overallStatus === "APPROVED"
                  ? "bg-emerald-500 text-white"
                  : overallStatus === "PENDING"
                    ? "bg-blue-500 text-white"
                    : overallStatus === "REJECTED"
                      ? "bg-rose-500 text-white"
                      : "bg-gray-400 text-white"
              }`}
            >
              {overallStatus === "APPROVED" ? (
                <ShieldCheck size={22} className="sm:w-6 sm:h-6" />
              ) : overallStatus === "REJECTED" ? (
                <XCircle size={22} className="sm:w-6 sm:h-6" />
              ) : overallStatus === "PENDING" ? (
                <Clock size={22} className="sm:w-6 sm:h-6" />
              ) : (
                <Award size={22} className="sm:w-6 sm:h-6" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-gray-900">
                  وضعیت مدارک هویتی و پروانه پزشکی
                </h3>

                {overallStatus === "APPROVED" && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={12} /> احراز هویت تایید شده
                  </span>
                )}
                {overallStatus === "PENDING" && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                    <Clock size={12} /> در صف بررسی کارشناس
                  </span>
                )}
                {overallStatus === "REJECTED" && (
                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <XCircle size={12} /> مدارک رد شده
                  </span>
                )}
                {overallStatus === "NOT_UPLOADED" && (
                  <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <AlertCircle size={12} /> بارگذاری نشده
                  </span>
                )}
              </div>

              <p className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-relaxed">
                {overallStatus === "APPROVED" &&
                  "مدارک هویتی، کد نظام پزشکی و پروانه شما تایید شده و حساب شما در لیست پزشکان فعال است."}
                {overallStatus === "PENDING" &&
                  "تصاویر مدارک هویتی و نظام پزشکی شما با موفقیت دریافت گردیده و در صف بررسی ادمین قرار دارد. تا زمان تایید نهایی حساب کاربری در حالت غیرفعال می‌ماند."}
                {overallStatus === "REJECTED" && (
                  <span className="text-rose-800">
                    {rejectReason ? (
                      <>
                        <strong>علت رد مدارک: </strong>
                        {rejectReason}
                      </>
                    ) : (
                      "مدارک ارسالی تایید نشد یا با اطلاعات ثبت‌نامی مطابقت ندارد. لطفاً مدارک جدید بارگذاری فرمایید."
                    )}
                  </span>
                )}
                {overallStatus === "NOT_UPLOADED" &&
                  "جهت فعال‌سازی حساب و امکان دریافت نوبت توسط بیماران، ارسال تصویر رو و پشت کارت ملی و کارت نظام پزشکی الزامی است."}
              </p>
            </div>
          </div>

          {(overallStatus === "REJECTED" ||
            overallStatus === "NOT_UPLOADED") && (
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

        {/* ================= نمایش مدارک فعلی بارگذاری‌شده ================= */}
        {hasUploadedDocs && (
          <div className="mt-4 pt-4 border-t border-gray-200/60">
            <span className="text-[11px] font-bold text-gray-700 block mb-2.5">
              مدارک ثبت‌شده در پرونده:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* روی کارت ملی */}
              {idVerification?.frontImage && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                      <SecureImage
                        fileName={idVerification.frontImage}
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
                        {idVerification.frontImage}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImageName(idVerification.frontImage!)
                    }
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="مشاهده اندازه اصلی"
                  >
                    <ExternalLink size={15} />
                  </button>
                </div>
              )}

              {/* پشت کارت ملی */}
              {idVerification?.backImage && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                      <SecureImage
                        fileName={idVerification.backImage}
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
                        {idVerification.backImage}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImageName(idVerification.backImage!)
                    }
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="مشاهده اندازه اصلی"
                  >
                    <ExternalLink size={15} />
                  </button>
                </div>
              )}

              {/* کارت نظام پزشکی */}
              {medVerification?.medicalCouncilCard && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                      <SecureImage
                        fileName={medVerification.medicalCouncilCard}
                        alt="کارت نظام پزشکی"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-bold text-gray-800 truncate">
                        کارت نظام پزشکی
                      </span>
                      <span
                        className="block text-[10px] text-gray-400 font-mono truncate"
                        dir="ltr"
                      >
                        {medVerification.medicalCouncilCard}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImageName(medVerification.medicalCouncilCard!)
                    }
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="مشاهده اندازه اصلی"
                  >
                    <ExternalLink size={15} />
                  </button>
                </div>
              )}

              {/* پروانه مطب / طبابت */}
              {medVerification?.medicalLicense && (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                      <SecureImage
                        fileName={medVerification.medicalLicense}
                        alt="پروانه طبابت"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-bold text-gray-800 truncate">
                        پروانه مطب
                      </span>
                      <span
                        className="block text-[10px] text-gray-400 font-mono truncate"
                        dir="ltr"
                      >
                        {medVerification.medicalLicense}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImageName(medVerification.medicalLicense!)
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

        {/* ================= فرم آپلود یا جایگزینی مدارک پزشک ================= */}
        {(isUploadOpen ||
          (overallStatus === "NOT_UPLOADED" && !hasUploadedDocs)) && (
          <form
            onSubmit={handleUploadDoctorDocuments}
            className="pt-4 mt-4 border-t border-gray-200/80 space-y-4 animate-in fade-in"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <FileUpload
                  label="تصویر روی کارت ملی *"
                  acceptedTypes="image/jpeg,image/png,image/jpg"
                  onUploadSuccess={(minioName: string) =>
                    setNationalIdFront(minioName)
                  }
                  onRemove={() => setNationalIdFront("")}
                />
              </div>

              <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <FileUpload
                  label="تصویر پشت کارت ملی *"
                  acceptedTypes="image/jpeg,image/png,image/jpg"
                  onUploadSuccess={(minioName: string) =>
                    setNationalIdBack(minioName)
                  }
                  onRemove={() => setNationalIdBack("")}
                />
              </div>

              <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <FileUpload
                  label="تصویر کارت نظام پزشکی *"
                  acceptedTypes="image/jpeg,image/png,image/jpg"
                  onUploadSuccess={(minioName: string) =>
                    setMedicalCouncilCard(minioName)
                  }
                  onRemove={() => setMedicalCouncilCard("")}
                />
              </div>

              <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <FileUpload
                  label="تصویر پروانه مطب / مجوز طبابت (اختیاری)"
                  acceptedTypes="image/jpeg,image/png,image/jpg"
                  onUploadSuccess={(minioName: string) =>
                    setMedicalLicense(minioName)
                  }
                  onRemove={() => setMedicalLicense("")}
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={
                  isSubmittingDocs ||
                  !nationalIdFront ||
                  !nationalIdBack ||
                  !medicalCouncilCard
                }
                className="w-full sm:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingDocs ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>در حال بررسی هوشمند و ارسال...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={15} />
                    <span>ارسال مدارک برای تایید ادمین</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ================== ۲. فرم مشخصات و مطب پزشک ================== */}
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* تصویر پروفایل پزشک */}
        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 bg-gray-50/70 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100">
          <div className="relative shrink-0">
            <DoctorAvatar
              imageProfile={formData.avatar}
              firstName={formData.firstName}
              className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-md text-2xl sm:text-3xl shrink-0"
            />
          </div>
          <div className="flex-1 w-full text-center md:text-right">
            <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-1">
              تصویر پروفایل پزشک
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mb-3 sm:mb-4 leading-relaxed max-w-lg">
              تصویر شما پس از آپلود در دیتابیس ثبت شده و در کارت ویزیت و لیست
              پزشکان سامانه نمایش داده می‌شود.
            </p>
            <div className="w-full sm:max-w-xs mx-auto md:mx-0">
              <FileUpload
                label="انتخاب تصویر جدید"
                onUploadSuccess={handleAvatarUploadSuccess}
                acceptedTypes="image/jpeg,image/png,image/jpg"
              />
            </div>
          </div>
        </div>

        {/* اطلاعات فردی */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <User size={18} className="text-gadget-light" />
            اطلاعات فردی
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                نام *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                نام خانوادگی *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                سن
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
              />
            </div>
          </div>
        </div>

        {/* اطلاعات تماس و مطب */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Activity size={18} className="text-gadget-light" />
            اطلاعات تماس و نشانی مطب
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                شماره تلفن مطب / کلینیک
              </label>
              <div className="relative">
                <Phone
                  className="absolute right-3.5 top-3 text-gray-400"
                  size={16}
                />
                <input
                  type="tel"
                  name="clinicPhone"
                  value={formData.clinicPhone}
                  onChange={handleChange}
                  dir="ltr"
                  placeholder="021..."
                  className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light transition-colors text-left font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                آدرس مطب شخصی
              </label>
              <div className="relative">
                <MapPin
                  className="absolute right-3.5 top-3 text-gadget-light"
                  size={16}
                />
                <input
                  type="text"
                  name="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={handleChange}
                  placeholder="خیابان، پلاک، واحد..."
                  className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                آدرس سازمان / مرکز درمانی همکار
              </label>
              <div className="relative">
                <Building
                  className="absolute right-3.5 top-3 text-gadget-dark"
                  size={16}
                />
                <input
                  type="text"
                  name="orgAddress"
                  value={formData.orgAddress}
                  onChange={handleChange}
                  placeholder="نام کلینیک یا بیمارستان همکار..."
                  className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* دکمه ذخیره تغییرات */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white px-8 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {loading ? "در حال ذخیره اطلاعات..." : "ذخیره تغییرات"}
          </button>
        </div>
      </form>

      {/* ================== مودال نمایش تصویر در ابعاد اصلی ================== */}
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
          </div>
        </div>
      )}
    </div>
  );
}
