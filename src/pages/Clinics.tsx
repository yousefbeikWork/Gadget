import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Phone,
  MapPin,
  Activity,
  Trash2,
  Edit,
  Loader2,
  Building2, // 👈 آیکون ساختمان برای کارت‌ها اضافه شد
} from "lucide-react";
import AddClinicModal from "../components/AddClinicModal";
import api from "../services/api";

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

        const result = await response.data;

        if (result.success && result.data) {
          const mappedData: Clinic[] = result.data.map((item: any) => ({
            id: item.id,
            name: item.centerName,
            specialty: item.specialty,
            phone: item.phones && item.phones.length > 0 ? item.phones[0] : "نامشخص",
            address: item.address,
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
      const newClinic = { ...clinicData, id: Date.now().toString() };
      setClinics([newClinic, ...clinics]);
    }
  };

  const handleDeleteClinic = (id: string) => {
    const isConfirmed = window.confirm("آیا از حذف این کلینیک اطمینان دارید؟");
    if (isConfirmed) {
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
    <div className="flex-1 bg-white md:rounded-2xl shadow-lg p-6 md:p-8 overflow-y-auto custom-scrollbar">
      {/* ================= هدر و دکمه افزودن ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gadget-dark">
            مدیریت کلینیک‌ها
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            لیست مراکز درمانی ثبت شده در سامانه
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus size={18} />
          ثبت کلینیک جدید
        </button>
      </div>

      {/* ================= سرچ باکس ================= */}
      <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-8 flex items-center max-w-md focus-within:border-gadget-light focus-within:bg-white transition-colors">
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

      {/* ================= محتوای اصلی (وضعیت‌های مختلف) ================= */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-sm font-medium">در حال دریافت اطلاعات کلینیک‌ها...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
          {error}
        </div>
      ) : filteredClinics.length > 0 ? (
        
        /* ================= شبکه کارت‌های کلینیک ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClinics.map((clinic) => (
            <div 
              key={clinic.id} 
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col h-full group"
            >
              {/* هدر کارت */}
              <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gadget-light/10 text-gadget-light rounded-xl flex items-center justify-center font-bold shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    {clinic.name ? clinic.name[0] : <Building2 size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-md text-gray-800 line-clamp-1" title={clinic.name}>
                      {clinic.name}
                    </h3>
                    <span 
                      className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        clinic.status === "فعال" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {clinic.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* بدنه کارت */}
              <div className="space-y-3 flex-1 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="text-gray-400 shrink-0" size={16} />
                  <span className="text-gray-600 font-medium truncate">{clinic.specialty}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="text-gray-400 shrink-0" size={16} />
                  <span className="text-gray-600 font-medium" dir="ltr">{clinic.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="text-gray-400 shrink-0 mt-0.5" size={16} />
                  <span className="text-gray-600 leading-relaxed line-clamp-2 text-xs" title={clinic.address}>
                    {clinic.address}
                  </span>
                </div>
              </div>

              {/* فوتر کارت (دکمه‌های عملیات) */}
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEditClinic(clinic)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gadget-light/10 hover:text-gadget-light rounded-lg transition-colors cursor-pointer"
                >
                  <Edit size={14} />
                  ویرایش
                </button>
                <button
                  onClick={() => handleDeleteClinic(clinic.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>

      ) : (
        <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center">
          <div className="w-16 h-16 bg-white text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Building2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">کلینیکی یافت نشد</h3>
          <p className="text-gray-500 text-sm">هیچ مرکز درمانی با این مشخصات در سیستم ثبت نشده است.</p>
        </div>
      )}

      {/* ================= مودال ثبت / ویرایش ================= */}
      <AddClinicModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleSaveClinic}
        initialData={editingClinic}
      />
    </div>
  );
}