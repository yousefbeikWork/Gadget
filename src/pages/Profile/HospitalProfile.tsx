import { Building2, Users } from "lucide-react";
import CenterDocumentsSection from "./components/CenterDocumentsSection";

interface Props {
  userProfile: any;
  refreshProfile: () => Promise<void>;
}

export default function HospitalProfile({
  userProfile,
  refreshProfile,
}: Props) {
  const getHospitalType = (type?: string) => {
    switch (type) {
      case "PRIVATE":
        return "خصوصی";
      case "PUBLIC":
        return "دولتی";
      case "CHARITY":
        return "خیریه";
      default:
        return type || "---";
    }
  };

  const getEstablishmentDate = (dateString?: string) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  return (
    <div
      className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 font-sans"
      dir="rtl"
    >
      {/* ================= ۱. کامپوننت هوشمند مدارک بیمارستان ================= */}

      {/* ================= ۲. مشخصات ثبت‌شده بیمارستان ================= */}
      <div className="space-y-4 bg-white border border-gray-200/80 p-5 rounded-2xl sm:rounded-3xl shadow-2xs">
        <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <Building2 size={18} className="text-gadget-light" />
          مشخصات ثبتی بیمارستان
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              نوع مالکیت
            </label>
            <div className="w-full bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-bold">
              {getHospitalType(userProfile?.hospitalType)}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              تاریخ تاسیس
            </label>
            <div className="w-full bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800">
              {getEstablishmentDate(userProfile?.establishmentDate)}
            </div>
          </div>
          <div className="md:col-span-2">
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
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              موبایل اورژانس / کشیک
            </label>
            <div
              className="w-full bg-rose-50/60 border border-rose-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-rose-700 font-mono font-bold"
              dir="ltr"
            >
              {userProfile?.emergencyMobile || "---"}
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              آدرس کامل
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
          مشخصات مدیر / مسئول فنی بیمارستان
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              ایمیل مدیر
            </label>
            <div
              className="w-full bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-mono truncate"
              dir="ltr"
              title={userProfile?.manager?.email}
            >
              {userProfile?.manager?.email || "---"}
            </div>
          </div>
        </div>
      </div>
      <CenterDocumentsSection
        userProfile={userProfile}
        refreshProfile={refreshProfile}
        updateEndpoint="/Hospital/updateHospitalDocuments"
        centerTypeName="بیمارستان"
      />
    </div>
  );
}
