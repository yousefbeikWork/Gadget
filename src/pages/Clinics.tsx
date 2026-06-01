import { useState } from "react";
import {
  Search,
  Plus,
  Phone,
  MapPin,
  Activity,
  Trash2,
  Edit,
} from "lucide-react";
import AddClinicModal from "../components/AddClinicModal";

interface Clinic {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  address: string;
  status: "فعال" | "غیرفعال";
}

const initialClinics: Clinic[] = [
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
  const [clinics, setClinics] = useState<Clinic[]>(initialClinics);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name.includes(searchTerm) || clinic.specialty.includes(searchTerm),
  );

  const handleSaveClinic = (clinicData: Omit<Clinic, "id">) => {
    if (editingClinic) {
      // اگر در حالت ویرایش هستیم، فقط همان کلینیک را در آرایه آپدیت کن
      setClinics(
        clinics.map((clinic) =>
          clinic.id === editingClinic.id
            ? { ...clinicData, id: editingClinic.id }
            : clinic,
        ),
      );
    } else {
      // اگر در حالت ثبت جدید هستیم، یک آیدی جدید بساز و اضافه کن
      const newClinic = { ...clinicData, id: Date.now() };
      setClinics([newClinic, ...clinics]);
    }
  };

  // تابع حذف کلینیک
  const handleDeleteClinic = (id: number) => {
    // یک تاییدیه ساده برای جلوگیری از حذف اشتباه
    const isConfirmed = window.confirm("آیا از حذف این کلینیک اطمینان دارید؟");
    if (isConfirmed) {
      setClinics(clinics.filter((clinic) => clinic.id !== id));
    }
  };

  // تابع پایه برای ویرایش (در آینده به مودال متصل می‌شود)
  const handleEditClinic = (clinic: Clinic) => {
    setEditingClinic(clinic); // دیتای کلینیک را داخل استیت می‌ریزیم
    setIsModalOpen(true); // مودال را باز می‌کنیم
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClinic(null); // حتماً باید نال شود تا دفعه بعد که روی "ثبت جدید" کلیک کردیم، فرم خالی باشد
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gadget-dark">
            مدیریت کلینیک‌ها
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            لیست مراکز درمانی ثبت شده در سامانه گجت
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gadget-light hover:bg-[#209c96] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus size={18} />
          ثبت کلینیک جدید
        </button>
      </div>

      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6 flex items-center max-w-md">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gadget-dark text-white text-sm font-semibold">
                <th className="p-4">نام کلینیک</th>
                <th className="p-4">تخصص اصلی</th>
                <th className="p-4">شماره تماس</th>
                <th className="p-4">آدرس</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4 text-center">عملیات</th> {/* ستون جدید */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
              {filteredClinics.length > 0 ? (
                filteredClinics.map((clinic) => (
                  <tr
                    key={clinic.id}
                    className="hover:bg-gray-100 transition-colors"
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
                    {/* دکمه‌های عملیات */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEditClinic(clinic)}
                          className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="ویرایش"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClinic(clinic.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    کلینیکی با این مشخصات یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddClinicModal
        isOpen={isModalOpen}
        onClose={handleCloseModal} // استفاده از تابع جدید
        onAdd={handleSaveClinic} // استفاده از تابع جدید
        initialData={editingClinic} // پاس دادن دیتای کلینیک به فرم
      />
    </div>
  );
}
