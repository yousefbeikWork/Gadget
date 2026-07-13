import { useState, useEffect } from "react";
import { 
   Search, Phone, CreditCard, 
  Loader2, Activity, CalendarDays, FlaskConical, Beaker, ClipboardList
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

interface BookedPatient {
  patientId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  nationalId: string;
  // فیلدهای کمکی استخراج‌شده برای استفاده مستقیم در کارت
  testName: string;
  department: string;
  timeSlot: string;
  status: string;
}

export default function LaboratoryPatients() {
  const { userProfile } = useAuth();
  const [patients, setPatients] = useState<BookedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // پیش‌فرض تاریخ امروز سیستم
  const today = new Date();
  const [targetDate, setTargetDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );

  const fetchLabPatients = async () => {
    if (!userProfile?._id || !targetDate) return;
    
    try {
      setLoading(true);
      const response = await api.get(
        `/laboratory/getDailyReservations?date=${targetDate}&laboratoryId=${userProfile._id}`
      );
      
      if (response.data && response.data.reservations) {
        // فلت کردن آبجکت داینامیک تست‌ها به آرایه‌ای از بیماران
        const extractedPatients: BookedPatient[] = [];
        
        Object.keys(response.data.reservations).forEach((testKey) => {
          response.data.reservations[testKey].forEach((slot: any) => {
            if (slot.bookedPatients && slot.bookedPatients.length > 0) {
              slot.bookedPatients.forEach((patient: any) => {
                extractedPatients.push({
                  patientId: patient.patientId,
                  firstName: patient.firstName,
                  lastName: patient.lastName,
                  mobile: patient.mobile,
                  nationalId: patient.nationalId,
                  testName: slot.testName,
                  department: slot.department,
                  timeSlot: slot.time,
                  status: slot.status,
                });
              });
            }
          });
        });
        
        setPatients(extractedPatients);
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.error("خطا در دریافت لیست مراجعین آزمایشگاه:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabPatients();
  }, [targetDate, userProfile?._id]);

  const filteredPatients = patients.filter(p => 
    p.firstName?.includes(searchTerm) || 
    p.lastName?.includes(searchTerm) || 
    p.nationalId?.includes(searchTerm) ||
    p.testName?.includes(searchTerm)
  );

  const formatShamsi = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fa-IR", { 
      year: "numeric", month: "long", day: "numeric" 
    });
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans relative" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* ================== هدر صفحه و فیلترها ================== */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4 border-b border-gray-50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-gadget-dark rounded-2xl border border-blue-100">
              <FlaskConical size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">لیست پذیرش و بیماران آزمایشگاه</h1>
              <p className="text-gray-500 text-sm mt-1">
                {patients.length > 0 ? `تعداد مراجعین این تاریخ: ${patients.length} نفر` : "لیست رزرو روزانه بر اساس نوع آزمایش"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* انتخاب تاریخ پذیرش */}
            <div className="relative w-full sm:w-56">
              <CalendarDays className="absolute right-3 top-2.5 text-gray-400 z-10" size={18} />
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={targetDate ? new Date(targetDate) : ""}
                onChange={(date: any) => {
                  if (date && date.isValid) {
                    const jsDate = date.toDate();
                    setTargetDate(`${jsDate.getFullYear()}-${String(jsDate.getMonth() + 1).padStart(2, "0")}-${String(jsDate.getDate()).padStart(2, "0")}`);
                  }
                }}
                format="YYYY/MM/DD"
                containerClassName="w-full"
                inputClass="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors text-gray-700 font-medium shadow-2xs"
              />
            </div>

            {/* باکس جستجو */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="جستجوی نام، کد ملی یا نوع تست..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* ================== لودینگ و خطا ================== */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال بارگذاری لیست بیماران روز...</p>
          </div>
        )}

        {!loading && filteredPatients.length === 0 && (
          <div className="bg-gray-50 p-12 rounded-2xl border border-dashed border-gray-200 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-white text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Beaker size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">هیچ بیماری یافت نشد</h3>
            <p className="text-gray-500 text-sm">برای تاریخ {formatShamsi(targetDate)} رزرو یا نوبتی در سیستم ثبت نشده است.</p>
          </div>
        )}

        {/* ================== لیست کارت مراجعین آزمایشگاه ================== */}
        {!loading && filteredPatients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {filteredPatients.map((patient, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gadget-dark opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                  <div className="flex items-start justify-between border-b border-gray-50 pb-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-gadget-dark transition-colors">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <CreditCard size={14} className="text-gray-400" />
                        <span>کد ملی: </span>
                        <span dir="ltr" className="font-medium">{patient.nationalId}</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 text-gadget-dark px-3 py-1.5 rounded-xl font-bold text-xs" dir="ltr">
                      {patient.timeSlot}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100/50 font-sans" dir="ltr">
                      <Phone size={15} className="text-gray-400 shrink-0" />
                      <span className="w-full text-right font-medium">{patient.mobile}</span>
                    </div>

                    <div className="bg-gray-50/70 border border-gray-200/60 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1.5"><Activity size={14} className="text-blue-500"/> نوع آزمایش:</span>
                        <span className="font-bold text-gray-800">{patient.testName}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2">
                        <span className="text-gray-500 flex items-center gap-1.5"><ClipboardList size={14} className="text-gray-400"/> بخش آزمایشگاهی:</span>
                        <span className="font-medium text-gray-600">{patient.department}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>تاریخ پذیرش: {formatShamsi(targetDate)}</span>
                  <span className="bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-md border border-orange-100">
                    {patient.status === "PENDING" ? "پذیرش اولیه" : "تایید شده"}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}