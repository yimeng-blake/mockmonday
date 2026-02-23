'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export interface Comment {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

interface CommentsStore {
  comments: Record<string, Comment[]>;
  loadedItems: Record<string, boolean>;

  addComment: (
    itemId: string,
    content: string,
    userId: string,
    userName: string,
    userAvatar: string
  ) => void;
  deleteComment: (itemId: string, commentId: string) => void;
  getComments: (itemId: string) => Comment[];
  fetchComments: (itemId: string) => Promise<void>;
}

export const useCommentsStore = create<CommentsStore>()(
  persist(
    (set, get) => ({
      comments: {},
      loadedItems: {},

      addComment: (itemId, content, userId, userName, userAvatar) => {
        const id = `comment-${generateId()}`;
        const comment: Comment = {
          id,
          itemId,
          userId,
          userName,
          userAvatar,
          content,
          createdAt: new Date().toISOString(),
        };

        // Optimistic local update
        set((s) => ({
          comments: {
            ...s.comments,
            [itemId]: [comment, ...(s.comments[itemId] || [])],
          },
        }));

        // Sync to Supabase
        if (isSupabaseConfigured) {
          import('@/lib/supabase/mutations')
            .then(({ createItemUpdate }) => createItemUpdate(itemId, userId, content))
            .then((data) => {
              // Update the local comment with the real DB id
              if (data) {
                set((s) => ({
                  comments: {
                    ...s.comments,
                    [itemId]: (s.comments[itemId] || []).map((c) =>
                      c.id === id ? { ...c, id: data.id } : c
                    ),
                  },
                }));
              }
            })
            .catch((err) => {
              console.error('Failed to sync comment:', err);
              toast.error('Failed to save comment');
            });
        }
      },

      deleteComment: (itemId, commentId) => {
        set((s) => ({
          comments: {
            ...s.comments,
            [itemId]: (s.comments[itemId] || []).filter(
              (c) => c.id !== commentId
            ),
          },
        }));

        // Sync to Supabase
        if (isSupabaseConfigured) {
          import('@/lib/supabase/mutations')
            .then(({ deleteItemUpdate }) => deleteItemUpdate(commentId))
            .catch((err) => {
              console.error('Failed to delete comment:', err);
            });
        }
      },

      getComments: (itemId) => {
        return get().comments[itemId] || [];
      },

      fetchComments: async (itemId) => {
        if (!isSupabaseConfigured) return;
        if (get().loadedItems[itemId]) return; // Already loaded

        try {
          const { fetchItemUpdatesForItem } = await import('@/lib/supabase/mutations');
          const updates = await fetchItemUpdatesForItem(itemId);

          const comments: Comment[] = updates.map((u: {
            id: string;
            item_id: string;
            user_id: string;
            content: string;
            created_at: string;
            profiles: { display_name: string; avatar_color: string } | null;
          }) => ({
            id: u.id,
            itemId: u.item_id,
            userId: u.user_id,
            userName: u.profiles?.display_name || 'User',
            userAvatar: u.profiles?.avatar_color || '#579BFC',
            content: u.content,
            createdAt: u.created_at,
          }));

          set((s) => ({
            comments: { ...s.comments, [itemId]: comments },
            loadedItems: { ...s.loadedItems, [itemId]: true },
          }));
        } catch (err) {
          console.error('Failed to fetch comments:', err);
        }
      },
    }),
    {
      name: 'mockmonday-comments',
      partialize: (state) => ({ comments: state.comments }),
    }
  )
);
