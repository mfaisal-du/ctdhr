/**
 * Certificates admin helpers (timeline modal).
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        if (typeof window.initAdminOverlayModal === 'function') {
            window.initAdminOverlayModal();
        }
    });
})();