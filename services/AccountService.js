/* game/services/AccountService.js
   Service do logowania i rejestracji — komunikuje się z /api/auth/* endpointami serwera proxy.
*/

import { API_BASE_URL } from '../Config.js';

const API_BASE = API_BASE_URL || 'http://localhost:10000';

export class AccountService {
  constructor() {
    this.token = null;
    this.userId = null;
    this.loadTokenFromStorage();
  }

  loadTokenFromStorage() {
    const stored = localStorage.getItem('hcp_auth_token');
    const userId = localStorage.getItem('hcp_user_id');
    if (stored && userId) {
      this.token = stored;
      this.userId = parseInt(userId, 10);
    }
  }

  saveTokenToStorage(token, userId) {
    localStorage.setItem('hcp_auth_token', token);
    localStorage.setItem('hcp_user_id', userId);
    this.token = token;
    this.userId = userId;
  }

  clearToken() {
    localStorage.removeItem('hcp_auth_token');
    localStorage.removeItem('hcp_user_id');
    this.token = null;
    this.userId = null;
  }

  isAuthenticated() {
    return !!this.token && !!this.userId;
  }

  getAuthHeader() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }

  async login(username, password) {
    try {
      console.log('[AccountService] Logging in user:', username);
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(err.message || 'Login failed');
      }
      const data = await response.json();
      const token = data.token;
      const userId = data.user?.id || data.userId;
      if (token && userId) {
        this.saveTokenToStorage(token, userId);
        console.log('[AccountService] Login successful for user:', userId);
        return { success: true, userId, token };
      }
      throw new Error('Nie otrzymano tokena lub id użytkownika');
    } catch (error) {
      console.error('[AccountService] login error:', error);
      return { success: false, error: error.message };
    }
  }

  async register(username, password) {
    try {
      console.log('[AccountService] Registering user:', username);
      const response = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(err.message || 'Register failed');
      }
      const data = await response.json();
      const token = data.token;
      const userId = data.user?.id || data.userId;
      if (token && userId) {
        this.saveTokenToStorage(token, userId);
        console.log('[AccountService] Registration successful for user:', userId);
        return { success: true, userId, token };
      }
      return { success: true, userId: null, token: null };
    } catch (error) {
      console.error('[AccountService] register error:', error);
      return { success: false, error: error.message };
    }
  }

  async ping() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/ping`);
      return response.ok;
    } catch {
      return false;
    }
  }

  logout() {
    this.clearToken();
  }
}
