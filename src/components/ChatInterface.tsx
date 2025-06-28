'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import {
  openRouterAPI,
  createEducationalPrompt,
  EDUCATIONAL_CONTEXTS,
} from '@/lib/openrouter';
import { Button } from '@/components/ui/Button';
import { ChatMessage } from '@/components/ChatMessage';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

const MODE_CONFIGS = {
  tutor: {
    title: 'Adaptive Learning Tutor',
    description: 'Get personalized tutoring that adapts to your learning style',
    context: EDUCATIONAL_CONTEXTS.ADAPTIVE_TUTOR,
    placeholder: 'Ask me anything about your studies...',
    icon: '🧑‍🏫',
  },
  'code-mentor': {
    title: 'Code Mentor',
    description:
      'Learn programming with guided explanations and debugging help',
    context: EDUCATIONAL_CONTEXTS.CODE_MENTOR,
    placeholder: 'Share your code or ask about programming concepts...',
    icon: '👩‍💻',
  },
  assessment: {
    title: 'Assessment Creator',
    description: 'Generate quizzes, tests, and get detailed feedback',
    context: EDUCATIONAL_CONTEXTS.ASSESSMENT_CREATOR,
    placeholder: 'What topic would you like to be assessed on?',
    icon: '📋',
  },
  language: {
    title: 'Language Learning',
    description: 'Practice conversations and improve your language skills',
    context: EDUCATIONAL_CONTEXTS.LANGUAGE_TUTOR,
    placeholder: "Let's practice! What would you like to talk about?",
    icon: '🗣️',
  },
  'study-companion': {
    title: 'Study Companion',
    description: 'Transform materials into interactive learning experiences',
    context: EDUCATIONAL_CONTEXTS.STUDY_COMPANION,
    placeholder:
      'Share your study materials or ask for help organizing them...',
    icon: '📚',
  },
};

export function ChatInterface() {
  const {
    currentSession,
    currentMode,
    isLoading,
    setLoading,
    addMessage,
    createSession,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeConfig = MODE_CONFIGS[currentMode];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, streamingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    let sessionId = currentSession?.id;
    if (!sessionId) {
      const title =
        userMessage.length > 50
          ? `${userMessage.slice(0, 50)}...`
          : userMessage;
      createSession(currentMode, title, 'General');
      sessionId = useAppStore.getState().currentSession?.id;
    }

    if (!sessionId) return;

    addMessage(sessionId, {
      role: 'user',
      content: userMessage,
      context: currentMode,
    });

    setLoading(true);
    setStreamingMessage('');

    try {
      const conversationHistory =
        currentSession?.messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })) || [];

      const messages = createEducationalPrompt(
        modeConfig.context,
        userMessage,
        `Previous conversation: ${JSON.stringify(conversationHistory.slice(-6))}`,
      );

      await openRouterAPI.streamChatCompletion(messages, (chunk) => {
        setStreamingMessage((prev) => prev + chunk);
      });

      const _finalMessage =
        streamingMessage +
        (await new Promise<string>((resolve) => {
          const checkComplete = () => {
            const current = useAppStore.getState();
            if (!current.isLoading) {
              resolve(streamingMessage);
            } else {
              setTimeout(checkComplete, 100);
            }
          };
          checkComplete();
        }));

      addMessage(sessionId, {
        role: 'assistant',
        content: streamingMessage,
        context: currentMode,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage(sessionId, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        context: currentMode,
      });
    } finally {
      setLoading(false);
      setStreamingMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {!currentSession?.messages.length && !streamingMessage && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{modeConfig.icon}</div>
            <h2 className="text-2xl font-semibold mb-2 text-white">
              Welcome to{' '}
              <span className="text-gradient-green">{modeConfig.title}</span>
            </h2>
            <p className="text-[var(--text-muted)] max-w-md mx-auto">
              {modeConfig.description}. Start by asking a question or sharing
              what you'd like to learn!
            </p>
          </div>
        )}

        {currentSession?.messages.map((message, _index) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {streamingMessage && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-black text-sm font-medium flex-shrink-0">
              AI
            </div>
            <div className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
              <div className="prose prose-invert max-w-none">
                {streamingMessage}
                <span className="inline-block w-2 h-4 bg-[var(--accent)] ml-1 animate-pulse"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--border)] bg-[var(--card)] px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={modeConfig.placeholder}
              disabled={isLoading}
              rows={1}
              className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-4 py-3 text-white placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
              style={{
                minHeight: '48px',
                maxHeight: '120px',
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
            Send
          </Button>
        </form>

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInput('Explain this concept: ')}
            className="px-3 py-1 text-xs bg-[var(--secondary)] border border-[var(--border)] rounded-full text-[var(--text-light)] hover:border-[var(--accent)] hover:text-white transition-colors"
          >
            💡 Explain concept
          </button>
          <button
            type="button"
            onClick={() => setInput('Help me debug this code: ')}
            className="px-3 py-1 text-xs bg-[var(--secondary)] border border-[var(--border)] rounded-full text-[var(--text-light)] hover:border-[var(--accent)] hover:text-white transition-colors"
          >
            🐛 Debug code
          </button>
          <button
            type="button"
            onClick={() => setInput('Give me practice problems for: ')}
            className="px-3 py-1 text-xs bg-[var(--secondary)] border border-[var(--border)] rounded-full text-[var(--text-light)] hover:border-[var(--accent)] hover:text-white transition-colors"
          >
            🎯 Practice problems
          </button>
          <button
            type="button"
            onClick={() => setInput('Review my solution: ')}
            className="px-3 py-1 text-xs bg-[var(--secondary)] border border-[var(--border)] rounded-full text-[var(--text-light)] hover:border-[var(--accent)] hover:text-white transition-colors"
          >
            📝 Review code
          </button>
        </div>
      </div>
    </div>
  );
}
