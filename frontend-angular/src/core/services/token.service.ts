import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  UserId: string;
  email: string;
  PlatformAdmin: string;
  OrganizationId?: string;
  role?: string | string[];
  exp: number;
}

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class TokenService {

  setToken(token: string): void {
    console.log('[TokenService] Setting token:', token);
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('[TokenService] Getting token:', token);
    return token;
  }

  removeToken(): void {
    console.log('[TokenService] Removing token');
    localStorage.removeItem(TOKEN_KEY);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('[TokenService] No token found');
      return false;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const isValid = decoded.exp * 1000 > Date.now();

      console.log('[TokenService] Token valid:', isValid);
      console.log('[TokenService] Expiry:', new Date(decoded.exp * 1000));

      return isValid;
    } catch (error) {
      console.error('[TokenService] Token decode failed:', error);
      return false;
    }
  }

  getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      console.log('[TokenService] No token to decode');
      return null;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      console.log('[TokenService] Decoded payload:', decoded);
      return decoded;
    } catch (error) {
      console.error('[TokenService] Payload decode error:', error);
      return null;
    }
  }

  getUserId(): string | null {
    const userId = this.getPayload()?.UserId ?? null;
    console.log('[TokenService] UserId:', userId);
    return userId;
  }

  getRole(): string | null {
    const payload = this.getPayload();
    if (!payload) {
      console.log('[TokenService] No payload for role');
      return null;
    }

    const role =
      payload.role ||
      (payload as any)['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    const finalRole = Array.isArray(role) ? role[0] : role ?? null;

    console.log('[TokenService] Raw role:', role);
    console.log('[TokenService] Final role:', finalRole);

    return finalRole;
  }

  getOrganizationId(): string | null {
    const orgId = this.getPayload()?.OrganizationId ?? null;
    console.log('[TokenService] OrganizationId:', orgId);
    return orgId;
  }

  isPlatformAdmin(): boolean {
    const payload = this.getPayload();
    const isAdmin = payload?.PlatformAdmin === 'True';

    console.log('[TokenService] PlatformAdmin raw:', payload?.PlatformAdmin);
    console.log('[TokenService] Is PlatformAdmin:', isAdmin);

    return isAdmin;
  }
}