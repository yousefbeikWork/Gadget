import { useState, useEffect } from 'react';
import { 
  User, MapPin, Phone, Building, Save, 
  Loader2, ShieldCheck, Lock
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { userProfile, userRole, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // استیت فرم
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    clinicAddress: '',
    orgAddress: '',
    clinicPhone: ''
  });

  // پر کردن فرم با دیتای فعلی کاربر به محض لود شدن صفحه
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        age: userProfile.age ? String(userProfile.age) : '',
        clinicAddress: userProfile.clinicAddress || '',
        orgAddress: userProfile.orgAddress || '',
        clinicPhone: userProfile.clinicPhone || ''
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // آماده‌سازی دیتای ارسالی (تبدیل سن به عدد)
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
      };

      const response = await api.put('/users/profile', payload);
      
      if (response.data) {
        toast.success('اطلاعات حساب کاربری با موفقیت بروزرسانی شد');
        // فراخوانی تابع رفرش از کانتکست برای آپدیت شدن اسم در سایدبار
        await refreshProfile(); 
      }
    } catch (err) {
      toast.error('خطا در بروزرسانی اطلاعات. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
          <div className="p-3 bg-gadget-light/10 text-gadget-light rounded-2xl">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">حساب کاربری من</h1>
            <p className="text-gray-500 text-sm mt-1">مشاهده و ویرایش اطلاعات شخصی</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* بخش اول: اطلاعات غیرقابل تغییر (Read-Only) */}
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-gray-400" />
              اطلاعات سیستمی (غیرقابل تغییر)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">نقش کاربری</label>
                <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                  <span>{userRole === 'Doctor' ? 'پزشک' : userRole === 'Patient' ? 'بیمار' : 'مرکز درمانی'}</span>
                  <Lock size={14} className="opacity-50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">شماره موبایل</label>
                <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                  <span dir="ltr">{userProfile?.mobile || 'ثبت نشده'}</span>
                  <Lock size={14} className="opacity-50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">رمز عبور</label>
                <div className="w-full bg-gray-100/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center justify-between cursor-not-allowed">
                  <span>********</span>
                  <Lock size={14} className="opacity-50" />
                </div>
              </div>
            </div>
          </div>

          {/* بخش دوم: اطلاعات هویتی */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-700">اطلاعات فردی</h2>
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

          {/* بخش سوم: اطلاعات تماس و کاری */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-700">اطلاعات تماس و آدرس</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* شماره تلفن مطب/کلینیک */}
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

              {/* آدرس مطب */}
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

              {/* آدرس سازمان/مرکز درمانی */}
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

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gadget-dark hover:bg-gadget-dark/90 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}