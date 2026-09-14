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

interface UserProfile {
  _id?: string;
  firstName: string;
  lastName: string;
  role: string;
  mobile?: string;
  age?: number;
  nationalId?: string;
  imageProfile?: string;

  // فیلدهای مخصوص پزشک
  Expertise?: string;
  clinicAddress?: string;
  orgAddress?: string;
  clinicPhone?: string;
  medicalCouncilCode?: string;

  // فیلدهای مخصوص بیمار
  fatherName?: string;
  gender?: "MALE" | "FEMALE" | string;
  maritalStatus?: "SINGLE" | "MARRIED" | string;
  guardian?: Guardian;
  hasPaidRfid?: boolean; // 👈 وضعیت پرداخت کارت RFID

  // فیلدهای مشترک کلینیک و آزمایشگاه
  centerName?: string;
  centerType?: string;
  licenseCode?: string;
  ownershipType?: string;
  address?: string;
  postalCode?: string;
  phones?: string[];
  activeStaffCount?: number;
  specialty?: string;
  isActive?: boolean;
  manager?: Manager;

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

  // فیلدهای اختصاصی نقش لیدر
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

  // نمایش توست هشدار عدم پرداخت به همراه دکمه پرداخت آنلاین
  const showRfidPaymentToast = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-1 text-right font-sans" dir="rtl">
          <div className="font-bold text-xs text-amber-900 flex items-center gap-1">
            ⚠️ <span>کارت هوشمند سلامت (RFID)</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            هزینه صدور کارت هوشمند سلامت پرداخت نشده است. جهت صدور کارت و ثبت پرونده اقدام فرمایید.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const toastLoading = toast.loading("در حال اتصال به درگاه پرداخت...");
                try {
                  const res = await api.post("/peyment/rfid/pay", {});
                  if (res.data?.success && res.data?.data?.paymentUrl) {
                    window.location.href = res.data.data.paymentUrl;
                  } else {
                    toast.error(res.data?.message || "خطا در دریافت لینک پرداخت", { id: toastLoading });
                  }
                } catch (err: any) {
                  toast.error(err.response?.data?.message || "خطا در اتصال به درگاه پرداخت", { id: toastLoading });
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
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          maxWidth: "380px",
        },
      }
    );
  };

  // تابع واکشی اطلاعات پروفایل از سرور
  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/users/profile");
      if (response.data && response.data.success) {
        const profile: UserProfile = response.data.data;
        setUserProfile(profile);

        // بررسی وضعیت پرداخت کارت هوشمند بیمار
        if (profile.role === "Patient" && profile.hasPaidRfid === false) {
          showRfidPaymentToast();
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