import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, MapPin, Phone, Award, 
  CalendarPlus, LogIn, Search, Loader2 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// تعریف تایپ دقیق بر اساس خروجی API شما
interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  Expertise: string;
  clinicAddress: string;
  clinicPhone: string;
  medicalCouncilCode: string;
}

export default function Doctors() {
  const { isLoggedIn } = useAuth(); // استخراج وضعیت لاگین از کانتکست
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // فعلاً پیجینیشن را روی صفحه ۱ و ۱۰ آیتم هاردکد می‌کنیم
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/doctorsList?page=1&limit=10');
      
      if (response.data && response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (err) {
      setError('خطا در دریافت لیست پزشکان. لطفاً ارتباط با سرور را بررسی کنید.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleBookAppointment = (doctorId: string) => {
    // اینجا در آینده منطق باز شدن مودال یا انتقال به صفحه رزرو قرار می‌گیرد
    toast.success(`درخواست رزرو برای پزشک ${doctorId} در حال توسعه است!`);
  };

  return (
    // این دیو همون کارت سفید، خمیده و زیبای اصلی صفحه است
    <div className="bg-white md:rounded-2xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans" dir="rtl">
      
      {/* یک نگهدارنده برای اینکه محتوا از یه حدی بیشتر کش نیاد */}
      <div className="max-w-7xl mx-auto">
        
        {/* هدر صفحه */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gadget-dark flex items-center gap-2">
              <Stethoscope className="text-gadget-light" size={28} />
              لیست پزشکان و متخصصان
            </h1>
            <p className="text-gray-500 text-sm mt-1">پزشک مورد نظر خود را پیدا کنید و نوبت بگیرید</p>
          </div>

          {/* باکس جستجو */}
          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="جستجوی نام یا تخصص..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* وضعیت لودینگ */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال دریافت اطلاعات پزشکان...</p>
          </div>
        )}

        {/* وضعیت خطا */}
        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* لیست خالی */}
        {!loading && !error && doctors.length === 0 && (
          <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-white text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Stethoscope size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">پزشکی یافت نشد</h3>
            <p className="text-gray-500 text-sm">در حال حاضر هیچ پزشکی در سیستم ثبت نشده است.</p>
          </div>
        )}

        {/* گرید کارت‌های پزشکان */}
        {!loading && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col h-full group">
                
                {/* هدر کارت: آواتار و نام */}
                <div className="flex items-center gap-4 mb-5 border-b border-gray-100 pb-4">
                  <div className="w-14 h-14 bg-linear-to-br from-gadget-light to-[#1f8c87] text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    {doctor.firstName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      دکتر {doctor.firstName} {doctor.lastName}
                    </h3>
                    <span className="inline-block bg-gadget-light/10 text-[#239c97] text-xs font-bold px-2 py-1 rounded-md mt-1">
                      {doctor.Expertise}
                    </span>
                  </div>
                </div>

                {/* اطلاعات تماس و آدرس */}
                <div className="space-y-3 flex-1 mb-6">
                  <div className="flex items-start gap-2 text-sm">
                    <Award className="text-gray-400 shrink-0 mt-0.5" size={16} />
                    <span className="text-gray-600">نظام پزشکی: <span className="font-medium text-gray-800">{doctor.medicalCouncilCode}</span></span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="text-gray-400 shrink-0 mt-0.5" size={16} />
                    <span className="text-gray-600 font-medium" dir="ltr">{doctor.clinicPhone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="text-gray-400 shrink-0 mt-0.5" size={16} />
                    <span className="text-gray-600 leading-relaxed">{doctor.clinicAddress}</span>
                  </div>
                </div>

                {/* دکمه اکشن */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  {isLoggedIn ? (
                    <button 
                      onClick={() => handleBookAppointment(doctor._id)}
                      className="w-full flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                    >
                      <CalendarPlus size={18} />
                      رزرو نوبت
                    </button>
                  ) : (
                    <Link 
                      to="/login"
                      className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 hover:border-gadget-light text-gray-600 hover:text-gadget-light py-2.5 rounded-xl text-sm font-bold transition-all"
                    >
                      <LogIn size={18} />
                      برای رزرو وارد شوید
                    </Link>
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