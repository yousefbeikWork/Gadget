import { useState } from "react";
import {
  CheckCircle2,
  ShieldAlert,
  Stethoscope,
  Users,
  FileCheck,
  Loader2,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import FileUpload from "../../components/FileUpload";

interface Props {
  userProfile: any;
  refreshProfile: () => Promise<void>;
}

export default function MedicalProfile({ userProfile, refreshProfile }: Props) {
  const [docsLoading, setDocsLoading] = useState(false);
  const [clinicDocs, setClinicDocs] = useState({
    establishmentLicenseFile: "",
    exploitationLicenseFile: "",
    managerIdFront: "",
    managerIdBack: "",
    introductionLetterFile: "",
    liabilityInsuranceFile: "",
  });

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

      // 👈 اندپوینت اختصاصی کلینیک
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
    <div className="space-y-8 animate-in fade-in">
      {/* وضعیت تاییدیه‌ی کلینیک */}
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
              حساب کاربری کلینیک شما غیرفعال است. جهت بررسی، باید تمامی
              مدارک خواسته‌شده در انتهای همین صفحه را بارگذاری نمایید.
            </p>
          </div>
        </div>
      )}

      {/* مشخصات ثبت‌شده کلینیک */}
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

      {/* مشخصات مدیر / مسئول فنی */}
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
              {userProfile?.manager?.firstName} {userProfile?.manager?.lastName}
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

      {/* فرم بارگذاری مدارک */}
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
  );
}