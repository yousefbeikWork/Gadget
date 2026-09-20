import { useState } from "react";
import { CalendarDays, Search, Stethoscope, FlaskConical, Compass, X } from "lucide-react";
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
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-3 sm:p-5 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
        
        {/* ================= هدر صفحه و فیلتر تاریخ ================= */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          {/* عنوان و آیکون */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gadget-dark/10 text-gadget-dark rounded-2xl flex items-center justify-center shrink-0">
              <CalendarDays size={24} className="sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-gray-800">نوبت‌های من</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">مدیریت قرارهای ملاقات، آزمایشات و لیدرها</p>
            </div>
          </div>

          {/* فیلتر تاریخ ریسپانسیو */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
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
                inputClass="w-full bg-gray-50/80 border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white cursor-pointer shadow-2xs font-medium text-gray-700 transition-colors"
                placeholder="فیلتر بر اساس تاریخ..."
              />
            </div>

            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0 border border-red-100"
                title="پاک کردن فیلتر تاریخ"
              >
                <X size={14} />
                <span className="hidden sm:inline">لغو فیلتر</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= تب‌های انتخاب نوع نوبت ================= */}
        <div className="grid grid-cols-3 md:flex gap-1.5 bg-gray-100/70 border border-gray-200/60 p-1.5 rounded-2xl w-full md:w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("doctor")}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "doctor"
                ? "bg-white text-gadget-dark shadow-xs ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
          >
            <Stethoscope size={16} className="shrink-0" />
            <span>پزشک</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lab")}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "lab"
                ? "bg-white text-gadget-dark shadow-xs ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
          >
            <FlaskConical size={16} className="shrink-0" />
            <span>آزمایشگاه</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("leader")}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "leader"
                ? "bg-white text-gadget-dark shadow-xs ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
          >
            <Compass size={16} className="shrink-0" />
            <span>لیدر</span>
          </button>
        </div>

        {/* ================= محتوای تب فعال ================= */}
        <div className="pt-1">
          {activeTab === "doctor" && <DoctorAppointments filterDate={filterDate} />}
          {activeTab === "lab" && <LabAppointments filterDate={filterDate} />}
          {activeTab === "leader" && <LeaderAppointments filterDate={filterDate} />}
        </div>

      </div>
    </div>
  );
}