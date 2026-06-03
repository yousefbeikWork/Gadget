import { useState } from "react";
import { Search, Plus, Phone, User, Activity, Trash2, Edit } from "lucide-react";
import AddPatientModal, { type PatientData } from "../components/AddPatientModal";
interface Patient extends PatientData {
  id: number;
}

const initialPatients: Patient[] = [
  { id: 1, name: "علی حسینی", nationalId: "0012345678", phone: "09121112233", gender: "مرد", status: "تحت درمان" },
  { id: 2, name: "مریم رضایی", nationalId: "0456789123", phone: "09354445566", gender: "زن", status: "در انتظار ویزیت" },
  { id: 3, name: "رضا کریمی", nationalId: "0078945612", phone: "09107778899", gender: "مرد", status: "ترخیص شده" },
];

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.includes(searchTerm) || patient.nationalId.includes(searchTerm),
  );

  const handleSavePatient = (patientData: PatientData) => {
    if (editingPatient) {
      setPatients(patients.map(p => p.id === editingPatient.id ? { ...patientData, id: editingPatient.id } : p));
    } else {
      const newPatient = { ...patientData, id: Date.now() };
      setPatients([newPatient, ...patients]);
    }
  };

  const handleDeletePatient = (id: number) => {
    const isConfirmed = window.confirm("آیا از حذف پرونده این بیمار اطمینان دارید؟");
    if (isConfirmed) {
      setPatients(patients.filter((p) => p.id !== id));
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  // استایل‌دهی به وضعیت‌های مختلف
  const getStatusBadge = (status: Patient['status']) => {
    switch (status) {
      case 'تحت درمان': return 'bg-blue-50 text-blue-700';
      case 'در انتظار ویزیت': return 'bg-amber-50 text-amber-700';
      case 'ترخیص شده': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gadget-dark">لیست بیماران</h1>
          <p className="text-sm text-gray-500 mt-1">مدیریت پرونده‌ها و اطلاعات بیماران مراجعه‌کننده</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gadget-dark hover:bg-gadget-dark/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus size={18} />
          ثبت بیمار جدید
        </button>
      </div>

      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6 flex items-center max-w-md">
        <div className="text-gray-400 ml-3">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="جستجوی نام بیمار یا کد ملی..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm text-gray-700 bg-transparent outline-hidden"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gadget-dark text-white text-sm font-semibold">
                <th className="p-4">نام بیمار</th>
                <th className="p-4">کد ملی</th>
                <th className="p-4">شماره تماس</th>
                <th className="p-4">جنسیت</th>
                <th className="p-4">وضعیت پرونده</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{patient.name}</td>
                    <td className="p-4 text-gray-600 font-medium" dir="ltr">{patient.nationalId}</td>
                    <td className="p-4 text-gray-600">
                      <span className="inline-flex items-center gap-1" dir="ltr">
                        {patient.phone}
                        <Phone size={14} className="text-gray-400" />
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <User size={14} className="text-gray-400 shrink-0" />
                        {patient.gender}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(patient.status)}`}>
                        <Activity size={12} />
                        {patient.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleEditPatient(patient)} className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" title="ویرایش">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeletePatient(patient.id)} className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer" title="حذف">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">بیماری با این مشخصات یافت نشد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddPatientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleSavePatient}
        initialData={editingPatient}
      />
    </div>
  );
}