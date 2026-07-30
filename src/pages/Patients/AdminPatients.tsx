import { useState, useEffect } from 'react';
import { 
  Users, Search, Phone, CreditCard, 
  Loader2, Wifi, WifiOff, ChevronRight, ChevronLeft
} from 'lucide-react';
import api from '../../services/api';

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

  // ایجاد تاخیر در جستجو (Debounce) برای جلوگیری از ارسال ریکوئست‌های رگباری به سرور
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // با هر جستجوی جدید، برگرد به صفحه اول
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // فراخوانی API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      // ارسال کوئری‌های صفحه و کلمه جستجو به بک‌اند
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
            {patients.map((patient) => (
              <div key={patient._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col relative overflow-hidden group">
                
                {/* نوار دکوری بالا */}
                <div className="absolute top-0 right-0 w-full h-1 bg-linear-to-r from-gray-200 to-gray-100 group-hover:from-blue-400 group-hover:to-blue-600 transition-all"></div>

                <div className="flex items-start justify-between mb-4 mt-2">
                  <div>
                    <h3 className="font-black text-base text-gray-800 truncate pr-1">
                      {patient.firstName} {patient.lastName}
                    </h3>
                  </div>
                  
                  {/* نمایش وضعیت کارت RFID */}
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

                <div className="space-y-3 mt-auto bg-gray-50/50 p-3 rounded-xl border border-gray-100">
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
              </div>
            ))}
          </div>
        )}

        {/* ================== صفحه‌بندی (Pagination) ================== */}
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
                  // برای جلوگیری از شلوغی، فقط صفحات نزدیک به صفحه فعلی را نشان بده
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
    </div>
  );
}