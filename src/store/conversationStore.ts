import { create } from 'zustand';
import { Conversation } from '@/types';
import fetchConversationList from '@/api/fetchConversationList';

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  addConversation: (conversation: Partial<Conversation>) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  updateConversation: (updatedConversation: Conversation) => void;
}

const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  currentConversation: null,
  addConversation: (conversation: Partial<Conversation>) => {
    set((state) => ({
      conversations: [...state.conversations, conversation as Conversation]
    }));
  },
  setInitialConversationList: async (UserUUID: string) => {
    if (!UserUUID) {     
      return [];
    }

    const convList = await fetchConversationList(UserUUID, {});
    set({
        conversations: await convList,
    });
    return convList;
  },
  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation });
  },
  updateConversation: (updatedConversation: Conversation) => {
    set((state: ConversationState) => ({
      conversations: state.conversations.map((conv: Conversation) =>
        conv.UUID === updatedConversation.UUID ? updatedConversation : conv
      ),
      currentConversation:
        state.currentConversation?.UUID === updatedConversation.UUID
          ? updatedConversation
          : state.currentConversation,
    }));
  },
}));

export default useConversationStore;
