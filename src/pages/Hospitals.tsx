import { useState, useEffect } from "react";
import {
  Search,
  Phone,
  MapPin,
  Loader2,
  Building2,
  Hospital as HospitalIcon,
  Ambulance,
  Activity,
  CalendarDays,
  User,
  ChevronRight,
  Calendar,
  AlignRight,
  X,
  LogIn,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { default as DatePickerLib } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerLib as any).default || DatePickerLib;

// 👈 آپدیت اینترفیس بر اساس دیتای بک‌اند
interface ClinicDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  Expertise?: string; // تخصص
  medicalCouncilCode?: string;
}

interface Clinic {
  id: string;
  name: string;
  specialty: string;
}

interface HospitalItem {
  _id: string;
  hospitalName: string;
  hospitalType: string;
  mobile: string;
  isActive: boolean;
  address: string;
  phones: string[];
  emergencyMobile: string;
  clinics: string[];
}

interface Slot {
  startTime: string;
  endTime: string;
}

type BookingStep = "select-clinic" | "select-doctor" | "select-slot";

export default function Hospitals() {
  const navigate = useNavigate();
  const { userRole, isLoggedIn } = useAuth();

  // === استیت‌های مربوط به لیست بیمارستان‌ها ===
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === استیت‌های مودال رزرو ۳ مرحله‌ای ===
  const [bookingHospital, setBookingHospital] = useState<HospitalItem | null>(
    null,
  );
  const [bookingStep, setBookingStep] = useState<BookingStep>("select-clinic");

  const [hospitalClinics, setHospitalClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  // 👈 استیت‌های جدید برای لیست پزشکان داینامیک
  const [clinicDoctors, setClinicDoctors] = useState<ClinicDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<ClinicDoctor | null>(
    null,
  );

  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingNotes, setBookingNotes] = useState("");

  // ================= دریافت لیست بیمارستان‌ها =================
  const fetchHospitals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/Hospital/listHospitall");
      if (response.data?.success && response.data?.data) {
        setHospitals(response.data.data);
      } else {
        throw new Error("داده‌ای یافت نشد");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "خطا در دریافت لیست بیمارستان‌ها.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.hospitalName?.includes(searchTerm) ||
      hospital.address?.includes(searchTerm),
  );

  const getHospitalType = (type: string) => {
    switch (type) {
      case "PRIVATE":
        return "خصوصی";
      case "PUBLIC":
        return "دولتی";
      case "CHARITY":
        return "خیریه";
      default:
        return "نامشخص";
    }
  };

  // ================= توابع مربوط به مودال رزرو =================

  const openBookingProcess = async (hospital: HospitalItem) => {
    if (!isLoggedIn) {
      toast.error("برای رزرو نوبت ابتدا باید وارد حساب کاربری خود شوید.");
      navigate("/login");
      return;
    }
    if (userRole && userRole !== "Patient") {
      toast.error("فقط کاربران با نقش «بیمار» قادر به رزرو نوبت هستند.");
      return;
    }

    setBookingHospital(hospital);
    setBookingStep("select-clinic");
    setHospitalClinics([]);
    setSelectedClinic(null);
    setClinicDoctors([]);
    setSelectedDoctor(null);
    setSelectedDate("");
    setAvailableSlots([]);
    setSelectedSlot(null);
    setBookingNotes("");

    // دریافت لیست کلینیک‌های بیمارستان
    setLoadingClinics(true);
    try {
      const response = await api.get("/Hospital/clinics", {
        params: { hospitalId: hospital._id },
      });
      if (response.data?.success && response.data?.data) {
        const mappedClinics: Clinic[] = response.data.data.map((item: any) => ({
          id: item._id || item.id,
          name: item.centerName || item.name,
          specialty: item.specialty || "ثبت نشده",
        }));
        setHospitalClinics(mappedClinics);
      }
    } catch (err) {
      toast.error("خطا در دریافت لیست کلینیک‌های این بیمارستان.");
    } finally {
      setLoadingClinics(false);
    }
  };

  const handleBackStep = () => {
    if (bookingStep === "select-slot") setBookingStep("select-doctor");
    else if (bookingStep === "select-doctor") setBookingStep("select-clinic");
  };

  const closeBookingProcess = () => {
    setBookingHospital(null);
  };

  // 👈 مرحله جدید: دریافت پزشکان هنگام انتخاب کلینیک
  const handleSelectClinic = async (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setBookingStep("select-doctor");
    setClinicDoctors([]);
    setLoadingDoctors(true);

    try {
      // ارسال آیدی کلینیک در بدنه (body)
      const response = await api.post("/doctor/listDctorsClinic", {
        clinicId: clinic.id,
      });

      if (response.data?.success && response.data?.doctors) {
        setClinicDoctors(response.data.doctors);
      }
    } catch (err) {
      toast.error("خطا در دریافت لیست پزشکان این کلینیک.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSelectDoctor = (doc: ClinicDoctor) => {
    setSelectedDoctor(doc);
    setBookingStep("select-slot");
  };

  // دریافت نوبت‌های خالی برای تاریخ انتخاب شده
  const fetchSlotsForDate = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setAvailableSlots([]);

    if (!date || !selectedDoctor || !selectedClinic) return;

    try {
      setLoadingSlots(true);
      // استفاده از _id پزشک و id کلینیک
      const response = await api.get(
        `/book/available-slots?doctorId=${selectedDoctor._id}&date=${date}&clinicId=${selectedClinic.id}`,
      );
      if (response.data && response.data.success) {
        setAvailableSlots(response.data.data);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setAvailableSlots([]);
      } else {
        toast.error("خطا در دریافت نوبت‌های خالی.");
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot || !selectedDate || !selectedDoctor || !selectedClinic)
      return;

    const payload = {
      doctorId: selectedDoctor._id, // استفاده از _id
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes: bookingNotes,
      medicalCenterId: selectedClinic.id,
    };

    const bookingPromise = api.post("/book/bookslots", payload);

    toast.promise(bookingPromise, {
      loading: "در حال ثبت نوبت شما...",
      success: () => {
        closeBookingProcess();
        return `نوبت شما در کلینیک ${selectedClinic.name} با موفقیت رزرو شد!`;
      },
      error: (err) =>
        err.response?.data?.message ||
        "خطا در رزرو نوبت. لطفاً دوباره تلاش کنید.",
    });
  };

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ================= هدر و جستجو ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="text-gadget-dark bg-blue-50 p-3 rounded-2xl">
              <HospitalIcon
                size={32}
                strokeWidth={1.5}
                className="text-blue-700"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                بیمارستان‌های تحت پوشش
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {userRole === "Patient"
                  ? "بیمارستان مورد نظر خود را برای دریافت نوبت انتخاب کنید"
                  : "لیست بیمارستان‌ها و مراکز درمانی کلان ثبت شده"}
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-87.5">
            <input
              type="text"
              placeholder="جستجوی نام بیمارستان یا آدرس..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full pr-4 pl-10 py-3 text-sm focus:outline-hidden focus:border-gadget-light focus:ring-1 focus:ring-gadget-light transition-all shadow-sm text-gray-700"
            />
            <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* ================= وضعیت لودینگ و لیست ================= */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">
              در حال دریافت اطلاعات بیمارستان‌ها...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center text-sm font-bold border border-red-100 max-w-md mx-auto">
            {error}
            <button
              onClick={fetchHospitals}
              className="block mt-4 mx-auto bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              تلاش مجدد
            </button>
          </div>
        ) : filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital._id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-full h-1 bg-linear-to-r from-blue-200 to-blue-100 group-hover:from-blue-500 group-hover:to-blue-700 transition-all"></div>

                <div>
                  <div className="flex justify-between items-start mb-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                      <h3
                        className="font-bold text-gray-900 text-lg line-clamp-1"
                        title={hospital.hospitalName}
                      >
                        {hospital.hospitalName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${hospital.isActive ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}
                        >
                          {hospital.isActive ? "فعال" : "غیرفعال"}
                        </span>
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          {getHospitalType(hospital.hospitalType)}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl shrink-0 bg-gadget-dark text-white flex items-center justify-center text-xl font-bold shadow-sm">
                      {hospital.hospitalName ? (
                        hospital.hospitalName
                          .replace("بیمارستان", "")
                          .trim()
                          .charAt(0)
                      ) : (
                        <Building2 size={20} />
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-100 mb-4" />

                  <div
                    dir="ltr"
                    className="space-y-3 mb-6 bg-gray-50/50 p-3 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span
                        className="font-bold text-gray-800 text-left"
                        dir="ltr"
                      >
                        {hospital.phones && hospital.phones.length > 0
                          ? hospital.phones[0]
                          : hospital.mobile}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-xs font-medium">پذیرش:</span>
                        <Phone size={14} strokeWidth={2} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-red-600 border-t border-gray-100 pt-3">
                      <span
                        className="font-bold text-red-700 text-left"
                        dir="ltr"
                      >
                        {hospital.emergencyMobile || "---"}
                      </span>
                      <div className="flex items-center gap-2 text-red-500">
                        <span className="text-xs font-medium">اورژانس:</span>
                        <Ambulance size={14} strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                    <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
                      <Activity size={16} /> کلینیک‌های وابسته
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-lg">
                      {hospital.clinics ? hospital.clinics.length : 0} مرکز
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <MapPin
                      size={16}
                      className="shrink-0 mt-0.5 text-gray-400"
                    />
                    <span
                      className="leading-relaxed line-clamp-2 text-xs"
                      title={hospital.address}
                    >
                      {hospital.address || "آدرس ثبت نشده است"}
                    </span>
                  </div>

                  {userRole !== "Admin" && userRole !== "SUPER_ADMIN" && (
                    <div className="pt-2 border-t border-gray-50">
                      {isLoggedIn ? (
                        <button
                          onClick={() => openBookingProcess(hospital)}
                          className="w-full bg-gadget-dark hover:bg-gadget-dark/90 text-white text-center py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CalendarDays size={16} /> مشاهده کلینیک‌ها و رزرو
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate("/login")}
                          className="w-full bg-gray-50 border border-gray-200 hover:border-gadget-light text-gray-600 hover:text-gadget-light text-center py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <LogIn size={16} /> برای رزرو وارد شوید
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 p-12 text-center rounded-2xl text-gray-500">
            <HospitalIcon
              size={48}
              strokeWidth={1}
              className="mx-auto mb-3 text-gray-300"
            />
            <p className="font-bold text-lg text-gray-700">
              بیمارستانی یافت نشد.
            </p>
            <p className="text-sm mt-1">
              هیچ مرکز بیمارستانی با این مشخصات در سیستم ثبت نشده است.
            </p>
          </div>
        )}
      </div>

      {/* ================= مودال رزرو ۳ مرحله‌ای ================= */}
      {bookingHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-700/50 backdrop-blur-sm transition-opacity"
            onClick={closeBookingProcess}
          ></div>

          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* هدر مودال */}
            <div className="flex items-center justify-between bg-gray-50 border-b border-gray-100 px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                {bookingStep !== "select-clinic" && (
                  <button
                    onClick={handleBackStep}
                    className="p-1.5 hover:bg-gray-200/70 rounded-xl transition-colors cursor-pointer text-gray-600"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
                <div>
                  <h3
                    className="font-bold text-gray-800 text-base line-clamp-1 max-w-50"
                    title={bookingHospital.hospitalName}
                  >
                    {bookingHospital.hospitalName}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                    {bookingStep === "select-clinic" &&
                      "مرحله ۱: انتخاب کلینیک"}
                    {bookingStep === "select-doctor" &&
                      `مرحله ۲: انتخاب پزشک (${selectedClinic?.name})`}
                    {bookingStep === "select-slot" &&
                      `مرحله ۳: تقویم نوبت‌دهی دکتر ${selectedDoctor?.lastName}`}
                  </p>
                </div>
              </div>
              <button
                onClick={closeBookingProcess}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* بدنه مودال */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-100">
              {/* مرحله اول: لیست کلینیک‌ها */}
              {bookingStep === "select-clinic" && (
                <div className="space-y-4 animate-in fade-in">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    لیست دپارتمان‌ها و کلینیک‌های فعال:
                  </label>

                  {loadingClinics ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gadget-light">
                      <Loader2 className="animate-spin mb-2" size={26} />
                      <p className="text-xs font-medium">
                        در حال دریافت کلینیک‌ها...
                      </p>
                    </div>
                  ) : hospitalClinics.length > 0 ? (
                    <div className="space-y-2.5">
                      {hospitalClinics.map((clinic) => (
                        <div
                          key={clinic.id}
                          onClick={() => handleSelectClinic(clinic)}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-gadget-light hover:bg-gadget-light/5 cursor-pointer transition-all group shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 group-hover:bg-white group-hover:text-gadget-light rounded-xl border border-gray-100 flex items-center justify-center transition-colors shadow-2xs">
                              <Building2 size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                                {clinic.name}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {clinic.specialty}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-gray-400 rotate-180 group-hover:text-gadget-light transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                      <p className="text-sm font-medium">
                        هیچ کلینیکی برای این بیمارستان ثبت نشده است.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* مرحله دوم: انتخاب پزشک */}
              {bookingStep === "select-doctor" && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <label className="block text-sm font-bold text-gray-700">
                    پزشکان فعال {selectedClinic?.name}:
                  </label>

                  {loadingDoctors ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gadget-light">
                      <Loader2 className="animate-spin mb-2" size={26} />
                      <p className="text-xs font-medium">
                        در حال دریافت لیست پزشکان...
                      </p>
                    </div>
                  ) : clinicDoctors.length > 0 ? (
                    <div className="space-y-2.5">
                      {clinicDoctors.map((doc) => (
                        <div
                          key={doc._id}
                          onClick={() => handleSelectDoctor(doc)}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-gadget-light hover:bg-gadget-light/5 cursor-pointer transition-all group shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 group-hover:bg-white text-gray-400 group-hover:text-gadget-light rounded-xl border border-gray-100 flex items-center justify-center transition-colors shadow-2xs">
                              <User size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                                دکتر {doc.firstName} {doc.lastName}
                              </p>
                              <p className="text-[10px] text-gadget-light font-medium mt-0.5">
                                {doc.Expertise || "تخصص ثبت نشده"}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-gray-400 rotate-180 group-hover:text-gadget-light transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                      <p className="text-sm font-medium">
                        پزشکی در این کلینیک ثبت نشده است.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* مرحله سوم: انتخاب ساعت */}
              {bookingStep === "select-slot" && (
                <div className="space-y-5 animate-in slide-in-from-right-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      تاریخ حضور در کلینیک:
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute right-3 top-3 text-gadget-light z-10"
                        size={18}
                      />
                      <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={selectedDate ? new Date(selectedDate) : ""}
                        fixMainPosition={true}
                        onChange={(date: any) => {
                          if (date && date.isValid) {
                            const jsDate = date.toDate();
                            const year = jsDate.getFullYear();
                            const month = String(
                              jsDate.getMonth() + 1,
                            ).padStart(2, "0");
                            const day = String(jsDate.getDate()).padStart(
                              2,
                              "0",
                            );
                            fetchSlotsForDate(`${year}-${month}-${day}`);
                          } else {
                            fetchSlotsForDate("");
                          }
                        }}
                        format="YYYY/MM/DD"
                        containerClassName="w-full"
                        inputClass="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-hidden focus:border-gadget-light focus:bg-white transition-colors cursor-pointer text-gray-700"
                        placeholder="انتخاب روز از تقویم..."
                      />
                    </div>
                  </div>

                  {loadingSlots ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gadget-light">
                      <Loader2 className="animate-spin mb-2" size={26} />
                      <p className="text-xs font-medium">بررسی تقویم پزشک...</p>
                    </div>
                  ) : selectedDate ? (
                    availableSlots.length > 0 ? (
                      <div className="space-y-5 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            ساعت‌های ویزیت خالی:
                          </label>
                          <div className="grid grid-cols-2 gap-2.5">
                            {availableSlots.map((slot, index) => {
                              const isSelected =
                                selectedSlot?.startTime === slot.startTime;
                              return (
                                <button
                                  key={index}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                                    isSelected
                                      ? "bg-gadget-dark text-white border-gadget-dark transform scale-[1.02]"
                                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                                  }`}
                                >
                                  <span dir="ltr">{slot.startTime}</span>
                                  <span className="text-[10px] font-normal mx-1 opacity-60">
                                    تا
                                  </span>
                                  <span dir="ltr">{slot.endTime}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {selectedSlot && (
                          <div className="animate-in fade-in duration-200">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              علت نوبت یا یادداشت (اختیاری):
                            </label>
                            <div className="relative">
                              <AlignRight
                                className="absolute right-3 top-3 text-gray-400"
                                size={16}
                              />
                              <textarea
                                value={bookingNotes}
                                onChange={(e) =>
                                  setBookingNotes(e.target.value)
                                }
                                placeholder="توضیحات کوتاه برای پزشک..."
                                rows={2}
                                className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-xs focus:outline-hidden focus:border-gadget-light transition-colors resize-none shadow-2xs text-gray-700"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-orange-50/60 rounded-2xl border border-orange-100">
                        <p className="text-xs font-bold text-orange-700">
                          هیچ نوبت خالی در این تاریخ وجود ندارد.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-400 border border-dashed border-gray-100 rounded-2xl">
                      <p className="text-xs">
                        لطفاً برای بارگذاری زمان‌ها یک تاریخ را انتخاب کنید.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* فوتر مودال */}
            {bookingStep === "select-slot" && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0 animate-in slide-in-from-bottom-2">
                <button
                  disabled={!selectedSlot}
                  onClick={handleConfirmBooking}
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedSlot
                      ? "bg-gadget-dark hover:bg-gadget-dark/90 text-white shadow-md cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {selectedSlot
                    ? `تایید و ثبت نهایی رزرو ساعت ${selectedSlot.startTime}`
                    : "انتخاب ساعت ویزیت الزامی است"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
