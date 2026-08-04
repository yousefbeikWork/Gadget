import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  fa: {
    translation: {
      // کلمات سایدبار
      home: "خانه",
      doctors: "پزشک",
      patients: "بیماران",
      hospitals: "بیمارستان",
      clinics: "کلینیک",
      myDoctors: "پزشکان من",
      airplanes: "هواپیما",
      calibration: "کالیبراسیون",
      travel: "سفر",
      guides: "راهنما",
      search: "جست و جو",
      leader: "لیدر",
      visa: "ویزا",
      laboratories: "آزمایشگاه",
      myLaboratories: "آزمایشگاه‌های همکار",
      schedule: "مدیریت نوبت‌دهی",
      myAppointments: "نوبت های من",
      Adminpanel: "پنل ادمین",
      aboutUs: "درباره ما",
      contactUs: "تماس با ما",

      // نقش‌ها
      roles: {
        Doctor: "پزشک متخصص",
        Patient: "بیمار",
        MedicalCenter: "مرکز درمانی",
        laboratorCenter: "مرکز آزمایشگاهی",
        Leader: "لیدر (راهنما)",
        SystemUser: "کاربر سامانه",
        Hospital: "بیمارستان",
      },

      // متون سایدبار
      userMenu: "منوی کاربری",
      viewProfile: "مشاهده و ویرایش پروفایل",
      loading: "در حال بارگذاری...",
      specialistPrefix: "متخصص",
      logout: "خروج از سیستم",
      login: "ورود به سیستم",
      register: "ثبت‌نام جدید",

      // متون صفحه سرویس‌ها
      servicesTitle: "خدمات سامانه TAP.NET",
      guestWelcome:
        "به عنوان کاربر مهمان خوش آمدید. برای استفاده از تمامی امکانات عملیاتی، وارد سیستم شوید.",
      userWelcome: "دسترسی سریع به امکانات پنل کاربری شما",
      quickLoginReg: "ورود سریع / ثبت‌نام",
      loginRequired: "نیازمند ورود",
      loginToastMsg:
        "برای استفاده از این بخش، لطفا ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید.",

      // توضیحات سرویس‌ها
      desc_home: "داشبورد اصلی و خلاصه وضعیت",
      desc_patients: "مدیریت و مشاهده لیست بیماران",
      desc_doctors: "لیست پزشکان و رزرو نوبت",
      desc_hospitals: "مراکز درمانی و بیمارستان‌ها",
      desc_clinics: "درمانگاه‌ها و کلینیک‌های تخصصی",
      desc_laboratories: "مراکز پاتولوژی و آزمایشگاهی",
      desc_calibration: "تنظیم و کالیبراسیون تجهیزات",
      desc_flights: "رزرو بلیت هواپیما و پرواز",
      desc_travels: "خدمات گردشگری و اقامت",
      desc_leaders: "راهنمای تور و مترجم",
      desc_visas: "خدمات اخذ ویزای درمانی",
      desc_guides: "پشتیبانی و راهنمای سیستم",
      desc_search: "جستجوی جامع در سامانه",

      // ================= کلمات داشبورد =================
      welcome: "سلام، به سیستم خوش آمدید! 👋",
      subtitle: "یک نگاه سریع به وضعیت سیستم بیندازیم.",
      active_clinics: "کلینیک‌های فعال",
      registered_doctors: "پزشکان ثبت‌شده",
      todays_flights: "پروازهای امروز",
      system_visits: "بازدیدهای سیستم",
      ready_to_start: "آماده‌ای برای شروع کار؟",
      system_ready_desc: "سیستم آماده بهره‌برداری است.",
      go_to_clinics: "رفتن به مدیریت کلینیک‌ها",

      // ================= کلمات صفحه اصلی (Home) =================
      hero_tag: "پلتفرم جامع سلامت",
      hero_title: "سلامت هوشمند، بدون مرز",
      hero_desc:
        "اولین پلتفرم یکپارچه سلامت و گردشگری درمانی که با بهره‌گیری از فناوری‌های نوین، امکان پایش لحظه‌ای سلامت، مدیریت پرونده پزشکی بین‌المللی، ارتباط با پزشکان و مراکز درمانی معتبر و برنامه‌ریزی کامل سفر درمانی را در یک بستر امن فراهم می‌کند.",
      btn_about: "درباره نوریان",
      btn_contact: "تماس با ما",
      our_services: "خدمات ما",
      why_our_platform: "چرا پلتفرم ما؟",
      treatments_specialties: "درمان‌ها و تخصص‌ها",
      latest_health_articles: "آخرین مقالات سلامت",
      latest_articles_desc:
        "جدیدترین مطالب و مقالات علمی در حوزه سلامت دیجیتال، پیشگیری از بیماری‌ها، گردشگری درمانی، فناوری‌های پزشکی و سبک زندگی سالم را در این بخش دنبال کنید.",

      // آرایه‌های صفحه اصلی
      services_list: [
        {
          title: "پایش هوشمند علائم حیاتی",
          desc: "ثبت و تحلیل مستمر شاخص‌های سلامت مانند ضربان قلب، فشار خون، اکسیژن خون و دمای بدن با ارائه هشدارهای هوشمند.",
        },
        {
          title: "پرونده سلامت الکترونیکی",
          desc: "ایجاد و نگهداری پرونده پزشکی دیجیتال بین‌المللی، قابل دسترس در هر زمان و قابل اشتراک‌گذاری در سراسر جهان.",
        },
        {
          title: "ارزیابی بیماری‌های قلبی",
          desc: "بهره‌گیری از ابزارهای هوشمند و تحلیل داده‌ها برای شناسایی زودهنگام ریسک بیماری‌های قلبی.",
        },
        {
          title: "ارتباط با پزشکان معتبر",
          desc: "دریافت مشاوره، ویزیت آنلاین و ارتباط مستقیم با متخصصان و مراکز درمانی در داخل و خارج از کشور.",
        },
        {
          title: "گردشگری سلامت",
          desc: "برنامه‌ریزی سفر درمانی شامل انتخاب پزشک، هماهنگی اقامت، خدمات مترجم و راهنمای اختصاصی.",
        },
        {
          title: "مدیریت مراکز درمانی",
          desc: "سامانه جامع مدیریت بیمار، پرونده پزشکی، نوبت‌دهی و مدیریت فرآیندهای درمانی برای کلینیک‌ها.",
        },
        {
          title: "رزرو نوبت و خدمات",
          desc: "رزرو سریع و آنلاین ویزیت حضوری یا آنلاین، آزمایش‌ها، تصویربرداری‌ها و سایر خدمات سلامت.",
        },
      ],
      features_list: [
        "ایجاد اولین پرونده سلامت الکترونیکی و بین‌المللی",
        "پایش لحظه‌ای سلامت و هشدارهای هوشمند",
        "دسترسی به شبکه‌ای از پزشکان و مراکز درمانی معتبر",
        "مدیریت کامل فرآیند درمان از تشخیص تا پیگیری",
        "کاهش هزینه‌ها و زمان دریافت خدمات پزشکی",
        "پشتیبانی از بیماران داخلی و بین‌المللی",
        "امکان انتخاب راهنما و لیدر تخصصی سفر درمانی",
        "امنیت و محرمانگی اطلاعات مطابق استانداردهای روز",
        "یکپارچه‌سازی خدمات سلامت، درمان و گردشگری",
      ],
      specialties_list: [
        "قلب و عروق",
        "جراحی‌های تخصصی",
        "ارتوپدی و مفاصل",
        "ناباروری",
        "زیبایی و پلاستیک",
        "دندانپزشکی",
        "چشم پزشکی",
        "مغز و اعصاب",
        "آنکولوژی و سرطان",
        "چکاپ‌های جامع",
      ],
      // ================= متون صفحه تماس با ما (Contact Us) =================
      contact: {
        header_tag: "ارتباط با Nourya Health",
        title: "همواره پاسخگوی شما هستیم",
        desc: "برای دریافت پشتیبانی، پیگیری درخواست‌ها، گزارش مشکلات فنی، اعلام مفقودی کارت سلامت هوشمند و دریافت اطلاعات درباره خدمات ما، از راه‌های ارتباطی زیر در تماس باشید.",
        phone_title: "تلفن پشتیبانی",
        email_title: "پست الکترونیکی",
        address_title: "آدرس دفتر مرکزی",
        address_text: "مشهد، خیابان صاحب‌الزمان، مجتمع سبحان",
        hours_title: "ساعات پاسخ‌گویی",
        hours_text: "شنبه تا پنجشنبه: ۸:۰۰ الی ۱۷:۰۰",
        guide_title: "راهنمای پشتیبانی کاربران",
        guide_desc:
          "برای پیگیری سریع‌تر مشکلات سامانه یا کارت سلامت، لطفاً نام و نام خانوادگی، شماره تماس ثبت‌شده و شماره درخواست/رزرو را در پیام خود ذکر کنید.",
        guide_alert:
          "لطفاً اطلاعات حساس پزشکی، رمز عبور، کدهای ورود یا اطلاعات بانکی خود را از این طریق ارسال نکنید.",
        security_title: "گزارش مشکلات امنیتی",
        security_desc:
          "اگر متوجه مشکل امنیتی یا دسترسی غیرمجاز در سامانه شدید، در سریع‌ترین زمان ممکن به ما اطلاع دهید. لطفاً از ارسال اطلاعات شخصی یا پزشکی افراد دیگر در گزارش‌ها خودداری نمایید.",
        form_title: "ارسال پیام مستقیم به پشتیبانی",
        form_name: "نام و نام خانوادگی",
        form_name_ph: "مثال: علی محمدی",
        form_mobile: "شماره موبایل ثبت‌شده",
        form_mobile_ph: "09123456789",
        form_subject: "موضوع پیام (یا شماره پیگیری)",
        form_subject_ph: "مثال: پیگیری مفقودی کارت هوشمند",
        form_message: "شرح مشکل یا درخواست",
        form_message_ph: "توضیحات دقیق خود را اینجا بنویسید...",
        form_submit: "ارسال پیام",
        form_success:
          "پیام شما با موفقیت دریافت شد. تلاش می‌کنیم در سریع‌ترین زمان ممکن پاسخگوی شما باشیم.",
      },

      // ================= متون صفحه درباره ما (About Us) =================
      about: {
        header_tag: "درباره ما و خدمات",
        title: "دفترچه الکترونیکی سلامت شما؛ همراهی هوشمند",
        desc: "راهکاری نوین برای مدیریت، رزرو و استفاده آسان‌تر از خدمات سلامت در یک شبکه یکپارچه و بین‌المللی. سلامت شما، همیشه همراه شما.",
        tab_card: "معرفی کارت سلامت",
        tab_privacy: "سیاست حریم خصوصی",
        tab_faq: "سوالات متداول (FAQ)",

        // تب ۱
        tech_badge: "فناوری مبتنی بر RFID",
        card_title: "یک کارت؛ یک اکوسیستم سلامت",
        card_desc:
          "کارت سلامت هوشمند Nourya Health فقط یک کارت شناسایی نیست؛ بلکه بخشی از یک اکوسیستم دیجیتال سلامت است که با اتصال به سامانه، امکان مدیریت پرونده، رزرو نوبت، پرداخت آنلاین و اشتراک‌گذاری امن اطلاعات را در مراکز همکار داخلی و بین‌المللی فراهم می‌سازد.",
        features_title: "قابلیت‌های کلیدی کارت سلامت هوشمند",
        usage_title: "نحوه استفاده از کارت سلامت هوشمند (۸ گام)",
        security_title: "امنیت و کنترل اطلاعات حساس",
        security_desc:
          "اطلاعات سلامت، اطلاعات حساس و شخصی محسوب می‌شوند. کارت سلامت هوشمند نباید به‌تنهایی به معنای دسترسی آزاد به تمام اطلاعات سلامت کاربر باشد؛ بلکه دسترسی‌ها صرفاً از طریق سامانه و بر اساس مجوزهای تعریف‌شده مدیریت می‌شود. در صورت مفقودی کارت، سریعاً موضوع را به پشتیبانی اعلام فرمایید.",

        // تب ۲
        privacy_title: "سیاست حفظ حریم خصوصی Nourya Health",
        privacy_subtitle:
          "نحوه دریافت، پردازش، نگهداری و صیانت از اطلاعات کاربران",
        privacy_update: "آخرین به‌روزرسانی: ۱۴۰۵/۰۴/۳۱",

        // پاورقی
        support_title: "مرکز پشتیبانی و ارتباط با Nourya Health",
        support_desc:
          "جهت دریافت اطلاعات بیشتر درباره کارت سلامت هوشمند، ثبت درخواست‌ها و استعلام خدمات فعال شبکه همکاران با ما در تماس باشید.",

        // آرایه‌ها
        card_features: [
          {
            title: "پرونده الکترونیکی سلامت",
            desc: "مدیریت دیجیتال اطلاعات و سوابق سلامت در بستر Nourya Health.",
          },
          {
            title: "دسترسی بین‌المللی",
            desc: "امکان استفاده از خدمات و شبکه مراکز درمانی همکار در کشورهای تحت همکاری Nourya Health.",
          },
          {
            title: "پشتیبانی از چند زبان",
            desc: "نمایش و ارائه اطلاعات و خدمات به زبان مناسب کاربر یا مرکز درمانی مقصد، در چارچوب قابلیت‌های سامانه.",
          },
          {
            title: "جست‌وجو و رزرو خدمات پزشکی",
            desc: "جست‌وجوی پزشکان، مراکز درمانی و خدمات سلامت و امکان رزرو نوبت از طریق سامانه.",
          },
          {
            title: "اشتراک‌گذاری کنترل‌شده اطلاعات",
            desc: "کاربر می‌تواند اطلاعات موردنیاز خود را با پزشک یا مرکز درمانی مجاز به اشتراک بگذارد.",
          },
          {
            title: "مدیریت سطح دسترسی",
            desc: "دسترسی به اطلاعات سلامت می‌تواند بر اساس سطح دسترسی تعریف‌شده و نیاز به ارائه خدمت مدیریت شود.",
          },
          {
            title: "کیف پول و اعتبار سلامت",
            desc: "امکان شارژ اعتبار قابل استفاده برای خدمات مجاز و پشتیبانی‌شده در سامانه.",
          },
          {
            title: "پرداخت هزینه خدمات",
            desc: "در صورت پشتیبانی خدمت یا مرکز درمانی مربوطه، هزینه خدمات می‌تواند از اعتبار قابل استفاده کاربر کسر شود.",
          },
          {
            title: "مشاهده تراکنش‌ها",
            desc: "کاربر می‌تواند سوابق شارژ، پرداخت‌ها و کسر اعتبار خود را در حساب کاربری مشاهده کند.",
          },
        ],
        usage_steps: [
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
        ],
        privacy_policies: [
          {
            title: "۱. اطلاعاتی که ممکن است جمع‌آوری شود",
            content:
              "بسته به نوع خدمتی که کاربر استفاده می‌کند، ممکن است اطلاعات زیر دریافت یا پردازش شود:",
            list: [
              "اطلاعات هویتی: نام و نام خانوادگی، اطلاعات حساب کاربری، تماس.",
              "اطلاعات حساب کاربری: نام کاربری، تنظیمات حساب، سوابق فعالیت.",
              "اطلاعات سلامت: در صورت ارائه توسط کاربر، سوابق پزشکی.",
              "اطلاعات رزرو: اطلاعات مربوط به درخواست‌ها و مراجعات.",
              "اطلاعات پرداخت: تراکنش‌ها. اطلاعات حساس (مثل رمز دوم) هرگز ذخیره نمی‌شوند.",
            ],
          },
          {
            title: "۲. هدف استفاده از اطلاعات",
            content: "",
            list: [
              "ایجاد و مدیریت حساب کاربری و ارائه خدمات سامانه",
              "مدیریت درخواست‌ها، رزروها و خدمات سلامت",
              "اشتراک‌گذاری مجاز اطلاعات با پزشک یا مرکز درمانی",
              "پردازش تراکنش‌های مالی، پشتیبانی، و جلوگیری از سوءاستفاده",
            ],
          },
          {
            title: "۳. اطلاعات سلامت",
            content:
              "اطلاعات سلامت و پزشکی از اطلاعات حساس محسوب می‌شوند. Nourya Health تلاش می‌کند دسترسی به این اطلاعات را بر اساس نیاز به ارائه خدمت مدیریت کند.",
          },
          {
            title: "۴. اشتراک‌گذاری اطلاعات",
            content:
              "اطلاعات کاربران فقط با پزشک/مرکز درمانی دارای مجوز، ارائه‌دهندگان خدمات فنی، یا در صورت الزام قانونی به اشتراک گذاشته می‌شود.",
          },
          {
            title: "۵. اطلاعات کارت سلامت هوشمند",
            content:
              "کارت هوشمند به حساب کاربری متصل است. اطلاعات جهت شناسایی کاربر و دسترسی کنترل‌شده استفاده می‌شود.",
          },
          {
            title: "۶. نگهداری اطلاعات",
            content:
              "اطلاعات تا زمانی که برای ارائه خدمات لازم باشد نگهداری شده و پس از آن حذف یا ناشناس‌سازی می‌شود.",
          },
          {
            title: "۷. امنیت اطلاعات",
            content:
              "اقدامات فنی شامل کنترل دسترسی، محدودسازی کارکنان، و پشتیبان‌گیری برای حفاظت از داده‌ها انجام می‌شود.",
          },
          {
            title: "۸. مسئولیت کاربر",
            content:
              "کاربر موظف به حفظ محرمانگی رمز عبور، ثبت اطلاعات صحیح، و اعلام سریع مفقودی کارت سلامت است.",
          },
          {
            title: "۹. حقوق کاربر",
            content:
              "کاربر حق دارد اطلاعات خود را مشاهده، ویرایش، حذف یا درخواست محدودسازی پردازش نماید (پس از احراز هویت).",
          },
          {
            title: "۱۰. افراد زیر سن قانونی",
            content:
              "استفاده افراد زیر سن قانونی از برخی خدمات نیازمند رضایت یا نظارت سرپرست قانونی است.",
          },
          {
            title: "۱۱. خدمات اشخاص ثالث",
            content:
              "خدمات پرداختی ممکن است توسط ارائه‌دهندگان ثالث انجام شود که تابع قوانین مجاز پردازش داده خواهد بود.",
          },
          {
            title: "۱۲. خدمات بین‌المللی",
            content:
              "در صورت فعال شدن خدمات بین‌المللی، پردازش داده‌ها در مرکز همکار با رعایت قوانین کشور مقصد صورت می‌گیرد.",
          },
          {
            title: "۱۳. تغییرات سیاست",
            content:
              "Nourya Health می‌تواند این سیاست را به‌روزرسانی کند. نسخه جدید پس از انتشار لازم‌الاجراست.",
          },
          {
            title: "۱۴. ارتباط جهت حریم خصوصی",
            content: "ایمیل: nouryahealth@gmail.com | تلفن: 09045822130",
          },
          {
            title: "۱۵. پذیرش سیاست",
            content:
              "با استفاده از خدمات Nourya Health، کاربر تأیید می‌کند که این سیاست حفظ حریم خصوصی را مطالعه کرده و با آن موافقت دارد.",
          },
        ],
        faq_list: [
          {
            categoryTitle: "معرفی و آشنایی با Nourya Health",
            items: [
              {
                question: "Nourya Health چیست؟",
                answer:
                  "Nourya Health یک بستر دیجیتال در حوزه سلامت است که با هدف توسعه راهکارهای نوین، مدیریت پرونده‌های پزشکی و تسهیل دسترسی آسان‌تر فعالیت می‌کند.",
              },
              {
                question: "چشم‌انداز و تمرکز اصلی چیست؟",
                answer:
                  "ایجاد یک اکوسیستم دیجیتال یکپارچه که ارتباط میان بیمار، پزشک و مرکز درمانی را ساده‌تر و بستر ارائه خدمات سلامت بین‌المللی را فراهم آورد.",
              },
              {
                question: "آیا افراد زیر سن قانونی می‌توانند استفاده کنند؟",
                answer:
                  "استفاده افراد زیر سن قانونی از برخی خدمات سامانه نیازمند رضایت و نظارت سرپرست قانونی آن‌ها می‌باشد.",
              },
            ],
          },
          {
            categoryTitle: "کارت سلامت هوشمند و فناوری RFID",
            items: [
              {
                question: "کارت سلامت هوشمند چیست؟",
                answer:
                  "این کارت یک ابزار مبتنی بر فناوری RFID است که به حساب کاربری دیجیتال متصل شده و جهت شناسایی سریع استفاده می‌شود.",
              },
              {
                question: "آیا اطلاعات پزشکی روی خود کارت ذخیره می‌شود؟",
                answer:
                  "خیر؛ اطلاعات بر روی بستر امن سامانه ذخیره شده و کارت فقط ابزار شناسایی و فراخوانی داده‌ها است.",
              },
              {
                question: "در صورت گم شدن کارت چه کار کنم؟",
                answer:
                  "باید سریعاً با پشتیبانی سامانه تماس بگیرید تا اقدامات لازم جهت غیرفعال‌سازی کارت انجام شود.",
              },
              {
                question: "آیا کارت در همه کشورها قابل استفاده است؟",
                answer:
                  "پذیرش کارت به وجود همکاری فعال و پشتیبانی فنی مرکز درمانی مقصد بستگی دارد.",
              },
            ],
          },
          {
            categoryTitle: "رزرو نوبت، تغییر و لغو خدمات",
            items: [
              {
                question: "آیا ثبت درخواست به معنای قطعی شدن نوبت است؟",
                answer:
                  "ثبت درخواست تا زمان تایید نهایی سامانه یا پزشک، لزوماً به معنای قطعی شدن نوبت نیست.",
              },
              {
                question: "شرایط لغو یا تغییر زمان چگونه است؟",
                answer:
                  "در صورت فعال بودن قابلیت، کاربر می‌تواند طبق شرایط اعلام‌شده درخواست لغو یا تغییر را ثبت کند.",
              },
              {
                question: "مسئولیت ارائه خدمات بر عهده کیست؟",
                answer:
                  "Nourya Health صرفاً بستر مدیریت است. مسئولیت کامل درمان بر عهده پزشک یا مرکز درمانی است.",
              },
            ],
          },
          {
            categoryTitle: "پرداخت آنلاین و اعتبار مالی",
            items: [
              {
                question: "آیا شارژ کیف پول فعال است؟",
                answer:
                  "این قابلیت‌ها تنها در صورت فعال‌سازی رسمی و اطلاع‌رسانی قبلی قابل استفاده خواهند بود.",
              },
              {
                question: "شرایط بازپرداخت چگونه است؟",
                answer:
                  "بازپرداخت، مطابق با قوانین مالی ثبت‌شده برای همان خدمت خاص صورت می‌پذیرد.",
              },
            ],
          },
          {
            categoryTitle: "امنیت، حریم خصوصی و پشتیبانی",
            items: [
              {
                question: "اطلاعات من چگونه با پزشکان به اشتراک گذاشته می‌شود؟",
                answer:
                  "تنها با مجوز مستقیم کاربر، در چارچوب سطح دسترسی تعریف‌شده در اختیار پزشک قرار می‌گیرد.",
              },
              {
                question: "راه‌های ارتباطی پشتیبانی چیست؟",
                answer:
                  "تلفن: 09045822130 | ایمیل: nouryahealth@gmail.com | آدرس: مشهد، مجتمع سبحان",
              },
            ],
          },
        ],
      },
    },
  },
  en: {
    translation: {
      // Sidebar Words
      home: "Home",
      schedule: "Schedule",
      doctors: "Doctors",
      patients: "Patients",
      myAppointments: "My Appointments",
      hospitals: "Hospitals",
      laboratories: "Laboratories",
      myLaboratories: "Collaborating Labs",
      calibration: "Calibration",
      clinics: "Clinics",
      myDoctors: "My Doctors",
      airplanes: "Airplanes",
      travel: "Travel",
      guides: "Guides",
      search: "Search",
      leader: "Leader",
      visa: "Visa",
      Adminpanel: "Admin Panel",
      aboutUs: "About Us",
      contactUs: "Contact Us",

      // Roles
      roles: {
        Doctor: "Specialist Doctor",
        Patient: "Patient",
        MedicalCenter: "Medical Center",
        laboratorCenter: "Laboratory Center",
        Leader: "Leader (Guide)",
        SystemUser: "System User",
        Hospital: "Hospital",
      },

      // Sidebar Texts
      userMenu: "User Menu",
      viewProfile: "View and Edit Profile",
      loading: "Loading...",
      specialistPrefix: "Specialist",
      logout: "Logout",
      login: "Login",
      register: "Register",

      // Services Page Texts
      servicesTitle: "TAP.NET System Services",
      guestWelcome:
        "Welcome as a guest. Please log in to use all operational features.",
      userWelcome: "Quick access to your user panel features",
      quickLoginReg: "Quick Login / Register",
      loginRequired: "Login Required",
      loginToastMsg:
        "To use this section, please login to your account or register first.",

      // Services Descriptions
      desc_home: "Main dashboard and status summary",
      desc_patients: "Manage and view patients list",
      desc_doctors: "Doctors list and appointment booking",
      desc_hospitals: "Medical centers and hospitals",
      desc_clinics: "Clinics and specialized clinics",
      desc_laboratories: "Pathology and laboratory centers",
      desc_calibration: "Equipment setup and calibration",
      desc_flights: "Flight and ticket booking",
      desc_travels: "Tourism and accommodation services",
      desc_leaders: "Tour guide and translator",
      desc_visas: "Medical visa services",
      desc_guides: "System support and guide",
      desc_search: "Comprehensive system search",

      // ================= Dashboard Words =================
      welcome: "Hello, Welcome to the system! 👋",
      subtitle: "Let's take a quick look at the system status.",
      active_clinics: "Active Clinics",
      registered_doctors: "Registered Doctors",
      todays_flights: "Today's Flights",
      system_visits: "System Visits",
      ready_to_start: "Ready to get started?",
      system_ready_desc: "The system is ready to use.",
      go_to_clinics: "Go to Clinics Management",

      // ================= Home Page Words =================
      hero_tag: "Comprehensive Health Platform",
      hero_title: "Smart Health, Borderless",
      hero_desc:
        "The first integrated health and medical tourism platform utilizing modern technologies to provide real-time health monitoring, international medical records management, connections with reputable doctors, and complete medical travel planning in a secure environment.",
      btn_about: "About Nourya",
      btn_contact: "Contact Us",
      our_services: "Our Services",
      why_our_platform: "Why Our Platform?",
      treatments_specialties: "Treatments & Specialties",
      latest_health_articles: "Latest Health Articles",
      latest_articles_desc:
        "Follow the latest scientific articles and content in the field of digital health, disease prevention, medical tourism, medical technologies, and a healthy lifestyle in this section.",

      // Home Page Arrays
      services_list: [
        {
          title: "Smart Vital Signs Monitoring",
          desc: "Continuous recording and analysis of health indicators such as heart rate, blood pressure, blood oxygen, and body temperature with smart alerts.",
        },
        {
          title: "Electronic Health Record",
          desc: "Create and maintain an international digital medical record, accessible anytime and shareable worldwide.",
        },
        {
          title: "Cardiovascular Assessment",
          desc: "Utilizing smart tools and data analysis for early detection of cardiovascular disease risks.",
        },
        {
          title: "Connection with Reputable Doctors",
          desc: "Receive consultations, online visits, and direct communication with specialists and medical centers domestically and internationally.",
        },
        {
          title: "Medical Tourism",
          desc: "Medical travel planning including doctor selection, accommodation coordination, translation services, and dedicated guides.",
        },
        {
          title: "Medical Centers Management",
          desc: "Comprehensive system for patient management, medical records, scheduling, and treatment process management for clinics.",
        },
        {
          title: "Appointment & Service Booking",
          desc: "Fast and online booking for in-person or online visits, tests, imaging, and other health services.",
        },
      ],
      features_list: [
        "Creation of the first international electronic health record",
        "Real-time health monitoring and smart alerts",
        "Access to a network of reputable doctors and medical centers",
        "Complete management of the treatment process from diagnosis to follow-up",
        "Reduction of costs and time for receiving medical services",
        "Support for domestic and international patients",
        "Option to select a dedicated medical travel guide (leader)",
        "Information security and confidentiality according to modern standards",
        "Integration of health, treatment, and tourism services",
      ],
      specialties_list: [
        "Cardiology",
        "Specialized Surgeries",
        "Orthopedics & Joints",
        "Infertility",
        "Cosmetic & Plastic",
        "Dentistry",
        "Ophthalmology",
        "Neurology",
        "Oncology & Cancer",
        "Comprehensive Checkups",
      ],
      // ================= Contact Us (EN) =================
      contact: {
        header_tag: "Contact Nourya Health",
        title: "We are always here for you",
        desc: "For support, tracking requests, reporting technical issues, reporting lost smart cards, and getting information about our services, please contact us.",
        phone_title: "Support Phone",
        email_title: "Email Address",
        address_title: "Head Office Address",
        address_text: "Sobhan Complex, Saheb Al-Zaman St, Mashhad, Iran",
        hours_title: "Response Hours",
        hours_text: "Saturday to Thursday: 8:00 AM to 5:00 PM",
        guide_title: "User Support Guide",
        guide_desc:
          "For faster tracking, please include your full name, registered phone number, and request/booking number in your message.",
        guide_alert:
          "Please DO NOT send sensitive medical information, passwords, login codes, or banking details through this form.",
        security_title: "Report Security Issues",
        security_desc:
          "If you notice a security issue or unauthorized access, let us know immediately. Please do not include other people's personal info.",
        form_title: "Send Direct Message to Support",
        form_name: "Full Name",
        form_name_ph: "e.g., John Doe",
        form_mobile: "Registered Mobile Number",
        form_mobile_ph: "+98 912 345 6789",
        form_subject: "Message Subject (or Tracking ID)",
        form_subject_ph: "e.g., Tracking lost smart card",
        form_message: "Issue Description or Request",
        form_message_ph: "Write your detailed explanation here...",
        form_submit: "Send Message",
        form_success:
          "Your message has been received successfully. We will respond as soon as possible.",
      },

      // ================= About Us (EN) =================
      about: {
        header_tag: "About Us & Services",
        title: "Your Electronic Health Passport; Smart Companion",
        desc: "A modern solution to manage, book, and easily use health services in an integrated international network. Your health, always with you.",
        tab_card: "Smart Card Intro",
        tab_privacy: "Privacy Policy",
        tab_faq: "FAQ",

        tech_badge: "RFID-Based Technology",
        card_title: "One Card; One Health Ecosystem",
        card_desc:
          "The Nourya Health Smart Card is not just an ID card; it's part of a digital health ecosystem that allows managing records, booking, online payment, and secure data sharing.",
        features_title: "Key Features of the Smart Health Card",
        usage_title: "How to use the Smart Card (8 Steps)",
        security_title: "Security and Sensitive Data Control",
        security_desc:
          "Health data is sensitive. The smart card alone does not grant access to all your info; access is managed via system permissions. If lost, report it immediately.",

        privacy_title: "Nourya Health Privacy Policy",
        privacy_subtitle: "How we collect, process, and protect user data",
        privacy_update: "Last Update: July 22, 2026",

        support_title: "Nourya Health Support Center",
        support_desc:
          "Contact us for more info about the smart card, submitting requests, and checking active network services.",

        card_features: [
          {
            title: "Electronic Health Record",
            desc: "Digital management of health records on Nourya Health platform.",
          },
          {
            title: "International Access",
            desc: "Use services in partner medical centers globally.",
          },
          {
            title: "Multilingual Support",
            desc: "Display info in the user's or medical center's language.",
          },
          {
            title: "Search & Book",
            desc: "Find doctors and medical centers, and book appointments.",
          },
          {
            title: "Controlled Data Sharing",
            desc: "Share necessary info securely with authorized doctors.",
          },
          {
            title: "Access Level Management",
            desc: "Manage who sees your health data based on service needs.",
          },
          {
            title: "Health Wallet & Credit",
            desc: "Top up your balance to use supported system services.",
          },
          {
            title: "Service Payment",
            desc: "Pay for services directly from your wallet balance.",
          },
          {
            title: "View Transactions",
            desc: "Check top-ups, payments, and deductions in your account.",
          },
        ],
        usage_steps: [
          {
            title: "1. Receive & Activate",
            desc: "Activate the card via the system and link it to your account.",
          },
          {
            title: "2. Complete Health Data",
            desc: "Register and manage required info in your digital record.",
          },
          {
            title: "3. Search for a Doctor",
            desc: "Search by country, city, specialty, or clinic.",
          },
          {
            title: "4. Book Appointment",
            desc: "Choose a suitable time and submit your request.",
          },
          {
            title: "5. Use Card at Clinic",
            desc: "Present your card so the doctor can view permitted info.",
          },
          {
            title: "6. International Use",
            desc: "Use services in partner networks across different countries.",
          },
          {
            title: "7. Payment & Deduction",
            desc: "Fees are deducted from your wallet if supported.",
          },
          {
            title: "8. View History",
            desc: "Manage past services, bookings, visits, and transactions.",
          },
        ],
        privacy_policies: [
          {
            title: "1. Data We May Collect",
            content: "Depending on the service, we may process:",
            list: [
              "Identity info: Name, account info, contact.",
              "Account info: Username, settings, activity.",
              "Health info: Medical records (if provided).",
              "Booking info: Requests and visits.",
              "Payment info: Transactions. Sensitive data (like passwords) is NEVER stored.",
            ],
          },
          {
            title: "2. Purpose of Use",
            content: "",
            list: [
              "Account management and system services",
              "Handling requests and bookings",
              "Authorized data sharing with doctors",
              "Financial processing and security",
            ],
          },
          {
            title: "3. Health Data",
            content:
              "Health info is sensitive. We manage access based on service requirements.",
          },
          {
            title: "4. Data Sharing",
            content:
              "Data is shared only with authorized medical centers, technical providers, or by legal mandate.",
          },
          {
            title: "5. Smart Card Data",
            content:
              "The card identifies the user securely; sensitive info requires system permission.",
          },
          {
            title: "6. Data Retention",
            content:
              "Data is kept as long as necessary, then deleted or anonymized.",
          },
          {
            title: "7. Data Security",
            content:
              "We use access control, staff limitations, and backups to protect data.",
          },
          {
            title: "8. User Responsibility",
            content:
              "Keep your password safe, provide accurate info, and report lost cards.",
          },
          {
            title: "9. User Rights",
            content:
              "You can view, edit, delete, or restrict processing of your data.",
          },
          {
            title: "10. Minors",
            content: "Minors need parental consent to use certain services.",
          },
          {
            title: "11. Third-Party Services",
            content:
              "Payment providers process data under legal privacy rules.",
          },
          {
            title: "12. International Services",
            content:
              "Data processing in destination countries follows local laws.",
          },
          {
            title: "13. Policy Changes",
            content:
              "We may update this policy. Changes are effective upon publication.",
          },
          {
            title: "14. Privacy Contact",
            content: "Email: nouryahealth@gmail.com | Phone: 09045822130",
          },
          {
            title: "15. Policy Acceptance",
            content:
              "By using Nourya Health, you agree to this Privacy Policy.",
          },
        ],
        faq_list: [
          {
            categoryTitle: "Introduction to Nourya Health",
            items: [
              {
                question: "What is Nourya Health?",
                answer:
                  "A digital health platform aimed at developing modern solutions for medical records and doctor access.",
              },
              {
                question: "What is the main vision?",
                answer:
                  "To create an integrated ecosystem connecting patients and doctors globally.",
              },
              {
                question: "Can minors use the services?",
                answer: "Minors require parental consent and supervision.",
              },
            ],
          },
          {
            categoryTitle: "Smart Card & RFID Tech",
            items: [
              {
                question: "What is the Smart Card?",
                answer:
                  "An RFID-based tool linked to your digital account for quick identification.",
              },
              {
                question: "Is medical info stored on the card?",
                answer:
                  "No, info is stored securely on the platform; the card is just a key.",
              },
              {
                question: "What if I lose my card?",
                answer: "Contact support immediately to deactivate it.",
              },
              {
                question: "Can I use it in any country?",
                answer:
                  "It depends on the active partnership with the destination clinic.",
              },
            ],
          },
          {
            categoryTitle: "Booking & Cancellations",
            items: [
              {
                question: "Is a booking request final?",
                answer:
                  "No, it requires final confirmation from the system or doctor.",
              },
              {
                question: "How to cancel or change?",
                answer:
                  "You can submit a request based on the specific service's rules.",
              },
              {
                question: "Who is responsible for medical services?",
                answer:
                  "Nourya Health is just a management tool. Doctors hold full medical responsibility.",
              },
            ],
          },
          {
            categoryTitle: "Online Payment & Credit",
            items: [
              {
                question: "Is wallet top-up active?",
                answer:
                  "Financial features will be available upon official launch.",
              },
              {
                question: "What is the refund policy?",
                answer:
                  "Refunds follow the specific financial rules of the booked service.",
              },
            ],
          },
          {
            categoryTitle: "Security & Privacy",
            items: [
              {
                question: "How is my info shared?",
                answer:
                  "Only with your direct permission to authorized medical centers.",
              },
              {
                question: "How to contact support?",
                answer: "Phone: +989045822130 | Email: nouryahealth@gmail.com",
              },
            ],
          },
        ],
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "fa",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
