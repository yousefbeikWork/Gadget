import { useState, useEffect } from "react";
import { X, Search, Loader2, Plus, Check, User, Award } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

// تایپ پزشک دریافتی از کاتالوگ عمومی
interface CatalogDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  Expertise: string;
  medicalCouncilCode: string;
}

interface AddClinicDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingDoctorIds: string[]; // 👈 گرفتن لیست آیدی پزشکان فعلی کلینیک برای جلوگیری از اضافه کردن مجدد
}

export default function AddClinicDoctorModal({
  isOpen,
  onClose,
  onSuccess,
  existingDoctorIds,
}: AddClinicDoctorModalProps) {
  const [doctorsCatalog, setDoctorsCatalog] = useState<CatalogDoctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null); // برای لودینگ اختصاصی هر دکمه

  // واکشی لیست کل پزشکان سیستم به محض باز شدن مودال
  useEffect(() => {
    if (!isOpen) return;

    const fetchAllDoctors = async () => {
      try {
        setLoadingCatalog(true);
        // استفاده از همان اندپوینت لیست پزشکان عمومی پروژه شما
        const response = await api.get("/users/doctorsList?page=1&limit=50");
        if (response.data && response.data.success) {
          setDoctorsCatalog(response.data.data);
        }
      } catch (err) {
        toast.error("خطا در دریافت لیست پزشکان سیستم");
      } finally {
        setLoadingCatalog(false);
      }
    };

    fetchAllDoctors();
  }, [isOpen]);

  if (!isOpen) return null;

  // اکشن اضافه کردن پزشک کلیک شده
  const handleAddDoctor = async (doctorId: string) => {
    setSubmittingId(doctorId);
    try {
      const response = await api.post("/clinic/addDoctorToClinic", {
        doctorId,
      });
      if (response.data) {
        toast.success("پزشک با موفقیت به مجموعه شما متصل شد");
        onSuccess(); // رفرش لیست صفحه اصلی
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در اتصال پزشک به کلینیک");
    } finally {
      setSubmittingId(null);
    }
  };

  // فیلتر کردن کاتالوگ پزشکان بر اساس سرچ کاربر
  const filteredCatalog = doctorsCatalog.filter((doc) => {
    const fullName = `${doc.firstName} ${doc.lastName}`;
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.Expertise.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* هدر مودال */}
        <div className="bg-gadget-dark p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-md">انتخاب و اتصال پزشک</h3>
              <p className="text-xs text-gadget-light">
                پزشک مورد نظر را از لیست زیر انتخاب کنید
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer border-none outline-hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* بخش سرچ باکس بالای لیست */}
        <div className="p-4 border-b border-gray-100 shrink-0 bg-gray-50/50">
          <div className="bg-white border border-gray-200 p-2.5 rounded-xl flex items-center focus-within:border-gadget-light transition-colors">
            <Search size={18} className="text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="جستجوی پزشک بر اساس نام یا تخصص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm text-gray-700 bg-transparent outline-hidden"
            />
          </div>
        </div>

        {/* لیست پزشکان (اسکرول‌شونده) */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3 min-h-75">
          {loadingCatalog ? (
            <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-xs font-medium">
                در حال بارگذاری لیست کارشناسان...
              </p>
            </div>
          ) : filteredCatalog.length > 0 ? (
            filteredCatalog.map((doctor) => {
              const isAlreadyAdded = existingDoctorIds.includes(doctor._id);
              const isCurrentSubmitting = submittingId === doctor._id;

              return (
                <div
                  key={doctor._id}
                  className="bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-3 flex items-center justify-between shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-11 h-11 bg-gadget-light/10 text-gadget-light rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                      {doctor.firstName ? (
                        doctor.firstName[0]
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-gray-800 truncate">
                        دکتر {doctor.firstName} {doctor.lastName}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium truncate mt-0.5 flex items-center gap-1">
                        <span>{doctor.Expertise}</span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-0.5 font-mono">
                          <Award size={12} />
                          {doctor.medicalCouncilCode}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* دکمه وضعیت هوشمند */}
                  {isAlreadyAdded ? (
                    <span className="text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0">
                      <Check size={14} />
                      عضو کلینیک
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isCurrentSubmitting}
                      onClick={() => handleAddDoctor(doctor._id)}
                      className="text-xs font-bold text-gadget-dark bg-gray-100 hover:bg-gadget-light/10 hover:text-gadget-light px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
                    >
                      {isCurrentSubmitting ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Plus size={14} />
                      )}
                      {isCurrentSubmitting ? "اتصال..." : "افزودن"}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              پزشکی با این مشخصات یافت نشد.
            </div>
          )}
        </div>

        {/* فوتر مودال */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-left shrink-0">
          <button
            onClick={onClose}
            className="bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
}
