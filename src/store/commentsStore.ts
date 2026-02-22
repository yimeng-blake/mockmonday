'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

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

  addComment: (
    itemId: string,
    content: string,
    userId: string,
    userName: string,
    userAvatar: string
  ) => void;
  deleteComment: (itemId: string, commentId: string) => void;
  getComments: (itemId: string) => Comment[];
}

export const useCommentsStore = create<CommentsStore>()(
  persist(
    (set, get) => ({
      comments: {},

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

        set((s) => ({
          comments: {
            ...s.comments,
            [itemId]: [comment, ...(s.comments[itemId] || [])],
          },
        }));
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
      },

      getComments: (itemId) => {
        return get().comments[itemId] || [];
      },
    }),
    {
      name: 'mockmonday-comments',
    }
  )
);
