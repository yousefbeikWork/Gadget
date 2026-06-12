import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Phone,
  MapPin,
  Activity,
  Trash2,
  Edit,
  Loader2, // آیکون لودینگ اضافه شد
} from "lucide-react";
import AddClinicModal from "../components/AddClinicModal";
import api from "../services/api";

// نوع id به string تغییر یافت
interface Clinic {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  address: string;
  status: "فعال" | "غیرفعال";
}

export default function Clinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

  // استیت‌های جدید برای مدیریت لودینگ و خطا
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // دریافت داده‌ها از API
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/clinic/listClinc", {
          headers: {
            accept: "application/json",
          },
        });

        if (!response) {
          throw new Error("خطا در برقراری ارتباط با سرور");
        }

        const result = await response.data

        if (result.success && result.data) {
          // مپ کردن داده‌های سرور به فرمت اینترفیس محلی
          const mappedData: Clinic[] = result.data.map((item: any) => ({
            id: item.id,
            name: item.centerName,
            specialty: item.specialty,
            // اگر شماره‌ای وجود داشت اولین شماره را بردار، در غیر اینصورت بنویس نامشخص
            phone:
              item.phones && item.phones.length > 0 ? item.phones[0] : "نامشخص",
            address: item.address,
            // چون در API فیلد وضعیت نداریم، پیش‌فرض همه را فعال در نظر می‌گیریم (مگر اینکه فیلدی برای آن داشته باشید)
            status: "فعال",
          }));

          setClinics(mappedData);
        } else {
          throw new Error("داده‌ای یافت نشد");
        }
      } catch (err: any) {
        setError(err.message || "خطای ناشناخته رخ داده است");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClinics();
  }, []);

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name.includes(searchTerm) || clinic.specialty.includes(searchTerm),
  );

  const handleSaveClinic = (clinicData: Omit<Clinic, "id">) => {
    if (editingClinic) {
      setClinics(
        clinics.map((clinic) =>
          clinic.id === editingClinic.id
            ? { ...clinicData, id: editingClinic.id }
            : clinic,
        ),
      );
    } else {
      // استفاده از toString() چون id در دیتابیس رشته است
      const newClinic = { ...clinicData, id: Date.now().toString() };
      setClinics([newClinic, ...clinics]);
    }
  };

  // نوع آیدی ورودی به string تغییر یافت
  const handleDeleteClinic = (id: string) => {
    const isConfirmed = window.confirm("آیا از حذف این کلینیک اطمینان دارید؟");
    if (isConfirmed) {
      // اینجا در آینده باید درخواست DELETE هم به API بفرستید
      setClinics(clinics.filter((clinic) => clinic.id !== id));
    }
  };

  const handleEditClinic = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClinic(null);
  };

  return (
    <div className="flex-1 bg-white md:rounded-2xl shadow-lg p-8 overflow-y-auto">
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
          className="flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer self-start md:self-auto"
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
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2
                        className="animate-spin text-gadget-dark"
                        size={32}
                      />
                      <p>در حال دریافت اطلاعات...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-red-500 bg-red-50"
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredClinics.length > 0 ? (
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
        onClose={handleCloseModal}
        onAdd={handleSaveClinic}
        initialData={editingClinic}
      />
    </div>
  );
}
