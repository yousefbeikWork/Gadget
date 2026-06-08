import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, MapPin, Phone, Award, 
  CalendarPlus, LogIn, Search, Loader2, X, Calendar, AlignRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  Expertise: string;
  clinicAddress: string;
  clinicPhone: string;
  medicalCouncilCode: string;
}

interface Slot {
  startTime: string;
  endTime: string;
}

export default function Doctors() {
  const { isLoggedIn } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // استیت‌های مودال رزرو نوبت
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingNotes, setBookingNotes] = useState(''); // استیت جدید برای توضیحات

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/doctorsList?page=1&limit=10');
      if (response.data && response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (err) {
      setError('خطا در دریافت لیست پزشکان. لطفاً ارتباط با سرور را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openBookingModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
    setSelectedDate('');
    setAvailableSlots([]);
    setSelectedSlot(null);
    setBookingNotes(''); // ریست کردن توضیحات
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  const fetchSlotsForDate = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    
    if (!date || !selectedDoctor) return;

    try {
      setLoadingSlots(true);
      const response = await api.get(`/book/available-slots?doctorId=${selectedDoctor._id}&date=${date}`);
      
      if (response.data && response.data.success) {
        setAvailableSlots(response.data.data);
        if (response.data.data.length === 0) {
          toast('در این تاریخ نوبت خالی وجود ندارد.', { icon: 'ℹ️' });
        }
      }
    } catch (err) {
      toast.error('خطا در دریافت نوبت‌های خالی.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // اتصال به API رزرو نوبت
  const handleConfirmBooking = () => {
    if (!selectedSlot || !selectedDate || !selectedDoctor) return;
    
    const payload = {
      doctorId: selectedDoctor._id,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes: bookingNotes
    };

    const bookingPromise = api.post('/book/bookslots', payload);

    toast.promise(
      bookingPromise,
      {
        loading: 'در حال ثبت نوبت شما...',
        success: (response) => {
          // بستن مودال بعد از موفقیت
          closeModal();
          return 'نوبت شما با موفقیت رزرو شد!';
        },
        error: (err) => {
          return err.response?.data?.message || 'خطا در رزرو نوبت. لطفاً دوباره تلاش کنید.';
        }
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans relative" dir="rtl">
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gadget-dark flex items-center gap-2">
              <Stethoscope className="text-gadget-light" size={28} />
              لیست پزشکان و متخصصان
            </h1>
            <p className="text-gray-500 text-sm mt-1">پزشک مورد نظر خود را پیدا کنید و نوبت بگیرید</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="جستجوی نام یا تخصص..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors"
            />
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال دریافت اطلاعات پزشکان...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && doctors.length === 0 && (
          <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-white text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Stethoscope size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">پزشکی یافت نشد</h3>
            <p className="text-gray-500 text-sm">در حال حاضر هیچ پزشکی در سیستم ثبت نشده است.</p>
          </div>
        )}

        {!loading && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col h-full group">
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

                <div className="mt-auto pt-4 border-t border-gray-100">
                  {isLoggedIn ? (
                    <button 
                      onClick={() => openBookingModal(doctor)}
                      className="w-full flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                    >
                      <CalendarPlus size={18} />
                      دریافت نوبت
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

      {/* ================= مودال رزرو نوبت ================= */}
      {isModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="bg-gadget-dark p-5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                  {selectedDoctor.firstName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm">دکتر {selectedDoctor.firstName} {selectedDoctor.lastName}</h3>
                  <p className="text-xs text-gray-300">{selectedDoctor.Expertise}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer border-none outline-hidden">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">ابتدا تاریخ مراجعه را انتخاب کنید:</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-3 text-gadget-light" size={18} />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => fetchSlotsForDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {loadingSlots ? (
                <div className="flex flex-col items-center justify-center py-10 text-gadget-light">
                  <Loader2 className="animate-spin mb-2" size={30} />
                  <p className="text-xs font-medium">در حال بررسی نوبت‌های خالی...</p>
                </div>
              ) : selectedDate ? (
                availableSlots.length > 0 ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">ساعت‌های خالی:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableSlots.map((slot, index) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2.5 px-2 rounded-xl text-sm font-bold transition-all outline-hidden border-none cursor-pointer ${
                                isSelected 
                                  ? 'bg-gadget-light text-white shadow-md shadow-gadget-light/30 transform scale-105' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {slot.startTime} <span className="text-[10px] font-normal opacity-80 mx-0.5">تا</span> {slot.endTime}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* فیلد اختیاری توضیحات که بعد از انتخاب ساعت نمایش داده می‌شود */}
                    {selectedSlot && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">توضیحات یا علت مراجعه (اختیاری):</label>
                        <div className="relative">
                          <AlignRight className="absolute right-3 top-3 text-gray-400" size={18} />
                          <textarea 
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                            placeholder="مثال: سردرد شدید دارم..."
                            rows={2}
                            className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light transition-colors resize-none"
                          ></textarea>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-8 bg-orange-50 rounded-2xl border border-orange-100">
                    <p className="text-sm font-bold text-orange-600">نوبت خالی در این تاریخ وجود ندارد.</p>
                    <p className="text-xs text-orange-400 mt-1">لطفاً روز دیگری را بررسی کنید.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <Calendar size={40} strokeWidth={1} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">برای مشاهده ساعت‌ها، تقویم را انتخاب کنید</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0">
              <button 
                disabled={!selectedSlot}
                onClick={handleConfirmBooking}
                className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all outline-hidden border-none ${
                  selectedSlot 
                    ? 'bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-lg cursor-pointer transform hover:-translate-y-0.5' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedSlot ? `تایید و رزرو ساعت ${selectedSlot.startTime}` : 'لطفاً یک ساعت را انتخاب کنید'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}