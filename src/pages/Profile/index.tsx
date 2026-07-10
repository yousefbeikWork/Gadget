import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

// ایمپورت کامپوننت‌های اختصاصی هر نقش
import PatientProfile from "./PatientProfile";
import DoctorProfile from "./DoctorProfile";
import MedicalProfile from "./MedicalProfile";
import LaboratoryProfile from "./LaboratoryProfile";
import SharedBasicInfo from "./components/SharedBasicInfo"; // 👈 کامپوننت مشترک را هم ایمپورت کردیم

export default function Profile() {
  // 👈 اضافه کردن refreshProfile به اینجا
  const { userRole, userProfile, isLoading, refreshProfile } = useAuth();

  if (isLoading || !userProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-gadget-dark" size={40} />
      </div>
    );
  }

  // انتخاب کامپوننت بر اساس نقش و پاس دادن پراپ‌های درست
  const renderProfileContent = () => {
    switch (userRole) {
      case "Patient":
        return <PatientProfile userProfile={userProfile} refreshProfile={refreshProfile} />;
      case "Doctor":
        return <DoctorProfile userProfile={userProfile} refreshProfile={refreshProfile} />;
      case "MedicalCenter":
        return <MedicalProfile userProfile={userProfile} refreshProfile={refreshProfile} />;
      case "laboratorCenter":
        return <LaboratoryProfile userProfile={userProfile} refreshProfile={refreshProfile} />;
      default:
        return <div className="text-center p-8">نقش کاربری نامشخص است.</div>;
    }
  };

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ================== هدر صفحه ================== */}
        <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {userRole === "MedicalCenter" || userRole === "laboratorCenter"
                ? "پروفایل و مدارک مرکز"
                : "حساب کاربری من"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">مشاهده و مدیریت اطلاعات کاربری</p>
          </div>
        </div>

        {/* 👈 بخش اطلاعات مشترک که برای همه نقش‌ها نمایش داده می‌شود */}
        <SharedBasicInfo userProfile={userProfile} userRole={userRole} />

        {/* رندر شدن داینامیک محتوای اختصاصی هر نقش */}
        {renderProfileContent()}
      </div>
    </div>
  );
}