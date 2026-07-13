import { useState, useEffect } from "react";
import {
  CheckCircle2,
  ShieldAlert,
  Stethoscope,
  Users,
  FileCheck,
  Loader2,
  TestTube2,
  Plus,
  Banknote,
  ClipboardList,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import FileUpload from "../../components/FileUpload";

interface TestItem {
  _id?: string;
  testName: string;
  testCode: string;
  department: string;
  price: number | string;
  isAvailable: boolean;
  preparationInstructions: string;
}

interface Props {
  userProfile: any;
  refreshProfile: () => Promise<void>;
}

export default function LaboratoryProfile({ userProfile, refreshProfile }: Props) {
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);

  // === استیت اطلاعات پایه و مدیر (فقط برای نمایش) ===
  const [formData, setFormData] = useState({
    centerName: "",
    specialty: "",
    address: "",
    phone: "",
    managerFirstName: "",
    managerLastName: "",
    managerNationalId: "",
    managerMobile: "",
  });

  // === استیت تست فعال در فرم ===
  const [newTest, setNewTest] = useState<TestItem>({
    testName: "",
    testCode: "",
    department: "",
    price: "",
    isAvailable: true,
    preparationInstructions: "",
  });

  // === استیت مدارک ===
  const [labDocs, setLabDocs] = useState({
    establishmentLicenseFile: "",
    exploitationLicenseFile: "",
    managerIdFront: "",
    managerIdBack: "",
    introductionLetterFile: "",
    liabilityInsuranceFile: "",
  });

  // پر کردن فیلدهای نمایشی از پروفایل لاگین شده
  useEffect(() => {
    if (userProfile) {
      setFormData({
        centerName: userProfile.centerName || "---",
        specialty: userProfile.specialty || "---",
        address: userProfile.address || "---",
        phone: userProfile.phones?.[0] || "---",
        managerFirstName: userProfile.manager?.firstName || "---",
        managerLastName: userProfile.manager?.lastName || "---",
        managerNationalId: userProfile.manager?.nationalId || "---",
        managerMobile: userProfile.manager?.mobile || "---",
      });
    }
  }, [userProfile]);

  const handleNewTestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTest({ ...newTest, [e.target.name]: e.target.value });
  };

  // 👈 ارسال تست جدید به سرور با متد POST
  const handleAddTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTest.testName || !newTest.price) {
      toast.error("وارد کردن نام و قیمت تست الزامی است.");
      return;
    }

    setIsSubmittingTest(true);
    try {
      const payload = {
        testName: newTest.testName,
        testCode: newTest.testCode,
        department: newTest.department,
        price: Number(newTest.price),
        isAvailable: newTest.isAvailable,
        preparationInstructions: newTest.preparationInstructions,
      };

      await api.post("/laboratory/Addtests", payload);
      
      toast.success("تست جدید با موفقیت به آزمایشگاه اضافه شد.");
      
      // ریست کردن فرم افزودن تست
      setNewTest({
        testName: "",
        testCode: "",
        department: "",
        price: "",
        isAvailable: true,
        preparationInstructions: "",
      });

      // رفرش کردن دیتای کامپوننت برای نمایش در لیست تست‌های تحت پوشش
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در ثبت تست جدید.");
    } finally {
      setIsSubmittingTest(false);
    }
  };

  // آپلود مدارک
  const handleUploadSuccess = (field: keyof typeof labDocs) => (minioObjectName: string) => {
    setLabDocs((prev) => ({ ...prev, [field]: minioObjectName }));
  };

  const handleLabDocsSubmit = async () => {
    const requiredFiles = Object.values(labDocs);
    if (requiredFiles.some((file) => file === "")) {
      toast.error("لطفاً تمامی مدارک خواسته‌شده را بارگذاری کنید.");
      return;
    }

    setDocsLoading(true);
    try {
      const payload = {
        laboratoryId: userProfile?._id,
        establishmentLicenseFile: labDocs.establishmentLicenseFile,
        exploitationLicenseFile: labDocs.exploitationLicenseFile,
        managerIdFiles: [labDocs.managerIdFront, labDocs.managerIdBack],
        introductionLetterFile: labDocs.introductionLetterFile,
        liabilityInsuranceFile: labDocs.liabilityInsuranceFile,
      };

      const response = await api.post("/laboratory/updatelaboratoryDocuments", payload);

      if (response.data) {
        toast.success(response.data.message || "مدارک با موفقیت ثبت شدند.");
        await refreshProfile();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در ثبت مدارک.");
    } finally {
      setDocsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return "---";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* ================= وضعیت تاییدیه مرکز ================= */}
      {userProfile?.isActive ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900 mb-1">پرونده مرکز شما فعال است</h3>
            <p className="text-sm text-green-700/90">اکنون به تمامی امکانات نوبت‌دهی سیستم دسترسی دارید.</p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 flex items-start gap-3 text-sm font-medium">
          <ShieldAlert size={24} className="shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-bold text-amber-900 mb-1">تکمیل پرونده مرکز</p>
            <p className="leading-relaxed text-amber-700/90">
              حساب کاربری شما غیرفعال است. جهت بررسی و فعال‌سازی، مدارک انتهای صفحه را بارگذاری کنید.
            </p>
          </div>
        </div>
      )}

      {/* ================= مشخصات مرکز (Read-only) ================= */}
      <div className="space-y-4 opacity-85">
        <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
          <Stethoscope size={18} className="text-gray-400" />
          مشخصات ثبتی آزمایشگاه (غیرقابل ویرایش)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">نام آزمایشگاه</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed">
              {formData.centerName}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">تخصص اصلی</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed">
              {formData.specialty}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">شماره تماس پذیرش</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed" dir="ltr">
              {formData.phone}
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-gray-400 mb-1">آدرس کامل مرکز</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed">
              {formData.address}
            </div>
          </div>
        </div>
      </div>

      {/* ================= مشخصات مدیر (Read-only) ================= */}
      <div className="space-y-4 opacity-85">
        <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
          <Users size={18} className="text-gray-400" />
          مشخصات مسئول فنی / مدیر
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">نام مدیر</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed">
              {formData.managerFirstName}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">نام خانوادگی مدیر</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed">
              {formData.managerLastName}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">کد ملی</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed" dir="ltr">
              {formData.managerNationalId}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">شماره موبایل مدیر</label>
            <div className="w-full bg-gray-50/80 border border-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed" dir="ltr">
              {formData.managerMobile}
            </div>
          </div>
        </div>
      </div>

      {/* ================= مدیریت تست‌های آزمایشگاه ================= */}
      <div className="space-y-6 pt-4 border-t border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <TestTube2 size={18} className="text-blue-500" />
          لیست تست‌های تحت پوشش مرکز
        </h2>

        {/* ۱. نمایش لیست کل تست‌ها از سرور */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!userProfile?.availableTests || userProfile.availableTests.length === 0 ? (
            <div className="col-span-full bg-gray-50 text-gray-400 text-sm p-6 rounded-xl text-center border border-dashed border-gray-200">
              هیچ تستی برای این آزمایشگاه ثبت نشده است. از فرم زیر جهت اضافه کردن استفاده کنید.
            </div>
          ) : (
            userProfile.availableTests.map((test: any, index: number) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 text-sm">{test.testName}</span>
                    {test.testCode && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md" dir="ltr">
                        کد: {test.testCode}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex gap-4">
                    <span>بخش: {test.department || "عام"}</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Banknote size={14} /> {formatPrice(test.price)}
                    </span>
                  </div>
                </div>
                {test.preparationInstructions && (
                  <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg flex gap-1.5 items-start border border-amber-100 leading-relaxed">
                    <ClipboardList size={13} className="shrink-0 mt-0.5" />
                    <span>{test.preparationInstructions}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ۲. فرم اختصاصی افزودن تست جدید (POST) */}
        <form onSubmit={handleAddTestSubmit} className="bg-blue-50/40 border border-blue-100 p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-blue-800 flex items-center gap-1">
            <Plus size={14} /> ثبت و افزودن آزمایش جدید به سیستم
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                name="testName"
                placeholder="نام آزمایش (مثلاً HVP)"
                required
                value={newTest.testName}
                onChange={handleNewTestChange}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-sm outline-hidden focus:border-blue-400"
              />
            </div>
            <div>
              <input
                type="text"
                name="department"
                placeholder="نام بخش (مثلاً ژنتیک)"
                value={newTest.department}
                onChange={handleNewTestChange}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-sm outline-hidden focus:border-blue-400"
              />
            </div>
            <div>
              <input
                type="text"
                name="testCode"
                placeholder="کد اختصاصی تست"
                value={newTest.testCode}
                onChange={handleNewTestChange}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-sm outline-hidden focus:border-blue-400"
              />
            </div>
            <div>
              <input
                type="number"
                name="price"
                placeholder="هزینه به تومان *"
                required
                value={newTest.price}
                onChange={handleNewTestChange}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-sm outline-hidden focus:border-blue-400"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <input
                type="text"
                name="preparationInstructions"
                placeholder="دستورالعمل‌ها (مثلاً نیاز به ۱۰ ساعت ناشتایی قبل از آزمایش)"
                value={newTest.preparationInstructions}
                onChange={handleNewTestChange}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-sm outline-hidden focus:border-blue-400"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmittingTest}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-70"
              >
                {isSubmittingTest ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                {isSubmittingTest ? "در حال ثبت..." : "ثبت تست جدید"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ================= بارگذاری مدارک (فقط در صورت غیرفعال بودن مرکز) ================= */}
      {!userProfile?.isActive && (
        <div className="mt-10 border-t border-gray-100 pt-8 space-y-6">
          <h2 className="text-md font-bold text-amber-900 flex items-center gap-2">
            <FileCheck size={20} className="text-amber-600" />
            بارگذاری اسناد مدارک جهت تایید نهایی پرونده
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
              label="معرفی‌نامه رسمی مرکز *"
              onUploadSuccess={handleUploadSuccess("introductionLetterFile")}
            />
            <FileUpload
              label="بیمه مسئولیت مرکز *"
              onUploadSuccess={handleUploadSuccess("liabilityInsuranceFile")}
            />
          </div>
          <div className="pt-6 flex justify-end">
            <button
              onClick={handleLabDocsSubmit}
              disabled={docsLoading}
              className="w-full md:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3.5 px-10 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
            >
              {docsLoading ? <Loader2 className="animate-spin" size={20} /> : <FileCheck size={20} />}
              {docsLoading ? "در حال ارسال..." : "ارسال مدارک برای تایید"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}