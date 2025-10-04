'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../components/AuthProvider';
import { AuthDialog } from '../components/AuthDialog';
import { Navigation } from '../components/Navigation';
import { PromptManager } from '../components/PromptManager';
import { ImageGenerator } from '../components/ImageGenerator';
import { InfoPage } from '../components/InfoPage';

function MainApp() {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const [currentTab, setCurrentTab] = useState<'prompts' | 'generate' | 'logs'>('generate');
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isCheckingAuth) {
      setShowAuthDialog(true);
    } else {
      // 如果已经认证或正在检查认证状态，确保对话框关闭
      setShowAuthDialog(false);
    }
  }, [isAuthenticated, isCheckingAuth]);

  // 如果正在检查认证状态，显示加载动画
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在验证身份...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
      />
      
      <main className="py-6">
        {currentTab === 'prompts' ? (
          <PromptManager />
        ) : currentTab === 'generate' ? (
          <ImageGenerator />
        ) : (
          <InfoPage />
        )}
      </main>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};