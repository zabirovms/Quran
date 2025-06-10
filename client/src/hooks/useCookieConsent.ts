import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_KEY = 'cookie_preferences';

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const savedPreferences = loadPreferences();
    if (savedPreferences) {
      setPreferences(savedPreferences);
    }
  }, []);

  const loadPreferences = (): CookiePreferences | null => {
    if (typeof window === 'undefined') return null;
    
    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  };

  const savePreferences = (newPreferences: CookiePreferences) => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(COOKIE_KEY, JSON.stringify(newPreferences));
    setPreferences(newPreferences);
  };

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
  };

  return {
    preferences,
    updatePreferences,
    savePreferences,
    loadPreferences
  };
} 
