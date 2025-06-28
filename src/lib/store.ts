import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

export interface StudySession {
  id: string;
  title: string;
  subject: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
  type: 'tutor' | 'code-mentor' | 'assessment' | 'language' | 'study-companion';
}

export interface UserProgress {
  totalSessions: number;
  totalMessages: number;
  subjects: { [key: string]: number }; // subject -> session count
  streakDays: number;
  lastActiveDate: string;
  achievements: Achievement[];
  learningPreferences: {
    style: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    topics: string[];
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'streak' | 'sessions' | 'subjects' | 'special';
}

export interface AppState {
  // Current session
  currentSession: StudySession | null;
  isLoading: boolean;

  // User data
  user: {
    name: string;
    progress: UserProgress;
  };

  // Sessions history
  sessions: StudySession[];

  // UI state
  sidebarOpen: boolean;
  currentMode:
    | 'tutor'
    | 'code-mentor'
    | 'assessment'
    | 'language'
    | 'study-companion';

  // Actions
  createSession: (
    type: StudySession['type'],
    title: string,
    subject: string,
  ) => void;
  addMessage: (
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>,
  ) => void;
  setCurrentSession: (session: StudySession | null) => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentMode: (mode: AppState['currentMode']) => void;
  updateUserProgress: (updates: Partial<UserProgress>) => void;
  addAchievement: (achievement: Omit<Achievement, 'unlockedAt'>) => void;
  deleteSession: (sessionId: string) => void;
}

const ACHIEVEMENTS_DEFINITIONS = [
  {
    id: 'first-session',
    title: 'Getting Started',
    description: 'Complete your first learning session',
    icon: '🎯',
    category: 'sessions' as const,
    trigger: (progress: UserProgress) => progress.totalSessions >= 1,
  },
  {
    id: 'week-streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    category: 'streak' as const,
    trigger: (progress: UserProgress) => progress.streakDays >= 7,
  },
  {
    id: 'polymath',
    title: 'Polymath',
    description: 'Study 5 different subjects',
    icon: '🧠',
    category: 'subjects' as const,
    trigger: (progress: UserProgress) =>
      Object.keys(progress.subjects).length >= 5,
  },
  {
    id: 'century',
    title: 'Century Club',
    description: 'Send 100 messages',
    icon: '💬',
    category: 'sessions' as const,
    trigger: (progress: UserProgress) => progress.totalMessages >= 100,
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      isLoading: false,
      user: {
        name: 'Student',
        progress: {
          totalSessions: 0,
          totalMessages: 0,
          subjects: {},
          streakDays: 0,
          lastActiveDate: new Date().toDateString(),
          achievements: [],
          learningPreferences: {
            style: 'mixed',
            difficulty: 'intermediate',
            topics: [],
          },
        },
      },
      sessions: [],
      sidebarOpen: false,
      currentMode: 'tutor',

      // Actions
      createSession: (type, title, subject) => {
        const newSession: StudySession = {
          id: crypto.randomUUID(),
          title,
          subject,
          messages: [],
          createdAt: new Date(),
          lastActivity: new Date(),
          type,
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSession: newSession,
        }));

        // Update progress
        get().updateUserProgress({
          totalSessions: get().user.progress.totalSessions + 1,
          subjects: {
            ...get().user.progress.subjects,
            [subject]: (get().user.progress.subjects[subject] || 0) + 1,
          },
        });
      },

      addMessage: (sessionId, message) => {
        const messageWithId: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, messageWithId],
                  lastActivity: new Date(),
                }
              : session,
          ),
          currentSession:
            state.currentSession?.id === sessionId
              ? {
                  ...state.currentSession,
                  messages: [...state.currentSession.messages, messageWithId],
                  lastActivity: new Date(),
                }
              : state.currentSession,
        }));

        // Update message count
        get().updateUserProgress({
          totalMessages: get().user.progress.totalMessages + 1,
        });
      },

      setCurrentSession: (session) => set({ currentSession: session }),
      setLoading: (loading) => set({ isLoading: loading }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentMode: (mode) => set({ currentMode: mode }),

      updateUserProgress: (updates) => {
        set((state) => {
          const newProgress = { ...state.user.progress, ...updates };

          // Check for new achievements
          const currentAchievements = newProgress.achievements.map((a) => a.id);
          const newAchievements = ACHIEVEMENTS_DEFINITIONS.filter(
            (def) =>
              !currentAchievements.includes(def.id) && def.trigger(newProgress),
          ).map((def) => ({
            id: def.id,
            title: def.title,
            description: def.description,
            icon: def.icon,
            category: def.category,
            unlockedAt: new Date(),
          }));

          return {
            user: {
              ...state.user,
              progress: {
                ...newProgress,
                achievements: [...newProgress.achievements, ...newAchievements],
              },
            },
          };
        });
      },

      addAchievement: (achievement) => {
        set((state) => ({
          user: {
            ...state.user,
            progress: {
              ...state.user.progress,
              achievements: [
                ...state.user.progress.achievements,
                { ...achievement, unlockedAt: new Date() },
              ],
            },
          },
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSession:
            state.currentSession?.id === sessionId
              ? null
              : state.currentSession,
        }));
      },
    }),
    {
      name: 'ai-education-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        sessions: state.sessions,
        currentMode: state.currentMode,
      }),
    },
  ),
);
