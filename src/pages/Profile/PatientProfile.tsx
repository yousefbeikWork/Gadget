import { useState, useEffect } from "react";
import {
  User,
  Users,
  Save,
  Loader2,
  Activity,
  FileText,
  Calendar,
  Clock,
  Stethoscope,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

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

interface Props {
  userProfile: any;
  refreshProfile: () => Promise<void>;
}

export default function PatientProfile({ userProfile, refreshProfile }: Props) {
  const [loading, setLoading] = useState(false);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isPayingRfid, setIsPayingRfid] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    fatherName: "",
    gender: "MALE",
    maritalStatus: "SINGLE",
    guardianFirstName: "",
    guardianLastName: "",
    guardianNationalId: "",
    guardianMobile: "",
    guardianAddress: "",
  });

  // مقداردهی اولیه فرم
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        age: userProfile.age ? String(userProfile.age) : "",
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

  // دریافت پرونده سلامت الکترونیک
  useEffect(() => {
    if (userProfile?._id) {
      const fetchMyHealthRecords = async () => {
        try {
          setLoadingRecords(true);
          const response = await api.get(
            `/healthRecords/historyPationtsHelthRecord/${userProfile._id}`
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
  }, [userProfile?._id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age ? Number(formData.age) : undefined,
        fatherName: formData.fatherName,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        guardian: {
          firstName: formData.guardianFirstName,
          lastName: formData.guardianLastName,
          nationalId: formData.guardianNationalId,
          mobile: formData.guardianMobile,
          address: formData.guardianAddress,
        },
      };

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

  const handlePayRfid = async () => {
    setIsPayingRfid(true);
    const toastId = toast.loading("در حال اتصال به درگاه پرداخت بانکی...");

    try {
      const response = await api.post("/peyment/rfid/pay", {});

      if (response.data?.success && response.data?.data?.paymentUrl) {
        toast.success("در حال انتقال به درگاه پرداخت...", { id: toastId });
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.error(response.data?.message || "خطا در دریافت آدرس پرداخت.", { id: toastId });
        setIsPayingRfid(false);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "خطا در اتصال به درگاه پرداخت. لطفاً دوباره تلاش کنید.",
        { id: toastId }
      );
      setIsPayingRfid(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in font-sans" dir="rtl">
      
      {/* ================== ۱. کارت وضعیت پرداخت کارت RFID ================== */}
      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all ${
          userProfile?.hasPaidRfid
            ? "bg-emerald-50/70 border-emerald-200"
            : "bg-amber-50/80 border-amber-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 sm:p-3 rounded-2xl shrink-0 shadow-2xs ${
                userProfile?.hasPaidRfid
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              <CreditCard size={22} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-gray-900">
                  وضعیت کارت هوشمند سلامت (RFID)
                </h3>
                {userProfile?.hasPaidRfid ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={12} /> پرداخت شده و فعال
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <AlertCircle size={12} /> در انتظار پرداخت
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-relaxed">
                {userProfile?.hasPaidRfid
                  ? "هزینه صدور کارت هوشمند پرداخت گردیده و اطلاعات پرونده پزشکی بر روی چیپ RFID ثبت شده است."
                  : "جهت صدور کارت هوشمند و ثبت سوابق بر روی چیپ الکترونیکی، هزینه صدور را پرداخت فرمایید."}
              </p>
            </div>
          </div>

          {!userProfile?.hasPaidRfid && (
            <button
              type="button"
              disabled={isPayingRfid}
              onClick={handlePayRfid}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
            >
              {isPayingRfid ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>در حال انتقال...</span>
                </>
              ) : (
                <>
                  <span>پرداخت و فعال‌سازی کارت</span>
                  <ArrowLeft size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ================== ۲. فرم اطلاعات کاربری ================== */}
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        
        {/* اطلاعات فردی */}
        <div className="space-y-3.5">
          <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <User size={18} className="text-gadget-light" />
            اطلاعات فردی بیمار
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">نام *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">نام خانوادگی *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">سن *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
              />
            </div>
          </div>
        </div>

        {/* اطلاعات تکمیلی */}
        <div className="space-y-3.5">
          <h2 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Users size={18} className="text-gadget-light" />
            اطلاعات تکمیلی پرونده
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">نام پدر</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">جنسیت</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light cursor-pointer"
              >
                <option value="MALE">مرد</option>
                <option value="FEMALE">زن</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">وضعیت تأهل</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light cursor-pointer"
              >
                <option value="SINGLE">مجرد</option>
                <option value="MARRIED">متاهل</option>
              </select>
            </div>
          </div>

          {/* اطلاعات قیم */}
          <div className="mt-5 border border-gray-200/80 bg-gray-50/60 p-4 sm:p-5 rounded-2xl space-y-3.5">
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Users size={16} className="text-gray-400" />
              اطلاعات سرپرست / قیم
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">نام قیم</label>
                <input
                  type="text"
                  name="guardianFirstName"
                  value={formData.guardianFirstName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">نام خانوادگی قیم</label>
                <input
                  type="text"
                  name="guardianLastName"
                  value={formData.guardianLastName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">کد ملی قیم</label>
                <input
                  type="text"
                  name="guardianNationalId"
                  value={formData.guardianNationalId}
                  onChange={handleChange}
                  dir="ltr"
                  maxLength={10}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-left focus:outline-hidden focus:border-gadget-light font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">شماره موبایل قیم</label>
                <input
                  type="tel"
                  name="guardianMobile"
                  value={formData.guardianMobile}
                  onChange={handleChange}
                  dir="ltr"
                  maxLength={11}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-left focus:outline-hidden focus:border-gadget-light font-mono"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">آدرس سکونت قیم</label>
                <input
                  type="text"
                  name="guardianAddress"
                  value={formData.guardianAddress}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-gadget-light"
                />
              </div>
            </div>
          </div>
        </div>

        {/* دکمه ذخیره */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-gadget-dark hover:bg-gadget-dark/90 text-white px-8 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {loading ? "در حال ذخیره اطلاعات..." : "ذخیره تغییرات"}
          </button>
        </div>
      </form>

      {/* ================== ۳. پرونده سلامت من (سوابق ویزیت و نسخه‌ها) ================== */}
      <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
          <Activity size={20} className="text-gadget-light" />
          پرونده سلامت من (سوابق ویزیت و نسخه‌ها)
        </h2>

        {loadingRecords ? (
          <div className="flex flex-col items-center justify-center py-10 text-gadget-light">
            <Loader2 className="animate-spin mb-2" size={30} />
            <p className="text-xs font-medium text-gray-500">در حال دریافت پرونده الکترونیک سلامت...</p>
          </div>
        ) : healthRecords.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 p-8 text-center rounded-2xl text-gray-500 text-xs sm:text-sm">
            <FileText size={32} strokeWidth={1.5} className="mx-auto mb-2 text-gray-400" />
            هنوز هیچ پرونده ویزیت یا نسخه‌ای برای شما در سیستم ثبت نشده است.
          </div>
        ) : (
          /* تایم‌لاین ریسپانسیو و تمیز */
          <div className="relative border-r-2 border-gadget-light/30 pr-3.5 sm:pr-6 space-y-4 py-1">
            {healthRecords.map((record) => (
              <div key={record._id} className="relative animate-in fade-in slide-in-from-bottom-2">
                {/* دایره تایم‌لاین */}
                <span className="absolute -right-5.25 sm:-right-7.75 top-4 w-3.5 h-3.5 rounded-full bg-gadget-light ring-4 ring-white shadow-xs"></span>
                
                <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3">
                  
                  {/* هدر رکورد (عنوان و تاریخ) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900">{record.title}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                        <Calendar size={13} className="text-gray-400" />
                        {new Date(record.createdAt).toLocaleDateString("fa-IR")}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                        <Clock size={13} className="text-gray-400" />
                        {new Date(record.createdAt).toLocaleTimeString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* مشخصات پزشک */}
                  {record.doctor && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl w-fit">
                      <Stethoscope size={14} className="text-teal-600 shrink-0" />
                      <span>
                        پزشک: دکتر {record.doctor.firstName} {record.doctor.lastName}{" "}
                        <span className="opacity-75 font-normal">({record.doctor.Expertise})</span>
                      </span>
                    </div>
                  )}

                  {/* تشخیص پزشک */}
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 mb-1">تشخیص پزشک:</h4>
                    <p className="text-xs sm:text-sm text-gray-700 bg-gray-50/70 p-3 rounded-xl border border-gray-100 leading-relaxed">
                      {record.description}
                    </p>
                  </div>

                  {/* نسخه تجویزی */}
                  {record.prescription && (
                    <div>
                      <h4 className="text-[11px] font-bold text-gadget-dark mb-1">نسخه تجویزشده:</h4>
                      <p className="text-xs sm:text-sm text-gadget-dark bg-gadget-light/5 p-3 rounded-xl border border-gadget-light/20 font-medium leading-relaxed">
                        {record.prescription}
                      </p>
                    </div>
                  )}

                  {/* مدارک پیوست */}
                  {record.attachments && record.attachments.length > 0 && (
                    <div className="pt-1">
                      <h4 className="text-[11px] font-bold text-gray-400 mb-1.5">مدارک پیوست:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {record.attachments.map((file, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg flex items-center gap-1"
                          >
                            <FileText size={12} /> {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}