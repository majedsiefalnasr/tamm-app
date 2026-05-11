import { ref } from 'vue'

/** Preview row for a conversation thread (UI shell). */
export interface MessagesConversationPreview {
  id: string
  title: string
  lastMessagePreview: string
  updatedAt: string
}

/**
 * Workspace data for `/messages`.
 * // TODO: replace mock — wire to messaging API when marked Available in docs/api-contracts.md
 */
export function useMessagesWorkspace() {
  const conversations = ref<MessagesConversationPreview[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchWorkspace(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 400)
      })
      conversations.value = []
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e ?? 'unknown')
    } finally {
      loading.value = false
    }
  }

  return {
    conversations,
    loading,
    error,
    fetchWorkspace,
  }
}
