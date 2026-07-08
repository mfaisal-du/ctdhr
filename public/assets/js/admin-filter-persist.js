/**
 * Persist admin list filter inputs in sessionStorage.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('form[data-filter-persist]').forEach(function (form) {
            var key = 'ctdhr:filters:' + form.getAttribute('data-filter-persist');
            var params = new URLSearchParams(window.location.search);

            if ([...params.keys()].length === 0) {
                try {
                    var saved = sessionStorage.getItem(key);
                    if (saved) {
                        window.location.search = saved;
                        return;
                    }
                } catch (e) { /* ignore */ }
            } else {
                try {
                    sessionStorage.setItem(key, params.toString());
                } catch (e) { /* ignore */ }
            }

            form.addEventListener('submit', function () {
                try {
                    var fd = new FormData(form);
                    sessionStorage.setItem(key, new URLSearchParams(fd).toString());
                } catch (e) { /* ignore */ }
            });
        });
    });
})();