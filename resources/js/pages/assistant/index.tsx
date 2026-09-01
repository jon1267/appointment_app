import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Bot, History, Plus, User, Stethoscope} from 'lucide-react';
import type { ConversationMessage, ConversationSummary} from '@/types/clinic';

interface Props {
    conversations:  ConversationSummary[];
}

interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
}

function xsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function Assistant({ conversations }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    async function send(text: string) {
        const content = text.trim();
        if (!content || loading) return;

        setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/assistant/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': xsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ message: content, conversation_id: conversationId }),
            });

            if (! res.ok) throw new Error('Request failed');

            const data: { reply: string; conversation_id: string | null } = await res.json();
            setConversationId(data.conversation_id);
            setMessages((prev) => [...prev, {id: Date.now() + 1, role: 'assistant', content: data.reply }]);
        } catch (error) {
            setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Sorry, something went wrong.' }]);
        } finally {
            setLoading(false);
        }
    }

    function newChat() {
        setMessages([]);
        setConversationId(null);
        setShowHistory(false);
    }

    async function loadConversation(id: string) {
        setShowHistory(false);
        setLoading(true);
        try {
            const res = await fetch(`/assistant/conversations/${id}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) throw new Error('Failed to load');
            const data: { conversation_id: string; messages: ConversationMessage[] } = await res.json();
            setMessages(data.messages.map((m, index) => ({ id: index, role: m.role, content: m.content })));
            setConversationId(data.conversation_id);
        } catch {
            // Ignore; keep current chat.
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col gap-4 p-4">
            <div className="flex-1 space-y-3 overflow-y-auto">

                <div className='flex items-center gap-3'>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Stethoscope className="size-5" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">Appointment Assistant</h1>
                        <p className="text-sm text-muted-foreground">Describe your symptoms and I'll help you book a doctor.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={newChat}>
                            <Plus className="mr-1 size-4" /> New
                        </Button>
                        {conversations.length > 0 && (
                            <Button variant="outline" size="sm" onClick={() => setShowHistory((v) => !v)}>
                                <History className="mr-1 size-4" /> History
                            </Button>
                        )}
                    </div>
                </div>

                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                            message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                            {message.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="animate-pulse">Thinking…</span>
                    </div>
                )}
                <div ref={bottomRef} />

            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message…" disabled={loading} autoFocus />
                <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                    <SendHorizonal className="size-4" />
                </Button>
            </form>

        </div>
    );

    /*function newChat() {
        setMessages([]);
        setConversationId(null);
        setShowHistory(false)
    }*/
}