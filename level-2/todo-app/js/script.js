/**
 * TaskFlow Pro — Application Logic + Motion Layer + Feature Modules
 * Architecture : Modular, Event-Driven, Single Source of Truth
 *
 * Module order (dependency-safe):
 *   1.  Utils               — pure helpers
 *   2.  StorageAPI          — localStorage wrapper
 *   3.  AppState            — single source of truth
 *   4.  SettingsManager     — user preferences / settings
 *   5.  NotificationCenter  — in-app notification log
 *   6.  TaskManager         — CRUD
 *   7.  ToastSystem         — toast queue with progress bar
 *   8.  ModalManager        — <dialog> lifecycle
 *   9.  AnimationEngine     — counters, view transitions, stagger
 *   10. ProfileDropdown     — user dropdown menu
 *   11. NotifPanel          — notification bell panel
 *   12. SettingsDrawer      — settings side drawer
 *   13. DataIO              — export / import / clear
 *   14. UI                  — render engine + event wiring
 *   15. Bootstrap
 */

'use strict';

/* ==========================================================================
   1. Utilities
   ========================================================================== */
const Utils = {
    generateId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(`${dateString}T12:00:00Z`);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    },

    isToday(dateString) {
        if (!dateString) return false;
        const today = new Date();
        const date  = new Date(`${dateString}T12:00:00Z`);
        return (
            date.getUTCDate()     === today.getDate()    &&
            date.getUTCMonth()    === today.getMonth()   &&
            date.getUTCFullYear() === today.getFullYear()
        );
    },

    isOverdue(dateString) {
        if (!dateString) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(`${dateString}T00:00:00`) < today;
    },

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    },

    normalizeDateInput(value) {
        return (value && value.trim()) ? value.trim() : null;
    },

    lerp(start, end, t)   { return start + (end - start) * t; },
    easeOutCubic(t)       { return 1 - Math.pow(1 - t, 3); },

    /** Format relative time for notifications (e.g. "2m ago") */
    timeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        if (diff < 60_000)   return 'just now';
        if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
        if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
        return `${Math.floor(diff / 86_400_000)}d ago`;
    }
};

/* ==========================================================================
   2. StorageAPI
   ========================================================================== */
