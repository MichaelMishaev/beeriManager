// Cost tracking for GPT-5 Mini API calls

interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

// GPT-5 Mini pricing (December 2025)
const PRICING = {
  'gpt-5-mini': {
    input: 0.25 / 1_000_000, // $0.25 per 1M input tokens
    output: 2.0 / 1_000_000, // $2.00 per 1M output tokens
    cached: 0.025 / 1_000_000, // $0.025 per 1M cached tokens
  },
}

export function calculateCost(usage: TokenUsage, model: string = 'gpt-5-mini'): number {
  const pricing = PRICING[model as keyof typeof PRICING]
  if (!pricing) return 0

  const inputCost = usage.prompt_tokens * pricing.input
  const outputCost = usage.completion_tokens * pricing.output

  return inputCost + outputCost
}

export function logAICost(
  usage: TokenUsage | undefined,
  operation: string,
  userMessage?: string,
  round?: number // Optional round number for multi-round conversations
): void {
  if (!usage) return

  const cost = calculateCost(usage)

  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    round: round || 1, // Default to round 1
    model: 'gpt-5-mini',
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
    estimatedCost: cost,
    messagePreview: userMessage?.substring(0, 50),
  }

  console.log('[AI Cost]', JSON.stringify(logEntry))

  // TODO: Store in database/Redis for analytics
  // await redis.lpush('ai_costs', JSON.stringify(logEntry))
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(6)}`
}
