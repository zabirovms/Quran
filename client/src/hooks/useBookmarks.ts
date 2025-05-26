import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Bookmark, Verse } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';

interface BookmarkWithVerse {
  bookmark: Bookmark;
  verse: Verse;
}

export function useBookmarks() {
  const { user } = useAuth();
  
  return useQuery<BookmarkWithVerse[]>({
    queryKey: [`/api/bookmarks`, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const response = await fetch(`/api/bookmarks?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }
      return response.json();
    },
    enabled: !!user?.id,
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (verseId: number) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to bookmark verses');
      }
      
      const response = await apiRequest('POST', '/api/bookmarks', {
        user_id: user.id,
        verse_id: verseId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookmarks`] });
    },
  });
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (bookmarkId: number) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to remove bookmarks');
      }
      
      await apiRequest('DELETE', `/api/bookmarks/${bookmarkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookmarks`] });
    },
  });
}

export function useIsVerseBookmarked(verseId: number) {
  const { data: bookmarks, isLoading } = useBookmarks();
  
  if (isLoading || !bookmarks) {
    return { isBookmarked: false, bookmarkId: null, isLoading };
  }
  
  const bookmark = bookmarks.find(b => b.verse.id === verseId);
  
  return {
    isBookmarked: !!bookmark,
    bookmarkId: bookmark?.bookmark.id || null,
    isLoading
  };
}