const StorageAPI = {
    TASKS_KEY:  'taskflow_pro_tasks',
    THEME_KEY:  'taskflow_pro_theme',
    SETTINGS_KEY: 'taskflow_pro_settings',
    NOTIFS_KEY:   'taskflow_pro_notifications',

    saveTasks(tasks) {
        try { localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks)); }
        catch (err) {
            console.error('[StorageAPI] Failed to persist tasks:', err);
            ToastSystem.show('Storage error: data may not be saved.', 'error');
        }
    },

    loadTasks() {
        try {
            const raw = localStorage.getItem(this.TASKS_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            console.error('[StorageAPI] Corrupted task data, resetting:', err);
            return [];
        }
    },

    saveTheme(theme) {
        try { localStorage.setItem(this.THEME_KEY, theme); }
        catch (err) { console.warn('[StorageAPI] Could not save theme:', err); }
    },

    loadTheme() {
        try { return localStorage.getItem(this.THEME_KEY) || 'light'; }
        catch { return 'light'; }
    },

    saveSettings(settings) {
        try { localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings)); }
        catch (err) { console.warn('[StorageAPI] Could not save settings:', err); }
    },

    loadSettings() {
        try {
            const raw = localStorage.getItem(this.SETTINGS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    },

    saveNotifications(notifs) {
        try { localStorage.setItem(this.NOTIFS_KEY, JSON.stringify(notifs.slice(0, 50))); }
        catch (err) { console.warn('[StorageAPI] Could not save notifications:', err); }
    },

    loadNotifications() {
        try {
            const raw = localStorage.getItem(this.NOTIFS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }
};

/* ==========================================================================
   3. AppState
   ========================================================================== */
const AppState = {
    tasks: [],

    filter: {
        status:      'all',
        category:    'all',
        searchQuery: '',
        sort:        'date-desc'
    },

    theme: 'light',
    activeTaskToEdit:   null,
    activeTaskToDelete: null,
    _prevStats: { total: 0, completed: 0, pending: 0, percentage: 0 },

    init() {
        this.tasks = StorageAPI.loadTasks();
        this.theme = StorageAPI.loadTheme();
        this._applyTheme(this.theme);
    },

    _applyTheme(theme) {
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    },

    setTheme(theme) {
        this.theme = theme;
        StorageAPI.saveTheme(theme);
        this._applyTheme(theme);
    },

    getFilteredAndSortedTasks() {
        let result = [...this.tasks];

        if (this.filter.searchQuery) {
            const q = this.filter.searchQuery.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q)) ||
                (t.category    && t.category.toLowerCase().includes(q))
            );
        }

        switch (this.filter.status) {
            case 'completed': result = result.filter(t =>  t.completed); break;
            case 'pending':   result = result.filter(t => !t.completed); break;
            case 'today':     result = result.filter(t =>  Utils.isToday(t.dueDate)); break;
            case 'overdue':   result = result.filter(t => !t.completed && Utils.isOverdue(t.dueDate)); break;
            case 'important': result = result.filter(t =>  t.priority === 'high'); break;
            case 'upcoming':  result = result.filter(t =>
                t.dueDate && !Utils.isOverdue(t.dueDate) && !Utils.isToday(t.dueDate) && !t.completed
            ); break;
        }

        if (this.filter.category !== 'all') {
            result = result.filter(t => t.category === this.filter.category);
        }

        const PRI = { high: 3, medium: 2, low: 1 };
        result.sort((a, b) => {
            switch (this.filter.sort) {
                case 'date-asc':      return a.createdAt - b.createdAt;
                case 'alpha':         return a.title.localeCompare(b.title);
                case 'priority-desc': return (PRI[b.priority] ?? 0) - (PRI[a.priority] ?? 0);
                case 'priority-asc':  return (PRI[a.priority] ?? 0) - (PRI[b.priority] ?? 0);
                case 'due-date': {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
                case 'date-desc':
                default: return b.createdAt - a.createdAt;
            }
        });
        return result;
    }
};

/* ==========================================================================
   4. SettingsManager
   ========================================================================== */
const SettingsManager = {
    _defaults: {
        theme:              'light',
        defaultCategory:    'work',
        defaultPriority:    'medium',
        defaultSort:        'date-desc',
        enableToasts:       true,
        toastDuration:      4,
        enableAnimations:   true,
        reduceMotion:       false,
        highContrast:       false
    },

    _current: {},

    init() {
        const saved = StorageAPI.loadSettings();
        this._current = { ...this._defaults, ...saved };
        this._applyAll();
    },

    get(key) { return this._current[key] ?? this._defaults[key]; },

    set(key, value) {
        this._current[key] = value;
        StorageAPI.saveSettings(this._current);
        this._applyKey(key, value);
        NotificationCenter.add('Settings Updated', `"${key}" changed`, 'info');
    },

    setMany(updates) {
        Object.assign(this._current, updates);
        StorageAPI.saveSettings(this._current);
        Object.entries(updates).forEach(([k, v]) => this._applyKey(k, v));
    },

    reset() {
        this._current = { ...this._defaults };
        StorageAPI.saveSettings(this._current);
        this._applyAll();
    },

    _applyAll() {
        Object.entries(this._current).forEach(([k, v]) => this._applyKey(k, v));
    },

    _applyKey(key, value) {
        switch (key) {
            case 'theme':
                AppState.setTheme(value);
                UI._updateThemeIcon?.();
                SettingsDrawer.syncThemeRadios?.();
                break;
            case 'defaultSort':
                AppState.filter.sort = value;
                const sortEl = document.getElementById('sort-tasks');
                if (sortEl) sortEl.value = value;
                break;
            case 'reduceMotion':
                document.body.classList.toggle('reduce-motion', value);
                break;
            case 'highContrast':
                document.body.classList.toggle('high-contrast', value);
                break;
            case 'defaultCategory': {
                const el = document.getElementById('task-category');
                if (el) el.value = value;
                break;
            }
            case 'defaultPriority': {
                const el = document.getElementById('task-priority');
                if (el) el.value = value;
                break;
            }
        }
    }
};

/* ==========================================================================
   5. NotificationCenter  — in-app notification log
   ========================================================================== */
const NotificationCenter = {
    _items: [],    // [{ id, title, message, type, timestamp, read }]
    _unread: 0,

    init() {
        this._items  = StorageAPI.loadNotifications();
        this._unread = this._items.filter(n => !n.read).length;
        this._syncBadge();
    },

    /**
     * @param {string} title
     * @param {string} message
     * @param {'success'|'info'|'warning'|'danger'} type
     */
    add(title, message, type = 'info') {
        const notif = {
            id:        Utils.generateId(),
            title,
            message,
            type,
            timestamp: Date.now(),
            read:      false
        };
        this._items.unshift(notif);
        this._unread++;
        this._syncBadge();
        StorageAPI.saveNotifications(this._items);
        NotifPanel.refresh();
    },

    markAllRead() {
        this._items.forEach(n => n.read = true);
        this._unread = 0;
        this._syncBadge();
        StorageAPI.saveNotifications(this._items);
        NotifPanel.refresh();
    },

    _syncBadge() {
        const badge = document.getElementById('notif-badge');
        if (!badge) return;
        if (this._unread > 0) {
            badge.textContent = this._unread > 99 ? '99+' : this._unread;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
        // Update aria-label on button
        const btn = document.getElementById('notification-btn');
        if (btn) btn.setAttribute('aria-label',
            this._unread > 0 ? `${this._unread} unread notifications` : 'Notifications');
    }
};

/* ==========================================================================
   6. TaskManager
   ========================================================================== */
const TaskManager = {
    addTask(data) {
        const task = {
            id:          Utils.generateId(),
            title:       data.title.trim(),
            description: (data.description || '').trim(),
            priority:    data.priority  || 'medium',
            category:    data.category  || 'work',
            dueDate:     Utils.normalizeDateInput(data.dueDate),
            completed:   false,
            createdAt:   Date.now(),
            updatedAt:   Date.now()
        };
        AppState.tasks.unshift(task);
        StorageAPI.saveTasks(AppState.tasks);
        UI.render();
        if (SettingsManager.get('enableToasts')) ToastSystem.show(`"${task.title}" added`, 'success');
        NotificationCenter.add('Task Created', `"${task.title}" was added`, 'success');
    },

    updateTask(id, data) {
        const idx = AppState.tasks.findIndex(t => t.id === id);
        if (idx === -1) return;
        AppState.tasks[idx] = {
            ...AppState.tasks[idx],
            title:       data.title.trim(),
            description: (data.description || '').trim(),
            priority:    data.priority,
            category:    data.category,
            dueDate:     Utils.normalizeDateInput(data.dueDate),
            updatedAt:   Date.now()
        };
        StorageAPI.saveTasks(AppState.tasks);
        UI.render();
        if (SettingsManager.get('enableToasts')) ToastSystem.show('Task updated', 'success');
        NotificationCenter.add('Task Updated', `"${AppState.tasks[idx].title}" was updated`, 'info');
    },

    deleteTask(id) {
        const task = AppState.tasks.find(t => t.id === id);
        const title = task?.title ?? 'Task';
        AppState.tasks = AppState.tasks.filter(t => t.id !== id);
        StorageAPI.saveTasks(AppState.tasks);
        UI.render();
        if (SettingsManager.get('enableToasts')) ToastSystem.show('Task deleted', 'info');
        NotificationCenter.add('Task Deleted', `"${title}" was removed`, 'danger');
    },

    toggleTaskStatus(id) {
        const task = AppState.tasks.find(t => t.id === id);
        if (!task) return;
        task.completed = !task.completed;
        task.updatedAt = Date.now();
        StorageAPI.saveTasks(AppState.tasks);
        UI.render();
        if (SettingsManager.get('enableToasts')) {
            ToastSystem.show(task.completed ? 'Task completed! 🎉' : 'Task marked as pending', 'success');
        }
        if (task.completed) {
            NotificationCenter.add('Task Completed', `"${task.title}" was completed 🎉`, 'success');
        }
    },

    bulkDeleteCompleted() {
        const before = AppState.tasks.length;
        AppState.tasks = AppState.tasks.filter(t => !t.completed);
        const removed = before - AppState.tasks.length;
        if (removed === 0) {
            if (SettingsManager.get('enableToasts')) ToastSystem.show('No completed tasks to clear', 'info');
            return;
        }
        StorageAPI.saveTasks(AppState.tasks);
        UI.render();
        if (SettingsManager.get('enableToasts')) {
            ToastSystem.show(`Cleared ${removed} completed task${removed > 1 ? 's' : ''}`, 'info');
        }
        NotificationCenter.add('Tasks Cleared', `${removed} completed tasks removed`, 'info');
    },

    duplicateTask(id) {
        const src = AppState.tasks.find(t => t.id === id);
        if (!src) return;
        const copy = { ...src, id: Utils.generateId(), title: `${src.title} (Copy)`,
            completed: false, createdAt: Date.now(), updatedAt: Date.now() };
        AppState.tasks.unshift(copy);
        StorageAPI.saveTasks(AppState.tasks);
        UI.render();
        if (SettingsManager.get('enableToasts')) ToastSystem.show('Task duplicated', 'success');
    },

    clearAll() {
        AppState.tasks = [];
        StorageAPI.saveTasks([]);
        UI.render();
        if (SettingsManager.get('enableToasts')) ToastSystem.show('All tasks cleared', 'info');
        NotificationCenter.add('All Tasks Cleared', 'Task list was reset', 'warning');
    }
};

/* ==========================================================================
   7. ToastSystem  (replaces old NotificationSystem name for clarity)
   ========================================================================== */
const ToastSystem = {
    _container: null,

    init() { this._container = document.getElementById('toast-container'); },

    show(message, type = 'info') {
        if (!this._container) { console.info(`[Toast/${type}] ${message}`); return; }

        const durationMs = (SettingsManager.get('toastDuration') ?? 4) * 1000;
        const iconMap = { success: 'fa-circle-check', error: 'fa-circle-xmark',
            warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
        const title = type.charAt(0).toUpperCase() + type.slice(1);
        const icon  = iconMap[type] ?? 'fa-circle-info';

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');

        toast.innerHTML = `
            <div class="toast-body-row">
                <div class="toast-icon" aria-hidden="true"><i class="fa-solid ${icon}"></i></div>
                <div class="toast-content">
                    <h4 class="toast-title">${title}</h4>
                    <p class="toast-message">${Utils.escapeHTML(message)}</p>
                </div>
                <button type="button" class="toast-close" aria-label="Dismiss notification">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
            </div>
            <div class="toast-progress" aria-hidden="true">
                <div class="toast-progress-bar"></div>
            </div>`;

        this._container.appendChild(toast);

        const bar = toast.querySelector('.toast-progress-bar');
        const startTime = performance.now();
        const animateBar = (now) => {
            if (toast._dismissed) return;
            const fraction = Math.min((now - startTime) / durationMs, 1);
            bar.style.transform = `scaleX(${1 - fraction})`;
            bar.style.transformOrigin = 'left';
            if (fraction < 1) requestAnimationFrame(animateBar);
        };
        requestAnimationFrame(animateBar);

        toast.querySelector('.toast-close').addEventListener('click', () => this._dismiss(toast));
        toast._timerId = setTimeout(() => this._dismiss(toast), durationMs);

        toast.addEventListener('mouseenter', () => clearTimeout(toast._timerId));
        toast.addEventListener('mouseleave', () => {
            if (!toast._dismissed) toast._timerId = setTimeout(() => this._dismiss(toast), 1500);
        });
    },

    _dismiss(toast) {
        if (!toast || toast._dismissed) return;
        toast._dismissed = true;
        clearTimeout(toast._timerId);
        toast.style.opacity   = '0';
        toast.style.transform = 'translateX(110%) scale(0.9)';
        setTimeout(() => toast.remove(), 350);
    }
};

/* Backward-compat alias so StorageAPI error path still works */
const NotificationSystem = ToastSystem;

/* ==========================================================================
   8. ModalManager
   ========================================================================== */
const ModalManager = {
    _backdropHandlers: new WeakMap(),
    _closeBtnHandler:  new WeakMap(),

    open(dialog) {
        if (!dialog) return;
        dialog.showModal();
        dialog.removeAttribute('hidden');

        const backdropHandler = (e) => { if (e.target === dialog) this.close(dialog); };
        this._backdropHandlers.set(dialog, backdropHandler);
        dialog.addEventListener('click', backdropHandler);

        const closeHandler = () => this.close(dialog);
        this._closeBtnHandler.set(dialog, closeHandler);
        dialog.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeHandler));

        dialog.addEventListener('close', () => this._cleanup(dialog), { once: true });
    },

    close(dialog) {
        if (!dialog || !dialog.open) return;
        dialog.close();
    },

    _cleanup(dialog) {
        const bh = this._backdropHandlers.get(dialog);
        if (bh) { dialog.removeEventListener('click', bh); this._backdropHandlers.delete(dialog); }
        const ch = this._closeBtnHandler.get(dialog);
        if (ch) {
            dialog.querySelectorAll('.close-modal').forEach(btn => btn.removeEventListener('click', ch));
            this._closeBtnHandler.delete(dialog);
        }
        if (dialog.id === 'edit-task-modal') {
            AppState.activeTaskToEdit = null;
            document.getElementById('edit-task-form')?.reset();
        }
        if (dialog.id === 'confirm-modal') {
            AppState.activeTaskToDelete = null;
        }
    }
};

/* ==========================================================================
   9. AnimationEngine
   ========================================================================== */
const AnimationEngine = {
    animateCounter(el, from, to, suffix = '', durationMs = 450) {
        if (!el || from === to) { if (el) el.textContent = to + suffix; return; }
        el.classList.remove('is-updating');
        void el.offsetWidth;
        el.classList.add('is-updating');
        const startTime = performance.now();
        const update = (now) => {
            const progress = Math.min((now - startTime) / durationMs, 1);
            el.textContent = Math.round(Utils.lerp(from, to, Utils.easeOutCubic(progress))) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    },

    updateStats(els, newStats) {
        const prev = AppState._prevStats;
        this.animateCounter(els.statTotal,      prev.total,      newStats.total,      '', 400);
        this.animateCounter(els.statCompleted,  prev.completed,  newStats.completed,  '', 400);
        this.animateCounter(els.statPending,    prev.pending,    newStats.pending,    '', 400);
        this.animateCounter(els.statPercentage, prev.percentage, newStats.percentage, '%', 500);
        AppState._prevStats = { ...newStats };
    },

    staggerCards(cards) {
        cards.forEach((card, i) => {
            card.style.animationDelay    = `${i * 40}ms`;
            card.style.animationFillMode = 'both';
        });
    },

    transitionTaskList(container, swapFn) {
        if (!container) { swapFn(); return; }
        if (!SettingsManager.get('enableAnimations') ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            swapFn();
            return;
        }

        const existing = container.querySelectorAll('.task-card');
        if (existing.length === 0) {
            swapFn();
            this.staggerCards(container.querySelectorAll('.task-card'));
            return;
        }

        let done = 0;
        const total = existing.length;
        existing.forEach((card, i) => {
            card.style.transitionDelay = `${i * 20}ms`;
            card.style.opacity  = '0';
            card.style.transform = 'scale(0.95) translateY(-4px)';
        });

        const first = existing[0];
        const onExit = () => {
            done++;
            if (done < total) return;
            swapFn();
            first.removeEventListener('transitionend', onExit);
            this.staggerCards(container.querySelectorAll('.task-card'));
        };
        first.addEventListener('transitionend', onExit);
        setTimeout(() => { if (done < total) onExit(); }, 350);
    },

    viewTransition(wrapper, swapFn) {
        if (!wrapper) { swapFn(); return; }
        if (!SettingsManager.get('enableAnimations') ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            swapFn();
            return;
        }
        wrapper.classList.add('is-leaving');
        wrapper.classList.remove('is-visible', 'is-entering');
        setTimeout(() => {
            swapFn();
            wrapper.classList.remove('is-leaving');
            wrapper.classList.add('is-entering');
            void wrapper.offsetWidth;
            wrapper.classList.add('is-visible');
            wrapper.classList.remove('is-entering');
        }, 150);
    },

    animateThemeToggle(btn, newTheme) {
        if (!btn) return;
        const icon = btn.querySelector('i');
        if (!icon) return;
        icon.style.transition = 'transform 300ms cubic-bezier(0.34,1.56,0.64,1), opacity 150ms';
        icon.style.transform  = 'rotate(180deg) scale(0)';
        icon.style.opacity    = '0';
        setTimeout(() => {
            icon.className = newTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            btn.setAttribute('aria-label', newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
            icon.style.transform = 'rotate(0deg) scale(1)';
            icon.style.opacity   = '1';
        }, 150);
    },

    updateCreateBtnPulse() {
        const btn = document.getElementById('header-create-btn');
        if (!btn) return;
        btn.classList.toggle('is-pulsing', AppState.tasks.length === 0);
    }
};

/* ==========================================================================
   10. ProfileDropdown
   ========================================================================== */
const ProfileDropdown = {
    _btn:      null,
    _dropdown: null,
    _isOpen:   false,
    _outsideHandler: null,
    _keyHandler: null,

    init() {
        this._btn      = document.getElementById('profile-btn');
        this._dropdown = document.getElementById('profile-dropdown');
        if (!this._btn || !this._dropdown) return;

        this._btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._isOpen ? this.close() : this.open();
        });

        // Dropdown action buttons
        document.getElementById('pd-profile-btn')?.addEventListener('click', () => {
            this.close();
            UI._openProfileModal();
        });
        document.getElementById('pd-theme-btn')?.addEventListener('click', () => {
            this.close();
            UI._toggleTheme();
        });
        document.getElementById('pd-export-btn')?.addEventListener('click', () => {
            this.close();
            DataIO.exportTasks();
        });
        document.getElementById('pd-import-btn')?.addEventListener('click', () => {
            this.close();
            DataIO.triggerImport();
        });
        document.getElementById('pd-clear-btn')?.addEventListener('click', () => {
            this.close();
            DataIO.confirmClearAll();
        });
        document.getElementById('pd-about-btn')?.addEventListener('click', () => {
            this.close();
            ModalManager.open(document.getElementById('about-modal'));
        });

        this._syncThemeLabel();
    },

    open() {
        this._isOpen = true;
        this._dropdown.removeAttribute('hidden');
        // rAF so hidden removal is flushed before adding class
        requestAnimationFrame(() => this._dropdown.classList.add('is-open'));
        this._btn.setAttribute('aria-expanded', 'true');

        this._outsideHandler = (e) => {
            if (!this._dropdown.contains(e.target) && e.target !== this._btn) this.close();
        };
        this._keyHandler = (e) => {
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowDown') {
                const items = [...this._dropdown.querySelectorAll('.pd-item')];
                const idx = items.indexOf(document.activeElement);
                items[(idx + 1) % items.length]?.focus();
            }
            if (e.key === 'ArrowUp') {
                const items = [...this._dropdown.querySelectorAll('.pd-item')];
                const idx = items.indexOf(document.activeElement);
                items[(idx - 1 + items.length) % items.length]?.focus();
            }
        };

        // Defer outside listener to avoid catching the opening click
        setTimeout(() => {
            document.addEventListener('click', this._outsideHandler);
            document.addEventListener('keydown', this._keyHandler);
        }, 0);
    },

    close() {
        this._isOpen = false;
        this._dropdown.classList.remove('is-open');
        this._btn.setAttribute('aria-expanded', 'false');
        this._btn.focus();

        document.removeEventListener('click', this._outsideHandler);
        document.removeEventListener('keydown', this._keyHandler);

        setTimeout(() => {
            if (!this._isOpen) this._dropdown.setAttribute('hidden', '');
        }, 260);
    },

    _syncThemeLabel() {
        const icon  = document.getElementById('pd-theme-icon');
        const label = document.getElementById('pd-theme-label');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (icon)  icon.className  = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        if (label) label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    }
};

