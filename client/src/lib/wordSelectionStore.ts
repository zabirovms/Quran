// A simple store to track the active word across all verses

// Use a global variable to track the currently active word
let activeWordKey: string | null = null;
let listeners: Array<(key: string | null) => void> = [];

// Function to set the active word
export function setActiveWord(key: string | null): void {
  activeWordKey = key;
  // Notify all listeners
  listeners.forEach(listener => listener(activeWordKey));
}

// Function to get the current active word
export function getActiveWord(): string | null {
  return activeWordKey;
}

// Function to subscribe to changes
export function subscribeToActiveWord(callback: (key: string | null) => void): () => void {
  listeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(listener => listener !== callback);
  };
}

// Function to generate a unique key for each word in the Quran
export function generateWordKey(surahNumber: number, verseNumber: number, position: number): string {
  return `${surahNumber}:${verseNumber}:${position}`;
}