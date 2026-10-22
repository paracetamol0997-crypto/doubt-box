import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock, MessageSquare, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { AppNotification } from '../types';
import { api } from '../services/api';
import { wsClient } from '../services/websocket';
import { useToast } from '../context/ToastContext';

interface NotificationDropdownProps {
  onSelectDoubt?: (doubtId: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onSelectDoubt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { realtimeNotify } = useToast();

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      const unread = data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Subscribe to live WebSocket notifications!
    const unsubscribe = wsClient.onNotification((notif) => {
      // Show desktop/in-app toast alert
      realtimeNotify(notif.title, notif.message);

      // Add to list and increment unread count
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [realtimeNotify]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_DOUBT':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case 'DOUBT_ANSWERED':
        return <CheckCheck className="w-4 h-4 text-emerald-600" />;
      case 'CLARIFICATION_REQUESTED':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'TEACHER_APPROVED':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors focus:outline-hidden"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-slide-down">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Real-time alerts will appear here</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) handleMarkAsRead(n.id);
                    if (n.related_doubt_id && onSelectDoubt) {
                      onSelectDoubt(n.related_doubt_id);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    !n.is_read ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="p-2 bg-white rounded-lg shadow-xs border border-slate-100 shrink-0 mt-0.5">
                    {getNotificationIcon(n.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {n.related_doubt_id && (
                        <span className="text-indigo-600 font-medium flex items-center gap-0.5 hover:underline">
                          View Doubt <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
