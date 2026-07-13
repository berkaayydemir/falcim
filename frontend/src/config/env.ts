/**
 * Ortam yapılandırması. Backend adresi .env üzerinden verilir:
 *   EXPO_PUBLIC_API_URL=http://192.168.1.20:8080
 *
 * Not: Fiziksel cihazda "localhost" telefonun kendisini işaret eder; bilgisayarınızın
 * yerel ağ IP adresini kullanın.
 */
const DEFAULT_API_URL = 'http://localhost:8080';

export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ?? DEFAULT_API_URL;

export const API_BASE = `${API_URL}/api/v1`;
