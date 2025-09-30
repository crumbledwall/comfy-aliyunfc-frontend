'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../components/AuthProvider';
import ApiClient, { Prompt, ImageResult } from '../utils/api';

export const ImageGenerator: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | null>(null);
  const [customPositive, setCustomPositive] = useState('');
  const [customNegative, setCustomNegative] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<ImageResult[]>([]);
  const [error, setError] = useState('');
  const [lastGeneration, setLastGeneration] = useState<{
    seed: number;
    positive: string;
    negative: string;
  } | null>(null);
  const [savePromptMessage, setSavePromptMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  // 添加保留实例状态
  const [reservedInstanceEnabled, setReservedInstanceEnabled] = useState(false);
  const [updatingReservedInstance, setUpdatingReservedInstance] = useState(false);

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
    
    try {
      const response = await apiClient.getPrompts();
      if (response.success) {
        setPrompts(response.prompts);
      }
    } catch (err) {
      console.error('加载 prompts 失败:', err);
    }
  };

  const handleGenerate = async () => {
    if (!apiClient) return;

    let positive = '';
    let negative = '';

    // 不管是否选择了预设Prompt，都使用当前输入框中的内容
    positive = customPositive.trim();
    negative = customNegative.trim();

    if (!positive) {
      setError('请输入或选择一个 positive prompt');
      return;
    }

    setGenerating(true);
    setError('');
    setGeneratedImages([]);

    try {
      const response = await apiClient.generateImage(positive, negative);
      if (response.success) {
        setGeneratedImages(response.images);
        setLastGeneration({
          seed: response.seed,
          positive: response.positive_prompt,
          negative: response.negative_prompt
        });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(`生成失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setGenerating(false);
    }
  };

  // 添加保存Prompt到在线列表的函数
  const handleSavePrompt = async () => {
    if (!apiClient || !lastGeneration) return;
    
    try {
      const response = await apiClient.addPrompt(
        lastGeneration.positive, 
        lastGeneration.negative
      );
      
      if (response.success) {
        // 重新加载Prompt列表以包含新添加的Prompt
        loadPrompts();
        // 设置保存成功提示
        setSavePromptMessage({type: 'success', text: 'Prompt保存成功！'});
      } else {
        setSavePromptMessage({type: 'error', text: `保存失败: ${response.message}`});
      }
    } catch (err) {
      setSavePromptMessage({type: 'error', text: `保存时出错: ${err instanceof Error ? err.message : '未知错误'}`});
    }
    
    // 3秒后自动清除提示消息
    setTimeout(() => {
      setSavePromptMessage(null);
    }, 3000);
  };

  const handlePromptSelect = (index: number) => {
    setSelectedPromptIndex(index);
    const selectedPrompt = prompts.find(p => p.index === index);
    if (selectedPrompt) {
      setCustomPositive(selectedPrompt.positive);
      setCustomNegative(selectedPrompt.negative);
    }
  };

  // 添加切换保留实例的函数
  const toggleReservedInstance = async () => {
    if (!apiClient) return;
    
    setUpdatingReservedInstance(true);
    try {
      // 如果当前是开启状态，则关闭（设为0），否则开启（设为1）
      const target = reservedInstanceEnabled ? 0 : 1;
      const response = await apiClient.updateReservedInstances(target);
      
      if (response.success) {
        setReservedInstanceEnabled(!reservedInstanceEnabled);
      } else {
        setError(`切换保留实例失败: ${response.message}`);
      }
    } catch (err) {
      setError(`切换保留实例时出错: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setUpdatingReservedInstance(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">请先进行身份认证</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">图片生成</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：Prompt 选择 */}
        <div className="space-y-6">
          {/* 保留实例开关 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">资源管理</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">保留实例</h3>
                <p className="text-sm text-gray-500">
                  {reservedInstanceEnabled 
                    ? "已启用 - 保持实例常驻内存，提高响应速度" 
                    : "已禁用 - 按需启动实例，节省资源"}
                </p>
              </div>
              <button
                onClick={toggleReservedInstance}
                disabled={updatingReservedInstance}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  reservedInstanceEnabled ? 'bg-green-600' : 'bg-gray-300'
                } ${updatingReservedInstance ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    reservedInstanceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {updatingReservedInstance && (
              <div className="mt-2 text-sm text-gray-500">
                正在更新保留实例配置...
              </div>
            )}
          </div>

          {/* Prompt 选择 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">选择 Prompt</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                预设 Prompt
              </label>
              <select
                value={selectedPromptIndex || ''}
                onChange={(e) => handlePromptSelect(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">选择预设 Prompt</option>
                {prompts.map((prompt) => (
                  <option key={prompt.index} value={prompt.index}>
                    Prompt #{prompt.index}: {prompt.positive.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Positive Prompt
                </label>
                <textarea
                  value={customPositive}
                  onChange={(e) => setCustomPositive(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 textarea-mobile text-gray-900"
                  rows={4}
                  placeholder="输入 positive prompt..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Negative Prompt
                </label>
                <textarea
                  value={customNegative}
                  onChange={(e) => setCustomNegative(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 textarea-mobile text-gray-900"
                  rows={3}
                  placeholder="输入 negative prompt..."
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !customPositive.trim()}
              className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed btn-mobile"
            >
              {generating ? '生成中...' : '生成图片'}
            </button>
          </div>

          {/* 生成信息 */}
          {lastGeneration && (
            <div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">生成信息</h3>
                <div className="relative">
                  <button 
                    onClick={handleSavePrompt}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                    title="保存Prompt到列表"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  
                  {/* 保存提示消息 */}
                  {savePromptMessage && (
                    <div className={`absolute right-0 mt-2 w-48 p-2 rounded-md shadow-lg z-10 ${
                      savePromptMessage.type === 'success' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      <div className="flex items-center">
                        {savePromptMessage.type === 'success' ? (
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="text-sm">{savePromptMessage.text}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">种子:</span> {lastGeneration.seed}</p>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：图片展示 */}
        <div className="space-y-6">
          {/* 移除了之前的弹窗代码 */}

          {generating && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700">正在生成图片，请稍候...</p>
            </div>
          )}

          {generatedImages.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">生成结果</h3>
              <div className="grid grid-cols-1 gap-4">
                {generatedImages.map((image, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <img
                        src={image.public_url}
                        alt={`Generated image ${index + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="text-gray-500 text-center p-4">图片加载失败</div>';
                          }
                        }}
                      />
                    </div>
                    <div className="p-3 bg-gray-50">
                      <p className="text-sm text-gray-700">
                        图片 #{image.index} | 过期时间: {image.expires_in}秒
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!generating && generatedImages.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-gray-400 text-6xl mb-4">🖼️</div>
              <p className="text-gray-600">生成的图片将在这里显示</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};