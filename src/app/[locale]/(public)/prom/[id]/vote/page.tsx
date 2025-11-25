'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { 
  GraduationCap, 
  Vote,
  Star,
  Check,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Quote {
  id: string
  vendor_name: string
  display_label: string | null
  category: string
  price_total: number
  price_per_student: number | null
  services_included: string[]
  pros: string | null
  cons: string | null
  rating: number | null
  display_order: number
}

interface PromEvent {
  id: string
  title: string
  title_ru: string | null
  event_date: string | null
  voting_enabled: boolean
  voting_start_date: string | null
  voting_end_date: string | null
  student_count: number
}

interface VoteStats {
  [quoteId: string]: {
    prefer: number
    neutral: number
    oppose: number
    total: number
  }
}

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  venue: { label: 'אולם/מקום', emoji: '🏛️' },
  catering: { label: 'קייטרינג', emoji: '🍕' },
  dj: { label: 'DJ/מוזיקה', emoji: '🎵' },
  photography: { label: 'צילום', emoji: '📷' },
  decorations: { label: 'קישוטים', emoji: '🎈' },
  transportation: { label: 'הסעות', emoji: '🚌' },
  entertainment: { label: 'בידור', emoji: '🎭' },
  shirts: { label: 'חולצות', emoji: '👕' },
  sound_lighting: { label: 'הגברה ותאורה', emoji: '💡' },
  yearbook: { label: 'ספר מחזור', emoji: '📚' },
  recording: { label: 'אולפן הקלטות', emoji: '🎬' },
  scenery: { label: 'תפאורה', emoji: '🎪' },
  flowers: { label: 'פרחים/זרים', emoji: '💐' },
  security: { label: 'אבטחה', emoji: '🛡️' },
  electrician: { label: 'חשמלאי', emoji: '⚡' },
  moving: { label: 'הובלה', emoji: '🚚' },
  video_editing: { label: 'עריכת סרטונים', emoji: '🎥' },
  drums: { label: 'מתופפים', emoji: '🥁' },
  choreography: { label: 'כוריאוגרפיה', emoji: '💃' },
  other: { label: 'אחר', emoji: '📦' }
}

