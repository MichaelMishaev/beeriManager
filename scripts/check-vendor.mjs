import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkVendor() {
  console.log('🔍 Searching for "סופגניות שמש" vendor...\n')

  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('name', 'סופגניות שמש')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (!vendors || vendors.length === 0) {
    console.log('❌ NO VENDOR FOUND with name "סופגניות שמש"')
    console.log('\n📋 Checking all vendors in database...')

    const { data: allVendors } = await supabase
      .from('vendors')
      .select('id, name, category, phone, status')
      .order('created_at', { ascending: false })
      .limit(10)

    console.log(`\n📊 Total vendors in database: ${allVendors?.length || 0}`)
    allVendors?.forEach((v, i) => {
      console.log(`${i + 1}. ${v.name} (${v.category}) - ${v.status}`)
    })
    return
  }

  console.log(`✅ FOUND ${vendors.length} vendor(s) named "סופגניות שמש":\n`)

  vendors.forEach((vendor, index) => {
    console.log(`Vendor #${index + 1}:`)
    console.log(`  ID: ${vendor.id}`)
    console.log(`  Name: ${vendor.name}`)
    console.log(`  Category: ${vendor.category}`)
    console.log(`  Phone: ${vendor.phone}`)
    console.log(`  Status: ${vendor.status}`)
    console.log(`  Created: ${vendor.created_at}`)
    console.log(`  Price Range: ${vendor.price_range}`)
    console.log(`  Public URL: http://localhost:4500/vendors/${vendor.id}`)
    console.log(`  Admin URL: http://localhost:4500/admin/vendors/${vendor.id}`)
    console.log('')
  })
}

checkVendor()