/* ==========================================================================
   11. NotifPanel
   ========================================================================== */
const NotifPanel = {
    _btn:    null,
    _panel:  null,
    _isOpen: false,
    _outsideHandler: null,
    _keyHandler: null,

    init() {
        this._btn   = document.getElementById('notification-btn');
        this._panel = document.getElementById('notif-panel');
        if (!this._btn || !this._panel) return;

        this._btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._isOpen ? this.close() : this.open();
        });

        document.getElementById('mark-all-read-btn')?.addEventListener('click', () => {
            NotificationCenter.markAllRead();
        });

        this.refresh();
    },

    open() {
        this._isOpen = true;
        this._panel.removeAttribute('hidden');
        requestAnimationFrame(() => this._panel.classList.add('is-open'));
        this._btn.setAttribute('aria-expanded', 'true');

        this._outsideHandler = (e) => {
            if (!this._panel.contains(e.target) && e.target !== this._btn) this.close();
        };
        this._keyHandler = (e) => { if (e.key === 'Escape') this.close(); };

        setTimeout(() => {
            document.addEventListener('click', this._outsideHandler);
            document.addEventListener('keydown', this._keyHandler);
        }, 0);
    },

    close() {
        this._isOpen = false;
        this._panel.classList.remove('is-open');
        this._btn.setAttribute('aria-expanded', 'false');
        this._btn.focus();
        document.removeEventListener('click', this._outsideHandler);
        document.removeEventListener('keydown', this._keyHandler);
        setTimeout(() => {
            if (!this._isOpen) this._panel.setAttribute('hidden', '');
        }, 260);
    },

    refresh() {
        const list  = document.getElementById('notif-list');
        const empty = document.getElementById('notif-empty');
        if (!list) return;

        const items = NotificationCenter._items;
        if (items.length === 0) {
            list.innerHTML = '';
            empty?.removeAttribute('hidden');
            return;
        }
        empty?.setAttribute('hidden', '');

        const iconMap = { success: 'notif-icon-success', info: 'notif-icon-info',
            warning: 'notif-icon-warning', danger: 'notif-icon-danger' };
        const faMap = { success: 'fa-circle-check', info: 'fa-circle-info',
            warning: 'fa-triangle-exclamation', danger: 'fa-trash-can' };

        list.innerHTML = items.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" role="listitem">
                <div class="notif-icon ${iconMap[n.type] ?? 'notif-icon-info'}" aria-hidden="true">
                    <i class="fa-solid ${faMap[n.type] ?? 'fa-circle-info'}"></i>
                </div>
                <div class="notif-content">
                    <p class="notif-title">${Utils.escapeHTML(n.title)}</p>
                    <p class="notif-message">${Utils.escapeHTML(n.message)}</p>
                </div>
                <time class="notif-time" datetime="${new Date(n.timestamp).toISOString()}">
                    ${Utils.timeAgo(n.timestamp)}
                </time>
            </div>`).join('');
    }
};

/* ==========================================================================
   12. SettingsDrawer
   ========================================================================== */
const SettingsDrawer = {
    _drawer:  null,
    _overlay: null,
    _isOpen:  false,
    _keyHandler: null,

    init() {
        this._drawer  = document.getElementById('settings-drawer');
        this._overlay = document.getElementById('settings-overlay');
        if (!this._drawer) return;

        document.getElementById('settings-close-btn')?.addEventListener('click', () => this.close());
        this._overlay?.addEventListener('click', () => this.close());

        // Wire settings nav link
        document.getElementById('settings-nav-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.open();
        });

        this._bindFormControls();
        this._loadCurrentValues();
    },

    open() {
        this._isOpen = true;
        this._drawer.removeAttribute('hidden');
        this._overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => this._drawer.classList.add('is-open'));

        this._keyHandler = (e) => { if (e.key === 'Escape') this.close(); };
        document.addEventListener('keydown', this._keyHandler);
    },

    close() {
        this._isOpen = false;
        this._drawer.classList.remove('is-open');
        this._overlay?.classList.remove('active');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this._keyHandler);
        setTimeout(() => {
            if (!this._isOpen) this._drawer.setAttribute('hidden', '');
        }, 280);
    },

    syncThemeRadios() {
        const theme = SettingsManager.get('theme');
        const radios = this._drawer?.querySelectorAll('input[name="app-theme"]');
        radios?.forEach(r => { r.checked = (r.value === theme); });
    },

    _loadCurrentValues() {
        // Theme radios
        this.syncThemeRadios();

        // Dropdowns
        const fields = {
            'setting-default-category':   'defaultCategory',
            'setting-default-priority':   'defaultPriority',
            'setting-default-sort':       'defaultSort'
        };
        Object.entries(fields).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (el) el.value = SettingsManager.get(key);
        });

        // Toggles
        const toggles = {
            'setting-enable-toasts':      'enableToasts',
            'setting-toast-duration':     'toastDuration',
            'setting-enable-animations':  'enableAnimations',
            'setting-reduce-motion':      'reduceMotion',
            'setting-high-contrast':      'highContrast'
        };
        Object.entries(toggles).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.type === 'checkbox') el.checked = !!SettingsManager.get(key);
            else el.value = SettingsManager.get(key);
        });
    },

    _bindFormControls() {
        // Theme radios
        this._drawer?.querySelectorAll('input[name="app-theme"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    SettingsManager.set('theme', radio.value);
                    UI._updateThemeIcon?.();
                    AnimationEngine.animateThemeToggle(
                        document.getElementById('theme-toggle'),
                        document.documentElement.getAttribute('data-theme')
                    );
                }
            });
        });

        const dropdownMappings = {
            'setting-default-category':  'defaultCategory',
            'setting-default-priority':  'defaultPriority',
            'setting-default-sort':      'defaultSort'
        };
        Object.entries(dropdownMappings).forEach(([id, key]) => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                SettingsManager.set(key, e.target.value);
                if (key === 'defaultCategory') {
                    const el = document.getElementById('task-category');
                    if (el) el.value = e.target.value;
                }
                if (key === 'defaultPriority') {
                    const el = document.getElementById('task-priority');
                    if (el) el.value = e.target.value;
                }
                if (key === 'defaultSort') {
                    AppState.filter.sort = e.target.value;
                    const el = document.getElementById('sort-tasks');
                    if (el) el.value = e.target.value;
                    UI.render();
                }
            });
        });

        const checkboxMappings = {
            'setting-enable-toasts':     'enableToasts',
            'setting-enable-animations': 'enableAnimations',
            'setting-reduce-motion':     'reduceMotion',
            'setting-high-contrast':     'highContrast'
        };
        Object.entries(checkboxMappings).forEach(([id, key]) => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                SettingsManager.set(key, e.target.checked);
            });
        });

        document.getElementById('setting-toast-duration')?.addEventListener('change', (e) => {
            const val = Math.max(2, Math.min(10, parseInt(e.target.value, 10) || 4));
            e.target.value = val;
            SettingsManager.set('toastDuration', val);
        });

        // Data buttons
        document.getElementById('settings-export-btn')?.addEventListener('click', () => DataIO.exportTasks());
        document.getElementById('settings-import-btn')?.addEventListener('click', () => DataIO.triggerImport());
        document.getElementById('settings-clear-btn')?.addEventListener('click', () => {
            this.close();
            DataIO.confirmClearAll();
        });
        document.getElementById('settings-reset-btn')?.addEventListener('click', () => {
            SettingsManager.reset();
            this._loadCurrentValues();
            if (SettingsManager.get('enableToasts')) ToastSystem.show('Settings reset to defaults', 'info');
            NotificationCenter.add('Settings Reset', 'All preferences restored to defaults', 'info');
        });
    }
};

/* ==========================================================================
   13. DataIO — export, import, clear
   ========================================================================== */
const DataIO = {
    exportTasks() {
        if (AppState.tasks.length === 0) {
            ToastSystem.show('No tasks to export', 'warning');
            return;
        }
        const payload = {
            exportedAt:  new Date().toISOString(),
            version:     '1.0.0',
            count:       AppState.tasks.length,
            tasks:       AppState.tasks
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `taskflow-pro-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        ToastSystem.show(`${AppState.tasks.length} tasks exported`, 'success');
        NotificationCenter.add('Tasks Exported', `${AppState.tasks.length} tasks saved to JSON`, 'success');
    },

    triggerImport() {
        const input = document.getElementById('import-file-input');
        input?.click();
    },

    handleImport(file) {
        if (!file || file.type !== 'application/json') {
            ToastSystem.show('Please select a valid JSON file', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target.result);
                // Accept both raw array and our export envelope
                const imported = Array.isArray(parsed) ? parsed :
                    Array.isArray(parsed.tasks) ? parsed.tasks : null;

                if (!imported) throw new Error('Unrecognized format');

                // Validate each task has a minimal shape
                const valid = imported.filter(t => t && typeof t.title === 'string');
                AppState.tasks = [...valid, ...AppState.tasks];
                StorageAPI.saveTasks(AppState.tasks);
                UI.render();
                ToastSystem.show(`${valid.length} tasks imported`, 'success');
                NotificationCenter.add('Tasks Imported', `${valid.length} tasks added`, 'success');
            } catch (err) {
                ToastSystem.show('Import failed: invalid file format', 'error');
                console.error('[DataIO] Import error:', err);
            }
        };
        reader.readAsText(file);
    },

    confirmClearAll() {
        const modal   = document.getElementById('confirm-modal');
        const heading = document.getElementById('confirm-modal-heading');
        const desc    = document.getElementById('confirm-modal-desc');
        const btn     = document.getElementById('confirm-delete-btn');
        if (!modal) return;

        if (heading) heading.textContent = 'Clear All Tasks';
        if (desc)    desc.textContent    = 'This will permanently delete ALL tasks. This action cannot be undone.';
        if (btn)     btn.textContent     = 'Clear All';

        // Override confirm button for this session
        AppState.activeTaskToDelete = '__clear_all__';
        ModalManager.open(modal);
    }
};

