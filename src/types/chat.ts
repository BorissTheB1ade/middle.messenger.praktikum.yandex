export type ChatUser = {
  first_name: string;
  second_name: string;
  avatar: string;
  email: string;
  login: string;
  phone: string;
};

export type Chat = {
  id: number;
  title: string;
  avatar: string;
  created_by: number;
  unread_count: number;
  last_message: {
    user: ChatUser;
    time: string;
    content: string;
  };
  token?: string;
  messages?: MessageType[]
};

export type MessageType = {
  id: number;
  user_id: number;
  chat_id: number;
  content: string;
  time: string;
  type: 'message';
  is_read: boolean;
};
