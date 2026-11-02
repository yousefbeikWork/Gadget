import { useState, useEffect } from "react";
import {
  FileCheck,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import SecureImage from "../../common/SecureImage";
import FileDownload from "../../common/FileDownload";

interface PatientReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  onSubmitReview: (action: "APPROVE" | "REJECT", reason?: string) => Promise<void>;
  onPreviewImage: (fileName: string) => void;
  isSubmitting: boolean;
}

export default function PatientReviewModal({
  isOpen,
  onClose,
  patient,
  onSubmitReview,
  onPreviewImage,
  isSubmitting,
}: PatientReviewModalProps) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // 👈 ریست قطعی وضعیت فرم هنگام باز یا بسته شدن مودال
  useEffect(() => {
    if (isOpen && patient) {
      setShowRejectInput(false);
      setRejectReason(patient.nationalIdVerification?.rejectReason || "");
    } else {
      setShowRejectInput(false);
      setRejectReason("");
    }
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const verification = patient.nationalIdVerification || {};
  const hasUploadedFront = Boolean(verification.frontImage);

  const handleClose = () => {
    setShowRejectInput(false);
    setRejectReason("");
    onClose();
  };

  const renderBadge = () => {
    switch (verification.status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <CheckCircle2 size={12} /> تایید شده
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
            <XCircle size={12} /> رد شده
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse">
            در انتظار بررسی
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
            بارگذاری نشده
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-150">
        
        {/* هدر */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <FileCheck size={18} />
            </div>
            <h3 className="font-bold text-gray-800 text-sm sm:text-base">
              بررسی مدارک هویتی بیمار
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* محتوا */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 flex-1">
          {/* مشخصات بیمار */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-gray-500">نام بیمار: </span>
              <strong className="text-gray-900 font-bold">
                {patient.firstName} {patient.lastName}
              </strong>
            </div>
            <div>
              <span className="text-gray-500">کد ملی: </span>
              <strong className="text-gray-900 font-mono text-sm" dir="ltr">
                {patient.nationalId}
              </strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">وضعیت: </span>
              {renderBadge()}
            </div>
          </div>

          {/* علت رد قبلی در صورت وجود */}
          {verification.rejectReason && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">علت رد قبلی: </span>
                <span>{verification.rejectReason}</span>
              </div>
            </div>
          )}

          {/* تصاویر رو و پشت کارت ملی */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* روی کارت */}
            <div className="border border-gray-200 rounded-2xl p-3 space-y-3 bg-white flex flex-col justify-between shadow-2xs">
              <span className="text-xs font-bold text-gray-700 block">تصویر روی کارت ملی</span>
              {verification.frontImage ? (
                <div className="space-y-2.5">
                  <div className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                    <SecureImage fileName={verification.frontImage} alt="روی کارت ملی" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => onPreviewImage(verification.frontImage!)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-1.5 text-xs font-bold cursor-pointer"
                    >
                      <ExternalLink size={15} />
                      <span>مشاهده اندازه اصلی</span>
                    </button>
                  </div>
                  <FileDownload fileName={verification.frontImage} className="w-full justify-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold shadow-2xs" />
                </div>
              ) : (
                <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                  تصویر بارگذاری نشده است
                </div>
              )}
            </div>

            {/* پشت کارت */}
            <div className="border border-gray-200 rounded-2xl p-3 space-y-3 bg-white flex flex-col justify-between shadow-2xs">
              <span className="text-xs font-bold text-gray-700 block">تصویر پشت کارت ملی</span>
              {verification.backImage ? (
                <div className="space-y-2.5">
                  <div className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                    <SecureImage fileName={verification.backImage} alt="پشت کارت ملی" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => onPreviewImage(verification.backImage!)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-1.5 text-xs font-bold cursor-pointer"
                    >
                      <ExternalLink size={15} />
                      <span>مشاهده اندازه اصلی</span>
                    </button>
                  </div>
                  <FileDownload fileName={verification.backImage} className="w-full justify-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold shadow-2xs" />
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
                علت رد مدارک را بنویسید (برای بیمار نمایش داده می‌شود) *:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="مثال: عکس ناواضح است یا کدملی روی کارت با مشخصات ثبت‌نامی همخوانی ندارد..."
                className="w-full bg-white border border-rose-300 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-rose-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* فوتر */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            انصراف
          </button>

          <div className="flex items-center gap-2">
            {!showRejectInput ? (
              <>
                <button
                  type="button"
                  disabled={isSubmitting || !hasUploadedFront}
                  onClick={() => setShowRejectInput(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <XCircle size={15} /> رد مدارک
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !hasUploadedFront}
                  onClick={() => onSubmitReview("APPROVE")}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
                >
                  {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
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
                  انصراف از رد
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !rejectReason.trim()}
                  onClick={() => onSubmitReview("REJECT", rejectReason)}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
                >
                  {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                  <span>ثبت قطعی رد مدارک</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}