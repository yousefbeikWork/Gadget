import { useState, useEffect } from 'react';
import { 
  FileText, Activity, Pill, Paperclip, 
  Loader2, Calendar, Stethoscope 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface HealthRecord {
  _id: string;
  title: string;
  description: string;
  prescription: string;
  attachments?: string[];
  createdAt: string;
}

export default function MyHealthRecord() {
  const { userProfile } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyRecords = async () => {
      // اطمینان از اینکه آیدی بیمار لود شده است
      if (!userProfile?._id) return;

      try {
        setLoading(true);
        // فراخوانی API با آیدی خود بیمار
        const response = await api.get(`/healthRecords/historyPationtsHelthRecord/${userProfile._id}`);
        
        if (response.data && response.data.success) {
          // بسته به کلید بازگشتی از بک‌اند (data یا records)
          setRecords(response.data.data || response.data.records || []);
        } else {
          setRecords([]);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setRecords([]);
        } else {
          setError('خطا در دریافت پرونده سلامت. لطفاً دوباره تلاش کنید.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyRecords();
  }, [userProfile?._id]);

  return (
    <div className="flex-1 bg-white md:rounded-2xl shadow-lg p-6 md:p-8 overflow-y-auto custom-scrollbar font-sans" dir="rtl">
      
      {/* هدر */}
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <div className="w-14 h-14 bg-gadget-light/10 text-gadget-light rounded-2xl flex items-center justify-center">
          <Activity size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">پرونده سلامت من</h1>
          <p className="text-gray-500 text-sm mt-1">
            تاریخچه مراجعات، تشخیص‌ها و نسخه‌های پزشکی شما
          </p>
        </div>
      </div>

      {/* محتوای تایم‌لاین */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gadget-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">در حال بارگذاری پرونده شما...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="bg-gray-50 p-10 rounded-2xl border border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-white text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">پرونده شما خالی است</h3>
            <p className="text-gray-500 text-sm">شما هنوز هیچ سابقه ویزیت یا نسخه‌ای در سیستم ندارید.</p>
          </div>
        ) : (
          <div className="relative border-r-2 border-gray-100 pr-6 space-y-8 py-4">
            {records.map((record) => (
              <div key={record._id} className="relative animate-in fade-in slide-in-from-bottom-4">
                
                {/* دایره تایم‌لاین */}
                <span className="absolute -right-8.75 top-4 w-4 h-4 rounded-full bg-gadget-light ring-4 ring-white shadow-xs"></span>
                
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
                  
                  <div className="mb-4 border-b border-gray-50 pb-4">
                    <h3 className="text-lg font-bold text-gray-800">{record.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                        <Calendar size={14} />
                        {new Date(record.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                      <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                        <Stethoscope size={14} />
                        ثبت شده توسط پزشک معالج
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={14} /> شرح حال و تشخیص
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                        {record.description}
                      </p>
                    </div>

                    {record.prescription && (
                      <div>
                        <h4 className="text-xs font-bold text-gadget-light mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill size={14} /> نسخه و تجویز
                        </h4>
                        <p className="text-sm text-gadget-dark leading-relaxed bg-gadget-light/5 p-3 rounded-xl border border-gadget-light/20">
                          {record.prescription}
                        </p>
                      </div>
                    )}

                    {record.attachments && record.attachments.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                          <Paperclip size={14} /> مدارک پیوست
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {record.attachments.map((_file, i) => (
                            <span key={i} className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                              <FileText size={12} /> پیوست {i + 1}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}