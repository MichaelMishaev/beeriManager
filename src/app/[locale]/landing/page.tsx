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
  Target
} from 'lucide-react'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const programs = [
    {
      icon: Rocket,
      title: 'למידה חדשנית',
      subtitle: 'העתיד כבר כאן',
      description: 'חקר תופעות, למידה מבוססת פרויקטים וחשיבה יזמית שמכינה את הילדים לעולם של מחר',
      features: ['מעבדות מדע ומחקר', 'פרויקטים יזמיים', 'רובוטיקה ותכנות', 'פתרון בעיות יצירתי'],
      color: 'from-purple-600 via-pink-500 to-red-500',
      highlight: 'חדש!'
    },
    {
      icon: Globe,
      title: 'אנגלית ברמה עולמית',
      subtitle: 'דוברי שפה אמיתיים',
      description: 'תכנית מורחבת עם דוברי אנגלית שפת אם - הכנה לעולם גלובלי',
      features: ['שיעורים בקבוצות קטנות', 'דיבור ושיחה יומיומית', 'הכנה לבחינות בינלאומיות', 'תרבות ואמנות באנגלית'],
      color: 'from-blue-600 via-cyan-500 to-teal-500',
      highlight: 'פופולרי'
    },
    {
      icon: Trees,
      title: 'ירוקים באמת',
      subtitle: 'דור אחראי לסביבה',
      description: 'חינוך סביבתי מעשי - מהגינה הקהילתית ועד למנהיגות ירוקה',
      features: ['גינה קהילתית פעילה', 'מיחזור ואקולוגיה', 'מנהיגות ירוקה', 'פרויקטים קהילתיים'],
      color: 'from-green-600 via-emerald-500 to-lime-500',
      highlight: 'ייחודי'
    },
    {
      icon: Music,
      title: 'אמנות ויצירה',
      subtitle: 'הפיתוח היצירתי',
      description: 'מוזיקה, תיאטרון ואמנות - מפתחים כישורים רגשיים וחברתיים',
      features: ['תזמורת ומקהלה', 'סטודיו לאמנות', 'הצגות ומופעים', 'תערוכות והפקות'],
      color: 'from-orange-600 via-amber-500 to-yellow-500',
      highlight: 'מפתח!'
    }
  ]

  const testimonials = [
    {
      quote: 'הילדים שלי קמים בבוקר עם חיוך! הם אוהבים את בית הספר והמורים המדהימים. התכנית החינוכית פשוט יוצאת דופן.',
      author: 'רותם כהן',
      role: 'הורה לתלמידים בכיתות א׳ ו-ג׳',
      rating: 5,
      image: '👨‍👩‍👧‍👦'
    },
    {
      quote: 'התכנית היזמית והחינוך הסביבתי פיתחו את הבת שלי להיות בעלת חשיבה עצמאית ומודעות חברתית. אני רואה את ההשפעה כל יום!',
      author: 'נועה לוי',
      role: 'הורה לתלמידת כיתה ה׳',
      rating: 5,
      image: '👩‍👧'
    },
    {
      quote: 'הגישה האישית לכל תלמיד והדגש על יתרונות אישיים עשו פלאים עם הבן שלי. זה לא רק בית ספר, זה קהילה אמיתית!',
      author: 'דני אברהם',
      role: 'הורה לתלמיד כיתה ד׳',
      rating: 5,
      image: '👨‍👦'
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

  const achievements = [
    { icon: Award, label: 'מצוינות', value: 'משרד החינוך', color: 'text-yellow-500' },
    { icon: TrendingUp, label: 'שיפור', value: '+15% הישגים', color: 'text-green-500' },
    { icon: Smile, label: 'שביעות רצון', value: '98% הורים', color: 'text-blue-500' },
    { icon: Trophy, label: 'מצטיינים', value: '85% תלמידים', color: 'text-purple-500' }
  ]

  const whyChooseUs = [
    { icon: '🎯', title: '562 תלמידים מאושרים', desc: 'קהילה תומכת ומגוונת' },
    { icon: '🌍', title: 'אנגלית עם דוברי שפת אם', desc: 'רמה עולמית אמיתית' },
    { icon: '🚀', title: 'חינוך יזמי וסביבתי', desc: 'מכינים לעתיד' },
    { icon: '👥', title: '22 כיתות קטנות', desc: 'למידה מותאמת אישית' },
    { icon: '🎨', title: 'העשרה מגוונת', desc: 'מוזיקה, אמנות, ספורט' },
    { icon: '💚', title: 'קהילת הורים פעילה', desc: 'שותפים אמיתיים' }
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D98BA] to-[#003153] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900">בית ספר בארי</h1>
                <p className="text-xs text-slate-600">נתניה</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#programs" className="text-sm font-semibold text-slate-700 hover:text-[#0D98BA] transition-colors">התכניות</a>
              <a href="#testimonials" className="text-sm font-semibold text-slate-700 hover:text-[#0D98BA] transition-colors">המלצות</a>
              <a href="#enrollment" className="text-sm font-semibold text-slate-700 hover:text-[#0D98BA] transition-colors">הרשמה</a>
              <a href="#faq" className="text-sm font-semibold text-slate-700 hover:text-[#0D98BA] transition-colors">שאלות</a>
              <a
                href="tel:09-862-4563"
                className="inline-flex items-center gap-2 bg-[#FFBA00] text-[#003153] px-6 py-2.5 rounded-full text-sm font-black hover:bg-[#FF8200] transition-all hover:scale-105 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                התקשרו עכשיו
              </a>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 shadow-xl">
            <div className="px-4 py-4 space-y-3">
              <a href="#programs" className="block py-2 text-sm font-semibold text-slate-700" onClick={() => setMobileMenuOpen(false)}>התכניות</a>
              <a href="#testimonials" className="block py-2 text-sm font-semibold text-slate-700" onClick={() => setMobileMenuOpen(false)}>המלצות</a>
              <a href="#enrollment" className="block py-2 text-sm font-semibold text-slate-700" onClick={() => setMobileMenuOpen(false)}>הרשמה</a>
              <a href="#faq" className="block py-2 text-sm font-semibold text-slate-700" onClick={() => setMobileMenuOpen(false)}>שאלות</a>
              <a
                href="tel:09-862-4563"
                className="flex items-center justify-center gap-2 bg-[#FFBA00] text-[#003153] px-6 py-3 rounded-full text-sm font-black mt-4"
              >
                <Phone className="w-4 h-4" />
                התקשרו עכשיו
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Parallax */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background Layers */}
        <div
          className="absolute inset-0 bg-gradient-to-bl from-[#003153] via-[#0D98BA] to-[#87CEEB]"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-20 right-10 w-96 h-96 bg-[#FFBA00] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
            style={{ transform: `translateY(${scrollY * 0.3}px) rotate(${scrollY * 0.1}deg)` }}
          />
          <div
            className="absolute top-40 left-10 w-96 h-96 bg-[#FF8200] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
            style={{ transform: `translateY(${scrollY * 0.2}px) rotate(${-scrollY * 0.1}deg)` }}
          />
          <div
            className="absolute -bottom-20 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
            style={{ transform: `translateY(${scrollY * 0.4}px)` }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-right space-y-8">
              <div
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-white text-sm font-bold border border-white/30 shadow-xl"
                style={{ transform: `translateY(${scrollY * 0.1}px)` }}
              >
                <Sparkles className="w-5 h-5 text-[#FFBA00] animate-pulse" />
                בית הספר הכי חדשני במרכז נתניה
              </div>

              <div style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
                <h1 className="text-6xl sm:text-8xl font-black text-white mb-6 leading-none tracking-tight">
                  בית ספר<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFBA00] via-[#FF8200] to-[#FFBA00] animate-gradient-x">
                    בארי
                  </span>
                </h1>

                <p className="text-2xl sm:text-3xl text-white font-bold mb-4 leading-tight">
                  מקום שבו כל ילד <span className="text-[#FFBA00]">מגלה</span><br />
                  את היתרונות שלו ✨
                </p>

                <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  חינוך חדשני • חשיבה יזמית • העצמה אישית<br />
                  הילדים שלכם ילמדו <span className="font-bold text-[#FFBA00]">לחשוב, ליצור ולהוביל!</span>
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="tel:09-862-4563"
                  className="group relative inline-flex items-center justify-center gap-3 bg-[#FFBA00] text-[#003153] px-10 py-5 rounded-2xl text-xl font-black hover:bg-[#FF8200] transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-orange-500/50 border-4 border-white/30"
                >
                  <Phone className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                  <div>
                    <div>קבעו סיור חינם</div>
                    <div className="text-xs font-normal opacity-90">09-862-4563</div>
                  </div>
                  <div className="absolute -top-3 -left-3 bg-red-500 text-white text-sm font-black px-4 py-1 rounded-full animate-bounce shadow-lg">
                    חינם!
                  </div>
                </a>

                <a
                  href="#programs"
                  className="inline-flex items-center justify-center gap-3 bg-white/20 backdrop-blur-md text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white/30 transition-all duration-300 border-3 border-white/40 hover:scale-105"
                >
                  <Rocket className="w-7 h-7" />
                  התכניות שלנו
                </a>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon
                  return (
                    <div
                      key={index}
                      className="bg-white/15 backdrop-blur-lg rounded-2xl p-5 border border-white/30 hover:bg-white/25 transition-all hover:scale-105 cursor-pointer shadow-xl"
                      style={{ transform: `translateY(${scrollY * 0.02}px)` }}
                    >
                      <Icon className={`w-10 h-10 ${achievement.color} mx-auto mb-3`} strokeWidth={2.5} />
                      <div className="text-white font-black text-lg mb-1">{achievement.value}</div>
                      <div className="text-white/80 text-xs font-semibold">{achievement.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Content - Why Choose Us */}
            <div
              className="hidden lg:block"
              style={{ transform: `translateY(${scrollY * 0.08}px)` }}
            >
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border-2 border-white/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFBA00] to-[#FF8200] flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-3xl font-black text-white">למה בארי?</h3>
                </div>

                <div className="space-y-5">
                  {whyChooseUs.map((item, index) => (
                    <div key={index} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                      <div className="text-4xl flex-shrink-0 transform group-hover:scale-125 transition-transform">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-lg mb-1 group-hover:text-[#FFBA00] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-white/80 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-10 h-10 text-white/60" />
        </div>
      </div>

      {/* Programs Section */}
      <div id="programs" className="py-24 bg-gradient-to-b from-white via-slate-50 to-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0D98BA] to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-5 py-2.5 rounded-full text-purple-700 text-sm font-black mb-6 shadow-lg">
              <Star className="w-5 h-5 fill-purple-500 text-purple-500" />
              התכניות החינוכיות שלנו
            </div>
            <h2 className="text-5xl sm:text-6xl font-black text-slate-900 mb-6 leading-tight">
              למידה שמעניינת<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D98BA] to-[#003153]">ומרתקת!</span>
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              תכניות חדשניות שמפתחות יצירתיות, חשיבה עצמאית ואהבת למידה 🚀
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program, index) => {
              const Icon = program.icon
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-slate-100 hover:border-transparent overflow-hidden"
                >
                  {/* Top Gradient Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${program.color}`} />

                  {/* Highlight Badge */}
                  {program.highlight && (
                    <div className={`absolute top-6 left-6 bg-gradient-to-r ${program.color} text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg`}>
                      {program.highlight}
                    </div>
                  )}

                  <div className="flex items-start gap-6">
                    <div className={`flex-shrink-0 w-20 h-20 rounded-3xl bg-gradient-to-br ${program.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                      <Icon className="w-11 h-11 text-white" strokeWidth={2.5} />
                    </div>

                    <div className="flex-1 pt-2">
                      <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                        {program.subtitle}
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 mb-4">{program.title}</h3>
                      <p className="text-slate-600 mb-6 leading-relaxed text-lg">{program.description}</p>

                      <div className="space-y-3">
                        {program.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3 group/item">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${program.color} group-hover/item:scale-150 transition-transform`} />
                            <span className="text-slate-700 font-medium group-hover/item:text-slate-900 group-hover/item:translate-x-1 transition-all">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hover Corner Accent */}
                  <div className={`absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl ${program.color} opacity-0 group-hover:opacity-10 transition-all duration-500 rounded-tl-full`} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Testimonials Carousel */}
      <div id="testimonials" className="py-24 bg-gradient-to-br from-[#003153] via-[#0D98BA] to-[#003153] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6">
              מה הורים אומרים? 💬
            </h2>
            <p className="text-2xl text-sky-100 font-semibold">
              הורים מרוצים = ילדים מאושרים
            </p>
          </div>

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
                <div className="bg-white/15 backdrop-blur-2xl rounded-3xl p-12 border-2 border-white/30 shadow-2xl">
                  <div className="flex gap-2 mb-6 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-8 h-8 fill-[#FFBA00] text-[#FFBA00]" />
                    ))}
                  </div>

                  <p className="text-white text-2xl sm:text-3xl mb-8 leading-relaxed text-center italic font-medium">
                    "{testimonial.quote}"
                  </p>

                  <div className="flex items-center justify-center gap-4">
                    <div className="text-5xl">{testimonial.image}</div>
                    <div className="text-right">
                      <p className="text-white font-black text-xl">{testimonial.author}</p>
                      <p className="text-sky-200 text-sm font-semibold">{testimonial.role}</p>
                    </div>
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
                      ? 'w-12 h-3 bg-[#FFBA00]'
                      : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Process */}
      <div id="enrollment" className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFBA00] to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-black text-slate-900 mb-6">
              איך מצטרפים? 🎯
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600">
              3 שלבים פשוטים למשפחת בארי
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {enrollmentSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative group">
                  {/* Connector Line */}
                  {index < enrollmentSteps.length - 1 && (
                    <div className="hidden md:block absolute top-20 right-0 w-full h-1 bg-gradient-to-l from-[#0D98BA] via-[#87CEEB] to-transparent -z-10" style={{ right: '-50%' }} />
                  )}

                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-10 border-3 border-slate-200 hover:border-[#0D98BA] transition-all duration-500 hover:shadow-2xl text-center group-hover:-translate-y-2">
                    <div className="relative inline-block mb-8">
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#0D98BA] to-[#003153] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Icon className="w-14 h-14 text-white" strokeWidth={2} />
                      </div>
                      <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-[#FFBA00] to-[#FF8200] flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-xl animate-pulse">
                        {step.step}
                      </div>
                    </div>

                    <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                      {step.duration}
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4">{step.title}</h3>
                    <p className="text-slate-600 mb-8 leading-relaxed text-lg">{step.description}</p>

                    <a
                      href={step.link}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FFBA00] to-[#FF8200] text-white px-8 py-4 rounded-full font-black hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg"
                    >
                      <Send className="w-6 h-6" />
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
      <div id="faq" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-black text-slate-900 mb-6">
              שאלות נפוצות ❓
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600">
              התשובות לכל מה ששאלתם
            </p>
          </div>

          <div className="space-y-5">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-slate-100 hover:border-[#0D98BA]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-8 text-right hover:bg-slate-50 transition-colors group"
                >
                  <span className="text-xl font-black text-slate-900 flex-1 group-hover:text-[#0D98BA] transition-colors">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 mr-6 w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#0D98BA] flex items-center justify-center transition-all">
                    {openFaq === index ? (
                      <ChevronUp className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                    )}
                  </div>
                </button>

                {openFaq === index && (
                  <div className="px-8 pb-8 text-slate-700 leading-relaxed border-t-2 border-slate-100 pt-6 text-lg animate-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-black text-slate-900 mb-6">
              בואו לבקר! 👋
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600">
              נשמח לראותכם ולענות על כל שאלה
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a
              href="tel:09-862-4563"
              className="group bg-gradient-to-br from-[#0D98BA] to-[#003153] rounded-3xl p-10 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <Phone className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">התקשרו אלינו</h3>
                <p className="text-sky-100 text-3xl font-black mb-3" dir="ltr">09-862-4563</p>
                <p className="text-sky-200 text-sm font-semibold">ימים א׳-ה׳ • 08:00-16:00</p>
                <div className="mt-6 inline-flex items-center gap-2 text-[#FFBA00] font-black text-lg">
                  קבעו סיור <ArrowLeft className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </a>

            <a
              href="mailto:beeri@netanya.muni.il"
              className="group bg-gradient-to-br from-[#FFBA00] to-[#FF8200] rounded-3xl p-10 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <Mail className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">שלחו מייל</h3>
                <p className="text-white/90 text-lg font-black mb-3 break-all">beeri@netanya.muni.il</p>
                <p className="text-white/80 text-sm font-semibold">מענה תוך 24 שעות</p>
                <div className="mt-6 inline-flex items-center gap-2 text-[#003153] font-black text-lg">
                  שאלו אותנו <ArrowLeft className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </a>

            <a
              href="https://www.google.com/maps?q=בר+אילן+12+נתניה"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-10 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <MapPin className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">בואו אלינו</h3>
                <p className="text-slate-200 text-xl font-black mb-2">רחוב בר אילן 12</p>
                <p className="text-slate-300 text-lg font-semibold mb-6">נתניה • מרכז העיר</p>
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-full font-black hover:bg-white/30 transition-colors shadow-lg">
                  פתח במפות <Target className="w-5 h-5" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative py-32 bg-gradient-to-r from-[#003153] via-[#0D98BA] to-[#003153] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFBA00] rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF8200] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white text-sm font-black mb-8 border border-white/30 shadow-xl animate-pulse">
            <Clock className="w-5 h-5 text-[#FFBA00]" />
            ההרשמה לשנה הבאה פתוחה עכשיו!
          </div>

          <h2 className="text-5xl sm:text-7xl font-black text-white mb-8 leading-tight">
            תנו לילדים שלכם את<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFBA00] via-[#FF8200] to-[#FFBA00]">
              החינוך שמגיע להם!
            </span>
          </h2>

          <p className="text-2xl sm:text-3xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed font-semibold">
            הצטרפו למשפחת בארי - מקום שבו כל ילד מקבל את תשומת הלב,<br className="hidden sm:block" />
            התמיכה והכלים להצליח בחיים 🌟
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
            <a
              href="tel:09-862-4563"
              className="group inline-flex items-center justify-center gap-4 bg-[#FFBA00] text-[#003153] px-14 py-7 rounded-2xl text-2xl font-black hover:bg-[#FF8200] transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-orange-500/50"
            >
              <Phone className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              <div className="text-right">
                <div>התקשרו עכשיו</div>
                <div className="text-sm font-normal opacity-90">09-862-4563</div>
              </div>
            </a>

            <Link
              href="/he"
              className="inline-flex items-center justify-center gap-4 bg-white/20 backdrop-blur-md text-white px-14 py-7 rounded-2xl text-2xl font-black hover:bg-white/30 transition-all duration-300 border-3 border-white/40 hover:scale-105 shadow-xl"
            >
              <Users className="w-8 h-8" />
              פורטל ההורים
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-white/90 text-lg">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-[#FFBA00]" strokeWidth={3} />
              <span className="font-bold">סיור חינם</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-[#FFBA00]" strokeWidth={3} />
              <span className="font-bold">פגישה אישית</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-[#FFBA00]" strokeWidth={3} />
              <span className="font-bold">מענה מיידי</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heritage Section */}
      <div className="py-20 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#003153] to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#003153]/10 px-5 py-2.5 rounded-full text-[#003153] text-sm font-black mb-6 shadow-lg">
              <Award className="w-5 h-5" />
              מורשת של מצוינות
            </div>
            <h2 className="text-5xl sm:text-6xl font-black text-slate-900 mb-6">
              85 שנות חינוך 🎓
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto">
              מאז 1938 - מחנכים דורות של ילדים לערכים, יוזמה ומצוינות
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-slate-100 hover:border-[#0D98BA] transition-all hover:shadow-xl">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">1938 - ההתחלה</h3>
              <p className="text-slate-600 leading-relaxed">
                נוסד כבית ספר ייחודי על בסיס ערכי תנועת העבודה - כבוד הזולת, צניעות, עזרה הדדית והתנדבות.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-slate-100 hover:border-[#0D98BA] transition-all hover:shadow-xl">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">חינוך חדשני</h3>
              <p className="text-slate-600 leading-relaxed">
                דגש על חינוך מעשי - גינה חקלאית, מלאכה, והכנה לחיים - מסורת שנמשכת גם היום בגישה היזמית שלנו.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-slate-100 hover:border-[#0D98BA] transition-all hover:shadow-xl">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">2025 - העתיד</h3>
              <p className="text-slate-600 leading-relaxed">
                ממשיכים את המורשת עם טכנולוגיות מתקדמות, אנגלית ברמה עולמית, וחינוך סביבתי לדור הבא.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-br from-[#003153] to-[#0D98BA] rounded-3xl p-10 text-center shadow-2xl">
            <blockquote className="text-2xl sm:text-3xl text-white font-semibold italic mb-4">
              "חינוך שמשלב מסורת עשירה עם חדשנות מודרנית"
            </blockquote>
            <p className="text-sky-200">
              מבית ספר קטן של ילדי עובדים ב-1938, לבית ספר מוביל עם 562 תלמידים ב-22 כיתות ב-2025
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D98BA] to-[#003153] flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-2xl">בית ספר בארי</h3>
                  <p className="text-slate-400 text-sm">נתניה • מאז 1938</p>
                </div>
              </div>
              <p className="text-base leading-relaxed mb-4">
                85 שנות מצוינות חינוכית - מסורת של ערכים, יוזמה ומחויבות לחברה.<br />
                ממשיכים את המורשת עם חינוך חדשני המפתח לומדים עצמאיים ובעלי יוזמה.
              </p>
              <p className="text-sm text-slate-500 mb-6">
                מאז 1938 מחנכים דורות של ילדים בערכי כבוד הזולת, צניעות, עזרה הדדית והתנדבות.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#0D98BA] flex items-center justify-center transition-colors">
                  <span className="text-white">f</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#0D98BA] flex items-center justify-center transition-colors">
                  <span className="text-white">in</span>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">קישורים מהירים</h3>
              <div className="space-y-3 text-sm">
                <Link href="/he" className="block hover:text-white transition-colors hover:translate-x-1 transform">← פורטל ההורים</Link>
                <Link href="/he/calendar" className="block hover:text-white transition-colors hover:translate-x-1 transform">← לוח אירועים</Link>
                <Link href="/he/committees" className="block hover:text-white transition-colors hover:translate-x-1 transform">← ועדי הורים</Link>
                <Link href="/he/feedback" className="block hover:text-white transition-colors hover:translate-x-1 transform">← משוב והצעות</Link>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">יצירת קשר</h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0D98BA]" />
                  רחוב בר אילן 12, נתניה
                </p>
                <a href="tel:09-862-4563" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-[#0D98BA]" />
                  <span dir="ltr">09-862-4563</span>
                </a>
                <a href="mailto:beeri@netanya.muni.il" className="flex items-center gap-2 hover:text-white transition-colors break-all">
                  <Mail className="w-4 h-4 text-[#0D98BA]" />
                  beeri@netanya.muni.il
                </a>
                <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-800">
                  קוד מוסד: 411371 | זרם: ממלכתי
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} בית ספר בארי, נתניה. כל הזכויות שמורות.</p>
            <p className="text-xs text-slate-600 mt-2">נבנה באהבה למען הדור הבא 💙</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
