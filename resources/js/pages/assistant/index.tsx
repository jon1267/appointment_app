import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal} from 'lucide-react';

interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
}

function xsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function Assistant() {
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
        setShowHistory(false)
    }
}