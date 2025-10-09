'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  CheckSquare,
  Users,
  MessageSquare,
  ArrowLeft,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  TrendingUp,
  Smile,
  Zap,
  Globe,
  X,
  Menu,
  Music,
  Rocket,
  Trees,
  Trophy,
  Target,
  ArrowRight,
  Check
} from 'lucide-react'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const programs = [
    {
      icon: Rocket,
      title: 'למידה חדשנית',
      subtitle: 'העתיד כבר כאן',
      description: 'חקר תופעות, למידה מבוססת פרויקטים וחשיבה יזמית שמכינה את הילדים לעולם של מחר',
      features: ['מעבדות מדע ומחקר', 'פרויקטים יזמיים', 'רובוטיקה ותכנות', 'פתרון בעיות יצירתי'],
      gradient: 'from-purple-500 to-pink-500',
      highlight: 'חדש!'
    },
    {
      icon: Globe,
      title: 'אנגלית ברמה עולמית',
      subtitle: 'דוברי שפה אמיתיים',
      description: 'תכנית מורחבת עם דוברי אנגלית שפת אם - הכנה לעולם גלובלי',
      features: ['שיעורים בקבוצות קטנות', 'דיבור ושיחה יומיומית', 'הכנה לבחינות בינלאומיות', 'תרבות ואמנות באנגלית'],
      gradient: 'from-blue-500 to-cyan-500',
      highlight: 'פופולרי'
    },
    {
      icon: Trees,
      title: 'ירוקים באמת',
      subtitle: 'דור אחראי לסביבה',
      description: 'חינוך סביבתי מעשי - מהגינה הקהילתית ועד למנהיגות ירוקה',
      features: ['גינה קהילתית פעילה', 'מיחזור ואקולוגיה', 'מנהיגות ירוקה', 'פרויקטים קהילתיים'],
      gradient: 'from-green-500 to-emerald-500',
      highlight: 'ייחודי'
    },
    {
      icon: Music,
      title: 'אמנות ויצירה',
      subtitle: 'הפיתוח היצירתי',
      description: 'מוזיקה, תיאטרון ואמנות - מפתחים כישורים רגשיים וחברתיים',
      features: ['תזמורת ומקהלה', 'סטודיו לאמנות', 'הצגות ומופעים', 'תערוכות והפקות'],
      gradient: 'from-orange-500 to-amber-500',
      highlight: 'מפתח!'
    }
  ]

  const testimonials = [
    {
      quote: 'הילדים שלי קמים בבוקר עם חיוך! הם אוהבים את בית הספר והמורים המדהימים. התכנית החינוכית פשוט יוצאת דופן.',
      author: 'רותם כהן',
      role: 'הורה לתלמידים בכיתות א׳ ו-ג׳',
      rating: 5
    },
    {
      quote: 'התכנית היזמית והחינוך הסביבתי פיתחו את הבת שלי להיות בעלת חשיבה עצמאית ומודעות חברתית. אני רואה את ההשפעה כל יום!',
      author: 'נועה לוי',
      role: 'הורה לתלמידת כיתה ה׳',
      rating: 5
    },
    {
      quote: 'הגישה האישית לכל תלמיד והדגש על יתרונות אישיים עשו פלאים עם הבן שלי. זה לא רק בית ספר, זה קהילה אמיתית!',
      author: 'דני אברהם',
      role: 'הורה לתלמיד כיתה ד׳',
      rating: 5
    }
  ]

  const enrollmentSteps = [
    {
      step: 1,
      title: 'בואו לבקר',
      description: 'סיור אישי בבית הספר - הכירו את הצוות, הכיתות והאווירה הייחודית',
      icon: Users,
      action: 'קבעו סיור חינם',
      link: 'tel:09-862-4563',
      duration: '45 דקות'
    },
    {
      step: 2,
      title: 'שיחה אישית',
      description: 'פגישה עם מנהלת ביה"ס והצוות - נכיר את הילד ואת הצרכים שלו',
      icon: MessageSquare,
      action: 'קביעת פגישה',
      link: 'mailto:beeri@netanya.muni.il',
      duration: '30 דקות'
    },
    {
      step: 3,
      title: 'הרשמה והצטרפות',
      description: 'מילוי טפסים ואישור קבלה - מתחילים את המסע החינוכי!',
      icon: CheckSquare,
      action: 'מילוי טופס',
      link: 'tel:09-862-4563',
      duration: '15 דקות'
    }
  ]

  const faqs = [
    {
      question: 'מהם שעות הלימודים ואפשרויות הצהרונים?',
      answer: 'בית הספר פועל בימים א׳-ה׳ בין השעות 08:00-16:00. יש צהרונים איכותיים עד 17:00 עם פעילויות העשרה, ארוחת צהריים חמה ומלאה, ושעורים פרטיים. הצהרונים מנוהלים על ידי צוות מנוסה ומוסמך.'
    },
    {
      question: 'איך עובד שירות ההסעות? יש הסעות לכל האזורים?',
      answer: 'כן! יש שירות הסעות מקיף מכל רחבי נתניה - שכונת נוף ים, רמת פולג, קריית השרון ועוד. האוטובוסים מאובטחים ומזוגנים, עם מלווים מוסמכים. ניתן לקבל מידע מפורט על מסלולים, תחנות ומחירים בטלפון.'
    },
    {
      question: 'מה גודל הכיתות והאם יש למידה אישית?',
      answer: 'כיתות של עד 28 תלמידים, עם דגש חזק על למידה מותאמת אישית. כל תלמיד מקבל תשומת לב אישית, תכנית לימודים מותאמת ליכולותיו, ומעקב צמוד של צוות חינוכי מסור. יש גם שיעורי תגבור והעשרה בקבוצות קטנות.'
    },
    {
      question: 'ספרו לי יותר על תכנית האנגלית המורחבת',
      answer: 'התכנית שלנו ייחודית! יש לנו דובר/ת אנגלית שפת אם שמלמדים בשיעורים קטנים (עד 15 תלמידים), דגש על דיבור ושיחה אמיתית, הכנה לבחינות בינלאומיות כמו Cambridge, ופעילויות תרבותיות באנגלית - תיאטרון, מוזיקה וקריאה.'
    },
    {
      question: 'איך אפשר להירשם? מה התהליך?',
      answer: 'פשוט מאוד! (1) התקשרו ל-09-862-4563 או שלחו מייל ל-beeri@netanya.muni.il (2) נקבע סיור חינם בבית הספר (3) פגישה אישית עם הנהלה (4) מילוי טופס הרשמה פשוט. התהליך כולו לוקח כ-שבוע, ואנחנו כאן לענות על כל שאלה!'
    },
    {
      question: 'מה מייחד את בית הספר בארי מבתי ספר אחרים?',
      answer: 'ההבדל הוא בגישה! אנחנו מאמינים שכל ילד הוא ייחודי ויש לו יתרונות משלו. התכנית שלנו משלבת חינוך יזמי, סביבתי ואישי עם טכנולוגיות מתקדמות. יש לנו קהילת הורים פעילה, צוות מסור ומנוסה, ותוצאות מדידות - 85% מהתלמידים שלנו מצטיינים במבחנים ארציים!'
    }
  ]

  const stats = [
    { value: '562', label: 'תלמידים', icon: Users },
    { value: '22', label: 'כיתות', icon: GraduationCap },
    { value: '85', label: 'שנות מצוינות', icon: Award },
    { value: '98%', label: 'שביעות רצון', icon: Smile }
  ]

  return (
    <div className="min-h-screen bg-[#0a0b1a] overflow-x-hidden" dir="rtl">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0a0b1a]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FFD659] to-[#FFB020] flex items-center justify-center shadow-lg shadow-[#FFD659]/20">
                <GraduationCap className="w-6 h-6 text-[#0a0b1a]" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">בית ספר בארי</h1>
                <p className="text-xs text-[#FFD659] font-semibold">נתניה</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#programs" className="text-sm font-semibold text-white/70 hover:text-[#FFD659] transition-all duration-300">התכניות</a>
              <a href="#testimonials" className="text-sm font-semibold text-white/70 hover:text-[#FFD659] transition-all duration-300">המלצות</a>
              <a href="#enrollment" className="text-sm font-semibold text-white/70 hover:text-[#FFD659] transition-all duration-300">הרשמה</a>
              <a href="#faq" className="text-sm font-semibold text-white/70 hover:text-[#FFD659] transition-all duration-300">שאלות</a>
              <a
                href="tel:09-862-4563"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFD659] to-[#FFB020] text-[#0a0b1a] px-6 py-2.5 rounded-full text-sm font-black hover:scale-105 transition-all duration-300 shadow-lg shadow-[#FFD659]/25 hover:shadow-[#FFD659]/40"
              >
                <Phone className="w-4 h-4" />
                התקשרו עכשיו
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#15162c]/98 backdrop-blur-2xl border-t border-white/5">
            <div className="px-6 py-8 space-y-4">
              <a href="#programs" className="block py-3 text-base font-semibold text-white/70 hover:text-[#FFD659] transition-colors" onClick={() => setMobileMenuOpen(false)}>התכניות</a>
              <a href="#testimonials" className="block py-3 text-base font-semibold text-white/70 hover:text-[#FFD659] transition-colors" onClick={() => setMobileMenuOpen(false)}>המלצות</a>
              <a href="#enrollment" className="block py-3 text-base font-semibold text-white/70 hover:text-[#FFD659] transition-colors" onClick={() => setMobileMenuOpen(false)}>הרשמה</a>
              <a href="#faq" className="block py-3 text-base font-semibold text-white/70 hover:text-[#FFD659] transition-colors" onClick={() => setMobileMenuOpen(false)}>שאלות</a>
              <a
                href="tel:09-862-4563"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFD659] to-[#FFB020] text-[#0a0b1a] px-8 py-4 rounded-full text-base font-black mt-6 shadow-lg shadow-[#FFD659]/30"
              >
                <Phone className="w-5 h-5" />
                התקשרו עכשיו
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b1a] via-[#15162c] to-[#0a0b1a]" />

        {/* Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div
            className="absolute top-20 -right-20 w-96 h-96 rounded-full bg-[#FFD659]/30 mix-blend-screen filter blur-[120px] animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div
            className="absolute bottom-20 -left-20 w-96 h-96 rounded-full bg-[#FFB020]/20 mix-blend-screen filter blur-[120px] animate-pulse"
            style={{ animationDelay: '2s', transform: `translateY(${scrollY * 0.2}px)` }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-32 z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-xl">
              <Sparkles className="w-4 h-4 text-[#FFD659]" />
              <span className="text-sm font-bold text-white">בית הספר הכי חדשני במרכז נתניה</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight">
                בית ספר
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD659] via-[#FFB020] to-[#FFD659] bg-[length:200%_auto] animate-gradient">
                  בארי
                </span>
              </h1>

              <p className="text-2xl sm:text-3xl lg:text-4xl text-white/90 font-bold max-w-4xl mx-auto leading-tight">
                מקום שבו כל ילד <span className="text-[#FFD659]">מגלה</span> את היתרונות שלו
              </p>

              <p className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                חינוך חדשני • חשיבה יזמית • העצמה אישית
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <a
                href="tel:09-862-4563"
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-[#FFD659] to-[#FFB020] text-[#0a0b1a] px-10 py-5 rounded-xl text-lg font-black hover:scale-105 transition-all duration-300 shadow-2xl shadow-[#FFD659]/30 hover:shadow-[#FFD659]/50"
              >
                <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                קבעו סיור חינם
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full">
                  חינם!
                </div>
              </a>

              <a
                href="#programs"
                className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md text-white px-10 py-5 rounded-xl text-lg font-bold hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-[#FFD659]/30 hover:scale-105"
              >
                התכניות שלנו
                <ArrowLeft className="w-5 h-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#FFD659]/30 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                  >
                    <Icon className="w-8 h-8 text-[#FFD659] mx-auto mb-3 group-hover:scale-110 transition-transform" strokeWidth={2} />
                    <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-white/60 font-semibold">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-white/40 font-semibold">גללו למטה</span>
            <ChevronDown className="w-6 h-6 text-white/40" />
          </div>
        </div>
      </div>

      {/* Programs Section */}
      <div id="programs" className="relative py-32 bg-[#15162c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 mb-6">
              <Star className="w-4 h-4 text-[#FFD659] fill-[#FFD659]" />
              <span className="text-sm font-bold text-[#FFD659]">התכניות החינוכיות שלנו</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
              למידה שמעניינת ומרתקת
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              תכניות חדשניות שמפתחות יצירתיות, חשיבה עצמאית ואהבת למידה
            </p>
          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {programs.map((program, index) => {
              const Icon = program.icon
              return (
                <div
                  key={index}
                  className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Gradient Top Border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${program.gradient}`} />

                  {/* Highlight Badge */}
                  {program.highlight && (
                    <div className={`absolute top-6 left-6 bg-gradient-to-r ${program.gradient} text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg`}>
                      {program.highlight}
                    </div>
                  )}

                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${program.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
                      <Icon className="w-10 h-10 text-white" strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="text-xs font-black text-white/40 uppercase tracking-wider mb-2">
                        {program.subtitle}
                      </div>
                      <h3 className="text-2xl font-black text-white mb-4">{program.title}</h3>
                      <p className="text-white/60 mb-6 leading-relaxed">{program.description}</p>

                      {/* Features */}
                      <div className="space-y-3">
                        {program.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3 group/item">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${program.gradient} group-hover/item:scale-150 transition-transform`} />
                            <span className="text-sm text-white/70 font-medium group-hover/item:text-white transition-colors">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className={`absolute -bottom-20 -right-20 w-48 h-48 bg-gradient-to-tl ${program.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500 rounded-full blur-3xl`} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="relative py-32 bg-[#0a0b1a] overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6">
              מה הורים אומרים?
            </h2>
            <p className="text-2xl text-white/60 font-semibold">
              הורים מרוצים = ילדים מאושרים
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  currentTestimonial === index
                    ? 'opacity-100 scale-100 relative'
                    : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'
                }`}
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 shadow-2xl">
                  {/* Stars */}
                  <div className="flex gap-2 mb-8 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-8 h-8 fill-[#FFD659] text-[#FFD659]" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white text-2xl sm:text-3xl mb-8 leading-relaxed text-center font-medium italic">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="text-center">
                    <p className="text-white font-black text-xl mb-1">{testimonial.author}</p>
                    <p className="text-white/60 text-sm font-semibold">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Carousel Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`transition-all duration-300 rounded-full ${
                    currentTestimonial === index
                      ? 'w-12 h-3 bg-[#FFD659]'
                      : 'w-3 h-3 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Process */}
      <div id="enrollment" className="relative py-32 bg-[#15162c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6">
              איך מצטרפים?
            </h2>
            <p className="text-xl text-white/60">
              3 שלבים פשוטים למשפחת בארי
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {enrollmentSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative group">
                  {/* Connector Line (Desktop only) */}
                  {index < enrollmentSteps.length - 1 && (
                    <div className="hidden md:block absolute top-16 right-0 w-full h-px bg-gradient-to-l from-[#FFD659]/20 via-[#FFD659]/5 to-transparent -z-10" style={{ right: '-50%' }} />
                  )}

                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-[#FFD659]/30 transition-all duration-500 hover:-translate-y-2 text-center">
                    {/* Icon with Step Number */}
                    <div className="relative inline-block mb-8">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD659] to-[#FFB020] flex items-center justify-center shadow-xl shadow-[#FFD659]/30 group-hover:scale-110 transition-transform">
                        <Icon className="w-12 h-12 text-[#0a0b1a]" strokeWidth={2} />
                      </div>
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#0a0b1a] border-4 border-[#FFD659] flex items-center justify-center text-[#FFD659] font-black text-xl shadow-xl">
                        {step.step}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="text-xs font-black text-white/40 uppercase tracking-wider mb-3">
                      {step.duration}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-black text-white mb-4">{step.title}</h3>

                    {/* Description */}
                    <p className="text-white/60 mb-8 leading-relaxed">{step.description}</p>

                    {/* Action Button */}
                    <a
                      href={step.link}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFD659] to-[#FFB020] text-[#0a0b1a] px-8 py-4 rounded-full font-black hover:scale-105 transition-all duration-300 shadow-xl shadow-[#FFD659]/30 hover:shadow-[#FFD659]/50"
                    >
                      <Send className="w-5 h-5" />
                      {step.action}
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="relative py-32 bg-[#0a0b1a]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6">
              שאלות נפוצות
            </h2>
            <p className="text-xl text-white/60">
              התשובות לכל מה ששאלתם
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-right hover:bg-white/5 transition-colors group"
                >
                  <span className="text-lg font-bold text-white flex-1 group-hover:text-[#FFD659] transition-colors">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 mr-4 w-10 h-10 rounded-full bg-white/5 group-hover:bg-[#FFD659]/20 flex items-center justify-center transition-all border border-white/10">
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-[#FFD659]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white/60 group-hover:text-[#FFD659]" />
                    )}
                  </div>
                </button>

                {openFaq === index && (
                  <div className="px-6 pb-6 text-white/70 leading-relaxed border-t border-white/10 pt-6 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative py-32 bg-[#15162c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6">
              בואו לבקר!
            </h2>
            <p className="text-xl text-white/60">
              נשמח לראותכם ולענות על כל שאלה
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="tel:09-862-4563"
              className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 border border-white/10 hover:border-[#FFD659]/30"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD659] to-[#FFB020] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-[#FFD659]/30">
                <Phone className="w-10 h-10 text-[#0a0b1a]" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">התקשרו אלינו</h3>
              <p className="text-[#FFD659] text-3xl font-black mb-2" dir="ltr">09-862-4563</p>
              <p className="text-white/60 text-sm font-semibold mb-4">ימים א׳-ה׳ • 08:00-16:00</p>
              <div className="inline-flex items-center gap-2 text-[#FFD659] font-bold text-sm">
                קבעו סיור <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            <a
              href="mailto:beeri@netanya.muni.il"
              className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 border border-white/10 hover:border-[#FFD659]/30"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD659] to-[#FFB020] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-[#FFD659]/30">
                <Mail className="w-10 h-10 text-[#0a0b1a]" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">שלחו מייל</h3>
              <p className="text-white/90 text-lg font-black mb-2 break-all">beeri@netanya.muni.il</p>
              <p className="text-white/60 text-sm font-semibold mb-4">מענה תוך 24 שעות</p>
              <div className="inline-flex items-center gap-2 text-[#FFD659] font-bold text-sm">
                שאלו אותנו <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            <a
              href="https://www.google.com/maps?q=בר+אילן+12+נתניה"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 border border-white/10 hover:border-[#FFD659]/30"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD659] to-[#FFB020] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-[#FFD659]/30">
                <MapPin className="w-10 h-10 text-[#0a0b1a]" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">בואו אלינו</h3>
              <p className="text-white text-xl font-black mb-2">רחוב בר אילן 12</p>
              <p className="text-white/70 text-lg font-semibold mb-4">נתניה • מרכז העיר</p>
              <div className="inline-flex items-center gap-2 bg-[#FFD659]/20 text-[#FFD659] px-6 py-3 rounded-full font-bold hover:bg-[#FFD659]/30 transition-colors text-sm">
                פתח במפות <Target className="w-4 h-4" />
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative py-40 bg-[#0a0b1a] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFD659] rounded-full mix-blend-screen filter blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFB020] rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-5 py-3 rounded-full text-white text-sm font-black mb-8 border border-[#FFD659]/20">
            <Clock className="w-5 h-5 text-[#FFD659]" />
            ההרשמה לשנה הבאה פתוחה עכשיו!
          </div>

          <h2 className="text-5xl sm:text-7xl font-black text-white mb-8 leading-tight">
            תנו לילדים שלכם את<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD659] via-[#FFB020] to-[#FFD659]">
              החינוך שמגיע להם!
            </span>
          </h2>

          <p className="text-xl sm:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            הצטרפו למשפחת בארי - מקום שבו כל ילד מקבל את תשומת הלב, התמיכה והכלים להצליח בחיים
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-10">
            <a
              href="tel:09-862-4563"
              className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#FFD659] to-[#FFB020] text-[#0a0b1a] px-12 py-6 rounded-xl text-2xl font-black hover:scale-105 transition-all duration-300 shadow-2xl shadow-[#FFD659]/30 hover:shadow-[#FFD659]/50"
            >
              <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              התקשרו עכשיו
            </a>

            <Link
              href="/he"
              className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md text-white px-12 py-6 rounded-xl text-2xl font-black hover:bg-white/15 transition-all duration-300 border-2 border-white/20 hover:scale-105"
            >
              <Users className="w-6 h-6" />
              פורטל ההורים
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-white/60">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#FFD659]" strokeWidth={3} />
              <span className="font-semibold">סיור חינם</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#FFD659]" strokeWidth={3} />
              <span className="font-semibold">פגישה אישית</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#FFD659]" strokeWidth={3} />
              <span className="font-semibold">מענה מיידי</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heritage Section */}
      <div className="relative py-32 bg-[#15162c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 mb-6">
              <Award className="w-4 h-4 text-[#FFD659]" />
              <span className="text-sm font-bold text-[#FFD659]">מורשת של מצוינות</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6">
              85 שנות חינוך
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              מאז 1938 - מחנכים דורות של ילדים לערכים, יוזמה ומצוינות
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-[#FFD659]/30 transition-all hover:-translate-y-2">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-black text-white mb-3">1938 - ההתחלה</h3>
              <p className="text-white/60 leading-relaxed">
                נוסד כבית ספר ייחודי על בסיס ערכי תנועת העבודה - כבוד הזולת, צניעות, עזרה הדדית והתנדבות.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-[#FFD659]/30 transition-all hover:-translate-y-2">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-2xl font-black text-white mb-3">חינוך חדשני</h3>
              <p className="text-white/60 leading-relaxed">
                דגש על חינוך מעשי - גינה חקלאית, מלאכה, והכנה לחיים - מסורת שנמשכת גם היום בגישה היזמית שלנו.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-[#FFD659]/30 transition-all hover:-translate-y-2">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-black text-white mb-3">2025 - העתיד</h3>
              <p className="text-white/60 leading-relaxed">
                ממשיכים את המורשת עם טכנולוגיות מתקדמות, אנגלית ברמה עולמית, וחינוך סביבתי לדור הבא.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FFD659]/10 to-[#FFB020]/5 backdrop-blur-xl rounded-3xl p-10 text-center border border-[#FFD659]/20">
            <blockquote className="text-2xl sm:text-3xl text-white font-semibold italic mb-4">
              "חינוך שמשלב מסורת עשירה עם חדשנות מודרנית"
            </blockquote>
            <p className="text-white/60">
              מבית ספר קטן של ילדי עובדים ב-1938, לבית ספר מוביל עם 562 תלמידים ב-22 כיתות ב-2025
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a0b1a] text-white/40 py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD659] to-[#FFB020] flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-[#0a0b1a]" />
                </div>
                <div>
                  <h3 className="text-white font-black text-2xl">בית ספר בארי</h3>
                  <p className="text-white/40 text-sm">נתניה • מאז 1938</p>
                </div>
              </div>
              <p className="leading-relaxed mb-4">
                85 שנות מצוינות חינוכית - מסורת של ערכים, יוזמה ומחויבות לחברה. ממשיכים את המורשת עם חינוך חדשני המפתח לומדים עצמאיים ובעלי יוזמה.
              </p>
              <p className="text-sm text-white/30">
                מאז 1938 מחנכים דורות של ילדים בערכי כבוד הזולת, צניעות, עזרה הדדית והתנדבות.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">קישורים מהירים</h3>
              <div className="space-y-3 text-sm">
                <Link href="/he" className="block hover:text-white transition-colors hover:translate-x-1 transform">פורטל ההורים</Link>
                <Link href="/he/calendar" className="block hover:text-white transition-colors hover:translate-x-1 transform">לוח אירועים</Link>
                <Link href="/he/committees" className="block hover:text-white transition-colors hover:translate-x-1 transform">ועדי הורים</Link>
                <Link href="/he/feedback" className="block hover:text-white transition-colors hover:translate-x-1 transform">משוב והצעות</Link>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">יצירת קשר</h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FFD659]" />
                  רחוב בר אילן 12, נתניה
                </p>
                <a href="tel:09-862-4563" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-[#FFD659]" />
                  <span dir="ltr">09-862-4563</span>
                </a>
                <a href="mailto:beeri@netanya.muni.il" className="flex items-center gap-2 hover:text-white transition-colors break-all">
                  <Mail className="w-4 h-4 text-[#FFD659]" />
                  beeri@netanya.muni.il
                </a>
                <p className="text-xs text-white/20 mt-4 pt-4 border-t border-white/10">
                  קוד מוסד: 411371 | זרם: ממלכתי
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} בית ספר בארי, נתניה. כל הזכויות שמורות.</p>
            <p className="text-xs text-white/30 mt-2">נבנה באהבה למען הדור הבא</p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
