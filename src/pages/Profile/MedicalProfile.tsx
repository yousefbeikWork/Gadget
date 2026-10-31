import { Stethoscope, Users } from "lucide-react";
import CenterDocumentsSection from "./components/CenterDocumentsSection";

interface Props {
  userProfile: any;
  refreshProfile: () => Promise<void>;
}

export default function MedicalProfile({ userProfile, refreshProfile }: Props) {
  return (
    <div
      className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 font-sans"
      dir="rtl"
    >
      {/* ================= ۱. وضعیت و بارگذاری ۳ مدرک اصلی مرکز درمانی ================= */}
      <CenterDocumentsSection
        userProfile={userProfile}
        refreshProfile={refreshProfile}
        updateEndpoint="/clinic/updateClinicDocuments"
        centerTypeName="مرکز درمانی"
        extraPayload={{ clinicId: userProfile?._id }}
      />

      {/* ================= ۲. مشخصات ثبتی کلینیک ================= */}
      <div className="space-y-4 bg-white border border-gray-200/80 p-5 rounded-2xl sm:rounded-3xl shadow-2xs">
        <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <Stethoscope size={18} className="text-gadget-light" />
          مشخصات ثبت‌شده مرکز
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              نام مرکز درمانی
            </label>
            <div className="w-full bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-800">
              {userProfile?.centerName || "---"}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              کد پروانه / مجوز
            </label>
            <div
              className="w-full bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-mono"
              dir="ltr"
            >
              {userProfile?.licenseCode || "---"}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              تخصص اصلی
            </label>
            <div className="w-full bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-bold">
              {userProfile?.specialty || "---"}
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              شماره‌های تماس پذیرش
            </label>
            <div
              className="w-full bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-mono"
              dir="ltr"
            >
              {userProfile?.phones?.join(" ، ") || "---"}
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              آدرس کامل مرکز
            </label>
            <div className="w-full bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-700 leading-relaxed">
              {userProfile?.address || "---"}
            </div>
          </div>
        </div>
      </div>

      {/* ================= ۳. مشخصات مدیر / مسئول فنی ================= */}
      <div className="space-y-4 bg-white border border-gray-200/80 p-5 rounded-2xl sm:rounded-3xl shadow-2xs">
        <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <Users size={18} className="text-gadget-light" />
          مشخصات مدیر / مسئول فنی
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              نام کامل مدیر
            </label>
            <div className="w-full bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-800">
              {userProfile?.manager?.firstName} {userProfile?.manager?.lastName}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              کد ملی
            </label>
            <div
              className="w-full bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-mono"
              dir="ltr"
            >
              {userProfile?.manager?.nationalId || "---"}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              شماره تماس مدیر
            </label>
            <div
              className="w-full bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-mono"
              dir="ltr"
            >
              {userProfile?.manager?.mobile || "---"}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}