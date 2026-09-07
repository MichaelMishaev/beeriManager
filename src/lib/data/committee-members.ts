export interface CommitteeMember {
  grade: string
  name: string
}

export const committeeMembers: CommitteeMember[] = [
  { grade: 'א1', name: 'דבי כראדי' },
  { grade: 'א2', name: 'חופית מטייב' },
  { grade: 'א3', name: 'אלון שמואלוביץ\'' },
  { grade: 'א4', name: 'ורדית צוויג' },

  { grade: 'ב1', name: 'יוסי בן דוד' },
  { grade: 'ב2', name: 'יוליה זברסקי' },
  { grade: 'ב3', name: 'אלון שמואלוביץ\'' },
  { grade: 'ב4', name: 'נועה זנזורי' },

  { grade: 'ג1', name: 'אלינור מנישרוב' },
  { grade: 'ג2', name: 'ליאור בן הרוש' },
  { grade: 'ג3', name: 'אורטל בבלי' },
  { grade: 'ג4', name: 'ניצן חכימי' },

  { grade: 'ד1', name: 'אלמוג ארזי הלל' },
  { grade: 'ד2', name: 'יוסי בן דוד' },
  { grade: 'ד3', name: 'מיכאל מישייב' },

  { grade: 'ה1', name: 'ולנטינה מטייקה' },
  { grade: 'ה2', name: 'מאגי קדר' },
  { grade: 'ה3', name: 'עמית טסלר' },

  { grade: 'ו1', name: 'מיכאל מישייב' },
  { grade: 'ו2', name: 'אדינה כהן' },
  { grade: 'ו3', name: 'ליטל דיין' },
  { grade: 'ו4', name: 'דניאל מויסה' },
]

// Group by grade level (א, ב, ג, ...)
export function getMembersByGradeLevel(): Record<string, CommitteeMember[]> {
  return committeeMembers.reduce((acc, member) => {
    const gradeLevel = member.grade[0]
    if (!acc[gradeLevel]) {
      acc[gradeLevel] = []
    }
    acc[gradeLevel].push(member)
    return acc
  }, {} as Record<string, CommitteeMember[]>)
}
