import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Phone,
  MapPin,
  Lock,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Users,
  Plus,
  Trash2,
  FlaskConical,
  Stethoscope,
  Mail,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

// 👈 ایمپورت‌های مربوط به تقویم فارسی
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
const DatePicker = (DatePickerLib as any).default || DatePickerLib;

interface TestItem {
  testName: string;
  testCode: string;
  department: string;
  price: string;
  isAvailable: boolean;
  preparationInstructions: string;
}

export default function CenterRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // استیت موقت برای افزودن تست آزمایشگاه
  const [newTest, setNewTest] = useState<TestItem>({
    testName: "",
    testCode: "",
    department: "",
    price: "",
    isAvailable: true,
    preparationInstructions: "",
  });

  // استیت یکپارچه و مسطح برای مدیریت راحت‌تر فرم
  const [formData, setFormData] = useState({
    managerFirstName: "",
    managerLastName: "",
    managerNationalId: "",
    managerMobile: "",
    managerEmail: "",
    password: "",

    centerType: "Clinic",

    centerName: "",
    ownershipType: "Private",
    licenseCode: "",

    specialty: "",
    activeStaffCount: "",
    establishmentDate: "", // 👈 برای نگهداری تاریخ میلادی تبدیل شده از تقویم شمسی
    emergencyMobile: "",

    address: "",
    postalCode: "",
    phones: "",

    availableTests: [] as TestItem[],
    agreement: false,
  });

  // --- توابع کمکی ---
  const toEnglishDigits = (str: string) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str
      .split("")
      .map((c) => (persianNumbers.includes(c) ? persianNumbers.indexOf(c) : c))
      .join("");
  };

  const onlyNumbers = (value: string) => value.replace(/\D/g, "");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    let finalValue = toEnglishDigits(value);

    // فیلدهای عددی مطلق
    if (
      [
        "managerMobile",
        "managerNationalId",
        "postalCode",
        "activeStaffCount",
        "emergencyMobile",
      ].includes(name)
    ) {
      finalValue = onlyNumbers(finalValue);
    }
    // فیلد تلفن‌های ثابت (اعداد، خط تیره، کاما، فاصله)
    else if (name === "phones") {
      finalValue = finalValue.replace(/[^\d\s,-]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  // --- توابع مدیریت تست آزمایشگاهی ---
  const handleAddTest = () => {
    if (!newTest.testName.trim()) {
      toast.error("وارد کردن نام تست الزامی است.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      availableTests: [...prev.availableTests, newTest],
    }));
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

  // --- سابمیت و ارسال به سرور ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreement) {
      toast.error("لطفاً قوانین و مقررات را تایید کنید.");
      return;
    }

    if (formData.managerNationalId.length !== 10) {
      toast.error("کد ملی مدیر باید دقیقاً ۱۰ رقم باشد.");
      return;
    }

    if (formData.managerMobile.length !== 11) {
      toast.error("شماره موبایل مدیر (نام کاربری) باید ۱۱ رقم باشد.");
      return;
    }

    if (formData.centerType === "Hospital" && !formData.establishmentDate) {
      toast.error("لطفاً تاریخ تاسیس بیمارستان را انتخاب کنید.");
      return;
    }

    setLoading(true);
    try {
      const managerPayload: any = {
        firstName: formData.managerFirstName,
        lastName: formData.managerLastName,
        nationalId: formData.managerNationalId,
        mobile: formData.managerMobile,
      };

      const contactPayload = {
        address: formData.address,
        postalCode: formData.postalCode,
        phones: formData.phones
          .split(/[,-]/)
          .map((p) => p.trim())
          .filter((p) => p !== ""),
      };

      let endpoint = "";
      let payload = {};

      if (formData.centerType === "Hospital") {
        managerPayload.email = formData.managerEmail;

        endpoint = "/Hospital/registerHospital";
        payload = {
          mobile: formData.managerMobile,
          password: formData.password,
          hospitalName: formData.centerName,
          hospitalType: formData.ownershipType.toUpperCase(),
          licenseCode: formData.licenseCode,
          establishmentDate: formData.establishmentDate,
          emergencyMobile: formData.emergencyMobile,
          ...contactPayload,
          manager: managerPayload,
        };
      } else if (formData.centerType === "Clinic") {
        endpoint = "/clinic/registerClinic";
        payload = {
          mobile: formData.managerMobile,
          password: formData.password,
          centerName: formData.centerName,
          centerType: "Clinic",
          licenseCode: formData.licenseCode,
          ownershipType: formData.ownershipType,
          activeStaffCount: Number(formData.activeStaffCount) || 0,
          specialty: formData.specialty,
          agreement: formData.agreement,
          ...contactPayload,
          manager: managerPayload,
        };
      } else if (formData.centerType === "Laboratory") {
        endpoint = "/laboratory/registerLaboratory";
        payload = {
          mobile: formData.managerMobile,
          password: formData.password,
          centerName: formData.centerName,
          centerType: "Laboratory",
          licenseCode: formData.licenseCode,
          ownershipType: formData.ownershipType,
          activeStaffCount: Number(formData.activeStaffCount) || 0,
          agreement: formData.agreement,
          availableTests: formData.availableTests.map((t) => ({
            ...t,
            price: t.price ? Number(t.price) : 0,
          })),
          ...contactPayload,
          manager: managerPayload,
        };
      }

      const response = await api.post(endpoint, payload);

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
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* ================== هدر فرم ================== */}
        <div className="bg-gadget-dark p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <Link
            to="/register"
            className="absolute right-6 top-8 text-white/70 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium z-10"
          >
            <ArrowRight size={16} /> بازگشت به انتخاب نقش
          </Link>
          <div className="relative z-10 text-center mt-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <Building2 size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              ثبت‌نام مراکز درمانی و خدمات سلامت
            </h1>
            <p className="text-gadget-light text-sm">
              شامل کلینیک‌ها، بیمارستان‌ها و آزمایشگاه‌ها
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* ================== ۱. اطلاعات مدیر و حساب کاربری ================== */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2 border-b border-blue-100 pb-3">
                <ShieldCheck size={18} /> مشخصات مدیر مرکز و اطلاعات ورود به
                سیستم
              </h3>

              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start gap-3 mb-6">
                <AlertCircle
                  size={20}
                  className="shrink-0 mt-0.5 text-blue-600"
                />
                <p className="text-xs font-medium leading-relaxed">
                  <strong>توجه:</strong> شماره موبایل و رمز عبوری که در این بخش
                  وارد می‌کنید، به عنوان <strong>نام کاربری و رمز عبور</strong>{" "}
                  شما برای ورود به پنل مدیریت مرکز استفاده خواهد شد. لطفاً در
                  نگهداری آن دقت فرمایید.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    نام مدیر *
                  </label>
                  <input
                    type="text"
                    name="managerFirstName"
                    value={formData.managerFirstName}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    نام خانوادگی مدیر *
                  </label>
                  <input
                    type="text"
                    name="managerLastName"
                    value={formData.managerLastName}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    کد ملی مدیر *
                  </label>
                  <input
                    type="text"
                    name="managerNationalId"
                    value={formData.managerNationalId}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    maxLength={10}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-hidden focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    موبایل مدیر (نام کاربری) *
                  </label>
                  <input
                    type="tel"
                    name="managerMobile"
                    value={formData.managerMobile}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    maxLength={11}
                    placeholder="09..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-hidden focus:border-blue-400 font-bold text-blue-700 bg-blue-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    رمز عبور سیستم *
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
                      className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-left focus:outline-hidden focus:border-blue-400"
                    />
                  </div>
                </div>
                {formData.centerType === "Hospital" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      ایمیل مدیر (بیمارستان)
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute right-3 top-2.5 text-gray-400"
                        size={16}
                      />
                      <input
                        type="email"
                        name="managerEmail"
                        value={formData.managerEmail}
                        onChange={handleChange}
                        dir="ltr"
                        className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-left focus:outline-hidden focus:border-blue-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ================== ۲ و ۳. نوع مرکز و مشخصات ================== */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Building2 size={18} className="text-gadget-dark" /> مشخصات
                  مرکز درمانی
                </h3>
                <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-xl shadow-xs">
                  {(["Clinic", "Laboratory", "Hospital"] as const).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, centerType: type })
                        }
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          formData.centerType === type
                            ? "bg-gadget-dark text-white"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {type === "Clinic"
                          ? "کلینیک"
                          : type === "Laboratory"
                            ? "آزمایشگاه"
                            : "بیمارستان"}
                      </button>
                    ),
                  )}
                </div>
              </div>

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
                    placeholder={`مثال: ${formData.centerType === "Hospital" ? "بیمارستان میلاد" : "کلینیک سلامت"}`}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    کد پروانه تاسیس / لایسنس *
                  </label>
                  <input
                    type="text"
                    name="licenseCode"
                    value={formData.licenseCode}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-hidden focus:border-gadget-light"
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
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light"
                  >
                    <option value="Private">خصوصی</option>
                    <option value="Public">دولتی</option>
                    <option value="Charity">خیریه</option>
                  </select>
                </div>

                {formData.centerType === "Clinic" && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Stethoscope size={14} /> تخصص اصلی مرکز
                    </label>
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      placeholder="مثال: قلب و عروق"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light"
                    />
                  </div>
                )}

                {(formData.centerType === "Clinic" ||
                  formData.centerType === "Laboratory") && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Users size={14} /> تعداد پرسنل فعال
                    </label>
                    <input
                      type="text"
                      name="activeStaffCount"
                      value={formData.activeStaffCount}
                      onChange={handleChange}
                      dir="ltr"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-hidden focus:border-gadget-light"
                    />
                  </div>
                )}

                {/* 👈 تقویم شمسی اضافه شده برای تاریخ تاسیس بیمارستان */}
                {formData.centerType === "Hospital" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                        <CalendarDays size={14} /> تاریخ تاسیس *
                      </label>
                      <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={
                          formData.establishmentDate
                            ? new Date(formData.establishmentDate)
                            : null
                        }
                        onChange={(date: any) => {
                          if (date?.isValid) {
                            const jsDate = date.toDate();
                            const gregorianDate = `${jsDate.getFullYear()}-${String(jsDate.getMonth() + 1).padStart(2, "0")}-${String(jsDate.getDate()).padStart(2, "0")}`;

                            setFormData((prev) => ({
                              ...prev,
                              establishmentDate: gregorianDate,
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              establishmentDate: "",
                            }));
                          }
                        }}
                        containerClassName="w-full"
                        inputClass="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light text-gray-700 cursor-pointer"
                        placeholder="انتخاب تاریخ از تقویم..."
                        calendarPosition="bottom-right"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-red-600 mb-1.5 flex items-center gap-1">
                        <Phone size={14} /> موبایل اورژانس/کشیک *
                      </label>
                      <input
                        type="tel"
                        name="emergencyMobile"
                        value={formData.emergencyMobile}
                        onChange={handleChange}
                        required
                        dir="ltr"
                        maxLength={11}
                        className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-hidden focus:border-red-400"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ================== ۴. اطلاعات تماس مرکز ================== */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                <MapPin size={18} className="text-gadget-light" /> اطلاعات تماس
                و موقعیت مکانی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    آدرس دقیق پستی *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-hidden focus:border-gadget-light transition-colors"
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white text-left focus:outline-hidden focus:border-gadget-light"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    تلفن‌های ثابت (با خط تیره جدا کنید) *
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
                      required
                      dir="ltr"
                      placeholder="02188776655 - 02188776656"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-left focus:bg-white focus:outline-hidden focus:border-gadget-light"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ================== ۵. فقط برای آزمایشگاه: لیست تست‌ها ================== */}
            {formData.centerType === "Laboratory" && (
              <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-sm font-bold text-purple-800 mb-4 flex items-center gap-2 border-b border-purple-100 pb-2">
                  <FlaskConical size={18} /> لیست تست‌ها و آزمایش‌های قابل ارائه
                </h3>

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
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-left focus:outline-hidden focus:border-purple-400"
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

            {/* ================== ۶. تایید قوانین و ثبت ================== */}
            <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
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
                  className="text-xs text-gray-600 leading-relaxed cursor-pointer font-medium max-w-lg"
                >
                  با ثبت این فرم، صحت تمامی اطلاعات وارد شده را تایید می‌کنم و
                  متعهد به ارائه مدارک معتبر در مرحله بعد هستم.
                </label>
              </div>

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
                {loading ? "در حال ارسال..." : "ثبت مرکز در سیستم"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
