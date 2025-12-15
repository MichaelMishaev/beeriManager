import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Found' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addVendor() {
  console.log('🏪 Adding vendor: סופגניות שמש...')

  const vendorData = {
    name: 'סופגניות שמש',
    description: 'ספק סופגניות מקצועי - מיני סופגניות, סופגניות גדולות וסופגניות ללא גלוטן',
    category: 'catering',
    phone: '0549755516',
    price_range: 'מיני: ₪3.50 | גדולה: ₪3.90 | ללא גלוטן: ₪12.00',
    payment_terms: 'שינוי או ביטול הזמנה עד 72 שעות מלפני יום האספקה. המחירים כוללים מע״מ.',
    notes: `מחירים:
• מיני סופגנייה - ₪3.50 כולל מע״מ
• סופגנייה גדולה - ₪3.90 כולל מע״מ
• סופגנייה ללא גלוטן - ₪12.00 כולל מע״מ

לפרטים נוספים: 054-9755516

ט.ל.ח - המחירים כוללים מע״מ`,
    status: 'active'
  }

  const { data, error } = await supabase
    .from('vendors')
    .insert(vendorData)
    .select()
    .single()

  if (error) {
    console.error('❌ Error adding vendor:', error)
    process.exit(1)
  }

  console.log('✅ Vendor added successfully!')
  console.log('📋 Vendor details:')
  console.log('   ID:', data.id)
  console.log('   Name:', data.name)
  console.log('   Category:', data.category)
  console.log('   Phone:', data.phone)
  console.log('   Status:', data.status)
  console.log('')
  console.log('🔗 View vendor at:')
  console.log(`   Public: http://localhost:4500/vendors/${data.id}`)
  console.log(`   Admin:  http://localhost:4500/admin/vendors/${data.id}`)
}

addVendor()
