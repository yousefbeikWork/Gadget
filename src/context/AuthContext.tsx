import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import api from "../services/api";
import toast from "react-hot-toast";

interface Guardian {
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile: string;
  address: string;
}

interface Manager {
  firstName: string;
  lastName: string;
  role?: string;
  mobile?: string;
  nationalId?: string;
  email?: string;
}

interface TestItem {
  _id?: string;
  testName: string;
  testCode: string;
  department: string;
  price: number;
  isAvailable: boolean;
  preparationInstructions?: string;
}

interface LeaderPricing {
  fullDay?: number;
  dayShift?: number;
  nightShift?: number;
  hourlyDay?: number;
  hourlyNight?: number;
}

interface LeaderCar {
  brand?: string;
  model?: string;
  color?: string;
  plateNumber?: string;
  manufactureYear?: number;
  documents?: {
    vehicleCardFront?: string | null;
    vehicleCardBack?: string | null;
    insurancePhoto?: string | null;
    drivingLicenseFront?: string | null;
    drivingLicenseBack?: string | null;
  };
}

interface HourlySlot {
  time: string;
  isBooked: boolean;
  _id?: string;
}

interface ShiftDetails {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  hours: HourlySlot[];
}

interface AvailableDay {
  _id?: string;
  date: string;
  isFullDayBooked: boolean;
  dayShift?: ShiftDetails | null;
  nightShift?: ShiftDetails | null;
}

export interface NationalIdVerification {
  frontImage?: string | null;
  backImage?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NOT_UPLOADED" | string;
  rejectReason?: string | null;
}

export interface MedicalDocuments {
  medicalCouncilCard?: string | null;
  medicalLicense?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NOT_UPLOADED" | string;
  rejectReason?: string | null;
}

export interface CenterDocuments {
  establishmentLicenseFile?: string | null;
  exploitationLicenseFile?: string | null;
  managerIdFiles?: string[];
  introductionLetterFile?: string | null;
  liabilityInsuranceFile?: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "NOT_UPLOADED" | string;
  rejectReason?: string | null;
}

interface UserProfile {
  _id?: string;
  firstName: string;
  lastName: string;
  role: string;
  mobile?: string;
  age?: number;
  nationalId?: string;
  imageProfile?: string;
  isActive?: boolean;

  // فیلدهای مخصوص پزشک
  Expertise?: string;
  clinicAddress?: string;
  orgAddress?: string;
  clinicPhone?: string;
  medicalCouncilCode?: string;
  medicalDocuments?: MedicalDocuments;

  // فیلدهای مخصوص بیمار
  fatherName?: string;
  gender?: "MALE" | "FEMALE" | string;
  maritalStatus?: "SINGLE" | "MARRIED" | string;
  guardian?: Guardian;
  hasPaidRfid?: boolean;
  nationalIdVerification?: NationalIdVerification;

  // فیلدهای مشترک مراکز (کلینیک، بیمارستان، آزمایشگاه)
  centerName?: string;
  centerType?: string;
  licenseCode?: string;
  ownershipType?: string;
  address?: string;
  postalCode?: string;
  phones?: string[];
  activeStaffCount?: number;
  specialty?: string;
  manager?: Manager;
  documents?: CenterDocuments;

  // فیلدهای اختصاصی بیمارستان
  hospitalName?: string;
  hospitalType?: string;
  establishmentDate?: string;
  emergencyMobile?: string;
  hospitalImages?: string[];
  clinics?: any[];

  // فیلدهای اختصاصی آزمایشگاه
  otherSpecialties?: string[];
  activeDepartments?: string[];
  specialFacilities?: string[];
  availableTests?: TestItem[];
  laboratorImages?: string[];

