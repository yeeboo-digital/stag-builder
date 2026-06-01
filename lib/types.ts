export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateRequest {
  prompt: string;
  conversationHistory: Message[];
}

export interface GenerateResponse {
  result: string;
  updatedHistory: Message[];
  error?: string;
}

export interface QuickStart {
  label: string;
  prompt: string;
}
