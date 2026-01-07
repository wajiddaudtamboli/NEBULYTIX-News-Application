import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'te';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    te: string;
  };
}

// Comprehensive translations for the entire application
export const translations: Translations = {
  // Navigation
  'nav.home': {
    en: 'Home',
    hi: 'होम',
    te: 'హోమ్',
  },
  'nav.trending': {
    en: 'Trending',
    hi: 'ट्रेंडिंग',
    te: 'ట్రెండింగ్',
  },
  'nav.saved': {
    en: 'Saved',
    hi: 'सेव किया गया',
    te: 'సేవ్ చేయబడింది',
  },
  'nav.admin': {
    en: 'Admin',
    hi: 'एडमिन',
    te: 'అడ్మిన్',
  },
  'nav.login': {
    en: 'Login',
    hi: 'लॉगिन',
    te: 'లాగిన్',
  },
  'nav.signup': {
    en: 'Sign Up',
    hi: 'साइन अप',
    te: 'సైన్ అప్',
  },
  'nav.logout': {
    en: 'Logout',
    hi: 'लॉगआउट',
    te: 'లాగౌట్',
  },

  // Categories
  'category.all': {
    en: 'All',
    hi: 'सभी',
    te: 'అన్నీ',
  },
  'category.technology': {
    en: 'Technology',
    hi: 'प्रौद्योगिकी',
    te: 'సాంకేతికత',
  },
  'category.business': {
    en: 'Business',
    hi: 'व्यापार',
    te: 'వ్యాపారం',
  },
  'category.science': {
    en: 'Science',
    hi: 'विज्ञान',
    te: 'సైన్స్',
  },
  'category.world': {
    en: 'World',
    hi: 'विश्व',
    te: 'ప్రపంచం',
  },
  'category.health': {
    en: 'Health',
    hi: 'स्वास्थ्य',
    te: 'ఆరోగ్యం',
  },

  // Home Page
  'home.featured': {
    en: 'Featured News',
    hi: 'फीचर्ड समाचार',
    te: 'ఫీచర్డ్ వార్తలు',
  },
  'home.trending': {
    en: 'Trending Now',
    hi: 'अभी ट्रेंडिंग',
    te: 'ఇప్పుడు ట్రెండింగ్',
  },
  'home.latest': {
    en: 'Latest News',
    hi: 'नवीनतम समाचार',
    te: 'తాజా వార్తలు',
  },
  'home.readMore': {
    en: 'Read More',
    hi: 'और पढ़ें',
    te: 'మరింత చదవండి',
  },
  'home.views': {
    en: 'views',
    hi: 'व्यूज',
    te: 'వీక్షణలు',
  },
  'home.noNews': {
    en: 'No news found',
    hi: 'कोई समाचार नहीं मिला',
    te: 'వార్తలు కనుగొనబడలేదు',
  },
  'home.loading': {
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
    te: 'లోడ్ అవుతోంది...',
  },

  // Article Detail
  'article.publishedOn': {
    en: 'Published on',
    hi: 'प्रकाशित',
    te: 'ప్రచురించబడింది',
  },
  'article.source': {
    en: 'Source',
    hi: 'स्रोत',
    te: 'మూలం',
  },
  'article.tags': {
    en: 'Tags',
    hi: 'टैग',
    te: 'ట్యాగ్‌లు',
  },
  'article.save': {
    en: 'Save Article',
    hi: 'लेख सेव करें',
    te: 'వ్యాసాన్ని సేవ్ చేయండి',
  },
  'article.saved': {
    en: 'Saved',
    hi: 'सेव किया गया',
    te: 'సేవ్ చేయబడింది',
  },
  'article.share': {
    en: 'Share',
    hi: 'शेयर करें',
    te: 'షేర్ చేయండి',
  },
  'article.back': {
    en: 'Back to News',
    hi: 'समाचार पर वापस',
    te: 'వార్తలకు తిరిగి',
  },
  'article.relatedNews': {
    en: 'Related News',
    hi: 'संबंधित समाचार',
    te: 'సంబంధిత వార్తలు',
  },

  // Saved News
  'saved.title': {
    en: 'Saved Articles',
    hi: 'सेव किए गए लेख',
    te: 'సేవ్ చేసిన వ్యాసాలు',
  },
  'saved.empty': {
    en: 'No saved articles yet',
    hi: 'अभी तक कोई सेव किया गया लेख नहीं',
    te: 'ఇంకా సేవ్ చేసిన వ్యాసాలు లేవు',
  },
  'saved.loginRequired': {
    en: 'Please login to view saved articles',
    hi: 'सेव किए गए लेख देखने के लिए लॉगिन करें',
    te: 'సేవ్ చేసిన వ్యాసాలను చూడటానికి లాగిన్ చేయండి',
  },

  // Contact Page
  'contact.title': {
    en: 'Contact Us',
    hi: 'संपर्क करें',
    te: 'మమ్మల్ని సంప్రదించండి',
  },
  'contact.name': {
    en: 'Full Name',
    hi: 'पूरा नाम',
    te: 'పూర్తి పేరు',
  },
  'contact.email': {
    en: 'Email Address',
    hi: 'ईमेल पता',
    te: 'ఇమెయిల్ చిరునామా',
  },
  'contact.phone': {
    en: 'Phone Number',
    hi: 'फोन नंबर',
    te: 'ఫోన్ నంబర్',
  },
  'contact.subject': {
    en: 'Subject',
    hi: 'विषय',
    te: 'విషయం',
  },
  'contact.message': {
    en: 'Message',
    hi: 'संदेश',
    te: 'సందేశం',
  },
  'contact.submit': {
    en: 'Send Message',
    hi: 'संदेश भेजें',
    te: 'సందేశం పంపండి',
  },
  'contact.enquiryType': {
    en: 'Enquiry Type',
    hi: 'पूछताछ का प्रकार',
    te: 'విచారణ రకం',
  },
  'contact.general': {
    en: 'General Inquiry',
    hi: 'सामान्य पूछताछ',
    te: 'సాధారణ విచారణ',
  },
  'contact.support': {
    en: 'Technical Support',
    hi: 'तकनीकी सहायता',
    te: 'సాంకేతిక సహాయం',
  },
  'contact.feedback': {
    en: 'Feedback',
    hi: 'प्रतिक्रिया',
    te: 'అభిప్రాయం',
  },
  'contact.partnership': {
    en: 'Partnership',
    hi: 'साझेदारी',
    te: 'భాగస్వామ్యం',
  },

  // Footer
  'footer.about': {
    en: 'About Us',
    hi: 'हमारे बारे में',
    te: 'మా గురించి',
  },
  'footer.privacy': {
    en: 'Privacy Policy',
    hi: 'गोपनीयता नीति',
    te: 'గోప్యతా విధానం',
  },
  'footer.terms': {
    en: 'Terms of Service',
    hi: 'सेवा की शर्तें',
    te: 'సేవా నిబంధనలు',
  },
  'footer.contact': {
    en: 'Contact',
    hi: 'संपर्क',
    te: 'సంప్రదించండి',
  },
  'footer.copyright': {
    en: '© 2026 NEBULYTIX News. All rights reserved.',
    hi: '© 2026 NEBULYTIX न्यूज़। सर्वाधिकार सुरक्षित।',
    te: '© 2026 NEBULYTIX న్యూస్. అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.',
  },
  'footer.description': {
    en: 'Your trusted source for breaking news and in-depth analysis.',
    hi: 'ब्रेकिंग न्यूज़ और गहन विश्लेषण के लिए आपका विश्वसनीय स्रोत।',
    te: 'బ్రేకింగ్ న్యూస్ మరియు లోతైన విశ్లేషణ కోసం మీ విశ్వసనీయ మూలం.',
  },

  // Auth
  'auth.email': {
    en: 'Email',
    hi: 'ईमेल',
    te: 'ఇమెయిల్',
  },
  'auth.password': {
    en: 'Password',
    hi: 'पासवर्ड',
    te: 'పాస్‌వర్డ్',
  },
  'auth.confirmPassword': {
    en: 'Confirm Password',
    hi: 'पासवर्ड की पुष्टि करें',
    te: 'పాస్‌వర్డ్ నిర్ధారించండి',
  },
  'auth.forgotPassword': {
    en: 'Forgot Password?',
    hi: 'पासवर्ड भूल गए?',
    te: 'పాస్‌వర్డ్ మర్చిపోయారా?',
  },
  'auth.noAccount': {
    en: "Don't have an account?",
    hi: 'खाता नहीं है?',
    te: 'ఖాతా లేదా?',
  },
  'auth.hasAccount': {
    en: 'Already have an account?',
    hi: 'पहले से खाता है?',
    te: 'ఇప్పటికే ఖాతా ఉందా?',
  },

  // Admin Dashboard
  'admin.dashboard': {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    te: 'డాష్‌బోర్డ్',
  },
  'admin.news': {
    en: 'News Management',
    hi: 'समाचार प्रबंधन',
    te: 'వార్తల నిర్వహణ',
  },
  'admin.categories': {
    en: 'Categories',
    hi: 'श्रेणियाँ',
    te: 'వర్గాలు',
  },
  'admin.settings': {
    en: 'Settings',
    hi: 'सेटिंग्स',
    te: 'సెట్టింగ్‌లు',
  },
  'admin.enquiries': {
    en: 'Enquiries',
    hi: 'पूछताछ',
    te: 'విచారణలు',
  },
  'admin.blogs': {
    en: 'Blogs',
    hi: 'ब्लॉग',
    te: 'బ్లాగులు',
  },
  'admin.pages': {
    en: 'Pages',
    hi: 'पेज',
    te: 'పేజీలు',
  },
  'admin.media': {
    en: 'Media Library',
    hi: 'मीडिया लाइब्रेरी',
    te: 'మీడియా లైబ్రరీ',
  },
  'admin.totalNews': {
    en: 'Total News',
    hi: 'कुल समाचार',
    te: 'మొత్తం వార్తలు',
  },
  'admin.totalViews': {
    en: 'Total Views',
    hi: 'कुल व्यूज',
    te: 'మొత్తం వీక్షణలు',
  },
  'admin.featured': {
    en: 'Featured',
    hi: 'फीचर्ड',
    te: 'ఫీచర్డ్',
  },
  'admin.trending': {
    en: 'Trending',
    hi: 'ट्रेंडिंग',
    te: 'ట్రెండింగ్',
  },
  'admin.createNews': {
    en: 'Create News',
    hi: 'समाचार बनाएं',
    te: 'వార్త సృష్టించండి',
  },
  'admin.editNews': {
    en: 'Edit News',
    hi: 'समाचार संपादित करें',
    te: 'వార్త సవరించండి',
  },
  'admin.deleteNews': {
    en: 'Delete News',
    hi: 'समाचार हटाएं',
    te: 'వార్త తొలగించండి',
  },
  'admin.confirmDelete': {
    en: 'Are you sure you want to delete this?',
    hi: 'क्या आप इसे हटाना चाहते हैं?',
    te: 'మీరు దీన్ని తొలగించాలనుకుంటున్నారా?',
  },
  'admin.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
    te: 'రద్దు చేయండి',
  },
  'admin.save': {
    en: 'Save',
    hi: 'सेव करें',
    te: 'సేవ్ చేయండి',
  },
  'admin.update': {
    en: 'Update',
    hi: 'अपडेट करें',
    te: 'అప్‌డేట్ చేయండి',
  },
  'admin.search': {
    en: 'Search...',
    hi: 'खोजें...',
    te: 'వెతకండి...',
  },
  'admin.actions': {
    en: 'Actions',
    hi: 'कार्रवाई',
    te: 'చర్యలు',
  },
  'admin.status': {
    en: 'Status',
    hi: 'स्थिति',
    te: 'స్థితి',
  },
  'admin.published': {
    en: 'Published',
    hi: 'प्रकाशित',
    te: 'ప్రచురించబడింది',
  },
  'admin.draft': {
    en: 'Draft',
    hi: 'ड्राफ्ट',
    te: 'డ్రాఫ్ట్',
  },

  // Common
  'common.title': {
    en: 'Title',
    hi: 'शीर्षक',
    te: 'శీర్షిక',
  },
  'common.description': {
    en: 'Description',
    hi: 'विवरण',
    te: 'వివరణ',
  },
  'common.summary': {
    en: 'Summary',
    hi: 'सारांश',
    te: 'సారాంశం',
  },
  'common.category': {
    en: 'Category',
    hi: 'श्रेणी',
    te: 'వర్గం',
  },
  'common.date': {
    en: 'Date',
    hi: 'तारीख',
    te: 'తేదీ',
  },
  'common.image': {
    en: 'Image',
    hi: 'छवि',
    te: 'చిత్రం',
  },
  'common.coverImage': {
    en: 'Cover Image',
    hi: 'कवर छवि',
    te: 'కవర్ చిత్రం',
  },
  'common.yes': {
    en: 'Yes',
    hi: 'हाँ',
    te: 'అవును',
  },
  'common.no': {
    en: 'No',
    hi: 'नहीं',
    te: 'కాదు',
  },
  'common.close': {
    en: 'Close',
    hi: 'बंद करें',
    te: 'మూసివేయండి',
  },
  'common.submit': {
    en: 'Submit',
    hi: 'जमा करें',
    te: 'సమర్పించండి',
  },
  'common.error': {
    en: 'Error',
    hi: 'त्रुटि',
    te: 'లోపం',
  },
  'common.success': {
    en: 'Success',
    hi: 'सफलता',
    te: 'విజయం',
  },
  'common.loading': {
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
    te: 'లోడ్ అవుతోంది...',
  },
  'common.noData': {
    en: 'No data available',
    hi: 'कोई डेटा उपलब्ध नहीं',
    te: 'డేటా అందుబాటులో లేదు',
  },

  // Language Names
  'lang.english': {
    en: 'English',
    hi: 'अंग्रेज़ी',
    te: 'ఆంగ్లం',
  },
  'lang.hindi': {
    en: 'हिंदी',
    hi: 'हिंदी',
    te: 'హిందీ',
  },
  'lang.telugu': {
    en: 'తెలుగు',
    hi: 'తెలుగు',
    te: 'తెలుగు',
  },

  // Time
  'time.justNow': {
    en: 'Just now',
    hi: 'अभी',
    te: 'ఇప్పుడే',
  },
  'time.minutesAgo': {
    en: 'minutes ago',
    hi: 'मिनट पहले',
    te: 'నిమిషాల క్రితం',
  },
  'time.hoursAgo': {
    en: 'hours ago',
    hi: 'घंटे पहले',
    te: 'గంటల క్రితం',
  },
  'time.daysAgo': {
    en: 'days ago',
    hi: 'दिन पहले',
    te: 'రోజుల క్రితం',
  },

  // Empty States
  'empty.news': {
    en: 'No news articles found',
    hi: 'कोई समाचार लेख नहीं मिला',
    te: 'వార్త కథనాలు కనుగొనబడలేదు',
  },
  'empty.saved': {
    en: 'You haven\'t saved any articles yet',
    hi: 'आपने अभी तक कोई लेख सेव नहीं किया है',
    te: 'మీరు ఇంకా ఏ వ్యాసాలను సేవ్ చేయలేదు',
  },
  'empty.search': {
    en: 'No results found for your search',
    hi: 'आपकी खोज के लिए कोई परिणाम नहीं मिला',
    te: 'మీ శోధన కోసం ఫలితాలు కనుగొనబడలేదు',
  },
  'empty.noResults': {
    en: 'No stories found',
    hi: 'कोई कहानियाँ नहीं मिलीं',
    te: 'కథలు కనుగొనబడలేదు',
  },
  'empty.noResultsDesc': {
    en: 'Try adjusting your filters or check back later for new content.',
    hi: 'अपने फ़िल्टर समायोजित करने का प्रयास करें या नई सामग्री के लिए बाद में जांचें।',
    te: 'మీ ఫిల్టర్‌లను సర్దుబాటు చేయడానికి ప్రయత్నించండి లేదా కొత్త కంటెంట్ కోసం తర్వాత తనిఖీ చేయండి.',
  },
  'empty.noSaved': {
    en: 'No saved articles yet',
    hi: 'अभी तक कोई सेव किया गया लेख नहीं',
    te: 'ఇంకా సేవ్ చేసిన వ్యాసాలు లేవు',
  },
  'empty.noSavedDesc': {
    en: 'Start exploring and save articles that interest you. They\'ll appear here for easy access.',
    hi: 'अन्वेषण शुरू करें और रुचि के लेखों को सेव करें। वे यहाँ आसान पहुँच के लिए दिखाई देंगे।',
    te: 'అన్వేషించడం ప్రారంభించి, మీకు ఆసక్తి ఉన్న వ్యాసాలను సేవ్ చేయండి. అవి ఇక్కడ సులభంగా యాక్సెస్ కోసం కనిపిస్తాయి.',
  },
  'empty.error': {
    en: 'Something went wrong',
    hi: 'कुछ गलत हो गया',
    te: 'ఏదో తప్పు జరిగింది',
  },
  'empty.errorDesc': {
    en: 'We couldn\'t load the content. Please check your connection and try again.',
    hi: 'हम सामग्री लोड नहीं कर सके। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।',
    te: 'మేము కంటెంట్‌ను లోడ్ చేయలేకపోయాము. దయచేసి మీ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
  },
  'empty.exploreNews': {
    en: 'Explore News',
    hi: 'समाचार देखें',
    te: 'వార్తలు చూడండి',
  },
  'empty.clearFilters': {
    en: 'Clear Filters',
    hi: 'फ़िल्टर साफ़ करें',
    te: 'ఫిల్టర్‌లను క్లియర్ చేయండి',
  },

  // Categories for CategoryFilter
  'categories.all': {
    en: 'All',
    hi: 'सभी',
    te: 'అన్నీ',
  },
  'categories.technology': {
    en: 'Technology',
    hi: 'प्रौद्योगिकी',
    te: 'సాంకేతికత',
  },
  'categories.business': {
    en: 'Business',
    hi: 'व्यापार',
    te: 'వ్యాపారం',
  },
  'categories.science': {
    en: 'Science',
    hi: 'विज्ञान',
    te: 'సైన్స్',
  },
  'categories.world': {
    en: 'World',
    hi: 'विश्व',
    te: 'ప్రపంచం',
  },
  'categories.health': {
    en: 'Health',
    hi: 'स्वास्थ्य',
    te: 'ఆరోగ్యం',
  },

  // Home Page - Additional
  'home.liveUpdates': {
    en: 'Live Updates',
    hi: 'लाइव अपडेट',
    te: 'లైవ్ అప్‌డేట్‌లు',
  },
  'home.subtitle': {
    en: 'Stay ahead with real-time insights. Your gateway to the stories that shape our world.',
    hi: 'वास्तविक समय की जानकारी के साथ आगे रहें। उन कहानियों का आपका प्रवेश द्वार जो हमारी दुनिया को आकार देती हैं।',
    te: 'నిజ సమయ అంతర్దృష్టులతో ముందుండండి. మన ప్రపంచాన్ని రూపొందించే కథల మీ ద్వారం.',
  },
  'home.exploreTrending': {
    en: 'Explore Trending',
    hi: 'ट्रेंडिंग देखें',
    te: 'ట్రెండింగ్ చూడండి',
  },
  'home.subscribeFree': {
    en: 'Subscribe Free',
    hi: 'मुफ्त सदस्यता',
    te: 'ఉచితంగా సబ్‌స్క్రయిబ్ చేయండి',
  },
  'home.scrollToExplore': {
    en: 'Scroll to explore',
    hi: 'देखने के लिए स्क्रॉल करें',
    te: 'అన్వేషించడానికి స్క్రోల్ చేయండి',
  },
  'home.latestStories': {
    en: 'Latest Stories',
    hi: 'नवीनतम कहानियाँ',
    te: 'తాజా కథలు',
  },
  'home.newsFrom': {
    en: 'News from',
    hi: 'समाचार से',
    te: 'వార్తలు నుండి',
  },
  'home.curatedForYou': {
    en: 'Curated For You',
    hi: 'आपके लिए चयनित',
    te: 'మీ కోసం క్యూరేట్ చేయబడింది',
  },
  'home.handpickedNews': {
    en: 'Handpicked news from trusted sources worldwide',
    hi: 'विश्वभर के विश्वसनीय स्रोतों से चुने गए समाचार',
    te: 'ప్రపంచవ్యాప్తంగా విశ్వసనీయ మూలాల నుండి ఎంపిక చేయబడిన వార్తలు',
  },
  'home.loadMore': {
    en: 'Load More Stories',
    hi: 'और कहानियाँ लोड करें',
    te: 'మరిన్ని కథలు లోడ్ చేయండి',
  },
  'home.trendingNow': {
    en: 'Trending Now',
    hi: 'अभी ट्रेंडिंग',
    te: 'ఇప్పుడు ట్రెండింగ్',
  },
  'home.hotStories': {
    en: 'Hot stories everyone is reading',
    hi: 'हर कोई जो गर्म कहानियाँ पढ़ रहा है',
    te: 'అందరూ చదువుతున్న హాట్ కథలు',
  },
  'home.featuredStory': {
    en: 'Featured Story',
    hi: 'फीचर्ड कहानी',
    te: 'ఫీచర్డ్ కథ',
  },

  // Article - Additional
  'article.readArticle': {
    en: 'Read Article',
    hi: 'लेख पढ़ें',
    te: 'వ్యాసం చదవండి',
  },
  'article.readFullStory': {
    en: 'Read Full Story',
    hi: 'पूरी कहानी पढ़ें',
    te: 'పూర్తి కథ చదవండి',
  },
  'article.trending': {
    en: 'Trending',
    hi: 'ट्रेंडिंग',
    te: 'ట్రెండింగ్',
  },
  'article.featured': {
    en: 'Featured',
    hi: 'फीचर्ड',
    te: 'ఫీచర్డ్',
  },
  'article.views': {
    en: 'views',
    hi: 'व्यूज',
    te: 'వీక్షణలు',
  },
  'article.saveArticle': {
    en: 'Save Article',
    hi: 'लेख सेव करें',
    te: 'వ్యాసం సేవ్ చేయండి',
  },
  'article.findOnWeb': {
    en: 'Find on Web',
    hi: 'वेब पर खोजें',
    te: 'వెబ్‌లో కనుగొనండి',
  },
  'article.notFound': {
    en: 'Article not found',
    hi: 'लेख नहीं मिला',
    te: 'వ్యాసం కనుగొనబడలేదు',
  },
  'article.notFoundDesc': {
    en: 'The article you\'re looking for doesn\'t exist.',
    hi: 'आप जो लेख ढूंढ रहे हैं वह मौजूद नहीं है।',
    te: 'మీరు వెతుకుతున్న వ్యాసం ఉనికిలో లేదు.',
  },
  'article.articleSaved': {
    en: 'Article saved!',
    hi: 'लेख सेव हो गया!',
    te: 'వ్యాసం సేవ్ చేయబడింది!',
  },
  'article.removedFromSaved': {
    en: 'Removed from saved',
    hi: 'सेव से हटाया गया',
    te: 'సేవ్ నుండి తొలగించబడింది',
  },
  'article.failedToSave': {
    en: 'Failed to save article',
    hi: 'लेख सेव करने में विफल',
    te: 'వ్యాసాన్ని సేవ్ చేయడంలో విఫలమైంది',
  },
  'article.linkCopied': {
    en: 'Link copied to clipboard!',
    hi: 'लिंक क्लिपबोर्ड पर कॉपी हो गया!',
    te: 'లింక్ క్లిప్‌బోర్డ్‌కి కాపీ చేయబడింది!',
  },

  // Saved Page - Additional
  'saved.backToFeed': {
    en: 'Back to Feed',
    hi: 'फ़ीड पर वापस',
    te: 'ఫీడ్‌కి తిరిగి',
  },
  'saved.savedCount': {
    en: 'saved',
    hi: 'सेव किया गया',
    te: 'సేవ్ చేయబడింది',
  },
  'saved.subtitle': {
    en: 'Your bookmarked stories in one place',
    hi: 'आपकी बुकमार्क की गई कहानियाँ एक ही जगह',
    te: 'మీ బుక్‌మార్క్ చేసిన కథలు ఒకే చోట',
  },
  'saved.articleRemoved': {
    en: 'Article removed from saved',
    hi: 'लेख सेव से हटा दिया गया',
    te: 'వ్యాసం సేవ్ నుండి తొలగించబడింది',
  },
  'saved.failedToRemove': {
    en: 'Failed to remove article',
    hi: 'लेख हटाने में विफल',
    te: 'వ్యాసాన్ని తొలగించడంలో విఫలమైంది',
  },

  // Common - Additional
  'common.back': {
    en: 'Back',
    hi: 'वापस',
    te: 'వెనుకకు',
  },
  'common.today': {
    en: 'Today',
    hi: 'आज',
    te: 'ఈ రోజు',
  },
  'common.filter': {
    en: 'Filter',
    hi: 'फ़िल्टर',
    te: 'ఫిల్టర్',
  },
  'common.tryAgain': {
    en: 'Try Again',
    hi: 'पुनः प्रयास करें',
    te: 'మళ్లీ ప్రయత్నించండి',
  },

  // Footer - Additional
  'footer.tagline': {
    en: 'Your gateway to the stories that shape our world. Stay informed, stay ahead.',
    hi: 'उन कहानियों का आपका प्रवेश द्वार जो हमारी दुनिया को आकार देती हैं। सूचित रहें, आगे रहें।',
    te: 'మన ప్రపంచాన్ని రూపొందించే కథల మీ ద్వారం. సమాచారంతో ఉండండి, ముందుండండి.',
  },
  'footer.allRightsReserved': {
    en: 'All rights reserved.',
    hi: 'सर्वाधिकार सुरक्षित।',
    te: 'అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.',
  },
  'footer.madeWith': {
    en: 'Made with',
    hi: 'के साथ बनाया गया',
    te: 'తో తయారు చేయబడింది',
  },
  'footer.forCuriousMinds': {
    en: 'for the curious minds',
    hi: 'जिज्ञासु मनों के लिए',
    te: 'ఉత్సుక మనసుల కోసం',
  },

  // Admin - Additional
  'admin.addNews': {
    en: 'Add News',
    hi: 'समाचार जोड़ें',
    te: 'వార్త జోడించండి',
  },
  'admin.welcomeBack': {
    en: 'Welcome back',
    hi: 'वापसी पर स्वागत है',
    te: 'తిరిగి స్వాగతం',
  },
  'admin.categoryDistribution': {
    en: 'Category Distribution',
    hi: 'श्रेणी वितरण',
    te: 'వర్గ పంపిణీ',
  },
  'admin.logoutSuccess': {
    en: 'Logged out successfully',
    hi: 'सफलतापूर्वक लॉग आउट हो गया',
    te: 'విజయవంతంగా లాగౌట్ అయింది',
  },
  'admin.accessDenied': {
    en: 'Access Denied',
    hi: 'पहुँच अस्वीकृत',
    te: 'యాక్సెస్ తిరస్కరించబడింది',
  },
  'admin.pleaseLogin': {
    en: 'Please login to access the admin panel.',
    hi: 'एडमिन पैनल तक पहुँचने के लिए लॉगिन करें।',
    te: 'అడ్మిన్ ప్యానెల్ యాక్సెస్ చేయడానికి లాగిన్ చేయండి.',
  },
  'admin.goToLogin': {
    en: 'Go to Login',
    hi: 'लॉगिन पर जाएं',
    te: 'లాగిన్‌కి వెళ్ళండి',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('nebulytix-language');
    return (stored as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('nebulytix-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
