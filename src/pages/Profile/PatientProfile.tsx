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

  return (
    <div className="space-y-8 animate-in fade-in">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <User size={18} className="text-gadget-light" />
            اطلاعات فردی
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نام</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نام خانوادگی</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">سن</label>
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

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Users size={18} className="text-gadget-light" />
            اطلاعات تکمیلی پرونده
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نام پدر</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">جنسیت</label>
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
              <label className="block text-sm font-bold text-gray-700 mb-2">وضعیت تأهل</label>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">نام قیم</label>
                <input
                  type="text"
                  name="guardianFirstName"
                  value={formData.guardianFirstName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نام خانوادگی قیم</label>
                <input
                  type="text"
                  name="guardianLastName"
                  value={formData.guardianLastName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">کد ملی قیم</label>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">شماره موبایل قیم</label>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">آدرس قیم</label>
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

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-gadget-dark hover:bg-gadget-dark/90 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </form>

      {/* ================== پرونده سلامت من ================== */}
      <div className="mt-12 pt-8 border-t border-gray-100 space-y-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Activity size={22} className="text-gadget-light" />
          پرونده سلامت من (سوابق ویزیت و نسخه‌ها)
        </h2>

        {loadingRecords ? (
          <div className="flex flex-col items-center justify-center py-12 text-gadget-light">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-sm font-medium">در حال واکشی پرونده الکترونیک سلامت...</p>
          </div>
        ) : healthRecords.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 p-8 text-center rounded-2xl text-gray-500 text-sm">
            <FileText size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-400" />
            هنوز هیچ پرونده ویزیت یا نسخه‌ای برای شما در سیستم ثبت نشده است.
          </div>
        ) : (
          <div className="relative border-r-2 border-gray-100 pr-6 space-y-6 py-2">
            {healthRecords.map((record) => (
              <div key={record._id} className="relative animate-in fade-in slide-in-from-bottom-2">
                <span className="absolute -right-8.75 top-4 w-4 h-4 rounded-full bg-gadget-light ring-4 ring-white shadow-xs"></span>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-gray-50 pb-3">
                    <h3 className="font-bold text-md text-gray-800">{record.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(record.createdAt).toLocaleDateString("fa-IR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                        <Clock size={14} className="text-gray-400" />
                        ساعت {new Date(record.createdAt).toLocaleTimeString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {record.doctor && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50/70 border border-blue-100 px-3 py-1.5 rounded-xl w-fit">
                        <Stethoscope size={14} />
                        پزشک معالج: دکتر {record.doctor.firstName} {record.doctor.lastName} ({record.doctor.Expertise})
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">تشخیص پزشک:</h4>
                      <p className="text-sm text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                        {record.description}
                      </p>
                    </div>
                    {record.prescription && (
                      <div>
                        <h4 className="text-xs font-bold text-gadget-light mb-1 flex items-center gap-1">نسخه تجویزشده:</h4>
                        <p className="text-sm text-gadget-dark bg-gadget-light/5 p-3 rounded-xl border border-gadget-light/20 font-medium">
                          {record.prescription}
                        </p>
                      </div>
                    )}
                    {record.attachments && record.attachments.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">مدارک پیوست:</h4>
                        <div className="flex flex-wrap gap-2">
                          {record.attachments.map((file, i) => (
                            <span key={i} className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
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
    </div>
  );
}