import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import contactsData from '@/data/contacts.json'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Query parameters
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    // Start with all public contacts
    let contacts = contactsData.filter(contact => contact.is_public)

    // Apply category filter
    if (category) {
      contacts = contacts.filter(contact => contact.category === category)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      contacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchLower) ||
        contact.role.toLowerCase().includes(searchLower) ||
        (contact.name_ru && contact.name_ru.toLowerCase().includes(searchLower)) ||
        (contact.role_ru && contact.role_ru.toLowerCase().includes(searchLower))
      )
    }

    // Sort by sort_order and name
    contacts.sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order
      }
      return a.name.localeCompare(b.name)
    })

    // Apply limit
    contacts = contacts.slice(0, Math.min(limit, 100))

    return NextResponse.json({
      success: true,
      data: contacts,
      count: contacts.length
    })

  } catch (error) {
    logger.error('Contacts GET error', { component: 'Contacts', error })
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת אנשי הקשר' },
      { status: 500 }
    )
  }
}
