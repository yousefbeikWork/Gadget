import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Phone,
  FileBadge,
  Loader2,
  Beaker,
  FlaskConical,
} from "lucide-react";
import api from "../services/api";

// 👈 تعریف دقیق اینترفیس‌ها بر اساس دیتای ارسالی بک‌اند شما
interface TestItem {
  _id: string;
  testName: string;
  testCode: string;
  department: string;
  price: number;
  isAvailable: boolean;
  preparationInstructions: string;
}

interface Manager {
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile: string;
  role: string;
}

interface Laboratory {
  _id: string;
  centerName: string;
  centerType: string;
  licenseCode: string;
  ownershipType: string;
  address: string;
  postalCode: string;
  phones: string[];
  activeStaffCount: number;
  specialty: string;
  manager: Manager;
  availableTests: TestItem[];
  laboratorImages: string[];
}

export default function Laboratories() {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLaboratories = async () => {
      try {
        setLoading(true);
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

  const filteredLaboratories = laboratories.filter((lab) =>
    lab.centerName.includes(searchQuery) || lab.address.includes(searchQuery)
  );

  return (
    <div
      className="bg-gray-50 rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ================= هدر و جستجو (دقیقاً مشابه طراحی تصویر) ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="text-gadget-dark">
              {/* آیکون مشابه لوگوی کنار عنوان در تصویر */}
              <FlaskConical size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                لیست آزمایشگاه‌ها
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                مرکز مورد نظر خود را پیدا کنید و نوبت بگیرید
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-87.5">
            <input
              type="text"
              placeholder="جستجوی نام یا آدرس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full pr-4 pl-10 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light transition-all shadow-sm text-gray-700"
            />
            <Search
              className="absolute left-4 top-2.5 text-gray-400"
              size={18}
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
              با این جستجو، مرکزی در سیستم پیدا نشد.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLaboratories.map((lab) => (
              <div
                key={lab._id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {/* بخش بالای کارت: نام و آواتار */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {lab.centerName}
                    </h3>
                    <div>
                      <span className="inline-block bg-teal-50 text-gadget-dark px-3 py-1 rounded-full text-xs font-medium">
                        {lab.specialty || "آزمایشگاه"}
                      </span>
                    </div>
                  </div>
                  
                  {/* آواتار: در صورت نداشتن عکس، حرف اول اسم را نمایش می‌دهد */}
                  <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-gadget-dark text-white flex items-center justify-center text-xl font-bold shadow-sm">
                    {lab.laboratorImages && lab.laboratorImages.length > 0 ? (
                      <img
                        src={lab.laboratorImages[0]}
                        alt={lab.centerName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement?.classList.add(
                            "flex",
                            "items-center",
                            "justify-center"
                          );
                        }}
                      />
                    ) : (
                      lab.centerName.charAt(0)
                    )}
                  </div>
                </div>

                <hr className="border-gray-100 mb-4" />

                {/* بخش میانی: اطلاعات تماس */}
                <div className="space-y-3 flex-1 mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="font-medium" dir="ltr">
                      {lab.licenseCode || "---"}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>کد پروانه:</span>
                      <FileBadge size={16} strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="font-medium" dir="ltr">
                      {lab.phones && lab.phones.length > 0
                        ? lab.phones[0]
                        : "---"}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Phone size={16} strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="flex items-start justify-between text-sm text-gray-600">
                    <span className="font-medium leading-relaxed max-w-[85%] line-clamp-2">
                      {lab.address || "---"}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500 shrink-0 mt-0.5">
                      <MapPin size={16} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* دکمه پایین کارت */}
                <Link
                  to={`/laboratories/${lab._id}`}
                  className="w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white text-center py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  دریافت نوبت
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}