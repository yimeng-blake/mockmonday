'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { isStatusValue, isPersonValue, relativeTime, getInitials } from '@/lib/utils';
import { PRIORITY_OPTIONS } from '@/lib/constants';
import StatusCell from '@/components/columns/StatusCell';
import PersonCell from '@/components/columns/PersonCell';
import { useCommentsStore, type Comment } from '@/store/commentsStore';
import { useCurrentPerson } from '@/hooks/usePeople';
import { X, Plus, MessageSquare, Layers } from 'lucide-react';
import { StatusValue, PersonValue } from '@/lib/types';

const EMPTY_COMMENTS: Comment[] = [];

export default function ItemDetailModal() {
  const selectedItemId = useUIStore((s) => s.selectedItemId);
  const setSelectedItemId = useUIStore((s) => s.setSelectedItemId);
  const item = useBoardStore((s) => selectedItemId ? s.items[selectedItemId] : null);
  const board = useBoardStore((s) => item ? s.boards[item.boardId] : null);
  const group = useBoardStore((s) => item ? s.groups[item.groupId] : null);
  const items = useBoardStore((s) => s.items);
  const updateItemValue = useBoardStore((s) => s.updateItemValue);
  const addSubitem = useBoardStore((s) => s.addSubitem);
  const deleteItem = useBoardStore((s) => s.deleteItem);
  const { user } = useAuth();
  const currentPerson = useCurrentPerson();
  const comments = useCommentsStore((s) => s.comments[selectedItemId || ''] ?? EMPTY_COMMENTS);
  const addComment = useCommentsStore((s) => s.addComment);
  const deleteComment = useCommentsStore((s) => s.deleteComment);
  const [activeTab, setActiveTab] = useState<'details' | 'updates'>('details');
  const [updateText, setUpdateText] = useState('');

  const subitems = selectedItemId
    ? Object.values(items).filter((i) => i.parentItemId === selectedItemId)
    : [];

  if (!selectedItemId || !item || !board) return null;

  const nameColumn = board.columns[0];
  const itemName = nameColumn ? (item.values[nameColumn.id] as string) || 'Untitled' : 'Untitled';
  const handleClose = () => setSelectedItemId(null);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={handleClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[640px] max-w-[90vw] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E6E9EF] shrink-0">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: group?.color || '#C4C4C4' }} />
          <h2 className="text-[18px] font-semibold text-[#323338] flex-1 truncate">{itemName}</h2>
          <button onClick={handleClose} className="text-[#676879] hover:text-[#323338] p-1 rounded hover:bg-[#F6F7FB] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E6E9EF] px-6 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-[#6161FF] text-[#6161FF]' : 'border-transparent text-[#676879] hover:text-[#323338]'}`}
          >
            <span className="flex items-center gap-1.5"><Layers size={16} />Details</span>
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'updates' ? 'border-[#6161FF] text-[#6161FF]' : 'border-transparent text-[#676879] hover:text-[#323338]'}`}
          >
            <span className="flex items-center gap-1.5"><MessageSquare size={16} />Updates</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-5">
              {board.columns.map((col) => {
                const value = item.values[col.id];
                return (
                  <div key={col.id} className="flex items-start gap-4">
                    <div className="w-[120px] shrink-0 text-[13px] font-medium text-[#676879] pt-2">{col.title}</div>
                    <div className="flex-1 min-w-0">
                      {col.type === 'text' && (
                        <input
                          value={(value as string) || ''}
                          onChange={(e) => updateItemValue(selectedItemId, col.id, e.target.value)}
                          className="w-full px-3 py-2 text-[14px] border border-[#E6E9EF] rounded-lg outline-none focus:border-[#6161FF] transition-colors"
                          placeholder={col.title}
                        />
                      )}
                      {col.type === 'status' && (
                        <div className="h-[36px] w-[180px] rounded-md overflow-hidden">
                          <StatusCell
                            value={isStatusValue(value) ? (value as StatusValue) : null}
                            onChange={(v) => updateItemValue(selectedItemId, col.id, v)}
                            options={col.title.toLowerCase().includes('priority') ? PRIORITY_OPTIONS : undefined}
                          />
                        </div>
                      )}
                      {col.type === 'person' && (
                        <div className="h-[36px] w-[180px]">
                          <PersonCell
                            value={isPersonValue(value) ? (value as PersonValue) : null}
                            onChange={(v) => updateItemValue(selectedItemId, col.id, v)}
                          />
                        </div>
                      )}
                      {col.type === 'date' && (
                        <input
                          type="date"
                          value={(value as string) || ''}
                          onChange={(e) => updateItemValue(selectedItemId, col.id, e.target.value)}
                          className="px-3 py-2 text-[14px] border border-[#E6E9EF] rounded-lg outline-none focus:border-[#6161FF] transition-colors"
                        />
                      )}
                      {col.type === 'number' && (
                        <input
                          type="number"
                          value={typeof value === 'number' ? value : ''}
                          onChange={(e) => updateItemValue(selectedItemId, col.id, e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-[120px] px-3 py-2 text-[14px] border border-[#E6E9EF] rounded-lg outline-none focus:border-[#6161FF] transition-colors"
                          placeholder="0"
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Subitems */}
              <div className="mt-8 pt-6 border-t border-[#E6E9EF]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[14px] font-semibold text-[#323338]">Subitems ({subitems.length})</h3>
                  <button onClick={() => addSubitem(selectedItemId)} className="flex items-center gap-1 text-[13px] text-[#6161FF] hover:text-[#5050E6] transition-colors">
                    <Plus size={14} />Add subitem
                  </button>
                </div>
                {subitems.length === 0 ? (
                  <p className="text-[13px] text-[#C5C7D0] py-4 text-center">No subitems yet</p>
                ) : (
                  <div className="space-y-1">
                    {subitems.map((sub) => {
                      const subStatus = board.columns.find((c) => c.type === 'status');
                      const statusVal = subStatus ? sub.values[subStatus.id] : null;
                      return (
                        <div key={sub.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F6F7FB] transition-colors group/sub">
                          {isStatusValue(statusVal) && <div className="w-3 h-3 rounded-full shrink-0" style={{ background: (statusVal as StatusValue).color }} />}
                          <input
                            value={nameColumn ? (sub.values[nameColumn.id] as string) || '' : ''}
                            onChange={(e) => nameColumn && updateItemValue(sub.id, nameColumn.id, e.target.value)}
                            className="flex-1 text-[13px] text-[#323338] bg-transparent outline-none"
                            placeholder="Subitem name"
                          />
                          <button onClick={() => deleteItem(sub.id)} className="text-[#C5C7D0] hover:text-[#E2445C] opacity-0 group-hover/sub:opacity-100 transition-all">
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Compose */}
              <div className="mb-6">
                <textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="Write an update..."
                  rows={3}
                  className="w-full px-4 py-3 text-[14px] border border-[#E6E9EF] rounded-lg outline-none focus:border-[#6161FF] resize-none transition-colors"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => {
                      if (updateText.trim() && selectedItemId) {
                        addComment(
                          selectedItemId,
                          updateText.trim(),
                          currentPerson.id,
                          currentPerson.name,
                          currentPerson.avatarColor
                        );
                        setUpdateText('');
                      }
                    }}
                    disabled={!updateText.trim()}
                    className="px-4 py-2 bg-[#6161FF] hover:bg-[#5050E6] disabled:opacity-40 text-white text-[13px] font-medium rounded-lg transition-colors"
                  >
                    Post update
                  </button>
                </div>
              </div>

              {/* Comments list */}
              {comments.length === 0 ? (
                <div className="text-center py-8 text-[#C5C7D0] text-[14px]">
                  No updates yet. Be the first to post!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group/comment">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0 mt-0.5"
                        style={{ background: comment.userAvatar }}
                      >
                        {getInitials(comment.userName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-[#323338]">
                            {comment.userName}
                          </span>
                          <span className="text-[12px] text-[#C5C7D0]">
                            {relativeTime(comment.createdAt)}
                          </span>
                          {comment.userId === currentPerson.id && (
                            <button
                              onClick={() => deleteComment(selectedItemId, comment.id)}
                              className="text-[#C5C7D0] hover:text-[#E2445C] opacity-0 group-hover/comment:opacity-100 transition-all ml-auto"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-[14px] text-[#323338] whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
