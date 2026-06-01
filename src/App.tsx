import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Clinics from './pages/Clinics'; // ایمپورت صفحه جدید

const PlaceholderPage = ({ title }: { title: string }) => (
  <main className="flex-1 flex items-center justify-center bg-[#fbfdfd] p-10">
    <h1 className="text-4xl font-light text-gray-300 tracking-wider">
      {title} Page Skeleton
    </h1>
  </main>
);

function App() {
  return (
    <BrowserRouter>
      <div dir='rtl' className="flex h-screen w-full font-sans text-gray-800">
        <Sidebar />
        
        <Routes>
          <Route path="/" element={<PlaceholderPage title="Home" />} />
          <Route path="/doctors" element={<PlaceholderPage title="Doctors" />} />
          
          {/* جایگزین کردن اسکلت قدیمی با صفحه واقعی کلینیک‌ها */}
          <Route path="/clinics" element={<Clinics />} />
          
          <Route path="/hospitals" element={<PlaceholderPage title="Hospitals" />} />
          <Route path="/airplanes" element={<PlaceholderPage title="Airplanes" />} />
          <Route path="/travel" element={<PlaceholderPage title="Travel" />} />
          <Route path="/guides" element={<PlaceholderPage title="Guides" />} />
          <Route path="/search" element={<PlaceholderPage title="Search" />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;