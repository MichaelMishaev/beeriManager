import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteDummyCommittees() {
  console.log('🗑️  Deleting dummy committees...')

  const dummyNames = ['etrt', 'tests']

  for (const name of dummyNames) {
    const { data, error } = await supabase
      .from('committees')
      .delete()
      .eq('name', name)

    if (error) {
      console.error(`❌ Error deleting committee "${name}":`, error)
    } else {
      console.log(`✅ Deleted committee: "${name}"`)
    }
  }

  console.log('✨ Done!')
}

deleteDummyCommittees()
