import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute"; // ایمپورت نگهبان
import Login from "./pages/Login";
import Register from "./pages/Register";
import Clinics from "./pages/Clinics";
import ClinicRegister from "./pages/ClinicRegister";
import ClinicRegisterDocs from "./pages/ClinicRegisterDocs";
import ClinicDoctors from "./pages/ClinicDoctors";
import Doctors from "./pages/Doctors";
import Home from "./pages/Home";
import ScheduleManagement from "./pages/ScheduleManagement";
import PatientAppointments from "./pages/PatientAppointments"; // ... بقیه ایمپورت‌ها
import Patients from "./pages/Patients";
import Profile from "./pages/Profile";
import HealthRecords from "./pages/HealthRecords";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          {/* مسیرهای عمومی (بدون نیاز به لاگین) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-clinic" element={<ClinicRegister />} />
          <Route
            path="/register-clinic-docs"
            element={<ClinicRegisterDocs />}
          />
          {/* مسیرهای اصلی داخل داشبورد */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
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
                  allowedRoles={["Patient", "MedicalCenter", "guest"]}
                />
              }
            >
              <Route path="/doctors" element={<Doctors />} />
            </Route>
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["Patient", "MedicalCenter", "guest"]}
                />
              }
            >
              <Route path="/clinics" element={<Clinics />} />
            </Route>
            <Route
              element={<ProtectedRoute allowedRoles={["MedicalCenter"]} />}
            >
              <Route path="/clinic-doctors" element={<ClinicDoctors />} />
            </Route>
            <Route
              element={
                <ProtectedRoute allowedRoles={["Doctor", "MedicalCenter"]} />
              }
            >
              <Route path="/health-records" element={<HealthRecords />} />
              <Route path="/schedule" element={<ScheduleManagement />} />
            </Route>
            {/* در آینده: قفل کردن صفحه لیست بیماران (فقط پزشکان و مراکز درمانی حق دیدن دارند) */}
            <Route
              element={<ProtectedRoute allowedRoles={["Doctor", "Hospital"]} />}
            >
              <Route path="/patients" element={<Patients />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
