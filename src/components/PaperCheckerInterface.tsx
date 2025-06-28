'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import EvaluationResult from '@/components/EvaluationResult';
import FileUploader from '@/components/FileUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PaperCheckerState {
  questionPaper: string;
  answerKey: string;
  studentAnswers: string;
  questionFiles: File[];
  answerFiles: File[];
  studentFiles: File[];
  isProcessing: boolean;
  evaluationResult: string;
  currentStep: 'input' | 'processing' | 'results';
  uploadingType: 'question' | 'answer' | 'student' | null;
  lastUpdated: 'question' | 'answer' | 'student' | null;
}

interface PaperCheckerInterfaceProps {
  onStepChange?: (step: 'input' | 'processing' | 'results') => void;
}

export default function PaperCheckerInterface({
  onStepChange,
}: PaperCheckerInterfaceProps) {
  const [state, setState] = useState<PaperCheckerState>({
    questionPaper: '',
    answerKey: '',
    studentAnswers: '',
    questionFiles: [],
    answerFiles: [],
    studentFiles: [],
    isProcessing: false,
    evaluationResult: '',
    currentStep: 'input',
    uploadingType: null,
    lastUpdated: null,
  });

  const updateState = (updates: Partial<PaperCheckerState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates };
      if (
        onStepChange &&
        updates.currentStep &&
        updates.currentStep !== prev.currentStep
      ) {
        onStepChange(updates.currentStep);
      }
      return newState;
    });
  };

  const _handleFileChange = (
    files: File[],
    type: 'question' | 'answer' | 'student',
  ) => {
    const updateData: Partial<PaperCheckerState> = {};

    switch (type) {
      case 'question':
        updateData.questionFiles = files;
        break;
      case 'answer':
        updateData.answerFiles = files;
        break;
      case 'student':
        updateData.studentFiles = files;
        break;
    }

    updateState(updateData);

    if (files.length > 0) {
      handleFileUpload(files, type);
    }
  };

  const handleFileUpload = async (
    files: File[],
    type: 'question' | 'answer' | 'student',
  ) => {
    if (files.length === 0) return;

    try {
      updateState({
        isProcessing: true,
        uploadingType: type,
        lastUpdated: null,
      });

      let extractedText = '';
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/process-file', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (result.text) {
          extractedText += `${result.text}\n`;
        }
      }

      const updateData: Partial<PaperCheckerState> = {
        isProcessing: false,
        uploadingType: null,
        lastUpdated: type,
      };

      switch (type) {
        case 'question':
          updateData.questionPaper = state.questionPaper + extractedText;
          break;
        case 'answer':
          updateData.answerKey = state.answerKey + extractedText;
          break;
        case 'student':
          updateData.studentAnswers = state.studentAnswers + extractedText;
          break;
      }

      updateState(updateData);

      setTimeout(() => {
        updateState({ lastUpdated: null });
      }, 2000);
    } catch (error) {
      console.error('Error processing files:', error);
      updateState({
        isProcessing: false,
        uploadingType: null,
      });
    }
  };

  const handleEvaluation = async () => {
    if (!state.questionPaper || !state.answerKey || !state.studentAnswers) {
      alert(
        'Please provide all required inputs: question paper, answer key, and student answers',
      );
      return;
    }

    updateState({ isProcessing: true, currentStep: 'processing' });

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionPaper: state.questionPaper,
          answerKey: state.answerKey,
          studentAnswers: state.studentAnswers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Evaluation failed');
      }

      const result = await response.json();
      updateState({
        evaluationResult: result.evaluation,
        currentStep: 'results',
        isProcessing: false,
      });
    } catch (error) {
      console.error('Error during evaluation:', error);
      alert(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
      updateState({ isProcessing: false, currentStep: 'input' });
    }
  };

  const resetForm = () => {
    setState({
      questionPaper: '',
      answerKey: '',
      studentAnswers: '',
      questionFiles: [],
      answerFiles: [],
      studentFiles: [],
      isProcessing: false,
      evaluationResult: '',
      currentStep: 'input',
      uploadingType: null,
      lastUpdated: null,
    });
  };

  const canEvaluate =
    state.questionPaper && state.answerKey && state.studentAnswers;

  if (state.currentStep === 'results') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-black"
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-bold text-white">
                Evaluation Complete
              </h1>
              <p className="text-gray-400 text-lg">
                Your analysis is ready for review
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={resetForm}
              className="px-8 py-4 bg-[#16e16e] hover:bg-[#12c65c] text-black rounded-xl font-semibold transition-all duration-300"
            >
              <span className="flex items-center space-x-2">
                <span>New Evaluation</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </motion.button>
          </div>

          <EvaluationResult result={state.evaluationResult} />
        </div>
      </motion.div>
    );
  }

  if (state.currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          {/* Animated Logo/Icon */}
          <div className="relative">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity },
              }}
              className="relative w-24 h-24 mx-auto"
            >
              <div className="relative w-24 h-24 border-4 border-[#16e16e] rounded-full">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-[#16e16e]" />
                </div>
              </div>
            </motion.div>

            {/* Orbiting particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.5,
                }}
                className="absolute inset-0"
              >
                <div className="w-2 h-2 bg-[#16e16e] rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-bold text-[#16e16e]">
              AI Analysis in Progress
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
              Our advanced neural networks are processing your documents with
              precision and care
            </p>

            {/* Progress indicators */}
            <div className="flex justify-center space-x-2 pt-4">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 bg-[#16e16e] rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-[#16e16e]">Smart Paper</span>
            <br />
            <span className="text-white">Evaluation</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Advanced AI-powered assessment that analyzes student responses with
            precision and provides detailed insights
          </p>
        </motion.div> */}

        {/* Main Interface Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Upload Card */}
            <div className="bg-[#181414] rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-[#16e16e] rounded-xl">
                  <Upload className="w-6 h-6 text-black" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Upload Documents
                </h2>
              </div>

              <Tabs defaultValue="question" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[#181414] rounded-xl p-1">
                  <TabsTrigger
                    value="question"
                    className="data-[state=active]:bg-[#16e16e] data-[state=active]:text-black rounded-lg transition-all duration-300"
                  >
                    Question Paper
                  </TabsTrigger>
                  <TabsTrigger
                    value="answer"
                    className="data-[state=active]:bg-[#16e16e] data-[state=active]:text-black rounded-lg transition-all duration-300"
                  >
                    Answer Key
                  </TabsTrigger>
                  <TabsTrigger
                    value="student"
                    className="data-[state=active]:bg-[#16e16e] data-[state=active]:text-black rounded-lg transition-all duration-300"
                  >
                    Student Answers
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="question" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300 font-medium">
                        Question Paper
                      </span>
                      {state.questionPaper && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="w-5 h-5 text-[#16e16e]" />
                          <span className="text-[#16e16e] text-sm">
                            Uploaded
                          </span>
                        </motion.div>
                      )}
                    </div>
                    <FileUploader
                      files={state.questionFiles}
                      onFilesChange={(files) =>
                        _handleFileChange(files, 'question')
                      }
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      label="Upload Question Paper"
                    />
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-gray-700"></div>
                      <span className="flex-shrink mx-4 text-gray-500 text-sm">
                        OR
                      </span>
                      <div className="flex-grow border-t border-gray-700"></div>
                    </div>
                    <textarea
                      value={state.questionPaper}
                      onChange={(e) =>
                        updateState({ questionPaper: e.target.value })
                      }
                      placeholder="Paste question paper text here"
                      className="w-full bg-[#181414] border border-gray-700 rounded-lg p-4 h-32 focus:ring-2 focus:ring-[#16e16e] focus:border-transparent transition-all duration-300 text-gray-300 resize-none"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="answer" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300 font-medium">
                        Answer Key
                      </span>
                      {state.answerKey && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="w-5 h-5 text-[#16e16e]" />
                          <span className="text-[#16e16e] text-sm">
                            Uploaded
                          </span>
                        </motion.div>
                      )}
                    </div>
                    <FileUploader
                      files={state.answerFiles}
                      onFilesChange={(files) =>
                        _handleFileChange(files, 'answer')
                      }
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      label="Upload Answer Key"
                    />
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-gray-700"></div>
                      <span className="flex-shrink mx-4 text-gray-500 text-sm">
                        OR
                      </span>
                      <div className="flex-grow border-t border-gray-700"></div>
                    </div>
                    <textarea
                      value={state.answerKey}
                      onChange={(e) =>
                        updateState({ answerKey: e.target.value })
                      }
                      placeholder="Paste answer key text here"
                      className="w-full bg-[#181414] border border-gray-700 rounded-lg p-4 h-32 focus:ring-2 focus:ring-[#16e16e] focus:border-transparent transition-all duration-300 text-gray-300 resize-none"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="student" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300 font-medium">
                        Student Answers
                      </span>
                      {state.studentAnswers && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="w-5 h-5 text-[#16e16e]" />
                          <span className="text-[#16e16e] text-sm">
                            Uploaded
                          </span>
                        </motion.div>
                      )}
                    </div>
                    <FileUploader
                      files={state.studentFiles}
                      onFilesChange={(files) =>
                        _handleFileChange(files, 'student')
                      }
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      label="Upload Student Answers"
                    />
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-gray-700"></div>
                      <span className="flex-shrink mx-4 text-gray-500 text-sm">
                        OR
                      </span>
                      <div className="flex-grow border-t border-gray-700"></div>
                    </div>
                    <textarea
                      value={state.studentAnswers}
                      onChange={(e) =>
                        updateState({ studentAnswers: e.target.value })
                      }
                      placeholder="Paste student answers text here"
                      className="w-full bg-[#181414] border border-gray-700 rounded-lg p-4 h-32 focus:ring-2 focus:ring-[#16e16e] focus:border-transparent transition-all duration-300 text-gray-300 resize-none"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>

          {/* Status Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Progress Card */}
            <div className="bg-[#181414] rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-3 h-3 bg-[#16e16e] rounded-full"></div>
                <h3 className="text-xl font-bold text-white">Progress</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'questionPaper',
                    label: 'Question Paper',
                    value: state.questionPaper,
                  },
                  {
                    key: 'answerKey',
                    label: 'Answer Key',
                    value: state.answerKey,
                  },
                  {
                    key: 'studentAnswers',
                    label: 'Student Answers',
                    value: state.studentAnswers,
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`rounded-xl p-4 transition-all duration-300 ${
                      item.value
                        ? 'bg-[#181414] border border-[#16e16e]'
                        : 'bg-[#181414] border border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium ${item.value ? 'text-[#16e16e]' : 'text-gray-400'}`}
                      >
                        {item.label}
                      </span>
                      {item.value ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <CheckCircle className="w-5 h-5 text-[#16e16e]" />
                        </motion.div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-600 rounded-full"></div>
                      )}
                    </div>

                    {item.value && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mt-2 h-1 bg-[#16e16e] rounded-full"
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">
                    Overall Progress
                  </span>
                  <span className="text-sm font-medium text-[#16e16e]">
                    {Math.round(
                      ([
                        state.questionPaper,
                        state.answerKey,
                        state.studentAnswers,
                      ].filter(Boolean).length /
                        3) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-[#181414] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${([state.questionPaper, state.answerKey, state.studentAnswers].filter(Boolean).length / 3) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-[#16e16e] rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{
                scale: canEvaluate ? 1.02 : 1,
                y: canEvaluate ? -2 : 0,
              }}
              whileTap={{ scale: canEvaluate ? 0.98 : 1 }}
              type="button"
              onClick={handleEvaluation}
              disabled={!canEvaluate || state.isProcessing}
              className={`w-full py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-300 ${
                canEvaluate && !state.isProcessing
                  ? 'bg-[#16e16e] hover:bg-[#12c65c] text-black'
                  : 'bg-[#181414] text-gray-500 cursor-not-allowed'
              }`}
            >
              {state.isProcessing ? (
                <div className="flex items-center justify-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full"
                  />
                  <span>Processing Documents...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Sparkles className="w-6 h-6" />
                  <span>Generate AI Evaluation</span>
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
