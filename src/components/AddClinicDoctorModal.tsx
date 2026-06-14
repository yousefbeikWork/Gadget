import { useState, useEffect } from 'react';
import { 
  X, Search, Loader2, Plus, Check, User, Award, 
  UserPlus, Phone, CreditCard, Lock, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const medicalSpecialties = [
  "پزشک عمومی", "دندانپزشک", "متخصص قلب و عروق", "متخصص مغز و اعصاب", 
  "متخصص زنان و زایمان", "متخصص اطفال", "متخصص پوست، مو و زیبایی", 
  "متخصص چشم‌پزشکی", "متخصص گوش، حلق و بینی", "متخصص ارتوپدی", 
  "متخصص داخلی", "متخصص گوارش و کبد", "روان‌پزشک (اعصاب و روان)", 
  "جراح عمومی", "سایر موارد"
];

interface CatalogDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  Expertise: string;
  medicalCouncilCode: string;
  nationalId?: string; // برای پیدا کردن پزشک جدید در لیست
}

interface AddClinicDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingDoctorIds: string[];
}

export default function AddClinicDoctorModal({ 
  isOpen, onClose, onSuccess, existingDoctorIds 
}: AddClinicDoctorModalProps) {
  
  const [activeTab, setActiveTab] = useState<'catalog' | 'register'>('catalog');
  const [doctorsCatalog, setDoctorsCatalog] = useState<CatalogDoctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const [registerLoading, setRegisterLoading] = useState(false);
  const [newDoctorData, setNewDoctorData] = useState({
    firstName: '', lastName: '', nationalId: '', age: '',
    mobile: '', password: '', medicalCouncilCode: '', Expertise: '',
    clinicPhone: '', clinicAddress: '', orgAddress: ''
  });

  const fetchAllDoctors = async () => {
    try {
      setLoadingCatalog(true);
      // محدودیت را بیشتر کردیم تا مطمئن شویم پزشک جدید در لیست هست
      const response = await api.get('/users/doctorsList?page=1&limit=200');
      if (response.data && response.data.success) {
        setDoctorsCatalog(response.data.data);
        return response.data.data; // برگرداندن دیتا برای استفاده در تابع ثبت‌نام
      }
    } catch (err) {
      toast.error('خطا در دریافت لیست پزشکان سیستم');
    } finally {
      setLoadingCatalog(false);
    }
    return [];
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllDoctors();
      setActiveTab('catalog');
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toEnglishDigits = (str: string) => {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str.split("").map(c => (persianNumbers.includes(c) ? persianNumbers.indexOf(c) : c)).join("");
  };
  const onlyNumbers = (value: string) => value.replace(/\D/g, "");

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ["nationalId", "mobile", "clinicPhone", "medicalCouncilCode", "age"];
    const finalValue = numericFields.includes(name) ? onlyNumbers(toEnglishDigits(value)) : value;
    setNewDoctorData(prev => ({ ...prev, [name]: finalValue }));
  };

  // 1️⃣ اکشن هوشمند ثبت‌نام و اتصال خودکار
  const handleRegisterNewDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);

    try {
      // مرحله ۱: ثبت نام در سامانه
      const payload = {
        role: "Doctor",
        mobile: newDoctorData.mobile,
        password: newDoctorData.password,
        firstName: newDoctorData.firstName,
        lastName: newDoctorData.lastName,
        nationalId: newDoctorData.nationalId,
        age: Number(newDoctorData.age) || 0,
        medicalCouncilCode: newDoctorData.medicalCouncilCode,
        Expertise: newDoctorData.Expertise,
        clinicPhone: newDoctorData.clinicPhone,
        orgAddress: newDoctorData.orgAddress,
        clinicAddress: newDoctorData.clinicAddress,
      };

      const registerResponse = await api.post("/auth/register", payload);
      
      if (registerResponse.data) {
        toast.loading("ثبت‌نام موفق! در حال اتصال پزشک به کلینیک...", { id: "autoConnect" });

        // مرحله ۲: پیدا کردن آیدی پزشک جدید
        // بررسی میکنیم آیا بک‌اند در جواب ثبت‌نام آیدی رو فرستاده؟
        let newDoctorId = registerResponse.data?.id || registerResponse.data?._id || registerResponse.data?.user?._id;

        // اگر نفرستاده بود، سریع لیست رو میگیریم و از روی کد ملی پیداش میکنیم
        if (!newDoctorId) {
          const updatedCatalog = await fetchAllDoctors();
          const newDoc = updatedCatalog.find((d: any) => d.nationalId === newDoctorData.nationalId);
          if (newDoc) {
            newDoctorId = newDoc._id;
          }
        }

        // مرحله ۳: اتصال خودکار به کلینیک
        if (newDoctorId) {
          await api.post('/clinic/addDoctorToClinic', { doctorId: newDoctorId });
          toast.success("پزشک با موفقیت به کلینیک اضافه شد!", { id: "autoConnect" });
          
          // ریست فرم و بستن مودال
          setNewDoctorData({
            firstName: '', lastName: '', nationalId: '', age: '', mobile: '', password: '', 
            medicalCouncilCode: '', Expertise: '', clinicPhone: '', clinicAddress: '', orgAddress: ''
          });
          onSuccess(); // رفرش کردن لیست صفحه اصلی
          onClose(); // بستن کامل مودال
        } else {
          // حالت پشتیبان (اگر به هر دلیلی آیدی پیدا نشد)
          toast.success("پزشک ثبت شد. لطفاً او را از لیست انتخاب کنید.", { id: "autoConnect" });
          setSearchTerm(newDoctorData.lastName);
          setActiveTab('catalog');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "خطا در ثبت‌نام پزشک جدید.");
    } finally {
      setRegisterLoading(false);
    }
  };

  // 2️⃣ اکشن اتصال پزشک (از داخل کاتالوگ)
  const handleAddDoctorToClinic = async (doctorId: string) => {
    setSubmittingId(doctorId);
    try {
      const response = await api.post('/clinic/addDoctorToClinic', { doctorId });
      if (response.data) {
        toast.success('پزشک با موفقیت به مجموعه شما متصل شد');
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در اتصال پزشک به کلینیک');
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredCatalog = doctorsCatalog.filter(doc => {
    const fullName = `${doc.firstName} ${doc.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.Expertise.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* ================== هدر مودال ================== */}
        <div className="bg-gadget-dark p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
              {activeTab === 'catalog' ? <Search size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-md">افزودن پزشک به کلینیک</h3>
              <p className="text-xs text-gadget-light">
                {activeTab === 'catalog' ? 'انتخاب از لیست پزشکان سامانه' : 'تشکیل پرونده و اتصال خودکار'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer border-none outline-hidden">
            <X size={20} />
          </button>
        </div>

        {/* ================== تب‌ها ================== */}
        <div className="flex border-b border-gray-100 p-2 bg-gray-50 shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer border-none outline-hidden ${
              activeTab === 'catalog' ? 'bg-white text-gadget-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            جستجو و انتخاب از لیست
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer border-none outline-hidden ${
              activeTab === 'register' ? 'bg-white text-gadget-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            + ثبت‌نام و افزودن سریع
          </button>
        </div>

        {/* ================== محتوای تب جستجو ================== */}
        {activeTab === 'catalog' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-gray-100 shrink-0">
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl flex items-center focus-within:border-gadget-light transition-colors">
                <Search size={18} className="text-gray-400 ml-2" />
                <input 
                  type="text" placeholder="نام یا تخصص پزشک را جستجو کنید..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm text-gray-700 bg-transparent outline-hidden"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3 min-h-75">
              {loadingCatalog ? (
                <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p className="text-xs font-medium">در حال دریافت لیست پزشکان...</p>
                </div>
              ) : filteredCatalog.length > 0 ? (
                filteredCatalog.map((doctor) => {
                  const isAlreadyAdded = existingDoctorIds.includes(doctor._id);
                  const isCurrentSubmitting = submittingId === doctor._id;

                  return (
                    <div key={doctor._id} className="bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-3 flex items-center justify-between shadow-xs transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-11 h-11 bg-gadget-light/10 text-gadget-light rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                          {doctor.firstName ? doctor.firstName[0] : <User size={18} />}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-gray-800 truncate">
                            دکتر {doctor.firstName} {doctor.lastName}
                          </h4>
                          <p className="text-xs text-gray-500 font-medium truncate mt-0.5 flex items-center gap-1">
                            <span>{doctor.Expertise}</span><span className="text-gray-300">•</span>
                            <span className="flex items-center gap-0.5 font-mono"><Award size={12}/>{doctor.medicalCouncilCode}</span>
                          </p>
                        </div>
                      </div>

                      {isAlreadyAdded ? (
                        <span className="text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0">
                          <Check size={14} /> عضو مجموعه
                        </span>
                      ) : (
                        <button
                          type="button" disabled={isCurrentSubmitting}
                          onClick={() => handleAddDoctorToClinic(doctor._id)}
                          className="text-xs font-bold text-gadget-dark bg-gray-100 hover:bg-gadget-light/10 hover:text-gadget-light px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50 border-none outline-hidden"
                        >
                          {isCurrentSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                          {isCurrentSubmitting ? 'اتصال...' : 'افزودن'}
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-400 text-sm">
                  پزشکی با این نام یافت نشد. می‌توانید از تب بالا او را ثبت‌نام کنید.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================== محتوای تب ثبت‌نام جدید ================== */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterNewDoctor} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              
              <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl flex items-start gap-3 text-sm leading-relaxed">
                <Activity className="shrink-0 mt-0.5" size={20} />
                <p>پزشک پس از ثبت‌نام، به صورت خودکار به لیست پزشکان کلینیک شما متصل خواهد شد.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* هویتی */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">نام *</label>
                  <input type="text" name="firstName" value={newDoctorData.firstName} onChange={handleFormChange} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">نام خانوادگی *</label>
                  <input type="text" name="lastName" value={newDoctorData.lastName} onChange={handleFormChange} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">کد ملی *</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input type="text" name="nationalId" value={newDoctorData.nationalId} onChange={handleFormChange} required dir="ltr" maxLength={10}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-left focus:outline-hidden" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">سن *</label>
                  <input type="number" name="age" value={newDoctorData.age} onChange={handleFormChange} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden" />
                </div>

                {/* کاربری */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">شماره موبایل (جهت ورود) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input type="tel" name="mobile" value={newDoctorData.mobile} onChange={handleFormChange} required dir="ltr" maxLength={11}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-left focus:outline-hidden" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">رمز عبور پیش‌فرض *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input type="text" name="password" value={newDoctorData.password} onChange={handleFormChange} required dir="ltr"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-left focus:outline-hidden" />
                  </div>
                </div>

                {/* تخصصی */}
                <div className="md:col-span-2 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">تخصص *</label>
                  <select name="Expertise" value={newDoctorData.Expertise} onChange={handleFormChange} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden"
                  >
                    <option value="" disabled>انتخاب تخصص...</option>
                    {medicalSpecialties.map((spec, i) => <option key={i} value={spec}>{spec}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">کد نظام پزشکی *</label>
                  <input type="text" name="medicalCouncilCode" value={newDoctorData.medicalCouncilCode} onChange={handleFormChange} required dir="ltr"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-hidden" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">تلفن مطب *</label>
                  <input type="tel" name="clinicPhone" value={newDoctorData.clinicPhone} onChange={handleFormChange} required dir="ltr"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-hidden" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">آدرس مطب *</label>
                  <input type="text" name="clinicAddress" value={newDoctorData.clinicAddress} onChange={handleFormChange} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden" />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-left shrink-0">
              <button 
                type="submit" disabled={registerLoading}
                className="w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 border-none outline-hidden"
              >
                {registerLoading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                {registerLoading ? 'در حال ایجاد حساب و اتصال...' : 'ثبت‌نام پزشک و افزودن به کلینیک'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}