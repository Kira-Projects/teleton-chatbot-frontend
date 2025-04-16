// export interface Message {
//   id: string;
//   content: string;
//   sender: 'user' | 'bot';
//   timestamp: Date;
//   type?: 'text' | 'calendar' | 'options';
//   options?: string[];
// }

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'options' | 'text';
  options?: string[];
}

export interface LastMessage {
  message: string;
  replied: boolean;
  botResponse: string | null;
}

export interface UserInfo {
  name: string;
  rut: string;
  institute: string;
  specialty: string;
  email: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}