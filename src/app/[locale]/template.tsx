'use client'

import { motion } from 'framer-motion'

// Re-mounts on every navigation → gentle cross-route fade.
// Opacity only: a transform here would re-anchor `position: fixed` children
// (e.g. FloatingActionMenu) to this wrapper mid-animation.
export default function LocaleTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
