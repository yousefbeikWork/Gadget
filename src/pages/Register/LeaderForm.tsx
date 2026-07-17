import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Phone, Lock, CreditCard, MapPin, ArrowRight, /*Banknote,*/ Car, Building } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function LeaderForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    age: "",
    mobile: "",
    password: "",
    Address: "",
    city: "",
    // DailyPrice: "",
    hasCar: "false",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // عددی کردن مقادیر خاص
    const numericFields = ["nationalId", "mobile", "age", /*"DailyPrice"*/];
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
      role: "Leader", // ارسال نقش لیدر برای بک‌بند
      firstName: formData.firstName,
      lastName: formData.lastName,
      nationalId: toEnglishDigits(formData.nationalId).trim(),
      age: Number(toEnglishDigits(formData.age)) || 0,
      mobile: toEnglishDigits(formData.mobile).trim(),
      password: formData.password,
      Address: formData.Address,
      city: formData.city,
      // DailyPrice: Number(toEnglishDigits(formData.DailyPrice)) || 0,
      hasCar: formData.hasCar === "true", // تبدیل استرینگ آپشن به Boolean
    };

    const registerPromise = api.post("/auth/register", payload);

    toast.promise(registerPromise, {
      loading: "در حال ایجاد حساب لیدر...",
      success: (response) => {
        const { accessToken, refreshToken, role: userRole } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userRole", userRole);

        login(userRole);
        setTimeout(() => navigate("/"), 1000);
        return "ثبت‌نام لیدر با موفقیت انجام شد! حساب شما پس از بررسی مدارک فعال می‌شود.";
      },
      error: (err) => err.response?.data?.error || err.response?.data?.message || "خطا در ثبت‌نام لیدر.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <h3 className="text-sm font-bold text-amber-600 border-b border-gray-100 pb-2 mb-2">اطلاعات هویتی و امنیتی لیدر</h3>
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
            <input name="mobile" maxLength={11} value={formData.mobile} onChange={handleChange} required type="tel" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden" dir="ltr" placeholder="09..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input name="password" value={formData.password} onChange={handleChange} required type="password" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden" dir="ltr" />
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-sm font-bold text-amber-600 border-b border-gray-100 pb-2 mb-2 mt-4">اطلاعات ترابری و تدارکات</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">شهر محل فعالیت</label>
          <div className="relative">
            <Building className="absolute right-3 top-2.5 text-gray-400" size={16} />
            <input name="city" value={formData.city} onChange={handleChange} required type="text" className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light outline-hidden" placeholder=" تهران" />
          </div>
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">هزینه دستمزد روزانه (تومان)</label>
          <div className="relative">
            <Banknote className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input name="DailyPrice" value={formData.DailyPrice} onChange={handleChange} required type="text" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden" dir="ltr" placeholder="مبلغ به عدد" />
          </div>
        </div> */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت مالکیت خودرو</label>
          <div className="relative">
            <Car className="absolute right-3 top-3 text-gray-400" size={16} />
            <select name="hasCar" value={formData.hasCar} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light outline-hidden cursor-pointer">
              <option value="true">خودرو دارم (آماده ترابری بیمار)</option>
              <option value="false">خودرو ندارم</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">آدرس دقیق محل سکونت</label>
          <div className="relative">
            <MapPin className="absolute right-3 top-3 text-gray-400" size={16} />
            <textarea name="Address" value={formData.Address} onChange={handleChange} rows={2} required className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light outline-hidden resize-none"></textarea>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button type="submit" className="w-full sm:w-auto sm:min-w-50 py-3 px-6 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-gadget-dark hover:bg-gadget-dark/90 text-white">
          تکمیل ثبت‌نام لیدر
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}