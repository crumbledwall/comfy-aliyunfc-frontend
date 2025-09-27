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

    if (selectedPromptIndex !== null) {
      const selectedPrompt = prompts.find(p => p.index === selectedPromptIndex);
      if (selectedPrompt) {
        positive = selectedPrompt.positive;
        negative = selectedPrompt.negative;
      }
    } else {
      positive = customPositive.trim();
      negative = customNegative.trim();
    }

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

  const handlePromptSelect = (index: number) => {
    setSelectedPromptIndex(index);
    const selectedPrompt = prompts.find(p => p.index === index);
    if (selectedPrompt) {
      setCustomPositive(selectedPrompt.positive);
      setCustomNegative(selectedPrompt.negative);
    }
  };

  const handleUseCustom = () => {
    setSelectedPromptIndex(null);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">AI 图片生成</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：Prompt 选择 */}
        <div className="space-y-6">
          {/* Prompt 选择 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">选择 Prompt</h2>
            
            {prompts.length > 0 && (
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
            )}

            <div className="mb-4">
              <button
                onClick={handleUseCustom}
                className={`px-4 py-2 rounded-md text-sm btn-mobile ${
                  selectedPromptIndex === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                使用自定义 Prompt
              </button>
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
              <h3 className="text-lg font-semibold mb-3">生成信息</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">种子:</span> {lastGeneration.seed}</p>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：图片展示 */}
        <div className="space-y-6">
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