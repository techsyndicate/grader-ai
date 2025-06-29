'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const stats: Array<{ number: string; label: string }> = [
    // { number: '30%', label: 'Time Saved' },
    // { number: '10k+', label: 'Graded Papers' },
    // { number: '500+', label: 'Teachers' },
  ];

  return (
    <div className="h-full bg-black text-white overflow-x-hidden overflow-y-hidden">
      <nav className="fixed top-0 w-full z-50 bg-[#08100C] backdrop-blur-s">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-1.5 sm:space-x-2 relative top-[1px]"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#00ff88] rounded-full"></div>
              <span
                className="text-lg sm:text-xl font-bold tracking-wide"
                style={{
                  fontFamily: 'Geometrisk, Inter, system-ui, sans-serif',
                }}
              >
                grader.ai
              </span>
            </motion.div>

            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <a
                href="#home"
                className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm xl:text-base"
              >
                Home
              </a>
              <a
                href="#about"
                className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm xl:text-base"
              >
                About
              </a>
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm xl:text-base"
              >
                Dashboard
              </Link>
              <Link
                href="/paper-checker"
                className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm xl:text-base"
              >
                Paper Checker
              </Link>
              <button
                type="button"
                className="bg-white text-black px-4 py-2 xl:px-6 xl:py-3 rounded-full font-medium hover:bg-gray-200 transition-colors text-sm xl:text-base"
              >
                Sign up
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden text-white p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden bg-black/95 border-t border-gray-800 py-4"
            >
              <div className="flex flex-col space-y-3">
                <a
                  href="#home"
                  className="text-gray-300 hover:text-[#00ff88] transition-colors px-3 py-2"
                >
                  Home
                </a>
                <a
                  href="#about"
                  className="text-gray-300 hover:text-[#00ff88] transition-colors px-3 py-2"
                >
                  About
                </a>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-[#00ff88] transition-colors px-3 py-2"
                >
                  Dashboard
                </Link>
                <Link
                  href="/paper-checker"
                  className="text-gray-300 hover:text-[#00ff88] transition-colors px-3 py-2"
                >
                  Paper Checker
                </Link>
                <a
                  href="#features"
                  className="text-gray-300 hover:text-[#00ff88] transition-colors px-3 py-2"
                >
                  Features
                </a>
                <button
                  type="button"
                  className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors mx-3 text-center"
                >
                  Sign up
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-start pt-24 sm:pt-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 z-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ff88' fill-opacity='0.1'%3E%3Ctext x='10' y='30' font-size='8' fill='%2300ff88'%3E01%3C/text%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full relative z-20">
          <div className="max-w-full lg:max-w-4xl xl:max-w-5xl">
            {/* AI Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-gray-900/50 border border-gray-700 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#00ff88] rounded-full"></div>
              <span className="text-xs sm:text-sm text-gray-300">
                AI in Education
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold leading-[0.9] mb-6 sm:mb-8 break-words"
            >
              <span className="font-raleway-regular">AI: </span>
              <span className="font-raleway-light"> The </span>
              <span
                className="text-[#00ff88]"
                style={{ fontFamily: 'Geometrisk, system-ui, sans-serif' }}
              >
                Future
              </span>
              <span className="font-raleway-light"> of Education</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg lg:text-xl text-gray-400 mb-8 sm:mb-10 lg:mb-12 max-w-full lg:max-w-2xl leading-relaxed"
            >
              Revolutionize your learning with AI.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12 sm:mb-16 lg:mb-20"
            >
              <button
                type="button"
                className="bg-white text-black px-6 py-3 sm:px-8 sm:py-4 rounded-full font-medium text-base sm:text-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-center sm:justify-start"
              >
                <span>Start</span>
                {/* <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#00ff88] rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div> */}
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 sm:gap-8 lg:gap-12 xl:gap-16"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#00ff88] mb-1 sm:mb-2">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right side elements */}
        {/* <div className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-600 space-y-3 lg:space-y-4 writing-mode-vertical hidden xl:block z-20">
          <div className="transform rotate-90 origin-center whitespace-nowrap">
            INSTAGRAM
          </div>
          <div className="transform rotate-90 origin-center whitespace-nowrap">
            WHATSAPP
          </div>
          <div className="transform rotate-90 origin-center whitespace-nowrap">
            FACEBOOK
          </div>
        </div> */}
      </section>
    </div>
  );
}