/* ==========================================================================
   14. UI — DOM cache, render engine, event wiring
   ========================================================================== */
const UI = {
    el: {},
    _viewWrapper: null,

    init() {
        this._cacheDOM();
        this._buildViewWrapper();
        this._bindEvents();
        this.render();

        if (!Array.isArray(AppState.tasks)) {
            ToastSystem.show('Could not load saved tasks — starting fresh.', 'warning');
            AppState.tasks = [];
        }

        // Apply settings-driven defaults to form
        const catEl  = document.getElementById('task-category');
        const priEl  = document.getElementById('task-priority');
        const sortEl = document.getElementById('sort-tasks');
        if (catEl)  catEl.value  = SettingsManager.get('defaultCategory');
        if (priEl)  priEl.value  = SettingsManager.get('defaultPriority');
        if (sortEl) {
            sortEl.value = SettingsManager.get('defaultSort');
            AppState.filter.sort = SettingsManager.get('defaultSort');
        }
    },

    _cacheDOM() {
        this.el = {
            taskList:    document.getElementById('main-task-list'),
            emptyState:  document.getElementById('empty-state'),

            statTotal:      document.getElementById('stat-total'),
            statCompleted:  document.getElementById('stat-completed'),
            statPending:    document.getElementById('stat-pending'),
            statPercentage: document.getElementById('stat-percentage'),

            quickAddForm: document.getElementById('quick-add-form'),
            taskTitle:    document.getElementById('task-title'),
            taskTitleErr: document.getElementById('task-title-error'),

            editModal:    document.getElementById('edit-task-modal'),
            editForm:     document.getElementById('edit-task-form'),

            confirmModal:     document.getElementById('confirm-modal'),
            confirmDeleteBtn: document.getElementById('confirm-delete-btn'),

            globalSearch:   document.getElementById('global-search'),
            listSearch:     document.getElementById('list-search'),
            categoryFilter: document.getElementById('category-filter'),
            statusFilter:   document.getElementById('status-filter'),
            sortTasks:      document.getElementById('sort-tasks'),

            themeToggle:     document.getElementById('theme-toggle'),
            navLinks:        document.querySelectorAll('.nav-link'),
            sidebarToggle:   document.getElementById('sidebar-toggle-btn'),
            sidebarCloseBtn: document.getElementById('sidebar-close-btn'),
            sidebar:         document.getElementById('sidebar'),
            sidebarOverlay:  document.getElementById('sidebar-overlay'),

            bulkDeleteBtn:   document.getElementById('bulk-delete-btn'),
            headerCreateBtn: document.getElementById('header-create-btn'),
            emptyCreateBtn:  document.getElementById('empty-create-btn'),
            pageTitle:       document.getElementById('page-title'),

            importInput:     document.getElementById('import-file-input'),
        };
    },

    _buildViewWrapper() {
        const main = document.getElementById('main');
        if (!main) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'view-transition-wrapper is-visible';
        wrapper.id = 'view-transition-wrapper';
        while (main.firstChild) wrapper.appendChild(main.firstChild);
        main.appendChild(wrapper);
        this._viewWrapper = wrapper;
    },

    _bindEvents() {
        // ── Quick-add form ─────────────────────────────────────────────
        this.el.quickAddForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleQuickAdd();
        });

        // ── Edit form ──────────────────────────────────────────────────
        this.el.editForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleEditSubmit();
        });

        // ── Delete / clear-all confirm ─────────────────────────────────
        this.el.confirmDeleteBtn?.addEventListener('click', () => {
            if (AppState.activeTaskToDelete === '__clear_all__') {
                TaskManager.clearAll();
                ModalManager.close(this.el.confirmModal);
                // Reset modal text for next use
                const heading = document.getElementById('confirm-modal-heading');
                const desc    = document.getElementById('confirm-modal-desc');
                const btn     = document.getElementById('confirm-delete-btn');
                if (heading) heading.textContent = 'Confirm Deletion';
                if (desc)    desc.textContent    = 'Are you sure you want to delete this task? This action cannot be undone.';
                if (btn)     btn.textContent     = 'Delete Task';
            } else if (AppState.activeTaskToDelete) {
                TaskManager.deleteTask(AppState.activeTaskToDelete);
                ModalManager.close(this.el.confirmModal);
            }
        });

        // ── Task list delegation ───────────────────────────────────────
        this.el.taskList?.addEventListener('click', (e) => {
            const card = e.target.closest('.task-card');
            if (!card) return;
            const id = card.dataset.id;
            if (e.target.closest('.task-completed-toggle')) TaskManager.toggleTaskStatus(id);
            if (e.target.closest('.btn-edit'))   this._openEditModal(id);
            if (e.target.closest('.btn-delete')) {
                AppState.activeTaskToDelete = id;
                ModalManager.open(this.el.confirmModal);
            }
        });

        // ── Search inputs ──────────────────────────────────────────────
        const onSearch = (value, syncEl) => {
            AppState.filter.searchQuery = value;
            if (syncEl) syncEl.value = value;
            this._updateSearchClearBtn(value);
            this.render();
        };
        this.el.globalSearch?.addEventListener('input', (e) => onSearch(e.target.value, this.el.listSearch));
        this.el.listSearch?.addEventListener('input',   (e) => onSearch(e.target.value, this.el.globalSearch));
        this._injectSearchClearBtn();

        // ── Filter selects ─────────────────────────────────────────────
        this.el.categoryFilter?.addEventListener('change', (e) => { AppState.filter.category = e.target.value; this.render(); });
        this.el.statusFilter?.addEventListener('change',   (e) => { AppState.filter.status   = e.target.value; this.render(); });
        this.el.sortTasks?.addEventListener('change',      (e) => { AppState.filter.sort      = e.target.value; this.render(); });

        // ── Sidebar navigation with view transition ────────────────────
        this.el.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href') || '';
                if (href === '#settings') return; // handled by SettingsDrawer

                e.preventDefault();
                this._setActiveNavLink(link);
                const section = href.slice(1);
                const newStatus = (section === 'dashboard' || section === 'all-tasks') ? 'all' : section;
                const newTitle  = link.querySelector('span')?.textContent ?? 'Dashboard';

                if (AppState.filter.status === newStatus) { this._closeSidebar(); return; }

                AnimationEngine.viewTransition(this._viewWrapper, () => {
                    AppState.filter.status = newStatus;
                    if (this.el.pageTitle) this.el.pageTitle.textContent = newTitle;
                    this.render();
                });
                this._closeSidebar();
            });
        });

        // ── Theme toggle ───────────────────────────────────────────────
        this.el.themeToggle?.addEventListener('click', () => this._toggleTheme());
        this._updateThemeIcon();

        // ── Sidebar mobile ─────────────────────────────────────────────
        this.el.sidebarToggle?.addEventListener('click', () => this._openSidebar());
        this.el.sidebarCloseBtn?.addEventListener('click', () => this._closeSidebar());
        this.el.sidebarOverlay?.addEventListener('click', () => this._closeSidebar());

        // ── Bulk delete ────────────────────────────────────────────────
        this.el.bulkDeleteBtn?.addEventListener('click', () => TaskManager.bulkDeleteCompleted());

        // ── Create Task shortcuts ──────────────────────────────────────
        const scrollToForm = () => {
            this.el.taskTitle?.focus({ preventScroll: false });
            this.el.quickAddForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        this.el.headerCreateBtn?.addEventListener('click', scrollToForm);
        this.el.emptyCreateBtn?.addEventListener('click', scrollToForm);

        // ── Keyboard shortcuts ─────────────────────────────────────────
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.el.globalSearch?.focus();
            }
        });

        // ── Import file input ──────────────────────────────────────────
        this.el.importInput?.addEventListener('change', (e) => {
            DataIO.handleImport(e.target.files[0]);
            e.target.value = ''; // reset so same file can be re-imported
        });

        // ── Ripple on .btn clicks ──────────────────────────────────────
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            if (btn) this._createRipple(btn, e);
        });
    },

    /* ── Search clear button ─────────────────────────────────────────── */
    _injectSearchClearBtn() {
        const wrapper = this.el.globalSearch?.closest('.search-input-wrapper');
        if (!wrapper || wrapper.querySelector('.search-clear-btn')) return;
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'search-clear-btn';
        clearBtn.setAttribute('aria-label', 'Clear search');
        clearBtn.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
        wrapper.appendChild(clearBtn);
        clearBtn.addEventListener('click', () => {
            if (this.el.globalSearch) this.el.globalSearch.value = '';
            if (this.el.listSearch)   this.el.listSearch.value   = '';
            AppState.filter.searchQuery = '';
            wrapper.classList.remove('has-value');
            this.el.globalSearch?.focus();
            this.render();
        });
    },
    _updateSearchClearBtn(value) {
        const wrapper = this.el.globalSearch?.closest('.search-input-wrapper');
        if (!wrapper) return;
        wrapper.classList.toggle('has-value', !!value);
    },

    /* ── Ripple ──────────────────────────────────────────────────────── */
    _createRipple(btn, event) {
        const circle = document.createElement('span');
        const rect   = btn.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height);
        Object.assign(circle.style, {
            position: 'absolute',
            width: `${size}px`, height: `${size}px`,
            left: `${event.clientX - rect.left - size / 2}px`,
            top:  `${event.clientY - rect.top  - size / 2}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.25)',
            transform: 'scale(0)',
            animation: 'rippleEffect 0.5s ease-out forwards',
            pointerEvents: 'none'
        });
        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    },

    /* ── Sidebar ─────────────────────────────────────────────────────── */
    _openSidebar() {
        this.el.sidebar?.classList.add('open');
        this.el.sidebarOverlay?.classList.add('active');
        this.el.sidebarToggle?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    },
    _closeSidebar() {
        this.el.sidebar?.classList.remove('open');
        this.el.sidebarOverlay?.classList.remove('active');
        this.el.sidebarToggle?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    },

    /* ── Nav active state ────────────────────────────────────────────── */
    _setActiveNavLink(activeLink) {
        this.el.navLinks.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'page');
    },

    /* ── Theme ───────────────────────────────────────────────────────── */
    _toggleTheme() {
        const currentRendered = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentRendered === 'dark' ? 'light' : 'dark';
        SettingsManager.set('theme', newTheme);
        AnimationEngine.animateThemeToggle(this.el.themeToggle, newTheme);
        ProfileDropdown._syncThemeLabel?.();
        SettingsDrawer.syncThemeRadios?.();
        NotificationCenter.add('Theme Changed', `Switched to ${newTheme} mode`, 'info');
    },
    _updateThemeIcon() {
        const icon = this.el.themeToggle?.querySelector('i');
        if (!icon) return;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        this.el.themeToggle?.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    },

    /* ── Profile modal ───────────────────────────────────────────────── */
    _openProfileModal() {
        const total     = AppState.tasks.length;
        const completed = AppState.tasks.filter(t => t.completed).length;
        const pct       = total === 0 ? 0 : Math.round((completed / total) * 100);
        const ptEl = document.getElementById('profile-total-tasks');
        const pcEl = document.getElementById('profile-completed-tasks');
        const prEl = document.getElementById('profile-completion-rate');
        if (ptEl) ptEl.textContent = total;
        if (pcEl) pcEl.textContent = completed;
        if (prEl) prEl.textContent = `${pct}%`;
        ModalManager.open(document.getElementById('profile-modal'));
    },

    /* ── Quick-add validation ────────────────────────────────────────── */
    _handleQuickAdd() {
        const titleInput = this.el.taskTitle;
        const titleErr   = this.el.taskTitleErr;
        const title      = titleInput?.value?.trim() ?? '';

        if (!title) {
            titleInput?.classList.remove('is-invalid');
            void titleInput?.offsetWidth;
            titleInput?.classList.add('is-invalid');
            if (titleErr) titleErr.textContent = 'Task title is required.';
            titleInput?.focus();
            return;
        }
        titleInput?.classList.remove('is-invalid');
        if (titleErr) titleErr.textContent = '';

        TaskManager.addTask({
            title,
            description: document.getElementById('task-description')?.value,
            priority:    document.getElementById('task-priority')?.value,
            category:    document.getElementById('task-category')?.value,
            dueDate:     document.getElementById('task-due-date')?.value
        });
        this.el.quickAddForm?.reset();
        // Restore preference defaults after reset
        const catEl = document.getElementById('task-category');
        const priEl = document.getElementById('task-priority');
        if (catEl) catEl.value = SettingsManager.get('defaultCategory');
        if (priEl) priEl.value = SettingsManager.get('defaultPriority');
    },

    /* ── Edit modal ──────────────────────────────────────────────────── */
    _openEditModal(taskId) {
        const task = AppState.tasks.find(t => t.id === taskId);
        if (!task) return;
        AppState.activeTaskToEdit = taskId;
        document.getElementById('edit-task-title').value       = task.title;
        document.getElementById('edit-task-description').value = task.description ?? '';
        document.getElementById('edit-task-priority').value    = task.priority;
        document.getElementById('edit-task-category').value    = task.category;
        document.getElementById('edit-task-due-date').value    = task.dueDate ?? '';
        ModalManager.open(this.el.editModal);
    },
    _handleEditSubmit() {
        if (!AppState.activeTaskToEdit) return;
        const titleEl = document.getElementById('edit-task-title');
        const title   = titleEl?.value?.trim() ?? '';
        if (!title) { titleEl?.focus(); return; }
        TaskManager.updateTask(AppState.activeTaskToEdit, {
            title,
            description: document.getElementById('edit-task-description')?.value,
            priority:    document.getElementById('edit-task-priority')?.value,
            category:    document.getElementById('edit-task-category')?.value,
            dueDate:     document.getElementById('edit-task-due-date')?.value
        });
        ModalManager.close(this.el.editModal);
    },

    /* ── Render ──────────────────────────────────────────────────────── */
    render() {
        this._updateStatistics();
        const tasks = AppState.getFilteredAndSortedTasks();
        if (!this.el.taskList) return;

        if (tasks.length === 0) {
            AnimationEngine.transitionTaskList(this.el.taskList, () => {
                this.el.taskList.innerHTML = '';
                this.el.emptyState?.classList.remove('hidden');
            });
        } else {
            this.el.emptyState?.classList.add('hidden');
            AnimationEngine.transitionTaskList(this.el.taskList, () => {
                this.el.taskList.innerHTML = tasks.map(t => this._buildTaskHTML(t)).join('');
            });
        }
        AnimationEngine.updateCreateBtnPulse();
    },

    _buildTaskHTML(task) {
        const { id, title, description, priority, category, dueDate, completed } = task;
        const categoryLabel  = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
        const priorityLabel  = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : '';
        const overdue        = !completed && Utils.isOverdue(dueDate);
        const dateClass      = overdue ? 'text-danger' : '';
        const dateIcon       = overdue ? 'fa-calendar-xmark' : 'fa-calendar';
        const dateDisplay    = dueDate ? Utils.formatDate(dueDate) : 'No due date';
        const completedClass = completed ? 'completed' : '';

        return `
<article class="task-card ${completedClass}" data-id="${Utils.escapeHTML(id)}" data-priority="${Utils.escapeHTML(priority)}" data-status="${completed ? 'completed' : 'pending'}" role="listitem">
    <div class="task-card-header">
        <div class="task-badges">
            <span class="badge badge-${Utils.escapeHTML(category)}">${Utils.escapeHTML(categoryLabel)}</span>
            <span class="badge badge-${Utils.escapeHTML(priority)}">${Utils.escapeHTML(priorityLabel)} Priority</span>
        </div>
        <div class="task-actions" aria-label="Task actions">
            <button type="button" class="btn-icon-small btn-edit" aria-label="Edit: ${Utils.escapeHTML(title)}">
                <i class="fa-solid fa-pen" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn-icon-small btn-delete" aria-label="Delete: ${Utils.escapeHTML(title)}">
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
        </div>
    </div>
    <div class="task-content">
        <label class="custom-checkbox" aria-label="${completed ? 'Mark incomplete' : 'Mark complete'}: ${Utils.escapeHTML(title)}">
            <input type="checkbox" class="task-completed-toggle" ${completed ? 'checked' : ''}>
            <span class="checkmark"></span>
        </label>
        <div class="task-details">
            <h3 class="task-title">${Utils.escapeHTML(title)}</h3>
            ${description ? `<p class="task-description">${Utils.escapeHTML(description)}</p>` : ''}
        </div>
    </div>
    <div class="task-footer">
        <div class="task-date ${dateClass}">
            <i class="fa-regular ${dateIcon}" aria-hidden="true"></i>
            <time datetime="${Utils.escapeHTML(dueDate ?? '')}">${dateDisplay}</time>
        </div>
    </div>
</article>`;
    },

    _updateStatistics() {
        const total      = AppState.tasks.length;
        const completed  = AppState.tasks.filter(t => t.completed).length;
        const pending    = total - completed;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        AnimationEngine.updateStats(this.el, { total, completed, pending, percentage });
    }
};

/* ==========================================================================
   15. Bootstrap
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Inject ripple keyframe
    const style = document.createElement('style');
    style.textContent = '@keyframes rippleEffect { to { transform: scale(3); opacity: 0; } }';
    document.head.appendChild(style);

    // Init order matters
    SettingsManager.init();       // loads + applies all persisted settings
    AppState.init();              // loads tasks + applies persisted theme
    NotificationCenter.init();    // loads notification history
    ToastSystem.init();           // cache container

    // Wait one rAF so DOM is fully painted before UI wires events
    requestAnimationFrame(() => {
        UI.init();                // caches DOM, binds events, initial render
        ProfileDropdown.init();   // profile dropdown menu
        NotifPanel.init();        // notification bell panel
        SettingsDrawer.init();    // settings side drawer
    });

    // System theme change listener (respects "system" preference)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (SettingsManager.get('theme') === 'system') {
            AppState._applyTheme('system');
            UI._updateThemeIcon?.();
        }
    });
});
