/**
 * Database Operation Utilities - BeeriManager
 *
 * Provides safe database operations with runtime guards.
 * Enforces soft delete policy and data integrity.
 */

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

/**
 * GUARD 3: Soft Delete Enforcement
 *
 * NEVER use hard delete on user-facing data.
 * ALWAYS use soft delete to preserve audit trail.
 *
 * @example
 * await softDelete('tasks', taskId)
 */
export async function softDelete(
  table: string,
  id: string,
  options?: {
    deletedAtColumn?: string
    isDeletedColumn?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const deletedAtColumn = options?.deletedAtColumn || 'deleted_at'
  const isDeletedColumn = options?.isDeletedColumn || 'is_deleted'

  try {
    // RUNTIME GUARD: Enforce soft delete policy
    logger.info('Soft delete operation', {
      component: 'DB',
      action: 'softDelete',
      data: { table, id }
    })

    const updateData: Record<string, any> = {
      [isDeletedColumn]: true,
      [deletedAtColumn]: new Date().toISOString()
    }

    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)

    if (error) {
      logger.error('INVARIANT VIOLATION: Soft delete failed', {
        component: 'DB',
        action: 'softDelete',
        data: { table, id },
        error
      })

      return {
        success: false,
        error: error.message
      }
    }

    logger.success('Soft delete successful', {
      component: 'DB',
      action: 'softDelete',
      data: { table, id }
    })

    return { success: true }
  } catch (error) {
    logger.error('INVARIANT VIOLATION: Soft delete exception', {
      component: 'DB',
      action: 'softDelete',
      data: { table, id },
      error
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * DANGEROUS: Hard Delete (Use ONLY for system/admin cleanup)
 *
 * This function logs a warning and requires explicit confirmation.
 * Should NEVER be used on user-facing data.
 *
 * @example
 * // Only use for system cleanup, migrations, or admin operations
 * await hardDelete('system_logs', logId, { confirmed: true })
 */
export async function hardDelete(
  table: string,
  id: string,
  options: { confirmed: boolean; reason: string }
): Promise<{ success: boolean; error?: string }> {
  if (!options.confirmed) {
    logger.error('INVARIANT VIOLATION: Hard delete attempted without confirmation', {
      component: 'DB',
      action: 'hardDelete',
      data: { table, id }
    })

    throw new Error(
      'Hard delete requires explicit confirmation. Use softDelete() for user data.'
    )
  }

  const supabase = createClient()

  try {
    // Log the hard delete with reason
    logger.warn('⚠️ HARD DELETE OPERATION', {
      component: 'DB',
      action: 'hardDelete',
      data: {
        table,
        id,
        reason: options.reason,
        timestamp: new Date().toISOString()
      }
    })

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Hard delete failed', {
        component: 'DB',
        action: 'hardDelete',
        data: { table, id },
        error
      })

      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }
  } catch (error) {
    logger.error('Hard delete exception', {
      component: 'DB',
      action: 'hardDelete',
      data: { table, id },
      error
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Restore soft-deleted record
 */
export async function restoreDeleted(
  table: string,
  id: string,
  options?: {
    deletedAtColumn?: string
    isDeletedColumn?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const deletedAtColumn = options?.deletedAtColumn || 'deleted_at'
  const isDeletedColumn = options?.isDeletedColumn || 'is_deleted'

  try {
    const updateData: Record<string, any> = {
      [isDeletedColumn]: false,
      [deletedAtColumn]: null
    }

    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)

    if (error) {
      logger.error('Restore deleted record failed', {
        component: 'DB',
        action: 'restoreDeleted',
        data: { table, id },
        error
      })

      return {
        success: false,
        error: error.message
      }
    }

    logger.success('Record restored successfully', {
      component: 'DB',
      action: 'restoreDeleted',
      data: { table, id }
    })

    return { success: true }
  } catch (error) {
    logger.error('Restore deleted record exception', {
      component: 'DB',
      action: 'restoreDeleted',
      data: { table, id },
      error
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
