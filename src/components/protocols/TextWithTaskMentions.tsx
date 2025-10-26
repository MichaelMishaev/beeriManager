'use client'

import TaskMentionBadge from './TaskMentionBadge'

interface TextWithTaskMentionsProps {
  text: string
}

/**
 * Client component that renders text with interactive task mention badges
 * Pattern: @TaskTitle[task:id]
 */
export default function TextWithTaskMentions({ text }: TextWithTaskMentionsProps) {
  // Pattern: @TaskTitle[task:id]
  const taskMentionPattern = /@([^[]+)\[task:([^\]]+)\]/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = taskMentionPattern.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add the task mention as an interactive badge
    const taskTitle = match[1]
    const taskId = match[2]
    parts.push(
      <TaskMentionBadge
        key={`task-${taskId}-${match.index}`}
        taskId={taskId}
        taskTitle={taskTitle}
      />
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return <>{parts.length > 0 ? parts : text}</>
}
