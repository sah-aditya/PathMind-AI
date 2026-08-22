import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../services/api'
import { Bell, Check, Info, AlertTriangle, CheckCircle, Megaphone, X } from 'lucide-react'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const queryClient = useQueryClient()

  // Query notifications every 30 seconds
  const { data: notifications = [] } = useQuery({
    queryKey: ['userNotifications'],
    queryFn: () => notificationApi.list().then(r => r.data),
    refetchInterval: 30000,
  })

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] })
    },
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      default:
        return <Info className="w-4 h-4 text-sky-500 flex-shrink-0" />
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-darkBg-border">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Announcements</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-darkBg-border">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No active announcements right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 transition-colors ${
                    n.is_read
                      ? 'opacity-70 bg-transparent'
                      : 'bg-brand-50/30 dark:bg-brand-950/10 font-medium'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {getTypeIcon(n.type)}
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                          {n.created_at ? new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>

                    {!n.is_read && (
                      <button
                        onClick={() => markReadMutation.mutate(n.id)}
                        className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5 flex-shrink-0 font-semibold"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" /> Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  )
}
