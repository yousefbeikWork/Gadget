import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Phone,
  Award,
  Loader2,
  UserPlus,
  User,
  Calendar as CalendarIcon,
  ArrowRight,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AddClinicDoctorModal from "../components/AddClinicDoctorModal";

interface ClinicDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  Expertise: string;
  age: number;
  medicalCouncilCode: string;
  clinicPhone: string;
  clinicAddress: string;
  orgAddress: string;
  isActive: boolean;
}

export default function ManageHospitalClinic() {
  const { clinicId } = useParams<{ clinicId: string }>();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClinicDoctors = useCallback(async () => {
    if (!clinicId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/doctor/listDctorsClinic", {
        clinicId: clinicId,
      });

      if (response.data && response.data.success) {
        setDoctors(response.data.data || response.data.doctors || []);
      } else {
        throw new Error("داده‌ای یافت نشد");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "خطا در دریافت لیست پزشکان کلینیک"
      );
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchClinicDoctors();
  }, [fetchClinicDoctors]);

  const filteredDoctors = doctors.filter((doc) => {
    const fullName = `${doc.firstName} ${doc.lastName}`;
    return (
      fullName.includes(searchTerm) ||
      (doc.Expertise && doc.Expertise.includes(searchTerm))
    );
  });

  return (
    <div
      className="flex-1 bg-gray-50 md:rounded-3xl border border-gray-100 p-6 md:p-8 overflow-y-auto custom-scrollbar font-sans w-full h-full"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ================== هدر یکپارچه و زیبا ================== */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          
          {/* سمت راست: دکمه بازگشت و عنوان */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/hospital-clinics")}
              className="flex items-center justify-center w-11 h-11 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl hover:bg-gadget-dark hover:border-gadget-dark hover:text-white transition-all cursor-pointer shrink-0 shadow-2xs"
              title="بازگشت به لیست کلینیک‌ها"
            >
              <ArrowRight size={22} />
            </button>
            <div className="p-3 bg-blue-50 text-blue-800 rounded-2xl hidden sm:flex shrink-0">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-800">
                پزشکان فعال کلینیک
              </h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">
                مشاهده و تخصیص پزشک به این بخش
              </p>
            </div>
          </div>

          {/* سمت چپ: جستجو و دکمه افزودن (در یک خط) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* سرچ باکس */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="جستجوی نام یا تخصص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark focus:bg-white transition-all shadow-2xs text-gray-700"
              />
            </div>
            
            {/* دکمه افزودن */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
            >
              <Plus size={18} />
              افزودن پزشک جدید
            </button>
          </div>
        </div>

        {/* ================== مدیریت وضعیت لودینگ و خطا ================== */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-dark flex-1">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-bold text-gray-500">در حال دریافت لیست پزشکان...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center text-sm font-bold border border-red-100 max-w-md mx-auto mt-10">
            {error}
            <button onClick={fetchClinicDoctors} className="block mt-4 mx-auto bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors cursor-pointer">
              تلاش مجدد
            </button>
          </div>
        ) : filteredDoctors.length > 0 ? (
          
          /* ================== لیست کارت پزشکان ================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col h-full group relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${doctor.isActive ? "bg-green-500" : "bg-amber-400"}`}
                ></div>

                <div className="flex items-center gap-4 mb-5 border-b border-gray-100 pb-4 mt-2">
                  <div className="w-14 h-14 bg-gadget-light/10 text-gadget-light rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    {doctor.firstName ? doctor.firstName[0] : <User size={24} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-lg text-gray-800 truncate">
                      دکتر {doctor.firstName} {doctor.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block bg-gadget-light/10 text-gadget-light text-[10px] font-bold px-2 py-0.5 rounded-md truncate">
                        {doctor.Expertise || "تخصص ثبت نشده"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 flex-1 mb-6">
                  <div className="flex items-center gap-2 text-sm bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                    <Award className="text-gray-400 shrink-0" size={16} />
                    <span className="text-gray-600 font-medium">
                      نظام پزشکی:{" "}
                      <span className="text-gray-800 font-bold" dir="ltr">
                        {doctor.medicalCouncilCode || "---"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                    <Phone className="text-gray-400 shrink-0" size={16} />
                    <span className="text-gray-600 font-bold" dir="ltr">
                      {doctor.mobile || "---"}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <button
                    onClick={() =>
                      navigate("/schedule", {
                        state: { doctorId: doctor._id, clinicId: clinicId },
                      })
                    }
                    className="w-full flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    <CalendarIcon size={16} />
                    برنامه‌ریزی و ثبت نوبت
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ================== حالت خالی ================== */
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center mt-4">
            <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <UserPlus size={36} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              هیچ پزشکی در این کلینیک یافت نشد
            </h3>
            <p className="text-sm text-gray-500">
              برای شروع، روی دکمه «افزودن پزشک جدید» کلیک کنید تا کادر درمان خود را تکمیل نمایید.
            </p>
          </div>
        )}
      </div>

      <AddClinicDoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClinicDoctors}
        existingDoctorIds={doctors.map((doc) => doc._id)}
        clinicId={clinicId}
      />
    </div>
  );
}