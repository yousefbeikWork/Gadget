import { useState } from "react";
import { CalendarDays, Search, Stethoscope, FlaskConical, Compass } from "lucide-react";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// ایمپورت کامپوننت‌های فرزند
import DoctorAppointments from "./DoctorAppointments";
import LabAppointments from "./LabAppointments";
import LeaderAppointments from "./LeaderAppointments";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

export default function AppointmentsList() {
  const [activeTab, setActiveTab] = useState<"doctor" | "lab" | "leader">("doctor");
  const [filterDate, setFilterDate] = useState("");

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        {/* ================= هدر صفحه و فیلتر ================= */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 border-b border-gray-50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
              <CalendarDays size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">نوبت‌های من</h1>
              <p className="text-gray-500 text-sm mt-1">مدیریت قرارهای ملاقات، آزمایشات و لیدرها</p>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={filterDate ? new Date(filterDate) : ""}
                onChange={(date: any) => {
                  if (date && date.isValid) {
                    const jsDate = date.toDate();
                    const year = jsDate.getFullYear();
                    const month = String(jsDate.getMonth() + 1).padStart(2, "0");
                    const day = String(jsDate.getDate()).padStart(2, "0");
                    setFilterDate(`${year}-${month}-${day}`);
                  } else {
                    setFilterDate("");
                  }
                }}
                format="YYYY/MM/DD"
                containerClassName="w-full"
                inputClass="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light cursor-pointer shadow-sm font-medium text-gray-700"
                placeholder="انتخاب تاریخ از تقویم..."
              />
            </div>
            {filterDate && (
              <button onClick={() => setFilterDate("")} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0">
                لغو فیلتر
              </button>
            )}
          </div>
        </div>

        {/* ================= تب‌ها ================= */}
        <div className="flex flex-wrap gap-2 mb-6 bg-gray-50/50 p-1 rounded-xl border border-gray-100 w-full md:w-fit">
          <button onClick={() => setActiveTab("doctor")} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "doctor" ? "bg-white text-gadget-dark shadow-sm border border-gray-200/60" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
            <Stethoscope size={16} /> پزشک
          </button>
          <button onClick={() => setActiveTab("lab")} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "lab" ? "bg-white text-gadget-dark shadow-sm border border-gray-200/60" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
            <FlaskConical size={16} /> آزمایشگاه
          </button>
          <button onClick={() => setActiveTab("leader")} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "leader" ? "bg-white text-gadget-dark shadow-sm border border-gray-200/60" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
            <Compass size={16} /> لیدر
          </button>
        </div>

        {/* ================= محتوای تب‌ها ================= */}
        {activeTab === "doctor" && <DoctorAppointments filterDate={filterDate} />}
        {activeTab === "lab" && <LabAppointments filterDate={filterDate} />}
        {activeTab === "leader" && <LeaderAppointments filterDate={filterDate} />}

      </div>
    </div>
  );
}