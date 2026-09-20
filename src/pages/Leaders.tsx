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
  CreditCard,
  MapPin,
  Car,
  Calendar as CalendarIcon,
  Clock,
  X,
  CheckCircle2,
  Banknote,
  LogIn,
  Compass,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

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
  const { isLoggedIn, userRole } = useAuth();

  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 👈 استیت باز و بسته کردن متن آدرس‌های طولانی
  const [expandedAddresses, setExpandedAddresses] = useState<Record<string, boolean>>({});

  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // استیت‌های مودال رزرو لیدر
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingLeader, setBookingLeader] = useState<Leader | null>(null);
  const [availabilityData, setAvailabilityData] =
    useState<LeaderAvailability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [bookingType, setBookingType] = useState<
    "FULL_DAY" | "DAY_SHIFT" | "NIGHT_SHIFT" | "HOURLY" | ""
  >("");
  const [shiftType, setShiftType] = useState<"DAY" | "NIGHT" | "">("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const toggleAddressExpand = (id: string) => {
    setExpandedAddresses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const fetchLeaders = async (page = 1, search = "") => {
    try {
      setLoading(true);
      let url = `/users/LedearList?page=${page}&limit=9`;
      if (search) {
        url += `&search=${search}`;
      }
      const response = await api.get(url);
      if (response.data && response.data.success) {
        // 👈 فقط لیدرهای با وضعیت فعال در لیست قرار می‌گیرند
        const activeOnly = (response.data.data || []).filter(
          (l: Leader) => l.isActive === true,
        );
        setLeaders(activeOnly);

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

  const formatPrice = (price: number) => {
    if (!price) return "---";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

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
      const response = await api.get(
        `/leader/getLeaderAvailability?leaderId=${leader._id}`,
      );
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
    setBookingType("");
    setShiftType("");
    setSelectedTimeSlots([]);
  };

  const handleTimeSlotToggle = (time: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
    );
  };

  const calculateTotalPrice = () => {
    if (!availabilityData || !bookingType) return 0;
    const pricing = availabilityData.pricing;

    if (bookingType === "FULL_DAY") return pricing.fullDay;
    if (bookingType === "DAY_SHIFT") return pricing.dayShift;
    if (bookingType === "NIGHT_SHIFT") return pricing.nightShift;
    if (bookingType === "HOURLY") {
      const hourlyRate =
        shiftType === "DAY" ? pricing.hourlyDay : pricing.hourlyNight;
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

      const response = await api.post(
        "/leader/LeaderAppointmentReservation",
        payload,
      );
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

  const selectedDayData = availabilityData?.availableDays.find(
    (d) => d.date === selectedDate,
  );

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 w-full h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 font-sans relative"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ================= هدر صفحه و باکس جستجو ================= */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gadget-dark flex items-center gap-2">
              <Compass className="text-gadget-light" size={28} />
              لیست لیدرهای گردشگری سلامت
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              راهنما و مترجم مورد نظر خود را برای همراهی درمانی انتخاب و رزرو کنید
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="جستجوی نام یا شهر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors text-gray-700"
            />
          </div>
        </div>

        {/* وضعیت‌های لودینگ و خالی بودن */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال دریافت لیست لیدرها...</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 p-12 text-center rounded-2xl text-gray-500 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-400 shadow-xs">
              <UserX size={32} />
            </div>
            <h3 className="font-bold text-base text-gray-700 mb-1">لیدر فعالی یافت نشد</h3>
            <p className="text-xs text-gray-400">
              در حال حاضر لیدر فعالی مطابق با جستجوی شما وجود ندارد.
            </p>
          </div>
        ) : (
          <>
            {/* ================= گرید کارت‌های لیدر ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaders.map((leader) => {
                const isAddressExpanded = !!expandedAddresses[leader._id];
                const fullAddress = leader.Address
                  ? `${leader.city}، ${leader.Address}`
                  : `شهر ${leader.city}`;

                return (
                  <div
                    key={leader._id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col h-full group"
                  >
                    {/* هدر کارت: آواتار و نام (بدون تگ فعال/غیرفعال) */}
                    <div className="flex items-center gap-4 mb-5 border-b border-gray-100 pb-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#14b8a6] text-white flex items-center justify-center text-xl font-black shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {leader.lastName ? leader.lastName.charAt(0) : "ل"}
                      </div>

                      <div className="overflow-hidden min-w-0 flex-1">
                        {/* متن نام در صورت طولانی بودن به سطر دوم می‌رود و بریده نمی‌شود */}
                        <h3 className="font-bold text-base sm:text-lg text-gray-800 wrap-break-word leading-snug">
                          {leader.firstName} {leader.lastName}
                        </h3>
                        <div className="mt-1">
                          <span className="inline-block bg-gadget-light/10 text-[#14b8a6] text-xs font-bold px-2 py-0.5 rounded-md">
                            لیدر همراه • {leader.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* بدنه کارت: جزئیات بدون شماره موبایل و با امکان دیدن متن کامل */}
                    <div className="space-y-3 flex-1 mb-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CreditCard className="text-gray-400 shrink-0" size={16} />
                        <span>
                          کد ملی:{" "}
                          <span className="font-medium text-gray-800" dir="ltr">
                            {leader.nationalId || "---"}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="text-gray-400 shrink-0" size={16} />
                        <span>
                          سن لیدر:{" "}
                          <span className="font-medium text-gray-800">
                            {leader.age} سال
                          </span>
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <Car className="text-gray-400 shrink-0 mt-0.5" size={16} />
                        <div className="min-w-0">
                          <span className="text-gray-500">وضعیت ترابری: </span>
                          <span className="font-medium text-gray-800 wrap-break-word">
                            {leader.hasCar && leader.car
                              ? `${leader.car.brand} ${leader.car.model} (${leader.car.color}) - سال ساخت: ${leader.car.manufactureYear || "-"}`
                              : "فاقد خودروی شخصی"}
                          </span>
                        </div>
                      </div>

                      {/* بخش آدرس با قابلیت نمایش کامل در صورت طولانی بودن */}
                      <div className="flex items-start gap-2">
                        <MapPin className="text-gray-400 shrink-0 mt-0.5" size={16} />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-gray-600 leading-relaxed text-xs sm:text-sm ${
                              isAddressExpanded ? "" : "line-clamp-2"
                            }`}
                          >
                            {fullAddress}
                          </p>

                          {/* دکمه باز کردن متن در صورتی که آدرس طولانی باشد */}
                          {fullAddress.length > 45 && (
                            <button
                              type="button"
                              onClick={() => toggleAddressExpand(leader._id)}
                              className="text-[11px] font-bold text-gadget-dark hover:text-gadget-light hover:underline mt-1 cursor-pointer transition-colors"
                            >
                              {isAddressExpanded ? "بستن متن آدرس ▲" : "مشاهده کامل آدرس ▼"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* فوتر کارت: دکمه رزرو نوبت */}
                    {userRole !== "Admin" && userRole !== "SUPER_ADMIN" && (
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        {isLoggedIn ? (
                          <button
                            onClick={() => openBookingModal(leader)}
                            className="w-full flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
                          >
                            <CalendarIcon size={18} />
                            رزرو و هماهنگی
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate("/login")}
                            className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 hover:border-gadget-light text-gray-600 hover:text-gadget-light py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
                          >
                            <LogIn size={18} />
                            برای رزرو وارد شوید
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ================= کنترل‌های صفحه‌بندی ================= */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white border border-gray-200 p-3 sm:p-4 rounded-2xl shadow-2xs mt-6">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                >
                  <ChevronRight size={16} />
                  <span>قبلی</span>
                </button>

                <span className="text-xs sm:text-sm font-bold text-gray-700">
                  صفحه {pagination.currentPage} از {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                >
                  <span>بعدی</span>
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===================== مُدال رزرو لیدر ===================== */}
      {bookingModalOpen && bookingLeader && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
          dir="rtl"
        >
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* هدر مودال */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold">
                  {bookingLeader.lastName ? bookingLeader.lastName.charAt(0) : "ل"}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-800">
                    رزرو خدمات لیدر {bookingLeader.firstName} {bookingLeader.lastName}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    شهر فعالیت: {bookingLeader.city}
                  </p>
                </div>
              </div>
              <button
                onClick={closeBookingModal}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* بدنه مودال */}
            <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
              {availabilityLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gadget-light">
                  <Loader2 className="animate-spin mb-3" size={32} />
                  <span className="text-sm font-medium">در حال استعلام تقویم کاری لیدر...</span>
                </div>
              ) : !availabilityData ? (
                <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100">
                  <ShieldAlert size={32} className="mx-auto text-red-500 mb-2" />
                  <p className="font-bold text-sm text-red-800">خطا در دریافت تقویم کاری</p>
                </div>
              ) : (
                <>
                  {/* انتخاب تاریخ */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                      <CalendarIcon size={16} className="text-gadget-light" />
                      ۱. تاریخ مورد نظر را انتخاب فرمایید:
                    </label>
                    <div className="relative">
                      <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={selectedDate ? new Date(selectedDate) : ""}
                        onChange={handleDateChange}
                        format="YYYY/MM/DD"
                        containerClassName="w-full"
                        inputClass="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 sm:py-3 text-sm focus:border-gadget-light font-bold text-gray-800 outline-hidden cursor-pointer shadow-2xs"
                        placeholder="انتخاب تاریخ از تقویم..."
                      />
                      <CalendarIcon
                        className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* وضعیت تاریخ */}
                  {selectedDate && !selectedDayData && (
                    <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-center">
                      <span className="text-red-600 font-bold text-xs sm:text-sm">
                        لیدر در این تاریخ برنامه کاری بازی ثبت نکرده است.
                      </span>
                    </div>
                  )}

                  {selectedDate && selectedDayData?.isFullDayBooked && (
                    <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-center">
                      <span className="text-amber-700 font-bold text-xs sm:text-sm">
                        ظرفیت لیدر در این تاریخ به طور کامل تکمیل شده است.
                      </span>
                    </div>
                  )}

                  {selectedDayData && !selectedDayData.isFullDayBooked && (
                    <div className="space-y-4 pt-2 border-t border-gray-100">
                      <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                        <Clock size={16} className="text-gadget-light" />
                        ۲. نوع پوشش و شیفت زمانی را انتخاب فرمایید:
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {selectedDayData.dayShift && selectedDayData.nightShift && (
                          <button
                            disabled={
                              selectedDayData.dayShift.isBooked ||
                              selectedDayData.nightShift.isBooked
                            }
                            onClick={() => {
                              setBookingType("FULL_DAY");
                              setShiftType("");
                              setSelectedTimeSlots([]);
                            }}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-1 ${
                              selectedDayData.dayShift.isBooked ||
                              selectedDayData.nightShift.isBooked
                                ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                                : bookingType === "FULL_DAY"
                                  ? "border-emerald-500 bg-emerald-50 shadow-2xs cursor-pointer"
                                  : "border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                            }`}
                          >
                            <span className="font-bold text-xs sm:text-sm text-gray-800">
                              تمام وقت (کل روز)
                            </span>
                            <span className="text-[10px] text-gray-500">
                              پوشش کامل روز و شب
                            </span>
                          </button>
                        )}

                        {selectedDayData.dayShift && (
                          <button
                            disabled={selectedDayData.dayShift.isBooked}
                            onClick={() => {
                              setBookingType(
                                selectedDayData.dayShift!.hours.length > 0
                                  ? "HOURLY"
                                  : "DAY_SHIFT",
                              );
                              setShiftType("DAY");
                              setSelectedTimeSlots([]);
                            }}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-1 ${
                              selectedDayData.dayShift.isBooked
                                ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                                : shiftType === "DAY"
                                  ? "border-blue-500 bg-blue-50 shadow-2xs cursor-pointer"
                                  : "border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                            }`}
                          >
                            <span className="font-bold text-xs sm:text-sm text-gray-800">
                              شیفت روز
                            </span>
                            <span className="text-[10px] text-blue-600 font-medium">
                              {selectedDayData.dayShift.startTime} الی {selectedDayData.dayShift.endTime}
                            </span>
                          </button>
                        )}

                        {selectedDayData.nightShift && (
                          <button
                            disabled={selectedDayData.nightShift.isBooked}
                            onClick={() => {
                              setBookingType(
                                selectedDayData.nightShift!.hours.length > 0
                                  ? "HOURLY"
                                  : "NIGHT_SHIFT",
                              );
                              setShiftType("NIGHT");
                              setSelectedTimeSlots([]);
                            }}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-1 ${
                              selectedDayData.nightShift.isBooked
                                ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                                : shiftType === "NIGHT"
                                  ? "border-indigo-500 bg-indigo-50 shadow-2xs cursor-pointer"
                                  : "border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                            }`}
                          >
                            <span className="font-bold text-xs sm:text-sm text-gray-800">
                              شیفت شب
                            </span>
                            <span className="text-[10px] text-indigo-600 font-medium">
                              {selectedDayData.nightShift.startTime} الی {selectedDayData.nightShift.endTime}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* گزینه‌های ساعتی */}
                      {(shiftType === "DAY" || shiftType === "NIGHT") && (
                        <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
                          {(() => {
                            const currentShiftData =
                              shiftType === "DAY"
                                ? selectedDayData.dayShift
                                : selectedDayData.nightShift;
                            if (!currentShiftData) return null;

                            const hasHours =
                              currentShiftData.hours &&
                              currentShiftData.hours.length > 0;
                            const hasBookedSlots =
                              hasHours && currentShiftData.hours.some((h) => h.isBooked);

                            if (hasHours) {
                              return (
                                <>
                                  <div className="flex bg-gray-200/60 p-1 rounded-lg w-full">
                                    <button
                                      onClick={() => setBookingType("HOURLY")}
                                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                                        bookingType === "HOURLY"
                                          ? "bg-white text-gadget-dark shadow-2xs"
                                          : "text-gray-500 cursor-pointer"
                                      }`}
                                    >
                                      ساعتی
                                    </button>
                                    <button
                                      disabled={hasBookedSlots}
                                      onClick={() => {
                                        setBookingType(
                                          shiftType === "DAY" ? "DAY_SHIFT" : "NIGHT_SHIFT",
                                        );
                                        setSelectedTimeSlots([]);
                                      }}
                                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                                        hasBookedSlots
                                          ? "opacity-40 cursor-not-allowed"
                                          : "cursor-pointer"
                                      } ${
                                        bookingType !== "HOURLY"
                                          ? "bg-white text-gadget-dark shadow-2xs"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      یکپارچه (کل شیفت)
                                    </button>
                                  </div>

                                  {bookingType === "HOURLY" && (
                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                      {currentShiftData.hours.map((slot) => {
                                        if (slot.isBooked) {
                                          return (
                                            <span
                                              key={slot.time}
                                              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-gray-200 text-gray-400 line-through cursor-not-allowed"
                                              dir="ltr"
                                            >
                                              {slot.time}
                                            </span>
                                          );
                                        }

                                        const isSelected = selectedTimeSlots.includes(slot.time);
                                        return (
                                          <button
                                            key={slot.time}
                                            onClick={() => handleTimeSlotToggle(slot.time)}
                                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                                              isSelected
                                                ? "bg-gadget-dark text-white border-gadget-dark"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-gadget-light"
                                            }`}
                                            dir="ltr"
                                          >
                                            {slot.time}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              );
                            }

                            return (
                              <div className="text-center text-xs font-bold text-emerald-700 bg-emerald-50 py-2.5 rounded-lg border border-emerald-100 flex items-center justify-center gap-1.5">
                                <CheckCircle2 size={16} />
                                رزرو یکپارچه شیفت {shiftType === "DAY" ? "روز" : "شب"} ({currentShiftData.startTime} الی {currentShiftData.endTime})
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* نوار مبلغ و تایید نهایی */}
                  {bookingType && selectedDayData && (
                    <div className="bg-gray-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                          <Banknote size={20} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">مبلغ نهایی خدمات</p>
                          <p className="text-base sm:text-lg font-black mt-0.5 text-white">
                            {formatPrice(calculateTotalPrice())}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={submitBooking}
                        disabled={isSubmittingBooking}
                        className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isSubmittingBooking ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        <span>تایید و ثبت نهایی رزرو</span>
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