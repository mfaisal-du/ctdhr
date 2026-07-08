/**
 * CTDHR Portal - External dashboard notification polling
 */
(function () {
    'use strict';

    function dashboardLayout() {
        var config = window.__DASHBOARD_NOTIFICATIONS__ || {};

        return {
            sidebarOpen: false,
            unreadCount: Number(config.initialCount || 0),
            _pollTimer: null,
            _polling: false,
            _prevCount: Number(config.initialCount || 0),

            init: function () {
                var self = this;
                this.pollNotifications();

                if (this._pollTimer) {
                    window.clearInterval(this._pollTimer);
                }

                this._pollTimer = window.setInterval(function () {
                    self.pollNotifications();
                }, 15000);
            },

            pollNotifications: function () {
                var self = this;
                var pollUrl = config.pollUrl;

                if (!pollUrl || this._polling) {
                    return;
                }

                this._polling = true;

                fetch(pollUrl, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                })
                    .then(function (res) {
                        if (!res.ok) {
                            throw new Error('poll failed');
                        }
                        return res.json();
                    })
                    .then(function (data) {
                        var nextCount = Number(data.unread_count || 0);
                        if (nextCount > self._prevCount) {
                            window.dispatchEvent(
                                new CustomEvent('ctdhr:notifications-updated', {
                                    detail: {
                                        unreadCount: nextCount,
                                        notifications: Array.isArray(data.notifications) ? data.notifications : [],
                                    },
                                })
                            );
                        }
                        self._prevCount = nextCount;
                        self.unreadCount = nextCount;
                    })
                    .catch(function () {})
                    .finally(function () {
                        self._polling = false;
                    });
            },
        };
    }

    document.addEventListener('alpine:init', function () {
        if (typeof Alpine !== 'undefined') {
            Alpine.data('dashboardLayout', dashboardLayout);
        }
    });

    window.dashboardLayout = dashboardLayout;
})();