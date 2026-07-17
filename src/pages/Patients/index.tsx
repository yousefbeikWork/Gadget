import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import DoctorPatients from "./DoctorPatients";
import LaboratoryPatients from "./LaboratoryPatients";
import ClinicPatients from "./ClinicPatients";
import LeaderPatients from "./LeaderPatients";

export default function Patients() {
  const { userRole, userProfile, isLoading } = useAuth();

  if (isLoading || !userProfile) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader2 className="animate-spin text-gadget-dark" size={40} />
      </div>
    );
  }

  // نمایش بر اساس تفکیک نقش‌ها
  if (userRole === "Doctor") {
    return <DoctorPatients />;
  }

  if (userRole === "laboratorCenter" || userRole === "LaboratoryCenter") {
    return <LaboratoryPatients />;
  }

  if (userRole === "MedicalCenter") {
    return <ClinicPatients />;
  }

  if (userRole === "Leader") {
    return <LeaderPatients />;
  }

  return (
    <div className="text-center p-8 mt-20 font-bold text-gray-500 font-sans" dir="rtl">
      شما دسترسی لازم برای مشاهده لیست بیماران/رزروها را ندارید.
    </div>
  );
}