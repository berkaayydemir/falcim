import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FortuneReading } from '../types';

const STORAGE_KEY = '@falcim/readings';

async function readAll(): Promise<FortuneReading[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FortuneReading[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(readings: FortuneReading[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
}

/**
 * Geçmiş falları AsyncStorage ile saklar.
 * En yeni fal listenin başında yer alır.
 */
export function useFortuneStore() {
  const [readings, setReadings] = useState<FortuneReading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const all = await readAll();
    setReadings(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addReading = useCallback(async (reading: FortuneReading) => {
    const all = await readAll();
    const next = [reading, ...all];
    await writeAll(next);
    setReadings(next);
  }, []);

  const getReadings = useCallback(async (): Promise<FortuneReading[]> => {
    const all = await readAll();
    setReadings(all);
    return all;
  }, []);

  const clearAll = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setReadings([]);
  }, []);

  return { readings, loading, addReading, getReadings, clearAll, refresh };
}
