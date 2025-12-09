export enum UserRole {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR',
  ADMIN = 'ADMIN'
}

export enum OpportunityType {
  SCHOLARSHIP = 'Bourse',
  CONTEST = 'Concours',
  INTERNSHIP = 'Stage',
  TRAINING = 'Formation'
}

export interface User {
  id: string;
  email?: string;
  name: string;
  avatar: string;
  role: UserRole;
  points: number;
  badges: string[];
  university?: string;
  country: string;
  isOnline?: boolean;
  public_key?: string;
  encrypted_private_key?: string;
  mentor_application_status?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

export interface Question {
  id: string;
  author: User;
  title: string;
  content: string;
  tags: string[];
  votes: number;
  answers: number;
  views?: number; // Number of times the question has been viewed
  createdAt: string;
  isSolved: boolean;
  userVote?: number | null; // 1 (upvote), -1 (downvote), ou null
}


export interface Mentor {
  id: string;
  user: User;
  specialties: string[];
  bio: string;
  rating: number;
  reviews: number;
  availability: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  type: OpportunityType;
  deadline: string;
  description: string;
  location: string;
  image: string;
  external_link?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  partner: User;
  messages: Message[];
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'REPLY' | 'MENTORSHIP' | 'ACHIEVEMENT';
  createdAt: string;
  isRead: boolean;
  link?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  author: User;
  content: string;
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  userVote?: number | null;
}