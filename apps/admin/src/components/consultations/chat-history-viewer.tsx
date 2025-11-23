'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { ChatMessage } from '@/lib/types/consultation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ChatHistoryViewerProps {
  messages: ChatMessage[];
  onExport?: () => void;
  className?: string;
}

export function ChatHistoryViewer({ messages, onExport, className }: ChatHistoryViewerProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), 'HH:mm', { locale: ru });
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'd MMMM yyyy', { locale: ru });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.sentAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">История чата</h3>
          <span className="text-sm text-gray-500">({messages.length} сообщений)</span>
        </div>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-4">
            {/* Date divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-500 font-medium">
                {formatDate(new Date(date))}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Messages for this date */}
            {msgs.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.senderType === 'lawyer' && 'flex-row-reverse'
                )}
              >
                {/* Avatar */}
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    className={cn(
                      'text-xs',
                      message.senderType === 'client'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    )}
                  >
                    {getInitials(message.senderName)}
                  </AvatarFallback>
                </Avatar>

                {/* Message content */}
                <div
                  className={cn(
                    'flex flex-col gap-1 max-w-[70%]',
                    message.senderType === 'lawyer' && 'items-end'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900">
                      {message.senderName}
                    </span>
                    <span className="text-xs text-gray-500">{formatTime(message.sentAt)}</span>
                  </div>

                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm',
                      message.senderType === 'client'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-purple-600 text-white'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'flex items-center gap-2 text-xs underline',
                              message.senderType === 'client'
                                ? 'text-blue-600 hover:text-blue-700'
                                : 'text-purple-100 hover:text-white'
                            )}
                          >
                            <FileText className="h-3 w-3" />
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.readAt && (
                    <span className="text-xs text-gray-400">
                      Прочитано {formatTime(message.readAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-gray-500">
            Нет сообщений
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
