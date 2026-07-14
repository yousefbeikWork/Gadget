import { useState } from "react";
import {
  CheckCircle2,
  ShieldAlert,
  User,
  MapPin,
  Banknote,
  Car,
  FileCheck,
  Loader2,
  Building,
  Calendar,
  Layers,
  Palette
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import FileUpload from "../../components/FileUpload";

interface Props {
  userProfile: any;
  refreshProfile: () => Promise<void>;
}

export default function LeaderProfile({ userProfile, refreshProfile }: Props) {
  const [docsLoading, setDocsLoading] = useState(false);

  // === استیت اطلاعات خودرو (فقط در صورت داشتن ماشین فرستاده می‌شود) ===
  const [carDetails, setCarDetails] = useState({
    brand: "",
    model: "",
    color: "",
    plateNumber: "",
    manufactureYear: "",
  });

  // === استیت ذخیره نام فایل‌های آپلود شده از مینیو ===
  const [uploadedFiles, setUploadedFiles] = useState({
    nationalIdFront: "",
    nationalIdBack: "",
    vehicleCardFront: "",
    vehicleCardBack: "",
    insurancePhoto: "",
    drivingLicenseFront: "",
    drivingLicenseBack: "",
  });

  const handleCarDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCarDetails({ ...carDetails, [e.target.name]: e.target.value });
  };

  const handleUploadSuccess = (field: keyof typeof uploadedFiles) => (minioObjectName: string) => {
    setUploadedFiles((prev) => ({ ...prev, [field]: minioObjectName }));
  };

  // === ارسال مدارک و مشخصات خودرو برای فعال‌سازی حساب لیدر ===
  const handleDocumentsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // بررسی آپلود مدارک هویتی اجباری
    if (!uploadedFiles.nationalIdFront || !uploadedFiles.nationalIdBack) {
      toast.error("بارگذاری تصویر پشت و روی کارت ملی الزامی است.");
      return;
    }

    // اگر لیدر اعلام کرده خودرو دارد، مدارک و مشخصات ماشین هم اجباری می‌شود
    if (userProfile?.hasCar) {
      if (!carDetails.brand || !carDetails.model || !carDetails.color || !carDetails.plateNumber || !carDetails.manufactureYear) {
        toast.error("لطفاً مشخصات خودروی خود را به طور کامل تکمیل کنید.");
        return;
      }
      if (
        !uploadedFiles.vehicleCardFront ||
        !uploadedFiles.vehicleCardBack ||
        !uploadedFiles.insurancePhoto ||
        !uploadedFiles.drivingLicenseFront ||
        !uploadedFiles.drivingLicenseBack
      ) {
        toast.error("بارگذاری تمامی مدارک و مستندات خودرو الزامی است.");
        return;
      }
    }

    setDocsLoading(true);
    try {
      // ایجاد پی‌لود مطابق داکیومنت ارسالی شما
      const payload: any = {
        nationalIdFront: uploadedFiles.nationalIdFront,
        nationalIdBack: uploadedFiles.nationalIdBack,
      };

      // اگر ماشین دارد، فیلدهای خودرو ملحق می‌شوند
      if (userProfile?.hasCar) {
        payload.brand = carDetails.brand;
        payload.model = carDetails.model;
        payload.color = carDetails.color;
        payload.plateNumber = carDetails.plateNumber;
        payload.manufactureYear = Number(carDetails.manufactureYear) || 0;
        payload.vehicleCardFront = uploadedFiles.vehicleCardFront;
        payload.vehicleCardBack = uploadedFiles.vehicleCardBack;
        payload.insurancePhoto = uploadedFiles.insurancePhoto;
        payload.drivingLicenseFront = uploadedFiles.drivingLicenseFront;
        payload.drivingLicenseBack = uploadedFiles.drivingLicenseBack;
      }

      const response = await api.post("/leader/update-documents", payload);

      if (response.data) {
        toast.success("مدارک و اطلاعات ترابری با موفقیت ثبت شد. پرونده شما در دست بررسی قرار گرفت.");
        await refreshProfile();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در ثبت و ارسال مدارک لیدر.");
    } finally {
      setDocsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return "---";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans" dir="rtl">
      
      {/* ================= وضعیت تاییدیه حساب لیدر ================= */}
      {userProfile?.isActive ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900 mb-1">حساب لیدری شما فعال است</h3>
            <p className="text-sm text-green-700/90">پروفایل شما تایید شده و نام شما در لیست سرویس‌های ترابری بیماران نمایش داده می‌شود.</p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 flex items-start gap-3 text-sm font-medium">
          <ShieldAlert size={24} className="shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-bold text-amber-900 mb-1">حساب کاربری غیرفعال (در انتظار تایید مدارک)</p>
            <p className="leading-relaxed text-amber-700/90">
              جهت احراز هویت و فعال‌سازی پنل لیدری در سیستم، لطفاً فرم مشخصات و اسناد خواسته شده زیر را با دقت تکمیل و ارسال نمایید.
            </p>
          </div>
        </div>
      )}

      {/* ================= مشخصات شناسنامه‌ای لیدر (Read-only) ================= */}
      <div className="space-y-4 opacity-90 bg-white border border-gray-100 p-5 rounded-2xl shadow-2xs">
        <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
          <User size={18} className="text-gray-400" />
          مشخصات فردی لیدر
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">نام و نام خانوادگی</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold cursor-not-allowed">
              {userProfile?.firstName} {userProfile?.lastName}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">کد ملی</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed" dir="ltr">
              {userProfile?.nationalId || "---"}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">سن</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed">
              {userProfile?.age} سال
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">تلفن همراه</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed" dir="ltr">
              {userProfile?.mobile}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">شهر محل فعالیت</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-bold cursor-not-allowed flex items-center gap-1.5">
              <Building size={14} className="text-gray-400" /> {userProfile?.city || "---"}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">دستمزد مصوب روزانه</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-emerald-600 rounded-xl px-4 py-2.5 text-sm font-bold cursor-not-allowed flex items-center gap-1.5">
              <Banknote size={14} /> {formatPrice(userProfile?.DailyPrice)}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 mb-1">آدرس سکونت</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed truncate" title={userProfile?.Address}>
              <MapPin size={14} className="text-gray-400 inline ml-1" /> {userProfile?.Address || "---"}
            </div>
          </div>
        </div>
      </div>

      {/* ================= فرم نهایی ثبت اسناد و خودرو ================= */}
      <form onSubmit={handleDocumentsSubmit} className="space-y-8">
        
        {/* فیلدهای مشخصات ماشین - فقط در صورتی که لیدر زمان ثبت‌نام تیک خودرو را زده باشد */}
        {userProfile?.hasCar && (
          <div className="space-y-4 bg-white border border-gray-100 p-5 rounded-2xl shadow-2xs">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Car size={18} className="text-amber-500" />
              مشخصات و اطلاعات ترابری خودرو
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">برند خودرو *</label>
                <input
                  type="text"
                  name="brand"
                  placeholder=" Toyota"
                  required
                  disabled={userProfile?.isActive}
                  value={carDetails.brand}
                  onChange={handleCarDetailsChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-gadget-light outline-hidden disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">مدل خودرو *</label>
                <input
                  type="text"
                  name="model"
                  placeholder=" Corolla"
                  required
                  disabled={userProfile?.isActive}
                  value={carDetails.model}
                  onChange={handleCarDetailsChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-gadget-light outline-hidden disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">رنگ خودرو *</label>
                <div className="relative">
                  <Palette className="absolute right-3 top-3 text-gray-400" size={14} />
                  <input
                    type="text"
                    name="color"
                    placeholder="سفید، مشکی..."
                    required
                    disabled={userProfile?.isActive}
                    value={carDetails.color}
                    onChange={handleCarDetailsChange}
                    className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-sm focus:border-gadget-light outline-hidden disabled:bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">شماره پلاک خودرو *</label>
                <div className="relative">
                  <Layers className="absolute right-3 top-3 text-gray-400" size={14} />
                  <input
                    type="text"
                    name="plateNumber"
                    placeholder="12الف345 ایران 99"
                    required
                    disabled={userProfile?.isActive}
                    value={carDetails.plateNumber}
                    onChange={handleCarDetailsChange}
                    className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-sm focus:border-gadget-light outline-hidden disabled:bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">سال تولید *</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-3 text-gray-400" size={14} />
                  <input
                    type="number"
                    name="manufactureYear"
                    placeholder="2023 یا 1402"
                    required
                    disabled={userProfile?.isActive}
                    value={carDetails.manufactureYear}
                    onChange={handleCarDetailsChange}
                    className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-sm focus:border-gadget-light outline-hidden disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* بخش آپلود اسناد مدارک (فقط در صورت غیرفعال بودن حساب نشان داده می‌شود) */}
        {!userProfile?.isActive && (
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-2xs space-y-6">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileCheck size={18} className="text-gadget-dark" />
              بارگذاری مدارک هویتی و ترابری جهت احراز هویت
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* مدارک هویتی لیدر */}
              <FileUpload
                label="تصویر روی کارت ملی لیدر *"
                onUploadSuccess={handleUploadSuccess("nationalIdFront")}
                acceptedTypes="image/jpeg,image/png,image/jpg"
              />
              <FileUpload
                label="تصویر پشت کارت ملی لیدر *"
                onUploadSuccess={handleUploadSuccess("nationalIdBack")}
                acceptedTypes="image/jpeg,image/png,image/jpg"
              />

              {/* مدارک تکمیلی خودرو (شرطی بر اساس وضعیت مالکیت خودرو) */}
              {userProfile?.hasCar && (
                <>
                  <FileUpload
                    label="تصویر روی کارت خودرو *"
                    onUploadSuccess={handleUploadSuccess("vehicleCardFront")}
                    acceptedTypes="image/jpeg,image/png,image/jpg"
                  />
                  <FileUpload
                    label="تصویر پشت کارت خودرو *"
                    onUploadSuccess={handleUploadSuccess("vehicleCardBack")}
                    acceptedTypes="image/jpeg,image/png,image/jpg"
                  />
                  <FileUpload
                    label="تصویر بیمه‌نامه شخص ثالث معتبر *"
                    onUploadSuccess={handleUploadSuccess("insurancePhoto")}
                    acceptedTypes="image/jpeg,image/png,image/jpg"
                  />
                  <FileUpload
                    label="تصویر روی گواهینامه رانندگی *"
                    onUploadSuccess={handleUploadSuccess("drivingLicenseFront")}
                    acceptedTypes="image/jpeg,image/png,image/jpg"
                  />
                  <FileUpload
                    label="تصویر پشت گواهینامه رانندگی *"
                    onUploadSuccess={handleUploadSuccess("drivingLicenseBack")}
                    acceptedTypes="image/jpeg,image/png,image/jpg"
                  />
                </>
              )}
            </div>

            {/* دکمه ارسال نهایی مستندات */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={docsLoading}
                className="w-full md:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3.5 px-10 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {docsLoading ? <Loader2 className="animate-spin" size={18} /> : <FileCheck size={18} />}
                {docsLoading ? "در حال ارسال اطلاعات..." : "ارسال و ثبت نهایی مدارک"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}