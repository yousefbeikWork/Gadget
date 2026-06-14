import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Phone, Award, 
  Loader2, UserPlus, User, Calendar as CalendarIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 👈 اضافه شدن جهت ناوبری
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddClinicDoctorModal from '../components/AddClinicDoctorModal';

interface ClinicDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  Expertise: string;
  age: number;
  medicalCouncilCode: string;
  clinicPhone: string;
  clinicAddress: string;
  orgAddress: string;
  isActive: boolean;
}

export default function ClinicDoctors() {
  const { userProfile } = useAuth();
  const navigate = useNavigate(); // 👈 هوک ناوبری
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClinicDoctors = useCallback(async () => {
    if (!userProfile?._id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/doctor/listDctorsClinic', {
        clinicId: userProfile._id
      });

      if (response.data && response.data.success) {
        setDoctors(response.data.doctors);
      } else {
        throw new Error('داده‌ای یافت نشد');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست پزشکان کلینیک');
    } finally {
      setLoading(false);
    }
  }, [userProfile?._id]);

  useEffect(() => {
    fetchClinicDoctors();
  }, [fetchClinicDoctors]);

  const filteredDoctors = doctors.filter(doc => {
    const fullName = `${doc.firstName} ${doc.lastName}`;
    return fullName.includes(searchTerm) || doc.Expertise.includes(searchTerm);
  });

  return (
    <div className="flex-1 bg-white md:rounded-2xl shadow-lg p-6 md:p-8 overflow-y-auto custom-scrollbar font-sans" dir="rtl">
      
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gadget-dark flex items-center gap-2">
            <UsersIcon size={28} className="text-gadget-light" />
            پزشکان کلینیک
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            مدیریت و مشاهده لیست پزشکان زیرمجموعه مرکز درمانی
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus size={18} />
          افزودن پزشک جدید
        </button>
      </div>

      {/* سرچ باکس */}
      <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-8 flex items-center max-w-md focus-within:border-gadget-light focus-within:bg-white transition-colors">
        <div className="text-gray-400 ml-3">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="جستجوی نام پزشک یا تخصص..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm text-gray-700 bg-transparent outline-hidden"
        />
      </div>

      {/* لیست کارت‌ها */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-sm font-medium">در حال دریافت لیست پزشکان...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
          {error}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div 
              key={doctor._id} 
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col h-full group relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${doctor.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>

              <div className="flex items-center gap-4 mb-5 border-b border-gray-100 pb-4 mt-2">
                <div className="w-14 h-14 bg-gadget-light/10 text-gadget-light rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  {doctor.firstName ? doctor.firstName[0] : <User size={24} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-lg text-gray-800 truncate">
                    دکتر {doctor.firstName} {doctor.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block bg-gadget-light/10 text-gadget-light text-[10px] font-bold px-2 py-0.5 rounded-md truncate">
                      {doctor.Expertise}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 flex-1 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Award className="text-gray-400 shrink-0" size={16} />
                  <span className="text-gray-600 font-medium">نظام پزشکی: <span className="text-gray-800">{doctor.medicalCouncilCode}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="text-gray-400 shrink-0" size={16} />
                  <span className="text-gray-600 font-medium" dir="ltr">{doctor.mobile}</span>
                </div>
              </div>

              {/* 👈 فوتر کارت: اضافه شدن دکمه ورود به تقویم نوبت‌دهی */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate('/schedule', { state: { doctorId: doctor._id } })} // 👈 ارسال آیدی پزشک در استیت مسیر
                  className="w-full flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <CalendarIcon size={16} />
                  برنامه‌ریزی و ثبت نوبت
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center">
          <div className="w-16 h-16 bg-white text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UserPlus size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">هیچ پزشکی یافت نشد</h3>
        </div>
      )}

      <AddClinicDoctorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClinicDoctors}
        existingDoctorIds={doctors.map(doc => doc._id)} 
      />
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}