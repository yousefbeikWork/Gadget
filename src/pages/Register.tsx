import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  User,
  Stethoscope,
  Building2,
  UserPlus,
  ArrowRight,
  Phone,
  Lock,
  CreditCard,
  MapPin,
} from "lucide-react";
import api from "../services/api";

// نقش‌ها دقیقاً معادل چیزی که بک‌اند انتظار دارد تنظیم شدند
type Role = "Patient" | "Doctor" | "Hospital";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<Role>("Doctor"); // پیش‌فرض روی پزشک

  // استیت فرم (فقط فیلدهای مورد نیاز پزشک متصل شده‌اند)
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toEnglishDigits = (str: string) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str
      .split("")
      .map((c) => (persianNumbers.includes(c) ? persianNumbers.indexOf(c) : c))
      .join("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // اگر نقش پزشک نبود، فعلاً ریکوئست نمی‌زنیم
    if (role !== "Doctor") {
      toast("این بخش در حال توسعه است. فعلاً فقط ثبت‌نام پزشک فعال است.", {
        icon: "🛠️",
      });
      return;
    }

    const payload = {
      ...formData,
      role: role,
      mobile: toEnglishDigits(formData.mobile).trim(),
      nationalId: toEnglishDigits(formData.nationalId).trim(),
      age: Number(toEnglishDigits(formData.age)) || 0,
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
      error: (err) => {
        return (
          err.response?.data?.error ||
          err.response?.data?.message ||
          "خطا در ثبت‌نام."
        );
      },
    });
  };

  return (
    <div
      className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 py-10"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* هدر فرم */}
        <div className="bg-linear-to-r from-gadget-dark to-gadget-light p-6 text-center shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/20">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="relative z-10 text-2xl font-bold text-white mb-1">
            تشکیل پرونده و ثبت‌نام
          </h1>
          <p className="relative z-10 text-gray-100 text-sm">
            لطفاً نوع کاربری خود را انتخاب کرده و اطلاعات را تکمیل نمایید
          </p>
        </div>

        {/* بخش محتوای اسکرول‌خور */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* انتخابگر نقش */}
          <div className="flex bg-gray-50 border border-gray-100 p-1.5 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setRole("Patient")}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                role === "Patient"
                  ? "bg-white text-gadget-dark shadow-sm ring-1 ring-gray-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <User size={18} />
              <span>
                بیمار{" "}
                <span className="hidden md:inline font-normal text-xs opacity-70">
                  (حقیقی)
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole("Doctor")}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                role === "Doctor"
                  ? "bg-white text-gadget-light shadow-sm ring-1 ring-gray-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Stethoscope size={18} />
              <span>
                پزشک{" "}
                <span className="hidden md:inline font-normal text-xs opacity-70">
                  (متخصص)
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole("Hospital")}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                role === "Hospital"
                  ? "bg-white text-gadget-dark shadow-sm ring-1 ring-gray-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Building2 size={18} />
              <span>
                مرکز درمانی{" "}
                <span className="hidden md:inline font-normal text-xs opacity-70">
                  (حقوقی)
                </span>
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* ================= فیلدهای اختصاصی پزشک متصل به بک‌اند ================= */}
              {role === "Doctor" && (
                <>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-gadget-light border-b border-gray-100 pb-2 mb-2">
                      اطلاعات هویتی و کاربری
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام
                    </label>
                    <div className="relative">
                      <User
                        className="absolute right-3 top-2.5 text-gray-400"
                        size={16}
                      />
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        type="text"
                        className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام خانوادگی
                    </label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      کد ملی
                    </label>
                    <div className="relative">
                      <CreditCard
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={16}
                      />
                      <input
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleChange}
                        required
                        type="text"
                        className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      سن
                    </label>
                    <input
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      type="number"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شماره موبایل
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={16}
                      />
                      <input
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                        type="tel"
                        className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light text-left"
                        dir="ltr"
                        placeholder="0912..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رمز عبور
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={16}
                      />
                      <input
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        type="password"
                        className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <h3 className="text-sm font-bold text-gadget-light border-b border-gray-100 pb-2 mb-2">
                      اطلاعات تخصصی و کاری
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      کد نظام پزشکی
                    </label>
                    <input
                      name="medicalCouncilCode"
                      value={formData.medicalCouncilCode}
                      onChange={handleChange}
                      required
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تخصص (Expertise)
                    </label>
                    <div className="relative">
                      <Stethoscope
                        className="absolute right-3 top-2.5 text-gray-400"
                        size={16}
                      />
                      <input
                        name="Expertise"
                        value={formData.Expertise}
                        onChange={handleChange}
                        required
                        type="text"
                        className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شماره تماس مطب / مرکز
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={16}
                      />
                      <input
                        name="clinicPhone"
                        value={formData.clinicPhone}
                        onChange={handleChange}
                        required
                        type="tel"
                        className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      آدرس سازمان / بیمارستان
                    </label>
                    <div className="relative">
                      <MapPin
                        className="absolute right-3 top-3 text-gray-400"
                        size={16}
                      />
                      <textarea
                        name="orgAddress"
                        value={formData.orgAddress}
                        onChange={handleChange}
                        rows={2}
                        required
                        className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light"
                      ></textarea>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      آدرس مطب شخصی
                    </label>
                    <div className="relative">
                      <MapPin
                        className="absolute right-3 top-3 text-gray-400"
                        size={16}
                      />
                      <textarea
                        name="clinicAddress"
                        value={formData.clinicAddress}
                        onChange={handleChange}
                        rows={2}
                        required
                        className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light"
                      ></textarea>
                    </div>
                  </div>
                </>
              )}

              {/* ================= فیلدهای نمایشی بیمار ================= */}
              {role === "Patient" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      کد ملی / کد اتباع
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام پدر
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شماره موبایل
                    </label>
                    <input
                      type="tel"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left"
                      dir="ltr"
                      placeholder="0912..."
                    />
                  </div>
                  <div className="md:col-span-2 border-t border-gray-100 pt-5 mt-2">
                    <h3 className="text-sm font-bold text-gadget-dark mb-1">
                      ثبت مشخصات قیم
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      در صورت نیاز به ثبت اطلاعات قیم، فیلدهای زیر را تکمیل
                      کنید.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام و نام خانوادگی قیم
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شماره موبایل قیم
                    </label>
                    <input
                      type="tel"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left"
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              {/* ================= فیلدهای نمایشی مراکز درمانی ================= */}
              {role === "Hospital" && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام مرکز درمانی
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark"
                      placeholder="مثال: بیمارستان عرفان"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نوع مرکز
                    </label>
                    <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark bg-white">
                      <option value="بیمارستان">بیمارستان</option>
                      <option value="کلینیک">کلینیک</option>
                      <option value="سازمان طرف قرارداد">
                        سازمان طرف قرارداد
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      کد پروانه مرکز
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تلفن‌های مرکز
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark text-left"
                      dir="ltr"
                      placeholder="021-..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      آدرس دقیق مرکز
                    </label>
                    <textarea
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark"
                    ></textarea>
                  </div>
                </>
              )}
            </div>

            {/* بخش دکمه ثبت */}
            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                className={`w-full md:w-auto md:min-w-50 float-left py-3 px-6 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-gadget-dark hover:bg-gadget-dark/90 text-white`}
              >
                تکمیل ثبت‌نام
                <ArrowRight size={18} />
              </button>
              <div className="clear-both"></div>
            </div>
          </form>

          {/* لینک بازگشت به ورود */}
          <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-50 pt-6">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link
              to="/login"
              className="text-gadget-dark font-bold hover:underline"
            >
              وارد شوید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
