'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../components/AuthProvider';
import ApiClient, { Prompt } from '../utils/api';

export const PromptManager: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newPrompt, setNewPrompt] = useState({ positive: '', negative: '' });
  const [editPrompt, setEditPrompt] = useState({ positive: '', negative: '' });

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
        <p className="text-gray-500">请先进行身份认证</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Prompt 管理</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 添加新 Prompt */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-gray-900">
        <h2 className="text-xl font-semibold mb-4">添加新 Prompt</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Positive Prompt
            </label>
            <textarea
              value={newPrompt.positive}
              onChange={(e) => setNewPrompt({ ...newPrompt, positive: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 textarea-mobile text-gray-900"
              rows={3}
              placeholder="输入 positive prompt..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Negative Prompt
            </label>
            <textarea
              value={newPrompt.negative}
              onChange={(e) => setNewPrompt({ ...newPrompt, negative: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 textarea-mobile text-gray-900"
              rows={2}
              placeholder="输入 negative prompt..."
            />
          </div>
          <button
            onClick={handleAddPrompt}
            disabled={loading || !newPrompt.positive.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed btn-mobile"
          >
            {loading ? '添加中...' : '添加 Prompt'}
          </button>
        </div>
      </div>

      {/* Prompt 列表 */}
      <div className="space-y-4">
        {prompts.map((prompt) => (
          <div key={prompt.index} className="bg-white rounded-lg shadow-md p-6">
            {editingIndex === prompt.index ? (
              // 编辑模式
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Positive Prompt
                  </label>
                  <textarea
                    value={editPrompt.positive}
                    onChange={(e) => setEditPrompt({ ...editPrompt, positive: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 textarea-mobile text-gray-900"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Negative Prompt
                  </label>
                  <textarea
                    value={editPrompt.negative}
                    onChange={(e) => setEditPrompt({ ...editPrompt, negative: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 textarea-mobile text-gray-900"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditPrompt(prompt.index)}
                    disabled={loading || !editPrompt.positive.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 btn-mobile"
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 btn-mobile"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // 显示模式
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Prompt #{prompt.index}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(prompt)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 btn-mobile"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.index)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 btn-mobile"
                    >
                      删除
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Positive Prompt:
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                      {prompt.positive}
                    </p>
                  </div>
                  
                  {prompt.negative && (
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Negative Prompt:
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                        {prompt.negative}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {prompts.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            暂无 Prompt，请添加第一个 Prompt
          </div>
        )}
      </div>
    </div>
  );
};