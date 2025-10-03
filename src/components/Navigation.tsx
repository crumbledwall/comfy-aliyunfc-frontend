'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

interface NavigationProps {
  currentTab: 'prompts' | 'generate' | 'logs';
  onTabChange: (tab: 'prompts' | 'generate' | 'logs') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const { isAuthenticated, logout, username, isDarkMode, toggleDarkMode } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Comfy-FC图片生成器</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* 桌面端导航 */}
                  <div className="hidden md:flex space-x-1">
                    <button
                      onClick={() => onTabChange('prompts')}
                      className={`px-3 py-2 rounded-md text-sm font-medium btn-mobile whitespace-nowrap ${
                        currentTab === 'prompts'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 hover:dark:bg-gray-500'
                      }`}
                    >
                      Prompt 管理
                    </button>
                    <button
                      onClick={() => onTabChange('generate')}
                      className={`px-3 py-2 rounded-md text-sm font-medium btn-mobile whitespace-nowrap ${
                        currentTab === 'generate'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 hover:dark:bg-gray-500'
                      }`}
                    >
                      图片生成
                    </button>
                    <button
                      onClick={() => onTabChange('logs')}
                      className={`px-3 py-2 rounded-md text-sm font-medium btn-mobile whitespace-nowrap ${
                        currentTab === 'logs'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-300 dark:text-gray-300 hover:dark:bg-gray-500'
                      }`}
                    >
                      系统信息
                    </button>
                  </div>
                  
                  {/* 夜间模式切换开关 */}
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">🌞</span>
                    <button
                      onClick={toggleDarkMode}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDarkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">🌙</span>
                  </div>
                  
                  {/* 移动端导航菜单按钮 */}
                  <div className="md:hidden flex items-center">
                    <button
                      onClick={() => setShowMobileMenu(!showMobileMenu)}
                      className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 btn-mobile dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      退出
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 btn-mobile dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  登录
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* 移动端下拉菜单 */}
        {showMobileMenu && isAuthenticated && (
          <div className="md:hidden bg-white dark:bg-gray-800">
            <div className="pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  onTabChange('prompts');
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-base font-medium ${
                  currentTab === 'prompts'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Prompt 管理
              </button>
              <button
                onClick={() => {
                  onTabChange('generate');
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-base font-medium ${
                  currentTab === 'generate'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                图片生成
              </button>
              <button
                onClick={() => {
                  onTabChange('logs');
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-base font-medium ${
                  currentTab === 'logs'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                系统信息
              </button>
              
              {/* 移动端夜间模式切换 */}
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-gray-700 dark:text-gray-300">夜间模式</span>
                <button
                  onClick={toggleDarkMode}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};