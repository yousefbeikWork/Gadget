import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react"; // برای نمایش یک اسپینر موقت

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // 👈 isLoading را از کانتکست می‌گیریم
  const { isLoggedIn, userRole, isLoading } = useAuth();

  // 👈 تغییر کلیدی: اگر هنوز در حال بررسی وضعیت توکن هستیم، کاربر را پرت نکن بیرون!
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-gadget-light">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  const currentRole = isLoggedIn && userRole ? userRole : "guest";

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to={isLoggedIn ? "/" : "/login"} replace />;
  }

  return <Outlet />;
}
