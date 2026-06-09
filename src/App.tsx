import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute"; // ایمپورت نگهبان
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import Home from "./pages/Home";
import ScheduleManagement from "./pages/ScheduleManagement";
import PatientAppointments from "./pages/PatientAppointments"; // ... بقیه ایمپورت‌ها
import Patients from "./pages/Patients";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          {/* مسیرهای عمومی (بدون نیاز به لاگین) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* مسیرهای اصلی داخل داشبورد */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route element={<ProtectedRoute allowedRoles={["Patient"]} />}>
              <Route
                path="/my-appointments"
                element={<PatientAppointments />}
              />
            </Route>

            {/* قفل کردن صفحه لیست پزشکان: فقط بیماران و مراکز درمانی حق دیدن این صفحه را دارند */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["Patient", "Hospital", "guest"]}
                />
              }
            >
              <Route path="/doctors" element={<Doctors />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["Doctor"]} />}>
              <Route path="/schedule" element={<ScheduleManagement />} />
            </Route>
            {/* در آینده: قفل کردن صفحه لیست بیماران (فقط پزشکان و مراکز درمانی حق دیدن دارند) */}
            <Route element={<ProtectedRoute allowedRoles={['Doctor', 'Hospital']} />}>
              <Route path="/patients" element={<Patients />} />
            </Route> 
           
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
