import { useState } from "react";
import {
  FileCheck,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  User,
  Building,
} from "lucide-react";
import SecureImage from "./SecureImage";

interface CenterReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  center: any;
  centerType: "Hospital" | "MedicalCenter" | "LaboratoryCenter";
  onSubmitReview: (action: "APPROVE" | "REJECT", reason?: string) => Promise<void>;
  onPreviewImage: (fileName: string) => void;
  isSubmitting: boolean;
}

export default function CenterReviewModal({
  isOpen,
  onClose,
  center,
  centerType,
  onSubmitReview,
  onPreviewImage,
  isSubmitting,
}: CenterReviewModalProps) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState(
    center?.documents?.rejectReason || ""
  );

  if (!isOpen || !center) return null;

  const docs = center.documents || {};
  const managerIdFiles: string[] = Array.isArray(docs.managerIdFiles)
    ? docs.managerIdFiles
    : [];

  const centerTitle =
    center.hospitalName || center.centerName || center.name || "مرکز درمانی";

  // استخراج ۳ مدرک اصلی و قانونی مرکز
  const requiredCards = [
    {
      title: `۱. پروانه کسب / بهره‌برداری ${centerType === "Hospital" ? "بیمارستان" : centerType === "LaboratoryCenter" ? "آزمایشگاه" : "کلینیک"} *`,
      file: docs.exploitationLicenseFile,
      icon: <ShieldCheck size={16} className="text-emerald-600" />,
    },
    {
      title: "۲. تصویر روی کارت ملی مدیر مسئول *",
      file: managerIdFiles[0] || center.nationalIdVerification?.frontImage,
      icon: <User size={16} className="text-teal-600" />,
    },
    {
      title: "۳. تصویر پشت کارت ملی مدیر مسئول *",
      file: managerIdFiles[1] || center.nationalIdVerification?.backImage,
      icon: <User size={16} className="text-teal-600" />,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-150">
        
        {/* ================= هدر مودال ================= */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/90 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Building size={20} />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">
                بررسی مدارک {centerTitle}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                نوع مرکز: {centerType === "Hospital" ? "بیمارستان" : centerType === "LaboratoryCenter" ? "آزمایشگاه" : "کلینیک"} • کد پروانه: {center.licenseCode || "---"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= محتوای مشخصات و اسناد ================= */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          
          {/* مشخصات مدیریتی و تماس */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50 border border-gray-200/70 p-3.5 rounded-2xl text-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">مدیر / مسئول فنی:</span>
              <strong className="text-gray-800">
                {center.manager ? `${center.manager.firstName} ${center.manager.lastName}` : "---"}
              </strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">کد ملی مدیر:</span>
              <strong className="font-mono text-gray-800" dir="ltr">
                {center.manager?.nationalId || "---"}
              </strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">شماره تماس:</span>
              <strong className="font-mono text-gray-800" dir="ltr">
                {center.phones?.[0] || center.mobile || "---"}
              </strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">وضعیت حساب:</span>
              <strong className={center.isActive ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                {center.isActive ? "فعال" : "غیرفعال"}
              </strong>
            </div>
          </div>

          {/* گرید ۳ مدرک ارسالی مرکز */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <FileCheck size={16} className="text-teal-600" />
              مدارک هویتی و پروانه ارسالی مرکز
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {requiredCards.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-2xl p-3 bg-white space-y-2 flex flex-col justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {item.icon}
                    <span className="text-xs font-bold text-gray-700 truncate" title={item.title}>
                      {item.title}
                    </span>
                  </div>

                  {item.file ? (
                    <div className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                      <SecureImage
                        fileName={item.file}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => onPreviewImage(item.file!)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1 transition-opacity cursor-pointer"
                      >
                        <ExternalLink size={15} /> مشاهده کامل
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                      مدرک بارگذاری نشده است
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* کادر ثبت دلیل رد مدرک */}
          {showRejectInput && (
            <div className="bg-rose-50/80 border border-rose-200 p-3.5 rounded-2xl space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-rose-900">
                علت رد مدارک را بنویسید (الزامی) *:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="مثال: تصویر پروانه بهره‌برداری ناخوانا است یا کد ملی با مشخصات همخوانی ندارد..."
                className="w-full bg-white border border-rose-300 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-rose-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* ================= فوتر اکشن‌ها ================= */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-100"
          >
            انصراف
          </button>

          <div className="flex items-center gap-2">
            {!showRejectInput ? (
              <>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowRejectInput(true)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <XCircle size={15} /> رد مدارک
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !docs.exploitationLicenseFile}
                  onClick={() => onSubmitReview("APPROVE")}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  <span>تایید و فعال‌سازی مرکز</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectInput(false)}
                  className="text-xs text-gray-500 font-bold px-2 hover:underline cursor-pointer"
                >
                  انصراف از رد
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !rejectReason.trim()}
                  onClick={() => onSubmitReview("REJECT", rejectReason)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <XCircle size={15} />
                  )}
                  ثبت قطعی رد مدارک
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}