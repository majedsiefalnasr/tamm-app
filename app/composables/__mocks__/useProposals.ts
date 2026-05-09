import type { ProposalData, ProposalPayload } from '~/shared/types/project'

const mockProposals = new Map<string, ProposalData>()
const mockInvitations = new Map<string, string[]>()

export function useProposals() {
  async function submitProposal(projectId: string, payload: ProposalPayload) {
    // TODO: replace mock — POST /projects/:id/proposals
    await new Promise(resolve => setTimeout(resolve, 300))

    const proposal: ProposalData = {
      id: `prop_${Date.now()}`,
      projectId,
      contractorId: 'contractor-1',
      price: payload.price,
      estimatedDays: payload.estimated_days,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockProposals.set(projectId, proposal)
    return { success: true, proposal }
  }

  function getProposal(projectId: string): ProposalData | undefined {
    return mockProposals.get(projectId)
  }

  function hasSubmittedProposal(projectId: string): boolean {
    return mockProposals.has(projectId)
  }

  function setInvitations(projectId: string, contractorIds: string[]) {
    mockInvitations.set(projectId, contractorIds)
  }

  function isContractorInvited(
    projectId: string,
    contractorId: string
  ): boolean {
    const projectInvitations = mockInvitations.get(projectId)
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
