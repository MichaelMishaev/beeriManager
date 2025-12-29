🎯 Critical Learnings

  1. Prompt Engineering = 💰 Money

  Our journey:
  - Started: Verbose prompts → Expensive + Slow
  - Recent fix (commit 4b0b4c2): 70% prompt reduction
  - Result: Faster responses, lower costs

  TIP: Ruthlessly minimize prompt size. Every token costs you 2x (input + output).

  Action items:
  - ✅ Use structured output (JSON mode) instead of "parse this text"
  - ✅ Give examples, not explanations
  - ✅ Cache system prompts when possible (GPT supports prompt caching)
  - ✅ Strip unnecessary context - only send what's needed

  2. Date/Time Handling is a Minefield 💣

  // We learned the hard way (commit faa4b8f):
  // Luxon uses Monday=1, NOT Sunday=1
  // Hebrew has different weekday names
  // Users say "Thursday" but mean "next Thursday"

  Common bugs we hit:
  - Timezone mismatches
  - Relative dates ("tomorrow", "next week")
  - Weekday mapping differences
  - AM/PM confusion in 12/24hr formats

  TIP: Use a solid date library (we use Luxon) and explicitly confirm ambiguous dates back to users.

⏺ 3. Multi-Intent Detection 🎯

  User: "Remind me gym at 6pm and call mom tomorrow"
         ↓
       2 events, not 1!

  We built: MultiEventPhase (see backup file)
  Result: Parse multiple intents in single message

  TIP: Always check for and, commas, line breaks - users bundle requests.

  4. Queue-Based Processing > Synchronous

  Our architecture:
  WhatsApp → Immediate ACK → Queue → Process → Respond
             (< 100ms)        BullMQ    (async)

  Why:
  - WhatsApp has timeout limits
  - Users hate "typing..." for 5+ seconds
  - Retry logic built-in
  - Graceful degradation

  TIP: Never do heavy AI processing in the request path. Queue it.

  5. Error Tracking with User Context

  // Our Redis bug tracking system:
  {
    "messageText": "#bug - show only future events",
    "userId": "...",
    "status": "pending",
    "timestamp": "2025-10-17T09:08:00Z"
  }

  Why it works:
  - Users report bugs in natural flow
  - We track exactly what they said
  - Context preserved (user ID, timestamp)
  - Can replay scenarios

  TIP: Let users flag issues in-app with a simple prefix (#bug). Store original message + context.

  6. Testing AI Flows is Hard

  # Our QA system (commit 6f8a94c):
  - Initialize full pipeline in test mode
  - Use real prompts, mock API responses
  - Regression tests for each optimization
  - Track before/after metrics

  TIP: Don't just test logic - test prompt changes with real examples. AI outputs drift.

  7. Confirmation > Assumptions

  Bad:  "Event created ✓"
  Good: "Created: 🏋️ Gym on Thu 6pm. Correct?"

  Why:
  - Date parsing is ambiguous
  - Users catch errors before commit
  - Builds trust

  TIP: Echo back the interpreted intent, especially for dates/times.

  8. Service-Oriented Architecture

  Our structure:
  NLPService → Parses intent
  EventService → Creates events
  QueueService → BullMQ jobs
  WhatsAppService → Message handling

  Benefits:
  - Testable in isolation
  - Easy to swap AI providers
  - Clear boundaries

  TIP: Don't mix WhatsApp logic with GPT logic with DB logic. Separate concerns.

  9. Cost Monitoring

  What we track:
  - Prompt tokens per request
  - Average response time
  - Errors by type
  - User retry rate

  Recent win: 70% reduction saved ~$500/month at scale

  TIP: Log every API call cost. Optimize top 20% of expensive prompts.

  10. Specific Optimizations We Made

  // ❌ Before: Send entire chat history
  const prompt = allMessages.join('\n')

  // ✅ After: Sliding window
  const recentMessages = messages.slice(-5)

  // ❌ Before: Explain everything
  "You are a helpful assistant that creates events..."

  // ✅ After: Minimal instruction
  "Extract: {title, date, time, recurrence}"

  // ❌ Before: Text response
  "The event is scheduled for..."

  // ✅ After: Structured output
  {action: "create", event: {...}}

  ---
  🚀 Recommended Tech Stack (Based on Our Learnings)

  ✅ Date/Time: Luxon (handles timezones well)
  ✅ Queue: BullMQ (Redis-backed, reliable)
  ✅ State: Redis (fast, structured data)
  ✅ Logging: Winston (structured logs we can grep)
  ✅ GPT: Use JSON mode + function calling
  ✅ Testing: Jest with real prompt fixtures

  ---
  ⚠️ Common Pitfalls to Avoid

  1. Sending too much context → Costs skyrocket
  2. No user confirmation → Wrong events created
  3. Synchronous AI calls → Timeouts
  4. Forgetting timezones → Events at 3am
  5. No regression tests for prompts → Output drift
  6. Not logging costs → Budget surprises

  ---
  🎓 The Most Important Lesson

  AI is probabilistic, not deterministic.

  Design for:
  - Confirmation loops
  - Easy error correction
  - Graceful degradation
  - User trust building

  Users forgive mistakes if you:
  1. Catch them early (confirmation)
  2. Make fixing easy ("That's wrong" → auto-retry)