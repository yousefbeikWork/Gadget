import { ShieldCheck, Lock } from "lucide-react";

interface Props {
  userProfile: any; 
  userRole: string | null;
}

export default function SharedBasicInfo({ userProfile, userRole }: Props) {
  return (
    <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4 font-sans">
      <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
        <ShieldCheck size={18} className="text-gray-400" />
        اطلاعات سیستمی (غیرقابل تغییر)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        
        {/* بخش نقش کاربری */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            نقش کاربری
          </label>
          <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
            <span>
              {userRole === "Doctor"
                ? "پزشک"
                : userRole === "Patient"
                  ? "بیمار"
                  : userRole === "laboratorCenter"
                    ? "مرکز آزمایشگاهی"
                    : userRole === "Leader"
                      ? "لیدر سیستم" // 👈 اضافه شدن ترجمه نقش لیدر
                      : "مرکز درمانی"}
            </span>
            <Lock size={14} className="opacity-50" />
          </div>
        </div>

        {/* شماره موبایل سیستم */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            شماره موبایل سیستم
          </label>
          <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
            <span dir="ltr">{userProfile?.mobile || "---"}</span>
            <Lock size={14} className="opacity-50" />
          </div>
        </div>

        {/* فیلد داینامیک نام مرکز یا کد ملی */}
        {userRole === "MedicalCenter" || userRole === "laboratorCenter" ? (
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">
              نام ثبت شده در سامانه
            </label>
            <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
              <span>{userProfile?.centerName || "---"}</span>
              <Lock size={14} className="opacity-50" />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              کد ملی / اتباع
            </label>
            <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
              <span dir="ltr">{userProfile?.nationalId || "---"}</span>
              <Lock size={14} className="opacity-50" />
            </div>
          </div>
        )}

        {/* اطلاعات اختصاصی نظام پزشکی برای پزشکان */}
        {userRole === "Doctor" && (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                شماره نظام پزشکی
              </label>
              <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                <span dir="ltr">
                  {userProfile?.medicalCouncilCode || "---"}
                </span>
                <Lock size={14} className="opacity-50" />
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold text-gray-500 mb-1">
                تخصص ثبت شده
              </label>
              <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                <span>{userProfile?.Expertise || "---"}</span>
                <Lock size={14} className="opacity-50" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}