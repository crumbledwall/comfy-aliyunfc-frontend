'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('请输入认证Token');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('尝试使用Token进行认证:', token.substring(0, 10) + '...');
      // 使用AuthProvider中的login方法进行认证
      const success = await login(token);
      if (success) {
        console.log('认证成功');
        setToken(''); // 清空输入框
        onClose();
      } else {
        console.log('认证失败：Token无效');
        setError('Token无效或已过期');
      }
    } catch (err) {
      console.error('认证失败:', err);
      setError('认证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Token 认证
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-800 mb-2">
              认证 Token
            </label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-mobile text-gray-900"
              placeholder="请输入认证Token"
              autoComplete="current-password"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 btn-mobile"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 btn-mobile disabled:opacity-50"
            >
              {loading ? '认证中...' : '确定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};