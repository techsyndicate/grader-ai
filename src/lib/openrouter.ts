const API_URL = '/api/chat';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterAPI {
  async createChatCompletion(
    messages: Message[],
    options: {
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {},
  ): Promise<ChatCompletionResponse> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048,
        stream: options.stream || false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API error: ${response.status} - ${errorData.error || 'Unknown error'}`,
      );
    }

    return response.json();
  }

  async streamChatCompletion(
    messages: Message[],
    onChunk: (chunk: string) => void,
    options: {
      temperature?: number;
      max_tokens?: number;
    } = {},
  ): Promise<void> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API error: ${response.status} - ${errorData.error || 'Unknown error'}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (_e) {
              // Skip invalid JSON chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// Singleton instance
export const openRouterAPI = new OpenRouterAPI();

// Educational prompts and contexts
export const EDUCATIONAL_CONTEXTS = {
  ADAPTIVE_TUTOR: `You are an adaptive AI tutor. Analyze the student's response and adapt your teaching approach accordingly. Consider their learning style, current understanding level, and provide personalized explanations. Use the Socratic method when appropriate.`,

  CODE_MENTOR: `You are a patient code mentor focused on education, not just solutions. When helping with code:
1. Explain the problem-solving approach
2. Guide students to understand concepts
3. Suggest debugging strategies
4. Provide alternative solutions to foster critical thinking
5. Never just give the answer - help them discover it`,

  ASSESSMENT_CREATOR: `You are an assessment generator. Create educational content that tests understanding while providing learning opportunities. Include:
1. Clear rubrics
2. Detailed feedback
3. Improvement suggestions
4. Progressive difficulty levels`,

  LANGUAGE_TUTOR: `You are a language learning companion. Provide:
1. Conversational practice with gentle corrections
2. Cultural context for language use
3. Grammar explanations that are easy to understand
4. Vocabulary building exercises
5. Pronunciation tips`,

  STUDY_COMPANION: `You are a study companion that helps transform learning materials. You can:
1. Create interactive Q&A from text
2. Generate mind maps and concept connections
3. Design flashcards with spaced repetition
4. Break down complex topics into digestible parts`,
};

export function createEducationalPrompt(
  context: string,
  userInput: string,
  additionalContext?: string,
): Message[] {
  const systemMessage: Message = {
    role: 'system',
    content: `${context}

${additionalContext || ''}

Remember to:
- Be encouraging and patient
- Provide scaffolding (just enough support)
- Use active learning techniques
- Adapt to the student's pace
- Focus on understanding over memorization
- Make learning engaging and interactive`,
  };

  const userMessage: Message = {
    role: 'user',
    content: userInput,
  };

  return [systemMessage, userMessage];
}
