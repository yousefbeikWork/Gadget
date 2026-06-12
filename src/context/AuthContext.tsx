import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import api from "../services/api";

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
  role: string;
  mobile?: string;
  nationalId?: string;
}
interface UserProfile {
  _id?: string;
  firstName: string;
  lastName: string;
  role: string;
  mobile?: string;
  age?: number;
  nationalId?: string;
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
  // قیم بیمار
  guardian?: Guardian;
  // فیلدهای مخصوص کلینیک (MedicalCenter)
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
}

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  userProfile: UserProfile | null;
  isLoading: boolean; // 👈 ۱. اضافه شدن به تایپ کانتکست
  login: (role: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // استیت لودینگ اولیه

  // تابع درخواست دریافت اطلاعات پروفایل از سرور
  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/users/profile");
      if (response.data && response.data.success) {
        setUserProfile(response.data.data);
      }
    } catch (error) {
      console.error("خطا در دریافت پروفایل کاربری:", error);
    }
  };

  // ۲. اصلاح افکت لود اولیه برای مدیریت درست لودینگ و رفرش‌توکن
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const role = localStorage.getItem("userRole");

      if (token) {
        setIsLoggedIn(true);
        setUserRole(role);
        // await می‌کنیم تا اگر توکن منقضی بود، ابتدا رفرش‌توکن کارش را تمام کند
        await fetchUserProfile();
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }

      // پس از پایان تمام بررسی‌ها (چه موفق، چه ناموفق)، لودینگ تمام می‌شود
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
        isLoading, // 👈 ۳. ارسال استیت به پرووایدر
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
