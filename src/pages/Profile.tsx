import { useState, useEffect } from "react";
import {
  User,
  MapPin,
  Phone,
  Building,
  Save,
  Loader2,
  ShieldCheck,
  Lock,
  Activity,
  Users,
  FileCheck,
  ShieldAlert,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import FileUpload from "../components/FileUpload";

export default function Profile() {
  const { userProfile, userRole, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);

  // استیت جامع فرم (شامل فیلدهای پزشک و بیمار)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    clinicAddress: "",
    orgAddress: "",
    clinicPhone: "",
    fatherName: "",
    gender: "MALE",
    maritalStatus: "SINGLE",
    guardianFirstName: "",
    guardianLastName: "",
    guardianNationalId: "",
    guardianMobile: "",
    guardianAddress: "",
  });

  // استیت مدارک (مخصوص کلینیک)
  const [clinicDocs, setClinicDocs] = useState({
    establishmentLicenseFile: "",
    exploitationLicenseFile: "",
    managerIdFront: "",
    managerIdBack: "",
    introductionLetterFile: "",
    liabilityInsuranceFile: "",
  });

  // پر کردن فرم با دیتای فعلی کاربر
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        age: userProfile.age ? String(userProfile.age) : "",
        clinicAddress: userProfile.clinicAddress || "",
        orgAddress: userProfile.orgAddress || "",
        clinicPhone: userProfile.clinicPhone || "",
        fatherName: userProfile.fatherName || "",
        gender: userProfile.gender || "MALE",
        maritalStatus: userProfile.maritalStatus || "SINGLE",
        guardianFirstName: userProfile.guardian?.firstName || "",
        guardianLastName: userProfile.guardian?.lastName || "",
        guardianNationalId: userProfile.guardian?.nationalId || "",
        guardianMobile: userProfile.guardian?.mobile || "",
        guardianAddress: userProfile.guardian?.address || "",
      });
    }
  }, [userProfile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age ? Number(formData.age) : undefined,
      };

      if (userRole === "Doctor") {
        payload.clinicAddress = formData.clinicAddress;
        payload.orgAddress = formData.orgAddress;
        payload.clinicPhone = formData.clinicPhone;
      } else if (userRole === "Patient") {
        payload.fatherName = formData.fatherName;
        payload.gender = formData.gender;
        payload.maritalStatus = formData.maritalStatus;
        payload.guardian = {
          firstName: formData.guardianFirstName,
          lastName: formData.guardianLastName,
          nationalId: formData.guardianNationalId,
          mobile: formData.guardianMobile,
          address: formData.guardianAddress,
        };
      }

      const response = await api.put("/users/profile", payload);

      if (response.data) {
        toast.success("اطلاعات حساب کاربری با موفقیت بروزرسانی شد");
        await refreshProfile();
      }
    } catch (err) {
      toast.error("خطا در بروزرسانی اطلاعات. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  // --- توابع مخصوص ارسال مدارک کلینیک ---
  const handleUploadSuccess =
    (field: keyof typeof clinicDocs) => (minioObjectName: string) => {
      setClinicDocs((prev) => ({ ...prev, [field]: minioObjectName }));
    };

  const handleClinicDocsSubmit = async () => {
    const requiredFiles = Object.values(clinicDocs);
    if (requiredFiles.some((file) => file === "")) {
      toast.error(
        "لطفاً تمامی مدارک خواسته‌شده را بارگذاری کنید. هیچ فیلدی نباید خالی بماند."
      );
      return;
    }

    setDocsLoading(true);
    try {
      const payload = {
        clinicId: userProfile?._id, 
        establishmentLicenseFile: clinicDocs.establishmentLicenseFile,
        exploitationLicenseFile: clinicDocs.exploitationLicenseFile,
        managerIdFiles: [clinicDocs.managerIdFront, clinicDocs.managerIdBack],
        introductionLetterFile: clinicDocs.introductionLetterFile,
        liabilityInsuranceFile: clinicDocs.liabilityInsuranceFile,
      };

      const response = await api.post("/clinic/updateClinicDocuments", payload);

      if (response.data) {
        toast.success(
          response.data.message ||
            "مدارک با موفقیت تایید و در پرونده کلینیک ثبت شدند."
        );
        await refreshProfile();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "خطا در ثبت نهایی مدارک. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setDocsLoading(false);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ================== هدر صفحه ================== */}
        <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
          <div className="p-3 bg-gadget-light/10 text-gadget-light rounded-2xl">
            {userRole === "MedicalCenter" ? <Building size={28} /> : <User size={28} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {userRole === "MedicalCenter" ? "پروفایل و مدارک مرکز درمانی" : "حساب کاربری من"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              مشاهده و مدیریت اطلاعات کاربری
            </p>
          </div>
        </div>

        {/* ================== اطلاعات سیستمی (مشترک برای همه) ================== */}
        <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-gray-400" />
            اطلاعات سیستمی (غیرقابل تغییر)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">نقش کاربری</label>
              <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                <span>
                  {userRole === "Doctor" ? "پزشک" : userRole === "Patient" ? "بیمار" : "مرکز درمانی"}
                </span>
                <Lock size={14} className="opacity-50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">شماره موبایل سیستم</label>
              <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                <span dir="ltr">{userProfile?.mobile || "---"}</span>
                <Lock size={14} className="opacity-50" />
              </div>
            </div>
            
            {userRole === "MedicalCenter" ? (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">نام ثبت شده در سامانه</label>
                <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                  <span>{userProfile?.centerName || "---"}</span>
                  <Lock size={14} className="opacity-50" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">کد ملی / اتباع</label>
                <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                  <span dir="ltr">{userProfile?.nationalId || "---"}</span>
                  <Lock size={14} className="opacity-50" />
                </div>
              </div>
            )}

            {/* فیلدهای سیستمی مخصوص پزشک (کد نظام پزشکی و تخصص) */}
            {userRole === "Doctor" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">شماره نظام پزشکی</label>
                  <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                    <span dir="ltr">{userProfile?.medicalCouncilCode || "---"}</span>
                    <Lock size={14} className="opacity-50" />
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1">تخصص ثبت شده</label>
                  <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                    <span>{userProfile?.Expertise || "---"}</span>
                    <Lock size={14} className="opacity-50" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================== فرم اختصاصی پزشک و بیمار ================== */}
        {(userRole === "Patient" || userRole === "Doctor") && (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in">
             <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <User size={18} className="text-gadget-light" />
                اطلاعات فردی
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">نام</label>
                  <input
                    type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">نام خانوادگی</label>
                  <input
                    type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">سن</label>
                  <input
                    type="number" name="age" value={formData.age} onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* ---> شاخه بیمار (Patient) <--- */}
            {userRole === "Patient" && (
              <div className="space-y-4 animate-in fade-in">
                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Users size={18} className="text-gadget-light" />
                  اطلاعات تکمیلی پرونده
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">نام پدر</label>
                    <input
                      type="text" name="fatherName" value={formData.fatherName} onChange={handleChange}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">جنسیت</label>
                    <select
                      name="gender" value={formData.gender} onChange={handleChange}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                    >
                      <option value="MALE">مرد</option>
                      <option value="FEMALE">زن</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">وضعیت تأهل</label>
                    <select
                      name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                    >
                      <option value="SINGLE">مجرد</option>
                      <option value="MARRIED">متاهل</option>
                    </select>
                  </div>
                </div>

                {/* اطلاعات قیم */}
                <div className="mt-6 border border-gray-100 bg-gray-50/50 p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    اطلاعات قیم
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">نام قیم</label>
                      <input
                        type="text" name="guardianFirstName" value={formData.guardianFirstName} onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">نام خانوادگی قیم</label>
                      <input
                        type="text" name="guardianLastName" value={formData.guardianLastName} onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">کد ملی قیم</label>
                      <input
                        type="text" name="guardianNationalId" value={formData.guardianNationalId} onChange={handleChange} dir="ltr"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">شماره موبایل قیم</label>
                      <input
                        type="text" name="guardianMobile" value={formData.guardianMobile} onChange={handleChange} dir="ltr"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-bold text-gray-700 mb-2">آدرس قیم</label>
                      <input
                        type="text" name="guardianAddress" value={formData.guardianAddress} onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---> شاخه پزشک (Doctor) <--- */}
            {userRole === "Doctor" && (
              <div className="space-y-4 animate-in fade-in">
                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Activity size={18} className="text-gadget-light" />
                  اطلاعات تماس و کاری مطب
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">شماره تلفن مطب / کلینیک</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 text-gray-400" size={18} />
                      <input
                        type="text" name="clinicPhone" value={formData.clinicPhone} onChange={handleChange} dir="ltr"
                        className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">آدرس مطب</label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 text-gadget-light" size={18} />
                      <input
                        type="text" name="clinicAddress" value={formData.clinicAddress} onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">آدرس سازمان / مرکز درمانی</label>
                    <div className="relative">
                      <Building className="absolute right-3 top-3 text-gadget-dark" size={18} />
                      <input
                        type="text" name="orgAddress" value={formData.orgAddress} onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit" disabled={loading}
                className="bg-gadget-dark hover:bg-gadget-dark/90 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </form>
        )}

        {/* ================== پروفایل اختصاصی مرکز درمانی ================== */}
        {userRole === "MedicalCenter" && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* بنر وضعیت کلینیک */}
            {userProfile?.isActive ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5 shadow-sm">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <div className="text-center md:text-right">
                  <h3 className="text-lg font-bold text-green-900 mb-1">
                    پرونده مرکز درمانی شما تایید و فعال است
                  </h3>
                  <p className="text-sm text-green-700/90 leading-relaxed">
                    مدارک شما تایید شده است. اکنون به تمامی امکانات سامانه از جمله مدیریت پزشکان و نوبت‌دهی دسترسی دارید.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 flex items-start gap-3 text-sm font-medium">
                <ShieldAlert size={24} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-bold text-amber-900 mb-1">تکمیل پرونده مرکز درمانی</p>
                  <p className="leading-relaxed text-amber-700/90">
                    حساب کاربری کلینیک شما غیرفعال است. جهت بررسی، باید تمامی مدارک خواسته‌شده در انتهای همین صفحه را بارگذاری نمایید.
                  </p>
                </div>
              </div>
            )}

            {/* اطلاعات ثبت شده کلینیک (نمایش در هر دو حالت) */}
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Stethoscope size={18} className="text-gadget-light" />
                مشخصات ثبت‌شده مرکز
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">کد پروانه / مجوز</label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700" dir="ltr">
                    {userProfile?.licenseCode || '---'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">نوع مرکز</label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700">
                    {userProfile?.centerType === 'Clinic' ? 'کلینیک (درمانگاه)' : userProfile?.centerType || '---'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">تخصص اصلی</label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700">
                    {userProfile?.specialty || '---'}
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1">شماره‌های تماس پذیرش</label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-medium" dir="ltr">
                    {userProfile?.phones?.join(' - ') || '---'}
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1">آدرس کامل مرکز</label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 leading-relaxed">
                    {userProfile?.address || '---'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Users size={18} className="text-gadget-light" />
                مشخصات مدیر / مسئول فنی
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">نام کامل مدیر</label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700">
                    {userProfile?.manager?.firstName} {userProfile?.manager?.lastName}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">کد ملی</label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700" dir="ltr">
                    {userProfile?.manager?.nationalId || '---'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">شماره تماس مدیر</label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700" dir="ltr">
                    {userProfile?.manager?.mobile || '---'}
                  </div>
                </div>
              </div>
            </div>

            {/* بخش آپلود مدارک (فقط در صورتی نمایش داده می‌شود که کلینیک غیرفعال باشد) */}
            {!userProfile?.isActive && (
              <div className="mt-10 border-t border-gray-100 pt-8 space-y-6">
                <h2 className="text-md font-bold text-amber-900 flex items-center gap-2">
                  <FileCheck size={20} className="text-amber-600" />
                  بارگذاری مدارک جهت تایید
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FileUpload
                    label="تصویر مجوز تأسیس از وزارت بهداشت *"
                    onUploadSuccess={handleUploadSuccess("establishmentLicenseFile")}
                  />
                  <FileUpload
                    label="پروانه بهره‌برداری *"
                    onUploadSuccess={handleUploadSuccess("exploitationLicenseFile")}
                  />
                  <FileUpload
                    label="تصویر روی کارت ملی مدیر / مسئول فنی *"
                    onUploadSuccess={handleUploadSuccess("managerIdFront")}
                    acceptedTypes="image/jpeg,image/png,image/jpg"
                  />
                  <FileUpload
                    label="تصویر پشت کارت ملی مدیر / مسئول فنی *"
                    onUploadSuccess={handleUploadSuccess("managerIdBack")}
                    acceptedTypes="image/jpeg,image/png,image/jpg"
                  />
                  <FileUpload
                    label="معرفی‌نامه رسمی (در صورت نمایندگی حقوقی) *"
                    onUploadSuccess={handleUploadSuccess("introductionLetterFile")}
                  />
                  <FileUpload
                    label="بیمه مسئولیت مرکز (در صورت وجود) *"
                    onUploadSuccess={handleUploadSuccess("liabilityInsuranceFile")}
                  />
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleClinicDocsSubmit}
                    disabled={docsLoading}
                    className="w-full md:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3.5 px-10 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
                  >
                    {docsLoading ? <Loader2 className="animate-spin" size={20} /> : <FileCheck size={20} />}
                    {docsLoading ? "در حال ارسال و ثبت نهایی..." : "ارسال مدارک برای تایید"}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}