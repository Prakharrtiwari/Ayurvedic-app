import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Top Bar & Navigation
    searchPlaceholder: "Search 100% farm-traceable raw herbs, Ashwagandha, Giloy...",
    trackOrders: "Track Orders",
    cart: "Cart",
    instantConsult: "Instant Video Call",
    
    // Tabs
    tabStore: "🛍️ All Store",
    tabDoctors: "🩺 Doctor Video Call",
    tabChat: "💬 Doctor Chat",
    tabCommunity: "🤝 Community Q&A",
    tabYoga: "🧘 Yoga & Asanas",
    tabSkin: "📸 Skin Healing",
    tabOrders: "📦 Track Orders",
    tabRx: "📋 My Consultations & Rx",
    tabProtocol: "🌿 90-Day Protocol",
    tabLabTests: "🧪 Book Lab Tests",
    tabReminders: "💊 Daily Regimen & Water",
    tabAiCoach: "🤖 AI Health Assessment",
    tabSuperCoins: "🎁 SuperCoins Wallet",
    
    // Promo Banner
    promoTitle: "AYURVEDA MAHASALE • UP TO 45% OFF",
    promoSub: "Direct from Neemuch & Satpura Forest • Lab Tested Heavy Metal Free with CoA",
    claimCoins: "Claim +100 Coins",
    
    // Actions & Headers
    dailyStreak: "Day Healing Streak",
    balance: "Balance",
    outForDelivery: "OUT FOR DELIVERY TODAY",
    bookCall: "Book Call",
    viewProfile: "View Profile & Book",
    enrollNow: "Enroll in Program",
    askDoctor: "Ask Community & Doctors",
    verifiedDoctor: "BHMS Certified Vaidya"
  },
  hi: {
    // Top Bar & Navigation
    searchPlaceholder: "100% शुद्ध जड़ी-बूटियां, अश्वगंधा, गिलोय खोजें...",
    trackOrders: "ऑर्डर ट्रैक करें",
    cart: "कार्ट",
    instantConsult: "वीडियो परामर्श",
    
    // Tabs
    tabStore: "🛍️ संपूर्ण स्टोर",
    tabDoctors: "🩺 डॉक्टर वीडियो कॉल",
    tabChat: "💬 डॉक्टर से सीधी बातचीत",
    tabCommunity: "🤝 रोगी मंच व प्रश्नोत्तरी",
    tabYoga: "🧘 योगासन व प्राणायाम",
    tabSkin: "📸 त्वचा स्वास्थ्य टाइमलाइन",
    tabOrders: "📦 ऑर्डर स्थिति",
    tabRx: "📋 पर्चा एवं परामर्श",
    tabProtocol: "🌿 90-दिवसीय रोग मुक्ति",
    tabLabTests: "🧪 लैब टेस्ट बुकिंग",
    tabReminders: "💊 दैनिक खुराक व जल",
    tabAiCoach: "🤖 AI स्वास्थ्य परीक्षण",
    tabSuperCoins: "🎁 सुपरकॉइन्स वॉलेट",
    
    // Promo Banner
    promoTitle: "आयुर्वेद महाबचत महोत्सव • 45% तक की छूट",
    promoSub: "नीमच एवं सतपुड़ा के वनों से सीधे • लैब प्रमाणित एवं भारी धातु रहित",
    claimCoins: "100 सिक्के प्राप्त करें",
    
    // Actions & Headers
    dailyStreak: "दिन का आरोग्य संकल्प",
    balance: "कुल जमा",
    outForDelivery: "आज डिलीवरी के लिए रवाना",
    bookCall: "परामर्श बुक करें",
    viewProfile: "प्रोफ़ाइल देखें व बुक करें",
    enrollNow: "प्रोग्राम में दाखिला लें",
    askDoctor: "समुदाय एवं डॉक्टरों से पूछें",
    verifiedDoctor: "सत्यापित बीएचएमएस वैद्य"
  },
  hinglish: {
    // Top Bar & Navigation
    searchPlaceholder: "100% farm-traceable raw herbs, Ashwagandha, Giloy search karein...",
    trackOrders: "Orders Track Karein",
    cart: "Cart Dekhein",
    instantConsult: "Instant Video Call",
    
    // Tabs
    tabStore: "🛍️ Sabhi Jadi-Bootiyan",
    tabDoctors: "🩺 Doctor Video Call",
    tabChat: "💬 Doctor Chat Desk",
    tabCommunity: "🤝 Community Q&A",
    tabYoga: "🧘 Yoga & Asanas",
    tabSkin: "📸 Skin Healing Timeline",
    tabOrders: "📦 Orders Status",
    tabRx: "📋 E-Prescriptions & Calls",
    tabProtocol: "🌿 90-Day Disease Protocol",
    tabLabTests: "🧪 Lab Tests Booking",
    tabReminders: "💊 Daily Herbs & Water Reminder",
    tabAiCoach: "🤖 AI Health Check",
    tabSuperCoins: "🎁 SuperCoins Rewards",
    
    // Promo Banner
    promoTitle: "AYURVEDA MAHASALE • UP TO 45% OFF",
    promoSub: "Neemuch aur Satpura forest se seedhe • Lab Tested & Heavy Metal Free",
    claimCoins: "+100 SuperCoins Claim Karein",
    
    // Actions & Headers
    dailyStreak: "Din Ka Healing Streak",
    balance: "Coins Balance",
    outForDelivery: "AAJ DELIVERY KE LIYE OUT HAI",
    bookCall: "Call Book Karein",
    viewProfile: "Profile Dekhein & Book Karein",
    enrollNow: "Program Join Karein",
    askDoctor: "Doctors Se Sawal Poochein",
    verifiedDoctor: "Verified BHMS Vaidya"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('ayursutra_lang') || 'en');
  const [isWidgetVisible, setIsWidgetVisible] = useState(() => localStorage.getItem('ayursutra_show_translator') !== 'false');
  const [isWidgetCollapsed, setIsWidgetCollapsed] = useState(false);

  const selectLanguage = (selected) => {
    const target = selected === 'hi' ? 'hi' : 'en';
    setLang(target);
    localStorage.setItem('ayursutra_lang', target);

    try {
      if (target === 'hi') {
        document.cookie = 'googtrans=/en/hi; path=/';
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          document.cookie = `googtrans=/en/hi; path=/; domain=${window.location.hostname}`;
          document.cookie = `googtrans=/en/hi; path=/; domain=.${window.location.hostname}`;
        }
      } else {
        document.cookie = 'googtrans=/en/en; path=/';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
        }
      }

      // If Google Translate select box is present in DOM, set it directly
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = target;
        select.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn('Translate error:', e);
    }

    // Fast reload ensures 100% of the entire website (all pages, components, databases, drawers) translates in ONE click
    window.location.reload();
  };

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    selectLanguage(next);
  };

  const hideWidget = () => {
    setIsWidgetVisible(false);
    localStorage.setItem('ayursutra_show_translator', 'false');
  };

  const showWidget = () => {
    setIsWidgetVisible(true);
    localStorage.setItem('ayursutra_show_translator', 'true');
  };

  useEffect(() => {
    const saved = localStorage.getItem('ayursutra_lang');
    if (saved === 'hi') {
      document.cookie = 'googtrans=/en/hi; path=/';
    }
  }, []);

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      lang, 
      setLang, 
      selectLanguage, 
      toggleLanguage, 
      t,
      isWidgetVisible,
      isWidgetCollapsed,
      setIsWidgetCollapsed,
      hideWidget,
      showWidget
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
