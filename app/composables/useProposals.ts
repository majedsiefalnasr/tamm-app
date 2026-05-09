import { ref } from 'vue'
import type { ProposalData, ProposalPayload } from '~/shared/types/project'

const proposals = ref<Map<string, ProposalData>>(new Map())
const invitations = ref<Map<string, string[]>>(new Map())

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
          contractorId: response.data.contractor_id || 'current-user',
          price: response.data.price,
          estimatedDays: response.data.estimated_days,
          notes: response.data.notes,
          createdAt: response.data.created_at || new Date().toISOString(),
          updatedAt: response.data.updated_at || new Date().toISOString(),
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

  function isContractorInvited(
    projectId: string,
    contractorId: string
  ): boolean {
    const projectInvitations = invitations.value.get(projectId)
    return projectInvitations?.includes(contractorId) ?? false
  }

  return {
    submitProposal,
    getProposal,
    hasSubmittedProposal,
    setInvitations,
    isContractorInvited,
  }
}
