import { useState } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  Loader2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  X,
  UploadCloud,
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";
import FileUpload from "../../../components/FileUpload";
import SecureImage from "../../../components/SecureImage";

interface CenterDocumentsSectionProps {
  userProfile: any;
  refreshProfile: () => Promise<void>;
  updateEndpoint: string; // اندپوینت ارسال فرم (مثلاً: /Hospital/updateHospitalDocuments)
  centerTypeName?: string; // عنوان مرکز (بیمارستان / مرکز درمانی / آزمایشگاه)
  extraPayload?: Record<string, any>; // فیلدهای اضافی پی‌لود در صورت نیاز
}

export default function CenterDocumentsSection({
  userProfile,
  refreshProfile,
  updateEndpoint,
  centerTypeName = "مرکز",
  extraPayload = {},
}: CenterDocumentsSectionProps) {
  const [docsLoading, setDocsLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewImageName, setPreviewImageName] = useState<string | null>(null);

  // فقط ۳ فایل مورد نیاز: پروانه + پشت و روی کارت ملی مدیر
  const [docs, setDocs] = useState({
    exploitationLicenseFile: "",
    managerIdFront: "",
    managerIdBack: "",
  });

  const handleUploadSuccess =
    (field: keyof typeof docs) => (minioObjectName: string) => {
      setDocs((prev) => ({ ...prev, [field]: minioObjectName }));
    };

  const handleUploadRemove = (field: keyof typeof docs) => () => {
    setDocs((prev) => ({ ...prev, [field]: "" }));
  };

  // ارسال ۳ مدرک هویتی و پروانه به سرور
  const handleSubmitDocs = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!docs.exploitationLicenseFile || !docs.managerIdFront || !docs.managerIdBack) {
      toast.error("لطفاً تصویر هر ۳ مدرک (پروانه و پشت/روی کارت ملی مدیر) را بارگذاری فرمایید.");
      return;
    }

    setDocsLoading(true);
    const toastId = toast.loading(`در حال ثبت و ارسال مدارک ${centerTypeName}...`);

    try {
      const payload = {
        ...extraPayload,
        exploitationLicenseFile: docs.exploitationLicenseFile,
        managerIdFiles: [docs.managerIdFront, docs.managerIdBack],
      };

      const response = await api.post(updateEndpoint, payload);

      toast.success(
        response.data?.message || `مدارک ${centerTypeName} با موفقیت ثبت شد و در انتظار بررسی است.`,
        { id: toastId }
      );

      setIsUploadOpen(false);
      setDocs({ exploitationLicenseFile: "", managerIdFront: "", managerIdBack: "" });
      await refreshProfile();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.response?.data?.error || "خطا در ثبت مدارک. لطفاً دوباره تلاش کنید.",
        { id: toastId }
      );
    } finally {
      setDocsLoading(false);
    }
  };

  // استخراج وضعیت و علت رد مدارک
  const docData = userProfile?.documents;
  const docStatus = userProfile?.isActive ? "APPROVED" : docData?.status || "NOT_UPLOADED";
  const rejectReason = docData?.rejectReason;

  const managerIdFiles: string[] = Array.isArray(docData?.managerIdFiles)
    ? docData.managerIdFiles
    : [];

  const existingFiles = [
    { title: `پروانه کسب / بهره‌برداری ${centerTypeName}`, file: docData?.exploitationLicenseFile },
    { title: "روی کارت ملی مدیر / مسئول فنی", file: managerIdFiles[0] || userProfile?.nationalIdVerification?.frontImage },
    { title: "پشت کارت ملی مدیر / مسئول فنی", file: managerIdFiles[1] || userProfile?.nationalIdVerification?.backImage },
  ].filter((item) => !!item.file);

  const hasUploadedDocs = existingFiles.length > 0;

  return (
    <div className="space-y-5 font-sans" dir="rtl">
      
      {/* ================= ۱. وضعیت تاییدیه مدارک ================= */}
      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all ${
          docStatus === "APPROVED"
            ? "bg-emerald-50/70 border-emerald-200"
            : docStatus === "PENDING"
            ? "bg-blue-50/70 border-blue-200"
            : docStatus === "REJECTED"
            ? "bg-rose-50/80 border-rose-200"
            : "bg-amber-50/80 border-amber-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 sm:p-3 rounded-2xl shrink-0 shadow-2xs ${
                docStatus === "APPROVED"
                  ? "bg-emerald-500 text-white"
                  : docStatus === "PENDING"
                  ? "bg-blue-500 text-white"
                  : docStatus === "REJECTED"
                  ? "bg-rose-500 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              {docStatus === "APPROVED" ? (
                <ShieldCheck size={22} className="sm:w-6 sm:h-6" />
              ) : docStatus === "REJECTED" ? (
                <XCircle size={22} className="sm:w-6 sm:h-6" />
              ) : docStatus === "PENDING" ? (
                <Clock size={22} className="sm:w-6 sm:h-6" />
              ) : (
                <AlertCircle size={22} className="sm:w-6 sm:h-6" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-gray-900">
                  وضعیت مجوزها و مدارک {centerTypeName}
                </h3>

                {docStatus === "APPROVED" && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={12} /> مدارک تایید شده و فعال
                  </span>
                )}
                {docStatus === "PENDING" && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                    <Clock size={12} /> در صف بررسی کارشناس
                  </span>
                )}
                {docStatus === "REJECTED" && (
                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <XCircle size={12} /> مدارک رد شده
                  </span>
                )}
                {docStatus === "NOT_UPLOADED" && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <AlertCircle size={12} /> در انتظار بارگذاری مدارک
                  </span>
                )}
              </div>

              <p className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-relaxed">
                {docStatus === "APPROVED" &&
                  `پروانه بهره‌برداری و مدارک هویتی مدیر ${centerTypeName} تایید شده و حساب شما در سامانه فعال است.`}
                {docStatus === "PENDING" &&
                  `تصاویر پروانه و کارت ملی مدیر در صف بررسی کارشناسان ادمین قرار دارد. حساب تا زمان تایید در حالت غیرفعال می‌ماند.`}
                {docStatus === "REJECTED" && (
                  <span className="text-rose-800">
                    {rejectReason ? (
                      <>
                        <strong>علت رد مدارک: </strong>
                        {rejectReason}
                      </>
                    ) : (
                      "مدارک بارگذاری‌شده ناخوانا بوده یا با مشخصات مطابقت ندارد. لطفاً مدارک جدید بارگذاری کنید."
                    )}
                  </span>
                )}
                {docStatus === "NOT_UPLOADED" &&
                  `جهت فعال‌سازی حساب کاربری ${centerTypeName}، ارسال تصویر پروانه بهره‌برداری و کارت ملی مدیر الزامی است.`}
              </p>
            </div>
          </div>

          {(docStatus === "REJECTED" || docStatus === "NOT_UPLOADED") && (
            <button
              type="button"
              onClick={() => setIsUploadOpen(!isUploadOpen)}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw size={14} className={isUploadOpen ? "rotate-180 transition-transform" : ""} />
              <span>{isUploadOpen ? "بستن فرم آپلود" : "بارگذاری مدارک"}</span>
            </button>
          )}
        </div>

        {/* ================= نمایش مدارک ثبت‌شده فعلی ================= */}
        {hasUploadedDocs && (
          <div className="mt-4 pt-4 border-t border-gray-200/60">
            <span className="text-[11px] font-bold text-gray-700 block mb-2.5">
              مدارک ثبت‌شده در پرونده:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {existingFiles.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                      <SecureImage fileName={item.file} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-bold text-gray-800 truncate">{item.title}</span>
                      <span className="block text-[10px] text-gray-400 font-mono truncate" dir="ltr">
                        {item.file}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewImageName(item.file!)}
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="مشاهده اندازه اصلی"
                  >
                    <ExternalLink size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= ۲. فرم آپلود ۳ مدرک (فقط در صورت نیاز به آپلود) ================= */}
      {(isUploadOpen || (!userProfile?.isActive && !hasUploadedDocs)) && (
        <form onSubmit={handleSubmitDocs} className="space-y-4 bg-white border border-gray-200/90 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xs animate-in fade-in">
          <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileCheck size={18} className="text-gadget-dark" />
            بارگذاری پروانه و مدارک هویتی مدیر {centerTypeName}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-200/80">
              <FileUpload
                label={`پروانه کسب / بهره‌برداری ${centerTypeName} *`}
                onUploadSuccess={handleUploadSuccess("exploitationLicenseFile")}
                onRemove={handleUploadRemove("exploitationLicenseFile")}
                acceptedTypes="image/jpeg,image/png,image/jpg"
              />
            </div>

            <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-200/80">
              <FileUpload
                label="تصویر روی کارت ملی مدیر *"
                onUploadSuccess={handleUploadSuccess("managerIdFront")}
                onRemove={handleUploadRemove("managerIdFront")}
                acceptedTypes="image/jpeg,image/png,image/jpg"
              />
            </div>

            <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-200/80">
              <FileUpload
                label="تصویر پشت کارت ملی مدیر *"
                onUploadSuccess={handleUploadSuccess("managerIdBack")}
                onRemove={handleUploadRemove("managerIdBack")}
                acceptedTypes="image/jpeg,image/png,image/jpg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={docsLoading}
              className="w-full sm:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 px-8 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {docsLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>در حال ارسال...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>ارسال مدارک برای تایید ادمین</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ================= ۳. مودال پیش‌نمایش تمام‌صفحه تصویر مدرک ================= */}
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
              <h4 className="text-xs sm:text-sm font-bold text-gray-800">پیش‌نمایش مدرک</h4>
              <button
                type="button"
                onClick={() => setPreviewImageName(null)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <SecureImage fileName={previewImageName} className="w-full h-full object-contain" />
            </div>

            <div className="flex justify-end pt-1">
              
            </div>
          </div>
        </div>
      )}

    </div>
  );
}