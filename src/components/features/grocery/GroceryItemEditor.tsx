'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import type { GroceryItem } from '@/types'
import { Plus, Minus, Trash2, ShoppingCart, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { ALL_GROCERY_ITEMS, QUICK_SUGGESTIONS } from '@/lib/data/grocery-items'
import { fuzzySearchHebrew, filterExistingItems } from '@/lib/utils/fuzzy-search'

interface GroceryItemEditorProps {
  items: GroceryItem[]
  onAddItem: (item: { item_name: string; quantity: number }) => Promise<void>
  onRemoveItem: (itemId: string) => Promise<void>
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>
  onDone: () => void
}

// Animation variants
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 }
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
}


export function GroceryItemEditor({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onDone
}: GroceryItemEditorProps) {
  const t = useTranslations('grocery')
  const [newItemName, setNewItemName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Get existing item names to filter from suggestions
  const existingItemNames = items.map(item => item.item_name)

  // Update suggestions when input changes
  const updateSuggestions = useCallback((value: string) => {
    if (!value.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const matches = fuzzySearchHebrew(value, ALL_GROCERY_ITEMS, 8)
    const filtered = filterExistingItems(matches, existingItemNames)
    setSuggestions(filtered)
    setSelectedIndex(-1)
    setShowSuggestions(filtered.length > 0)
  }, [existingItemNames])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleAddItem = async () => {
    if (!newItemName.trim()) return

    setIsAdding(true)
    try {
      await onAddItem({ item_name: newItemName.trim(), quantity: 1 })
      setNewItemName('')
      // Re-focus input after adding
      inputRef.current?.focus()
    } catch (error) {
      console.error('Error adding item:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewItemName(value)
    updateSuggestions(value)
  }

  const handleSelectSuggestion = async (suggestion: string) => {
    setNewItemName('')
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)

    setIsAdding(true)
    try {
      await onAddItem({ item_name: suggestion, quantity: 1 })
      inputRef.current?.focus()
    } catch (error) {
      console.error('Error adding item:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle suggestion navigation
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          return
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
          return
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0) {
            handleSelectSuggestion(suggestions[selectedIndex])
          } else if (newItemName.trim()) {
            handleAddItem()
          }
          return
        case 'Escape':
          e.preventDefault()
          setShowSuggestions(false)
          setSelectedIndex(-1)
          return
      }
    }

    // Default Enter behavior when no suggestions
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem()
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleQuickAdd = async (itemName: string) => {
    setIsAdding(true)
    try {
      await onAddItem({ item_name: itemName, quantity: 1 })
    } catch (error) {
      console.error('Error adding item:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleClearAll = async () => {
    setShowConfirmClear(false)
    for (const item of items) {
      await onRemoveItem(item.id)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8f7] dark:bg-[#102219] font-[family-name:var(--font-jakarta)]">
      {/* Add Item Input Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-6 bg-white dark:bg-[#152a1f] border-b border-[#cfe7db] dark:border-[#1e3a2c]"
      >
        <label className="flex flex-col w-full">
          <p className="text-[#0d1b14] dark:text-white text-sm font-semibold pb-2 uppercase tracking-wider">
            {t('newItem')}
          </p>
          <div className="flex w-full items-stretch gap-2">
            <div className="flex flex-1 items-stretch rounded-xl overflow-hidden border-2 border-[#cfe7db] dark:border-[#1e3a2c] bg-[#f6f8f7] dark:bg-[#102219] focus-within:border-[#13ec80] focus-within:ring-4 focus-within:ring-[#13ec80]/20 transition-all">
              <input
                ref={inputRef}
                value={newItemName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (newItemName.trim() && suggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent h-14 placeholder:text-[#4c9a73] px-4 text-base font-normal leading-normal focus:ring-0 focus:outline-none text-[#0d1b14] dark:text-white"
                placeholder={t('itemPlaceholder')}
                disabled={isAdding}
                aria-label={t('newItem')}
                autoComplete="off"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
                aria-controls="grocery-suggestions"
              />
              <motion.button
                onClick={handleAddItem}
                disabled={isAdding || !newItemName.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#13ec80] text-[#0d1b14] px-5 flex items-center justify-center font-bold disabled:opacity-50 transition-all
                  focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40"
                aria-label={t('addItem')}
              >
                {isAdding ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
        </label>

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              id="grocery-suggestions"
              role="listbox"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="mt-2 bg-white dark:bg-[#152a1f] rounded-xl border-2 border-[#cfe7db] dark:border-[#1e3a2c] shadow-lg overflow-hidden"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  type="button"
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`w-full px-4 py-3 text-right flex items-center gap-3 transition-colors
                    ${selectedIndex === index
                      ? 'bg-[#13ec80]/20 text-[#0d1b14] dark:text-white'
                      : 'hover:bg-[#f6f8f7] dark:hover:bg-[#1e3a2c] text-[#0d1b14] dark:text-white'
                    }
                    ${index < suggestions.length - 1 ? 'border-b border-[#f0f5f2] dark:border-[#1e3a2c]' : ''}
                  `}
                >
                  <Plus className="h-4 w-4 text-[#13ec80] shrink-0" />
                  <span className="text-base font-medium">{suggestion}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Add Suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_SUGGESTIONS.map((suggestion) => {
            const alreadyAdded = items.some(i => i.item_name === suggestion)
            return (
              <motion.button
                key={suggestion}
                type="button"
                onClick={() => !alreadyAdded && handleQuickAdd(suggestion)}
                disabled={alreadyAdded || isAdding}
                whileHover={{ scale: alreadyAdded ? 1 : 1.05 }}
                whileTap={{ scale: alreadyAdded ? 1 : 0.95 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all
                  focus:outline-none focus:ring-2 focus:ring-[#13ec80]/30
                  ${alreadyAdded
                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed line-through'
                    : 'bg-[#13ec80]/10 hover:bg-[#13ec80]/20 border-[#13ec80]/20 text-[#0d1b14] dark:text-white cursor-pointer'
                  }`}
              >
                <Sparkles className={`h-3.5 w-3.5 ${alreadyAdded ? 'text-gray-400' : 'text-[#13ec80]'}`} />
                {suggestion}
              </motion.button>
            )
          })}
        </div>

        <p className="text-xs text-[#4c9a73] mt-3 px-1">
          {t('tipAddItems')}
        </p>
      </motion.div>

      {/* List Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between px-4 py-4"
      >
        <h3 className="text-[#0d1b14] dark:text-white text-sm font-bold uppercase tracking-wider">
          {t('currentList')} ({items.length})
        </h3>
        {items.length > 0 && (
          <motion.button
            onClick={() => setShowConfirmClear(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs font-semibold text-red-500 flex items-center gap-1 hover:text-red-600 transition-colors
              focus:outline-none focus:ring-2 focus:ring-red-500/30 rounded px-2 py-1"
            aria-label={t('clearAll')}
          >
            <Trash2 className="h-4 w-4" />
            {t('clearAll')}
          </motion.button>
        )}
      </motion.div>

      {/* Confirm Clear Dialog */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmClear(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#152a1f] rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-lg font-bold text-[#0d1b14] dark:text-white mb-2">
                {t('clearAll')}
              </h3>
              <p className="text-[#4c9a73] mb-6">
                {t('confirmClearAll')}
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowConfirmClear(false)}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 rounded-xl border-2 border-[#cfe7db] dark:border-[#1e3a2c] text-[#0d1b14] dark:text-white font-semibold
                    focus:outline-none focus:ring-4 focus:ring-gray-400/20"
                >
                  {t('cancel')}
                </motion.button>
                <motion.button
                  onClick={handleClearAll}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold
                    focus:outline-none focus:ring-4 focus:ring-red-500/30"
                >
                  {t('clearAll')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grocery Items List */}
      <div className="flex-1 pb-48">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 text-[#4c9a73]"
            >
              <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm font-medium">{t('listEmpty')}</p>
              <p className="text-xs opacity-70">{t('addItemsAbove')}</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-1"
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  exit="exit"
                  layout
                  className="flex items-center gap-4 bg-white dark:bg-[#152a1f] px-4 py-3 justify-between border-y border-[#f0f5f2] dark:border-[#1e3a2c]"
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    {/* Item Number Badge */}
                    <div className="flex size-8 items-center justify-center shrink-0 rounded-full bg-[#13ec80]/10 text-[#13ec80] text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-[#0d1b14] dark:text-white text-base font-medium truncate">
                      {item.item_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1 bg-[#f6f8f7] dark:bg-[#102219] rounded-full p-1 border border-[#cfe7db] dark:border-[#1e3a2c]">
                      <motion.button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        whileHover={{ scale: item.quantity > 1 ? 1.1 : 1 }}
                        whileTap={{ scale: item.quantity > 1 ? 0.9 : 1 }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-[#1a3326] text-[#0d1b14] dark:text-white hover:bg-[#13ec80]/20 transition-colors disabled:opacity-30
                          focus:outline-none focus:ring-2 focus:ring-[#13ec80]/30"
                        aria-label={t('quantity') + ' -1'}
                      >
                        <Minus className="h-4 w-4" />
                      </motion.button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value)
                          if (!isNaN(val) && val >= 1) {
                            onUpdateQuantity(item.id, val)
                          }
                        }}
                        className="text-base font-bold w-8 p-0 text-center bg-transparent border-none focus:ring-0 text-[#0d1b14] dark:text-white"
                        min="1"
                        aria-label={t('quantity')}
                      />
                      <motion.button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-[#1a3326] text-[#0d1b14] dark:text-white hover:bg-[#13ec80] transition-colors
                          focus:outline-none focus:ring-2 focus:ring-[#13ec80]/30"
                        aria-label={t('quantity') + ' +1'}
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                    </div>

                    {/* Delete Button */}
                    <motion.button
                      onClick={() => onRemoveItem(item.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-[#4c9a73] hover:text-red-500 transition-colors p-2
                        focus:outline-none focus:ring-2 focus:ring-red-500/30 rounded-lg"
                      aria-label={t('removeItem')}
                    >
                      <Trash2 className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Summary */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 pb-4"
          >
            <div className="bg-[#13ec80]/10 dark:bg-[#13ec80]/5 rounded-2xl p-4 border border-[#13ec80]/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#0d1b14] dark:text-white">{t('totalItems')}</span>
                <span className="text-lg font-bold text-[#0d1b14] dark:text-white">{items.length}</span>
              </div>
              <p className="text-xs text-[#4c9a73] mt-1">{t('canShareWithParents')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f6f8f7]/95 dark:bg-[#102219]/95 backdrop-blur-lg p-4 border-t border-[#cfe7db] dark:border-[#1e3a2c] z-40">
        <div className="max-w-md mx-auto">
          <motion.button
            onClick={onDone}
            disabled={items.length === 0}
            whileHover={{ scale: items.length > 0 ? 1.02 : 1 }}
            whileTap={{ scale: items.length > 0 ? 0.98 : 1 }}
            className="w-full bg-[#13ec80] hover:bg-[#10d970] text-[#0d1b14] py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#13ec80]/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2
              focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40"
          >
            {t('saveAndContinue')}
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
