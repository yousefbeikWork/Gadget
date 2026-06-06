import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

// تعریف ساختار اطلاعات پروفایل بر اساس پاسخ API شما
interface UserProfile {
  firstName: string;
  lastName: string;
  role: string;
  Expertise?: string;
  clinicAddress?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  userProfile: UserProfile | null; // اضافه شدن اطلاعات کامل پروفایل
  login: (role: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>; // تابعی برای به‌روزرسانی دستی پروفایل در صورت نیاز
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // تابع درخواست دریافت اطلاعات پروفایل از سرور
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data && response.data.success) {
        setUserProfile(response.data.data);
      }
    } catch (error) {
      console.error("خطا در دریافت پروفایل کاربری:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
      fetchUserProfile(); // اگر توکن بود، مشخصات را از سرور بگیر
    }
  }, []);

  const login = (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    fetchUserProfile(); // بلافاصله بعد از لاگین موفق، پروفایل را لود کن
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, userProfile, login, logout, refreshProfile: fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth باید حتماً درون AuthProvider استفاده شود');
  }
  return context;
};