/**
 * Course create/edit form — editors, validation, section nav, unsaved guard.
 */
document.addEventListener('DOMContentLoaded', function () {
    var shell = document.querySelector('.courses-form-shell');
    var form = document.getElementById('courseForm');
    if (!shell || !form) return;

    var i18n = {
        required: shell.getAttribute('data-msg-required') || 'This field is required.',
        category: shell.getAttribute('data-msg-select-category') || 'Please select a category.',
        unsaved: shell.getAttribute('data-msg-unsaved') || 'You have unsaved changes. Leave this page anyway?',
        saving: shell.getAttribute('data-msg-saving') || 'Saving…',
        uploading: shell.getAttribute('data-msg-uploading') || 'Uploading…'
    };

    var dirty = false;
    var initialSnapshot = '';
    var quillInstances = [];

    function getFormSnapshot() {
        var parts = [];
        form.querySelectorAll('input, select, textarea').forEach(function (el) {
            if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button') return;
            parts.push(el.name + '=' + (el.type === 'checkbox' ? (el.checked ? '1' : '0') : el.value));
        });
        quillInstances.forEach(function (q) {
            parts.push('quill:' + (q.root ? q.root.innerHTML : ''));
        });
        return parts.join('|');
    }

    function setDirty(state) {
        dirty = state;
        var badge = document.getElementById('unsavedBadge');
        if (badge) badge.classList.toggle('courses-unsaved-badge--hidden', !dirty);
    }

    function markDirtyIfChanged() {
        setDirty(getFormSnapshot() !== initialSnapshot);
    }

    /* Quill editors */
    if (typeof Quill !== 'undefined') {
        document.querySelectorAll('.courses-editor').forEach(function (wrap) {
            var area = wrap.querySelector('.courses-editor-area');
            var source = wrap.querySelector('.courses-editor-source');
            if (!area || !source) return;

            var quill = new Quill(area, {
                theme: 'snow',
                direction: wrap.getAttribute('data-dir') || 'ltr',
                modules: {
                    toolbar: [
                        [{ header: [2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        [{ align: [] }],
                        ['link', 'code-block'],
                        ['clean']
                    ]
                }
            });

            if (source.value) quill.root.innerHTML = source.value;
            quill.on('text-change', function () {
                source.value = quill.root.innerHTML;
                markDirtyIfChanged();
            });
            quillInstances.push(quill);
        });
    }

    initialSnapshot = getFormSnapshot();

    form.addEventListener('input', markDirtyIfChanged);
    form.addEventListener('change', markDirtyIfChanged);

    /* Inline validation */
    function showFieldError(fieldId, message) {
        var input = document.getElementById(fieldId);
        var errorEl = document.getElementById('error-' + fieldId);
        var field = input ? input.closest('.courses-field') : null;
        if (errorEl) errorEl.textContent = message || '';
        if (field) field.classList.toggle('courses-field--invalid', !!message);
        if (input) input.classList.toggle('courses-input--invalid', !!message);
        if (input && input.classList.contains('admin-form-select')) {
            input.classList.toggle('admin-form-select--invalid', !!message);
        }
    }

    function clearFieldError(fieldId) {
        showFieldError(fieldId, '');
    }

    function validateField(input) {
        if (!input || !input.id) return true;
        var type = input.getAttribute('data-validate');
        var valid = true;
        var msg = '';

        if (type === 'required') {
            valid = (input.value || '').trim() !== '';
            msg = valid ? '' : i18n.required;
        } else if (type === 'category') {
            valid = (input.value || '') !== '';
            msg = valid ? '' : i18n.category;
        }

        showFieldError(input.id, msg);
        return valid;
    }

    function validateForm() {
        var ok = true;
        var firstInvalid = null;

        form.querySelectorAll('[data-validate]').forEach(function (input) {
            if (!validateField(input)) {
                ok = false;
                if (!firstInvalid) firstInvalid = input;
            }
        });

        document.querySelectorAll('.courses-form-section').forEach(function (sec) {
            var hasError = !!sec.querySelector('.courses-field--invalid');
            sec.classList.toggle('courses-form-section--has-error', hasError);
        });

        if (firstInvalid) {
            var section = firstInvalid.closest('.courses-form-section');
            if (section && section.id) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            firstInvalid.focus();
        }

        return ok;
    }

    form.querySelectorAll('[data-validate]').forEach(function (input) {
        input.addEventListener('blur', function () { validateField(input); });
        input.addEventListener('input', function () {
            if (input.closest('.courses-field--invalid')) validateField(input);
        });
        input.addEventListener('change', function () {
            if (input.closest('.courses-field--invalid')) validateField(input);
        });
    });

    /* Submit — sync editors, validate, loading */
    form.addEventListener('submit', function (e) {
        document.querySelectorAll('.courses-editor').forEach(function (wrap) {
            var editor = wrap.querySelector('.ql-editor');
            var source = wrap.querySelector('.courses-editor-source');
            if (editor && source) source.value = editor.innerHTML;
        });

        if (!validateForm()) {
            e.preventDefault();
            return;
        }

        var saveBtn = document.getElementById('courseFormSave');
        if (saveBtn && !saveBtn.classList.contains('is-loading')) {
            saveBtn.classList.add('is-loading');
            saveBtn.disabled = true;
            var label = saveBtn.querySelector('.courses-btn-label');
            if (label) label.textContent = i18n.saving;
        }
        setDirty(false);
    });

    /* Unsaved changes guard */
    window.addEventListener('beforeunload', function (e) {
        if (!dirty) return;
        e.preventDefault();
        e.returnValue = i18n.unsaved;
        return i18n.unsaved;
    });

    var cancelBtn = document.getElementById('courseFormCancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function (e) {
            if (!dirty) return;
            if (!window.confirm(i18n.unsaved)) {
                e.preventDefault();
            }
        });
    }

    /* Section navigation */
    var navLinks = document.querySelectorAll('.courses-section-nav-link');
    var sections = [];

    navLinks.forEach(function (link) {
        var id = link.getAttribute('data-section');
        var section = id ? document.getElementById(id) : null;
        if (section) sections.push({ link: link, section: section });

        link.addEventListener('click', function (e) {
            e.preventDefault();
            if (!section) return;
            var top = section.getBoundingClientRect().top + window.scrollY - 88;
            window.scrollTo({ top: top, behavior: 'smooth' });
            history.replaceState(null, '', '#' + id);
        });
    });

    if (sections.length && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.id;
                navLinks.forEach(function (link) {
                    link.classList.toggle('is-active', link.getAttribute('data-section') === id);
                });
            });
        }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });

        sections.forEach(function (item) { observer.observe(item.section); });
    }

    /* Cover image preview + upload loading */
    var coverInput = document.getElementById('cover_image_input');
    var coverFrame = document.querySelector('.courses-cover-preview-frame');
    var coverPreviewImg = document.getElementById('coverPreviewImg');
    var coverFileText = document.querySelector('.courses-cover-file-text');

    if (coverInput && coverFrame) {
        coverInput.addEventListener('change', function () {
            var file = coverInput.files && coverInput.files[0];
            if (!file) return;
            if (!file.type.match(/^image\//)) return;

            if (coverFileText) coverFileText.textContent = file.name;

            var reader = new FileReader();
            reader.onload = function (ev) {
                var existing = coverPreviewImg || coverFrame.querySelector('.courses-cover-preview-img');
                var empty = coverFrame.querySelector('.courses-cover-preview-empty');
                if (empty) empty.remove();

                if (existing) {
                    existing.src = ev.target.result;
                } else {
                    var img = document.createElement('img');
                    img.src = ev.target.result;
                    img.alt = '';
                    img.id = 'coverPreviewImg';
                    img.className = 'courses-cover-preview-img';
                    var badge = coverFrame.querySelector('.courses-cover-preview-badge');
                    coverFrame.insertBefore(img, badge || null);
                }

                var sourceBadge = coverFrame.querySelector('.courses-cover-preview-source');
                if (sourceBadge) {
                    var pendingLabel = sourceBadge.getAttribute('data-preview-label');
                    if (pendingLabel) sourceBadge.textContent = pendingLabel;
                    sourceBadge.classList.remove('courses-cover-preview-source--default');
                    sourceBadge.classList.add('courses-cover-preview-source--custom');
                }
            };
            reader.readAsDataURL(file);
        });
    }

    var coverForm = document.getElementById('coverUploadForm');
    var coverBtn = document.getElementById('coverUploadBtn');
    if (coverForm && coverBtn) {
        coverForm.addEventListener('submit', function () {
            if (coverBtn.classList.contains('is-loading')) return;
            coverBtn.classList.add('is-loading');
            coverBtn.disabled = true;
            var label = coverBtn.querySelector('.courses-btn-label');
            if (label) label.textContent = i18n.uploading;
        });
    }
});