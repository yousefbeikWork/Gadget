import { useState, useEffect } from "react";
import {
  CheckCircle2,
  ShieldAlert,
  Stethoscope,
  Users,
  FileCheck,
  Loader2,
  Save,
  TestTube2,
  Plus,
  Trash2,
  Banknote,
  ClipboardList
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);

  // === استیت اطلاعات پایه و مدیر ===
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

  // === استیت تست‌های آزمایشگاه ===
  const [tests, setTests] = useState<TestItem[]>([]);
  const [newTest, setNewTest] = useState<TestItem>({
    testName: "",
    testCode: "",
    department: "",
    price: "",
    isAvailable: true,
    preparationInstructions: "",
  });

  // === استیت مدارک (برای زمان ثبت نام اولیه) ===
  const [labDocs, setLabDocs] = useState({
    establishmentLicenseFile: "",
    exploitationLicenseFile: "",
    managerIdFront: "",
    managerIdBack: "",
    introductionLetterFile: "",
    liabilityInsuranceFile: "",
  });

  // پر کردن فرم با دیتای دریافتی از سرور
  useEffect(() => {
    if (userProfile) {
      setFormData({
        centerName: userProfile.centerName || "",
        specialty: userProfile.specialty || "",
        address: userProfile.address || "",
        phone: userProfile.phones?.[0] || "",
        managerFirstName: userProfile.manager?.firstName || "",
        managerLastName: userProfile.manager?.lastName || "",
        managerNationalId: userProfile.manager?.nationalId || "",
        managerMobile: userProfile.manager?.mobile || "",
      });
      setTests(userProfile.availableTests || []);
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewTestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTest({ ...newTest, [e.target.name]: e.target.value });
  };

  // افزودن تست به لیست (در استیت)
  const handleAddTest = () => {
    if (!newTest.testName || !newTest.price) {
      toast.error("وارد کردن نام و قیمت تست الزامی است.");
      return;
    }
    setTests([...tests, { ...newTest, price: Number(newTest.price) }]);
    // ریست کردن فرم تست جدید
    setNewTest({
      testName: "",
      testCode: "",
      department: "",
      price: "",
      isAvailable: true,
      preparationInstructions: "",
    });
  };

  // حذف تست از لیست
  const handleRemoveTest = (index: number) => {
    setTests(tests.filter((_, i) => i !== index));
  };

  // آپدیت کل پروفایل (شامل مشخصات و تست‌ها)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const payload = {
        centerName: formData.centerName,
        specialty: formData.specialty,
        address: formData.address,
        phones: [formData.phone], // ارسال به صورت آرایه طبق ساختار دیتابیس
        manager: {
          firstName: formData.managerFirstName,
          lastName: formData.managerLastName,
          nationalId: formData.managerNationalId,
          mobile: formData.managerMobile,
          role: "laboratorManagment",
        },
        availableTests: tests, // ارسال لیست کامل تست‌ها
      };

      const response = await api.put("/users/profile", payload);

      if (response.data) {
        toast.success("پروفایل و لیست تست‌ها با موفقیت بروزرسانی شد.");
        await refreshProfile();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در بروزرسانی اطلاعات.");
    } finally {
      setIsUpdating(false);
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

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* ================= وضعیت تاییدیه ================= */}
      {userProfile?.isActive ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900 mb-1">پرونده مرکز شما فعال است</h3>
            <p className="text-sm text-green-700/90">اکنون به تمامی امکانات نوبت‌دهی دسترسی دارید.</p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 flex items-start gap-3 text-sm font-medium">
          <ShieldAlert size={24} className="shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-bold text-amber-900 mb-1">تکمیل پرونده مرکز</p>
            <p className="leading-relaxed text-amber-700/90">
              حساب کاربری شما غیرفعال است. جهت بررسی، تمامی مدارک انتهای صفحه را بارگذاری کنید.
            </p>
          </div>
        </div>
      )}

      {/* ================= فرم بروزرسانی پروفایل ================= */}
      <form onSubmit={handleUpdateProfile} className="space-y-8">
        
        {/* مشخصات مرکز */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Stethoscope size={18} className="text-gadget-light" />
            مشخصات پایه آزمایشگاه
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">نام آزمایشگاه</label>
              <input
                type="text"
                name="centerName"
                value={formData.centerName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">تخصص اصلی</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">شماره تماس پذیرش</label>
              <input
                type="text"
                name="phone"
                dir="ltr"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-right focus:border-gadget-light outline-hidden transition-colors"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-gray-500 mb-1">آدرس کامل مرکز</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden transition-colors"
              />
            </div>
          </div>
        </div>

        {/* مشخصات مدیر */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Users size={18} className="text-gadget-light" />
            مشخصات مدیر / مسئول فنی
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">نام مدیر</label>
              <input
                type="text"
                name="managerFirstName"
                value={formData.managerFirstName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">نام خانوادگی مدیر</label>
              <input
                type="text"
                name="managerLastName"
                value={formData.managerLastName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-gadget-light outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">کد ملی</label>
              <input
                type="text"
                name="managerNationalId"
                dir="ltr"
                value={formData.managerNationalId}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-right focus:border-gadget-light outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">شماره موبایل مدیر</label>
              <input
                type="text"
                name="managerMobile"
                dir="ltr"
                value={formData.managerMobile}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-right focus:border-gadget-light outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* ================= مدیریت تست‌های آزمایشگاه ================= */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
            <TestTube2 size={18} className="text-blue-500" />
            مدیریت تست‌های تحت پوشش
          </h2>

          {/* لیست تست‌های فعلی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {tests.length === 0 ? (
              <div className="col-span-full bg-gray-50 text-gray-400 text-sm p-4 rounded-xl text-center border border-dashed">
                هیچ تستی ثبت نشده است. از فرم زیر برای افزودن استفاده کنید.
              </div>
            ) : (
              tests.map((test, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-sm">{test.testName}</span>
                      {test.testCode && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md" dir="ltr">Code: {test.testCode}</span>}
                    </div>
                    <div className="text-xs text-gray-500 flex gap-4">
                      <span>بخش: {test.department || "---"}</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1"><Banknote size={12}/> {test.price} تومان</span>
                    </div>
                    {test.preparationInstructions && (
                      <div className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded-lg flex gap-1 items-start mt-2 border border-amber-100">
                        <ClipboardList size={12} className="shrink-0 mt-0.5"/>
                        {test.preparationInstructions}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTest(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="حذف تست"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* فرم افزودن تست جدید */}
          <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-blue-800 flex items-center gap-1">
              <Plus size={14} /> افزودن تست جدید
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  name="testName"
                  placeholder="نام تست (مثلاً CBC)"
                  value={newTest.testName}
                  onChange={handleNewTestChange}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-blue-400"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="department"
                  placeholder="بخش (مثلاً هماتولوژی)"
                  value={newTest.department}
                  onChange={handleNewTestChange}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-blue-400"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="testCode"
                  placeholder="کد تست (اختیاری)"
                  value={newTest.testCode}
                  onChange={handleNewTestChange}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-blue-400"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="price"
                  placeholder="قیمت به تومان *"
                  value={newTest.price}
                  onChange={handleNewTestChange}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-blue-400"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <input
                  type="text"
                  name="preparationInstructions"
                  placeholder="شرایط آمادگی (مثلاً ۱۲ ساعت ناشتا)"
                  value={newTest.preparationInstructions}
                  onChange={handleNewTestChange}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm outline-hidden focus:border-blue-400"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddTest}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  اضافه به لیست
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* دکمه ذخیره پروفایل */}
        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="bg-gadget-dark hover:bg-gadget-dark/90 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
          >
            {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isUpdating ? "در حال ذخیره..." : "ذخیره تغییرات و تست‌ها"}
          </button>
        </div>
      </form>

      {/* ================= فرم مدارک (فقط در صورت غیرفعال بودن نمایش داده می‌شود) ================= */}
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
              onClick={handleLabDocsSubmit}
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
  );
}