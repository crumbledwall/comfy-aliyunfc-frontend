const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

export interface Prompt {
  index: number;
  positive: string;
  negative: string;
  encoded: {
    positive: string;
    negative: string;
  };
}

export interface ImageResult {
  index: number;
  oss_path: string;
  public_url: string;
  expires_in: number;
}

export interface GenerateResponse {
  success: boolean;
  seed: number;
  positive_prompt: string;
  negative_prompt: string;
  images: ImageResult[];
  message: string;
}

export interface PromptsResponse {
  success: boolean;
  prompts: Prompt[];
  count: number;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message: string;
}

export interface InfoResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    timestamp: string;
  };
}

// 添加保留实例响应接口
export interface ReservedInstancesResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>; // 替代 any 类型
  recommend?: string;
}

// 添加获取保留实例状态的响应接口
export interface ReservedInstancesStatusResponse {
  success: boolean;
  message: string;
  data?: number; // 直接返回数量
  recommend?: string;
}

// 添加日志响应接口
export interface LogResponse {
  success: boolean;
  message: string;
  data?: string;
  recommend?: string;
}

// 添加最新图片响应接口
export interface LatestPicResponse {
  success: boolean;
  message: string;
  data?: string; // 图片URL
  recommend?: string;
}

// 添加代金券信息响应接口
export interface CouponResponse {
  success: boolean;
  message: string;
  data?: number | string; // 代金券剩余金额，可能是数字或字符串
  recommend?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor(token?: string) {
    this.token = token || null;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // 新的token认证方法
  async authenticateWithToken(token: string): Promise<boolean> {
    try {
      // 简单验证token格式
      if (!token || token.length < 10) {
        return false;
      }
      
      this.setToken(token);
      return true;
    } catch (error) {
      console.error('Token认证失败:', error);
      return false;
    }
  }

  // 添加获取代金券信息的方法
  async getCoupons(): Promise<CouponResponse> {
    const response = await fetch(`${API_BASE_URL}/coupons`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 添加info接口方法用于验证token
  async getInfo(): Promise<InfoResponse> {
    const response = await fetch(`${API_BASE_URL}/info`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getPrompts(): Promise<PromptsResponse> {
    const response = await fetch(`${API_BASE_URL}/prompts`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async addPrompt(positive: string, negative: string = ''): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/prompts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ positive, negative }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updatePrompt(index: number, positive: string, negative: string = ''): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/prompts/${index}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ positive, negative }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deletePrompt(index: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/prompts/${index}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async generateImage(positive: string, negative: string = '', signal?: AbortSignal): Promise<GenerateResponse> {
    const response = await fetch(`${API_BASE_URL}/invoke`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ positive, negative }),
      signal, // 添加abort信号支持
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 添加控制保留实例的方法
  async updateReservedInstances(target: number): Promise<ReservedInstancesResponse> {
    const response = await fetch(`${API_BASE_URL}/reserved-instances`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ target }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 添加获取保留实例状态的方法
  async getReservedInstancesStatus(): Promise<ReservedInstancesStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/reserved-instances`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 添加获取日志的方法
  async getLogs(): Promise<LogResponse> {
    const response = await fetch(`${API_BASE_URL}/logs`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 添加获取最新图片的方法
  async getLatestPic(): Promise<LatestPicResponse> {
    const response = await fetch(`${API_BASE_URL}/latest-pic`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export default ApiClient;