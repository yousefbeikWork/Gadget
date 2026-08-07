import { useState, useEffect } from "react";
import {
  Search,
  Phone,
  MapPin,
  Activity,
  Loader2,
  Building2,
  Hospital,
  Plus,
  X,
  //   ShieldCheck,
  //   CreditCard,
  CheckSquare,
  Users,
  AlertCircle,
  Lock,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  FileCheck,
} from "lucide-react";
import api from "../services/api"; // مسیر api را با توجه به پوشه‌بندی خود تنظیم کنید
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload"; // 👈 ایمپورت کامپوننت آپلود شما

interface ClinicDoctor {
  id: string;
  firstName: string;
  lastName: string;
}

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  address: string;
  status: "فعال" | "غیرفعال";
  isActive: boolean; // 👈 تغییر به بولین برای مدیریت راحت‌تر
  doctors: ClinicDoctor[];
}

export default function HospitalClinics() {
  const navigate = useNavigate()
  const { userProfile } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================= استیت‌های مودال ثبت کلینیک =================
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    managerFirstName: "",
    managerLastName: "",
    managerNationalId: "",
    managerMobile: "",
    password: "",
    centerName: "",
    ownershipType: "Private",
    licenseCode: "",
    specialty: "",
    activeStaffCount: "",
    address: "",
    postalCode: "",
    phones: "",
    agreement: false,
  };
  const [formData, setFormData] = useState(initialFormState);
  // ================= استیت‌های مودال آپلود مدارک کلینیک =================
  const [uploadModalClinic, setUploadModalClinic] = useState<Clinic | null>(
    null,
  );
  const [docsLoading, setDocsLoading] = useState(false);
  const [clinicDocs, setClinicDocs] = useState({
    establishmentLicenseFile: "",
    exploitationLicenseFile: "",
    managerIdFront: "",
    managerIdBack: "",
    introductionLetterFile: "",
    liabilityInsuranceFile: "",
  });

  // ================= دریافت لیست کلینیک‌های بیمارستان =================
  const fetchClinics = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/Hospital/clinics", {
        // 👈 ارسال آیدی بیمارستان به صورت Query Param
        params: {
          hospitalId: userProfile?._id,
        },
      });
      const result = response.data;

      if (result.success && result.data) {
        const mappedData: Clinic[] = result.data.map((item: any) => ({
          id: item._id || item.id,
          name: item.centerName || item.name || "بدون نام",
          specialty: item.specialty || "ثبت نشده",
          phone:
            item.phones && item.phones.length > 0
              ? item.phones[0]
              : item.mobile || "نامشخص",
          address: item.address || "آدرس ثبت نشده",
          status: item.isActive === false ? "غیرفعال" : "فعال",
          isActive: item.isActive, // 👈 بولین واقعی از سرور
          doctors: item.doctors || [],
        }));
        setClinics(mappedData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در دریافت لیست کلینیک‌ها.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 👈 فقط زمانی که آیدی بیمارستان لود شد، ریکوئست بزن
    if (userProfile?._id) {
      fetchClinics();
    }
  }, [userProfile?._id]);

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name?.includes(searchTerm) ||
      clinic.specialty?.includes(searchTerm),
  );

  // ================= توابع کمکی فرم =================
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
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }

    let finalValue = toEnglishDigits(value);
    if (
      [
        "managerMobile",
        "managerNationalId",
        "postalCode",
        "activeStaffCount",
      ].includes(name)
    ) {
      finalValue = onlyNumbers(finalValue);
    } else if (name === "phones") {
      finalValue = finalValue.replace(/[^\d\s,-]/g, "");
    }
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  // ================= ثبت کلینیک و اتصال به بیمارستان =================
  const handleRegisterAndAttach = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    try {
      // 1. ثبت نام کلینیک جدید
      const payload = {
        mobile: formData.managerMobile,
        password: formData.password,
        centerName: formData.centerName,
        centerType: "Clinic",
        licenseCode: formData.licenseCode,
        ownershipType: formData.ownershipType,
        activeStaffCount: Number(formData.activeStaffCount) || 0,
        specialty: formData.specialty,
        agreement: formData.agreement,
        address: formData.address,
        postalCode: formData.postalCode,
        phones: formData.phones
          .split(/[,-]/)
          .map((p) => p.trim())
          .filter(Boolean),
        manager: {
          firstName: formData.managerFirstName,
          lastName: formData.managerLastName,
          nationalId: formData.managerNationalId,
          mobile: formData.managerMobile,
        },
      };

      const regResponse = await api.post("/clinic/registerClinic", payload);
      const newClinicId =
        regResponse.data?.data?._id ||
        regResponse.data?.clinicId ||
        regResponse.data?.id;

      if (!newClinicId) {
        toast.error(
          "کلینیک ثبت شد اما شناسه آن برای اتصال به بیمارستان دریافت نشد.",
        );
        setIsSubmitting(false);
        return;
      }

      // 2. اتصال کلینیک ساخته شده به بیمارستان
      const attachResponse = await api.post(
        "/Hospital/attachClinicsToHospital",
        {
          clinicIds: [newClinicId],
        },
      );

      if (attachResponse.data?.success) {
        toast.success("کلینیک جدید با موفقیت ثبت و به بیمارستان متصل شد.");
        setFormData(initialFormState);
        setIsAddModalOpen(false);
        fetchClinics(); // رفرش لیست
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در ثبت و اتصال کلینیک.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= توابع آپلود مدارک =================
  const handleUploadSuccess =
    (field: keyof typeof clinicDocs) => (minioObjectName: string) => {
      setClinicDocs((prev) => ({ ...prev, [field]: minioObjectName }));
    };

  const handleClinicDocsSubmit = async () => {
    if (!uploadModalClinic) return;

    const requiredFiles = Object.values(clinicDocs);
    if (requiredFiles.some((file) => file === "")) {
      toast.error("لطفاً تمامی مدارک خواسته‌شده را بارگذاری کنید.");
      return;
    }

    setDocsLoading(true);
    try {
      const payload = {
        clinicId: uploadModalClinic.id, // آیدی کلینیکی که در حال آپلود مدارکش هستیم
        establishmentLicenseFile: clinicDocs.establishmentLicenseFile,
        exploitationLicenseFile: clinicDocs.exploitationLicenseFile,
        managerIdFiles: [clinicDocs.managerIdFront, clinicDocs.managerIdBack],
        introductionLetterFile: clinicDocs.introductionLetterFile,
        liabilityInsuranceFile: clinicDocs.liabilityInsuranceFile,
      };

      const response = await api.post("/clinic/updateClinicDocuments", payload);

      if (response.data) {
        toast.success("مدارک با موفقیت ارسال شد و در انتظار تایید مدیریت است.");
        setUploadModalClinic(null); // بستن مودال
        fetchClinics(); // رفرش کردن لیست برای آپدیت شدن وضعیت
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در ثبت نهایی مدارک.");
    } finally {
      setDocsLoading(false);
    }
  };

  const openUploadModal = (clinic: Clinic) => {
    setUploadModalClinic(clinic);
    setClinicDocs({
      establishmentLicenseFile: "",
      exploitationLicenseFile: "",
      managerIdFront: "",
      managerIdBack: "",
      introductionLetterFile: "",
      liabilityInsuranceFile: "",
    });
  };
  return (
    <div
      className="bg-gray-50 rounded-2xl md:rounded-3xl border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ================== هدر و جستجو ================== */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-800 rounded-2xl">
              <Hospital size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-800">
                کلینیک‌های تحت پوشش
              </h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">
                مدیریت و نظارت بر کلینیک‌های وابسته به بیمارستان
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full md:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus size={18} /> افزودن کلینیک جدید
            </button>

            <div className="relative w-full md:w-72">
              <Search
                className="absolute right-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="جستجوی نام یا تخصص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-dark focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* ================== مدیریت وضعیت لودینگ و خطا ================== */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-dark flex-1">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-bold text-gray-500">
              در حال همگام‌سازی لیست کلینیک‌ها...
            </p>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center text-sm font-bold border border-red-100 max-w-md mx-auto mt-10">
            {error}
            <button
              onClick={fetchClinics}
              className="block mt-4 mx-auto bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {!isLoading && !error && filteredClinics.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center flex-1 flex flex-col items-center justify-center mt-4">
            <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-4">
              <Hospital size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              کلینیکی یافت نشد
            </h3>
            <p className="text-gray-500 text-sm">
              هنوز هیچ کلینیکی به بیمارستان شما متصل نشده است.
            </p>
          </div>
        )}

        {/* ================== لیست کارت کلینیک‌ها ================== */}
        {!isLoading && filteredClinics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClinics.map((clinic) => (
              <div
                key={clinic.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gadget-light opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1.5">
                    <h3
                      className="font-bold text-gray-900 text-lg line-clamp-1"
                      title={clinic.name}
                    >
                      {clinic.name}
                    </h3>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold ${clinic.isActive ? "bg-green-50 text-green-600 border border-green-100" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                      >
                        {clinic.isActive ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <ShieldAlert size={12} />
                        )}
                        {clinic.isActive
                          ? "تایید شده و فعال"
                          : "نیازمند تکمیل مدارک"}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl shrink-0 bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold shadow-2xs border border-blue-100">
                    <Building2 size={20} />
                  </div>
                </div>

                <hr className="border-gray-50 mb-4" />

                <div className="space-y-3 mb-6 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Activity size={14} />
                      <span className="text-xs font-bold">تخصص:</span>
                    </div>
                    <span className="font-bold text-gray-800 text-left truncate max-w-[70%]">
                      {clinic.specialty || "---"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone size={14} />
                      <span className="text-xs font-bold">تلفن:</span>
                    </div>
                    <span className="font-bold text-gray-800" dir="ltr">
                      {clinic.phone || "---"}
                    </span>
                  </div>
                </div>

                {/* 👈 بخش طلایی: دکمه‌های شرطی بر اساس وضعیت کلینیک */}
                <div className="mt-auto pt-2">
                  {clinic.isActive ? (
                    <button
                      onClick={() => navigate(`/hospital/clinics/${clinic.id}`)}
                      className="w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      ورود و مدیریت کلینیک <ArrowLeft size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => openUploadModal(clinic)}
                      className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileCheck size={16} /> تکمیل مدارک و فعال‌سازی
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* ================== مودال آپلود مدارک ================== */}
      {uploadModalClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-800/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-amber-500 text-white shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileCheck size={20} />
                بارگذاری مدارک کلینیک: {uploadModalClinic.name}
              </h3>
              <button
                onClick={() => setUploadModalClinic(null)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3 mb-8">
                <AlertCircle
                  size={20}
                  className="shrink-0 mt-0.5 text-amber-600"
                />
                <p className="text-sm font-medium leading-relaxed">
                  مدارک خواسته شده را جهت فعال‌سازی و راه‌اندازی این کلینیک
                  آپلود کنید. پس از تایید مدیران سامانه، این مرکز فعال خواهد شد.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FileUpload
                  label="تصویر مجوز تأسیس از وزارت بهداشت *"
                  onUploadSuccess={handleUploadSuccess(
                    "establishmentLicenseFile",
                  )}
                />
                <FileUpload
                  label="پروانه بهره‌برداری *"
                  onUploadSuccess={handleUploadSuccess(
                    "exploitationLicenseFile",
                  )}
                />
                <FileUpload
                  label="تصویر روی کارت ملی مدیر *"
                  onUploadSuccess={handleUploadSuccess("managerIdFront")}
                  acceptedTypes="image/*"
                />
                <FileUpload
                  label="تصویر پشت کارت ملی مدیر *"
                  onUploadSuccess={handleUploadSuccess("managerIdBack")}
                  acceptedTypes="image/*"
                />
                <FileUpload
                  label="معرفی‌نامه رسمی *"
                  onUploadSuccess={handleUploadSuccess(
                    "introductionLetterFile",
                  )}
                />
                <FileUpload
                  label="بیمه مسئولیت مرکز *"
                  onUploadSuccess={handleUploadSuccess(
                    "liabilityInsuranceFile",
                  )}
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setUploadModalClinic(null)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
              >
                بعداً انجام می‌دهم
              </button>
              <button
                type="button"
                onClick={handleClinicDocsSubmit}
                disabled={docsLoading}
                className="bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-8 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {docsLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckSquare size={16} />
                )}
                {docsLoading ? "در حال ارسال..." : "ارسال مدارک برای تایید"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== مودال ثبت نام کلینیک جدید ================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-800/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* هدر مودال */}
            <div className="flex items-center justify-between px-6 py-4 bg-gadget-dark text-white shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Plus size={20} className="text-gadget-light" />
                ثبت و اتصال کلینیک جدید
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-300 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* بدنه اسکرول‌خور مودال */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <form
                id="clinicRegisterForm"
                onSubmit={handleRegisterAndAttach}
                className="space-y-8"
              >
                {/* اطلاعات ورود و مدیر بصورت یکپارچه */}
                <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2 border-b border-blue-100 pb-2">
                    <Users size={16} className="text-blue-600" /> مشخصات مدیر
                    کلینیک و اطلاعات ورود
                  </h4>

                  <div className="bg-white border border-blue-100 text-blue-800 p-3 rounded-xl flex items-start gap-3 mb-5 text-xs font-medium leading-relaxed">
                    <AlertCircle
                      size={16}
                      className="shrink-0 mt-0.5 text-blue-500"
                    />
                    <span>
                      شماره موبایل و رمز عبوری که در این بخش وارد می‌کنید، به
                      عنوان <strong>نام کاربری و رمز عبور اختصاصی</strong> برای
                      ورود به پنل مدیریت این کلینیک عمل خواهد کرد.
                    </span>
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
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400"
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
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400"
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
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left focus:border-blue-400"
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
                        className="w-full bg-blue-50/50 border border-blue-200 text-blue-700 font-bold rounded-xl px-4 py-2.5 text-sm text-left focus:border-blue-400 focus:bg-white"
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
                          className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:border-blue-400 text-left"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* مشخصات کلینیک */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Building2 size={16} className="text-gadget-dark" /> اطلاعات
                    کلینیک
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        نام کلینیک *
                      </label>
                      <input
                        type="text"
                        name="centerName"
                        value={formData.centerName}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        کد پروانه / مجوز *
                      </label>
                      <input
                        type="text"
                        name="licenseCode"
                        value={formData.licenseCode}
                        onChange={handleChange}
                        required
                        dir="ltr"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left focus:border-gadget-light"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        تخصص اصلی
                      </label>
                      <input
                        type="text"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        تعداد پرسنل فعال
                      </label>
                      <input
                        type="text"
                        name="activeStaffCount"
                        value={formData.activeStaffCount}
                        onChange={handleChange}
                        dir="ltr"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left focus:border-gadget-light"
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
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light"
                      >
                        <option value="Private">خصوصی</option>
                        <option value="Public">دولتی</option>
                        <option value="Charity">خیریه</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* اطلاعات تماس */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <MapPin size={16} className="text-gadget-dark" /> اطلاعات
                    تماس و آدرس
                  </h4>
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
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light"
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
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left focus:border-gadget-light"
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
                          className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-left focus:border-gadget-light"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* تایید قوانین */}
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <input
                    id="agreement"
                    name="agreement"
                    type="checkbox"
                    checked={formData.agreement}
                    onChange={handleChange}
                    className="w-5 h-5 text-gadget-light border-gray-300 rounded-md focus:ring-gadget-light cursor-pointer"
                  />
                  <label
                    htmlFor="agreement"
                    className="text-xs font-bold text-gray-700 cursor-pointer"
                  >
                    تایید می‌کنم که اطلاعات وارد شده برای این کلینیک صحت دارد.
                  </label>
                </div>
              </form>
            </div>

            {/* فوتر مودال */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                form="clinicRegisterForm"
                disabled={isSubmitting}
                className="bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 px-8 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckSquare size={16} />
                )}
                {isSubmitting
                  ? "در حال ثبت و اتصال..."
                  : "ثبت نهایی و اتصال کلینیک"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
