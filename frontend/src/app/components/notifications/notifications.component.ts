import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { ToastService } from '../../services/toast.service';
import { Notification } from '../../models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-page">
      <div class="page-header">
        <div class="page-header__title">
          <h1>Notifications</h1>
          <p>{{ unreadCount }} unread notifications</p>
        </div>
        <div style="display:flex;gap:.75rem;">
          <button class="btn btn--secondary" (click)="markAllRead()" [disabled]="unreadCount === 0">
            ✅ Mark All Read
          </button>
        </div>
      </div>

      @if (isLoading) {
        <div style="text-align:center;padding:3rem;">
          <div class="spinner spinner--dark" style="width:2.5rem;height:2.5rem;border-width:3px;margin:0 auto;"></div>
        </div>
      } @else if (notifications.length === 0) {
        <div class="card">
          <div class="empty-state">
            <div class="emoji">🔔</div>
            <h3>No Notifications</h3>
            <p>You're all caught up! No notifications to show.</p>
          </div>
        </div>
      } @else {
        <div class="notif-list">
          @for (notif of notifications; track notif._id) {
            <div class="notif-item" [class.unread]="!notif.isRead" (click)="markRead(notif)">
              <div class="notif-icon" [class]="'notif-icon--' + notif.type">
                {{ getIcon(notif.type) }}
              </div>
              <div class="notif-body">
                <div class="notif-header-row">
                  <h4 class="notif-title">{{ notif.title }}</h4>
                  <div style="display:flex;align-items:center;gap:.5rem;">
                    <span class="notif-time">{{ formatTime(notif.createdAt) }}</span>
                    @if (!notif.isRead) {
                      <span class="unread-dot"></span>
                    }
                  </div>
                </div>
                <p class="notif-msg">{{ notif.message }}</p>
                <div class="notif-channels">
                  @if (notif.channels?.inApp) { <span class="channel-tag">📱 In-App</span> }
                  @if (notif.emailSent) { <span class="channel-tag">📧 Email Sent</span> }
                  @if (notif.whatsappSent) { <span class="channel-tag">💬 WhatsApp Sent</span> }
                  @if (notif.channels?.email && !notif.emailSent) { <span class="channel-tag pending">📧 Email Pending</span> }
                  @if (notif.channels?.whatsapp && !notif.whatsappSent) { <span class="channel-tag pending">💬 WhatsApp Pending</span> }
                </div>
              </div>
              <button class="notif-delete" (click)="deleteNotif($event, notif._id)" title="Delete">🗑️</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-page { max-width: 800px; }

    .notif-list { display: flex; flex-direction: column; gap: .75rem; }

    .notif-item {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--bg-card);
      border-radius: 16px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: all .2s;
      align-items: flex-start;
      position: relative;

      &:hover {
        box-shadow: var(--shadow);
        transform: translateX(4px);
      }

      &.unread {
        border-left: 4px solid var(--primary);
        background: linear-gradient(to right, rgba(99,102,241,.04), var(--bg-card));
      }
    }

    .notif-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.375rem;
      flex-shrink: 0;

      &--absent { background: rgba(239,68,68,.15); }
      &--low_attendance { background: rgba(245,158,11,.15); }
      &--info { background: rgba(99,102,241,.15); }
      &--warning { background: rgba(245,158,11,.15); }
    }

    .notif-body { flex: 1; min-width: 0; }

    .notif-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: .25rem;
    }

    .notif-title {
      font-size: .9375rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .notif-time {
      font-size: .75rem;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      flex-shrink: 0;
    }

    .notif-msg {
      font-size: .875rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: .5rem;
    }

    .notif-channels {
      display: flex;
      flex-wrap: wrap;
      gap: .375rem;
    }

    .channel-tag {
      padding: .2rem .6rem;
      border-radius: 20px;
      font-size: .7rem;
      font-weight: 600;
      background: rgba(99,102,241,.1);
      color: var(--primary);

      &.pending {
        background: rgba(245,158,11,.1);
        color: var(--warning);
      }
    }

    .notif-delete {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      opacity: 0;
      padding: .25rem;
      border-radius: 6px;
      transition: all .2s;
      flex-shrink: 0;

      .notif-item:hover & { opacity: 1; }
      &:hover { background: rgba(239,68,68,.1); }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = true;
  unreadCount = 0;

  constructor(
    private notificationService: NotificationService,
    private toast: ToastService
  ) {}

  ngOnInit(): void { this.loadNotifications(); }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications = res.notifications;
          this.unreadCount = res.unreadCount;
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  markRead(notif: Notification): void {
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif._id).subscribe(() => {
        notif.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
      this.toast.success('All notifications marked as read');
    });
  }

  deleteNotif(event: Event, id: string): void {
    event.stopPropagation();
    this.notificationService.delete(id).subscribe(() => {
      const n = this.notifications.find(x => x._id === id);
      if (n && !n.isRead) this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.notifications = this.notifications.filter(x => x._id !== id);
      this.toast.success('Notification deleted');
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      absent: '❌', low_attendance: '⚠️', info: 'ℹ️', warning: '🔔'
    };
    return icons[type] || '🔔';
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
}
