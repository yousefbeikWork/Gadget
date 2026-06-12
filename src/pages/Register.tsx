import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Users,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

type Role = "Patient" | "Doctor"; // نقش Hospital از اینجا حذف شد چون صفحه مجزا دارد

const medicalSpecialties = [
  "پزشک عمومی",
  "دندانپزشک",
  "متخصص قلب و عروق",
  "متخصص مغز و اعصاب",
  "متخصص زنان و زایمان",
  "متخصص اطفال",
  "متخصص پوست، مو و زیبایی",
  "متخصص چشم‌پزشکی",
  "متخصص گوش، حلق و بینی",
  "متخصص ارتوپدی",
  "متخصص داخلی",
  "متخصص گوارش و کبد",
  "متخصص غدد و متابولیسم",
  "متخصص کلیه و مجاری ادراری (اورولوژی)",
  "متخصص ریه",
  "متخصص بیماری‌های عفونی",
  "روان‌پزشک (اعصاب و روان)",
  "جراح عمومی",
  "جراح پلاستیک و زیبایی",
  "رادیولوژی و سونوگرافی",
  "فیزیوتراپی و توانبخشی",
  "تغذیه و رژیم‌درمانی",
  "علوم آزمایشگاهی",
  "سایر موارد",
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<Role>("Patient");

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
    fatherName: "",
    gender: "MALE",
    maritalStatus: "SINGLE",
    guardianFirstName: "",
    guardianLastName: "",
    guardianNationalId: "",
    guardianMobile: "",
    guardianAddress: "",
  });

  const onlyNumbers = (value: string) => {
    return value.replace(/\D/g, "");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      "nationalId",
      "mobile",
      "guardianNationalId",
      "guardianMobile",
      "clinicPhone",
      "medicalCouncilCode",
      "age",
    ];
    const finalValue = numericFields.includes(name)
      ? onlyNumbers(value)
      : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const toEnglishDigits = (str: string) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str
      .split("")
      .map((c) => (persianNumbers.includes(c) ? persianNumbers.indexOf(c) : c))
      .join("");
  };

  const numericAge = Number(toEnglishDigits(formData.age)) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      role: role,
      mobile: toEnglishDigits(formData.mobile).trim(),
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      nationalId: toEnglishDigits(formData.nationalId).trim(),
      age: numericAge,
    };

    if (role === "Doctor") {
      payload.medicalCouncilCode = formData.medicalCouncilCode;
      payload.Expertise = formData.Expertise;
      payload.clinicPhone = toEnglishDigits(formData.clinicPhone).trim();
      payload.orgAddress = formData.orgAddress;
      payload.clinicAddress = formData.clinicAddress;
    } else if (role === "Patient") {
      payload.fatherName = formData.fatherName;
      payload.gender = formData.gender;
      payload.maritalStatus = formData.maritalStatus;
      payload.guardian = {
        firstName: formData.guardianFirstName,
        lastName: formData.guardianLastName,
        nationalId: toEnglishDigits(formData.guardianNationalId).trim(),
        mobile: toEnglishDigits(formData.guardianMobile).trim(),
        address: formData.guardianAddress,
      };
    }

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

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* ================= انتخاب نقش ================= */}
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

            {/* 👈 تغییر کلیدی: هدایت مستقیم به صفحه کلینیک با کلیک روی این تب */}
            <button
              type="button"
              onClick={() => navigate("/register-clinic")}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all text-gray-500 hover:text-gadget-dark hover:bg-gray-100 cursor-pointer`}
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
              {/* ================= فیلدهای مشترک ================= */}
              {(role === "Patient" || role === "Doctor") && (
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
                        maxLength={10}
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
                        maxLength={11}
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
                </>
              )}

              {/* ================= فیلدهای اختصاصی بیمار ================= */}
              {role === "Patient" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام پدر
                    </label>
                    <input
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      required
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light"
                    />
                  </div>
                  <div></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      جنسیت
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light bg-white"
                    >
                      <option value="MALE">مرد</option>
                      <option value="FEMALE">زن</option>
                      <option value="OTHER">سایر</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      وضعیت تاهل
                    </label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light bg-white"
                    >
                      <option value="SINGLE">مجرد</option>
                      <option value="MARRIED">متاهل</option>
                    </select>
                  </div>

                  {/* ---------- بخش قیم (پویا) ---------- */}
                  <div
                    className={`md:col-span-2 border rounded-xl p-4 mt-2 transition-colors duration-300 border-gray-100 bg-gray-50/50`}
                  >
                    <div
                      className={`flex items-center gap-2 mb-4 text-gray-600`}
                    >
                      <Users size={18} />
                      <h3 className="text-sm font-bold">اطلاعات قیم</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          نام قیم
                        </label>
                        <input
                          name="guardianFirstName"
                          value={formData.guardianFirstName}
                          onChange={handleChange}
                          required
                          type="text"
                          className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-hidden bg-white border border-gray-200 focus:border-gadget-light`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          نام خانوادگی قیم
                        </label>
                        <input
                          name="guardianLastName"
                          value={formData.guardianLastName}
                          onChange={handleChange}
                          required
                          type="text"
                          className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-hidden bg-white border border-gray-200 focus:border-gadget-light`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          کد ملی قیم
                        </label>
                        <input
                          name="guardianNationalId"
                          maxLength={10}
                          value={formData.guardianNationalId}
                          onChange={handleChange}
                          required
                          type="text"
                          className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-hidden bg-white text-left border border-gray-200 focus:border-gadget-light`}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          شماره موبایل قیم
                        </label>
                        <input
                          name="guardianMobile"
                          maxLength={11}
                          value={formData.guardianMobile}
                          onChange={handleChange}
                          required
                          type="tel"
                          className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-hidden bg-white text-left border border-gray-200 focus:border-gadget-light`}
                          dir="ltr"
                          placeholder="09"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          آدرس سکونت
                        </label>
                        <textarea
                          name="guardianAddress"
                          value={formData.guardianAddress}
                          onChange={handleChange}
                          required
                          rows={2}
                          className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-hidden bg-white border border-gray-200 focus:border-gadget-light`}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ================= فیلدهای اختصاصی پزشک ================= */}
              {role === "Doctor" && (
                <>
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
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      تخصص پزشکی
                    </label>
                    <div className="relative">
                      <select
                        name="Expertise"
                        value={formData.Expertise}
                        onChange={handleChange}
                        required
                        className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors appearance-none cursor-pointer ${
                          !formData.Expertise
                            ? "text-gray-400"
                            : "text-gray-800"
                        }`}
                      >
                        <option value="" disabled>
                          لطفاً تخصص خود را انتخاب کنید...
                        </option>

                        {medicalSpecialties.map((specialty, index) => (
                          <option
                            key={index}
                            value={specialty}
                            className="text-gray-800"
                          >
                            {specialty}
                          </option>
                        ))}
                      </select>

                      {/* یک آیکون فلش کوچک برای زیبایی بیشتر دراپ‌داون */}
                      <div className="absolute left-4 top-3 pointer-events-none text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
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
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                className={`w-full md:w-auto md:min-w-50 float-left py-3 px-6 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-gadget-dark hover:bg-gadget-dark/90 text-white
                `}
              >
                تکمیل ثبت‌نام
                <ArrowRight size={18} />
              </button>
              <div className="clear-both"></div>
            </div>
          </form>

          {/* ================= فوتر صفحه ================= */}
          <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-50 pt-6">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link
              to="/login"
              className="text-gadget-dark font-bold hover:underline"
            >
              وارد شوید
            </Link>
            {/* 👈 لینک کمکی اضافه شده برای هدایت مدیران کلینیک */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-3">
                آیا نماینده یک بیمارستان یا کلینیک هستید؟
              </p>
              <Link
                to="/register-clinic"
                className="inline-flex items-center justify-center gap-2 text-gadget-dark font-bold hover:text-gadget-light transition-colors"
              >
                <Building2 size={18} />
                ثبت‌نام به عنوان مرکز درمانی
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