export default function PublicVotingPage() {
  const params = useParams()
  const promId = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [promEvent, setPromEvent] = useState<PromEvent | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [voteStats, setVoteStats] = useState<VoteStats>({})
  const [totalVoters, setTotalVoters] = useState(0)
  const [voterIdentifier, setVoterIdentifier] = useState('')
  const [voterName, setVoterName] = useState('')
  const [votes, setVotes] = useState<Record<string, { type: 'prefer' | 'neutral' | 'oppose'; comment: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [votingStatus, setVotingStatus] = useState<'active' | 'not_started' | 'ended' | 'disabled'>('disabled')

  useEffect(() => {
    fetchData()
    
    // Load saved identifier from localStorage
    const savedId = localStorage.getItem(`prom_voter_${promId}`)
    const savedName = localStorage.getItem(`prom_voter_name_${promId}`)
    if (savedId) {
      setVoterIdentifier(savedId)
      setHasVoted(true)
    }
    if (savedName) {
      setVoterName(savedName)
    }
  }, [promId])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [promResponse, quotesResponse, votesResponse] = await Promise.all([
        fetch(`/api/prom/${promId}?_t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/prom/${promId}/quotes?finalists=true&_t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/prom/${promId}/votes?_t=${Date.now()}`, { cache: 'no-store' })
      ])

      const promData = await promResponse.json()
      const quotesData = await quotesResponse.json()
      const votesData = await votesResponse.json()

      if (promData.success) {
        setPromEvent(promData.data)
        
        // Determine voting status
        const now = new Date()
        if (!promData.data.voting_enabled) {
          setVotingStatus('disabled')
        } else if (promData.data.voting_start_date && new Date(promData.data.voting_start_date) > now) {
          setVotingStatus('not_started')
        } else if (promData.data.voting_end_date && new Date(promData.data.voting_end_date) < now) {
          setVotingStatus('ended')
        } else {
          setVotingStatus('active')
        }
      }

      if (quotesData.success) {
        setQuotes(quotesData.data)
      }

      if (votesData.success) {
        setVoteStats(votesData.data.stats || {})
        setTotalVoters(votesData.data.total_voters || 0)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('שגיאה בטעינת הנתונים')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoteChange = (quoteId: string, type: 'prefer' | 'neutral' | 'oppose') => {
    setVotes(prev => ({
      ...prev,
      [quoteId]: { ...prev[quoteId], type, comment: prev[quoteId]?.comment || '' }
    }))
  }

  const handleCommentChange = (quoteId: string, comment: string) => {
    setVotes(prev => ({
      ...prev,
      [quoteId]: { ...prev[quoteId], type: prev[quoteId]?.type || 'neutral', comment }
    }))
  }

  const handleSubmit = async () => {
    if (!voterIdentifier.trim()) {
      toast.error('נא להזין מספר טלפון או אימייל לזיהוי')
      return
    }

    const votesToSubmit = Object.entries(votes).filter(([_, v]) => v.type)
    if (votesToSubmit.length === 0) {
      toast.error('נא לבחור לפחות אפשרות אחת')
      return
    }

    setIsSubmitting(true)

    try {
      // Submit votes for each quote
      for (const [quoteId, voteData] of votesToSubmit) {
        await fetch(`/api/prom/${promId}/votes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quote_id: quoteId,
            voter_identifier: voterIdentifier,
            voter_name: voterName || null,
            vote_type: voteData.type,
            comment: voteData.comment || null
          })
        })
      }

      // Save to localStorage
      localStorage.setItem(`prom_voter_${promId}`, voterIdentifier)
      if (voterName) {
        localStorage.setItem(`prom_voter_name_${promId}`, voterName)
      }

      toast.success('ההצבעה נשמרה בהצלחה!')
      setHasVoted(true)
      fetchData()
    } catch (error) {
      console.error('Error submitting votes:', error)
      toast.error('שגיאה בשמירת ההצבעה')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getVotePercentage = (quoteId: string, type: 'prefer' | 'neutral' | 'oppose') => {
    const stats = voteStats[quoteId]
    if (!stats || stats.total === 0) return 0
    return Math.round((stats[type] / stats.total) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-32 bg-white/50 rounded-2xl animate-pulse" />
          <div className="h-64 bg-white/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!promEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">הצבעה לא נמצאה</h2>
          <p className="text-muted-foreground mt-2">הקישור אינו תקין או שההצבעה הסתיימה</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 overflow-hidden">
          <CardContent className="pt-8 pb-6 text-center relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 left-4 text-6xl">🎓</div>
              <div className="absolute bottom-4 right-4 text-6xl">🎉</div>
            </div>
            <GraduationCap className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-2xl md:text-3xl font-bold">{promEvent.title}</h1>
            {promEvent.title_ru && (
              <p className="text-white/80 mt-1" dir="ltr">{promEvent.title_ru}</p>
            )}
            {promEvent.event_date && (
              <p className="text-white/90 mt-3 flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                {format(new Date(promEvent.event_date), 'dd בMMMM yyyy', { locale: he })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Voting Status */}
        {votingStatus !== 'active' && (
          <Card className={cn(
            "border-2",
            votingStatus === 'disabled' && "border-gray-300 bg-gray-50",
            votingStatus === 'not_started' && "border-yellow-300 bg-yellow-50",
            votingStatus === 'ended' && "border-blue-300 bg-blue-50"
          )}>
            <CardContent className="py-6 text-center">
              {votingStatus === 'disabled' && (
                <>
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700">ההצבעה אינה פעילה</h3>
                  <p className="text-gray-600">ההצבעה עדיין לא נפתחה על ידי הועד</p>
                </>
              )}
              {votingStatus === 'not_started' && (
                <>
                  <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-yellow-800">ההצבעה עדיין לא התחילה</h3>
                  {promEvent.voting_start_date && (
                    <p className="text-yellow-700">
                      תתחיל ב-{format(new Date(promEvent.voting_start_date), 'dd/MM/yyyy')}
                    </p>
                  )}
                </>
              )}
              {votingStatus === 'ended' && (
                <>
                  <CheckCircle2 className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-blue-800">ההצבעה הסתיימה</h3>
                  <p className="text-blue-700">ניתן לצפות בתוצאות למטה</p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{quotes.length}</div>
              <p className="text-sm text-muted-foreground">אפשרויות</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{totalVoters}</div>
              <p className="text-sm text-muted-foreground">הצביעו</p>
            </CardContent>
          </Card>
        </div>

        {/* Voter Identification */}
        {votingStatus === 'active' && !hasVoted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="h-5 w-5 text-purple-600" />
                פרטי מצביע
              </CardTitle>
              <CardDescription>
                לזיהוי ומניעת הצבעות כפולות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voterIdentifier">טלפון או אימייל *</Label>
                <Input
                  id="voterIdentifier"
                  value={voterIdentifier}
                  onChange={(e) => setVoterIdentifier(e.target.value)}
                  placeholder="054-1234567 או email@example.com"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  המידע מוצפן ואינו משותף עם אחרים
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="voterName">שם (אופציונלי)</Label>
                <Input
                  id="voterName"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="השם שלך"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quotes / Options */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            האפשרויות להצבעה
          </h2>

          {quotes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">אין אפשרויות להצבעה כרגע</p>
              </CardContent>
            </Card>
          ) : (
            quotes.map((quote, index) => {
              const stats = voteStats[quote.id]
              const displayName = quote.display_label || `אפשרות ${String.fromCharCode(1488 + index)}'` // א, ב, ג...

              return (
                <Card key={quote.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{displayName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{categoryLabels[quote.category]?.emoji}</span>
                          <span>{categoryLabels[quote.category]?.label}</span>
                        </CardDescription>
                      </div>
                      <div className="text-left">
                        <div className="text-xl font-bold text-green-700">
                          ₪{quote.price_total.toLocaleString('he-IL')}
                        </div>
                        {quote.price_per_student && (
                          <div className="text-xs text-muted-foreground">
                            ₪{quote.price_per_student.toLocaleString('he-IL')} לתלמיד
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Services */}
                    {quote.services_included?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">כולל:</p>
                        <div className="flex flex-wrap gap-1">
                          {quote.services_included.map((service, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pros & Cons */}
                    <div className="grid gap-3 md:grid-cols-2">
                      {quote.pros && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-800 flex items-center gap-1">
                            <Check className="h-4 w-4" /> יתרונות
                          </p>
                          <p className="text-sm text-green-700 mt-1">{quote.pros}</p>
                        </div>
                      )}
                      {quote.cons && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-sm font-medium text-orange-800 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" /> חסרונות
                          </p>
                          <p className="text-sm text-orange-700 mt-1">{quote.cons}</p>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    {quote.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-5 w-5",
                              i < quote.rating! 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-200"
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {/* Vote Results */}
                    {(hasVoted || votingStatus === 'ended') && stats && stats.total > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium mb-2">תוצאות ({stats.total} קולות)</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${getVotePercentage(quote.id, 'prefer')}%` }}
                              />
                            </div>
                            <span className="text-sm w-12">{getVotePercentage(quote.id, 'prefer')}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Minus className="h-4 w-4 text-gray-500" />
                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gray-400 rounded-full"
                                style={{ width: `${getVotePercentage(quote.id, 'neutral')}%` }}
                              />
                            </div>
                            <span className="text-sm w-12">{getVotePercentage(quote.id, 'neutral')}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThumbsDown className="h-4 w-4 text-red-600" />
                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-500 rounded-full"
                                style={{ width: `${getVotePercentage(quote.id, 'oppose')}%` }}
                              />
                            </div>
                            <span className="text-sm w-12">{getVotePercentage(quote.id, 'oppose')}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Voting Controls */}
                    {votingStatus === 'active' && !hasVoted && (
                      <div className="pt-3 border-t space-y-3">
                        <p className="text-sm font-medium">ההצבעה שלך:</p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={votes[quote.id]?.type === 'prefer' ? 'default' : 'outline'}
                            className={cn(
                              "flex-1",
                              votes[quote.id]?.type === 'prefer' && "bg-green-600 hover:bg-green-700"
                            )}
                            onClick={() => handleVoteChange(quote.id, 'prefer')}
                          >
                            <ThumbsUp className="h-4 w-4 ml-1" />
                            מעדיף
                          </Button>
                          <Button
                            type="button"
                            variant={votes[quote.id]?.type === 'neutral' ? 'default' : 'outline'}
                            className={cn(
                              "flex-1",
                              votes[quote.id]?.type === 'neutral' && "bg-gray-600 hover:bg-gray-700"
                            )}
                            onClick={() => handleVoteChange(quote.id, 'neutral')}
                          >
                            <Minus className="h-4 w-4 ml-1" />
                            ניטרלי
                          </Button>
                          <Button
                            type="button"
                            variant={votes[quote.id]?.type === 'oppose' ? 'default' : 'outline'}
                            className={cn(
                              "flex-1",
                              votes[quote.id]?.type === 'oppose' && "bg-red-600 hover:bg-red-700"
                            )}
                            onClick={() => handleVoteChange(quote.id, 'oppose')}
                          >
                            <ThumbsDown className="h-4 w-4 ml-1" />
                            מתנגד
                          </Button>
                        </div>

                        {votes[quote.id]?.type && (
                          <div className="space-y-2">
                            <Label htmlFor={`comment-${quote.id}`} className="text-xs">
                              הערה (אופציונלי)
                            </Label>
                            <Textarea
                              id={`comment-${quote.id}`}
                              value={votes[quote.id]?.comment || ''}
                              onChange={(e) => handleCommentChange(quote.id, e.target.value)}
                              placeholder="הוסף הערה..."
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Submit Button */}
        {votingStatus === 'active' && !hasVoted && quotes.length > 0 && (
          <div className="sticky bottom-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !voterIdentifier.trim()}
              className="w-full h-14 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                  שולח...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 ml-2" />
                  שלח הצבעה
                </>
              )}
            </Button>
          </div>
        )}

        {/* Success Message */}
        {hasVoted && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-800">תודה על ההצבעה!</h3>
              <p className="text-green-700 mt-1">ההצבעה שלך נשמרה בהצלחה</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>מסיבת סיום כיתה ו' • ועד ההורים</p>
        </div>
      </div>
    </div>
  )
}

