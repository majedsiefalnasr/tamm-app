import { ref } from 'vue'
import type { ProposalData, ProposalPayload } from '~/shared/types/project'

const proposals = ref<Map<string, ProposalData>>(new Map())
const projectProposals = ref<Map<string, ProposalData[]>>(new Map())
const invitations = ref<Map<string, string[]>>(new Map())
const selectedProposal = ref<Map<string, string>>(new Map())

export function useProposals() {
  async function submitProposal(projectId: string, payload: ProposalPayload) {
    try {
      // TODO: replace mock — POST /projects/:id/proposals
      let response

      try {
        response = await $fetch(`/api/v1/projects/${projectId}/proposals`, {
          method: 'POST',
          body: {
            price: payload.price,
            estimated_days: payload.estimated_days,
            notes: payload.notes,
          },
        })
      } catch (err) {
        // API endpoint not available, use mock
        await new Promise(resolve => setTimeout(resolve, 300))
        response = {
          data: {
            id: `prop_${Date.now()}`,
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
          price: response.data.price,
          estimatedDays: response.data.estimated_days,
          notes: response.data.notes,
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to submit proposal',
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
        const response = await $fetch(`/api/v1/projects/${projectId}/proposals`)
        if (!response?.data || !Array.isArray(response.data)) {
          throw new Error('Invalid proposals response format')
        }
        const proposalsList = response.data.map((p: any) => ({
          id: p.id,
          projectId,
          contractorId: p.contractor_id,
          price: p.price,
          estimatedDays: p.estimated_days,
          notes: p.notes,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          contractorName: p.contractor_name,
        }))
        projectProposals.value.set(projectId, proposalsList)
        return proposalsList
      } catch (err: any) {
        // If 403, user not authorized
        if (err.status === 403) {
          throw new Error(
            'You are not authorized to view proposals for this project'
          )
        }
        // If 404 or other, use mock data for development
        if (!(err.status === 404 || err.message?.includes('404'))) {
          throw err
        }
      }

      // Mock data for development
      // TODO: replace mock — GET /projects/:id/proposals
      await new Promise(resolve => setTimeout(resolve, 300))
      const mockProposals: ProposalData[] = [
        {
          id: 'prop_001',
          projectId,
          contractorId: 'contractor_1',
          contractorName: 'Elite Builders',
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
      projectProposals.value.set(projectId, mockProposals)
      return mockProposals
    } catch (error: any) {
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
