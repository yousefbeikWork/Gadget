import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Phone,
  FileBadge,
  Loader2,
  Beaker,
  FlaskConical,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Users,
  X,
  Info,
  TestTube2,
  Banknote,
  ClipboardList,
  LogIn,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

// === اینترفیس‌ها ===
interface TestItem {
  _id: string;
  testName: string;
  testCode: string;
  department: string;
  price: number;
  isAvailable: boolean;
  preparationInstructions: string;
}

interface Manager {
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile: string;
  role: string;
}

interface Laboratory {
  _id: string;
  centerName: string;
  centerType: string;
  licenseCode: string;
  ownershipType: string;
  address: string;
  postalCode: string;
  phones: string[];
  activeStaffCount: number;
  specialty: string;
  manager: Manager;
  availableTests: TestItem[];
  laboratorImages: string[];
}

interface LabSlot {
  slotId: string;
  testId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  remainingCapacity: number;
  isFull: boolean;
}

export default function Laboratories() {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeLab, setActiveLab] = useState<Laboratory | null>(null);
  const [slots, setSlots] = useState<LabSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<LabSlot | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    const fetchLaboratories = async () => {
      try {
        setLoadingList(true);
        const response = await api.get("/laboratory/listLaboratory");
        if (response.data && response.data.success) {
          setLaboratories(response.data.data);
        }
      } catch (error) {
        console.error("خطا در دریافت لیست آزمایشگاه‌ها:", error);
      } finally {
        setLoadingList(false);
      }
    };

    fetchLaboratories();
  }, []);

  const fetchSlots = async (labId: string, date: string) => {
    try {
      setLoadingSlots(true);
      const url = date
        ? `/laboratory/slots/${labId}?date=${date}`
        : `/laboratory/slots/${labId}`;

      const response = await api.get(url);

      if (response.data) {
        setSlots(response.data.slots || []);
      }
    } catch (err: any) {
      toast.error("خطا در دریافت لیست نوبت‌های آزمایشگاه");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (activeLab) {
      fetchSlots(activeLab._id, selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, activeLab]);

  const filteredLaboratories = laboratories.filter(
    (lab) =>
      lab.centerName.includes(searchQuery) || lab.address.includes(searchQuery),
  );

  const formatShamsi = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // فرمت کردن قیمت با کاما (مثلا 500000 -> 500,000 تومان)
  const formatPrice = (price: number) => {
    if (!price) return "نامشخص";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
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
  };

  const handleSelectLab = (lab: Laboratory) => {
    setActiveLab(lab);
    setSelectedDate("");
  };

  const openBookingModal = (slot: LabSlot) => {
    if (!isLoggedIn) {
      toast.error(
        "برای رزرو نوبت آزمایشگاه، ابتدا باید وارد حساب کاربری خود شوید.",
      );
      // مسیر زیر را بر اساس آدرس صفحه لاگین خودتان تنظیم کنید (مثلاً "/auth" یا "/login")
      navigate("/login");
      return;
    }
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const confirmReservation = async () => {
    if (!selectedSlot) return;

    setIsReserving(true);
    try {
      const payload = { slotId: selectedSlot.slotId };
      const response = await api.post(
        "/laboratory/reserveSlotLaborator",
        payload,
      );

      if (response.data) {
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {response.data.message || "نوبت با موفقیت رزرو شد."}
            </span>
            <span className="text-xs">
              ساعت: {response.data.slotDetails?.time}
            </span>
          </div>,
          { duration: 5000 },
        );

        setIsModalOpen(false);
        if (activeLab) fetchSlots(activeLab._id, selectedDate);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "خطا در رزرو نوبت. ممکن است ظرفیت پر شده باشد.",
      );
    } finally {
      setIsReserving(false);
    }
  };

  // پیدا کردن اطلاعات تستی که قرار است رزرو شود (برای نمایش در مودال)
  const activeTestDetails =
    selectedSlot && activeLab
      ? activeLab.availableTests.find((t) => t._id === selectedSlot.testId)
      : null;

  return (
    <div
      className="bg-gray-50 rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 relative"
      dir="rtl"
    >
      {/* ================= مودال رزرو ================= */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-700/50 backdrop-blur-sm transition-opacity"
            onClick={() => !isReserving && setIsModalOpen(false)}
          ></div>

          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between bg-gray-50 border-b border-gray-100 px-6 py-4">
              <h3 className="font-bold text-gray-800 text-lg">
                تأیید نوبت آزمایشگاه
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isReserving}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                <Info size={24} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 leading-relaxed font-medium">
                  آیا از رزرو این نوبت در{" "}
                  <span className="font-bold">{activeLab?.centerName}</span>{" "}
                  اطمینان دارید؟
                </p>
              </div>

              {/* باکس اطلاعات زمانی */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">تاریخ مراجعه:</span>
                  <span className="font-bold text-gray-800">
                    {formatShamsi(selectedSlot.date)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">ساعت مراجعه:</span>
                  <span className="font-bold text-gadget-dark" dir="ltr">
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </span>
                </div>
              </div>

              {/* باکس اطلاعات تست (نام، قیمت و شرایط) */}
              {activeTestDetails && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <TestTube2 size={16} /> نام تست:
                    </span>
                    <span className="font-bold text-gray-800">
                      {activeTestDetails.testName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Banknote size={16} /> هزینه:
                    </span>
                    <span className="font-bold text-emerald-600">
                      {formatPrice(activeTestDetails.price)}
                    </span>
                  </div>

                  {activeTestDetails.preparationInstructions && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <h4 className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
                        <ClipboardList size={14} /> شرایط پیش از آزمایش:
                      </h4>
                      <p className="text-xs text-amber-900/80 leading-relaxed font-medium">
                        {activeTestDetails.preparationInstructions}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 pt-2 flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isReserving}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={confirmReservation}
                disabled={isReserving}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isReserving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                {isReserving ? "در حال ثبت..." : "بله، قطعی کن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= نمایش ویو بر اساس استیت ================= */}
      {!activeLab ? (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
          {/* هدر و جستجو */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="text-gadget-dark">
                <FlaskConical size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  لیست آزمایشگاه‌ها
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  مرکز مورد نظر خود را پیدا کنید و نوبت بگیرید
                </p>
              </div>
            </div>

            <div className="relative w-full md:w-87.5">
              <input
                type="text"
                placeholder="جستجوی نام یا آدرس..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full pr-4 pl-10 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light transition-all shadow-sm text-gray-700"
              />
              <Search
                className="absolute left-4 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>

          {/* لیست کارت‌های آزمایشگاه */}
          {loadingList ? (
            <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-sm font-medium">
                در حال دریافت اطلاعات مراکز...
              </p>
            </div>
          ) : filteredLaboratories.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 p-12 text-center rounded-2xl text-gray-500">
              <Beaker
                size={48}
                strokeWidth={1}
                className="mx-auto mb-3 text-gray-300"
              />
              <p className="font-medium text-lg">آزمایشگاهی یافت نشد.</p>
              <p className="text-sm mt-1">
                با این جستجو، مرکزی در سیستم پیدا نشد.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLaboratories.map((lab) => (
                <div
                  key={lab._id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {lab.centerName}
                      </h3>
                      <div>
                        <span className="inline-block bg-teal-50 text-gadget-dark px-3 py-1 rounded-full text-xs font-medium">
                          {lab.specialty || "آزمایشگاه"}
                        </span>
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-gadget-dark text-white flex items-center justify-center text-xl font-bold shadow-sm">
                      {lab.laboratorImages && lab.laboratorImages.length > 0 ? (
                        <img
                          src={lab.laboratorImages[0]}
                          alt={lab.centerName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement?.classList.add(
                              "flex",
                              "items-center",
                              "justify-center",
                            );
                          }}
                        />
                      ) : (
                        lab.centerName.charAt(0)
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-100 mb-4" />

                  <div className="space-y-3 flex-1 mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="font-medium" dir="ltr">
                        {lab.licenseCode || "---"}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span>کد پروانه:</span>
                        <FileBadge size={16} strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="font-medium" dir="ltr">
                        {lab.phones && lab.phones.length > 0
                          ? lab.phones[0]
                          : "---"}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone size={16} strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="flex items-start justify-between text-sm text-gray-600">
                      <span className="font-medium leading-relaxed max-w-[85%] line-clamp-2">
                        {lab.address || "---"}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500 shrink-0 mt-0.5">
                        <MapPin size={16} strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* نمایش تست‌های آزمایشگاه */}
                    {lab.availableTests && lab.availableTests.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-gray-50">
                        <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
                          <TestTube2 size={14} className="text-gadget-light" />
                          تست‌های قابل انجام:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {lab.availableTests.slice(0, 3).map((test) => (
                            <span
                              key={test._id}
                              className="bg-blue-50 text-blue-700 border border-blue-100 text-[11px] px-2 py-1 rounded-md"
                            >
                              {test.testName}
                            </span>
                          ))}

                          {lab.availableTests.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 border border-gray-200 text-[11px] px-2 py-1 rounded-md">
                              +{lab.availableTests.length - 3} مورد دیگر
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* اگر کاربر ادمین یا سوپر ادمین بود، کلاً دکمه‌های رزرو و ورود را مخفی کن */}
                  {userRole !== "Admin" && userRole !== "SUPER_ADMIN" && (
                    <div className="mt-auto pt-4">
                      {isLoggedIn ? (
                        <button
                          onClick={() => handleSelectLab(lab)}
                          className="w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white text-center py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          مشاهده نوبت‌ها و رزرو
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate("/login")}
                          className="w-full bg-gray-50 border border-gray-200 hover:border-gadget-light text-gray-600 hover:text-gadget-light text-center py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <LogIn size={18} />{" "}
                          {/* در صورت تمایل آیکون LogIn را ایمپورت کنید */}
                          برای رزرو وارد شوید
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveLab(null)}
                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors cursor-pointer"
                title="بازگشت به لیست"
              >
                <ChevronRight size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gadget-dark text-white rounded-xl shadow-sm">
                  <FlaskConical size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {activeLab.centerName}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    رزرو آنلاین نوبت آزمایشگاه
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <label className=" text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <CalendarIcon size={18} className="text-gadget-light" />
              مشاهده نوبت‌ها در تاریخ خاص:
            </label>
            <div className="relative w-full md:w-1/3">
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={selectedDate ? new Date(selectedDate) : ""}
                onChange={handleDateChange}
                format="YYYY/MM/DD"
                containerClassName="w-full"
                inputClass="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-gadget-light cursor-pointer shadow-inner font-medium text-gray-700 transition-colors"
                placeholder="همه روزها (انتخاب از تقویم)"
              />
            </div>
          </div>

          {loadingSlots ? (
            <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-sm font-medium">
                در حال دریافت لیست نوبت‌های خالی...
              </p>
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 p-12 text-center rounded-2xl text-gray-500">
              <AlertCircle
                size={48}
                strokeWidth={1}
                className="mx-auto mb-3 text-gray-300"
              />
              <p className="font-medium text-lg">نوبتی یافت نشد.</p>
              <p className="text-sm mt-1">
                در تاریخ انتخاب شده، ظرفیتی برای این آزمایشگاه ثبت نشده است.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {slots.map((slot) => {
                const isSlotFull = slot.isFull || slot.remainingCapacity <= 0;
                // پیدا کردن مشخصات تست برای نمایش در کارت نوبت
                const slotTestDetails = activeLab.availableTests.find(
                  (t) => t._id === slot.testId,
                );

                return (
                  <div
                    key={slot.slotId}
                    className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col transition-all duration-300 ${
                      isSlotFull
                        ? "border-gray-200 opacity-75"
                        : "border-gadget-light/30 hover:shadow-md hover:-translate-y-1"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
                      <div
                        className="flex items-center gap-2 text-gadget-dark font-bold bg-gadget-light/10 px-3 py-1.5 rounded-lg text-sm"
                        dir="ltr"
                      >
                        <Clock size={16} />
                        {slot.startTime} - {slot.endTime}
                      </div>

                      {isSlotFull ? (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                          ظرفیت تکمیل
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                          <CheckCircle2 size={12} /> ظرفیت دارد
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      {/* نمایش اسم تست در خود کارت */}
                      <div className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
                        <TestTube2 size={16} className="text-gadget-light" />
                        {slotTestDetails?.testName || "آزمایش نامشخص"}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>تاریخ مراجعه:</span>
                        <span className="font-bold text-gray-800">
                          {formatShamsi(slot.date)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>ظرفیت باقی‌مانده:</span>
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            isSlotFull ? "text-red-500" : "text-gadget-light"
                          }`}
                        >
                          {slot.remainingCapacity} <Users size={14} />
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openBookingModal(slot)}
                      disabled={isSlotFull}
                      className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        isSlotFull
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-md cursor-pointer"
                      }`}
                    >
                      {isSlotFull ? "ظرفیت تکمیل شده" : "مشاهده جزئیات و رزرو"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
