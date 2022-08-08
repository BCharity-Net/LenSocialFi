/* eslint-disable no-unused-vars */
import { BCharityPublication } from '@generated/bcharitytypes'
import create from 'zustand'

interface PublicationState {
  showNewPostModal: boolean
  setShowNewPostModal: (showNewPostModal: boolean) => void
  parentPub: BCharityPublication | null
  setParentPub: (parentPub: BCharityPublication | null) => void
  publicationContent: string
  setPublicationContent: (publicationContent: string) => void
  previewPublication: boolean
  setPreviewPublication: (previewPublication: boolean) => void
}

export const usePublicationStore = create<PublicationState>((set) => ({
  showNewPostModal: false,
  setShowNewPostModal: (showNewPostModal) => set(() => ({ showNewPostModal })),
  parentPub: null,
  setParentPub: (parentPub) => set(() => ({ parentPub })),
  publicationContent: '',
  setPublicationContent: (publicationContent) =>
    set(() => ({ publicationContent })),
  previewPublication: false,
  setPreviewPublication: (previewPublication) =>
    set(() => ({ previewPublication }))
}))
