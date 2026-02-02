'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
  useResolvedUserId,
} from '@/firebase';
import { collection, query, orderBy, serverTimestamp, addDoc } from 'firebase/firestore';
import type { Message, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/lib/placeholder-images';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { filterProfanity } from '@/lib/profanity-filter';

const messageFormSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty.').max(500, 'Message is too long.'),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

export default function ForumPage() {
  const { user, isUserLoading } = useUser();
  const resolvedUserId = useResolvedUserId();
  const firestore = useFirestore();
  const { toast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { text: '' },
  });

  const messagesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'messages'), orderBy('createdAt', 'asc')) : null,
    [firestore]
  );
  const usersQuery = useMemoFirebase(
    () => firestore ? collection(firestore, 'users') : null,
    [firestore]
  );

  const { data: messages, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const userMap = React.useMemo(() => {
    if (!users) return { byId: new Map(), byName: new Map() };
    return {
      byId: new Map(users.map((u) => [u.id, u])),
      byName: new Map(users.map((u) => [u.name, u])),
    };
  }, [users]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (messages) {
        scrollToBottom();
    }
  }, [messages]);


  const renderMessageText = (text: string) => {
    if (!users || users.length === 0) {
      return text;
    }
  
    // Split by mentions to highlight them
    const parts = text.split(/(@\w+(?:\s\w+)*)/g);
  
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const potentialName = part.substring(1);
        const mentionedUser = userMap.byName.get(potentialName);
        if (mentionedUser) {
          return (
            <strong key={index} className="text-primary font-semibold">
              {part}
            </strong>
          );
        }
      }
      return part;
    });
  };

  const onSubmit = async (data: MessageFormValues) => {
    if (!firestore || !user || !resolvedUserId) {
      toast({ variant: 'destructive', title: 'You must be logged in to send a message.' });
      return;
    }
    
    const userProfile = userMap.byId.get(resolvedUserId);
    if (!userProfile) {
        toast({ variant: 'destructive', title: 'Could not find your user profile.' });
        return;
    }

    // Convert profanity to amusing alternatives
    const cleanedText = filterProfanity(data.text);

    // Basic mention parsing
    const mentionedUsers = new Set<string>();
    if (users) {
      users.forEach(u => {
        if (data.text.includes(`@${u.name}`)) {
          mentionedUsers.add(u.id);
        }
      });
    }

    const newMessage: Omit<Message, 'id'> = {
      userId: resolvedUserId,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      text: cleanedText,
      createdAt: serverTimestamp(),
      mentions: Array.from(mentionedUsers),
    };

    try {
      await addDoc(collection(firestore, 'messages'), newMessage);
      form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ variant: 'destructive', title: 'Failed to send message.' });
    }
  };

  const isLoading = isUserLoading || messagesLoading || usersLoading;

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
       <Card className="flex-1 flex flex-col">
            <CardHeader>
                <CardTitle>Chat Forum</CardTitle>
                <CardDescription>Discuss predictions, celebrate wins, and talk trash with fellow players.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-4">
                {isLoading && !messages ? (
                     <div className="flex h-full items-center justify-center">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                     </div>
                ) : (
                    <div className="space-y-6">
                        {messages?.map((message) => {
                            const sender = userMap.byId.get(message.userId);
                            return (
                                <div key={message.id} className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src={getAvatarUrl(sender?.avatar)} data-ai-hint="person" />
                                        <AvatarFallback>{sender?.name?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-semibold">{sender?.name || 'Unknown User'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {message.createdAt?.toDate 
                                                    ? formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true }) 
                                                    : 'Just now'}
                                            </p>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{renderMessageText(message.text)}</p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </CardContent>
       </Card>
       <div className="mt-4">
        {user ? (
             <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
                <Textarea
                    {...form.register('text')}
                    placeholder="Type your message... Use @ to mention players."
                    className="flex-1"
                    rows={2}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                        }
                    }}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin"/> : <Send className="size-4" />}
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        ) : (
            <div className="text-center text-muted-foreground">
                <Link href="/profile" className="text-primary hover:underline">Sign in</Link> to join the conversation.
            </div>
        )}
       </div>
    </div>
  );
}
