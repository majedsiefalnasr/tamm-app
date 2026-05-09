import { ref } from 'vue'
import type { ProposalData, ProposalPayload } from '~/shared/types/project'

/** Narrow `$fetch` error shape without using `any`. */
function fetchErrorShape(err: unknown): { status?: number; message?: string } {
  if (!err || typeof err !== 'object') return {}
  const e = err as Record<string, unknown>
  return {
    status: typeof e.status === 'number' ? e.status : undefined,
    message: typeof e.message === 'string' ? e.message : undefined,
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

const proposals = ref<Map<string, ProposalData>>(new Map())
const projectProposals = ref<Map<string, ProposalData[]>>(new Map())
const invitations = ref<Map<string, string[]>>(new Map())
const selectedProposal = ref<Map<string, string>>(new Map())

export function useProposals() {
  async function submitProposal(projectId: string, payload: ProposalPayload) {
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
      } catch {
        // API endpoint not available, use mock
        await new Promise(resolve => setTimeout(resolve, 300))
        const auth = useAuthStore()
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
        const proposal: ProposalData = {
          id: response.data.id,
          projectId,
          contractorId: response.data.contractor_id ?? '',
          contractorName: response.data.contractor_name ?? '',
          price: response.data.price,
          estimatedDays: response.data.estimated_days,
          notes: response.data.notes ?? undefined,
          createdAt: response.data.created_at || new Date().toISOString(),
          updatedAt: response.data.updated_at || new Date().toISOString(),
        }
        if (!proposal.contractorId) {
          console.warn('Proposal submitted without contractor_id from API')
        }
        proposals.value.set(projectId, proposal)
        return { success: true, proposal }
      }
      return { success: false }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit proposal'
      return {
        success: false,
        error: message,
      }
    }
  }

  function getProposal(projectId: string): ProposalData | undefined {
    return proposals.value.get(projectId)
  }

  function hasSubmittedProposal(projectId: string): boolean {
    return proposals.value.has(projectId)
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
    return projectInvitations?.includes(contractorId) ?? false
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
        const proposalsList = response.data.map(p => ({
          id: p.id,
          projectId,
          contractorId: p.contractor_id,
          price: p.price,
          estimatedDays: p.estimated_days,
          notes: p.notes ?? undefined,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          contractorName: p.contractor_name ?? '',
        }))
        projectProposals.value.set(projectId, proposalsList)
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
      const mockProposals: ProposalData[] = [
        {
          id: 'prop_001',
          projectId,
          contractorId: myId ? myId : 'contractor_1',
          contractorName: myId
            ? (auth.user?.name ?? 'Elite Builders')
            : 'Elite Builders',
          price: 250000,
          estimatedDays: 90,
          notes: 'Quality workmanship guaranteed with premium materials',
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
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
