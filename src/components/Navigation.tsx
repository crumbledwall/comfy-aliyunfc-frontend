'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

interface NavigationProps {
  currentTab: 'prompts' | 'generate';
  onTabChange: (tab: 'prompts' | 'generate') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const { isAuthenticated, logout, username } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI 图片生成器</h1>
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
                          : 'text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      Prompt 管理
                    </button>
                    <button
                      onClick={() => onTabChange('generate')}
                      className={`px-3 py-2 rounded-md text-sm font-medium btn-mobile whitespace-nowrap ${
                        currentTab === 'generate'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      图片生成
                    </button>
                  </div>
                  
                  {/* 移动端导航菜单按钮 */}
                  <div className="md:hidden flex items-center">
                    <button
                      onClick={() => setShowMobileMenu(!showMobileMenu)}
                      className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                    >
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 hidden sm:inline">欢迎, {username}</span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 btn-mobile"
                    >
                      退出
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 btn-mobile"
                >
                  登录
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* 移动端下拉菜单 */}
        {showMobileMenu && isAuthenticated && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  onTabChange('prompts');
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-base font-medium ${
                  currentTab === 'prompts'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-800 hover:bg-gray-100'
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
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                图片生成
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};