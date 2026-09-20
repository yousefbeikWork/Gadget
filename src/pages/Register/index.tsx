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
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-3 sm:p-4 py-8 md:py-10" dir="rtl">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100">
        
        {/* هدر ثابت صفحه */}
        <div className="bg-linear-to-r from-gadget-dark to-gadget-light p-6 md:p-8 text-center shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center mb-3 md:mb-4 border border-white/20 shadow-inner">
            <UserPlus className="text-white" size={28} />
          </div>
          <h1 className="relative z-10 text-xl md:text-2xl font-black text-white mb-1">تشکیل پرونده و ثبت‌نام</h1>
          <p className="relative z-10 text-gray-100 text-xs md:text-sm">لطفاً نوع کاربری خود را انتخاب کرده و اطلاعات را تکمیل نمایید</p>
        </div>

        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar">
          {/* ================= انتخاب نقش (گرید ۲×۲ در موبایل و تک‌ردیف در دسکتاپ) ================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 bg-gray-100/70 border border-gray-200/60 p-1.5 rounded-2xl mb-8 gap-1.5">
            
            {/* تب بیمار */}
            <button
              type="button"
              onClick={() => setRole("Patient")}
              className={`flex items-center justify-center gap-2 py-2.5 md:py-3 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                role === "Patient"
                  ? "bg-white text-gadget-dark shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              <User size={17} className="shrink-0" />
              <span>بیمار</span>
            </button>

            {/* تب پزشک */}
            <button
              type="button"
              onClick={() => setRole("Doctor")}
              className={`flex items-center justify-center gap-2 py-2.5 md:py-3 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                role === "Doctor"
                  ? "bg-white text-gadget-light shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              <Stethoscope size={17} className="shrink-0" />
              <span>پزشک</span>
            </button>

            {/* تب لیدر سیستم */}
            <button
              type="button"
              onClick={() => setRole("Leader")}
              className={`flex items-center justify-center gap-2 py-2.5 md:py-3 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                role === "Leader"
                  ? "bg-white text-amber-600 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              <ShieldAlert size={17} className="shrink-0" />
              <span>لیدر سیستم</span>
            </button>

            {/* تب مرکز درمانی */}
            <button
              type="button"
              onClick={() => navigate("/register-clinic")}
              className="flex items-center justify-center gap-2 py-2.5 md:py-3 px-3 text-xs sm:text-sm font-bold rounded-xl text-gray-500 hover:text-gadget-dark hover:bg-white/50 transition-all cursor-pointer"
            >
              <Building2 size={17} className="shrink-0" />
              <span>مرکز درمانی</span>
            </button>

          </div>

          {/* ================= رندر فرم مربوطه ================= */}
          {role === "Patient" && <PatientForm />}
          {role === "Doctor" && <DoctorForm />}
          {role === "Leader" && <LeaderForm />}

          {/* ================= فوتر صفحه ================= */}
          <div className="mt-8 text-center text-xs sm:text-sm text-gray-600 border-t border-gray-100 pt-6">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link to="/login" className="text-gadget-dark font-bold hover:underline">
              وارد شوید
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}