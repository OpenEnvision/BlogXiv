class SupabaseBlogManager {
    constructor() {
        this.client = null;
        this.session = null;
        this.blogs = [];
        this.selectedId = null;
        this.searchQuery = '';
        this.statusFilter = 'all';
        this.editorDirty = false;
        this.formHydrating = false;
        this.draftTimer = null;
        this.init();
    }

    async init() {
        if (!window.supabase?.createClient || !window.BlogXivData?.config) {
            this.showMessage('Supabase client configuration is unavailable.', 'error');
            return;
        }

        const { url, publishableKey } = window.BlogXivData.config;
        this.client = window.supabase.createClient(url, publishableKey, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });

        this.bindEvents();
        const { data, error } = await this.client.auth.getSession();
        if (error) this.showMessage(error.message, 'error');
        await this.applySession(data?.session || null);

        this.client.auth.onAuthStateChange((event, session) => {
            if (event === 'TOKEN_REFRESHED') {
                this.session = session;
                return;
            }
            window.setTimeout(() => {
                const sameActiveUser = session?.user?.id
                    && session.user.id === this.session?.user?.id
                    && !document.getElementById('managerApp')?.hidden;
                if (sameActiveUser) {
                    this.session = session;
                    return;
                }
                this.applySession(session);
            }, 0);
        });
    }

    bindEvents() {
        document.getElementById('managerAuthForm')?.addEventListener('submit', (event) => this.signIn(event));
        document.getElementById('managerSignOut')?.addEventListener('click', () => this.signOut());
        document.getElementById('managerNewBlog')?.addEventListener('click', () => this.startNewBlog());
        document.getElementById('managerResetForm')?.addEventListener('click', () => this.resetEditorByUser());
        document.getElementById('managerDeleteBlog')?.addEventListener('click', () => this.deleteBlog());
        document.getElementById('managerBlogForm')?.addEventListener('submit', (event) => this.saveBlog(event));
        document.getElementById('managerUploadCover')?.addEventListener('click', () => this.uploadCover());
        document.getElementById('managerClearCover')?.addEventListener('click', () => this.clearCover());
        document.getElementById('managerCoverFile')?.addEventListener('change', (event) => this.previewCoverFile(event));
        document.getElementById('managerCoverImage')?.addEventListener('input', (event) => this.renderCoverPreview(event.target.value.trim()));

        document.getElementById('managerSearch')?.addEventListener('input', (event) => {
            this.searchQuery = event.target.value.trim().toLowerCase();
            this.renderBlogList();
        });

        document.getElementById('managerStatusFilter')?.addEventListener('change', (event) => {
            this.statusFilter = event.target.value;
            this.renderBlogList();
        });

        document.getElementById('managerBlogList')?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-blog-id]');
            if (button) this.selectBlog(button.dataset.blogId);
        });

        const form = document.getElementById('managerBlogForm');
        form?.addEventListener('input', () => this.markEditorDirty());
        form?.addEventListener('change', () => this.markEditorDirty());
        form?.elements.title?.addEventListener('blur', () => {
            if (this.selectedId || form.elements.id.value.trim()) return;
            form.elements.id.value = this.slugify(form.elements.title.value);
            this.markEditorDirty();
        });
        form?.elements.cover_fit?.addEventListener('change', () => this.renderCoverPreview(form.elements.cover_image.value.trim()));
        form?.elements.url?.addEventListener('blur', () => this.inferSourceName());
        window.addEventListener('beforeunload', () => this.saveEditorDraft());
    }

    async signIn(event) {
        event.preventDefault();
        const email = document.getElementById('managerEmail')?.value.trim();
        const password = document.getElementById('managerPassword')?.value;
        const button = document.getElementById('managerSignIn');
        this.setBusy(button, true, 'Signing in...');

        const { data, error } = await this.client.auth.signInWithPassword({ email, password });
        this.setBusy(button, false, 'Sign in');

        if (error) {
            this.showMessage(error.message, 'error');
            return;
        }

        await this.applySession(data.session);
    }

    async signOut() {
        this.saveEditorDraft();
        const { error } = await this.client.auth.signOut();
        if (error) this.showMessage(error.message, 'error');
    }

    isAdmin(session) {
        return session?.user?.app_metadata?.role === 'admin';
    }

    async applySession(session) {
        this.session = session;
        const authPanel = document.getElementById('managerAuth');
        const appPanel = document.getElementById('managerApp');

        if (!session) {
            authPanel.hidden = false;
            appPanel.hidden = true;
            this.blogs = [];
            return;
        }

        if (!this.isAdmin(session)) {
            authPanel.hidden = false;
            appPanel.hidden = true;
            this.showMessage('This account does not have the admin role.', 'error');
            return;
        }

        authPanel.hidden = true;
        appPanel.hidden = false;
        document.getElementById('managerSessionEmail').textContent = session.user.email || 'Administrator';
        await this.loadBlogs({ restoreDraft: true });
    }

    async loadBlogs({ restoreDraft = false } = {}) {
        const rows = [];
        const pageSize = 1000;

        for (let offset = 0; ; offset += pageSize) {
            const { data, error } = await this.client
                .from('blogs')
                .select('*')
                .order('publish_date', { ascending: false })
                .order('id', { ascending: true })
                .range(offset, offset + pageSize - 1);

            if (error) {
                this.showMessage(error.message, 'error');
                return;
            }

            rows.push(...data);
            if (data.length < pageSize) break;
        }

        this.blogs = rows;
        this.updateStats();
        this.renderBlogList();
        if (restoreDraft && this.restoreEditorDraft()) return;
        if (!this.selectedId) this.resetEditor({ clearDraft: false });
    }

    getFilteredBlogs() {
        return this.blogs.filter((blog) => {
            const matchesStatus = this.statusFilter === 'all' || blog.status === this.statusFilter;
            const haystack = `${blog.id} ${blog.title} ${blog.author} ${blog.source_name}`.toLowerCase();
            return matchesStatus && (!this.searchQuery || haystack.includes(this.searchQuery));
        });
    }

    renderBlogList() {
        const list = document.getElementById('managerBlogList');
        if (!list) return;
        const blogs = this.getFilteredBlogs();

        if (!blogs.length) {
            list.innerHTML = '<div class="manager-empty">No matching blogs.</div>';
            return;
        }

        list.innerHTML = blogs.map((blog) => `
            <button class="manager-blog-item${blog.id === this.selectedId ? ' is-active' : ''}" type="button" data-blog-id="${this.escapeHTML(blog.id)}">
                <strong>${this.escapeHTML(blog.title)}</strong>
                <span class="manager-blog-meta">
                    <span class="manager-status">${this.escapeHTML(blog.status)}</span>
                    <span>${this.escapeHTML(blog.category)}</span>
                    <span>${this.escapeHTML(blog.publish_date)}</span>
                </span>
            </button>
        `).join('');
    }

    updateStats() {
        const count = (statuses) => this.blogs.filter((blog) => statuses.includes(blog.status)).length;
        document.getElementById('managerTotalCount').textContent = String(this.blogs.length);
        document.getElementById('managerPublishedCount').textContent = String(count(['published']));
        document.getElementById('managerDraftCount').textContent = String(count(['draft', 'pending']));
        document.getElementById('managerHiddenCount').textContent = String(count(['hidden']));
    }

    selectBlog(id, { skipConfirmation = false, clearDraft = true } = {}) {
        const blog = this.blogs.find((item) => item.id === id);
        if (!blog) return;
        if (blog.id === this.selectedId && !skipConfirmation) return;
        if (!skipConfirmation && !this.confirmDiscardChanges('open another blog')) return;

        this.formHydrating = true;
        this.selectedId = blog.id;
        const form = document.getElementById('managerBlogForm');
        const values = {
            ...blog,
            tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : ''
        };

        Object.entries(values).forEach(([name, value]) => {
            const field = form.elements.namedItem(name);
            if (!field || name === 'featured') return;
            field.value = value ?? '';
        });
        form.elements.featured.checked = Boolean(blog.featured);
        document.getElementById('managerCoverFile').value = '';
        this.renderCoverPreview(form.elements.cover_image.value.trim());
        document.getElementById('managerDeleteBlog').hidden = false;
        this.formHydrating = false;
        this.editorDirty = false;
        if (clearDraft) this.clearEditorDraft();
        this.renderBlogList();
    }

    startNewBlog() {
        if (!this.confirmDiscardChanges('start a new blog')) return;
        this.resetEditor();
    }

    resetEditorByUser() {
        if (!this.confirmDiscardChanges('reset the editor')) return;
        this.resetEditor();
    }

    resetEditor({ clearDraft = true } = {}) {
        this.formHydrating = true;
        this.selectedId = null;
        const form = document.getElementById('managerBlogForm');
        form.reset();
        form.elements.publish_date.value = new Date().toISOString().slice(0, 10);
        form.elements.category.value = 'Foundation Model';
        form.elements.cover_fit.value = 'cover';
        form.elements.status.value = 'draft';
        document.getElementById('managerCoverFile').value = '';
        this.renderCoverPreview('');
        document.getElementById('managerDeleteBlog').hidden = true;
        this.formHydrating = false;
        this.editorDirty = false;
        if (clearDraft) this.clearEditorDraft();
        this.renderBlogList();
    }

    confirmDiscardChanges(action) {
        return !this.editorDirty || globalThis.confirm(`You have unsaved changes. ${action[0].toUpperCase()}${action.slice(1)} and discard them?`);
    }

    markEditorDirty() {
        if (this.formHydrating || !this.session) return;
        this.editorDirty = true;
        window.clearTimeout(this.draftTimer);
        this.draftTimer = window.setTimeout(() => this.saveEditorDraft(), 250);
    }

    getDraftStorageKey() {
        return `blogxiv:manager-editor-draft:v1:${this.session?.user?.id || 'anonymous'}`;
    }

    getEditorSnapshot() {
        const form = document.getElementById('managerBlogForm');
        const values = {};
        Array.from(form.elements).forEach((field) => {
            if (!field.name || field.type === 'file' || field.type === 'submit' || field.type === 'button') return;
            values[field.name] = field.type === 'checkbox' ? field.checked : field.value;
        });
        return {
            version: 1,
            selectedId: this.selectedId,
            savedAt: new Date().toISOString(),
            values
        };
    }

    saveEditorDraft() {
        if (!this.editorDirty || !this.session) return;
        try {
            localStorage.setItem(this.getDraftStorageKey(), JSON.stringify(this.getEditorSnapshot()));
        } catch (_error) {
            // The editor remains usable when browser storage is disabled or full.
        }
    }

    restoreEditorDraft() {
        let draft;
        try {
            draft = JSON.parse(localStorage.getItem(this.getDraftStorageKey()) || 'null');
        } catch (_error) {
            this.clearEditorDraft();
            return false;
        }

        if (!draft?.values || draft.version !== 1) return false;
        const savedAt = Date.parse(draft.savedAt);
        if (!Number.isFinite(savedAt) || Date.now() - savedAt > 7 * 24 * 60 * 60 * 1000) {
            this.clearEditorDraft();
            return false;
        }

        if (draft.selectedId && this.blogs.some((blog) => blog.id === draft.selectedId)) {
            this.selectBlog(draft.selectedId, { skipConfirmation: true, clearDraft: false });
        } else {
            this.resetEditor({ clearDraft: false });
        }

        this.formHydrating = true;
        const form = document.getElementById('managerBlogForm');
        Object.entries(draft.values).forEach(([name, value]) => {
            const field = form.elements.namedItem(name);
            if (!field) return;
            if (field.type === 'checkbox') field.checked = Boolean(value);
            else field.value = value ?? '';
        });
        this.formHydrating = false;
        this.editorDirty = true;
        this.renderCoverPreview(form.elements.cover_image.value.trim());
        document.getElementById('managerDeleteBlog').hidden = !this.selectedId;
        this.renderBlogList();
        this.showMessage('Recovered unsaved editor changes.', 'success');
        return true;
    }

    clearEditorDraft() {
        window.clearTimeout(this.draftTimer);
        try {
            localStorage.removeItem(this.getDraftStorageKey());
        } catch (_error) {
            // Ignore browser storage failures.
        }
    }

    getFormPayload() {
        const form = document.getElementById('managerBlogForm');
        const data = new FormData(form);
        return {
            id: data.get('id').toString().trim(),
            title: data.get('title').toString().trim(),
            excerpt: data.get('excerpt').toString().trim(),
            author: data.get('author').toString().trim(),
            author_avatar: data.get('author_avatar').toString().trim() || null,
            category: data.get('category').toString(),
            tags: data.get('tags').toString().split(',').map((tag) => tag.trim()).filter(Boolean),
            read_time: data.get('read_time').toString().trim() || null,
            publish_date: data.get('publish_date').toString(),
            source_name: data.get('source_name').toString().trim(),
            url: data.get('url').toString().trim(),
            cover_image: data.get('cover_image').toString().trim() || null,
            cover_alt: data.get('cover_alt').toString().trim() || null,
            cover_fit: data.get('cover_fit').toString(),
            status: data.get('status').toString(),
            featured: data.get('featured') === 'on',
            updated_at: new Date().toISOString()
        };
    }

    async saveBlog(event) {
        event.preventDefault();
        const payload = this.getFormPayload();
        const publishNow = event.submitter?.value === 'publish';
        const button = publishNow
            ? document.getElementById('managerPublishBlog')
            : document.getElementById('managerSaveBlog');

        if (publishNow && !payload.cover_image) {
            this.showMessage('Upload or enter a cover image before publishing.', 'error');
            document.getElementById('managerCoverFile')?.focus();
            return;
        }

        if (publishNow) payload.status = 'published';
        this.setEditorBusy(true, button, publishNow ? 'Publishing...' : 'Saving...');

        const query = this.selectedId
            ? this.client.from('blogs').update(payload).eq('id', this.selectedId)
            : this.client.from('blogs').insert(payload);
        const { error } = await query;
        this.setEditorBusy(false);

        if (error) {
            this.showMessage(error.message, 'error');
            return;
        }

        this.selectedId = payload.id;
        this.editorDirty = false;
        this.clearEditorDraft();
        this.showMessage(
            publishNow ? `Published "${payload.title}".` : `Saved "${payload.title}" as ${payload.status}.`,
            'success'
        );
        await this.loadBlogs();
        this.selectBlog(payload.id, { skipConfirmation: true });
    }

    async uploadCover() {
        const input = document.getElementById('managerCoverFile');
        const file = input?.files?.[0];
        if (!file) {
            this.showMessage('Choose an image file first.', 'error');
            input?.focus();
            return;
        }

        const extensions = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/avif': 'avif'
        };
        const extension = extensions[file.type];
        if (!extension) {
            this.showMessage('Use a JPEG, PNG, WebP, or AVIF image.', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.showMessage('The cover image must be 5 MB or smaller.', 'error');
            return;
        }

        const form = document.getElementById('managerBlogForm');
        const slug = this.slugify(form.elements.id.value || form.elements.title.value) || 'blog-cover';
        const randomPart = globalThis.crypto?.randomUUID?.().slice(0, 8) || Math.random().toString(36).slice(2, 10);
        const objectPath = `covers/${slug}-${Date.now()}-${randomPart}.${extension}`;
        const button = document.getElementById('managerUploadCover');
        this.setBusy(button, true, 'Uploading...');

        const { error } = await this.client.storage
            .from('blog-covers')
            .upload(objectPath, file, {
                cacheControl: '31536000',
                contentType: file.type,
                upsert: false
            });

        this.setBusy(button, false, 'Upload image');
        if (error) {
            this.showMessage(`Image upload failed: ${error.message}`, 'error');
            return;
        }

        const { data } = this.client.storage.from('blog-covers').getPublicUrl(objectPath);
        form.elements.cover_image.value = data.publicUrl;
        if (!form.elements.cover_alt.value.trim()) form.elements.cover_alt.value = form.elements.title.value.trim();
        this.markEditorDirty();
        this.renderCoverPreview(data.publicUrl);
        this.showMessage('Cover uploaded. Save or publish the blog to keep this URL.', 'success');
    }

    previewCoverFile(event) {
        const file = event.target.files?.[0];
        if (!file) {
            this.renderCoverPreview(document.getElementById('managerCoverImage').value.trim());
            return;
        }

        this.renderCoverPreview(URL.createObjectURL(file), true);
    }

    clearCover() {
        const form = document.getElementById('managerBlogForm');
        form.elements.cover_image.value = '';
        form.elements.cover_alt.value = '';
        document.getElementById('managerCoverFile').value = '';
        this.markEditorDirty();
        this.renderCoverPreview('');
    }

    renderCoverPreview(url, isObjectUrl = false) {
        const image = document.getElementById('managerCoverPreviewImage');
        const empty = document.getElementById('managerCoverPreviewEmpty');
        if (!image || !empty) return;

        if (image.dataset.objectUrl) {
            URL.revokeObjectURL(image.dataset.objectUrl);
            delete image.dataset.objectUrl;
        }

        if (!url) {
            image.hidden = true;
            image.removeAttribute('src');
            empty.textContent = 'No cover selected';
            empty.hidden = false;
            return;
        }

        image.classList.toggle(
            'is-contain',
            document.getElementById('managerBlogForm')?.elements.cover_fit.value === 'contain'
        );
        image.alt = document.getElementById('managerBlogForm')?.elements.cover_alt.value.trim() || 'Cover preview';
        image.onload = () => {
            image.hidden = false;
            empty.hidden = true;
        };
        image.onerror = () => {
            image.hidden = true;
            empty.hidden = false;
            empty.textContent = 'Image preview unavailable';
        };
        empty.textContent = 'Loading cover...';
        empty.hidden = false;
        image.hidden = true;
        if (isObjectUrl) image.dataset.objectUrl = url;
        image.src = url;
    }

    inferSourceName() {
        const form = document.getElementById('managerBlogForm');
        if (form.elements.source_name.value.trim()) return;
        try {
            const hostname = new URL(form.elements.url.value.trim()).hostname.replace(/^www\./, '');
            form.elements.source_name.value = hostname;
            this.markEditorDirty();
        } catch (_error) {
            // Native form validation handles malformed canonical URLs on save.
        }
    }

    async deleteBlog() {
        if (!this.selectedId) return;
        const blog = this.blogs.find((item) => item.id === this.selectedId);
        if (!globalThis.confirm(`Delete "${blog?.title || this.selectedId}" permanently?`)) return;

        const button = document.getElementById('managerDeleteBlog');
        this.setBusy(button, true, 'Deleting...');
        const { error } = await this.client.from('blogs').delete().eq('id', this.selectedId);
        this.setBusy(button, false, 'Delete');

        if (error) {
            this.showMessage(error.message, 'error');
            return;
        }

        this.showMessage('Blog deleted.', 'success');
        this.resetEditor();
        await this.loadBlogs();
    }

    setBusy(button, busy, label) {
        if (!button) return;
        button.disabled = busy;
        button.textContent = label;
    }

    setEditorBusy(busy, activeButton = null, activeLabel = '') {
        const saveButton = document.getElementById('managerSaveBlog');
        const publishButton = document.getElementById('managerPublishBlog');
        [saveButton, publishButton].forEach((button) => {
            if (button) button.disabled = busy;
        });
        saveButton.textContent = activeButton === saveButton && busy ? activeLabel : 'Save';
        publishButton.textContent = activeButton === publishButton && busy ? activeLabel : 'Publish now';
    }

    showMessage(message, type = '') {
        const element = document.getElementById('managerMessage');
        if (!element) return;
        element.textContent = message;
        element.className = `manager-message is-visible${type ? ` is-${type}` : ''}`;
    }

    slugify(value) {
        return String(value || '')
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/&/g, ' and ')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 72);
    }

    escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SupabaseBlogManager();
});
