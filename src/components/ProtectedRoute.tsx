import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isLoggedIn, userRole, isLoading } = useAuth();

  // ۱. اولویت با لودینگ است تا تکلیفر توکن مشخص شود
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-gadget-light">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }
  const currentRole = isLoggedIn && userRole ? userRole : "guest";
  // ۲. سد امنیتی اول: اگر کاربر اصلاً لاگین نکرده بود، بفرستش صفحه ورود
  if (!isLoggedIn && (!allowedRoles || !allowedRoles.includes("guest"))) {
    return <Navigate to="/login" replace />;
  }

  // ۳. سد امنیتی دوم: اگر روت برای نقش خاصی (مثل فقط پزشک) بود و نقش کاربر فرق داشت
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to={isLoggedIn ? "/" : "/login"} replace />;
  }

  // ۴. اگر از هر دو سد با موفقیت عبور کرد، صفحه را به او نشان بده
  return <Outlet />;
}
