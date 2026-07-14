import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Stethoscope, Building2, UserPlus, ShieldAlert } from "lucide-react";
import PatientForm from "./PatientForm";
import DoctorForm from "./DoctorForm";
import LeaderForm from "./LeaderForm";

type Role = "Patient" | "Doctor" | "Leader";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("Patient");

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 py-10" dir="rtl">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* هدر ثابت صفحه */}
        <div className="bg-linear-to-r from-gadget-dark to-gadget-light p-6 text-center shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/20">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="relative z-10 text-2xl font-bold text-white mb-1">تشکیل پرونده و ثبت‌نام</h1>
          <p className="relative z-10 text-gray-100 text-sm">لطفاً نوع کاربری خود را انتخاب کرده و اطلاعات را تکمیل نمایید</p>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* ================= انتخاب نقش (تب‌ها) ================= */}
          <div className="flex flex-wrap md:flex-nowrap bg-gray-50 border border-gray-100 p-1.5 rounded-xl mb-8 gap-1">
            <button
              type="button"
              onClick={() => setRole("Patient")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                role === "Patient" ? "bg-white text-gadget-dark shadow-xs ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User size={18} />
              <span>بیمار</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("Doctor")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                role === "Doctor" ? "bg-white text-gadget-light shadow-xs ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Stethoscope size={18} />
              <span>پزشک</span>
            </button>

            {/* 👈 تب جدید لیدر */}
            <button
              type="button"
              onClick={() => setRole("Leader")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                role === "Leader" ? "bg-white text-amber-600 shadow-xs ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ShieldAlert size={18} />
              <span>لیدر سیستم</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/register-clinic")}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg text-gray-500 hover:text-gadget-dark transition-all cursor-pointer"
            >
              <Building2 size={18} />
              <span>مرکز درمانی</span>
            </button>
          </div>

          {/* ================= رندر فرم مربوطه ================= */}
          {role === "Patient" && <PatientForm />}
          {role === "Doctor" && <DoctorForm />}
          {role === "Leader" && <LeaderForm />}

          {/* ================= فوتر صفحه ================= */}
          <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-50 pt-6">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link to="/login" className="text-gadget-dark font-bold hover:underline">وارد شوید</Link>
          </div>
        </div>
      </div>
    </div>
  );
}