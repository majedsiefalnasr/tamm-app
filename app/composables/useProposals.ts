import { ref } from 'vue'
import type { ProposalData, ProposalPayload } from '~/shared/types/project'

/** Narrow `$fetch` error shape without using `any`. */
function fetchErrorShape(err: unknown): {
  status?: number
  message?: string
  fieldErrors?: Record<string, string[]>
} {
  if (!err || typeof err !== 'object') return {}
  const e = err as Record<string, unknown>
  const response = e.response as Record<string, unknown> | undefined
  const data = (e.data ?? response?.data) as Record<string, unknown> | undefined
  const errors = data?.errors

  return {
    status:
      typeof e.statusCode === 'number'
        ? e.statusCode
        : typeof e.status === 'number'
          ? e.status
          : typeof response?.status === 'number'
            ? response.status
            : undefined,
    message:
      typeof data?.message === 'string'
        ? data.message
        : typeof e.message === 'string'
          ? e.message
          : undefined,
    fieldErrors:
      errors && typeof errors === 'object'
        ? (errors as Record<string, string[]>)
        : undefined,
  }
}

interface ApiProposalRow {
  id: string
  contractor_id: string
  price: number
  estimated_days: number
  notes?: string | null
  created_at: string
  updated_at: string
  contractor_name?: string | null
}

interface ProposalSubmitResponseData {
  id: string
  contractor_id?: string
  contractor_name?: string | null
  price: number
  estimated_days: number
  notes?: string | null
  created_at: string
  updated_at: string
}

interface ProposalSubmitApiResponse {
  data: ProposalSubmitResponseData
}

interface ProposalListApiResponse {
  data: ApiProposalRow[]
}

interface ProposalSubmitResult {
  success: boolean
  proposal?: ProposalData
  error?: string
  fieldErrors?: Record<string, string[]>
}

const proposals = ref<Map<string, ProposalData>>(new Map())
const projectProposals = ref<Map<string, ProposalData[]>>(new Map())
const invitations = ref<Map<string, string[]>>(new Map())
const selectedProposal = ref<Map<string, string>>(new Map())

const proposalStorageKey = (projectId: string) => `tamm:proposal:${projectId}`

function storeProposal(proposal: ProposalData) {
  proposals.value.set(proposal.projectId, proposal)

  if (import.meta.client) {
    localStorage.setItem(
      proposalStorageKey(proposal.projectId),
      JSON.stringify(proposal)
    )
  }
}

function removeStoredProposal(projectId: string) {
  proposals.value.delete(projectId)

  if (import.meta.client) {
    localStorage.removeItem(proposalStorageKey(projectId))
  }
}

function loadStoredProposal(projectId: string): ProposalData | undefined {
  const proposal = proposals.value.get(projectId)
  if (proposal || !import.meta.client) return proposal

  const rawProposal = localStorage.getItem(proposalStorageKey(projectId))
  if (!rawProposal) return undefined

  try {
    const parsed = JSON.parse(rawProposal) as ProposalData
    if (parsed.projectId === projectId) {
      proposals.value.set(projectId, parsed)
      return parsed
    }
  } catch {
    localStorage.removeItem(proposalStorageKey(projectId))
  }

  return undefined
}

function toProposalData(
  projectId: string,
  data: ProposalSubmitResponseData
): ProposalData {
  return {
    id: data.id,
    projectId,
    contractorId: data.contractor_id ?? '',
    contractorName: data.contractor_name ?? '',
    price: data.price,
    estimatedDays: data.estimated_days,
    notes: data.notes ?? undefined,
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
  }
}

