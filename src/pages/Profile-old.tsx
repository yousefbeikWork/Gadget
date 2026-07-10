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
  Calendar,
  FileText,
  Stethoscope,
  Clock,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import FileUpload from "../components/FileUpload";
import DoctorAvatar from "../components/DoctorAvatar";

interface DoctorInfo {
  _id: string;
  role: string;
  firstName: string;
  lastName: string;
  Expertise: string;
}

interface HealthRecord {
  _id: string;
  title: string;
  description: string;
  prescription: string;
  attachments?: string[];
  createdAt: string;
  doctor?: DoctorInfo;
}

export default function Profile() {
  const { userProfile, userRole, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);

  // استیت فرم اصلی
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
    avatar: "",
  });

  const [clinicDocs, setClinicDocs] = useState({
    establishmentLicenseFile: "",
    exploitationLicenseFile: "",
    managerIdFront: "",
    managerIdBack: "",
    introductionLetterFile: "",
    liabilityInsuranceFile: "",
  });

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

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
        avatar: userProfile.imageProfile || "",
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (userRole === "Patient" && userProfile?._id) {
      const fetchMyHealthRecords = async () => {
        try {
          setLoadingRecords(true);
          const response = await api.get(
            `/healthRecords/historyPationtsHelthRecord/${userProfile._id}`,
          );
          if (response.data && response.data.records) {
            setHealthRecords(response.data.records);
          }
        } catch (err) {
          console.error("خطا در دریافت پرونده سلامت بیمار", err);
        } finally {
          setLoadingRecords(false);
        }
      };
      fetchMyHealthRecords();
    }
  }, [userRole, userProfile?._id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 👈 اصلاح شد: هندلر زنجیره‌ای آپلود موفق آواتار بر اساس فرآیند جدید شما
  const handleAvatarUploadSuccess = async (minioObjectName: string) => {
    const loadingToast = toast.loading(
      "در حال ثبت تصویر پروفایل شما در دیتابیس...",
    );
    try {
      // مرحله دوم: ثبت تصویر در فرمت درخواستی بک‌اند پزشک (با حروف کوچک minioobjectName)
      await api.post("/doctor/addDoctorProfileImage", {
        minioobjectName: minioObjectName,
      });

      // مرحله سوم: بروزرسانی استیت فرم برای تحریک لود شدن تصویر از سرور و بروزرسانی کانتکست
      setFormData((prev) => ({ ...prev, avatar: minioObjectName }));
      await refreshProfile(); // سینک کردن منوها و سایدبار

      toast.success("تصویر پروفایل پزشک با موفقیت تغییر کرد", {
        id: loadingToast,
      });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "خطا در ثبت نهایی تصویر پروفایل",
        { id: loadingToast },
      );
    }
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
        // آواتار قبلا در فرآیند خودکار ثبت شده است، اما برای احتیاط فرستاده می‌شود
        payload.avatar = formData.avatar;
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
      setFormData((prev) => ({
        ...prev,
        avatar: userProfile?.imageProfile || "",
      }));
      setLoading(false);
    }
  };

  const handleUploadSuccess =
    (field: keyof typeof clinicDocs) => (minioObjectName: string) => {
      setClinicDocs((prev) => ({ ...prev, [field]: minioObjectName }));
    };

  const handleClinicDocsSubmit = async () => {
    const requiredFiles = Object.values(clinicDocs);
    if (requiredFiles.some((file) => file === "")) {
      toast.error(
        "لطفاً تمامی مدارک خواسته‌شده را بارگذاری کنید. هیچ فیلدی نباید خالی بماند.",
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
            "مدارک با موفقیت تایید و در پرونده کلینیک ثبت شدند.",
        );
        await refreshProfile();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "خطا در ثبت نهایی مدارک. لطفاً دوباره تلاش کنید.",
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
            {userRole === "MedicalCenter" ? (
              <Building size={28} />
            ) : (
              <User size={28} />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {userRole === "MedicalCenter"
                ? "پروفایل و مدارک مرکز درمانی"
                : "حساب کاربری من"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              مشاهده و مدیریت اطلاعات کاربری
            </p>
          </div>
        </div>

        {/* ================== اطلاعات سیستمی (غیرقابل تغییر) ================== */}
        <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-gray-400" />
            اطلاعات سیستمی (غیرقابل تغییر)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                نقش کاربری
              </label>
              <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                <span>
                  {userRole === "Doctor"
                    ? "پزشک"
                    : userRole === "Patient"
                      ? "بیمار"
                      : "مرکز درمانی"}
                </span>
                <Lock size={14} className="opacity-50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                شماره موبایل سیستم
              </label>
              <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                <span dir="ltr">{userProfile?.mobile || "---"}</span>
                <Lock size={14} className="opacity-50" />
              </div>
            </div>

            {userRole === "MedicalCenter" ? (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  نام ثبت شده در سامانه
                </label>
                <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                  <span>{userProfile?.centerName || "---"}</span>
                  <Lock size={14} className="opacity-50" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  کد ملی / اتباع
                </label>
                <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                  <span dir="ltr">{userProfile?.nationalId || "---"}</span>
                  <Lock size={14} className="opacity-50" />
                </div>
              </div>
            )}

            {userRole === "Doctor" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    شماره نظام پزشکی
                  </label>
                  <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                    <span dir="ltr">
                      {userProfile?.medicalCouncilCode || "---"}
                    </span>
                    <Lock size={14} className="opacity-50" />
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    تخصص ثبت شده
                  </label>
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
          <form
            onSubmit={handleSubmit}
            className="space-y-8 animate-in fade-in"
          >
            <div className="space-y-4">
              {/* 👈 لایه رندر هوشمند آواتار پزشک بر اساس داده باینری لود شده از سرور */}
              {userRole === "Doctor" && (
                <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-6">
                  <div className="relative shrink-0">
                    <DoctorAvatar
                      imageProfile={formData.avatar}
                      firstName={formData.firstName}
                      className="w-24 h-24 border-4 border-white shadow-md text-3xl shrink-0"
                    />
                  </div>
                  <div className="flex-1 w-full text-center md:text-right">
                    <h3 className="font-bold text-gray-700 text-sm mb-1">
                      تصویر پروفایل پزشک (TAP.NET)
                    </h3>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      تصویر شما پس از آپلود، مستقیماً به سرور متصل شده و در تمام
                      بخش‌های سامانه بروزرسانی می‌شود.
                    </p>
                    <div className="max-w-xs mx-auto md:mx-0">
                      <FileUpload
                        label="انتخاب تصویر جدید"
                        onUploadSuccess={handleAvatarUploadSuccess}
                        acceptedTypes="image/jpeg,image/png,image/jpg"
                      />
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <User size={18} className="text-gadget-light" />
                اطلاعات فردی
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نام
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نام خانوادگی
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    سن
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      نام پدر
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      جنسیت
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                    >
                      <option value="MALE">مرد</option>
                      <option value="FEMALE">زن</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      وضعیت تأهل
                    </label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
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
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        نام قیم
                      </label>
                      <input
                        type="text"
                        name="guardianFirstName"
                        value={formData.guardianFirstName}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        نام خانوادگی قیم
                      </label>
                      <input
                        type="text"
                        name="guardianLastName"
                        value={formData.guardianLastName}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        کد ملی قیم
                      </label>
                      <input
                        type="text"
                        name="guardianNationalId"
                        value={formData.guardianNationalId}
                        onChange={handleChange}
                        dir="ltr"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        شماره موبایل قیم
                      </label>
                      <input
                        type="text"
                        name="guardianMobile"
                        value={formData.guardianMobile}
                        onChange={handleChange}
                        dir="ltr"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        آدرس قیم
                      </label>
                      <input
                        type="text"
                        name="guardianAddress"
                        value={formData.guardianAddress}
                        onChange={handleChange}
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      شماره تلفن مطب / کلینیک
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute right-3 top-3 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        name="clinicPhone"
                        value={formData.clinicPhone}
                        onChange={handleChange}
                        dir="ltr"
                        className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      آدرس مطب
                    </label>
                    <div className="relative">
                      <MapPin
                        className="absolute right-3 top-3 text-gadget-light"
                        size={18}
                      />
                      <input
                        type="text"
                        name="clinicAddress"
                        value={formData.clinicAddress}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      آدرس سازمان / مرکز درمانی
                    </label>
                    <div className="relative">
                      <Building
                        className="absolute right-3 top-3 text-gadget-dark"
                        size={18}
                      />
                      <input
                        type="text"
                        name="orgAddress"
                        value={formData.orgAddress}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gadget-dark hover:bg-gadget-dark/90 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </form>
        )}

        {/* ================== پرونده سلامت من (فقط نمایش برای بیمار) ================== */}
        {userRole === "Patient" && (
          <div className="mt-12 pt-8 border-t border-gray-100 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity size={22} className="text-gadget-light" />
              پرونده سلامت من (سوابق ویزیت و نسخه‌ها)
            </h2>

            {loadingRecords ? (
              <div className="flex flex-col items-center justify-center py-12 text-gadget-light">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="text-sm font-medium">
                  در حال واکشی پرونده الکترونیک سلامت...
                </p>
              </div>
            ) : healthRecords.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 p-8 text-center rounded-2xl text-gray-500 text-sm">
                <FileText
                  size={36}
                  strokeWidth={1.5}
                  className="mx-auto mb-2 text-gray-400"
                />
                هنوز هیچ پرونده ویزیت یا نسخه‌ای برای شما در سیستم ثبت نشده است.
              </div>
            ) : (
              <div className="relative border-r-2 border-gray-100 pr-6 space-y-6 py-2">
                {healthRecords.map((record) => (
                  <div
                    key={record._id}
                    className="relative animate-in fade-in slide-in-from-bottom-2"
                  >
                    <span className="absolute -right-8.75 top-4 w-4 h-4 rounded-full bg-gadget-light ring-4 ring-white shadow-xs"></span>

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-gray-50 pb-3">
                        <h3 className="font-bold text-md text-gray-800">
                          {record.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <Calendar size={14} className="text-gray-400" />
                            {new Date(record.createdAt).toLocaleDateString(
                              "fa-IR",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </span>
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <Clock size={14} className="text-gray-400" />
                            ساعت{" "}
                            {new Date(record.createdAt).toLocaleTimeString(
                              "fa-IR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {record.doctor && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50/70 border border-blue-100 px-3 py-1.5 rounded-xl w-fit">
                            <Stethoscope size={14} />
                            پزشک معالج: دکتر {record.doctor.firstName}{" "}
                            {record.doctor.lastName} ({record.doctor.Expertise})
                          </div>
                        )}

                        <div>
                          <h4 className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
                            تشخیص پزشک:
                          </h4>
                          <p className="text-sm text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                            {record.description}
                          </p>
                        </div>
                        {record.prescription && (
                          <div>
                            <h4 className="text-xs font-bold text-gadget-light mb-1 flex items-center gap-1">
                              نسخه تجویزشده:
                            </h4>
                            <p className="text-sm text-gadget-dark bg-gadget-light/5 p-3 rounded-xl border border-gadget-light/20 font-medium">
                              {record.prescription}
                            </p>
                          </div>
                        )}

                        {record.attachments &&
                          record.attachments.length > 0 && (
                            <div className="pt-2">
                              <h4 className="text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                                مدارک پیوست:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {record.attachments.map((file, i) => (
                                  <span
                                    key={i}
                                    className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1"
                                  >
                                    <FileText size={12} /> {file}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================== پروفایل اختصاصی مرکز درمانی ================== */}
        {userRole === "MedicalCenter" && (
          <div className="space-y-8 animate-in fade-in">
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
                    مدارک شما تایید شده است. اکنون به تمامی امکانات سامانه از
                    جمله مدیریت پزشکان و نوبت‌دهی دسترسی دارید.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 flex items-start gap-3 text-sm font-medium">
                <ShieldAlert
                  size={24}
                  className="shrink-0 mt-0.5 text-amber-600"
                />
                <div>
                  <p className="font-bold text-amber-900 mb-1">
                    تکمیل پرونده مرکز درمانی
                  </p>
                  <p className="leading-relaxed text-amber-700/90">
                    حساب کاربری کلینیک شما غیرفعال است. جهت بررسی، باید تمامی
                    مدارک خواسته‌شده در انتهای همین صفحه را بارگذاری نمایید.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Stethoscope size={18} className="text-gadget-light" />
                مشخصات ثبت‌شده مرکز
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    کد پروانه / مجوز
                  </label>
                  <div
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700"
                    dir="ltr"
                  >
                    {userProfile?.licenseCode || "---"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    نوع مرکز
                  </label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700">
                    {userProfile?.centerType === "Clinic"
                      ? "کلینیک (درمانگاه)"
                      : userProfile?.centerType || "---"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    تخصص اصلی
                  </label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700">
                    {userProfile?.specialty || "---"}
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    شماره‌های تماس پذیرش
                  </label>
                  <div
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-medium"
                    dir="ltr"
                  >
                    {userProfile?.phones?.join(" - ") || "---"}
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    آدرس کامل مرکز
                  </label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 leading-relaxed">
                    {userProfile?.address || "---"}
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
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    نام کامل مدیر
                  </label>
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700">
                    {userProfile?.manager?.firstName}{" "}
                    {userProfile?.manager?.lastName}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    کد ملی
                  </label>
                  <div
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700"
                    dir="ltr"
                  >
                    {userProfile?.manager?.nationalId || "---"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    شماره تماس مدیر
                  </label>
                  <div
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700"
                    dir="ltr"
                  >
                    {userProfile?.manager?.mobile || "---"}
                  </div>
                </div>
              </div>
            </div>

            {!userProfile?.isActive && (
              <div className="mt-10 border-t border-gray-100 pt-8 space-y-6">
                <h2 className="text-md font-bold text-amber-900 flex items-center gap-2">
                  <FileCheck size={20} className="text-amber-600" />
                  بارگذاری مدارک جهت تایید
                </h2>
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
                    onUploadSuccess={handleUploadSuccess(
                      "introductionLetterFile",
                    )}
                  />
                  <FileUpload
                    label="بیمه مسئولیت مرکز (در صورت وجود) *"
                    onUploadSuccess={handleUploadSuccess(
                      "liabilityInsuranceFile",
                    )}
                  />
                </div>
                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleClinicDocsSubmit}
                    disabled={docsLoading}
                    className="w-full md:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3.5 px-10 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
                  >
                    {docsLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <FileCheck size={20} />
                    )}
                    {docsLoading
                      ? "در حال ارسال و ثبت نهایی..."
                      : "ارسال مدارک برای تایید"}
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
