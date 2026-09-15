export interface CommitteeMember {
  grade: string
  name: string
  phone?: string
}

export const committeeMembers: CommitteeMember[] = [
  { grade: 'א2', name: 'ליאור בן הרוש', phone: '052-6589223' },
  { grade: 'א4', name: 'לילה ניימרק', phone: '054-2046433' },

  { grade: 'ב4', name: 'ורדית צוויג', phone: '050-8591536' },

  { grade: 'ג1', name: 'יוסי בן דוד', phone: '054-2101057' },
  { grade: 'ג4', name: 'נועה זנזורי', phone: '052-8242119' },

  { grade: 'ד3', name: 'אורטל בבלי', phone: '053-6006660' },
  { grade: 'ד4', name: 'רחלי חזנוב', phone: '054-2557976' },

  { grade: 'ה1', name: 'אלמוג ארזי הלל', phone: '050-4499667' },
  { grade: 'ה2', name: 'יוסי בן דוד', phone: '054-2101057' },
  { grade: 'ה3', name: 'מיכאל מישייב', phone: '054-4345287' },

  { grade: 'ו1', name: 'ולנטינה מטייקה', phone: '054-2501921' },
  { grade: 'ו3', name: 'עמית נודלמן טסלר', phone: '054-6800750' },
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
