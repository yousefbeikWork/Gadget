import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  Globe,
  Languages,
  Search,
  Share2,
  ShieldCheck,
  Wallet,
  Receipt,
  History,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  FileText,
  UserCheck,
  Cpu,
  HelpCircle,
} from "lucide-react";

// تعریف اینترفیس برای تایپ‌اسکریپت (چون دیتای آرایه‌ها رو از i18n می‌گیریم)
interface CardFeature { title: string; desc: string; }
interface UsageStep { title: string; desc: string; }
interface PrivacyPolicy { title: string; content?: string; list?: string[]; }
interface FaqCategory { categoryTitle: string; items: { question: string; answer: string }[]; }

export default function AboutUs() {
  const { t, i18n } = useTranslation();
  const isLtr = i18n.dir() === "ltr";

  const [activeTab, setActiveTab] = useState<"card-info" | "privacy" | "faq">("card-info");
  const [openPrivacyIndex, setOpenPrivacyIndex] = useState<number | null>(0);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const togglePrivacy = (index: number) => setOpenPrivacyIndex(openPrivacyIndex === index ? null : index);
  const toggleFaq = (id: string) => setOpenFaqId(openFaqId === id ? null : id);

  // استخراج آرایه‌ها از i18n
  const rawFeatures = t("about.card_features", { returnObjects: true });
  const rawSteps = t("about.usage_steps", { returnObjects: true });
  const rawPrivacy = t("about.privacy_policies", { returnObjects: true });
  const rawFaq = t("about.faq_list", { returnObjects: true });

  const cardFeaturesTrans = (Array.isArray(rawFeatures) ? rawFeatures : []) as CardFeature[];
  const usageSteps = (Array.isArray(rawSteps) ? rawSteps : []) as UsageStep[];
  const privacyPolicies = (Array.isArray(rawPrivacy) ? rawPrivacy : []) as PrivacyPolicy[];
  const faqData = (Array.isArray(rawFaq) ? rawFaq : []) as FaqCategory[];

  // ترکیب آیکون‌ها و رنگ‌ها با اطلاعات ترجمه شده کارت‌ها
  const cardStyles = [
    { icon: FileText, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { icon: Globe, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { icon: Languages, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { icon: Search, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { icon: Share2, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { icon: ShieldCheck, color: "text-teal-600 bg-teal-50 border-teal-100" },
    { icon: Wallet, color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
    { icon: Receipt, color: "text-rose-600 bg-rose-50 border-rose-100" },
    { icon: History, color: "text-orange-600 bg-orange-50 border-orange-100" },
  ];

  const cardFeatures = cardFeaturesTrans.map((item, i) => ({
    ...item,
    icon: cardStyles[i]?.icon || FileText,
    color: cardStyles[i]?.color || "text-gray-600 bg-gray-50 border-gray-100",
  }));

  return (
    <div
      className="flex-1 bg-gray-50 md:rounded-2xl shadow-lg overflow-y-auto overflow-x-hidden font-sans"
      dir={i18n.dir()}
    >
      {/* ================= هدر اصلی ================= */}
      <div className="bg-linear-to-r from-gadget-dark to-gadget-light p-8 md:p-14 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-30 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold border border-white/10">
            <Sparkles size={16} /> {t("about.header_tag")}
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
            {t("about.title")}
          </h1>
          <p className="text-gray-100 text-xs md:text-sm leading-relaxed max-w-3xl mx-auto opacity-95">
            {t("about.desc")}
          </p>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        {/* ================= منوی تب‌ها ================= */}
        <div className="flex flex-col sm:flex-row bg-white p-1.5 rounded-2xl border border-gray-200 shadow-2xs max-w-3xl mx-auto gap-1">
          <button
            onClick={() => setActiveTab("card-info")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "card-info" ? "bg-gadget-dark text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <CreditCard size={16} /> {t("about.tab_card")}
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "privacy" ? "bg-gadget-dark text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <ShieldCheck size={16} /> {t("about.tab_privacy")}
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "faq" ? "bg-gadget-dark text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <HelpCircle size={16} /> {t("about.tab_faq")}
          </button>
        </div>

        {/* ================= تب ۱ ================= */}
        {activeTab === "card-info" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                  <Cpu size={14} /> {t("about.tech_badge")}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {t("about.card_title")}
                </h2>
                <p className={`text-xs text-gray-600 leading-relaxed ${isLtr ? "" : "text-justify"}`}>
                  {t("about.card_desc")}
                </p>
              </div>
              <div className="w-full md:w-64 bg-linear-to-br from-gray-800 to-gadget-dark text-white p-5 rounded-2xl shadow-xl space-y-4 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-300">Nourya Health Card</span>
                  <Sparkles size={16} className="text-amber-400" />
                </div>
                <div className="py-2">
                  <span className="block text-xs font-mono tracking-widest text-gray-200" dir="ltr">
                    •••• •••• •••• 2026
                  </span>
                </div>
                <div className="flex justify-between items-end text-[9px] text-gray-300 font-bold">
                  <span>SMART HEALTH PASSPORT</span>
                  <span>RFID ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3">
                <Sparkles size={20} className="text-gadget-dark" />
                {t("about.features_title")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cardFeatures.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${feat.color}`}>
                          <Icon size={20} />
                        </div>
                        <h4 className="font-bold text-sm text-gray-800">{feat.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                <UserCheck size={20} className="text-gadget-dark" />
                {t("about.usage_title")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usageSteps.map((step, index) => (
                  <div key={index} className="p-4 bg-gray-50/70 border border-gray-100 rounded-xl space-y-1.5">
                    <h4 className="font-bold text-xs text-gadget-dark flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      {step.title}
                    </h4>
                    <p className={`text-xs text-gray-600 leading-relaxed ${isLtr ? "pl-5" : "pr-5"}`}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle size={20} className="text-amber-600" />
                {t("about.security_title")}
              </div>
              <p className={`text-xs text-amber-900/80 leading-relaxed ${isLtr ? "" : "text-justify"}`}>
                {t("about.security_desc")}
              </p>
            </div>
          </div>
        )}

        {/* ================= تب ۲: حریم خصوصی ================= */}
        {activeTab === "privacy" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Shield size={22} className="text-gadget-dark" />
                  {t("about.privacy_title")}
                </h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">{t("about.privacy_subtitle")}</p>
              </div>
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg w-fit">
                {t("about.privacy_update")}
              </span>
            </div>

            <div className="space-y-3">
              {privacyPolicies.map((item, idx) => {
                const isOpen = openPrivacyIndex === idx;
                return (
                  <div key={idx} className={`border rounded-xl transition-all overflow-hidden ${isOpen ? "border-gadget-light bg-gadget-light/5 shadow-2xs" : "border-gray-200 bg-white"}`}>
                    <button
                      onClick={() => togglePrivacy(idx)}
                      className={`w-full flex items-center justify-between p-4 cursor-pointer gap-4 ${isLtr ? "text-left" : "text-right"}`}
                    >
                      <span className="font-bold text-sm text-gray-800">{item.title}</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-gadget-dark" : ""}`} />
                    </button>

                    <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden">
                        <div className="px-4 pb-4 pt-2 text-xs text-gray-600 leading-relaxed border-t border-gray-100/60">
                          {/* نمایش هوشمند پاراگراف یا لیست */}
                          {item.content && <p className="mb-2">{item.content}</p>}
                          {item.list && item.list.length > 0 && (
                            <ul className={`list-disc list-inside space-y-1 ${isLtr ? "pl-2" : "pr-2"}`}>
                              {item.list.map((li, i) => (
                                <li key={i}>{li}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= تب ۳: سوالات متداول ================= */}
        {activeTab === "faq" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {faqData.map((category, catIdx) => (
              <div key={catIdx} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <HelpCircle size={20} className="text-gadget-light" />
                  {category.categoryTitle}
                </h3>

                <div className="space-y-3">
                  {category.items.map((item, itemIdx) => {
                    const faqId = `${catIdx}-${itemIdx}`;
                    const isOpen = openFaqId === faqId;

                    return (
                      <div key={faqId} className={`border rounded-xl transition-all overflow-hidden ${isOpen ? "border-gadget-light bg-gadget-light/5 shadow-2xs" : "border-gray-200 bg-gray-50/50"}`}>
                        <button
                          onClick={() => toggleFaq(faqId)}
                          className={`w-full flex items-center justify-between p-4 cursor-pointer gap-4 ${isLtr ? "text-left" : "text-right"}`}
                        >
                          <span className="font-bold text-sm text-gray-800">{item.question}</span>
                          <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-gadget-dark" : ""}`} />
                        </button>
                        
                        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                          <div className="overflow-hidden">
                            <div className={`px-4 pb-4 pt-2 text-xs text-gray-600 leading-relaxed border-t border-gray-100/60 ${isLtr ? "" : "text-justify"}`}>
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= کارت پشتیبانی ================= */}
        <div className="bg-gray-800 text-white rounded-2xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className={`space-y-3 w-full text-center ${isLtr ? "md:text-left" : "md:text-right"}`}>
            <h3 className={`text-lg font-bold flex items-center justify-center gap-2 text-gray-100 ${isLtr ? "md:justify-start" : "md:justify-start"}`}>
              <Info size={20} className="text-emerald-400" />
              {t("about.support_title")}
            </h3>
            <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
              {t("about.support_desc")}
            </p>
          </div>

          <div className="space-y-2 text-xs font-medium w-full md:w-auto shrink-0 bg-white/10 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2" dir="ltr">
              <Phone size={14} className="text-emerald-400" />
              <span>0904 582 2130</span>
            </div>
            <div className="flex items-center gap-2" dir="ltr">
              <Mail size={14} className="text-blue-400" />
              <span>nouryahealth@gmail.com</span>
            </div>
            <div className={`flex items-start gap-2 pt-1 border-t border-white/10 ${isLtr ? "text-left" : "text-right"}`}>
              <MapPin size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-[11px]">
                {t("contact.address_text")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}