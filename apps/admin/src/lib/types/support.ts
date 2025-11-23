// Support Types
export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  replies: TicketReply[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface TicketReply {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  attachments: string[];
  createdAt: Date;
}

export interface FlaggedMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderName: string;
  message: string;
  reason: string;
  status: 'pending' | 'approved' | 'removed';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface FlaggedReview {
  id: string;
  consultationId: string;
  lawyerId: string;
  lawyerName: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  reason: string;
  status: 'pending' | 'approved' | 'removed';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}
