import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FlaskConical,
  Search,
  MapPin,
  Phone,
  Clock,
  ChevronLeft,
  Loader2,
  Beaker,
  Building2,
} from "lucide-react";
import api from "../services/api";

// 👈 تعریف ساختار داده بر اساس خروجی بک‌اند شما
interface TestItem {
  testName: string;
  testCode: string;
  department: string;
  price: number;
}

interface Laboratory {
  id: string;
  centerName: string;
  centerType: string;
  specialty: string;
  address: string;
  phones: string[];
  workingHours: string;
  activeDepartments: string[];
  laboratorImages: string[];
  availableTests: TestItem[];
}

export default function Laboratories() {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLaboratories = async () => {
      try {
        setLoading(true);
        // 👈 فراخوانی لیست آزمایشگاه‌ها از سرور
        const response = await api.get("/laboratory/listLaboratory");
        if (response.data && response.data.success) {
          setLaboratories(response.data.data);
        }
      } catch (error) {
        console.error("خطا در دریافت لیست آزمایشگاه‌ها:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLaboratories();
  }, []);

  // فیلتر کردن لیست بر اساس جستجو
  const filteredLaboratories = laboratories.filter((lab) =>
    lab.centerName.includes(searchQuery) || lab.address.includes(searchQuery)
  );

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* ================= هدر و نوار جستجو ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-xl">
              <FlaskConical size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                لیست آزمایشگاه‌ها
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                مراکز آزمایشگاهی همکار را پیدا کنید
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              className="absolute right-4 top-3.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="جستجوی نام یا آدرس آزمایشگاه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-12 pl-4 py-3 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-all shadow-inner"
            />
          </div>
        </div>

        {/* ================= لیست کارت‌ها ================= */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال دریافت اطلاعات مراکز...</p>
          </div>
        ) : filteredLaboratories.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 p-12 text-center rounded-2xl text-gray-500">
            <Beaker
              size={48}
              strokeWidth={1}
              className="mx-auto mb-3 text-gray-300"
            />
            <p className="font-medium text-lg">آزمایشگاهی یافت نشد.</p>
            <p className="text-sm mt-1">
              متأسفانه مرکزی با این مشخصات در سیستم ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLaboratories.map((lab) => (
              <div
                key={lab.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300"
              >
                {/* بخش بالایی کارت (عکس + نام) */}
                <div className="p-5 border-b border-gray-50 flex items-start gap-4">
                  {/* عکس مرکز یا آیکون پیش‌فرض */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gadget-light/10 border border-gadget-light/20 flex items-center justify-center shrink-0 shadow-inner">
                    {lab.laboratorImages && lab.laboratorImages.length > 0 ? (
                      <img
                        src={lab.laboratorImages[0]}
                        alt={lab.centerName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // اگر عکس لود نشد، آیکون نشان بده
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                        }}
                      />
                    ) : (
                      <Building2 size={28} className="text-gadget-light" />
                    )}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-gray-800 text-lg truncate mb-1">
                      {lab.centerName}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {lab.specialty || "آزمایشگاه تشخیص طبی"}
                    </span>
                  </div>
                </div>

                {/* بخش میانی (اطلاعات تماس و آدرس) */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed line-clamp-2">
                      {lab.address || "آدرس ثبت نشده است"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={18} className="text-gray-400 shrink-0" />
                    <span dir="ltr" className="font-medium">
                      {lab.phones && lab.phones.length > 0
                        ? lab.phones[0]
                        : "---"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock size={18} className="text-gray-400 shrink-0" />
                    <span>ساعت کاری: {lab.workingHours || "---"}</span>
                  </div>

                  {/* تگ‌های بخش‌های فعال (مثل هماتولوژی و...) */}
                  {lab.activeDepartments && lab.activeDepartments.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-gray-400 mb-2">
                        بخش‌های فعال:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {lab.activeDepartments.slice(0, 3).map((dept, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-600 text-[11px] px-2 py-1 rounded-md"
                          >
                            {dept}
                          </span>
                        ))}
                        {lab.activeDepartments.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 text-[11px] px-2 py-1 rounded-md">
                            +{lab.activeDepartments.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* دکمه پایین کارت */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                  <Link
                    to={`/laboratories/${lab.id}`}
                    className="flex items-center justify-between w-full bg-white hover:bg-gadget-dark hover:text-white text-gadget-dark border border-gadget-dark/20 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group"
                  >
                    <span>
                      مشاهده جزئیات و تست‌ها (
                      {lab.availableTests?.length || 0} تست)
                    </span>
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}