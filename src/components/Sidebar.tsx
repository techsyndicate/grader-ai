'use client';

import {
  AcademicCapIcon,
  Bars3Icon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  CodeBracketIcon,
  PlusIcon,
  TrashIcon,
  TrophyIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';
import { formatRelativeTime, truncateText } from '@/lib/utils';

const MODE_ICONS = {
  tutor: AcademicCapIcon,
  'code-mentor': CodeBracketIcon,
  assessment: ClipboardDocumentListIcon,
  language: ChatBubbleLeftRightIcon,
  'study-companion': BookOpenIcon,
};

const MODE_LABELS = {
  tutor: 'Adaptive Tutor',
  'code-mentor': 'Code Mentor',
  assessment: 'Assessment',
  language: 'Language Learning',
  'study-companion': 'Study Companion',
};

export function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    currentMode,
    setCurrentMode,
    currentSession,
    setCurrentSession,
    sessions,
    deleteSession,
    user,
  } = useAppStore();

  const [showAchievements, setShowAchievements] = useState(false);

  const filteredSessions = sessions.filter(
    (session) => session.type === currentMode,
  );

  const handleNewSession = () => {
    setCurrentSession(null);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-[var(--card)] border-r border-[var(--border)] transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></div>
              <h2 className="text-lg font-semibold text-white">AI Education</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* User Progress */}
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAchievements(!showAchievements)}
              >
                <TrophyIcon className="h-4 w-4 text-[var(--accent)]" />
                <span className="ml-1 text-xs text-[var(--accent)]">
                  {user.progress.achievements.length}
                </span>
              </Button>
            </div>
            <div className="text-xs text-[var(--text-muted)] space-y-1">
              <div>
                Sessions:{' '}
                <span className="text-[var(--accent)]">
                  {user.progress.totalSessions}
                </span>
              </div>
              <div>
                Messages:{' '}
                <span className="text-[var(--accent)]">
                  {user.progress.totalMessages}
                </span>
              </div>
              <div>
                Streak:{' '}
                <span className="text-[var(--accent)]">
                  {user.progress.streakDays} days
                </span>
              </div>
            </div>

            {showAchievements && (
              <div className="mt-3 space-y-2">
                <h4 className="text-xs font-medium text-white">
                  Recent Achievements
                </h4>
                {user.progress.achievements.slice(-3).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-2 text-xs p-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                  >
                    <span>{achievement.icon}</span>
                    <span className="text-[var(--text-light)]">
                      {achievement.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mode Selection */}
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-medium mb-3 text-white">
              Learning Modes
            </h3>
            <div className="space-y-1">
              {Object.entries(MODE_LABELS).map(([mode, label]) => {
                const Icon = MODE_ICONS[mode as keyof typeof MODE_ICONS];
                const isActive = currentMode === mode;

                return (
                  <button
                    key={mode}
                    onClick={() => setCurrentMode(mode as any)}
                    type="button"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-[var(--accent)] text-black'
                        : 'text-[var(--text-light)] hover:bg-[var(--secondary)] hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sessions */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">
                  {MODE_LABELS[currentMode]} Sessions
                </h3>
                <Button variant="ghost" size="sm" onClick={handleNewSession}>
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {filteredSessions.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] italic">
                    No sessions yet. Start a new conversation!
                  </p>
                ) : (
                  filteredSessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      className={`group relative rounded-lg border cursor-pointer transition-colors w-full text-left ${
                        currentSession?.id === session.id
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                          : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                      }`}
                      onClick={() => setCurrentSession(session)}
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">
                              {truncateText(session.title, 40)}
                            </h4>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {session.subject} • {session.messages.length}{' '}
                              messages
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {formatRelativeTime(session.lastActivity)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <TrashIcon className="h-4 w-4 text-red-400 hover:text-red-300" />
                          </Button>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] text-center">
              AI Education Platform
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden"
      >
        <Bars3Icon className="h-5 w-5" />
      </Button>
    </>
  );
}
