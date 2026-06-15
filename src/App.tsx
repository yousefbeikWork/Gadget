import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// ایمپورت صفحات عمومی و احراز هویت
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClinicRegister from "./pages/ClinicRegister";
import ClinicRegisterDocs from "./pages/ClinicRegisterDocs";

// ایمپورت صفحات اختصاصی سیستم
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ServicesDashboard from "./pages/ServicesDashboard"; // 👈 صفحه پیشخوان خدمات جدید
import Doctors from "./pages/Doctors";
import Clinics from "./pages/Clinics";
import ClinicDoctors from "./pages/ClinicDoctors";
import ScheduleManagement from "./pages/ScheduleManagement";
import PatientAppointments from "./pages/PatientAppointments";
import Patients from "./pages/Patients";
import HealthRecords from "./pages/HealthRecords";

// نکته: اگر برای خدماتی مثل آزمایشگاه، هواپیما، سفر و... هنوز صفحه‌ای نساخته‌اید،
// می‌توانید موقتاً یک کامپوننت ساده جایگزین آن‌ها کنید تا روت‌ها با خطا مواجه نشوند.
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="bg-white p-8 text-center text-gray-500 font-sans w-full rounded-2xl" dir="rtl">
    صفحه {title} در حال توسعه است...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          {/* ================= مسیرهای عمومی (بدون نیاز به لاگین) ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-clinic" element={<ClinicRegister />} />
          <Route path="/register-clinic-docs" element={<ClinicRegisterDocs />} />

          {/* ================= مسیرهای اصلی داخل داشبورد (نیازمند لاگین) ================= */}
          <Route element={<DashboardLayout />}>
            
            {/* صفحه فرود یا لندینگ پیج اصلی سیستم */}
            <Route path="/" element={<Home />} />

            {/* ۱. دسترسی عمومی برای تمام کاربران لاگین شده (بیمار، پزشک، کلینیک) */}
            <Route element={<ProtectedRoute allowedRoles={["Patient", "Doctor", "MedicalCenter"]} />}>
              <Route path="/dashboard" element={<ServicesDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/clinics" element={<Clinics />} />
              
              {/* خدمات مشترک سفر، فرواز و راهنما */}
              <Route path="/flights" element={<PlaceholderPage title="هواپیما" />} />
              <Route path="/travels" element={<PlaceholderPage title="سفر" />} />
              <Route path="/leaders" element={<PlaceholderPage title="لیدر" />} />
              <Route path="/visas" element={<PlaceholderPage title="ویزا" />} />
              <Route path="/guide" element={<PlaceholderPage title="راهنما" />} />
              <Route path="/search" element={<PlaceholderPage title="جستوجو" />} />
            </Route>

            {/* ۲. دسترسی مشترک فقط برای (بیمار و پزشک) */}
            <Route element={<ProtectedRoute allowedRoles={["Patient", "Doctor"]} />}>
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/hospitals" element={<PlaceholderPage title="بیمارستان" />} />
              <Route path="/laboratories" element={<PlaceholderPage title="آزمایشگاه" />} />
            </Route>

            {/* ۳. دسترسی مشترک فقط برای (پزشک و کلینیک) */}
            <Route element={<ProtectedRoute allowedRoles={["Doctor", "MedicalCenter"]} />}>
              <Route path="/patients" element={<Patients />} />
              <Route path="/health-records" element={<HealthRecords />} />
              <Route path="/schedule" element={<ScheduleManagement />} />
            </Route>

            {/* ۴. دسترسی انحصاری فقط برای (بیمار) */}
            <Route element={<ProtectedRoute allowedRoles={["Patient"]} />}>
              <Route path="/my-appointments" element={<PatientAppointments />} />
            </Route>

            {/* ۵. دسترسی انحصاری فقط برای (کلینیک / مرکز درمانی) */}
            <Route element={<ProtectedRoute allowedRoles={["MedicalCenter"]} />}>
              <Route path="/clinic-doctors" element={<ClinicDoctors />} />
              <Route path="/calibration" element={<PlaceholderPage title="کالیبراسیون" />} />
            </Route>

          </Route>

          {/* هدایت روت‌های ناشناخته به صفحه اصلی */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;