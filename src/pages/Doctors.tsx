import { useState } from 'react';
import { Search, Calendar, Phone, Award, User, Star } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  medicalCode: string;
  phone: string;
  experience: number; // سال‌های تجربه
  status: 'در دسترس' | 'ناموجود';
}

const initialDoctors: Doctor[] = [
  { id: 1, name: 'دکتر سارا احمدی', specialty: 'متخصص قلب و عروق', medicalCode: 'ن-۱۲۳۴۵', phone: '۰۲۱-۸۸۸۸۱۱۱۱', experience: 12, status: 'در دسترس' },
  { id: 2, name: 'دکتر محمد کریمی', specialty: 'جراح و متخصص استخوان و مفاصل (ارتوپد)', medicalCode: 'ن-۵۴۳۲۱', phone: '۰۲۱-۲۲۲۲۴۴۴۴', experience: 15, status: 'در دسترس' },
  { id: 3, name: 'دکتر علیرضا رضایی', specialty: 'متخصص مغز و اعصاب (نورولوژی)', medicalCode: 'ن-۹۸۷۶۵', phone: '۰۲۱-۴۴۴۴۷۷۷۷', experience: 8, status: 'ناموجود' },
  { id: 4, name: 'دکتر مریم تقوی', specialty: 'متخصص پوست، مو و زیبایی', medicalCode: 'ن-۴۵۶۷۸', phone: '۰۲۱-۷۷۷۷۹۹۹۹', experience: 10, status: 'در دسترس' },
];

export default function Doctors() {
  const [doctors] = useState<Doctor[]>(initialDoctors);
  const [searchTerm, setSearchTerm] = useState('');

  // فیلتر کردن پزشکان بر اساس نام یا تخصص
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.includes(searchTerm) || doctor.specialty.includes(searchTerm)
  );

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 overflow-y-auto">
      
      {/* هدر صفحه */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gadget-dark">لیست پزشکان مستقر</h1>
        <p className="text-sm text-gray-500 mt-1">پزشک مورد نظر خود را جستجو کرده و نوبت دریافت کنید</p>
      </div>

      {/* بار جستجو */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-8 flex items-center max-w-md">
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

      {/* شبکه کارت‌های پزشکان */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map((doctor) => (
            <div 
              key={doctor.id} 
              className="border border-gray-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 bg-white group relative overflow-hidden"
            >
              {/* خط تزیینی بالای کارت برای پزشکان در دسترس */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${doctor.status === 'در دسترس' ? 'bg-gadget-light' : 'bg-gray-300'}`}></div>

              <div>
                {/* بخش آیکون پزشک و وضعیت */}
                <div className="flex items-start justify-between mb-4 mt-2">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 text-gray-400 group-hover:bg-gadget-light/10 group-hover:text-gadget-light transition-colors">
                    <User size={28} strokeWidth={1.5} />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    doctor.status === 'در دسترس' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {doctor.status}
                  </span>
                </div>

                {/* اطلاعات متنی */}
                <h3 className="text-base font-bold text-gray-900 mb-1">{doctor.name}</h3>
                <p className="text-xs text-blue-600 font-medium mb-4 h-8 overflow-hidden line-clamp-2">{doctor.specialty}</p>

                {/* ریز مشخصات */}
                <div className="space-y-2 border-t border-gray-50 pt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-gray-400" />
                    <span>کد نظام پزشکی: <span className="font-medium text-gray-700">{doctor.medicalCode}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span>سابقه طبابت: <span className="font-medium text-gray-700">{doctor.experience} سال</span></span>
                  </div>
                  <div className="flex items-center gap-2" dir="ltr">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-gray-600">{doctor.phone}</span>
                  </div>
                </div>
              </div>

              {/* دکمه عملیات (رزرو نوبت) */}
              <button 
                disabled={doctor.status === 'ناموجود'}
                className={`w-full mt-6 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  doctor.status === 'در دسترس' 
                    ? 'bg-gadget-dark hover:bg-gadget-dark/90 text-white cursor-pointer' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Calendar size={14} />
                رزرو نوبت مشاوره
              </button>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-sm">
          پزشکی با این مشخصات در سامانه پیدا نشد.
        </div>
      )}

    </div>
  );
}