/**
 * Shared admin module UI helpers (delete confirm, modal backdrop click, notifications).
 */
(function () {
    'use strict';

    function adminConfirmDelete(btn) {
        var form = btn.closest('form');
        var title = btn.getAttribute('data-title') || '';
        var confirmMsg = btn.getAttribute('data-confirm') || 'Are you sure?';
        var warningMsg = btn.getAttribute('data-warning') || '';
        var deleteLbl = btn.getAttribute('data-delete-label') || 'Delete';
        var cancelLbl = btn.getAttribute('data-cancel-label') || 'Cancel';

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: confirmMsg,
                html: title
                    ? '<strong>' + title.replace(/</g, '&lt;') + '</strong>' + (warningMsg ? '<br><small>' + warningMsg + '</small>' : '')
                    : (warningMsg || undefined),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: deleteLbl,
                cancelButtonText: cancelLbl,
                customClass: {
                    popup: 'admin-swal-popup',
                    confirmButton: 'admin-swal-btn admin-swal-btn-danger',
                    cancelButton: 'admin-swal-btn admin-swal-btn-cancel'
                },
                buttonsStyling: false
            }).then(function (r) {
                if (r.isConfirmed && form) form.submit();
            });
        } else if (confirm(confirmMsg) && form) {
            form.submit();
        }
    }

    function buildNotificationState(config) {
        config = config || {};

        return {
            sidebarOpen: false,
            notifOpen: false,
            unreadCount: config.initialCount || 0,
            notifItems: config.initialItems || [],
            notifLabels: config.labels || {},
            notifApplicationsUrl: config.applicationsUrl || '',
            notifBadgePulse: false,
            _notifConfig: config,
            _notifPrevCount: config.initialCount || 0,
            _notifPollTimer: null,
            _notifPolling: false,

            initNotifications: function () {
                var self = this;
                this.notifOpen = false;
                this.pollNotifications();
                if (this._notifPollTimer) {
                    window.clearInterval(this._notifPollTimer);
                }
                this._notifPollTimer = window.setInterval(function () {
                    self.pollNotifications();
                }, 15000);
            },

            toggleNotifications: function () {
                this.notifOpen = !this.notifOpen;
                if (this.notifOpen) {
                    this.pollNotifications();
                }
            },

            closeNotifications: function () {
                this.notifOpen = false;
            },

            closeNotificationsUnlessBell: function (event) {
                if (event && event.target && event.target.closest && event.target.closest('.admin-notif-bell')) {
                    return;
                }
                this.closeNotifications();
            },

            pollNotifications: function () {
                var self = this;
                var pollUrl = this._notifConfig.pollUrl;

                if (!pollUrl || this._notifPolling) {
                    return;
                }

                this._notifPolling = true;

                fetch(pollUrl, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin'
                })
                    .then(function (res) {
                        if (!res.ok) {
                            throw new Error('poll failed');
                        }
                        return res.json();
                    })
                    .then(function (data) {
                        var nextCount = Number(data.unread_count || 0);
                        if (nextCount > self._notifPrevCount) {
                            self.notifBadgePulse = true;
                            window.setTimeout(function () {
                                self.notifBadgePulse = false;
                            }, 2400);
                        }
                        self._notifPrevCount = nextCount;
                        self.unreadCount = nextCount;
                        if (Array.isArray(data.notifications)) {
                            self.notifItems = data.notifications;
                        }
                    })
                    .catch(function () {})
                    .finally(function () {
                        self._notifPolling = false;
                    });
            },

            postNotificationAction: function (url) {
                var body = new URLSearchParams();
                body.set(this._notifConfig.csrfName || '_token', this._notifConfig.csrfToken || '');

                return fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin',
                    body: body.toString()
                }).then(function (res) {
                    if (!res.ok) {
                        throw new Error('request failed');
                    }
                    return res.json();
                });
            },

            markNotificationRead: function (id) {
                var self = this;
                var readUrl = this._notifConfig.readUrl;

                if (!id || !readUrl) {
                    return Promise.resolve();
                }

                return this.postNotificationAction(readUrl + '/' + id + '/read')
                    .then(function (data) {
                        self.unreadCount = Number(data.unread_count || 0);
                        self._notifPrevCount = self.unreadCount;
                        self.notifItems.forEach(function (item) {
                            if (item.id === id) {
                                item.is_read = true;
                            }
                        });
                    })
                    .catch(function () {});
            },

            markAllNotificationsRead: function () {
                var self = this;
                var readAllUrl = this._notifConfig.readAllUrl;

                if (!readAllUrl) {
                    return;
                }

                this.postNotificationAction(readAllUrl)
                    .then(function () {
                        self.unreadCount = 0;
                        self._notifPrevCount = 0;
                        self.notifItems.forEach(function (item) {
                            item.is_read = true;
                        });
                    })
                    .catch(function () {});
            },

            openNotificationItem: function (item) {
                if (!item) {
                    return;
                }

                var self = this;
                var navigate = function () {
                    if (item.link) {
                        window.location.href = item.link;
                    }
                };

                if (!item.is_read) {
                    this.markNotificationRead(item.id).finally(navigate);
                    return;
                }

                navigate();
            }
        };
    }

    function registerAdminLayout() {
        if (typeof Alpine === 'undefined') {
            return;
        }

        Alpine.data('adminLayout', function () {
            return buildNotificationState(window.__ADMIN_NOTIFICATIONS__ || {});
        });
    }

    document.addEventListener('alpine:init', registerAdminLayout);
    document.addEventListener('DOMContentLoaded', registerAdminLayout);

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.courses-delete-form button[data-title], .courses-delete-form button[data-confirm]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                adminConfirmDelete(btn);
            });
        });

        document.querySelectorAll('.courses-modal-backdrop[data-modal-close]').forEach(function (backdrop) {
            backdrop.addEventListener('click', function (e) {
                if (e.target === backdrop) {
                    backdrop.classList.add('is-hidden');
                }
            });
        });
    });

    window.adminConfirmDelete = adminConfirmDelete;
    window.openAdminModal = function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('is-hidden');
    };
    window.closeAdminModal = function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.add('is-hidden');
    };
})();