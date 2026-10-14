import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  Lock,
  CreditCard,
  MapPin,
  ArrowRight,
  Building2,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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
  "جراحی مغز و اعصاب",
  "خون و آنکولوژی (سرطان)",
  "روماتولوژی",
  "طب اورژانس و بیهوشی",
];

// دیتابیس لوکال استان‌ها و شهرهای ایران
const iranCities: Record<string, string[]> = {
  تهران: [
    "تهران",
    "اسلامشهر",
    "شهریار",
    "قدس",
    "ملارد",
    "پاکدشت",
    "ورامین",
    "ری",
    "دماوند",
    "پردیس",
    "رباط‌کریم",
    "فیروزکوه",
  ],
  "خراسان رضوی": [
    "مشهد",
    "نیشابور",
    "سبزوار",
    "تربت حیدریه",
    "کاشمر",
    "قوچان",
    "تربت جام",
    "تایباد",
    "چناران",
    "گناباد",
    "سرخس",
    "فریمان",
  ],
  اصفهان: [
    "اصفهان",
    "کاشان",
    "خمینی‌شهر",
    "نجف‌آباد",
    "شاهین‌شهر",
    "شهرضا",
    "فلاورجان",
    "لنجان",
    "مبارکه",
    "نایین",
    "گلپایگان",
    "نطنز",
  ],
  فارس: [
    "شیراز",
    "مرودشت",
    "جهرم",
    "فسا",
    "کازرون",
    "صدرا",
    "داراب",
    "لار",
    "فیروزآباد",
    "آباده",
    "نورآباد",
    "نی‌ریز",
    "اقلید",
  ],
  البرز: [
    "کرج",
    "فردیس",
    "کمال‌شهر",
    "نظرآباد",
    "محمدشهر",
    "ماهدشت",
    "هشتگرد",
    "اشتهارد",
    "طالقان",
    "گرمدره",
  ],
  "آذربایجان شرقی": [
    "تبریز",
    "مراغه",
    "مرند",
    "میانه",
    "اهر",
    "بناب",
    "سراب",
    "آذرشهر",
    "شبستر",
    "عجب‌شیر",
    "جلفا",
    "ملکان",
  ],
  "آذربایجان غربی": [
    "ارومیه",
    "خوی",
    "بوکان",
    "مهاباد",
    "میاندوآب",
    "سلماس",
    "پیرانشهر",
    "نقده",
    "سردشت",
    "ماکو",
    "شاهین‌دژ",
  ],
  خوزستان: [
    "اهواز",
    "دزفول",
    "آبادان",
    "بندر ماهشهر",
    "خرمشهر",
    "اندیمشک",
    "ایذه",
    "بهبهان",
    "شوشتر",
    "مسجدسلیمان",
    "شوش",
    "رامهرمز",
  ],
  مازندران: [
    "ساری",
    "بابل",
    "آمل",
    "قائم‌شهر",
    "بهشهر",
    "چالوس",
    "نکا",
    "بابلسر",
    "تنکابن",
    "نوشهر",
    "رامسر",
    "محمودآباد",
  ],
  گیلان: [
    "رشت",
    "بندر انزلی",
    "لاهیجان",
    "لنگرود",
    "تالش",
    "آستارا",
    "صومعه‌سرا",
    "آستانه اشرفیه",
    "رودسر",
    "فومن",
  ],
  کرمان: [
    "کرمان",
    "سیرجان",
    "رفسنجان",
    "جیرفت",
    "بم",
    "زرند",
    "کهنوج",
    "شهربابک",
    "بافت",
    "بردسیر",
  ],
  "سیستان و بلوچستان": [
    "زاهدان",
    "زابل",
    "ایرانشهر",
    "چابهار",
    "سراوان",
    "خاش",
    "کنارک",
    "نیک‌شهر",
  ],
  کرمانشاه: [
    "کرمانشاه",
    "اسلام‌آباد غرب",
    "جوانرود",
    "کنگاور",
    "سرپل ذهاب",
    "سنقر",
    "هرسین",
    "صحنه",
    "پاوه",
  ],
  قم: ["قم", "قنوات", "جعفریه", "کهک"],
  قزوین: [
    "قزوین",
    "الوند",
    "تاکستان",
    "آبیک",
    "بویین‌زهرا",
    "محمدیه",
    "اقبالیه",
  ],
  گلستان: [
    "گرگان",
    "گنبد کاووس",
    "علی‌آباد کتول",
    "بندر ترکمن",
    "آق‌قلا",
    "کلاله",
    "آزادشهر",
    "مینودشت",
    "کردکوی",
  ],
  هرمزگان: [
    "بندرعباس",
    "میناب",
    "قشم",
    "کیش",
    "بندر لنگه",
    "حاجی‌آباد",
    "بستک",
    "جاسک",
    "پارسیان",
  ],
  لرستان: [
    "خرم‌آباد",
    "بروجرد",
    "دورود",
    "کوهدشت",
    "الیگودرز",
    "نورآباد",
    "پلدختر",
    "الشتر",
    "ازنا",
  ],
  مرکزی: ["اراک", "ساوه", "خمین", "محلات", "دلیجان", "شازند", "تفرش", "آشتیان"],
  همدان: [
    "همدان",
    "ملایر",
    "نهاوند",
    "اسدآباد",
    "تویسرکان",
    "بهار",
    "کبودرآهنگ",
    "رزن",
  ],
  کردستان: [
    "سنندج",
    "سقز",
    "مریوان",
    "بانه",
    "قروه",
    "کامیاران",
    "بیجار",
    "دیواندره",
    "دهگلان",
  ],
  یزد: ["یزد", "میبد", "اردکان", "بافق", "مهریز", "ابرکوه", "تفت", "اشکذر"],
  اردبیل: [
    "اردبیل",
    "پارس‌آباد",
    "مشگین‌شهر",
    "خلخال",
    "گرمی",
    "نمین",
    "بیله‌سوار",
  ],
  بوشهر: [
    "بوشهر",
    "برازجان",
    "بندر گناوه",
    "بندر کنگان",
    "خورموج",
    "عسلویه",
    "بندر دیلم",
    "جم",
  ],
  زنجان: ["زنجان", "ابهر", "خرمدره", "قیدار", "هیدج", "صائین‌قلعه", "سلطانیه"],
  سمنان: [
    "سمنان",
    "شاهرود",
    "دامغان",
    "گرمسار",
    "مهدی‌شهر",
    "ایوانکی",
    "شهمیرزاد",
  ],
  "چهارمحال و بختیاری": [
    "شهرکرد",
    "بروجن",
    "لردگان",
    "فارسان",
    "فرخ‌شهر",
    "هفشجان",
    "سامان",
  ],
  "خراسان شمالی": [
    "بجنورد",
    "شیروان",
    "اسفراین",
    "آشخانه",
    "جاجرم",
    "گرمه",
    "فاروج",
  ],
  "خراسان جنوبی": [
    "بیرجند",
    "قائن",
    "فردوس",
    "طبس",
    "نهبندان",
    "سرایان",
    "بشرویه",
  ],
  ایلام: ["ایلام", "دهلران", "ایوان", "آبدانان", "دره‌شهر", "مهران", "سرابله"],
  "کهگیلویه و بویراحمد": ["یاسوج", "دوگنبدان", "دهدشت", "چرام", "لنده", "باشت"],
};

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
    province: "",
    city: "",
    clinicAddress: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      "nationalId",
      "mobile",
      "clinicPhone",
      "medicalCouncilCode",
      "age",
    ];
    const finalValue = numericFields.includes(name)
      ? value.replace(/\D/g, "")
      : value;

    // ریست شدن شهر در صورت تغییر استان
    if (name === "province") {
      setFormData((prev) => ({
        ...prev,
        province: value,
        city: "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
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

    if (!formData.province || !formData.city) {
      toast.error("لطفاً استان و شهر مطب را انتخاب کنید.");
      return;
    }

    // ادغام استان، شهر و جزییات آدرس برای ارسال به فیلد clinicAddress در بک‌اند
    const combinedClinicAddress = `استان ${formData.province}، شهر ${formData.city}، ${formData.clinicAddress.trim()}`;

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
      clinicAddress: combinedClinicAddress,
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
      error: (err) =>
        err.response?.data?.error ||
        err.response?.data?.message ||
        "خطا در ثبت‌نام پزشک.",
    });
  };

  const availableCities = formData.province
    ? iranCities[formData.province] || []
    : [];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-in fade-in duration-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
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
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
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
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden"
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
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
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
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden"
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
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              type="password"
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden"
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
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden"
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
              className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gadget-light transition-colors appearance-none cursor-pointer ${!formData.Expertise ? "text-gray-400" : "text-gray-800"}`}
            >
              <option value="" disabled>
                لطفاً تخصص خود را انتخاب کنید...
              </option>
              {medicalSpecialties.map((specialty, index) => (
                <option key={index} value={specialty} className="text-gray-800">
                  {specialty}
                </option>
              ))}
            </select>
            <div className="absolute left-4 top-3.5 pointer-events-none text-gray-400">
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
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gadget-light text-left outline-hidden"
              dir="ltr"
            />
          </div>
        </div>

        {/* ================= فیلدهای انتخاب استان و شهر ================= */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            استان مطب *
          </label>
          <div className="relative">
            <Building2
              className="absolute right-3 top-3 text-gray-400"
              size={16}
            />
            <select
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
              className={`w-full bg-white border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light transition-colors appearance-none cursor-pointer ${
                !formData.province ? "text-gray-400" : "text-gray-800"
              }`}
            >
              <option value="" disabled>
                انتخاب استان...
              </option>
              {Object.keys(iranCities).map((prov) => (
                <option key={prov} value={prov} className="text-gray-800">
                  {prov}
                </option>
              ))}
            </select>
            <div className="absolute left-4 top-3.5 pointer-events-none text-gray-400">
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

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            شهر مطب *
          </label>
          <div className="relative">
            <MapPin
              className="absolute right-3 top-3 text-gray-400"
              size={16}
            />
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              disabled={!formData.province}
              className={`w-full bg-white border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light transition-colors appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed ${
                !formData.city ? "text-gray-400" : "text-gray-800"
              }`}
            >
              <option value="" disabled>
                {formData.province
                  ? "انتخاب شهر..."
                  : "ابتدا استان را انتخاب کنید"}
              </option>
              {availableCities.map((cityName) => (
                <option
                  key={cityName}
                  value={cityName}
                  className="text-gray-800"
                >
                  {cityName}
                </option>
              ))}
            </select>
            <div className="absolute left-4 top-3.5 pointer-events-none text-gray-400">
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

        {/* آدرس دقیق پستی مطب */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نشانی دقیق مطب (خیابان، پلاک، واحد)
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
              placeholder="مثال: خیابان ولیعصر، نرسیده به میدان ونک، پلاک ۱۲، طبقه ۳"
              className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-gadget-light outline-hidden resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          className="w-full sm:w-auto sm:min-w-50 py-3 px-6 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-gadget-dark hover:bg-gadget-dark/90 text-white"
        >
          تکمیل ثبت‌نام پزشک
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
