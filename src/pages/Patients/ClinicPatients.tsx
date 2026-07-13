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
  User,
  Building2,
} from "lucide-react";
import api from "../../services/api";
import AddHealthRecordModal from "../../components/AddHealthRecordModal";
import { useAuth } from "../../context/AuthContext";

interface ClinicDoctor {
  _id: string; 
  firstName: string;
  lastName: string;
  Expertise?: string;
}

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

export default function ClinicPatients() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  // استیت‌های پزشکان کلینیک
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // مراجعین و فیلترها
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState("");

  // ۱. دریافت لیست پزشکان اختصاصی کلینیک
  useEffect(() => {
    const fetchClinicDoctors = async () => {
      // اگر هنوز پروفایل کاربر کامل بارگذاری نشده، صبوری می‌کنیم اما لودینگ را نمی‌بندیم
      if (!userProfile?._id) return;

      try {
        setLoadingDoctors(true);
        setError("");

        const payload = {
          clinicId: userProfile._id,
        };

        const response = await api.post("/doctor/listDctorsClinic", payload);

        // 👈 اصلاح دقیق بر اساس دیتای ارسالی سرور شما (response.data.doctors)
        const docsList = response.data?.doctors || [];
        setDoctors(docsList);

        if (docsList.length > 0) {
          setSelectedDoctorId(docsList[0]._id || "");
        }
      } catch (err) {
        console.error("خطا در دریافت لیست پزشکان کلینیک:", err);
        setError("خطا در دریافت لیست پزشکان کلینیک.");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchClinicDoctors();
  }, [userProfile?._id]); 

  // ۲. دریافت مراجعین پزشک انتخاب شده
  useEffect(() => {
    const fetchPatientsByDoctor = async () => {
      if (!selectedDoctorId) {
        setPatients([]);
        return;
      }

      try {
        setLoadingPatients(true);
        setError("");

        const response = await api.get(
          `/doctor/getDoctorPatients?doctorId=${selectedDoctorId}`,
        );

        if (response.data && response.data.success) {
          setPatients(response.data.patients || []);
        } else {
          setPatients([]);
        }
      } catch (err) {
        setPatients([]);
        console.error("خطا در دریافت لیست مراجعین:", err);
        setError("خطا در دریافت لیست مراجعین این پزشک.");
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatientsByDoctor();
  }, [selectedDoctorId]);

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
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans relative" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* هدر صفحه و ابزارهای فیلتر */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4 border-b border-gray-50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
              <Building2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">مدیریت بیماران کلینیک</h1>
              <p className="text-gray-500 text-sm mt-1">
                مشاهده پرونده مراجعین و مدیریت ویزیت پزشکان کلینیک
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* سلکت باکس انتخاب پزشک کلینیک */}
            <div className="relative w-full sm:w-64">
              <User className="absolute right-3 top-3 text-gray-400 z-10" size={16} />
              
              {loadingDoctors && !userProfile?._id ? (
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm text-gray-400 flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> در انتظار اطلاعات کلینیک...
                </div>
              ) : loadingDoctors ? (
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm text-gray-400 flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> در حال لود پزشکان...
                </div>
              ) : (
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors cursor-pointer shadow-2xs"
                >
                  {doctors.length === 0 && <option value="">پزشکی یافت نشد</option>}
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      دکتر {doc.firstName} {doc.lastName} ({doc.Expertise || "پزشک عمومی"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* باکس جستجوی بیمار */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="جستجوی نام یا کد ملی بیمار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* وضعیت‌های بارگذاری و خطا مربوط به بیماران */}
        {loadingPatients && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال دریافت پرونده بیماران پزشک...</p>
          </div>
        )}

        {error && !loadingPatients && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {!loadingPatients && !error && filteredPatients.length === 0 && (
          <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-white text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">بیماری یافت نشد</h3>
            <p className="text-gray-500 text-sm">برای این پزشک پرونده یا نوبت مراجعه‌ای یافت نشد.</p>
          </div>
        )}

        {/* لیست کارت مراجعین کلینیک */}
        {!loadingPatients && filteredPatients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
            {filteredPatients.map((patient) => (
              <div key={patient.patientId} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col group relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gadget-light opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <CreditCard size={14} className="text-gray-400" />
                      <span>کد ملی: </span>
                      <span dir="ltr" className="font-medium">{patient.nationalId || "---"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-blue-50 w-12 h-12 rounded-xl text-blue-600 border border-blue-100 shrink-0">
                    <span className="text-lg font-bold leading-none">{patient.totalAppointments || 0}</span>
                    <span className="text-[9px] font-medium mt-1">مراجعه</span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <Phone size={16} className="text-gray-400 shrink-0" />
                    <span className="font-medium" dir="ltr">{patient.mobile || "ثبت نشده"}</span>
                  </div>

                  <div className="bg-orange-50/50 border border-orange-100/50 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <CalendarDays size={14} className="text-orange-400" />
                      <span>آخرین نوبت درمانگاه:</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        {formatDate(patient.lastAppointmentDate)}
                      </div>
                      {getStatusBadge(patient.lastAppointmentStatus)}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => openHealthRecordModal(patient)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <PlusCircle size={16} />
                    ثبت ویزیت
                  </button>

                  <button
                    onClick={() => navigate("/health-records", { state: { patientId: patient.patientId } })}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200 hover:border-gadget-light hover:text-gadget-light text-gray-600 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Activity size={16} />
                    مشاهده پرونده
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <AddHealthRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        patientId={selectedPatientId}
        patientName={selectedPatientName}
      />
    </div>
  );
}