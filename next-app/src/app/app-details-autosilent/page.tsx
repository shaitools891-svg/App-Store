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
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 max-w-lg w-full">
          <img src="/ic_launcher-playstore-autosilent.png" alt="Auto Silent Icon" className="w-28 h-28 mx-auto mb-6 rounded-2xl shadow-lg" />
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Auto Silent</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-center">
            An Android application that automatically silences your phone during Islamic prayer times, helping you maintain focus and respect during Salah.
          </p>
          <ul className="text-sm text-gray-700 dark:text-gray-300 mb-6 space-y-2">
            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Automatic Silent Mode</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Custom Prayer Periods</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Beautiful Islamic UI</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Multiple Themes</li>
          </ul>
          <div className="text-center">
            <a href="/app-release.apk" download className="inline-block bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
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