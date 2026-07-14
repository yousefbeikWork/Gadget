import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Phone, Lock, CreditCard, Users, ArrowRight } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function PatientForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    age: "",
    mobile: "",
    password: "",
    fatherName: "",
    gender: "MALE",
    maritalStatus: "SINGLE",
    guardianFirstName: "",
    guardianLastName: "",
    guardianNationalId: "",
    guardianMobile: "",
    guardianAddress: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ["nationalId", "mobile", "guardianNationalId", "guardianMobile", "age"];
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
      role: "Patient",
      mobile: toEnglishDigits(formData.mobile).trim(),
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      nationalId: toEnglishDigits(formData.nationalId).trim(),
      age: Number(toEnglishDigits(formData.age)) || 0,
      fatherName: formData.fatherName,
      gender: formData.gender,
      maritalStatus: formData.maritalStatus,
      guardian: {
        firstName: formData.guardianFirstName,
        lastName: formData.guardianLastName,
        nationalId: toEnglishDigits(formData.guardianNationalId).trim(),
        mobile: toEnglishDigits(formData.guardianMobile).trim(),
        address: formData.guardianAddress,
      },
    };

    const registerPromise = api.post("/auth/register", payload);

    toast.promise(registerPromise, {
      loading: "در حال ایجاد حساب کاربری...",
      success: (response) => {
        const { accessToken, refreshToken, role: userRole } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userRole", userRole);

        login(userRole);
        setTimeout(() => navigate("/"), 1000);
        return "ثبت‌نام با موفقیت انجام شد!";
      },
      error: (err) => err.response?.data?.error || err.response?.data?.message || "خطا در ثبت‌نام.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <h3 className="text-sm font-bold text-gadget-light border-b border-gray-100 pb-2 mb-2">اطلاعات هویتی و کاربری بیمار</h3>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام پدر</label>
          <input name="fatherName" value={formData.fatherName} onChange={handleChange} required type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">جنسیت</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-gadget-light outline-hidden cursor-pointer">
              <option value="MALE">مرد</option>
              <option value="FEMALE">زن</option>
              <option value="OTHER">سایر</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت تاهل</label>
            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-gadget-light outline-hidden cursor-pointer">
              <option value="SINGLE">مجرد</option>
              <option value="MARRIED">متاهل</option>
            </select>
          </div>
        </div>

        {/* بخش قیم */}
        <div className="md:col-span-2 border rounded-xl p-4 mt-2 border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <Users size={18} />
            <h3 className="text-sm font-bold">اطلاعات قیم بیمار</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">نام قیم</label>
              <input name="guardianFirstName" value={formData.guardianFirstName} onChange={handleChange} required type="text" className="w-full rounded-lg px-3 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">نام خانوادگی قیم</label>
              <input name="guardianLastName" value={formData.guardianLastName} onChange={handleChange} required type="text" className="w-full rounded-lg px-3 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">کد ملی قیم</label>
              <input name="guardianNationalId" maxLength={10} value={formData.guardianNationalId} onChange={handleChange} required type="text" className="w-full rounded-lg px-3 py-2 text-sm bg-white text-left border border-gray-200 focus:border-gadget-light outline-hidden" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">شماره موبایل قیم</label>
              <input name="guardianMobile" maxLength={11} value={formData.guardianMobile} onChange={handleChange} required type="tel" className="w-full rounded-lg px-3 py-2 text-sm bg-white text-left border border-gray-200 focus:border-gadget-light outline-hidden" dir="ltr" placeholder="09" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">آدرس سکونت قیم</label>
              <textarea name="guardianAddress" value={formData.guardianAddress} onChange={handleChange} required rows={2} className="w-full rounded-lg px-3 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden resize-none"></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-between items-center gap-4">
        <button type="button" disabled className="flex items-center justify-center gap-1.5 bg-gray-50 text-gray-400 border border-gray-200 px-5 py-3 rounded-xl text-sm font-bold cursor-not-allowed">
          <CreditCard size={18} />
          صدور کارت RFID (بزودی)
        </button>
        <button type="submit" className="w-full sm:w-auto sm:min-w-50 py-3 px-6 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-gadget-dark hover:bg-gadget-dark/90 text-white">
          تکمیل ثبت‌نام بیمار
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}