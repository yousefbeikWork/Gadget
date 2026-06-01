import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Clinics from "./pages/Clinics";
import Home from "./pages/Home";

const PlaceholderPage = ({ title }: { title: string }) => (
  // تبدیل اسکلت صفحات خالی به کارت سفید و گرد
  <main className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-lg p-10">
    <h1 className="text-4xl font-light text-gray-300 tracking-wider">
      {title} Page Skeleton
    </h1>
  </main>
);

function App() {
  return (
    <BrowserRouter>
      {/* اضافه کردن bg-gadget-dark و فاصله‌ها برای حالت شناور */}
      <div
        className="flex h-screen w-full font-sans text-gray-800 bg-gadget-dark p-4 gap-6"
      >
        <Sidebar />

        <Routes>
          <Route path="/" element={<Home />} />{" "}
          <Route
            path="/doctors"
            element={<PlaceholderPage title="Doctors" />}
          />
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
