import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Clinics from "./pages/Clinics";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import { Toaster } from "react-hot-toast"; 

const PlaceholderPage = ({ title }: { title: string }) => (
  <main className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-lg p-10">
    <h1 className="text-4xl font-light text-gray-300 tracking-wider">
      {title} coming soon
    </h1>
  </main>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "text-sm font-bold font-sans",
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />{" "}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/clinics" element={<Clinics />} />
          <Route
            path="/hospitals"
            element={<PlaceholderPage title="Hospitals" />}
          />
          <Route
            path="/airplanes"
            element={<PlaceholderPage title="Airplanes" />}
          />
          <Route path="/travel" element={<PlaceholderPage title="Travel" />} />
          <Route path="/guides" element={<PlaceholderPage title="Guides" />} />
          <Route path="/search" element={<PlaceholderPage title="Search" />} />
          <Route path="/leader" element={<PlaceholderPage title="Leader" />} />
          <Route path="/visa" element={<PlaceholderPage title="Visa" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
