import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  UserX,
  UserCheck,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  // Banknote,
  Car,
  ChevronDown,
  ChevronUp,
  Calendar,
  Layers,
  Palette,
  User
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

// === بروزرسانی اینترفیس بر اساس دیتای جدید دیتابیس ===
interface Leader {
  _id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string;
  isActive: boolean;
  nationalId: string;
  age: number;
  city: string;
  DailyPrice: number;
  Address: string;
  hasCar: boolean;
  car?: {
    brand: string;
    model: string;
    color: string;
    plateNumber: string;
    manufactureYear: number;
  };
  createdAt?: string;
}

interface PaginationInfo {
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export default function Leaders() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // استیت ذخیره آیدی کارت‌های باز شده جهت نمایش جزئیات کامل
  const [expandedLeaderId, setExpandedLeaderId] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  const fetchLeaders = async (page = 1, search = "") => {
    try {
      setLoading(true);
      let url = `/users/LedearList?page=${page}&limit=10`;
      if (search) {
        url += `&search=${search}`;
      }

      const response = await api.get(url);

      if (response.data && response.data.success) {
        setLeaders(response.data.data || []);
        setPagination({
          totalItems: response.data.pagination?.totalItems || 0,
          currentPage: response.data.pagination?.currentPage || 1,
          totalPages: response.data.pagination?.totalPages || 0,
        });
      }
    } catch (err) {
      console.error("خطا در دریافت لیست لیدرها:", err);
      toast.error("مشکلی در دریافت اطلاعات لیدرها از سرور پیش آمد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLeaders(1, searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLeaders(newPage, searchTerm);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedLeaderId(expandedLeaderId === id ? null : id);
  };

  const formatPrice = (price: number) => {
    if (!price) return "---";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  return (
    <div className="bg-gray-50 rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ================= هدر و باکس جستجو ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">مدیریت و لیست لیدرها</h1>
              <p className="text-gray-500 text-sm mt-1">
                مشاهده اطلاعات هویتی، ترابری و دستمزد روزانه لیدرهای سامانه
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="جستجو بر اساس نام خانوادگی..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full pr-4 pl-10 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light transition-all shadow-sm text-gray-700"
            />
            <Search className="absolute left-4 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* ================= وضعیت بارگذاری ================= */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال بارگذاری لیست لیدرها...</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 p-16 text-center rounded-2xl text-gray-500 max-w-2xl mx-auto shadow-2xs">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-300">
              <UserX size={32} />
            </div>
            <h3 className="font-bold text-lg text-gray-700 mb-1">هیچ لیدری در سیستم ثبت نشده است</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed mt-2">
              در حال حاضر هیچ لیدری مطابق با معیارهای تنظیم شده یا در کل سامانه وجود ندارد.
            </p>
          </div>
        ) : (
          <>
            {/* ================= لیست کارت لیدرها ================= */}
            <div className="grid grid-cols-1 gap-4">
              {leaders.map((leader) => {
                const isExpanded = expandedLeaderId === leader._id;
                return (
                  <div
                    key={leader._id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-gadget-dark opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* بخش اصلی و خلاصه کارت */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gadget-dark text-white flex items-center justify-center text-xl font-bold shrink-0">
                          {leader.lastName ? leader.lastName.charAt(0) : "L"}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {leader.firstName} {leader.lastName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              leader.isActive ? "bg-green-50 text-green-600 border border-green-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}>
                              {leader.isActive ? <UserCheck size={12} /> : <ShieldAlert size={12} />}
                              {leader.isActive ? "حساب فعال" : "غیرفعال"}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                              شهر {leader.city}
                            </span>
                            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                              {formatPrice(leader.DailyPrice)} / روزانه
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* اطلاعات تماس و دکمه باز کردن جزئیات */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600" dir="ltr">
                            <Phone size={14} className="text-gray-400" />
                            <span>{leader.mobile}</span>
                          </div>
                          {leader.email && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400" dir="ltr">
                              <Mail size={14} className="text-gray-400" />
                              <span className="max-w-40 truncate">{leader.email}</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => toggleExpand(leader._id)}
                          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors cursor-pointer"
                          title="نمایش جزئیات کامل"
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* 👈 بخش جزئیات کامل (Collapse Section) */}
                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-gray-100 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                        
                        {/* فیلدهای عمومی ثبتی */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CreditCard size={16} className="text-gray-400" />
                            <span className="text-gray-400">کد ملی:</span>
                            <span className="font-medium" dir="ltr">{leader.nationalId || "---"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User size={16} className="text-gray-400" />
                            <span className="text-gray-400">سن لیدر:</span>
                            <span className="font-medium">{leader.age} سال</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2 md:col-span-1">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="text-gray-400">آدرس:</span>
                            <span className="font-medium truncate max-w-62.5" title={leader.Address}>{leader.Address || "---"}</span>
                          </div>
                        </div>

                        {/* مشخصات خودرو ترابری (اگر خودرو دارد) */}
                        {leader.hasCar && leader.car ? (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                              <Car size={15} className="text-amber-500" /> اطلاعات و مشخصات فنی خودرو
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                              <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs">
                                <span className="block text-[10px] text-gray-400 mb-0.5">برند خودرو</span>
                                <span className="font-bold text-sm text-gray-700">{leader.car.brand}</span>
                              </div>
                              <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs">
                                <span className="block text-[10px] text-gray-400 mb-0.5">مدل خودرو</span>
                                <span className="font-bold text-sm text-gray-700">{leader.car.model}</span>
                              </div>
                              <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs">
                                <span className=" text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">
                                  <Palette size={12}/> رنگ
                                </span>
                                <span className="font-bold text-sm text-gray-700">{leader.car.color}</span>
                              </div>
                              <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs">
                                <span className=" text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">
                                  <Calendar size={12}/> سال ساخت
                                </span>
                                <span className="font-bold text-sm text-gray-700" dir="ltr">{leader.car.manufactureYear}</span>
                              </div>
                              <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs col-span-2 sm:col-span-1">
                                <span className=" text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">
                                  <Layers size={12}/> شماره پلاک
                                </span>
                                <span className="font-bold text-xs text-gray-700" dir="ltr">{leader.car.plateNumber}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 bg-gray-100/50 p-3 rounded-xl border border-dashed border-gray-200">
                            این لیدر فاقد خودروی شخصی ثبت شده جهت ترابری بیماران است.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ================= کنترلر صفحه‌بندی ================= */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
                
                <div className="text-xs font-bold text-gray-600 px-3">
                  صفحه {pagination.currentPage} از {pagination.totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}