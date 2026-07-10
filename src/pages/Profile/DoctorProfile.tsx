import { useState, useEffect } from "react";
import { User, Activity, Phone, MapPin, Building, Save, Loader2 } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import FileUpload from "../../components/FileUpload";
import DoctorAvatar from "../../components/DoctorAvatar";

interface Props {
  userProfile: any;
  refreshProfile: () => Promise<void>;
}

export default function DoctorProfile({ userProfile, refreshProfile }: Props) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    clinicAddress: "",
    orgAddress: "",
    clinicPhone: "",
    avatar: "",
  });

  // مقداردهی اولیه فرم
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        age: userProfile.age ? String(userProfile.age) : "",
        clinicAddress: userProfile.clinicAddress || "",
        orgAddress: userProfile.orgAddress || "",
        clinicPhone: userProfile.clinicPhone || "",
        avatar: userProfile.imageProfile || "",
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUploadSuccess = async (minioObjectName: string) => {
    const loadingToast = toast.loading("در حال ثبت تصویر پروفایل شما در دیتابیس...");
    try {
      await api.post("/doctor/addDoctorProfileImage", {
        minioobjectName: minioObjectName,
      });

      setFormData((prev) => ({ ...prev, avatar: minioObjectName }));
      await refreshProfile();

      toast.success("تصویر پروفایل پزشک با موفقیت تغییر کرد", { id: loadingToast });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "خطا در ثبت نهایی تصویر پروفایل",
        { id: loadingToast }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age ? Number(formData.age) : undefined,
        clinicAddress: formData.clinicAddress,
        orgAddress: formData.orgAddress,
        clinicPhone: formData.clinicPhone,
        avatar: formData.avatar,
      };

      const response = await api.put("/users/profile", payload);

      if (response.data) {
        toast.success("اطلاعات حساب کاربری با موفقیت بروزرسانی شد");
        await refreshProfile();
      }
    } catch (err) {
      toast.error("خطا در بروزرسانی اطلاعات. لطفاً دوباره تلاش کنید.");
      // در صورت خطا، عکس را به حالت قبل برمی‌گردانیم
      setFormData((prev) => ({
        ...prev,
        avatar: userProfile?.imageProfile || "",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* بخش آپلود آواتار پزشک */}
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

        {/* اطلاعات فردی پزشک */}
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

        {/* اطلاعات تماس و مطب */}
        <div className="space-y-4">
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
                <Phone className="absolute right-3 top-3 text-gray-400" size={18} />
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
                <MapPin className="absolute right-3 top-3 text-gadget-light" size={18} />
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
                <Building className="absolute right-3 top-3 text-gadget-dark" size={18} />
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
    </div>
  );
}