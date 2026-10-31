import { useState } from "react";
import {
  Stethoscope,
  Users,
  TestTube2,
  Plus,
  Banknote,
  ClipboardList,
  Loader2,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import CenterDocumentsSection from "./components/CenterDocumentsSection";

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

  // فرم ثبت تست جدید
  const [newTest, setNewTest] = useState<TestItem>({
    testName: "",
    testCode: "",
    department: "",
    price: "",
    isAvailable: true,
    preparationInstructions: "",
  });

  const handleNewTestChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewTest({ ...newTest, [e.target.name]: e.target.value });
  };

  // ارسال تست جدید به سرور
  const handleAddTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTest.testName.trim() || !newTest.price) {
      toast.error("وارد کردن نام و قیمت تست الزامی است.");
      return;
    }

    setIsSubmittingTest(true);
    try {
      const payload = {
        testName: newTest.testName.trim(),
        testCode: newTest.testCode.trim(),
        department: newTest.department.trim(),
        price: Number(newTest.price),
        isAvailable: newTest.isAvailable,
        preparationInstructions: newTest.preparationInstructions.trim(),
      };

      await api.post("/laboratory/Addtests", payload);
      toast.success("تست جدید با موفقیت به فهرست آزمایشگاه اضافه شد.");

      // ریست فرم
      setNewTest({
        testName: "",
        testCode: "",
        department: "",
        price: "",
        isAvailable: true,
        preparationInstructions: "",
      });

      await refreshProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در ثبت تست جدید.");
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return "---";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  return (
    <div
      className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 font-sans"
      dir="rtl"
    >
      {/* ================= ۱. وضعیت و بارگذاری ۳ مدرک اصلی آزمایشگاه ================= */}
      <CenterDocumentsSection
        userProfile={userProfile}
        refreshProfile={refreshProfile}
        updateEndpoint="/laboratory/updatelaboratoryDocuments"
        centerTypeName="آزمایشگاه"
        extraPayload={{ laboratoryId: userProfile?._id }}
      />

      {/* ================= ۲. مشخصات ثبتی آزمایشگاه (Read-only) ================= */}
      <div className="space-y-4 bg-white border border-gray-200/80 p-5 rounded-2xl sm:rounded-3xl shadow-2xs">
        <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <Stethoscope size={18} className="text-gadget-light" />
          مشخصات ثبتی آزمایشگاه
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">نام آزمایشگاه</label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold">
              {userProfile?.centerName || "---"}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">کد پروانه / مجوز</label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono" dir="ltr">
              {userProfile?.licenseCode || "---"}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">تخصص اصلی</label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold">
              {userProfile?.specialty || "آزمایشگاه تشخیص طبی"}
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-[11px] font-bold text-gray-500 mb-1">شماره تماس پذیرش</label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono" dir="ltr">
              {userProfile?.phones?.join(" ، ") || "---"}
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-[11px] font-bold text-gray-500 mb-1">آدرس کامل مرکز</label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed">
              {userProfile?.address || "---"}
            </div>
          </div>
        </div>
      </div>

      {/* ================= ۳. مشخصات مسئول فنی / مدیر (Read-only) ================= */}
      <div className="space-y-4 bg-white border border-gray-200/80 p-5 rounded-2xl sm:rounded-3xl shadow-2xs">
        <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <Users size={18} className="text-gadget-light" />
          مشخصات مسئول فنی / مدیر آزمایشگاه
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">نام و نام خانوادگی مدیر</label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold">
              {userProfile?.manager?.firstName} {userProfile?.manager?.lastName}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">کد ملی</label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono" dir="ltr">
              {userProfile?.manager?.nationalId || "---"}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">شماره تماس مدیر</label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono" dir="ltr">
              {userProfile?.manager?.mobile || "---"}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">سمت سازمانی</label>
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm">
              {userProfile?.manager?.role || "مسئول فنی"}
            </div>
          </div>
        </div>
      </div>

      {/* ================= ۴. مدیریت تست‌های آزمایشگاه ================= */}
      <div className="space-y-5 bg-white border border-gray-200/80 p-5 rounded-2xl sm:rounded-3xl shadow-2xs">
        <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <TestTube2 size={18} className="text-teal-600" />
          تست‌ها و آزمایش‌های تحت پوشش مرکز
        </h2>

        {/* لیست آزمایش‌های ثبت شده */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {!userProfile?.availableTests || userProfile.availableTests.length === 0 ? (
            <div className="col-span-full bg-gray-50 text-gray-400 text-xs sm:text-sm p-6 rounded-2xl text-center border border-dashed border-gray-200">
              هنوز آزمایشی برای این مرکز ثبت نشده است. از فرم زیر جهت افزودن استفاده کنید.
            </div>
          ) : (
            userProfile.availableTests.map((test: any, index: number) => (
              <div
                key={index}
                className="bg-gray-50/60 border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">{test.testName}</span>
                    {test.testCode && (
                      <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-md font-mono" dir="ltr">
                        کد: {test.testCode}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center justify-between pt-1">
                    <span>بخش: <strong className="text-gray-700">{test.department || "عمومی"}</strong></span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Banknote size={14} /> {formatPrice(test.price)}
                    </span>
                  </div>
                </div>

                {test.preparationInstructions && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl flex gap-1.5 items-start border border-amber-200/70 leading-relaxed">
                    <ClipboardList size={13} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>{test.preparationInstructions}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* فرم ثبت آزمایش جدید */}
        <form
          onSubmit={handleAddTestSubmit}
          className="bg-blue-50/40 border border-blue-100 p-4 sm:p-5 rounded-2xl space-y-3.5"
        >
          <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <Plus size={15} /> افزودن آزمایش جدید به لیست خدمات
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <input
                type="text"
                name="testName"
                placeholder="نام آزمایش (مثلاً CBC)*"
                required
                value={newTest.testName}
                onChange={handleNewTestChange}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-hidden focus:border-blue-400"
              />
            </div>
            <div>
              <input
                type="text"
                name="department"
                placeholder="نام بخش (مثلاً هماتولوژی)"
                value={newTest.department}
                onChange={handleNewTestChange}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-hidden focus:border-blue-400"
              />
            </div>
            <div>
              <input
                type="text"
                name="testCode"
                placeholder="کد اختصاصی تست"
                value={newTest.testCode}
                onChange={handleNewTestChange}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-hidden focus:border-blue-400 font-mono"
              />
            </div>
            <div>
              <input
                type="number"
                name="price"
                placeholder="هزینه (تومان)*"
                required
                value={newTest.price}
                onChange={handleNewTestChange}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-hidden focus:border-blue-400 font-mono"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <input
                type="text"
                name="preparationInstructions"
                placeholder="دستورالعمل‌ها (مثلاً ۸ ساعت ناشتایی کامل قبل از آزمایش)"
                value={newTest.preparationInstructions}
                onChange={handleNewTestChange}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-hidden focus:border-blue-400"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmittingTest}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60"
              >
                {isSubmittingTest ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />}
                <span>{isSubmittingTest ? "در حال ثبت..." : "افزودن تست"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
}