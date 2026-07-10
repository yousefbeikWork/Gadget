import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Phone,
  MapPin,
  Lock,
  Loader2,
  ArrowRight,
  Smartphone,
  ShieldCheck,
  CreditCard,
  CheckSquare,
  Users,
  Plus,
  Trash2,
  FlaskConical,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

interface TestItem {
  testName: string;
  testCode: string;
  department: string;
  price: string;
  isAvailable: boolean;
  preparationInstructions: string;
}

export default function ClinicRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newTest, setNewTest] = useState<TestItem>({
    testName: "",
    testCode: "",
    department: "",
    price: "",
    isAvailable: true,
    preparationInstructions: "",
  });
  // استیت جامع منطبق بر ساختار API
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    centerName: "",
    centerType: "Clinic",
    licenseCode: "",
    ownershipType: "Private",
    address: "",
    postalCode: "",
    phones: "",
    activeStaffCount: "",
    specialty: "",
    agreement: false,
    availableTests: [] as TestItem[],
    manager: {
      firstName: "",
      lastName: "",
      nationalId: "",
      mobile: "",
    },
  });

  // --- توابع کمکی برای اعتبارسنجی اعداد ---
  const toEnglishDigits = (str: string) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str
      .split("")
      .map((c) => (persianNumbers.includes(c) ? persianNumbers.indexOf(c) : c))
      .join("");
  };

  const onlyNumbers = (value: string) => {
    return value.replace(/\D/g, ""); // حذف هر چیزی که عدد نیست
  };

  // هندل کردن فیلدهای عادی کلینیک
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    // اگر فیلد چک‌باکس بود
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    let finalValue = toEnglishDigits(value);

    // اعمال محدودیت فقط عدد برای فیلدهای خاص
    if (["mobile", "postalCode", "activeStaffCount"].includes(name)) {
      finalValue = onlyNumbers(finalValue);
    }
    // فیلد تلفن‌ها باید عدد، فاصله، خط‌تیره و کاما رو قبول کنه تا بشه چندتا شماره نوشت
    else if (name === "phones") {
      finalValue = finalValue.replace(/[^\d\s,-]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  // هندل کردن فیلدهای تو در تو (مدیر)
  const handleManagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = toEnglishDigits(value);

    // کد ملی و موبایل مدیر باید فقط عدد باشند
    if (["nationalId", "mobile"].includes(name)) {
      finalValue = onlyNumbers(finalValue);
    }

    setFormData((prev) => ({
      ...prev,
      manager: {
        ...prev.manager,
        [name]: finalValue,
      },
    }));
  };
  // 👈 توابع مدیریت تست‌های آزمایشگاهی
  const handleAddTest = () => {
    if (!newTest.testName.trim()) {
      toast.error("وارد کردن نام تست (Test Name) الزامی است.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      availableTests: [...prev.availableTests, newTest],
    }));
    // ریست کردن فرم تست موقت
    setNewTest({
      testName: "",
      testCode: "",
      department: "",
      price: "",
      isAvailable: true,
      preparationInstructions: "",
    });
  };

  const handleRemoveTest = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availableTests: prev.availableTests.filter((_, i) => i !== index),
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreement) {
      toast.error("لطفاً قوانین و مقررات را تایید کنید.");
      return;
    }

    if (formData.manager.nationalId.length !== 10) {
      toast.error("کد ملی مدیر باید دقیقاً ۱۰ رقم باشد.");
      return;
    }

    setLoading(true);
    try {
      // آماده‌سازی دیتای نهایی برای سرور
      const payload = {
        // تعیین هوشمند نقش بر اساس نوع مرکز
        role:
          formData.centerType === "Laboratory"
            ? "LaboratoryCenter"
            : "MedicalCenter",
        mobile: formData.mobile,
        password: formData.password,
        centerName: formData.centerName,
        centerType: formData.centerType,
        licenseCode: formData.licenseCode,
        ownershipType: formData.ownershipType,
        address: formData.address,
        postalCode: formData.postalCode,
        phones: formData.phones
          .split(/[,-]/)
          .map((p) => p.trim())
          .filter((p) => p !== ""),
        activeStaffCount: Number(formData.activeStaffCount) || 0,
        specialty: formData.specialty,
        agreement: formData.agreement,

        // ارسال لیست تست‌ها فقط اگر آزمایشگاه بود
        ...(formData.centerType === "Laboratory" && {
          availableTests: formData.availableTests.map((t) => ({
            ...t,
            price: t.price ? Number(t.price) : 0,
          })),
        }),

        manager: {
          firstName: formData.manager.firstName,
          lastName: formData.manager.lastName,
          nationalId: formData.manager.nationalId,
          mobile: formData.manager.mobile,
        },
      };

      // 👈 تشخیص هوشمند آدرس API (اندپوینت)
      const endpoint =
        formData.centerType === "Laboratory"
          ? "/laboratory/registerLaboratory"
          : "/clinic/registerClinic";

      // 👈 ارسال درخواست به اندپوینت انتخاب شده
      const response = await api.post(endpoint, payload);

      // (شرط بررسی را کمی منعطف‌تر کردم تا اگر API آزمایشگاه clinicId برنگرداند هم درست کار کند)
      if (response.data) {
        toast.success(
          "ثبت‌نام اولیه با موفقیت انجام شد. لطفاً برای بارگذاری مدارک وارد حساب خود شوید.",
        );
        navigate("/login", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در ثبت اطلاعات مرکز.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-10 font-sans"
      dir="rtl"
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* هدر فرم */}
        <div className="bg-gadget-dark p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-10 mix-blend-overlay"></div>

          <Link
            to="/register"
            className="absolute right-6 top-8 text-white/70 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium z-10"
          >
            <ArrowRight size={16} />
            بازگشت به انتخاب نقش
          </Link>

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <Building2 size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              ثبت‌نام مرکز درمانی (مرحله ۱ از ۲)
            </h1>
            <p className="text-gadget-light text-sm">
              لطفاً اطلاعات هویتی و ثبتی مرکز را با دقت وارد نمایید
            </p>
          </div>
        </div>

        {/* بدنه فرم */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- گروه ۱: اطلاعات ورود --- */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gadget-light mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                <Lock size={18} />
                اطلاعات حساب کاربری (ورود به سیستم)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    شماره موبایل سیستم *
                  </label>
                  <div className="relative">
                    <Smartphone
                      className="absolute right-3 top-2.5 text-gray-400"
                      size={16}
                    />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      dir="ltr"
                      maxLength={11}
                      placeholder="09..."
                      className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors text-left"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    رمز عبور *
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute right-3 top-2.5 text-gray-400"
                      size={16}
                    />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      dir="ltr"
                      className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors text-left"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- گروه ۲: اطلاعات مرکز --- */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gadget-dark flex items-center gap-2 border-b border-gray-100 pb-2">
                <Building2 size={18} />
                مشخصات مرکز درمانی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    نام کامل مرکز *
                  </label>
                  <input
                    type="text"
                    name="centerName"
                    value={formData.centerName}
                    onChange={handleChange}
                    required
                    placeholder="مثال: کلینیک تخصصی قلب سلامت"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    نوع مرکز *
                  </label>
                  <select
                    name="centerType"
                    value={formData.centerType}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  >
                    <option value="Clinic">کلینیک (درمانگاه)</option>
                    <option value="Hospital">بیمارستان</option>
                    <option value="Laboratory">آزمایشگاه</option>
                    <option value="Imaging">مرکز تصویربرداری</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    کد پروانه تاسیس *
                  </label>
                  <input
                    type="text"
                    name="licenseCode"
                    value={formData.licenseCode}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors text-left"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    نوع مالکیت *
                  </label>
                  <select
                    name="ownershipType"
                    value={formData.ownershipType}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  >
                    <option value="Private">خصوصی</option>
                    <option value="Public">دولتی</option>
                    <option value="Charity">خیریه</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    تخصص اصلی مرکز
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    placeholder="مثال: قلب و عروق، عمومی"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  />
                </div>
              </div>
            </div>
            {/* --- گروه اختصاصی: لیست تست‌های آزمایشگاه --- */}
            {formData.centerType === "Laboratory" && (
              <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-sm font-bold text-purple-800 mb-4 flex items-center gap-2 border-b border-purple-100 pb-2">
                  <FlaskConical size={18} />
                  لیست تست‌ها و آزمایش‌های قابل ارائه
                </h3>

                {/* فرم افزودن تست جدید */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-white p-4 rounded-xl border border-purple-100 mb-4 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      نام تست *
                    </label>
                    <input
                      type="text"
                      value={newTest.testName}
                      onChange={(e) =>
                        setNewTest({ ...newTest, testName: e.target.value })
                      }
                      placeholder="مثال: CBC"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      کد تست
                    </label>
                    <input
                      type="text"
                      value={newTest.testCode}
                      onChange={(e) =>
                        setNewTest({ ...newTest, testCode: e.target.value })
                      }
                      placeholder="LAB-01"
                      dir="ltr"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-purple-400 text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      بخش (دپارتمان)
                    </label>
                    <input
                      type="text"
                      value={newTest.department}
                      onChange={(e) =>
                        setNewTest({ ...newTest, department: e.target.value })
                      }
                      placeholder="مثال: هماتولوژی"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      قیمت (تومان)
                    </label>
                    <input
                      type="text"
                      value={newTest.price}
                      onChange={(e) =>
                        setNewTest({
                          ...newTest,
                          price: onlyNumbers(e.target.value),
                        })
                      }
                      placeholder="0"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-purple-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      شرایط قبل از آزمایش
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTest.preparationInstructions}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            preparationInstructions: e.target.value,
                          })
                        }
                        placeholder="مثال: ۸ ساعت ناشتایی نیاز است"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-purple-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddTest}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      >
                        <Plus size={16} /> افزودن
                      </button>
                    </div>
                  </div>
                </div>

                {/* لیست تست‌های وارد شده */}
                {formData.availableTests.length > 0 && (
                  <div className="space-y-2 mt-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {formData.availableTests.map((test, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-purple-100 shadow-xs gap-3"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            {test.testName}{" "}
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              {test.department || "عمومی"}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            کد: {test.testCode || "-"} | قیمت:{" "}
                            {test.price
                              ? Number(test.price).toLocaleString()
                              : "0"}{" "}
                            تومان
                            {test.preparationInstructions &&
                              ` | شرایط: ${test.preparationInstructions}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTest(index)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* --- گروه ۳: اطلاعات تماس مرکز --- */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gadget-dark flex items-center gap-2 border-b border-gray-100 pb-2">
                <MapPin size={18} />
                اطلاعات تماس و موقعیت مکانی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    آدرس کامل *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    کد پستی *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    maxLength={10}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors text-left"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    شماره‌های تماس (با خط تیره جدا کنید)
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute right-3 top-2.5 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      name="phones"
                      value={formData.phones}
                      onChange={handleChange}
                      dir="ltr"
                      placeholder="02188776655 - 02188776656"
                      className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors text-left"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- گروه ۴: اطلاعات مدیر/مسئول فنی --- */}
            <div className="bg-gadget-light/5 border border-gadget-light/20 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gadget-dark mb-4 flex items-center gap-2 border-b border-gadget-light/20 pb-2">
                <ShieldCheck size={18} />
                اطلاعات مدیر یا مسئول فنی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    نام مدیر *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.manager.firstName}
                    onChange={handleManagerChange}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    نام خانوادگی مدیر *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.manager.lastName}
                    onChange={handleManagerChange}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    کد ملی مدیر *
                  </label>
                  <div className="relative">
                    <CreditCard
                      className="absolute right-3 top-2.5 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.manager.nationalId}
                      onChange={handleManagerChange}
                      required
                      dir="ltr"
                      maxLength={10}
                      className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors text-left"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    موبایل مدیر *
                  </label>
                  <div className="relative">
                    <Smartphone
                      className="absolute right-3 top-2.5 text-gray-400"
                      size={16}
                    />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.manager.mobile}
                      onChange={handleManagerChange}
                      required
                      dir="ltr"
                      maxLength={11}
                      placeholder="09..."
                      className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors text-left"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- گروه ۵: اطلاعات تکمیلی --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  تعداد پرسنل فعال (تخمینی)
                </label>
                <input
                  type="text"
                  name="activeStaffCount"
                  value={formData.activeStaffCount}
                  onChange={handleChange}
                  className="w-full sm:w-1/2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors text-left"
                  dir="ltr"
                />
              </div>

              {/* قوانین */}
              <div className="flex items-start gap-3 mt-4 md:mt-0">
                <div className="flex items-center h-5">
                  <input
                    id="agreement"
                    name="agreement"
                    type="checkbox"
                    checked={formData.agreement}
                    onChange={handleChange}
                    className="w-5 h-5 text-gadget-light border-gray-300 rounded-md focus:ring-gadget-light cursor-pointer"
                  />
                </div>
                <label
                  htmlFor="agreement"
                  className="text-xs text-gray-600 leading-relaxed cursor-pointer"
                >
                  با ثبت این فرم، صحت تمامی اطلاعات وارد شده را تایید می‌کنم و
                  متعهد به ارائه مدارک معتبر در مرحله بعد هستم.
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3.5 px-8 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <CheckSquare size={20} />
                )}
                {loading ? "در حال ثبت اطلاعات..." : "ثبت مرحله اول و ادامه"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
