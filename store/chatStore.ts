import { create } from "zustand";

export interface IChat {
  role: string;
  content: string;
}

interface ChatState {
  messages: IChat[];
  streamingResponse: string;
  addMessage: (msg: IChat) => void;
  resetMessages: () => void;
  setStreamingResponse: (msg: string) => void;
  appendStreamingResponse: (chunk: string) => void;
  resetStreamingResponse: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [{ role: "assistant", content: "Hello , I am Jarvis ." }],
  streamingResponse: "",
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  resetMessages: () => set({ messages: [] }),
  setStreamingResponse: (msg) => set({ streamingResponse: msg }),
  appendStreamingResponse: (chunk) =>
    set((state) => ({
      streamingResponse: state.streamingResponse + chunk,
    })),
  resetStreamingResponse: () => set({ streamingResponse: "" }),
}));
