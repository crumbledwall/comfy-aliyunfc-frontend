'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthProvider';
import ApiClient, { CouponResponse } from '../utils/api';

export const InfoPage: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [logs, setLogs] = useState<string>('');
  const [couponBalance, setCouponBalance] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [couponLoading, setCouponLoading] = useState<boolean>(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const apiClientRef = useRef<ApiClient | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化API客户端
  useEffect(() => {
    if (isAuthenticated && token) {
      apiClientRef.current = new ApiClient(token);
      loadLogs();
      loadCouponInfo();
    }
  }, [isAuthenticated, token]);

  // 设置轮询
  useEffect(() => {
    if (isAuthenticated && apiClientRef.current) {
      // 每10秒获取一次日志
      intervalRef.current = setInterval(() => {
        loadLogs();
      }, 10000);
    }

    // 清理函数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadLogs = async () => {
    if (!apiClientRef.current) return;

    try {
      const response = await apiClientRef.current.getLogs();
      if (response.success && response.data) {
        // 将新日志追加到现有日志中
        setLogs(prevLogs => {
          const newLogs = response.data || '';
          if (prevLogs) {
            return prevLogs + '\n' + newLogs;
          }
          return newLogs;
        });
      } else {
        setError(response.message || '获取日志失败');
      }
    } catch (err) {
      setError(`获取日志时出错: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCouponInfo = async () => {
    if (!apiClientRef.current) return;

    setCouponLoading(true);
    try {
      const response: CouponResponse = await apiClientRef.current.getCoupons();
      console.log('Coupon response:', response); // 调试日志
      if (response.success && response.data !== undefined) {
        // 确保代金券余额是数字类型
        let balance: number;
        if (typeof response.data === 'number') {
          balance = response.data;
        } else if (typeof response.data === 'string') {
          balance = parseFloat(response.data);
        } else {
          // 如果是其他类型，尝试转换为字符串再转换为数字
          balance = parseFloat(String(response.data));
        }
        
        console.log('Parsed balance:', balance); // 调试日志
        if (!isNaN(balance)) {
          setCouponBalance(balance);
        } else {
          setError('代金券余额数据格式不正确');
        }
      } else {
        setError(response.message || '获取代金券信息失败');
      }
    } catch (err) {
      setError(`获取代金券信息时出错: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setCouponLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs('');
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">请先进行身份认证</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">系统信息</h1>
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
        >
          清除日志
        </button>
      </div>

      {/* 代金券余额信息条 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-4 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">代金券余额</h2>
            <p className="text-sm opacity-90">可用于图片生成服务</p>
          </div>
          <div className="text-right">
            {couponLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                <span>加载中...</span>
              </div>
            ) : couponBalance !== null ? (
              <p className="text-2xl font-bold">{couponBalance.toFixed(2)} 元</p>
            ) : (
              <p className="text-sm">暂无数据</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="rounded-lg shadow-md p-4 bg-gray-900">
        <div className="font-mono text-sm text-green-400 whitespace-pre-wrap break-words">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              <span className="ml-2">正在加载日志...</span>
            </div>
          ) : logs ? (
            <>
              {logs}
              <div ref={logsEndRef} />
            </>
          ) : (
            <div className="text-gray-500 text-center h-32 flex items-center justify-center">
              暂无日志数据
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>日志每10秒自动刷新一次</p>
      </div>
    </div>
  );
};