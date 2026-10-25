import { useState } from "react";
import {
  FileCheck,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Car,
  CreditCard,
} from "lucide-react";
import SecureImage from "./SecureImage";

interface LeaderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  leader: any;
  onSubmitReview: (action: "APPROVE" | "REJECT", reason?: string) => Promise<void>;
  onPreviewImage: (fileName: string) => void;
  isSubmitting: boolean;
}

export default function LeaderReviewModal({
  isOpen,
  onClose,
  leader,
  onSubmitReview,
  onPreviewImage,
  isSubmitting,
}: LeaderReviewModalProps) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState(
    leader?.nationalIdVerification?.rejectReason || ""
  );

  if (!isOpen || !leader) return null;

  const idCards = [
    {
      title: "۱. روی کارت ملی",
      file: leader.nationalIdVerification?.frontImage || leader.nationalIdPhotos?.front,
    },
    {
      title: "۲. پشت کارت ملی",
      file: leader.nationalIdVerification?.backImage || leader.nationalIdPhotos?.back,
    },
  ];

  const carDocs = [
    {
      title: "۳. روی کارت خودرو",
      file: leader.car?.documents?.vehicleCardFront,
    },
    {
      title: "۴. پشت کارت خودرو",
      file: leader.car?.documents?.vehicleCardBack,
    },
    {
      title: "۵. بیمه‌نامه شخص ثالث",
      file: leader.car?.documents?.insurancePhoto,
    },
    {
      title: "۶. روی گواهینامه رانندگی",
      file: leader.car?.documents?.drivingLicenseFront,
    },
    {
      title: "۷. پشت گواهینامه رانندگی",
      file: leader.car?.documents?.drivingLicenseBack,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-150">
        {/* هدر */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/90 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <FileCheck size={20} />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">
                بررسی مدارک لیدر: {leader.firstName} {leader.lastName}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                شهر فعالیت: {leader.city} • وضعیت ترابری: {leader.hasCar ? "دارای خودرو" : "بدون خودرو"}
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

        {/* محتوای مدارک */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          {/* مشخصات لیدر و خودرو */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50 border border-gray-200/70 p-3.5 rounded-2xl text-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">کد ملی:</span>
              <strong className="font-mono text-gray-800" dir="ltr">
                {leader.nationalId || "---"}
              </strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">شماره تماس:</span>
              <strong className="font-mono text-gray-800" dir="ltr">
                {leader.mobile || "---"}
              </strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">سن:</span>
              <strong className="text-gray-800">{leader.age} سال</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">وضعیت حساب:</span>
              <strong className={leader.isActive ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                {leader.isActive ? "فعال" : "غیرفعال"}
              </strong>
            </div>

            {leader.hasCar && leader.car && (
              <div className="col-span-2 sm:col-span-4 border-t border-gray-200/60 pt-2 mt-1 flex flex-wrap items-center gap-3 text-gray-600">
                <span className="flex items-center gap-1 font-bold text-gray-700">
                  <Car size={13} className="text-amber-500" /> خودرو:
                </span>
                <span>
                  {leader.car.brand} {leader.car.model} ({leader.car.color})
                </span>
                <span>پلاک: {leader.car.plateNumber}</span>
                <span>مدل سال: {leader.car.manufactureYear}</span>
              </div>
            )}
          </div>

          {/* بخش مدارک شناسایی */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <CreditCard size={15} className="text-teal-600" />
              مدارک شناسایی و کارت ملی
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {idCards.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-2xl p-3 bg-white space-y-2 flex flex-col justify-between shadow-2xs"
                >
                  <span className="text-xs font-bold text-gray-700">{item.title}</span>
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
                        <ExternalLink size={15} /> مشاهده اندازه کامل
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                      تصویر بارگذاری نشده است
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* بخش مدارک خودرو (در صورت داشتن خودرو) */}
          {leader.hasCar && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <Car size={15} className="text-amber-500" />
                مدارک و مستندات ترابری خودرو
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {carDocs.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-2xl p-3 bg-white space-y-2 flex flex-col justify-between shadow-2xs"
                  >
                    <span className="text-xs font-bold text-gray-700">{item.title}</span>
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
                          <ExternalLink size={15} /> مشاهده اندازه کامل
                        </button>
                      </div>
                    ) : (
                      <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                        تصویر بارگذاری نشده است
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* فرم وارد کردن علت رد مدرک */}
          {showRejectInput && (
            <div className="bg-rose-50/80 border border-rose-200 p-3.5 rounded-2xl space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-rose-900">
                علت رد مدارک را بنویسید (برای لیدر ارسال خواهد شد) *:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="مثال: عکس کارت ملی تار است، بیمه‌نامه خودرو منقضی شده..."
                className="w-full bg-white border border-rose-300 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-rose-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* فوتر عملیات تایید یا رد */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
          <div></div>

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
                  disabled={
                    isSubmitting ||
                    !leader.nationalIdVerification?.frontImage && !leader.nationalIdPhotos?.front
                  }
                  onClick={() => onSubmitReview("APPROVE")}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  <span>تایید مدارک و فعال‌سازی لیدر</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectInput(false)}
                  className="text-xs text-gray-500 font-bold px-2 hover:underline cursor-pointer"
                >
                  انصراف 
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