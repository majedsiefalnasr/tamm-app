import { ref, computed } from 'vue'
import type { ProjectCreationRequest } from '#shared/types/projectCreationRequest'
import {
  MOCK_PROJECT_CREATION_REQUESTS,
  MOCK_SUPERVISOR_OPTIONS,
} from '~/composables/__mocks__/admin-project-creation-requests'

/**
 * Local mock queue for admin “new project creation” requests.
 * TODO: replace mock — wire to Laravel when contract is in docs/api-contracts.md.
 */
export function useAdminProjectCreationRequests() {
  const requests = ref<ProjectCreationRequest[]>([
    ...MOCK_PROJECT_CREATION_REQUESTS,
  ])

  const pendingCount = computed(() => requests.value.length)

  const supervisorOptions = MOCK_SUPERVISOR_OPTIONS

  function removeRequest(id: string) {
    requests.value = requests.value.filter(r => r.id !== id)
  }

  return {
    requests,
    pendingCount,
    supervisorOptions,
    removeRequest,
  }
}
