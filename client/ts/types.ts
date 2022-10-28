export type User = {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name: string;
  username: string;
};

export type Message = {
  number: number;
  message_id: number;
  from_user_id: number;
  chat_id: number;
  date: Date;
  text: string;
};

export type Photo = {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size: number;
  message_id: number;
};

export type Animation = {
  file_id: string;
  file_unique_id: string;
  file_size: number;
  file_name: string;
  mime_type: string;
  duration: number;
  width: number;
  height: number;
  message_id: number;
};

export type VideoNote = {
  file_id: string;
  file_unique_id: string;
  file_size: number;
  duration: number;
  length: number;
  message_id: number;
};

export type Video = {
  file_id: string;
  file_unique_id: string;
  file_size: number;
  mime_type: string;
  duration: number;
  width: number;
  height: number;
  message_id: number;
};

export type AppMessage = Message & {
  photo: Photo[];
  user: User;
  animation?: Animation;
  videoNote?: VideoNote;
  video?: Video;
};
