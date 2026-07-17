import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import DoctorSchedule from "./DoctorSchedule";
import LaboratorySchedule from "./LaboratorySchedule";
import LeaderSchedule from "./LeaderSchedule"; // 👈 ایمپورت کامپوننت جدید لیدر

export default function ScheduleManagement() {
  const { userRole, userProfile, isLoading } = useAuth();

  if (isLoading || !userProfile) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader2 className="animate-spin text-gadget-dark" size={40} />
      </div>
    );
  }

  // اگر نقش کاربر کلینیک یا پزشک بود
  if (userRole === "MedicalCenter" || userRole === "Doctor") {
    return <DoctorSchedule />;
  }

  // اگر نقش کاربر آزمایشگاه بود
  if (userRole === "laboratorCenter" || userRole === "LaboratoryCenter") {
    return <LaboratorySchedule />;
  }

  // 👈 اگر نقش کاربر لیدر بود، کامپوننت زمان‌بندی لیدر را رندر کن
  if (userRole === "Leader") {
    return <LeaderSchedule />;
  }

  return (
    <div className="text-center p-8 mt-20 font-bold text-gray-500">
      شما دسترسی لازم برای مشاهده این صفحه را ندارید.
    </div>
  );
}