import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Phone,
  CreditCard,
  CalendarDays,
  Loader2,
  CheckCircle2,
  Clock4,
  CalendarX2,
  PlusCircle,
  Activity,
  Calendar,
  MapPin,
  UserPlus,
} from "lucide-react";
import api from "../../services/api";

// ایمپورت‌های مربوط به تقویم شمسی
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import AddHealthRecordModal from "../../components/modals/forms/AddHealthRecordModal";
import CreateWalkInModal from "../../components/modals/forms/CreateWalkInModal";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

interface PatientItem {
  patientId: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile?: string;
  totalAppointments: number;
  lastAppointmentDate: string;
  lastAppointmentStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | string;
}

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [filterDate, setFilterDate] = useState("");
  const [locationType, setLocationType] = useState("");

  // استیت‌های مودال ثبت پرونده ویزیت
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState("");

  // 👈 استیت مودال نوبت بین مریض
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      let url = "/doctor/getDoctorPatients";
      const params = new URLSearchParams();
      if (filterDate) params.append("date", filterDate);
      if (locationType) params.append("locationType", locationType);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await api.get(url);

      if (response.data && response.data.success) {
        setPatients(response.data.patients || []);
      } else {
        setPatients([]);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setPatients([]);
        setError("");
      } else {
        setError(
          "خطا در دریافت لیست بیماران. لطفاً ارتباط با سرور را بررسی کنید.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [filterDate, locationType]);

  const filteredPatients = patients.filter(
    (p) =>
      p.firstName?.includes(searchTerm) ||
      p.lastName?.includes(searchTerm) ||
      p.nationalId?.includes(searchTerm),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-md text-[10px] font-bold border border-green-100">
            <CheckCircle2 size={12} /> تایید شده
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-md text-[10px] font-bold border border-orange-100">
            <Clock4 size={12} /> در انتظار
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-md text-[10px] font-bold border border-red-100">
            <CalendarX2 size={12} /> لغو شده
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "نامشخص";
    const date = new Date(isoString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openHealthRecordModal = (patient: PatientItem) => {
    setSelectedPatientId(patient.patientId);
    setSelectedPatientName(`${patient.firstName} ${patient.lastName}`);
    setIsRecordModalOpen(true);
  };

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 font-sans relative"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* ================== هدر صفحه و ابزارهای فیلتر ================== */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center justify-between w-full xl:w-auto gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gadget-light/10 text-gadget-light rounded-2xl">
                <Users size={28} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  لیست بیماران من
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  {patients.length > 0
                    ? `تعداد بیماران یافت شده: ${patients.length} نفر`
                    : "پرونده بیماران مطب شما"}
                </p>
              </div>
            </div>

            {/* دکمه نوبت بین مریض در موبایل */}
            <button
              onClick={() => setIsWalkInModalOpen(true)}
              className="flex xl:hidden items-center justify-center gap-1.5 bg-gadget-dark hover:bg-gadget-dark/90 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <UserPlus size={15} />
              <span>نوبت بین مریض</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2.5 w-full xl:w-auto">
            {/* دکمه نوبت بین مریض در دسکتاپ */}
            <button
              onClick={() => setIsWalkInModalOpen(true)}
              className="hidden xl:flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <UserPlus size={16} />
              <span>ثبت نوبت بین مریض</span>
            </button>

            {/* فیلتر تاریخ (شمسی) */}
            <div className="relative w-full sm:w-44 md:w-48">
              <Calendar
                className="absolute right-3 top-2.5 text-gray-400 z-10"
                size={16}
              />
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={filterDate ? new Date(filterDate) : ""}
                onChange={(date: any) => {
                  if (date && date.isValid) {
                    const jsDate = date.toDate();
                    const year = jsDate.getFullYear();
                    const month = String(jsDate.getMonth() + 1).padStart(
                      2,
                      "0",
                    );
                    const day = String(jsDate.getDate()).padStart(2, "0");
                    setFilterDate(`${year}-${month}-${day}`);
                  } else {
                    setFilterDate("");
                  }
                }}
                format="YYYY/MM/DD"
                containerClassName="w-full"
                inputClass="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm focus:border-gadget-light cursor-pointer text-gray-700 shadow-2xs"
                placeholder="فیلتر تاریخ..."
              />
            </div>

            {/* فیلتر نوع مکان */}
            <div className="relative w-full sm:w-40 md:w-44">
              <MapPin
                className="absolute right-3 top-2.5 text-gray-400 z-10"
                size={16}
              />
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm font-bold text-gray-700 focus:border-gadget-light cursor-pointer shadow-2xs"
              >
                <option value="">همه مکان‌ها</option>
                <option value="personal">مطب شخصی</option>
                <option value="clinic">کلینیک</option>
              </select>
            </div>

            {/* جستجوی متنی */}
            <div className="relative w-full sm:w-48 md:w-56">
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="جستجو (نام یا کدملی)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm focus:border-gadget-light shadow-2xs outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* ================== وضعیت‌های لودینگ و خطا ================== */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-3" size={38} />
            <p className="text-xs sm:text-sm font-bold text-gray-500">
              در حال دریافت پرونده بیماران...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center text-xs sm:text-sm font-bold border border-red-100 max-w-md mx-auto">
            {error}
          </div>
        )}

        {!loading && !error && filteredPatients.length === 0 && (
          <div className="bg-gray-50/70 p-12 rounded-3xl border border-dashed border-gray-200 text-center animate-in fade-in max-w-md mx-auto my-8">
            <div className="w-16 h-16 bg-white text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs border border-gray-100">
              <Users size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              بیماری یافت نشد
            </h3>
            <p className="text-gray-400 text-xs">
              بیماری با این مشخصات یا فیلترها در لیست بیماران مطب وجود ندارد.
            </p>
          </div>
        )}

        {/* ================== لیست کارت بیماران ================== */}
        {!loading && filteredPatients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-in fade-in duration-200">
            {filteredPatients.map((patient) => (
              <div
                key={patient.patientId}
                className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-3">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-gray-800">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mt-0.5">
                        <CreditCard size={13} />
                        <span dir="ltr">{patient.nationalId || "---"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-teal-50 w-11 h-11 rounded-xl text-teal-700 border border-teal-100 shrink-0">
                      <span className="text-base font-black leading-none">
                        {patient.totalAppointments || 0}
                      </span>
                      <span className="text-[9px] font-bold mt-1">مراجعه</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-gray-600 mb-5">
                    <div className="flex items-center justify-between bg-gray-50/80 px-3 py-2 rounded-xl border border-gray-100">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Phone size={14} /> تلفن تماس:
                      </span>
                      <strong className="font-mono text-gray-800" dir="ltr">
                        {patient.mobile || "ثبت نشده"}
                      </strong>
                    </div>

                    <div className="bg-orange-50/40 border border-orange-100/60 rounded-xl p-2.5">
                      <div className="flex items-center justify-between mb-1.5 text-gray-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={13} className="text-orange-400" />
                          آخرین مراجعه:
                        </span>
                        {getStatusBadge(patient.lastAppointmentStatus)}
                      </div>
                      <div className="text-xs font-bold text-gray-800">
                        {formatDate(patient.lastAppointmentDate)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => openHealthRecordModal(patient)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <PlusCircle size={15} />
                    <span>ثبت ویزیت</span>
                  </button>

                  <button
                    onClick={() =>
                      navigate("/health-records", {
                        state: {
                          patientId: patient.patientId,
                          patientName: `${patient.firstName} ${patient.lastName}`,
                        },
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Activity size={15} className="text-teal-600" />
                    <span>مشاهده پرونده</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================== مودال ثبت ویزیت ================== */}
      <AddHealthRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        patientId={selectedPatientId}
        patientName={selectedPatientName}
      />

      {/* ================== مودال ثبت نوبت بین مریض ================== */}
      <CreateWalkInModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        onSuccess={fetchPatients}
      />
    </div>
  );
}
