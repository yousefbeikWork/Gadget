import { useState } from "react";
import { Search, Plus, Phone, MapPin, Activity } from "lucide-react";

// تعریف ساختار داده‌ای کلینیک برای تایپ‌اسکریپت
interface Clinic {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  address: string;
  status: "فعال" | "غیرفعال";
}

// دیتای موقت و دستی
const mockClinics: Clinic[] = [
  {
    id: 1,
    name: "کلینیک تخصصی قلب آوینا",
    specialty: "کاردینولوژی (قلب)",
    phone: "۰۲۱-۸۸۸۸۴۴۴۴",
    address: "تهران، ولیعصر، بالاتر از میدان ونک، کوچه شاد، پلاک ۱۲",
    status: "فعال",
  },
  {
    id: 2,
    name: "مرکز دندانپزشکی لبخند مدرن",
    specialty: "دندانپزشکی",
    phone: "۰۲۱-۲۲۲۲۳۳۳۳",
    address: "تهران، نیاوران، خیابان باهنر، ساختمان پزشکان پارس",
    status: "فعال",
  },
  {
    id: 3,
    name: "کلینیک شبانه‌روزی مهرگان",
    specialty: "عمومی و داخلی",
    phone: "۰۲۱-۴۴۴۴۵۵۵۵",
    address: "تهران، صادقیه، بلوار فردوس شرق، جنب بانک ملی",
    status: "فعال",
  },
  {
    id: 4,
    name: "مرکز پوست و زیبایی ونوس",
    specialty: "پوست، مو و زیبایی",
    phone: "۰۲۱-۷۷۷۷۶۶۶۶",
    address: "تهران، تهرانپارس، فلکه اول، خیابان رشید، پلاک ۴۵",
    status: "غیرفعال",
  },
];

export default function Clinics() {
  const [searchTerm, setSearchTerm] = useState("");

  // فیلتر کردن هوشمند کلینیک‌ها بر اساس نام یا تخصص
  const filteredClinics = mockClinics.filter(
    (clinic) =>
      clinic.name.includes(searchTerm) || clinic.specialty.includes(searchTerm),
  );

  return (
    <div className="flex-1 bg-[#fbfdfd] p-8 overflow-y-auto" dir="rtl">
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">مدیریت کلینیک‌ها</h1>
          <p className="text-sm text-gray-500 mt-1">
            لیست مراکز درمانی ثبت شده در سامانه گجت
          </p>
        </div>

        {/* دکمه ثبت کلینیک جدید */}
        <button className="flex items-center justify-center gap-2 bg-[#29b6b0] hover:bg-[#209c96] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start md:self-auto">
          <Plus size={18} />
          ثبت کلینیک جدید
        </button>
      </div>

      {/* ابزارهای بالای جدول (باکس جستجو) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 mb-6 flex items-center max-w-md">
        <div className="text-gray-400 ml-3">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="جستجوی نام کلینیک یا تخصص..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm text-gray-700 bg-transparent outline-hidden"
        />
      </div>

      {/* جدول نمایش داده‌ها */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-600 text-sm font-semibold">
                <th className="p-4">نام کلینیک</th>
                <th className="p-4">تخصص اصلی</th>
                <th className="p-4">شماره تماس</th>
                <th className="p-4">آدرس</th>
                <th className="p-4">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
              {filteredClinics.length > 0 ? (
                filteredClinics.map((clinic) => (
                  <tr
                    key={clinic.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {clinic.name}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                        <Activity size={12} />
                        {clinic.specialty}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      <span
                        className="inline-flex items-center gap-1"
                        dir="ltr"
                      >
                        {clinic.phone}
                        <Phone size={14} className="text-gray-400" />
                      </span>
                    </td>
                    <td
                      className="p-4 text-gray-500 max-w-xs truncate"
                      title={clinic.address}
                    >
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400 shrink-0" />
                        {clinic.address}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          clinic.status === "فعال"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {clinic.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    کلینیکی با این مشخصات یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
