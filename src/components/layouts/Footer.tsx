'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, Github, Mail } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn(
      "bg-gray-50 border-t border-gray-200 mt-auto",
      "pb-20 md:pb-0", // Add padding for mobile nav
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">אודות BeeriManager</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              מערכת ניהול ועד הורים מתקדמת הבנויה במיוחד עבור בתי ספר יסודיים בישראל.
              מאפשרת ניהול אירועים, משימות, הוצאות ותקשורת יעילה.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">קישורים מהירים</h3>
            <nav className="space-y-2">
              <Link href="/events" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                אירועים קרובים
              </Link>
              <Link href="/tasks" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                משימות פתוחות
              </Link>
              <Link href="/issues" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                דיווח בעיה
              </Link>
              <Link href="/protocols" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                פרוטוקולים
              </Link>
              <Link href="/feedback" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                משוב אנונימי
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">יצירת קשר</h3>
            <div className="space-y-2">
              <a
                href="mailto:committee@school.edu"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                committee@school.edu
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>שעות פעילות: א'-ה', 8:00-16:00</span>
              </div>
            </div>

            {/* Social/Tech Links */}
            <div className="mt-4 flex gap-3">
              <a
                href="https://github.com/your-org/beeri-manager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>נבנה באהבה</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>עבור ועד ההורים</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-500">
              <span>© {currentYear} BeeriManager. כל הזכויות שמורות.</span>
              <div className="flex gap-4">
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  מדיניות פרטיות
                </Link>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  תנאי שימוש
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}