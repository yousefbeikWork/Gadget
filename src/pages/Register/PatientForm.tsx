import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  Lock,
  CreditCard,
  Users,
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import FileUpload from "../../components/FileUpload";

export default function PatientForm() {
  // const navigate = useNavigate();
  const { login } = useAuth();

  // استیت مرحله فعلی (۱: هویتی | ۲: آپلود مدارک)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // استیت فیلدهای مرحله اول (هویتی)
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

  // استیت ذخیره نام فایل‌های آپلودشده در MinIO
  const [nationalIdFront, setNationalIdFront] = useState<string>("");
  const [nationalIdBack, setNationalIdBack] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      "nationalId",
      "mobile",
      "guardianNationalId",
      "guardianMobile",
      "age",
    ];
    const finalValue = numericFields.includes(name)
      ? value.replace(/\D/g, "")
      : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const toEnglishDigits = (str: string) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str
      .split("")
      .map((c: string) =>
        persianNumbers.includes(c) ? persianNumbers.indexOf(c) : c,
      )
      .join("");
  };

  // ================= مرحله اول: اعتبارسنجی، ایجاد اکانت و ورود به مرحله مدارک =================
  const handleProceedToStep2 = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.nationalId.length !== 10) {
      toast.error("کد ملی بیمار باید ۱۰ رقم باشد.");
      return;
    }
    if (formData.mobile.length !== 11) {
      toast.error("شماره موبایل باید ۱۱ رقم باشد.");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    const ageNum = Number(toEnglishDigits(formData.age));
    if (ageNum < 18) {
      if (
        !formData.guardianFirstName.trim() ||
        !formData.guardianLastName.trim() ||
        formData.guardianNationalId.length !== 10 ||
        formData.guardianMobile.length !== 11
      ) {
        toast.error("برای افراد زیر ۱۸ سال، تکمیل اطلاعات قیم الزامی است.");
        return;
      }
    }

    setIsLoading(true);
    const toastId = toast.loading("در حال ثبت اطلاعات کاربری...");

    try {
      const payload = {
        role: "Patient",
        mobile: toEnglishDigits(formData.mobile).trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        nationalId: toEnglishDigits(formData.nationalId).trim(),
        age: ageNum,
        fatherName: formData.fatherName.trim(),
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        guardian: {
          firstName: formData.guardianFirstName.trim(),
          lastName: formData.guardianLastName.trim(),
          nationalId: toEnglishDigits(formData.guardianNationalId).trim(),
          mobile: toEnglishDigits(formData.guardianMobile).trim(),
          address: formData.guardianAddress.trim(),
        },
      };

      const registerResponse = await api.post("/auth/register", payload);
      const {
        accessToken,
        refreshToken,
        role: userRole,
      } = registerResponse.data;

      // ذخیره توکن‌ها برای ارسال در هدر FileUpload
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userRole", userRole);

      toast.success(
        "حساب کاربری ایجاد شد. اکنون مدارک شناسایی را بارگذاری فرمایید.",
        {
          id: toastId,
        },
      );

      // انتقال قطعی به مرحله دوم
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "خطا در ایجاد حساب کاربری.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // ================= مرحله دوم: ارسال مدارک به AI و اتصال به درگاه بانک =================
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nationalIdFront || !nationalIdBack) {
      toast.error("لطفاً تصویر هر دو طرف کارت ملی را بارگذاری فرمایید.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("در حال اعتبارسنجی هوشمند تصویر کارت ملی...");

    try {
      // ارسال عکس‌ها به بک‌اند جهت بررسی OCR و هوش مصنوعی
      await api.post("/users/updatePatientDocuments", {
        nationalIdFront,
        nationalIdBack,
      });

      toast.loading("مدارک تایید شد. در حال اتصال به درگاه بانک...", {
        id: toastId,
      });

      // ایجاد فاکتور پرداخت کارت RFID
      const paymentResponse = await api.post("/peyment/rfid/pay", {});

      if (
        paymentResponse.data?.success &&
        paymentResponse.data?.data?.paymentUrl
      ) {
        toast.success("در حال انتقال به درگاه بانک...", { id: toastId });

        // فعال‌سازی لاگین در کانتکست قبل از خروج به درگاه
        login(localStorage.getItem("userRole") || "Patient");

        window.location.href = paymentResponse.data.data.paymentUrl;
      } else {
        toast.error("خطا در ایجاد درگاه پرداخت. لطفاً دوباره تلاش کنید.", {
          id: toastId,
        });
      }
    } catch (err: any) {
      console.error(err);
      const status = err.response?.status;
      const serverError =
        err.response?.data?.error || err.response?.data?.message;

      // بررسی خطای ۴۰۰ اعتبارسنجی هوش مصنوعی
      if (
        status === 400 &&
        (serverError?.includes("does not match") ||
          serverError?.includes("unclear"))
      ) {
        toast.error(
          "تصویر کارت ملی با کد ملی ثبت‌شده تطابق ندارد یا کیفیت تصویر تار است. لطفاً تصویر باکیفیت‌تری بارگذاری کنید.",
          { id: toastId, duration: 6000 },
        );
      } else {
        toast.error(serverError || "خطا در تایید مدارک شناسایی.", {
          id: toastId,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      {/* ================== نقشه‌راه مرحله‌ای (Stepper بدون قابلیت بازگشت) ================== */}
      <div className="bg-gray-50/80 border border-gray-200/70 p-3 sm:p-4 rounded-2xl mb-6">
        <div className="flex items-center justify-between max-w-sm mx-auto relative">
          {/* خط اتصال */}
          <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-gray-200 z-0">
            <div
              className={`h-full bg-gadget-dark transition-all duration-300 ${
                currentStep === 2 ? "w-full" : "w-0"
              }`}
            />
          </div>

          {/* نشانگر مرحله ۱ */}
          <div className="flex items-center gap-2 relative z-10 bg-gray-50 pr-1 pl-2 text-right select-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                currentStep === 1
                  ? "bg-gadget-dark text-white ring-4 ring-gadget-dark/20"
                  : "bg-emerald-500 text-white"
              }`}
            >
              {currentStep === 2 ? <CheckCircle2 size={16} /> : "۱"}
            </div>
            <span
              className={`text-xs font-bold ${
                currentStep === 1
                  ? "text-gadget-dark"
                  : "text-emerald-700 font-medium"
              }`}
            >
              {currentStep === 2 ? "اطلاعات ثبت شد" : "اطلاعات هویتی"}
            </span>
          </div>

          {/* نشانگر مرحله ۲ */}
          <div className="flex items-center gap-2 relative z-10 bg-gray-50 pl-1 pr-2 text-left select-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                currentStep === 2
                  ? "bg-gadget-dark text-white ring-4 ring-gadget-dark/20"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              ۲
            </div>
            <span
              className={`text-xs font-bold ${
                currentStep === 2 ? "text-gadget-dark" : "text-gray-400"
              }`}
            >
              بارگذاری مدارک
            </span>
          </div>
        </div>
      </div>

      {/* ================== مرحله ۱: فرم اطلاعات فردی ================== */}
      {currentStep === 1 && (
        <form
          onSubmit={handleProceedToStep2}
          className="space-y-6 animate-in fade-in"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="md:col-span-2">
              <h3 className="text-xs sm:text-sm font-bold text-gadget-light border-b border-gray-100 pb-2">
                اطلاعات هویتی و کاربری بیمار
              </h3>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                نام *
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
                  placeholder="مثال: رضا"
                  className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                نام خانوادگی *
              </label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                type="text"
                placeholder="مثال: محمدی"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                کد ملی (۱۰ رقم) *
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
                  placeholder="0012345678"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                سن *
              </label>
              <input
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                type="number"
                placeholder="مثال: 28"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                شماره موبایل *
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
                  placeholder="0912..."
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                رمز عبور *
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
                  placeholder="حداقل ۶ کاراکتر"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                نام پدر
              </label>
              <input
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  جنسیت
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden cursor-pointer"
                >
                  <option value="MALE">مرد</option>
                  <option value="FEMALE">زن</option>
                  <option value="OTHER">سایر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  وضعیت تأهل
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:border-gadget-light outline-hidden cursor-pointer"
                >
                  <option value="SINGLE">مجرد</option>
                  <option value="MARRIED">متأهل</option>
                </select>
              </div>
            </div>

            {/* بخش اطلاعات قیم */}
            <div className="md:col-span-2 border rounded-2xl p-4 sm:p-5 mt-2 border-gray-200/80 bg-gray-50/60 space-y-3.5">
              <div className="flex items-center gap-2 text-gray-800 border-b border-gray-200/60 pb-2">
                <Users size={17} className="text-gadget-light" />
                <h3 className="text-xs sm:text-sm font-bold">
                  اطلاعات قیم / سرپرست قانونی
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    نام قیم
                  </label>
                  <input
                    name="guardianFirstName"
                    value={formData.guardianFirstName}
                    onChange={handleChange}
                    type="text"
                    className="w-full rounded-xl px-3.5 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden"
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
                    type="text"
                    className="w-full rounded-xl px-3.5 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden"
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
                    type="text"
                    className="w-full rounded-xl px-3.5 py-2 text-sm bg-white text-left border border-gray-200 focus:border-gadget-light outline-hidden font-mono"
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
                    type="tel"
                    className="w-full rounded-xl px-3.5 py-2 text-sm bg-white text-left border border-gray-200 focus:border-gadget-light outline-hidden font-mono"
                    dir="ltr"
                    placeholder="09..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    آدرس سکونت قیم
                  </label>
                  <textarea
                    name="guardianAddress"
                    value={formData.guardianAddress}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-xl px-3.5 py-2 text-sm bg-white border border-gray-200 focus:border-gadget-light outline-hidden resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto min-w-50 py-3 px-6 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 text-white bg-gadget-dark hover:bg-gadget-dark/90 cursor-pointer disabled:opacity-60"
            >
              <span>
                {isLoading ? "در حال ثبت..." : "ادامه و بارگذاری مدارک"}
              </span>
              <ArrowLeft size={18} />
            </button>
          </div>
        </form>
      )}

      {/* ================== مرحله ۲: آپلود مدارک و اتصال به درگاه (بدون بازگشت) ================== */}
      {currentStep === 2 && (
        <form
          onSubmit={handleFinalSubmit}
          className="space-y-6 animate-in fade-in"
        >
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck
              size={20}
              className="text-emerald-600 shrink-0 mt-0.5"
            />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <p className="font-bold mb-0.5">تأیید هویت و صدور پرونده سلامت</p>
              <p className="text-emerald-800/80">
                تصویر رو و پشت کارت ملی توسط هوش مصنوعی بررسی خواهد شد. لطفاً
                تصاویر واضح، خوانا و بدون بازتاب نور بارگذاری کنید.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* آپلود تصویر روی کارت ملی */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-gray-800 pb-2 border-b border-gray-100">
                <FileText size={17} className="text-gadget-light" />
                <h4 className="text-xs sm:text-sm font-bold">
                  ۱. تصویر روی کارت ملی *
                </h4>
              </div>
              <FileUpload
                label="انتخاب تصویر روی کارت ملی"
                acceptedTypes="image/jpeg,image/png,image/jpg"
                onUploadSuccess={(minioName: string) => {
                  setNationalIdFront(minioName);
                  // 👈 توست اضافه حذف شد (چون خود FileUpload پیام موفقیت می‌دهد)
                }}
                onRemove={() => setNationalIdFront("")}
              />
            </div>

            {/* آپلود تصویر پشت کارت ملی */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-gray-800 pb-2 border-b border-gray-100">
                <FileText size={17} className="text-gadget-light" />
                <h4 className="text-xs sm:text-sm font-bold">
                  ۲. تصویر پشت کارت ملی *
                </h4>
              </div>
              <FileUpload
                label="انتخاب تصویر پشت کارت ملی"
                acceptedTypes="image/jpeg,image/png,image/jpg"
                onUploadSuccess={(minioName: string) => {
                  setNationalIdBack(minioName);
                  // 👈 توست اضافه حذف شد
                }}
                onRemove={() => setNationalIdBack("")}
              />
            </div>
          </div>

          {/* خلاصه هویت ثبت‌شده */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
            <div>
              <span>بیمار: </span>
              <strong className="text-gray-900">
                {formData.firstName} {formData.lastName}
              </strong>
            </div>
            <div>
              <span>کد ملی: </span>
              <strong className="text-gray-900 font-mono" dir="ltr">
                {formData.nationalId}
              </strong>
            </div>
            <div>
              <span>شماره موبایل: </span>
              <strong className="text-gray-900 font-mono" dir="ltr">
                {formData.mobile}
              </strong>
            </div>
          </div>

          {/* دکمه ثبت نهایی و پرداخت (تک‌دکمه و شکیل) */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !nationalIdFront || !nationalIdBack}
              className={`w-full sm:w-auto min-w-64 py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 text-white ${
                isLoading || !nationalIdFront || !nationalIdBack
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-gadget-dark hover:bg-gadget-dark/90 cursor-pointer"
              }`}
            >
              {isLoading ? (
                <span>در حال بررسی مدارک و اتصال به درگاه...</span>
              ) : (
                <>
                  <span>تکمیل ثبت‌نام و پرداخت هزینه کارت</span>
                  <ArrowLeft size={17} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
