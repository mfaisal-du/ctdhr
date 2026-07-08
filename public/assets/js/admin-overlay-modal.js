/**
 * Full-screen overlay modals (timeline etc.) — portaled to body above admin sidebar.
 */
(function () {
    'use strict';

    var TYPE_META = {
        application: { icon: 'assignment_ind', tone: 'sky' },
        application_review: { icon: 'fact_check', tone: 'sky' },
        attendance: { icon: 'event_available', tone: 'green' },
        certificate: { icon: 'verified', tone: 'gold' },
        certificate_email: { icon: 'mail', tone: 'blue' },
        summary: { icon: 'analytics', tone: 'primary' },
    };

    var STATUS_TONES = {
        approved: 'green',
        rejected: 'red',
        pending: 'amber',
        cancelled: 'gray',
        present: 'green',
        absent: 'red',
        excused: 'blue',
    };

    function portalModal(modal) {
        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }
    }

    function openModal(modal) {
        portalModal(modal);
        modal.hidden = false;
        document.body.classList.add('admin-overlay-open');
    }

    function closeModal(modal, body, subtitle) {
        modal.hidden = true;
        if (body) {
            body.innerHTML = '';
        }
        if (subtitle) {
            subtitle.textContent = '';
        }
        document.body.classList.remove('admin-overlay-open');
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function resolveEventMeta(ev) {
        var type = ev.type || 'application';
        var base = TYPE_META[type] || { icon: 'history', tone: 'primary' };
        var tone = base.tone;
        var icon = base.icon;

        if (type === 'attendance' && ev.meta && ev.meta.status) {
            tone = STATUS_TONES[ev.meta.status] || tone;
            if (ev.meta.status === 'absent') icon = 'cancel';
            if (ev.meta.status === 'excused') icon = 'event_busy';
        }
        if (type === 'application_review' && ev.meta && ev.meta.status) {
            tone = STATUS_TONES[ev.meta.status] || tone;
        }
        if (type === 'certificate' && ev.meta && ev.meta.revoked) {
            tone = 'red';
            icon = 'block';
        }

        return { icon: icon, tone: tone };
    }

    function formatBadge(ev, labels) {
        labels = labels || {};
        if (!ev.meta) return '';
        if (ev.type === 'attendance' && ev.meta.status) {
            return '<span class="admin-timeline-badge admin-timeline-badge--' + escapeHtml(ev.meta.status) + '">' + escapeHtml(ev.meta.status) + '</span>';
        }
        if (ev.type === 'application_review' && ev.meta.status) {
            return '<span class="admin-timeline-badge admin-timeline-badge--' + escapeHtml(ev.meta.status) + '">' + escapeHtml(ev.meta.status) + '</span>';
        }
        if (ev.type === 'summary' && typeof ev.meta.eligible === 'boolean') {
            var cls = ev.meta.eligible ? 'eligible' : 'at-risk';
            var label = ev.meta.eligible ? (labels.eligible || 'Eligible') : (labels.atRisk || 'At risk');
            return '<span class="admin-timeline-badge admin-timeline-badge--' + cls + '">' + escapeHtml(label) + '</span>';
        }
        return '';
    }

    function readLabels(modal) {
        if (!modal || !modal.dataset) {
            return {};
        }
        return {
            eligible: modal.dataset.labelEligible || 'Eligible',
            atRisk: modal.dataset.labelAtRisk || 'At risk',
            events: modal.dataset.labelEvents || ':count events recorded',
        };
    }

    function formatEventsCount(template, count) {
        return String(template || ':count events recorded').replace(':count', String(count));
    }

    function renderLoading() {
        return '<div class="admin-overlay-loading">'
            + '<span class="admin-overlay-spinner" aria-hidden="true"></span>'
            + '<p>Loading timeline…</p>'
            + '</div>';
    }

    function renderEmpty() {
        return '<div class="admin-overlay-empty">'
            + '<span class="material-symbols-outlined admin-overlay-empty__icon" aria-hidden="true">timeline</span>'
            + '<p>No timeline events yet.</p>'
            + '</div>';
    }

    function renderTimelineItem(ev, isLast, labels) {
        var meta = resolveEventMeta(ev);
        var badge = formatBadge(ev, labels);
        var extra = '';

        if (ev.meta && ev.meta.marked_by) {
            extra = '<span class="admin-timeline-extra">Marked by ' + escapeHtml(ev.meta.marked_by) + '</span>';
        }

        return '<li class="admin-timeline-item admin-timeline-item--' + escapeHtml(meta.tone) + (isLast ? ' is-last' : '') + '">'
            + '<div class="admin-timeline-track" aria-hidden="true">'
            + '<span class="admin-timeline-dot">'
            + '<span class="material-symbols-outlined">' + escapeHtml(meta.icon) + '</span>'
            + '</span>'
            + (isLast ? '' : '<span class="admin-timeline-line"></span>')
            + '</div>'
            + '<div class="admin-timeline-card">'
            + '<div class="admin-timeline-card__head">'
            + '<strong class="admin-timeline-card__title">' + escapeHtml(ev.label || '') + '</strong>'
            + badge
            + '</div>'
            + (ev.detail ? '<p class="admin-timeline-card__detail">' + escapeHtml(ev.detail) + '</p>' : '')
            + '<div class="admin-timeline-card__foot">'
            + (ev.at ? '<time datetime="' + escapeHtml(ev.at) + '">' + escapeHtml(ev.at) + '</time>' : '')
            + extra
            + '</div>'
            + '</div>'
            + '</li>';
    }

    function updateSubtitle(subtitleEl, data) {
        if (!subtitleEl) return;

        var parts = [];
        if (data.participant && data.participant.name) {
            parts.push(data.participant.name);
        }
        if (data.participant && data.participant.email) {
            parts.push(data.participant.email);
        }
        if (data.course && data.course.title) {
            parts.push(data.course.title);
        }

        subtitleEl.textContent = parts.join(' · ');
    }

    function renderTimeline(body, data, labels) {
        var events = (data && data.timeline) || [];
        var regular = [];
        var summary = null;

        events.forEach(function (ev) {
            if (ev.type === 'summary') {
                summary = ev;
            } else {
                regular.push(ev);
            }
        });

        if (regular.length === 0 && !summary) {
            body.innerHTML = renderEmpty();
            return;
        }

        var html = '<div class="admin-timeline-shell">';
        html += '<p class="admin-timeline-count">' + escapeHtml(formatEventsCount(labels.events, regular.length)) + '</p>';
        html += '<ol class="admin-timeline">';

        regular.forEach(function (ev, index) {
            html += renderTimelineItem(ev, index === regular.length - 1 && !summary, labels);
        });

        html += '</ol>';

        if (summary) {
            html += '<div class="admin-timeline-summary">'
                + '<div class="admin-timeline-summary__icon" aria-hidden="true"><span class="material-symbols-outlined">insights</span></div>'
                + '<div class="admin-timeline-summary__body">'
                + '<strong>' + escapeHtml(summary.label || '') + '</strong>'
                + '<p>' + escapeHtml(summary.detail || '') + '</p>'
                + formatBadge(summary, labels)
                + '</div></div>';
        }

        html += '</div>';
        body.innerHTML = html;
    }

    window.initAdminOverlayModal = function (options) {
        options = options || {};
        var modalId = options.modalId || 'participantTimelineModal';
        var bodyId = options.bodyId || 'participantTimelineBody';
        var subtitleId = options.subtitleId || 'timelineModalSubtitle';
        var triggerAttr = options.triggerAttr || 'data-timeline-url';
        var altTriggerAttr = options.altTriggerAttr || 'data-history-url';

        var modal = document.getElementById(modalId);
        var body = document.getElementById(bodyId);
        var subtitle = document.getElementById(subtitleId);
        if (!modal || !body) {
            return;
        }

        portalModal(modal);

        function onClose() {
            closeModal(modal, body, subtitle);
        }

        modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
            el.addEventListener('click', onClose);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.hidden) {
                onClose();
            }
        });

        function bindTrigger(btn) {
            btn.addEventListener('click', function () {
                var url = btn.getAttribute(triggerAttr) || btn.getAttribute(altTriggerAttr);
                if (!url) {
                    return;
                }

                body.innerHTML = renderLoading();
                if (subtitle) subtitle.textContent = '';
                openModal(modal);

                fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        updateSubtitle(subtitle, data);
                        renderTimeline(body, data, readLabels(modal));
                    })
                    .catch(function () {
                        body.innerHTML = '<div class="admin-overlay-empty">'
                            + '<span class="material-symbols-outlined admin-overlay-empty__icon" aria-hidden="true">error</span>'
                            + '<p>Failed to load timeline.</p>'
                            + '</div>';
                    });
            });
        }

        document.querySelectorAll('[' + triggerAttr + ']').forEach(bindTrigger);
        if (altTriggerAttr) {
            document.querySelectorAll('[' + altTriggerAttr + ']').forEach(function (btn) {
                if (!btn.hasAttribute(triggerAttr)) {
                    bindTrigger(btn);
                }
            });
        }
    };
})();