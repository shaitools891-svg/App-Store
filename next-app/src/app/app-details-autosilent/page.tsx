"use client";
import React, { useState, useEffect } from 'react';
import Ballpit from '../../components/Ballpit';

const Page: React.FC = () => {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const fullText = 'Auto Silent Details';

  useEffect(() => {
    const timer = setTimeout(() => {
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < fullText.length) {
          setTypedText(prev => prev + fullText.charAt(index));
          index++;
        } else {
          clearInterval(typeInterval);
          setShowCursor(true);
        }
      }, 75);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      <Ballpit className="absolute inset-0 z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="shiny-text text-4xl font-bold mb-8">
          {typedText}
          {showCursor && <span className="animate-blink">|</span>}
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
          <img src="/ic_launcher-playstore-autosilent.png" alt="Auto Silent Icon" className="w-24 h-24 mx-auto mb-4 rounded-lg" />
          <h2 className="text-2xl font-bold text-center mb-4">Auto Silent</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            An Android application that automatically silences your phone during Islamic prayer times, helping you maintain focus and respect during Salah.
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-300 mb-4 space-y-1">
            <li>• Automatic Silent Mode</li>
            <li>• Custom Prayer Periods</li>
            <li>• Beautiful Islamic UI</li>
            <li>• Multiple Themes</li>
          </ul>
          <div className="text-center">
            <a href="/app-release.apk" download className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Download APK
            </a>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        .shiny-text {
          color: #b5b5b5a4 !important;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.8) 50%,
            rgba(255, 255, 255, 0) 60%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          display: inline-block;
          animation: shine 3s linear infinite;
        }
        @keyframes shine {
          0% {
            background-position: 100%;
          }
          100% {
            background-position: -100%;
          }
        }
        .gradient-text {
          background: linear-gradient(to right, #40ffaa, #4079ff, #40ffaa, #4079ff, #40ffaa);
          background-size: 300% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: gradient 8s linear infinite;
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}} />
    </div>
  );
};

export default Page;