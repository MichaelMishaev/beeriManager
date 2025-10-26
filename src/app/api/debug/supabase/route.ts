import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlFirst10: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
      nodeEnv: process.env.NODE_ENV
    },
    test: {
      clientCreated: false,
      querySuccess: false,
      error: null as any,
      duration: 0
    }
  }

  try {
    const startTime = Date.now()

    // Test 1: Create client
    const supabase = createClient()
    diagnostics.test.clientCreated = true

    // Test 2: Simple query with timeout
    const queryPromise = supabase
      .from('holidays')
      .select('id')
      .limit(1)

    // Add a timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout after 5s')), 5000)
    )

    const { data, error } = await Promise.race([
      queryPromise,
      timeoutPromise
    ]).then(
      (result: any) => result,
      (err) => ({ data: null, error: err })
    )

    diagnostics.test.duration = Date.now() - startTime

    if (error) {
      diagnostics.test.error = {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }
    } else {
      diagnostics.test.querySuccess = true
      diagnostics.test.rowCount = data?.length || 0
    }

  } catch (error: any) {
    diagnostics.test.error = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      name: error.name
    }
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}
