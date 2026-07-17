import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  UserX,
  UserCheck,
  // Mail,
  Phone,
  CreditCard,
  MapPin,
  Car,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Layers,
  Palette,
  Clock,
  X,
  CheckCircle2,
  Banknote,
  LogIn
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

// 👈 ایمپورت‌های مربوط به تقویم شمسی
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

// === اینترفیس‌های لیدر ===
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

// === اینترفیس‌های مربوط به در دسترس بودن لیدر ===
interface HourlySlot {
  time: string;
  isBooked: boolean;
}

interface ShiftDetails {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  hours: HourlySlot[];
}

interface AvailableDay {
  date: string;
  isFullDayBooked: boolean;
  dayShift?: ShiftDetails;
  nightShift?: ShiftDetails;
}

interface LeaderAvailability {
  leaderId: string;
  pricing: {
    fullDay: number;
    dayShift: number;
    nightShift: number;
    hourlyDay: number;
    hourlyNight: number;
  };
  availableDays: AvailableDay[];
}

export default function Leaders() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [expandedLeaderId, setExpandedLeaderId] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // --- استیت‌های مربوط به مدال رزرو لیدر ---
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingLeader, setBookingLeader] = useState<Leader | null>(null);
  const [availabilityData, setAvailabilityData] = useState<LeaderAvailability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  
  // استیت‌های فرم رزرو
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [bookingType, setBookingType] = useState<"FULL_DAY" | "SHIFT" | "HOURLY" | "">("");
  const [shiftType, setShiftType] = useState<"DAY" | "NIGHT" | "">("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

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

  // ==================== لاجیک سیستم رزرو ====================

  const openBookingModal = async (leader: Leader) => {
    if (!isLoggedIn) {
      toast.error("برای رزرو و هماهنگی با لیدر، ابتدا وارد حساب کاربری خود شوید.");
      navigate("/login");
      return;
    }

    setBookingLeader(leader);
    setBookingModalOpen(true);
    setAvailabilityLoading(true);
    setSelectedDate("");
    setBookingType("");
    setShiftType("");
    setSelectedTimeSlots([]);
    setAvailabilityData(null);

    try {
      const response = await api.get(`/leader/getLeaderAvailability?leaderId=${leader._id}`);
      if (response.data?.success) {
        setAvailabilityData(response.data.data);
      }
    } catch (error) {
      toast.error("خطا در دریافت تقویم کاری لیدر.");
      setBookingModalOpen(false);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setBookingLeader(null);
  };

  const handleDateChange = (date: any) => {
    if (date && date.isValid) {
      const jsDate = date.toDate();
      const year = jsDate.getFullYear();
      const month = String(jsDate.getMonth() + 1).padStart(2, "0");
      const day = String(jsDate.getDate()).padStart(2, "0");
      setSelectedDate(`${year}-${month}-${day}`);
    } else {
      setSelectedDate("");
    }
    // با هر بار تغییر تاریخ، انتخاب‌های قبلی رزرو ریست می‌شوند
    setBookingType("");
    setShiftType("");
    setSelectedTimeSlots([]);
  };

  const handleTimeSlotToggle = (time: string) => {
    setSelectedTimeSlots((prev) => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const calculateTotalPrice = () => {
    if (!availabilityData || !bookingType) return 0;
    const pricing = availabilityData.pricing;

    if (bookingType === "FULL_DAY") return pricing.fullDay;
    if (bookingType === "SHIFT") {
      return shiftType === "DAY" ? pricing.dayShift : pricing.nightShift;
    }
    if (bookingType === "HOURLY") {
      const hourlyRate = shiftType === "DAY" ? pricing.hourlyDay : pricing.hourlyNight;
      return selectedTimeSlots.length * hourlyRate;
    }
    return 0;
  };

  const submitBooking = async () => {
    if (!selectedDate || !bookingType) {
      toast.error("لطفاً نوع رزرو و شیفت را انتخاب کنید.");
      return;
    }
    if (bookingType === "HOURLY" && selectedTimeSlots.length === 0) {
      toast.error("لطفاً حداقل یک بازه ساعتی انتخاب کنید.");
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const payload: any = {
        leaderId: bookingLeader?._id,
        date: selectedDate,
        bookingType: bookingType,
      };

      if (bookingType !== "FULL_DAY") {
        payload.shiftType = shiftType;
      }
      if (bookingType === "HOURLY") {
        payload.timeSlots = selectedTimeSlots;
      }

      const response = await api.post("/leader/LeaderAppointmentReservation", payload);
      if (response.data) {
        toast.success("درخواست رزرو لیدر با موفقیت ثبت شد!");
        closeBookingModal();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در ثبت رزرو.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const selectedDayData = availabilityData?.availableDays.find(d => d.date === selectedDate);

  return (
    <div className="bg-gray-50 rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* هدر و باکس جستجو */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gadget-dark/10 text-gadget-dark rounded-2xl">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">مدیریت و لیست لیدرها</h1>
              <p className="text-gray-500 text-sm mt-1">مشاهده اطلاعات هویتی و رزرو لیدرهای سامانه</p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <input type="text" placeholder="جستجو بر اساس نام خانوادگی..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full pr-4 pl-10 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light transition-all shadow-sm text-gray-700" />
            <Search className="absolute left-4 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* وضعیت بارگذاری لیست */}
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
            <h3 className="font-bold text-lg text-gray-700 mb-1">هیچ لیدری یافت نشد</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed mt-2">در حال حاضر هیچ لیدری مطابق با معیارهای جستجو وجود ندارد.</p>
          </div>
        ) : (
          <>
            {/* لیست کارت لیدرها */}
            <div className="grid grid-cols-1 gap-4">
              {leaders.map((leader) => {
                const isExpanded = expandedLeaderId === leader._id;
                return (
                  <div key={leader._id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-gadget-dark opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
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
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${leader.isActive ? "bg-green-50 text-green-600 border border-green-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                              {leader.isActive ? <UserCheck size={12} /> : <ShieldAlert size={12} />}
                              {leader.isActive ? "حساب فعال" : "غیرفعال"}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">شهر {leader.city}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600" dir="ltr">
                            <Phone size={14} className="text-gray-400" />
                            <span>{leader.mobile}</span>
                          </div>
                        </div>
                        <button onClick={() => toggleExpand(leader._id)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors cursor-pointer" title="نمایش جزئیات کامل">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-gray-100 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                        
                        {/* دکمه رزرو لیدر */}
                        {leader.isActive && (
                           <div className="flex justify-end mb-4">
                             {isLoggedIn ? (
                               <button onClick={() => openBookingModal(leader)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm shadow-md transition-colors cursor-pointer">
                                 <CalendarIcon size={16} />
                                 رزرو و هماهنگی لیدر
                               </button>
                             ) : (
                               <button onClick={() => navigate("/login")} className="bg-gadget-dark/10 hover:bg-gadget-dark/20 text-gadget-dark font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm shadow-xs transition-colors cursor-pointer border border-gadget-dark/20">
                                 <LogIn size={16} />
                                 برای رزرو وارد شوید
                               </button>
                             )}
                           </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CreditCard size={16} className="text-gray-400" />
                            <span className="text-gray-400">کد ملی:</span>
                            <span className="font-medium" dir="ltr">{leader.nationalId || "---"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users size={16} className="text-gray-400" />
                            <span className="text-gray-400">سن لیدر:</span>
                            <span className="font-medium">{leader.age} سال</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2 md:col-span-1">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="text-gray-400">آدرس:</span>
                            <span className="font-medium truncate max-w-62.5" title={leader.Address}>{leader.Address || "---"}</span>
                          </div>
                        </div>

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
                                <span className=" text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><Palette size={12}/> رنگ</span>
                                <span className="font-bold text-sm text-gray-700">{leader.car.color}</span>
                              </div>
                              <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs">
                                <span className=" text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><CalendarIcon size={12}/> سال ساخت</span>
                                <span className="font-bold text-sm text-gray-700" dir="ltr">{leader.car.manufactureYear}</span>
                              </div>
                              <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs col-span-2 sm:col-span-1">
                                <span className=" text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><Layers size={12}/> شماره پلاک</span>
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

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"><ChevronRight size={16} /></button>
                <div className="text-xs font-bold text-gray-600 px-3">صفحه {pagination.currentPage} از {pagination.totalPages}</div>
                <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
              </div>
            )}
          </>
        )}
      </div>

     {/* ===================== مُدال رزرو لیدر ===================== */}
      {bookingModalOpen && bookingLeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
          {/* 👈 ۱. اضافه شدن min-h-[550px] برای تضمین ارتفاع کلی مدال */}
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] min-h-137.5 overflow-hidden">
            
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <CalendarIcon size={20} className="text-emerald-600" /> رزرو و زمان‌بندی لیدر
                </h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">لیدر انتخابی: {bookingLeader.firstName} {bookingLeader.lastName}</p>
              </div>
              <button onClick={closeBookingModal} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* 👈 ۲. اضافه شدن flex-1 و min-h-[450px] تا با باز شدن تقویم اسکرول مزاحم ایجاد نشود */}
            <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 min-h-112.5">
              {availabilityLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="animate-spin text-gadget-light mb-3" size={32} />
                  <span className="text-sm text-gray-500 font-medium">در حال دریافت تقویم کاری...</span>
                </div>
              ) : !availabilityData ? (
                <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100">
                  <ShieldAlert size={32} className="mx-auto text-red-500 mb-3" />
                  <p className="font-bold text-red-800">خطا در دریافت اطلاعات</p>
                  <p className="text-xs text-red-600/80 mt-1">مشکلی در ارتباط با سرور پیش آمد.</p>
                </div>
              ) : (
                <>
                  {/* انتخاب تاریخ آزاد با تقویم شمسی */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                      <CalendarIcon size={16} className="text-gadget-light"/> ۱. انتخاب تاریخ رزرو
                    </label>
                    <div className="relative">
                      <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={selectedDate ? new Date(selectedDate) : ""}
                        onChange={handleDateChange}
                        format="YYYY/MM/DD"
                        containerClassName="w-full"
                        inputClass="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm focus:border-gadget-light font-bold text-gray-800 outline-hidden cursor-pointer shadow-sm"
                        placeholder="یک تاریخ از تقویم انتخاب کنید..."
                      />
                      <CalendarIcon className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>

                  {/* پیام در صورت عدم ثبت شیفت در تاریخ انتخابی */}
                  {selectedDate && !selectedDayData && (
                     <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center animate-in fade-in">
                       <span className="text-red-600 font-bold text-sm">لیدر در این تاریخ برنامه آزادی در سیستم ثبت نکرده است.</span>
                     </div>
                  )}

                  {/* انتخاب نوع رزرو */}
                  {selectedDayData && !selectedDayData.isFullDayBooked && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><Clock size={16} className="text-gadget-light"/> ۲. نوع رزرو خود را مشخص کنید</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        
                        {/* رزرو کل روز */}
                        {selectedDayData.dayShift && selectedDayData.nightShift && (
                          <button 
                            onClick={() => { setBookingType("FULL_DAY"); setShiftType(""); setSelectedTimeSlots([]); }}
                            className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer ${bookingType === "FULL_DAY" ? "border-emerald-500 bg-emerald-50 shadow-xs" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                          >
                            <span className="font-bold text-sm text-gray-800">روزانه (کل روز)</span>
                            <span className="text-[11px] text-gray-500">پوشش کامل روز و شب</span>
                          </button>
                        )}

                        {/* رزرو شیفت روز */}
                        {selectedDayData.dayShift && (
                          <button 
                            onClick={() => { 
                              setBookingType(selectedDayData.dayShift!.hours.length > 0 ? "HOURLY" : "SHIFT"); 
                              setShiftType("DAY"); 
                              setSelectedTimeSlots([]); 
                            }}
                            className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer ${shiftType === "DAY" ? "border-blue-500 bg-blue-50 shadow-xs" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                          >
                            <span className="font-bold text-sm text-gray-800">شیفت روز</span>
                            <span className="text-[11px] text-gray-500">
                              {selectedDayData.dayShift.hours.length > 0 ? "انتخاب ساعت" : "پوشش کل شیفت"}
                            </span>
                          </button>
                        )}

                        {/* رزرو شیفت شب */}
                        {selectedDayData.nightShift && (
                          <button 
                            onClick={() => { 
                              setBookingType(selectedDayData.nightShift!.hours.length > 0 ? "HOURLY" : "SHIFT"); 
                              setShiftType("NIGHT"); 
                              setSelectedTimeSlots([]); 
                            }}
                            className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer ${shiftType === "NIGHT" ? "border-indigo-500 bg-indigo-50 shadow-xs" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                          >
                            <span className="font-bold text-sm text-gray-800">شیفت شب</span>
                            <span className="text-[11px] text-gray-500">
                              {selectedDayData.nightShift.hours.length > 0 ? "انتخاب ساعت" : "پوشش کل شیفت"}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* نمایش ساعت‌های قابل انتخاب */}
                      {bookingType === "HOURLY" && shiftType && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2 space-y-3 animate-in fade-in">
                          <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                            <Layers size={14} className="text-gray-400" />
                            انتخاب بازه‌های ساعتی مورد نیاز:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(shiftType === "DAY" ? selectedDayData.dayShift?.hours : selectedDayData.nightShift?.hours)?.map((slot) => {
                              if (slot.isBooked) return <span key={slot.time} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-200 text-gray-500 line-through decoration-gray-400 cursor-not-allowed border border-gray-300" dir="ltr">{slot.time}</span>;
                              
                              const isSelected = selectedTimeSlots.includes(slot.time);
                              return (
                                <button key={slot.time} onClick={() => handleTimeSlotToggle(slot.time)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shadow-2xs ${isSelected ? "bg-gadget-dark text-white border-gadget-dark" : "bg-white text-gray-700 border-gray-300 hover:border-gadget-light hover:text-gadget-dark"}`} dir="ltr">
                                  {slot.time}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* خلاصه و محاسبه قیمت نهایی */}
                  {bookingType && selectedDayData && (
                    <div className="bg-gray-800 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-2 mt-6 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                          <Banknote size={20} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-300 font-medium">مبلغ قابل پرداخت خدمات</p>
                          <p className="text-lg font-bold mt-0.5">{formatPrice(calculateTotalPrice())}</p>
                        </div>
                      </div>
                      <button onClick={submitBooking} disabled={isSubmittingBooking} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm shadow-md transition-all cursor-pointer disabled:opacity-70">
                        {isSubmittingBooking ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        تایید و ثبت رزرو
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}