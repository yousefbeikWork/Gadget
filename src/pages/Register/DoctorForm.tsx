import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Phone, Lock, CreditCard, MapPin, ArrowRight } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const medicalSpecialties = [
  "پزشک عمومی", "دندانپزشک", "متخصص قلب و عروق", "متخصص مغز و اعصاب",
  "متخصص زنان و زایمان", "متخصص اطفال", "متخصص پوست، مو و زیبایی",
  "متخصص چشم‌پزشکی", "متخصص گوش، حلق و بینی", "متخصص ارتوپدی",
  "متخصص داخلی", "متخصص گوارش و کبد", "متخصص غدد و متابولیسم",
  "متخصص کلیه و مجاری ادراری (اورولوژی)", "متخصص ریه",
  "متخصص بیماری‌های عفونی", "روان‌پزشک (اعصاب و روان)",
  "جراح عمومی", "جراح پلاستیک و زیبایی", "رادیولوژی و سونوگرافی",
  "فیزیوتراپی و توانبخشی", "تغذیه و رژیم‌درمانی", "علوم آزمایشگاهی", "سایر موارد"
];

export default function DoctorForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    age: "",
    mobile: "",
    password: "",
    medicalCouncilCode: "",
    Expertise: "",
    clinicPhone: "",
    orgAddress: "",
    clinicAddress: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ["nationalId", "mobile", "clinicPhone", "medicalCouncilCode", "age"];
    const finalValue = numericFields.includes(name) ? value.replace(/\D/g, "") : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const toEnglishDigits = (str: string) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str.split("").map((c) => (persianNumbers.includes(c) ? persianNumbers.indexOf(c) : c)).join("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      role: "Doctor",
      mobile: toEnglishDigits(formData.mobile).trim(),
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      nationalId: toEnglishDigits(formData.nationalId).trim(),
      age: Number(toEnglishDigits(formData.age)) || 0,
      medicalCouncilCode: formData.medicalCouncilCode,
      Expertise: formData.Expertise,
      clinicPhone: toEnglishDigits(formData.clinicPhone).trim(),
      orgAddress: formData.orgAddress,
      clinicAddress: formData.clinicAddress,
    };

    const registerPromise = api.post("/auth/register", payload);

    toast.promise(registerPromise, {
      loading: "در حال ایجاد حساب پزشک...",
      success: (response) => {
        const { accessToken, refreshToken, role: userRole } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userRole", userRole);

        login(userRole);
        setTimeout(() => navigate("/"), 1000);
        return "ثبت‌نام پزشک با موفقیت انجام شد!";
      },
      error: (err) => err.response?.data?.error || err.response?.data?.message || "خطا در ثبت‌نام پزشک.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <h3 className="text-sm font-bold text-gadget-light border-b border-gray-100 pb-2 mb-2">اطلاعات هویتی و کاربری</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
          <div className="relative">
            <User className="absolute right-3 top-2.5 text-gray-400" size={16} />
            <input name="firstName" value={formData.firstName} onChange={handleChange} required type="text" className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light outline-hidden" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
          <input name="lastName" value={formData.lastName} onChange={handleChange} required type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">کد ملی</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input name="nationalId" maxLength={10} value={formData.nationalId} onChange={handleChange} required type="text" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden" dir="ltr" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">سن</label>
          <input name="age" value={formData.age} onChange={handleChange} required type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input name="mobile" maxLength={11} value={formData.mobile} onChange={handleChange} required type="tel" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden" dir="ltr" placeholder="0912..." />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input name="password" value={formData.password} onChange={handleChange} required type="password" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden" dir="ltr" />
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <h3 className="text-sm font-bold text-gadget-light border-b border-gray-100 pb-2 mb-2">اطلاعات تخصصی و کاری</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">کد نظام پزشکی</label>
          <input name="medicalCouncilCode" value={formData.medicalCouncilCode} onChange={handleChange} required type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">تخصص پزشکی</label>
          <div className="relative">
            <select name="Expertise" value={formData.Expertise} onChange={handleChange} required className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light transition-colors appearance-none cursor-pointer ${!formData.Expertise ? "text-gray-400" : "text-gray-800"}`}>
              <option value="" disabled>لطفاً تخصص خود را انتخاب کنید...</option>
              {medicalSpecialties.map((specialty, index) => (
                <option key={index} value={specialty} className="text-gray-800">{specialty}</option>
              ))}
            </select>
            <div className="absolute left-4 top-3.5 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس مطب / مرکز</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input name="clinicPhone" value={formData.clinicPhone} onChange={handleChange} required type="tel" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden" dir="ltr" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">آدرس سازمان / بیمارستان</label>
          <div className="relative">
            <MapPin className="absolute right-3 top-3 text-gray-400" size={16} />
            <textarea name="orgAddress" value={formData.orgAddress} onChange={handleChange} rows={2} required className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light outline-hidden resize-none"></textarea>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">آدرس مطب شخصی</label>
          <div className="relative">
            <MapPin className="absolute right-3 top-3 text-gray-400" size={16} />
            <textarea name="clinicAddress" value={formData.clinicAddress} onChange={handleChange} rows={2} required className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light outline-hidden resize-none"></textarea>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button type="submit" className="w-full sm:w-auto sm:min-w-50 py-3 px-6 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-gadget-dark hover:bg-gadget-dark/90 text-white">
          تکمیل ثبت‌نام پزشک
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}