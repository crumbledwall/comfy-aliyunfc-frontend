'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../components/AuthProvider';
import { AuthDialog } from '../components/AuthDialog';
import { Navigation } from '../components/Navigation';
import { PromptManager } from '../components/PromptManager';
import { ImageGenerator } from '../components/ImageGenerator';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<'prompts' | 'generate'>('prompts');
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
    } else {
      // 如果已经认证，确保对话框关闭
      setShowAuthDialog(false);
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
      />
      
      <main className="py-6">
        {currentTab === 'prompts' ? <PromptManager /> : <ImageGenerator />}
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