/**
 * Admin attendance marking helpers.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var form = document.getElementById('attendanceMarkForm');
        if (form) {
            initMarkForm(form);
        }
        if (typeof window.initAdminOverlayModal === 'function') {
            window.initAdminOverlayModal({ altTriggerAttr: 'data-history-url' });
        }
    });

    function initMarkForm(form) {
        var pillGroups = form.querySelectorAll('.attendance-status-pills');

        function syncPillGroup(group) {
            var checked = group.querySelector('input[type="radio"]:checked');
            var status = checked ? checked.value : 'absent';
            group.querySelectorAll('.attendance-status-pill').forEach(function (pill) {
                pill.classList.toggle('is-active', pill.getAttribute('data-status') === status);
            });
            var row = group.closest('tr');
            if (row) {
                row.className = row.className.replace(/attendance-row--\w+/g, '').trim();
                row.classList.add('attendance-row--' + status);
            }
            return status;
        }

        function updateLiveCounts() {
            var present = 0;
            var absent = 0;
            var excused = 0;
            pillGroups.forEach(function (group) {
                var checked = group.querySelector('input[type="radio"]:checked');
                if (!checked) return;
                if (checked.value === 'present') present++;
                else if (checked.value === 'excused') excused++;
                else absent++;
            });
            var presentEl = document.querySelector('[data-live-present]');
            var absentEl = document.querySelector('[data-live-absent]');
            if (presentEl) presentEl.textContent = String(present);
            if (absentEl) absentEl.textContent = String(absent + excused);
        }

        function setAllStatus(status) {
            pillGroups.forEach(function (group) {
                if (group.classList.contains('is-disabled')) return;
                var radio = group.querySelector('input[type="radio"][value="' + status + '"]');
                if (radio && !radio.disabled) {
                    radio.checked = true;
                    syncPillGroup(group);
                }
            });
            updateLiveCounts();
        }

        pillGroups.forEach(function (group) {
            group.querySelectorAll('input[type="radio"]').forEach(function (radio) {
                radio.addEventListener('change', function () {
                    syncPillGroup(group);
                    updateLiveCounts();
                });
            });
            group.querySelectorAll('.attendance-status-pill').forEach(function (pill) {
                pill.addEventListener('click', function () {
                    var status = pill.getAttribute('data-status');
                    var input = group.querySelector('input[type="radio"][value="' + status + '"]');
                    if (input && !input.disabled) {
                        input.checked = true;
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            });
            syncPillGroup(group);
        });

        updateLiveCounts();

        form.querySelectorAll('[data-attendance-action]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var action = btn.getAttribute('data-attendance-action');
                if (action === 'all-present') setAllStatus('present');
                else if (action === 'all-absent') setAllStatus('absent');
                else if (action === 'all-excused') setAllStatus('excused');
            });
        });
    }
})();