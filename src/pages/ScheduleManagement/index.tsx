import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import DoctorSchedule from "./DoctorSchedule";
import LaboratorySchedule from "./LaboratorySchedule";

export default function ScheduleManagement() {
  const { userRole, userProfile, isLoading } = useAuth();

  if (isLoading || !userProfile) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader2 className="animate-spin text-gadget-dark" size={40} />
      </div>
    );
  }

  // اگر نقش کاربر کلینیک یا پزشک بود، کامپوننت قبلی را نشان بده
  if (userRole === "MedicalCenter" || userRole === "Doctor") {
    return <DoctorSchedule />;
  }

  // اگر نقش کاربر آزمایشگاه بود، کامپوننت جدید را نشان بده
  if (userRole === "laboratorCenter" || userRole === "LaboratoryCenter") {
    return <LaboratorySchedule />;
  }

  return (
    <div className="text-center p-8 mt-20 font-bold text-gray-500">
      شما دسترسی لازم برای مشاهده این صفحه را ندارید.
    </div>
  );
}