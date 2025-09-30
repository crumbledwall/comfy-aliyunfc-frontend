'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import ApiClient from '../utils/api';

interface AuthContextType {
  username: string;
  token: string;
  isAuthenticated: boolean;
  isCheckingAuth: boolean; // 添加认证检查状态
  login: (token: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [username, setUsername] = useState('user');
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // 默认为true，表示正在检查认证状态
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    // 初始化API客户端
    const client = new ApiClient();
    setApiClient(client);
    
    // 从 localStorage 加载认证信息
    const savedToken = localStorage.getItem('auth_token');
    
    if (savedToken) {
      console.log('从localStorage加载Token:', savedToken.substring(0, Math.min(10, savedToken.length)) + '...');
      // 验证token格式（简单检查）
      if (savedToken.length >= 10) {
        checkTokenValidity(savedToken, client);
      } else {
        console.log('Token长度不足，清除localStorage中的Token');
        // 如果token格式不正确，清除它
        localStorage.removeItem('auth_token');
        setIsCheckingAuth(false); // 检查完成
      }
    } else {
      console.log('localStorage中未找到Token');
      setIsCheckingAuth(false); // 检查完成
    }
  }, []);

  const checkTokenValidity = async (token: string, client: ApiClient) => {
    try {
      client.setToken(token);
      const response = await client.getInfo();
      if (response.success) {
        setToken(token);
        setIsAuthenticated(true);
        console.log('Token验证通过，设置认证状态为true');
      } else {
        console.log('Token验证失败，清除localStorage中的Token');
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.log('Token验证失败，清除localStorage中的Token', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsCheckingAuth(false); // 无论成功与否，都设置检查完成
    }
  };

  const login = async (token: string): Promise<boolean> => {
    try {
      // 验证token格式（简单检查）
      if (!token || token.length < 10) {
        console.log('Token验证失败：长度不足');
        return false;
      }
      
      // 使用info接口验证token
      if (apiClient) {
        apiClient.setToken(token);
        try {
          const response = await apiClient.getInfo();
          if (response.success) {
            setToken(token);
            setIsAuthenticated(true);
            
            // 保存到 localStorage，确保持久化存储
            localStorage.setItem('auth_token', token);
            console.log('Token已保存到localStorage');
            
            return true;
          } else {
            console.log('Token验证失败：info接口返回失败');
            return false;
          }
        } catch (error) {
          console.error('Token验证失败:', error);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('认证失败:', error);
      return false;
    }
  };

  const logout = () => {
    setToken('');
    setIsAuthenticated(false);
    
    // 清除 localStorage 中的认证信息
    localStorage.removeItem('auth_token');
    console.log('已从localStorage清除Token');
    
    // 清除API客户端中的token
    if (apiClient) {
      apiClient.clearToken();
    }
  };

  // 添加一个useEffect来监听认证状态变化
  useEffect(() => {
    console.log('认证状态变化:', isAuthenticated ? '已认证' : '未认证');
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{
      username,
      token,
      isAuthenticated,
      isCheckingAuth, // 提供认证检查状态
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};