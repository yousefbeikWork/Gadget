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
// import Profile from "./pages/Profile";
import ServicesDashboard from "./pages/ServicesDashboard";
import Doctors from "./pages/Doctors";
import Clinics from "./pages/Clinics";
import ClinicDoctors from "./pages/ClinicDoctors";
import ScheduleManagement from "./pages/ScheduleManagement/";
import PatientAppointments from "./pages/PatientAppointments";
import Patients from "./pages/Patients/";
import HealthRecords from "./pages/HealthRecords";
import Profile from "./pages/Profile/";
import Laboratories from "./pages/Laboratories";
import Leaders from "./pages/Leaders";

const PlaceholderPage = ({ title }: { title: string }) => (
  <div
    className="bg-white p-8 text-center text-gray-500 font-sans w-full rounded-2xl"
    dir="rtl"
  >
    صفحه {title} در حال توسعه است...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          {/* مسیرهای عمومی */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-clinic" element={<ClinicRegister />} />
          <Route
            path="/register-clinic-docs"
            element={<ClinicRegisterDocs />}
          />

          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />

            {/* روت‌های عمومی (همه) */}
            <Route
              element={<ProtectedRoute allowedRoles={["guest", "Patient"]} />}
            >
              <Route path="/laboratories" element={<Laboratories />} />
              <Route
                path="/flights"
                element={<PlaceholderPage title="هواپیما" />}
              />
              <Route path="/visas" element={<PlaceholderPage title="ویزا" />} />
            </Route>
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["guest", "Patient", "MedicalCenter", "Leader"]}
                />
              }
            >
              {" "}
              <Route
                path="/travels"
                element={<PlaceholderPage title="سفر" />}
              />
            </Route>
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "Patient",
                    "Doctor",
                    "MedicalCenter",
                    "Leader",
                    "laboratorCenter",
                    "guest",
                  ]}
                />
              }
            >
              <Route path="/dashboard" element={<ServicesDashboard />} />
              <Route
                path="/search"
                element={<PlaceholderPage title="جستجو" />}
              />
              <Route
                path="/guide"
                element={<PlaceholderPage title="راهنما" />}
              />
            </Route>

            {/* روت‌های پزشک و لیدر و بیمار و مهمان */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["Patient", "Doctor", "Leader", "guest"]}
                />
              }
            >
              <Route path="/doctors" element={<Doctors />} />
              <Route
                path="/hospitals"
                element={<PlaceholderPage title="بیمارستان" />}
              />
              <Route path="/clinics" element={<Clinics />} />
            </Route>

            {/* روت‌های تخصصی (پزشک، مرکز، آزمایشگاه) */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["Doctor", "MedicalCenter", "laboratorCenter"]}
                />
              }
            >
              <Route path="/patients" element={<Patients />} />
              <Route path="/health-records" element={<HealthRecords />} />
              <Route path="/schedule" element={<ScheduleManagement />} />
            </Route>

            {/* روت‌های مرکز درمانی و آزمایشگاه */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["MedicalCenter", "laboratorCenter"]}
                />
              }
            >
              <Route
                path="/calibration"
                element={<PlaceholderPage title="کالیبراسیون" />}
              />
            </Route>

            {/* روت‌های اختصاصی */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["MedicalCenter", "guest", "Patient"]}
                />
              }
            >
              <Route
                path="/leaders"
                element={<Leaders />}
              />
              <Route path="/clinic-doctors" element={<ClinicDoctors />} />
            </Route>

            <Route
              element={<ProtectedRoute allowedRoles={["laboratorCenter"]} />}
            >
              <Route
                path="/Collaborating-lab"
                element={<PlaceholderPage title="آزمایشگاه‌های همکار" />}
              />
            </Route>

            {/* پروفایل */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "Patient",
                    "Doctor",
                    "MedicalCenter",
                    "Leader",
                    "laboratorCenter",
                  ]}
                />
              }
            >
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* نوبت‌ها */}
            <Route
              element={<ProtectedRoute allowedRoles={["Patient", "Doctor"]} />}
            >
              <Route
                path="/my-appointments"
                element={<PatientAppointments />}
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
