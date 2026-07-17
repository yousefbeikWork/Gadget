import { useState } from "react";
import { Stethoscope, FlaskConical, Compass } from "lucide-react";
import DoctorAppointments from "./DoctorAppointments";
import LabAppointments from "./LabAppointments";
import LeaderAppointments from "./LeaderAppointments";

export default function AppointmentsList() {
  const [activeTab, setActiveTab] = useState<"doctor" | "lab" | "leader">("doctor");

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-2 mb-6 bg-gray-50/50 p-1 rounded-xl border border-gray-100 w-full md:w-fit">
          <TabButton active={activeTab === "doctor"} onClick={() => setActiveTab("doctor")} icon={Stethoscope}>پزشک</TabButton>
          <TabButton active={activeTab === "lab"} onClick={() => setActiveTab("lab")} icon={FlaskConical}>آزمایشگاه</TabButton>
          <TabButton active={activeTab === "leader"} onClick={() => setActiveTab("leader")} icon={Compass}>لیدر</TabButton>
        </div>
        {activeTab === "doctor" && <DoctorAppointments filterDate={""} />}
        {activeTab === "lab" && <LabAppointments filterDate={""} />}
        {activeTab === "leader" && <LeaderAppointments />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }: any) {
  return (
    <button onClick={onClick} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${active ? "bg-white text-gadget-dark shadow-sm border border-gray-200/60" : "text-gray-500 hover:text-gray-700"}`}>
      <Icon size={16} /> {children}
    </button>
  );
}