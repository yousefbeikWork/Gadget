import { useState, useEffect, useMemo } from "react";
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
  X,
  Info,
  TestTube2,
  Banknote,
  ClipboardList,
  LogIn,
  FileCheck,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import CenterReviewModal from "../components/CenterReviewModal";
import SecureImage from "../components/SecureImage";

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
  isActive?: boolean;
  documents?: {
    exploitationLicenseFile?: string | null;
    managerIdFiles?: string[];
    establishmentLicenseFile?: string | null;
    introductionLetterFile?: string | null;
    liabilityInsuranceFile?: string | null;
    status?: string;
    rejectReason?: string | null;
  };
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
  const isAdmin = userRole === "Admin" || userRole === "SUPER_ADMIN";

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

  // استیت‌های مودال بررسی مدارک توسط ادمین
  const [reviewLab, setReviewLab] = useState<Laboratory | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // واکشی لیست آزمایشگاه‌ها متناسب با نقش کاربر
  const fetchLaboratories = async () => {
    try {
      setLoadingList(true);
      const endpoint = isAdmin
        ? "/Admin/listLaboratoryAdmin"
        : "/laboratory/listLaboratory";

      const response = await api.get(endpoint);
      if (response.data && response.data.success) {
        setLaboratories(response.data.data || []);
      } else {
        setLaboratories([]);
      }
    } catch (error) {
      console.error("خطا در دریافت لیست آزمایشگاه‌ها:", error);
      toast.error("خطا در دریافت اطلاعات آزمایشگاه‌ها.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchLaboratories();
  }, [isAdmin]);

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
  }, [selectedDate, activeLab]);

  // فیلتر جستجو و دسترسی: کاربر عادی فقط آزمایشگاه‌های فعال را می‌بیند
  const filteredLaboratories = useMemo(() => {
    const list = isAdmin
      ? laboratories
      : laboratories.filter((lab) => lab.isActive === true);

    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (lab) =>
        lab.centerName?.toLowerCase().includes(query) ||
        lab.address?.toLowerCase().includes(query) ||
        lab.specialty?.toLowerCase().includes(query),
    );
  }, [laboratories, searchQuery, isAdmin]);

  // ثبت تایید یا رد مدارک آزمایشگاه توسط ادمین
  const handleReviewSubmit = async (
    action: "APPROVE" | "REJECT",
    reason?: string,
  ) => {
    if (!reviewLab) return;
    setIsSubmittingReview(true);
    const toastId = toast.loading("در حال ثبت نتیجه بررسی مدارک آزمایشگاه...");

    try {
      await api.put(`/Admin/${reviewLab._id}/reviewCenterDocuments`, {
        action,
        centerType: "laboratorCenter",
        rejectReason: reason,
      });

      toast.success(
        action === "APPROVE"
          ? "مدارک آزمایشگاه تایید و حساب آن فعال شد."
          : "مدارک آزمایشگاه رد شد.",
        { id: toastId },
      );

      // به‌روزرسانی آنی وضعیت آزمایشگاه در جدول
      setLaboratories((prev) =>
        prev.map((lab) =>
          lab._id === reviewLab._id
            ? {
                ...lab,
                isActive: action === "APPROVE",
                documents: {
                  ...lab.documents,
                  status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                  rejectReason: action === "REJECT" ? reason : null,
                },
              }
            : lab,
        ),
      );

      setReviewLab(null);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "خطا در بررسی مدارک آزمایشگاه.",
        { id: toastId },
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getDocBadge = (status?: string) => {
    if (status === "APPROVED") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          <CheckCircle2 size={11} /> تایید شده
        </span>
      );
    }
    if (status === "REJECTED") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
          <XCircle size={11} /> رد شده
        </span>
      );
    }
    if (status === "PENDING") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse">
          <Clock size={11} /> در انتظار بررسی
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
        بدون مدرک
      </span>
    );
  };

  const formatShamsi = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  const activeTestDetails =
    selectedSlot && activeLab
      ? activeLab.availableTests.find((t) => t._id === selectedSlot.testId)
      : null;

  return (
    <div
      className="bg-gray-50 rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 relative font-sans"
      dir="rtl"
    >
      {/* ================= مودال تایید نوبت ================= */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-center justify-between bg-gray-50 border-b border-gray-100 px-6 py-4">
              <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                تأیید نوبت آزمایشگاه
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isReserving}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 flex gap-3 text-xs sm:text-sm">
                <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-blue-900 leading-relaxed font-medium">
                  آیا از رزرو نوبت در{" "}
                  <span className="font-bold">{activeLab?.centerName}</span>{" "}
                  اطمینان دارید؟
                </p>
              </div>

              {/* باکس اطلاعات زمانی */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">تاریخ مراجعه:</span>
                  <span className="font-bold text-gray-800">
                    {formatShamsi(selectedSlot.date)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">ساعت مراجعه:</span>
                  <span
                    className="font-bold text-gadget-dark font-mono"
                    dir="ltr"
                  >
                    {selectedSlot.startTime} تا {selectedSlot.endTime}
                  </span>
                </div>
              </div>

              {/* باکس مشخصات تست */}
              {activeTestDetails && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs sm:text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <TestTube2 size={16} /> نام تست:
                    </span>
                    <span className="font-bold text-gray-800">
                      {activeTestDetails.testName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Banknote size={16} /> هزینه:
                    </span>
                    <span className="font-bold text-emerald-600">
                      {formatPrice(activeTestDetails.price)}
                    </span>
                  </div>

                  {activeTestDetails.preparationInstructions && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <h4 className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 mb-1">
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

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2.5">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isReserving}
                className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={confirmReservation}
                disabled={isReserving}
                className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isReserving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>
                  {isReserving ? "در حال ثبت..." : "تأیید و ثبت نوبت"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= نمایش لیست یا تقویم نوبت‌ها ================= */}
      {!activeLab ? (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          {/* هدر صفحه و جستجو */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <FlaskConical size={26} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-800">
                  لیست آزمایشگاه‌ها
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  {isAdmin
                    ? "مدیریت، بررسی پروانه و نظارت بر آزمایشگاه‌ها"
                    : "مرکز مورد نظر خود را پیدا کنید و نوبت دریافت نمایید"}
                </p>
              </div>
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="جستجوی نام یا آدرس..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pr-4 pl-10 py-2.5 text-xs sm:text-sm focus:border-gadget-light focus:bg-white outline-hidden transition-all shadow-2xs text-gray-700"
              />
              <Search
                className="absolute left-3.5 top-3 text-gray-400"
                size={17}
              />
            </div>
          </div>

          {/* لیست کارت‌های آزمایشگاه */}
          {loadingList ? (
            <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
              <Loader2 className="animate-spin mb-3" size={38} />
              <p className="text-xs sm:text-sm font-bold text-gray-500">
                در حال دریافت اطلاعات آزمایشگاه‌ها...
              </p>
            </div>
          ) : filteredLaboratories.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 p-12 text-center rounded-3xl text-gray-400 max-w-md mx-auto">
              <Beaker
                size={44}
                strokeWidth={1.2}
                className="mx-auto mb-3 text-gray-300"
              />
              <p className="font-bold text-gray-700 text-base">
                آزمایشگاهی یافت نشد.
              </p>
              <p className="text-xs mt-1">
                مرکزی مطابق با عبارت جستجوی شما در سیستم ثبت نشده است.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredLaboratories.map((lab) => (
                <div
                  key={lab._id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                          {lab.centerName}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block bg-teal-50 text-gadget-dark px-2.5 py-0.5 rounded-md text-[10px] font-bold">
                            {lab.specialty || "آزمایشگاه"}
                          </span>
                          {isAdmin && (
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                lab.isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-gray-100 text-gray-500 border border-gray-200"
                              }`}
                            >
                              {lab.isActive ? "فعال" : "غیرفعال"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-12 h-12 rounded-2xl shrink-0 overflow-hidden bg-gadget-dark text-white flex items-center justify-center text-lg font-black shadow-xs">
                        {lab.laboratorImages &&
                        lab.laboratorImages.length > 0 ? (
                          <img
                            src={lab.laboratorImages[0]}
                            alt={lab.centerName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : lab.centerName ? (
                          lab.centerName.charAt(0)
                        ) : (
                          <Beaker size={20} />
                        )}
                      </div>
                    </div>

                    <hr className="border-gray-100 mb-4" />

                    {/* مشخصات و مدارک */}
                    <div className="space-y-2.5 text-xs text-gray-600 mb-6">
                      {isAdmin && (
                        <div className="flex items-center justify-between bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                          <span className="text-gray-500 font-medium">
                            وضعیت مدارک:
                          </span>
                          {getDocBadge(lab.documents?.status)}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <FileBadge size={15} /> کد پروانه:
                        </span>
                        <strong className="text-gray-800 font-mono" dir="ltr">
                          {lab.licenseCode || "---"}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <Phone size={15} /> تلفن تماس:
                        </span>
                        <strong className="text-gray-800 font-mono" dir="ltr">
                          {lab.phones?.[0] || "---"}
                        </strong>
                      </div>

                      <div className="flex items-start gap-1.5 pt-1 border-t border-gray-50">
                        <MapPin
                          size={15}
                          className="text-gray-400 shrink-0 mt-0.5"
                        />
                        <span className="line-clamp-2 leading-relaxed text-gray-600">
                          {lab.address || "آدرس ثبت نشده است"}
                        </span>
                      </div>

                      {/* تست‌های قابل انجام */}
                      {lab.availableTests && lab.availableTests.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-gray-50">
                          <p className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                            <TestTube2
                              size={13}
                              className="text-gadget-light"
                            />
                            تست‌های قابل انجام:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {lab.availableTests.slice(0, 3).map((test) => (
                              <span
                                key={test._id}
                                className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                              >
                                {test.testName}
                              </span>
                            ))}
                            {lab.availableTests.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                +{lab.availableTests.length - 3} مورد دیگر
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* دکمه‌های عملیاتی کارت */}
                  <div className="pt-3 border-t border-gray-100">
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => setReviewLab(lab)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                      >
                        <FileCheck size={15} />
                        <span>بررسی مدارک و پروانه آزمایشگاه</span>
                      </button>
                    ) : isLoggedIn ? (
                      <button
                        onClick={() => handleSelectLab(lab)}
                        className="w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white text-center py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        مشاهده نوبت‌ها و رزرو
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn size={16} /> برای رزرو وارد شوید
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= ویوی انتخاب نوبت آزمایشگاه خاص ================= */
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveLab(null)}
                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors cursor-pointer"
                title="بازگشت به لیست"
              >
                <ChevronRight size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gadget-dark text-white rounded-xl shadow-xs">
                  <FlaskConical size={22} />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-gray-800">
                    {activeLab.centerName}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    رزرو آنلاین نوبت آزمایشگاه
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-200">
            <label className="text-xs sm:text-sm font-bold text-gray-700 mb-2.5 flex items-center gap-1.5">
              <CalendarIcon size={16} className="text-gadget-light" />
              مشاهده نوبت‌ها در تاریخ خاص:
            </label>
            <div className="relative w-full md:w-72">
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={selectedDate ? new Date(selectedDate) : ""}
                onChange={handleDateChange}
                format="YYYY/MM/DD"
                containerClassName="w-full"
                inputClass="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:border-gadget-light cursor-pointer font-bold text-gray-700 outline-hidden"
                placeholder="همه روزها (انتخاب از تقویم)"
              />
            </div>
          </div>

          {loadingSlots ? (
            <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
              <Loader2 className="animate-spin mb-3" size={38} />
              <p className="text-xs sm:text-sm font-bold text-gray-500">
                در حال دریافت نوبت‌های خالی...
              </p>
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 p-12 text-center rounded-3xl text-gray-400">
              <AlertCircle
                size={44}
                strokeWidth={1.2}
                className="mx-auto mb-3 text-gray-300"
              />
              <p className="font-bold text-gray-700 text-base">
                نوبتی یافت نشد.
              </p>
              <p className="text-xs mt-1">
                در تاریخ انتخاب شده، ظرفیتی برای این آزمایشگاه ثبت نشده است.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {slots.map((slot) => {
                const isSlotFull = slot.isFull || slot.remainingCapacity <= 0;
                const slotTestDetails = activeLab.availableTests.find(
                  (t) => t._id === slot.testId,
                );

                return (
                  <div
                    key={slot.slotId}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-2xs flex flex-col justify-between transition-all ${
                      isSlotFull
                        ? "border-gray-200 opacity-70"
                        : "border-gray-200 hover:shadow-md"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-3">
                        <div
                          className="flex items-center gap-1.5 text-gadget-dark font-bold bg-gadget-light/10 px-2.5 py-1 rounded-lg text-xs font-mono"
                          dir="ltr"
                        >
                          <Clock size={14} />
                          {slot.startTime} تا {slot.endTime}
                        </div>

                        {isSlotFull ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            ظرفیت تکمیل
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 size={12} /> ظرفیت دارد
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-xs text-gray-600 mb-5">
                        <div className="flex items-center gap-1.5 font-bold text-gray-800 text-sm">
                          <TestTube2
                            size={15}
                            className="text-gadget-light shrink-0"
                          />
                          <span className="truncate">
                            {slotTestDetails?.testName || "آزمایش عمومی"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">تاریخ مراجعه:</span>
                          <strong className="text-gray-800">
                            {formatShamsi(slot.date)}
                          </strong>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">
                            ظرفیت باقی‌مانده:
                          </span>
                          <strong
                            className={
                              isSlotFull ? "text-rose-500" : "text-gadget-light"
                            }
                          >
                            {slot.remainingCapacity} نفر
                          </strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openBookingModal(slot)}
                      disabled={isSlotFull}
                      className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        isSlotFull
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-xs cursor-pointer"
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

      {/* ================= مودال مشترک بررسی مدارک آزمایشگاه (ادمین) ================= */}
      <CenterReviewModal
        isOpen={!!reviewLab}
        onClose={() => setReviewLab(null)}
        center={reviewLab}
        centerType="LaboratorCenter"
        onSubmitReview={handleReviewSubmit}
        onPreviewImage={(file) => setPreviewImage(file)}
        isSubmitting={isSubmittingReview}
      />

      {/* ================= پیش‌نمایش تصویر مدارک ================= */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 max-w-2xl w-full shadow-2xl space-y-3 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-800">
                پیش‌نمایش مدرک
              </h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-red-500 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <SecureImage
                fileName={previewImage}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
