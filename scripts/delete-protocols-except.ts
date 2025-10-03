import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteProtocolsExcept(keepId: string) {
  console.log(`Deleting all protocols except: ${keepId}`)

  // Get all protocols
  const { data: protocols, error: fetchError } = await supabase
    .from('protocols')
    .select('id, title')

  if (fetchError) {
    console.error('Error fetching protocols:', fetchError)
    return
  }

  console.log(`Found ${protocols?.length || 0} protocols total`)

  // Filter out the one to keep
  const toDelete = protocols?.filter(p => p.id !== keepId) || []

  console.log(`Will delete ${toDelete.length} protocols:`)
  toDelete.forEach(p => {
    console.log(`  - ${p.id}: ${p.title}`)
  })

  if (toDelete.length === 0) {
    console.log('No protocols to delete')
    return
  }

  // Ask for confirmation
  console.log('\nDeleting in 3 seconds... Press Ctrl+C to cancel')
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Delete protocols
  const { error: deleteError } = await supabase
    .from('protocols')
    .delete()
    .neq('id', keepId)

  if (deleteError) {
    console.error('❌ Delete failed:', deleteError)
  } else {
    console.log(`✅ Successfully deleted ${toDelete.length} protocols`)
    console.log(`✅ Kept protocol: ${keepId}`)
  }
}

// Delete all except this ID
deleteProtocolsExcept('80c19e7a-f3cf-4125-a7e1-a7cd65ef6163')
