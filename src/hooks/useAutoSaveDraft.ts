import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";

interface UseAutoSaveDraftOptions {
  /**
   * Unique key for localStorage
   * @example "draft-thread-support"
   */
  key: string;

  /**
   * Current value to auto-save
   */
  value: string;

  /**
   * Debounce delay in milliseconds
   * @default 1500
   */
  delay?: number;

  /**
   * Whether to enable auto-save
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback when draft is saved
   */
  onSave?: () => void;

  /**
   * Callback when draft is restored
   */
  onRestore?: (value: string) => void;
}

interface UseAutoSaveDraftReturn {
  /**
   * Restored draft content (if any)
   */
  restoredDraft: string | null;

  /**
   * Whether a draft was restored on mount
   */
  hasDraft: boolean;

  /**
   * Manually clear the draft from localStorage
   */
  clearDraft: () => void;

  /**
   * Manually save the draft to localStorage
   */
  saveDraft: (content: string) => void;
}

/**
 * Hook pour auto-sauvegarder un brouillon dans localStorage
 *
 * @example
 * ```tsx
 * const { restoredDraft, hasDraft, clearDraft } = useAutoSaveDraft({
 *   key: "draft-thread-support",
 *   value: editorContent,
 *   delay: 1500,
 * });
 *
 * // Restaurer au mount
 * useEffect(() => {
 *   if (restoredDraft) {
 *     editor.commands.setContent(restoredDraft);
 *   }
 * }, []);
 *
 * // Clear après submit
 * const handleSubmit = async () => {
 *   await submitThread();
 *   clearDraft();
 * };
 * ```
 */
export function useAutoSaveDraft({
  key,
  value,
  delay = 1500,
  enabled = true,
  onSave,
  onRestore,
}: UseAutoSaveDraftOptions): UseAutoSaveDraftReturn {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<string>(value);
  const [restoredDraft, setRestoredDraft] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(false);

  // Restore draft on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(key);
      if (saved && saved.trim().length > 0) {
        setRestoredDraft(saved);
        setHasDraft(true);
        onRestore?.(saved);
      }
    } catch (error) {
      console.error("Failed to restore draft from localStorage:", error);
    }
  }, [key, onRestore]);

  /**
   * Save draft to localStorage
   */
  const saveDraft = useCallback(
    (content: string) => {
      if (!enabled || typeof window === "undefined") return;

      try {
        if (content.trim().length === 0) {
          // Don't save empty drafts
          return;
        }

        localStorage.setItem(key, content);
        onSave?.();

        // Show toast feedback
        toast.success("Brouillon sauvegardé automatiquement", {
          duration: 2000,
          position: "bottom-right",
        });
      } catch (error) {
        console.error("Failed to save draft to localStorage:", error);
        toast.error("Impossible de sauvegarder le brouillon", {
          duration: 3000,
        });
      }
    },
    [key, enabled, onSave]
  );

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
      setRestoredDraft(null);
      setHasDraft(false);
    } catch (error) {
      console.error("Failed to clear draft from localStorage:", error);
    }
  }, [key]);

  // Auto-save with debounce
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Don't trigger auto-save if value hasn't changed
    if (value === previousValueRef.current) return;

    previousValueRef.current = value;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      saveDraft(value);
    }, delay);

    // Cleanup on unmount or value change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, enabled, saveDraft]);

  return {
    restoredDraft,
    hasDraft,
    clearDraft,
    saveDraft,
  };
}