  // فیلدهای اختصاصی لیدر
  Address?: string;
  city?: string;
  hasCar?: boolean;
  pricing?: LeaderPricing;
  car?: LeaderCar;
  nationalIdPhotos?: {
    front?: string | null;
    back?: string | null;
  };
  availableDays?: AvailableDay[];
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: (role: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showRfidPaymentToast = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-1 text-right font-sans" dir="rtl">
          <div className="font-bold text-xs text-amber-900 flex items-center gap-1">
            ⚠️ <span>کارت هوشمند سلامت (RFID)</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            هزینه صدور کارت هوشمند سلامت پرداخت نشده است. جهت فعال‌سازی کارت
            اقدام فرمایید.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const toastLoading = toast.loading(
                  "در حال اتصال به درگاه پرداخت...",
                );
                try {
                  const res = await api.post("/peyment/rfid/pay", {});
                  if (res.data?.success && res.data?.data?.paymentUrl) {
                    window.location.href = res.data.data.paymentUrl;
                  } else {
                    toast.error(
                      res.data?.message || "خطا در دریافت لینک پرداخت",
                      { id: toastLoading },
                    );
                  }
                } catch (err: any) {
                  toast.error(
                    err.response?.data?.message ||
                      "خطا در اتصال به درگاه پرداخت",
                    { id: toastLoading },
                  );
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              پرداخت آنلاین
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-medium py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
            >
              بعداً
            </button>
          </div>
        </div>
      ),
      {
        id: "rfid-unpaid-alert",
        duration: 9000,
        style: {
          borderRadius: "16px",
          border: "1px solid #fef3c7",
          background: "#fffbeb",
          padding: "12px 14px",
          maxWidth: "380px",
        },
      },
    );
  };

  const showDocumentRejectedToast = (title: string, reason?: string | null) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-1 text-right font-sans" dir="rtl">
          <div className="font-bold text-xs text-rose-900 flex items-center gap-1">
            ❌ <span>{title}</span>
          </div>
          <p className="text-[11px] text-gray-700 leading-relaxed">
            {reason
              ? `دلیل رد مدرک: ${reason}`
              : "مدارک ارسالی ناخوانا بوده یا با مشخصات ثبت‌نامی همخوانی ندارد."}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = "/dashboard";
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
            >
              بررسی و بارگذاری مجدد
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-medium py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      ),
      {
        id: "doc-rejected-alert",
        duration: 10000,
        style: {
          borderRadius: "16px",
          border: "1px solid #fecdd3",
          background: "#fff1f2",
          padding: "12px 14px",
          maxWidth: "380px",
        },
      },
    );
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/users/profile");
      if (response.data && response.data.success) {
        const profile: UserProfile = response.data.data;
        setUserProfile(profile);

        // ۱. بررسی وضعیت بیمار
        if (profile.role === "Patient") {
          if (profile.hasPaidRfid === false) {
            showRfidPaymentToast();
          }
          if (profile.nationalIdVerification?.status === "REJECTED") {
            showDocumentRejectedToast(
              "مدارک هویتی شما تایید نشد",
              profile.nationalIdVerification.rejectReason,
            );
          }
        }

        // ۲. بررسی وضعیت پزشک
        if (profile.role === "Doctor") {
          if (
            profile.nationalIdVerification?.status === "REJECTED" ||
            profile.medicalDocuments?.status === "REJECTED"
          ) {
            const reason =
              profile.medicalDocuments?.rejectReason ||
              profile.nationalIdVerification?.rejectReason;
            showDocumentRejectedToast(
              "مدارک نظام پزشکی یا هویتی شما تایید نشد",
              reason,
            );
          }
        }

        // ۳. بررسی وضعیت لیدر
        if (profile.role === "Leader") {
          if (profile.nationalIdVerification?.status === "REJECTED") {
            showDocumentRejectedToast(
              "مدارک هویتی یا خودروی شما تایید نشد",
              profile.nationalIdVerification.rejectReason,
            );
          }
        }

        // ۴. بررسی وضعیت کلینیک و مرکز درمانی
        if (profile.role === "MedicalCenter") {
          if (
            profile.documents?.status === "REJECTED" ||
            profile.nationalIdVerification?.status === "REJECTED"
          ) {
            const reason =
              profile.documents?.rejectReason ||
              profile.nationalIdVerification?.rejectReason;
            showDocumentRejectedToast(
              "مدارک یا پروانه مرکز درمانی تایید نشد",
              reason,
            );
          }
        }

        // ۵. بررسی وضعیت بیمارستان
        if (profile.role === "Hospital") {
          if (
            profile.documents?.status === "REJECTED" ||
            profile.nationalIdVerification?.status === "REJECTED"
          ) {
            const reason =
              profile.documents?.rejectReason ||
              profile.nationalIdVerification?.rejectReason;
            showDocumentRejectedToast(
              "مدارک یا پروانه بیمارستان تایید نشد",
              reason,
            );
          }
        }

        // ۶. بررسی وضعیت آزمایشگاه
        if (profile.role === "laboratorCenter") {
          if (
            profile.documents?.status === "REJECTED" ||
            profile.nationalIdVerification?.status === "REJECTED"
          ) {
            const reason =
              profile.documents?.rejectReason ||
              profile.nationalIdVerification?.rejectReason;
            showDocumentRejectedToast(
              "مدارک یا پروانه آزمایشگاه تایید نشد",
              reason,
            );
          }
        }
      }
    } catch (error) {
      console.error("خطا در دریافت پروفایل کاربری:", error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const role = localStorage.getItem("userRole");

      if (token) {
        setIsLoggedIn(true);
        setUserRole(role);
        await fetchUserProfile();
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    fetchUserProfile();
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userRole,
        userProfile,
        isLoading,
        login,
        logout,
        refreshProfile: fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth باید حتماً درون AuthProvider استفاده شود");
  }
  return context;
};
