'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  HelpCircle,
  Mail,
  MessageSquare,
  Users,
  Calendar,
  Settings,
  ChevronRight,
  Home
} from 'lucide-react'
import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <HelpCircle className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">מרכז עזרה</h1>
        <p className="text-gray-600">מדריכים ותשובות לשאלות נפוצות</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              איך להצטרף לוועד?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              פנו לאחד מחברי הוועד הקיימים או שלחו הודעה דרך טופס יצירת הקשר
            </p>
            <Link href="/feedback">
              <Button variant="link" size="sm" className="p-0 h-auto">
                צור קשר <ChevronRight className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              איך נרשמים לאירוע?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              כנסו לעמוד האירועים, בחרו אירוע ולחצו על "הרשמה לאירוע"
            </p>
            <Link href="/events">
              <Button variant="link" size="sm" className="p-0 h-auto">
                לאירועים <ChevronRight className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="space-y-6">
        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>התחלת עבודה</CardTitle>
            <CardDescription>המדריך המלא לשימוש במערכת</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-r-4 border-blue-500 pr-4">
              <h3 className="font-semibold mb-2">ניווט באפליקציה</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• השתמשו בתפריט העליון כדי לעבור בין הדפים השונים</li>
                <li>• הדף הראשי מציג סיכום של הפעילות האחרונה</li>
                <li>• כל המידע זמין לצפייה ללא צורך בהרשמה</li>
              </ul>
            </div>

            <div className="border-r-4 border-green-500 pr-4">
              <h3 className="font-semibold mb-2">אירועים</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• צפו בכל האירועים הקרובים בעמוד האירועים</li>
                <li>• לחצו על אירוע לקבלת פרטים מלאים</li>
                <li>• הרשמו לאירועים ישירות דרך האפליקציה</li>
                <li>• קבלו QR Code לאישור ההרשמה</li>
              </ul>
            </div>

            <div className="border-r-4 border-purple-500 pr-4">
              <h3 className="font-semibold mb-2">משימות</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• עקבו אחר משימות הוועד בעמוד המשימות</li>
                <li>• ראו מי אחראי על כל משימה ומה הסטטוס</li>
                <li>• משימות דחופות מסומנות בצבע אדום</li>
              </ul>
            </div>

            <div className="border-r-4 border-orange-500 pr-4">
              <h3 className="font-semibold mb-2">כספים</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• צפו בדוחות כספיים בעמוד הכספים</li>
                <li>• ראו הכנסות והוצאות מפורטות</li>
                <li>• מעקב אחר תקציב שנתי</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>שאלות נפוצות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">האם צריך להירשם כדי לצפות במידע?</h3>
              <p className="text-sm text-gray-600">לא, כל המידע פתוח לציבור. רק עריכת תוכן דורשת הרשאה.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">איך מעדכנים את הפרטים האישיים?</h3>
              <p className="text-sm text-gray-600">פנו לאחד מחברי הוועד או שלחו הודעה דרך טופס יצירת הקשר.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">האם האפליקציה עובדת במכשירים שונים?</h3>
              <p className="text-sm text-gray-600">כן, האפליקציה מותאמת לטלפונים, טאבלטים ומחשבים.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">איך מקבלים התראות על אירועים חדשים?</h3>
              <p className="text-sm text-gray-600">ההתראות יישלחו בקבוצת הוואטסאפ של ההורים.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>יצירת קשר</CardTitle>
            <CardDescription>דרכים ליצירת קשר עם הוועד</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/feedback">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center gap-3 pt-6">
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-semibold">טופס יצירת קשר</p>
                      <p className="text-sm text-gray-600">שלחו הודעה לוועד</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-3 pt-6">
                  <Mail className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-semibold">דואר אלקטרוני</p>
                    <p className="text-sm text-gray-600">vaad@school.org.il</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access Info */}
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              למנהלי המערכת
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              גישת ניהול זמינה רק לחברי ועד מורשים.
              לכניסה למערכת הניהול:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 mb-4">
              <li>עברו לעמוד הכניסה למנהלים</li>
              <li>הזינו את סיסמת המנהל שקיבלתם</li>
              <li>לחצו על "כניסה למערכת"</li>
            </ol>
            <Link href="/login">
              <Button variant="outline" size="sm" className="w-full">
                כניסה למנהלים
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Back to Home */}
      <div className="text-center mt-8">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <Home className="h-4 w-4 ml-2" />
            חזרה לדף הבית
          </Button>
        </Link>
      </div>
    </div>
  )
}