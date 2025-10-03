'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../components/AuthProvider';
import ApiClient, { Prompt } from '../utils/api';

export const PromptManager: React.FC = () => {
  const { token, isAuthenticated, isDarkMode } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newPrompt, setNewPrompt] = useState({ positive: '', negative: 'deformed, disfigured, blurry, text, watermark, low quality, bad anatomy, extra limbs, mutated hands, poorly drawn face, missing arms, missing legs, ugly, distorted features,mosaic,censored' });
  const [editPrompt, setEditPrompt] = useState({ positive: '', negative: 'deformed, disfigured, blurry, text, watermark, low quality, bad anatomy, extra limbs, mutated hands, poorly drawn face, missing arms, missing legs, ugly, distorted features,mosaic,censored' });

  // 使用useMemo确保apiClient只在token变化时重新创建
  const apiClient = useMemo(() => {
    return isAuthenticated ? new ApiClient(token) : null;
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated && apiClient) {
      loadPrompts();
    }
  }, [isAuthenticated, apiClient]); // 这里我们保留apiClient作为依赖，但通过useMemo确保它不会频繁变化

  const loadPrompts = async () => {
    if (!apiClient) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.getPrompts();
      if (response.success) {
        setPrompts(response.prompts);
      } else {
        setError('加载 prompts 失败');
      }
    } catch (err) {
      setError(`加载失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrompt = async () => {
    if (!apiClient || !newPrompt.positive.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await apiClient.addPrompt(newPrompt.positive, newPrompt.negative);
      if (response.success) {
        setNewPrompt({ positive: '', negative: '' });
        loadPrompts();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(`添加失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrompt = async (index: number) => {
    if (!apiClient || !editPrompt.positive.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await apiClient.updatePrompt(index, editPrompt.positive, editPrompt.negative);
      if (response.success) {
        setEditingIndex(null);
        setEditPrompt({ positive: '', negative: '' });
        loadPrompts();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(`更新失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = async (index: number) => {
    if (!apiClient || !confirm('确定要删除这个 prompt 吗？')) return;

    setLoading(true);
    setError('');
    try {
      const response = await apiClient.deletePrompt(index);
      if (response.success) {
        loadPrompts();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(`删除失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (prompt: Prompt) => {
    setEditingIndex(prompt.index);
    setEditPrompt({ positive: prompt.positive, negative: prompt.negative });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditPrompt({ positive: '', negative: '' });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">请先进行身份认证</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-white">Prompt 管理</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      {/* 添加新 Prompt */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-gray-900 dark:bg-gray-800 dark:text-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">添加新 Prompt</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 dark:text-gray-200">
              Positive Prompt
            </label>
            <textarea
              value={newPrompt.positive}
              onChange={(e) => setNewPrompt({ ...newPrompt, positive: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 textarea-mobile dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              placeholder="输入 positive prompt..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 dark:text-gray-200">
              Negative Prompt
            </label>
            <textarea
              value={newPrompt.negative}
              onChange={(e) => setNewPrompt({ ...newPrompt, negative: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 textarea-mobile dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={2}
              placeholder="输入 negative prompt..."
            />
          </div>
          <button
            onClick={handleAddPrompt}
            disabled={loading || !newPrompt.positive.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed btn-mobile dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {loading ? '添加中...' : '添加 Prompt'}
          </button>
        </div>
      </div>

      {/* Prompt 列表 */}
      <div className="space-y-4">
        {prompts.map((prompt) => (
          <div key={prompt.index} className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
            {editingIndex === prompt.index ? (
              // 编辑模式
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2 dark:text-gray-200">
                    Positive Prompt
                  </label>
                  <textarea
                    value={editPrompt.positive}
                    onChange={(e) => setEditPrompt({ ...editPrompt, positive: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 textarea-mobile dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2 dark:text-gray-200">
                    Negative Prompt
                  </label>
                  <textarea
                    value={editPrompt.negative}
                    onChange={(e) => setEditPrompt({ ...editPrompt, negative: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 textarea-mobile dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={2}
                  />
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => handleEditPrompt(prompt.index)}
                    disabled={loading}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
                  >
                    保存
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={loading}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 disabled:opacity-50 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // 显示模式
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{prompt.positive}</p>
                    <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">{prompt.negative}</p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => startEdit(prompt)}
                      className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.index)}
                      className="p-1 text-gray-500 hover:text-red-600 focus:outline-none dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {prompt.index}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};