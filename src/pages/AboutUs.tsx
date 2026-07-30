import { useState } from "react";
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
  // Lock,
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

export default function AboutUs() {
  // مدیریت تب‌های اصلی صفحه (سه تب)
  const [activeTab, setActiveTab] = useState<"card-info" | "privacy" | "faq">(
    "card-info",
  );

  // مدیریت آکاردئون‌های بخش سیاست حریم خصوصی
  const [openPrivacyIndex, setOpenPrivacyIndex] = useState<number | null>(0);

  // مدیریت آکاردئون‌های بخش سوالات متداول (با آیدی یکتا برای هر سوال)
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const togglePrivacy = (index: number) => {
    setOpenPrivacyIndex(openPrivacyIndex === index ? null : index);
  };

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  // ================= داده‌های تب اول: قابلیت‌های کارت =================
  const cardFeatures = [
    {
      title: "پرونده الکترونیکی سلامت",
      desc: "مدیریت دیجیتال اطلاعات و سوابق سلامت در بستر Nourya Health.",
      icon: FileText,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "دسترسی بین‌المللی",
      desc: "امکان استفاده از خدمات و شبکه مراکز درمانی همکار در کشورهای تحت همکاری Nourya Health.",
      icon: Globe,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "پشتیبانی از چند زبان",
      desc: "نمایش و ارائه اطلاعات و خدمات به زبان مناسب کاربر یا مرکز درمانی مقصد، در چارچوب قابلیت‌های سامانه.",
      icon: Languages,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "جست‌وجو و رزرو خدمات پزشکی",
      desc: "جست‌وجوی پزشکان، مراکز درمانی و خدمات سلامت و امکان رزرو نوبت از طریق سامانه.",
      icon: Search,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "اشتراک‌گذاری کنترل‌شده اطلاعات",
      desc: "کاربر می‌تواند اطلاعات موردنیاز خود را با پزشک یا مرکز درمانی مجاز به اشتراک بگذارد.",
      icon: Share2,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      title: "مدیریت سطح دسترسی",
      desc: "دسترسی به اطلاعات سلامت می‌تواند بر اساس سطح دسترسی تعریف‌شده و نیاز به ارائه خدمت مدیریت شود.",
      icon: ShieldCheck,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      title: "کیف پول و اعتبار سلامت",
      desc: "امکان شارژ اعتبار قابل استفاده برای خدمات مجاز و پشتیبانی‌شده در سامانه.",
      icon: Wallet,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100",
    },
    {
      title: "پرداخت هزینه خدمات",
      desc: "در صورت پشتیبانی خدمت یا مرکز درمانی مربوطه، هزینه خدمات می‌تواند از اعتبار قابل استفاده کاربر کسر شود.",
      icon: Receipt,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      title: "مشاهده تراکنش‌ها",
      desc: "کاربر می‌تواند سوابق شارژ، پرداخت‌ها و کسر اعتبار خود را در حساب کاربری مشاهده کند.",
      icon: History,
      color: "text-orange-600 bg-orange-50 border-orange-100",
    },
  ];

  // ================= داده‌های تب اول: مراحل استفاده =================
  const usageSteps = [
    {
      title: "۱. دریافت و فعال‌سازی کارت",
      desc: "پس از دریافت کارت، کاربر آن را از طریق سامانه Nourya Health فعال و به حساب کاربری خود متصل می‌کند.",
    },
    {
      title: "۲. تکمیل اطلاعات سلامت",
      desc: "کاربر می‌تواند اطلاعات موردنیاز خود را در پرونده سلامت دیجیتال ثبت و مدیریت کند.",
    },
    {
      title: "۳. جست‌وجوی پزشک یا مرکز درمانی",
      desc: "کاربر می‌تواند بر اساس کشور، شهر، تخصص، نوع خدمت یا مرکز درمانی، گزینه مناسب خود را جست‌وجو کند.",
    },
    {
      title: "۴. رزرو نوبت",
      desc: "پس از انتخاب پزشک یا مرکز درمانی، کاربر می‌تواند در صورت فعال بودن امکان رزرو، زمان مناسب را انتخاب و درخواست خود را ثبت کند.",
    },
    {
      title: "۵. استفاده از کارت در مرکز درمانی",
      desc: "در زمان مراجعه، کاربر می‌تواند کارت سلامت هوشمند یا شناسه مرتبط با حساب خود را ارائه کند تا مرکز یا پزشک در چارچوب سطح دسترسی مجاز، اطلاعات را مشاهده کند.",
    },
    {
      title: "۶. استفاده در کشورهای مختلف",
      desc: "در صورت وجود همکاری فعال میان Nourya Health و مرکز درمانی مقصد، کاربر می‌تواند از خدمات شبکه همکاران استفاده کند.",
    },
    {
      title: "۷. پرداخت و کسر اعتبار",
      desc: "کاربر می‌تواند اعتبار خود را شارژ کند. در صورت پشتیبانی، هزینه خدمت طبق شرایط از اعتبار کسر شده و تراکنش ثبت می‌شود.",
    },
    {
      title: "۸. مشاهده سوابق",
      desc: "کاربر می‌تواند سوابق مربوط به خدمات، رزروها، مراجعه‌ها و تراکنش‌های مالی مرتبط را مشاهده و مدیریت کند.",
    },
  ];

  // ================= داده‌های تب دوم: سیاست حریم خصوصی =================
  const privacyPolicies = [
    {
      title: "۱. اطلاعاتی که ممکن است جمع‌آوری شود",
      content: (
        <div className="space-y-2">
          <p>
            بسته به نوع خدمتی که کاربر استفاده می‌کند، ممکن است اطلاعات زیر
            دریافت یا پردازش شود:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 pr-2">
            <li>
              <strong>اطلاعات هویتی:</strong> نام و نام خانوادگی، اطلاعات ایجاد
              حساب کاربری، اطلاعات تماس.
            </li>
            <li>
              <strong>اطلاعات حساب کاربری:</strong> نام کاربری، اطلاعات ورود،
              تنظیمات حساب، سوابق فعالیت.
            </li>
            <li>
              <strong>اطلاعات سلامت:</strong> در صورت ارائه توسط کاربر، اطلاعات
              مرتبط با سلامت و سوابق پزشکی.
            </li>
            <li>
              <strong>اطلاعات رزرو و خدمات:</strong> اطلاعات مربوط به
              درخواست‌ها، رزروها و مراجعات.
            </li>
            <li>
              <strong>اطلاعات پرداخت:</strong> اطلاعات تراکنش‌ها و وضعیت پرداخت.
              اطلاعات حساس مانند رمز دوم کارت هرگز ذخیره نمی‌شوند.
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "۲. هدف استفاده از اطلاعات",
      content: (
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>ایجاد و مدیریت حساب کاربری و ارائه خدمات سامانه</li>
          <li>مدیریت درخواست‌ها، رزروها و خدمات سلامت</li>
          <li>
            اشتراک‌گذاری مجاز اطلاعات با پزشک یا مرکز درمانی و مدیریت کارت
            هوشمند
          </li>
          <li>
            پردازش تراکنش‌های مالی، پشتیبانی، حفظ امنیت سامانه و جلوگیری از
            سوءاستفاده
          </li>
        </ul>
      ),
    },
    {
      title: "۳. اطلاعات سلامت",
      content:
        "اطلاعات سلامت و پزشکی از اطلاعات حساس محسوب می‌شوند. Nourya Health تلاش می‌کند دسترسی به این اطلاعات را بر اساس نیاز به ارائه خدمت، سطح دسترسی و قابلیت‌های فعال سامانه مدیریت کند. کاربر می‌تواند اطلاعات خود را با مرکز مجاز به اشتراک بگذارد.",
    },
    {
      title: "۴. اشتراک‌گذاری اطلاعات",
      content:
        "اطلاعات کاربران فقط با پزشک/مرکز درمانی دارای مجوز، ارائه‌دهندگان خدمات فنی موردنیاز سامانه، یا در صورت الزام قانونی و دستور مراجع ذی‌صلاح به اشتراک گذاشته می‌شود.",
    },
    {
      title: "۵. اطلاعات کارت سلامت هوشمند",
      content:
        "کارت هوشمند به حساب کاربری متصل است. اطلاعات مرتبط با کارت جهت شناسایی کاربر و دسترسی کنترل‌شده استفاده می‌شود و اطلاعات حساس بدون مجوز امنیتی در دسترس نخواهند بود.",
    },
    {
      title: "۶. نگهداری اطلاعات",
      content:
        "اطلاعات تا زمانی که برای ارائه خدمات، مدیریت حساب، انجام تعهدات یا الزامات قانونی لازم باشد نگهداری شده و پس از آن حذف یا ناشناس‌سازی می‌شود.",
    },
    {
      title: "۷. امنیت اطلاعات",
      content:
        "اقدامات فنی شامل کنترل دسترسی، محدودسازی کارکنان، پشتیبان‌گیری و به‌روزرسانی زیرساخت‌ها برای حفاظت از داده‌ها انجام می‌شود.",
    },
    {
      title: "۸. مسئولیت کاربر",
      content:
        "کاربر موظف به حفظ محرمانگی رمز عبور، ثبت اطلاعات صحیح، عدم قرار دادن اکانت در اختیار دیگران و اعلام سریع مفقودی کارت سلامت به پشتیبانی است.",
    },
    {
      title: "۹. حقوق کاربر",
      content:
        "کاربر حق دارد اطلاعات خود را مشاهده، ویرایش، حذف یا درخواست محدودسازی پردازش نماید (پس از احراز هویت معتبر).",
    },
    {
      title: "۱۰. اطلاعات افراد زیر سن قانونی",
      content:
        "استفاده افراد زیر سن قانونی از برخی خدمات نیازمند رضایت یا نظارت ولی، سرپرست یا نماینده قانونی است.",
    },
    {
      title: "۱۱. خدمات اشخاص ثالث",
      content:
        "خدمات پرداختی یا زیرساختی ممکن است توسط ارائه‌دهندگان ثالث انجام شود که تابع قوانین مجاز پردازش داده خواهد بود.",
    },
    {
      title: "۱۲. خدمات بین‌المللی",
      content:
        "در صورت فعال شدن خدمات بین‌المللی، پردازش داده‌ها در مرکز همکار با رعایت قوانین کشور مقصد و سطح دسترسی مجاز صورت می‌گیرد.",
    },
    {
      title: "۱۳. تغییرات سیاست حفظ حریم خصوصی",
      content:
        "Nourya Health می‌تواند این سیاست را به‌روزرسانی کند. نسخه جدید پس از انتشار در سایت لازم‌الاجراست.",
    },
    {
      title: "۱۴. ارتباط با ما جهت حریم خصوصی",
      content:
        "ایمیل: nouryahealth@gmail.com | تلفن: 09045822130 | آدرس: مشهد، خیابان صاحب‌الزمان، مجتمع سبحان",
    },
    {
      title: "۱۵. پذیرش سیاست",
      content:
        "با استفاده از خدمات Nourya Health، کاربر تأیید می‌کند که این سیاست حفظ حریم خصوصی را مطالعه کرده و با آن موافقت دارد.",
    },
  ];

  // ================= داده‌های تب سوم: سوالات متداول =================
  const faqData = [
    {
      categoryTitle: "معرفی و آشنایی با Nourya Health",
      items: [
        {
          question: "Nourya Health چیست؟",
          answer:
            "Nourya Health یک بستر دیجیتال در حوزه سلامت است که با هدف توسعه راهکارهای نوین، مدیریت پرونده‌های پزشکی و تسهیل دسترسی آسان‌تر کاربران به پزشکان، آزمایشگاه‌ها و مراکز درمانی فعالیت می‌کند.",
        },
        {
          question: "چشم‌انداز و تمرکز اصلی سامانه چیست؟",
          answer:
            "ایجاد یک اکوسیستم دیجیتال یکپارچه که ارتباط میان بیمار، پزشک و مرکز درمانی را ساده‌تر و منظم‌تر کرده و بستر ارائه خدمات سلامت بین‌المللی را فراهم آورد.",
        },
        {
          question: "آیا افراد زیر سن قانونی می‌توانند از خدمات استفاده کنند؟",
          answer:
            "استفاده افراد زیر سن قانونی از برخی خدمات سامانه نیازمند رضایت، نظارت و مدیریت ولی یا سرپرست قانونی آن‌ها می‌باشد.",
        },
      ],
    },
    {
      categoryTitle: "کارت سلامت هوشمند و فناوری RFID",
      items: [
        {
          question: "کارت سلامت هوشمند Nourya Health چیست؟",
          answer:
            "این کارت یک ابزار مبتنی بر فناوری RFID است که به حساب کاربری دیجیتال متصل شده و جهت شناسایی سریع، احراز هویت و استفاده از خدمات پشتیبانی‌شده سامانه مورد استفاده قرار می‌گیرد.",
        },
        {
          question: "آیا اطلاعات پزشکی روی خود کارت ذخیره می‌شود؟",
          answer:
            "خیر؛ کارت به تنهایی حاوی پرونده پزشکی شما نیست. اطلاعات بر روی بستر امن سامانه ذخیره شده و کارت فقط ابزار شناسایی و فراخوانی داده‌ها بر اساس سطح دسترسی تعریف‌شده است.",
        },
        {
          question: "در صورت گم شدن یا سرقت کارت چه کار کنم؟",
          answer:
            "باید در سریع‌ترین زمان ممکن با پشتیبانی سامانه (09045822130) تماس بگیرید تا اقدامات لازم جهت غیرفعال‌سازی یا محدود کردن دسترسی کارت انجام شود.",
        },
        {
          question: "آیا کارت در همه مراکز درمانی و کشورها قابل استفاده است؟",
          answer:
            "پذیرش کارت به وجود همکاری فعال و پشتیبانی فنی مرکز درمانی مقصد بستگی دارد. خدمات بین‌المللی نیز پس از فعال‌سازی رسمی در شبکه همکاران قابل استفاده خواهد بود.",
        },
      ],
    },
    {
      categoryTitle: "رزرو نوبت، تغییر و لغو خدمات",
      items: [
        {
          question: "آیا ثبت درخواست رزرو به معنای نهایی شدن قطعی نوبت است؟",
          answer:
            "ثبت درخواست تا زمان تایید نهایی سامانه یا پزشک/مرکز درمانی مربوطه، لزوماً به معنای قطعی شدن نوبت نیست و وضعیت آن متعاقباً از طریق سامانه اطلاع‌رسانی می‌شود.",
        },
        {
          question: "شرایط لغو یا تغییر زمان رزرو چگونه است؟",
          answer:
            "در صورت فعال بودن قابلیت لغو یا تغییر زمان، کاربر می‌تواند طبق شرایط و ضوابط اعلام‌شده برای آن خدمت و با توجه به زمان باقی‌مانده تا نوبت، درخواست خود را ثبت کند.",
        },
        {
          question: "مسئولیت ارائه خدمات پزشکی بر عهده کیست؟",
          answer:
            "Nourya Health صرفاً بستر مدیریت دیجیتال است. مسئولیت کامل تشخیص، تجویز، درمان و مشاوره پزشکی مستقیماً بر عهده پزشک یا مرکز درمانی معالج است.",
        },
      ],
    },
    {
      categoryTitle: "پرداخت آنلاین و اعتبار مالی",
      items: [
        {
          question: "آیا پرداخت آنلاین و شارژ کیف پول فعال است؟",
          answer:
            "قابلیت‌های مالی مانند شارژ اعتبار، پرداخت آنلاین و کسر موجودی از کیف پول تنها در صورت فعال‌سازی رسمی و اطلاع‌رسانی شفاف پیش از انجام تراکنش قابل استفاده خواهند بود.",
        },
        {
          question: "شرایط بازپرداخت چگونه است؟",
          answer:
            "هرگونه بازپرداخت، مطابق با قوانین مالی ثبت‌شده برای همان خدمت خاص و بر اساس تراکنش انجام‌شده صورت می‌پذیرد.",
        },
      ],
    },
    {
      categoryTitle: "امنیت، حریم خصوصی و پشتیبانی",
      items: [
        {
          question: "اطلاعات من چگونه با پزشکان به اشتراک گذاشته می‌شود؟",
          answer:
            "اشتراک‌گذاری اطلاعات تنها با مجوز مستقیم کاربر، در چارچوب سطح دسترسی تعریف‌شده و صرفاً جهت تسهیل و ارائه خدمات درمانی در اختیار پزشک یا مرکز مجاز قرار می‌گیرد.",
        },
        {
          question: "راه‌های ارتباطی با پشتیبانی چیست؟",
          answer:
            "تلفن: 09045822130 | ایمیل: nouryahealth@gmail.com | آدرس دفتر مرکزی: مشهد، خیابان صاحب‌الزمان، مجتمع سبحان",
        },
      ],
    },
  ];

  return (
    <div
      className="flex-1 bg-gray-50 md:rounded-2xl shadow-lg overflow-y-auto overflow-x-hidden font-sans"
      dir="rtl"
    >
      {/* ================= هدر اصلی ================= */}
      <div className="bg-linear-to-r from-gadget-dark to-gadget-light p-8 md:p-14 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/cubes.png')] opacity-30 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold border border-white/10">
            <Sparkles size={16} /> درباره ما و خدمات
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
            دفترچه الکترونیکی سلامت شما؛ همراهی هوشمند
          </h1>
          <p className="text-gray-100 text-xs md:text-sm leading-relaxed max-w-3xl mx-auto opacity-95">
            راهکاری نوین برای مدیریت، رزرو و استفاده آسان‌تر از خدمات سلامت در
            یک شبکه یکپارچه و بین‌المللی. سلامت شما، همیشه همراه شما.
          </p>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        {/* ================= منوی تب‌ها (سوئیچ بین ۳ بخش) ================= */}
        <div className="flex flex-col sm:flex-row bg-white p-1.5 rounded-2xl border border-gray-200 shadow-2xs max-w-3xl mx-auto gap-1">
          <button
            onClick={() => setActiveTab("card-info")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "card-info"
                ? "bg-gadget-dark text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <CreditCard size={16} />
            معرفی کارت سلامت
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "privacy"
                ? "bg-gadget-dark text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <ShieldCheck size={16} />
            سیاست حریم خصوصی
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "faq"
                ? "bg-gadget-dark text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <HelpCircle size={16} />
            سوالات متداول (FAQ)
          </button>
        </div>

        {/* ================= تب ۱: قابلیت‌ها و راهنمای کارت ================= */}
        {activeTab === "card-info" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                  <Cpu size={14} /> فناوری مبتنی بر RFID
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  یک کارت؛ یک اکوسیستم سلامت
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed text-justify">
                  کارت سلامت هوشمند Nourya Health فقط یک کارت شناسایی نیست؛ بلکه
                  بخشی از یک اکوسیستم دیجیتال سلامت است که با اتصال به سامانه،
                  امکان مدیریت پرونده، رزرو نوبت، پرداخت آنلاین و اشتراک‌گذاری
                  امن اطلاعات را در مراکز همکار داخلی و بین‌المللی فراهم
                  می‌سازد.
                </p>
              </div>
              <div className="w-full md:w-64 bg-linear-to-br from-gray-800 to-gadget-dark text-white p-5 rounded-2xl shadow-xl space-y-4 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-300">
                    Nourya Health Card
                  </span>
                  <Sparkles size={16} className="text-amber-400" />
                </div>
                <div className="py-2">
                  <span className="block text-xs font-mono tracking-widest text-gray-200">
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
                قابلیت‌های کلیدی کارت سلامت هوشمند
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cardFeatures.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl border ${feat.color}`}
                        >
                          <Icon size={20} />
                        </div>
                        <h4 className="font-bold text-sm text-gray-800">
                          {feat.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                <UserCheck size={20} className="text-gadget-dark" />
                نحوه استفاده از کارت سلامت هوشمند (۸ گام)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usageSteps.map((step, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50/70 border border-gray-100 rounded-xl space-y-1.5"
                  >
                    <h4 className="font-bold text-xs text-gadget-dark flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-emerald-500 shrink-0"
                      />
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed pr-5">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle size={20} className="text-amber-600" />
                امنیت و کنترل اطلاعات حساس
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed text-justify">
                اطلاعات سلامت، اطلاعات حساس و شخصی محسوب می‌شوند. کارت سلامت
                هوشمند نباید به‌تنهایی به معنای دسترسی آزاد به تمام اطلاعات
                سلامت کاربر باشد؛ بلکه دسترسی‌ها صرفاً از طریق سامانه و بر اساس
                مجوزهای تعریف‌شده مدیریت می‌شود. در صورت مفقودی کارت، سریعاً
                موضوع را به پشتیبانی اعلام فرمایید.
              </p>
            </div>
          </div>
        )}

        {/* ================= تب ۲: سیاست حفظ حریم خصوصی (۱۵ بند) ================= */}
        {activeTab === "privacy" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Shield size={22} className="text-gadget-dark" />
                  سیاست حفظ حریم خصوصی Nourya Health
                </h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  نحوه دریافت، پردازش، نگهداری و صیانت از اطلاعات کاربران
                </p>
              </div>
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg w-fit">
                آخرین به‌روزرسانی: 1405/04/31
              </span>
            </div>

            <div className="space-y-3">
              {privacyPolicies.map((item, idx) => {
                const isOpen = openPrivacyIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`border rounded-xl transition-all overflow-hidden ${
                      isOpen
                        ? "border-gadget-light bg-gadget-light/5 shadow-2xs"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <button
                      onClick={() => togglePrivacy(idx)}
                      className="w-full flex items-center justify-between p-4 text-right cursor-pointer gap-4"
                    >
                      <span className="font-bold text-sm text-gray-800">
                        {item.title}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform duration-300 shrink-0 ${
                          isOpen ? "rotate-180 text-gadget-dark" : ""
                        }`}
                      />
                    </button>

                    {/* بخش محتوا با افکت باز و بسته شدن نرم */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {/* پدینگ‌ها و استایل‌های محتوا باید داخل این دیو قرار بگیرند */}
                        <div className="px-4 pb-4 pt-2 text-xs text-gray-600 leading-relaxed border-t border-gray-100/60">
                          {item.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= تب ۳: سوالات متداول (FAQ) ================= */}
        {activeTab === "faq" && (
 <div className="space-y-8 animate-in fade-in duration-300">
  {faqData.map((category, catIdx) => (
    <div
      key={catIdx}
      className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xs space-y-4"
    >
      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
        <HelpCircle size={20} className="text-gadget-light" />
        {category.categoryTitle}
      </h3>

      <div className="space-y-3">
        {category.items.map((item, itemIdx) => {
          const faqId = `${catIdx}-${itemIdx}`;
          const isOpen = openFaqId === faqId;

          return (
            <div
              key={faqId}
              className={`border rounded-xl transition-all overflow-hidden ${
                isOpen
                  ? "border-gadget-light bg-gadget-light/5 shadow-2xs"
                  : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <button
                onClick={() => toggleFaq(faqId)}
                className="w-full flex items-center justify-between p-4 text-right cursor-pointer gap-4"
              >
                <span className="font-bold text-sm text-gray-800">
                  {item.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-300 shrink-0 ${
                    isOpen ? "rotate-180 text-gadget-dark" : ""
                  }`}
                />
              </button>
              
              {/* بخش محتوا با افکت باز و بسته شدن نرم (حذف شرط &&) */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 pt-2 text-xs text-gray-600 leading-relaxed border-t border-gray-100/60 text-justify">
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

        {/* ================= کارت پشتیبانی و تماس نهایی (مشهد) ================= */}
        <div className="bg-gray-800 text-white rounded-2xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right">
            <h3 className="text-lg font-bold flex items-center justify-center md:justify-start gap-2 text-gray-100">
              <Info size={20} className="text-emerald-400" />
              مرکز پشتیبانی و ارتباط با Nourya Health
            </h3>
            <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
              جهت دریافت اطلاعات بیشتر درباره کارت سلامت هوشمند، ثبت درخواست‌ها
              و استعلام خدمات فعال شبکه همکاران با ما در تماس باشید.
            </p>
          </div>

          <div className="space-y-2 text-xs font-medium w-full md:w-auto shrink-0 bg-white/10 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2" dir="ltr">
              <Phone size={14} className="text-emerald-400" />
              <span>09045822130</span>
            </div>
            <div className="flex items-center gap-2" dir="ltr">
              <Mail size={14} className="text-blue-400" />
              <span>nouryahealth@gmail.com</span>
            </div>
            <div
              className="flex items-start gap-2 pt-1 border-t border-white/10 text-right"
              dir="rtl"
            >
              <MapPin size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-[11px]">
                مشهد، خیابان صاحب‌الزمان، مجتمع سبحان
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
