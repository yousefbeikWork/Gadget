import { useState, useEffect } from 'react';
import { 
  Users, Search, Phone, CreditCard, 
  Loader2, Wifi, WifiOff, ChevronRight, ChevronLeft,
  ScanLine, X, Save
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast'; // 👈 اضافه کردن toast برای نمایش پیام‌ها

interface AdminPatientItem {
  _id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile: string;
  rfid?: string;
}

interface PaginationData {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export default function AdminPatients() {
  const [patients, setPatients] = useState<AdminPatientItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // استیت‌های مربوط به جستجو و صفحه‌بندی
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ================= استیت‌های مودال RFID =================
  const [isRfidModalOpen, setIsRfidModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<AdminPatientItem | null>(null);
  const [rfidInput, setRfidInput] = useState('');
  const [isSubmittingRfid, setIsSubmittingRfid] = useState(false);

  // ایجاد تاخیر در جستجو (Debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); 
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // فراخوانی API دریافت بیماران
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Admin/getPatients', {
        params: {
          page: currentPage,
          limit: 12,
          search: debouncedSearch || undefined
        }
      });
      
      if (response.data && response.data.success) {
        setPatients(response.data.data.patients);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      setError('خطا در دریافت لیست کل بیماران سیستم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ================= تابع هندل کردن ثبت RFID =================
  const handleSetRfid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !rfidInput.trim()) {
      toast.error("لطفاً کد RFID را وارد کنید.");
      return;
    }

    try {
      setIsSubmittingRfid(true);
      const response = await api.post('/RfId/setRfid', {
        patientId: selectedPatient._id,
        rfidCode: rfidInput.trim()
      });

      if (response.status === 200) {
        toast.success(response.data.message || "کارت با موفقیت به بیمار اختصاص یافت.");
        
        // آپدیت کردن استیت محلی برای نمایش آنی تغییرات بدون نیاز به رفرش
        setPatients(prevPatients => prevPatients.map(p => 
          p._id === selectedPatient._id ? { ...p, rfid: rfidInput.trim() } : p
        ));
        
        // بستن مودال
        setIsRfidModalOpen(false);
        setRfidInput('');
      }
    } catch (error: any) {
      const status = error.response?.status;
      
      // مدیریت ارورها بر اساس داکیومنت شما
      if (status === 400) {
        toast.error(error.response?.data?.message || "این کارت قبلاً به بیمار دیگری اختصاص داده شده است.");
      } else if (status === 403) {
        toast.error("شما دسترسی لازم برای این عملیات را ندارید.");
      } else if (status === 404) {
        toast.error("بیمار یافت نشد.");
      } else {
        toast.error("خطای ناشناخته در ارتباط با سرور رخ داد.");
      }
    } finally {
      setIsSubmittingRfid(false);
    }
  };

  // باز کردن مودال
  const openRfidModal = (patient: AdminPatientItem) => {
    setSelectedPatient(patient);
    setRfidInput(patient.rfid || ''); // اگر از قبل داشت، تو اینپوت نشون بده
    setIsRfidModalOpen(true);
  };

  return (
    <div className="bg-gray-50 rounded-2xl md:rounded-3xl border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col h-full">
        
        {/* ================== هدر و جستجو ================== */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-800 rounded-2xl">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-800">بانک جامع بیماران</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">
                {pagination ? `تعداد کل کاربران ثبت‌شده: ${pagination.total.toLocaleString()} نفر` : 'مدیریت و نظارت بر بیماران سامانه'}
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="جستجو (نام، کدملی، موبایل)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-hidden focus:border-gadget-dark focus:bg-white transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* ================== مدیریت وضعیت لودینگ و خطا ================== */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-dark flex-1">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-bold text-gray-500">در حال همگام‌سازی اطلاعات از سرور...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center text-sm font-bold border border-red-100 max-w-md mx-auto mt-10">
            {error}
            <button onClick={fetchPatients} className="block mt-4 mx-auto bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors cursor-pointer">
              تلاش مجدد
            </button>
          </div>
        )}

        {!loading && !error && patients.length === 0 && (
          <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-200 text-center flex-1 flex flex-col items-center justify-center mt-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">بیماری یافت نشد</h3>
            <p className="text-gray-500 text-sm">هیچ کاربری با این مشخصات در سیستم ثبت نشده است.</p>
          </div>
        )}

        {/* ================== لیست کارت بیماران ================== */}
        {!loading && patients.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            {patients.map((patient) => (
              <div key={patient._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col relative overflow-hidden group">
                
                <div className="absolute top-0 right-0 w-full h-1 bg-linear-to-r from-gray-200 to-gray-100 group-hover:from-blue-400 group-hover:to-blue-600 transition-all"></div>

                <div className="flex items-start justify-between mb-4 mt-2">
                  <div>
                    <h3 className="font-black text-base text-gray-800 truncate pr-1">
                      {patient.firstName} {patient.lastName}
                    </h3>
                  </div>
                  
                  {patient.rfid ? (
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-100" title={`RFID: ${patient.rfid}`}>
                      <Wifi size={12} /> دارای کارت
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-gray-50 text-gray-400 px-2 py-1.5 rounded-lg text-[10px] font-bold border border-gray-200">
                      <WifiOff size={12} /> بدون کارت
                    </div>
                  )}
                </div>

                <div className="space-y-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 text-xs font-bold flex items-center gap-1.5">
                      <CreditCard size={14} /> کد ملی:
                    </span>
                    <span className="font-medium text-gray-700" dir="ltr">{patient.nationalId || 'ثبت‌نشده'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                    <span className="text-gray-500 text-xs font-bold flex items-center gap-1.5">
                      <Phone size={14} /> موبایل:
                    </span>
                    <span className="font-medium font-sans text-gray-700" dir="ltr">{patient.mobile || 'ثبت‌نشده'}</span>
                  </div>
                </div>

                {/* 👈 دکمه اختصاص کارت در انتهای کارت */}
                <div className="mt-auto border-t border-gray-50 pt-4">
                  <button
                    onClick={() => openRfidModal(patient)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      patient.rfid 
                      ? "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200" 
                      : "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-sm"
                    }`}
                  >
                    <ScanLine size={16} />
                    {patient.rfid ? "ویرایش کد RFID" : "اختصاص کارت RFID"}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* ================== صفحه‌بندی ================== */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="mt-auto flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs font-bold text-gray-500">
              نمایش صفحه <span className="text-gray-800">{pagination.currentPage}</span> از <span className="text-gray-800">{pagination.totalPages}</span>
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight size={18} />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  if (
                    pageNumber === 1 || 
                    pageNumber === pagination.totalPages || 
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                          currentPage === pageNumber 
                          ? "bg-gadget-dark text-white shadow-sm" 
                          : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 || 
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="text-gray-400 text-xs">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
        
      </div>

      {/* ================== مودال ثبت RFID ================== */}
      {isRfidModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* هدر مودال */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ScanLine className="text-gadget-light" size={20} />
                {selectedPatient.rfid ? "ویرایش کارت سلامت" : "اختصاص کارت سلامت"}
              </h3>
              <button 
                onClick={() => setIsRfidModalOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* محتوای مودال */}
            <form onSubmit={handleSetRfid} className="p-6">
              
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">بیمار انتخاب شده:</p>
                <p className="font-bold text-gray-800">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
                <p className="text-xs text-gray-500 mt-1" dir="ltr">
                  {selectedPatient.nationalId}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">کد یکتای کارت RFID</label>
                <input
                  type="text"
                  required
                  autoFocus
                  dir="ltr"
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  placeholder="مثال: RFID123456"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-2 focus:ring-gadget-light/20 transition-all text-left font-mono"
                />
                <p className="text-[11px] text-gray-500">
                  لطفاً کد درج شده روی کارت هوشمند را با دقت وارد نمایید.
                </p>
              </div>

              {/* دکمه‌های اکشن */}
              <div className="flex items-center gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsRfidModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRfid || !rfidInput.trim()}
                  className="flex-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gadget-dark hover:bg-gadget-dark/90 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmittingRfid ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSubmittingRfid ? "در حال ثبت..." : "ثبت و تخصیص کارت"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}