export function useProposals() {
  async function submitProposal(
    projectId: string,
    payload: ProposalPayload
  ): Promise<ProposalSubmitResult> {
    const auth = useAuthStore()
    const previousProposal = proposals.value.get(projectId)
    const optimisticProposal: ProposalData = {
      id: `optimistic_${Date.now()}`,
      projectId,
      contractorId: auth.user?.id ?? '',
      contractorName: auth.user?.name ?? '',
      price: payload.price,
      estimatedDays: payload.estimated_days,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    storeProposal(optimisticProposal)

    try {
      // TODO: replace mock — POST /projects/:id/proposals
      let response: ProposalSubmitApiResponse

      try {
        response = await $fetch<ProposalSubmitApiResponse>(
          `/api/v1/projects/${projectId}/proposals`,
          {
            method: 'POST',
            body: {
              price: payload.price,
              estimated_days: payload.estimated_days,
              notes: payload.notes,
            },
          }
        )
      } catch (err: unknown) {
        const { status } = fetchErrorShape(err)
        if (status !== 404 && status !== 501) {
          throw err
        }

        // API endpoint not available, use mock
        await new Promise(resolve => setTimeout(resolve, 300))
        response = {
          data: {
            id: `prop_${Date.now()}`,
            contractor_id: auth.user?.id,
            contractor_name: auth.user?.name ?? null,
            price: payload.price,
            estimated_days: payload.estimated_days,
            notes: payload.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }
      }

      if (response?.data) {
        const proposal = toProposalData(projectId, response.data)
        if (!proposal.contractorId) {
          console.warn('Proposal submitted without contractor_id from API')
        }
        storeProposal(proposal)
        return { success: true, proposal }
      }
      return { success: false }
    } catch (error: unknown) {
      if (previousProposal) {
        storeProposal(previousProposal)
      } else {
        removeStoredProposal(projectId)
      }

      const { message, fieldErrors } = fetchErrorShape(error)
      return {
        success: false,
        error:
          message ||
          (error instanceof Error
            ? error.message
            : 'Failed to submit proposal'),
        fieldErrors,
      }
    }
  }

  function getProposal(projectId: string): ProposalData | undefined {
    return loadStoredProposal(projectId)
  }

  function hasSubmittedProposal(projectId: string): boolean {
    return Boolean(loadStoredProposal(projectId))
  }

  function setInvitations(projectId: string, contractorIds: string[]) {
    invitations.value.set(projectId, contractorIds)
  }

  function getInvitations(projectId: string): string[] {
    return invitations.value.get(projectId) ?? []
  }

  function isContractorInvited(
    projectId: string,
    contractorId: string
  ): boolean {
    const projectInvitations = invitations.value.get(projectId)
    if (projectInvitations) return projectInvitations.includes(contractorId)

    // Mock open-bid project is already filtered into contractor project lists.
    return projectId === 'proj-bid-open-001' && Boolean(contractorId)
  }

  async function getProjectProposals(
    projectId: string
  ): Promise<ProposalData[]> {
    try {
      // Try to fetch from API
      try {
        const response = await $fetch<ProposalListApiResponse>(
          `/api/v1/projects/${projectId}/proposals`
        )
        if (!response?.data || !Array.isArray(response.data)) {
          throw new Error('Invalid proposals response format')
        }
        const proposalsList = response.data.map(p =>
          toProposalData(projectId, {
            id: p.id,
            contractor_id: p.contractor_id,
            contractor_name: p.contractor_name,
            price: p.price,
            estimated_days: p.estimated_days,
            notes: p.notes,
            created_at: p.created_at,
            updated_at: p.updated_at,
          })
        )
        projectProposals.value.set(projectId, proposalsList)
        const auth = useAuthStore()
        const myProposal = proposalsList.find(
          p => p.contractorId === auth.user?.id
        )
        if (myProposal) {
          storeProposal(myProposal)
        }
        return proposalsList
      } catch (err: unknown) {
        const { status, message } = fetchErrorShape(err)
        // If 403, user not authorized
        if (status === 403) {
          throw new Error(
            'You are not authorized to view proposals for this project'
          )
        }
        // If 404 or other, use mock data for development
        if (!(status === 404 || message?.includes('404'))) {
          throw err
        }
      }

      // Mock data for development
      // TODO: replace mock — GET /projects/:id/proposals
      await new Promise(resolve => setTimeout(resolve, 300))
      const auth = useAuthStore()
      const myId = auth.user?.id?.trim() ?? ''
      const submittedProposal = loadStoredProposal(projectId)
      const mockProposals: ProposalData[] = [
        ...(submittedProposal ? [submittedProposal] : []),
        {
          id: 'prop_002',
          projectId,
          contractorId: 'contractor_2',
          contractorName: 'BuildRight Corp',
          price: 280000,
          estimatedDays: 75,
          notes: 'Fast-track delivery with experienced team',
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ]
      const role = auth.user?.role
      const visibleProposals =
        role === 'contractor'
          ? myId
            ? mockProposals.filter(p => p.contractorId === myId)
            : []
          : mockProposals

      projectProposals.value.set(projectId, visibleProposals)
      return visibleProposals
    } catch (error: unknown) {
      console.error('Failed to fetch proposals:', error)
      throw error
    }
  }

  function setSelectedProposal(projectId: string, proposalId: string) {
    selectedProposal.value.set(projectId, proposalId)
  }

  function getSelectedProposal(projectId: string): string | undefined {
    return selectedProposal.value.get(projectId)
  }

  return {
    submitProposal,
    getProposal,
    hasSubmittedProposal,
    setInvitations,
    getInvitations,
    isContractorInvited,
    getProjectProposals,
    setSelectedProposal,
    getSelectedProposal,
  }
}
