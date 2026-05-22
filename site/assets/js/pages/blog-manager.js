// Blog Manager JavaScript
class BlogManager {
    constructor() {
        this.currentTheme = this.getStoredTheme();
        this.tags = [];
        this.nextBlogId = 13; // Start from 13 since we have 12 sample blogs
        
        this.init();
    }
    
    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.setDefaultDate();
    }
    
    // Theme Management
    getStoredTheme() {
        try {
            const storedTheme = localStorage.getItem('theme');
            return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
        } catch (error) {
            return 'light';
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
    }

    setupTheme() {
        this.applyTheme(this.currentTheme);
        this.updateThemeIcon();
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        try {
            localStorage.setItem('theme', this.currentTheme);
        } catch (error) {
            // Keep the current page theme even if storage is unavailable.
        }
        this.updateThemeIcon();
    }
    
    updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const sunIcon = themeToggle.querySelector('.sun-icon');
            const moonIcon = themeToggle.querySelector('.moon-icon');
            
            if (this.currentTheme === 'dark') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }
    }
    
    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle && themeToggle.dataset.themeBound !== 'true') {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            themeToggle.dataset.themeBound = 'true';
        }
        
        // Form submission
        const blogForm = document.getElementById('blogForm');
        if (blogForm) {
            blogForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Tags input
        const tagsInput = document.getElementById('blogTags');
        if (tagsInput) {
            tagsInput.addEventListener('keypress', (e) => this.handleTagInput(e));
        }
        
        // Preview button
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.showPreview());
        }
        
        // Save draft button
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }
        
        // Auto-save on input
        const formInputs = document.querySelectorAll('#blogForm input, #blogForm textarea, #blogForm select');
        formInputs.forEach(input => {
            input.addEventListener('input', () => this.autoSave());
        });
    }
    
    // Utility Functions
    setDefaultDate() {
        const dateInput = document.getElementById('blogPublishDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }
    
    // Tag Management
    handleTagInput(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tagInput = e.target;
            const tag = tagInput.value.trim();
            
            if (tag && !this.tags.includes(tag)) {
                this.tags.push(tag);
                this.updateTagPreview();
                tagInput.value = '';
            }
        }
    }
    
    updateTagPreview() {
        const tagPreview = document.getElementById('tagPreview');
        tagPreview.innerHTML = this.tags.map(tag => `
            <span class="tag">
                ${tag}
                <span class="remove-tag" data-tag="${tag}">×</span>
            </span>
        `).join('');
        
        // Add remove tag functionality
        tagPreview.querySelectorAll('.remove-tag').forEach(removeBtn => {
            removeBtn.addEventListener('click', (e) => {
                const tagToRemove = e.target.dataset.tag;
                this.tags = this.tags.filter(tag => tag !== tagToRemove);
                this.updateTagPreview();
            });
        });
    }
    
    // Form Handling
    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const blogData = {
            id: this.nextBlogId++,
            title: formData.get('title'),
            excerpt: formData.get('excerpt'),
            author: formData.get('author'),
            category: formData.get('category'),
            readTime: formData.get('readTime') || this.estimateReadTime(formData.get('content')),
            publishDate: formData.get('publishDate'),
            content: formData.get('content'),
            tags: [...this.tags],
            likes: 0,
            comments: 0,
            views: 0
        };
        
        // Validate required fields
        if (!this.validateBlogData(blogData)) {
            return;
        }
        
        // Save blog (in a real app, this would send to a server)
        this.saveBlog(blogData);
        
        // Show success message
        this.showNotification('Blog published successfully!', 'success');
        
        // Reset form
        this.resetForm();
    }
    
    validateBlogData(blogData) {
        const requiredFields = ['title', 'excerpt', 'author', 'category', 'content'];
        
        for (const field of requiredFields) {
            if (!blogData[field] || blogData[field].trim() === '') {
                this.showNotification(`Please fill in the ${field} field.`, 'error');
                return false;
            }
        }
        
        return true;
    }
    
    estimateReadTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    }
    
    saveBlog(blogData) {
        // In a real application, this would save to a database
        // For now, we'll save to localStorage and show the generated code
        
        const blogs = JSON.parse(localStorage.getItem('customBlogs') || '[]');
        blogs.push(blogData);
        localStorage.setItem('customBlogs', JSON.stringify(blogs));
        
        // Generate code for adding to assets/js/app.js
        this.generateBlogCode(blogData);
    }
    
    generateBlogCode(blogData) {
        const code = `
// Add this to the loadSampleBlogs() function in assets/js/app.js
{
    id: ${blogData.id},
    title: "${blogData.title}",
    excerpt: "${blogData.excerpt}",
    author: "${blogData.author}",
    category: "${blogData.category}",
    tags: [${blogData.tags.map(tag => `"${tag}"`).join(', ')}],
    readTime: "${blogData.readTime}",
    publishDate: "${blogData.publishDate}",
    likes: ${blogData.likes},
    comments: ${blogData.comments}
}`;
        
        console.log('Generated blog code:');
        console.log(code);
        
        // You can also copy this to clipboard
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('Blog code copied to clipboard!', 'success');
        });
    }
    
    showPreview() {
        const formData = new FormData(document.getElementById('blogForm'));
        const previewContent = document.getElementById('previewContent');
        const previewSection = document.getElementById('previewSection');
        
        const blogData = {
            title: formData.get('title') || 'Blog Title',
            excerpt: formData.get('excerpt') || 'Blog excerpt...',
            author: formData.get('author') || 'Author Name',
            category: formData.get('category') || 'Category',
            readTime: formData.get('readTime') || '5 min read',
            publishDate: formData.get('publishDate') || new Date().toISOString().split('T')[0],
            content: formData.get('content') || '<p>Blog content...</p>',
            tags: this.tags
        };
        
        previewContent.innerHTML = `
            <div class="blog-meta">
                <span class="blog-category">${blogData.category}</span>
                <span>•</span>
                <span>${blogData.readTime}</span>
                <span>•</span>
                <span>${this.formatDate(blogData.publishDate)}</span>
            </div>
            <h1 class="blog-title">${blogData.title}</h1>
            <p class="blog-excerpt">${blogData.excerpt}</p>
            <div class="blog-author-info">
                <div class="author-avatar"></div>
                <div class="author-details">
                    <div class="author-name">${blogData.author}</div>
                </div>
            </div>
            <div class="blog-content">
                ${blogData.content}
            </div>
            <div class="blog-tags">
                ${blogData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
        
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    saveDraft() {
        const formData = new FormData(document.getElementById('blogForm'));
        const draftData = {
            title: formData.get('title'),
            excerpt: formData.get('excerpt'),
            author: formData.get('author'),
            category: formData.get('category'),
            readTime: formData.get('readTime'),
            publishDate: formData.get('publishDate'),
            content: formData.get('content'),
            tags: this.tags,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('blogDraft', JSON.stringify(draftData));
        this.showNotification('Draft saved successfully!', 'success');
    }
    
    loadDraft() {
        const draftData = JSON.parse(localStorage.getItem('blogDraft') || '{}');
        
        if (Object.keys(draftData).length > 0) {
            document.getElementById('blogTitle').value = draftData.title || '';
            document.getElementById('blogExcerpt').value = draftData.excerpt || '';
            document.getElementById('blogAuthor').value = draftData.author || '';
            document.getElementById('blogCategory').value = draftData.category || '';
            document.getElementById('blogReadTime').value = draftData.readTime || '';
            document.getElementById('blogPublishDate').value = draftData.publishDate || '';
            document.getElementById('blogContent').value = draftData.content || '';
            
            this.tags = draftData.tags || [];
            this.updateTagPreview();
            
            this.showNotification('Draft loaded successfully!', 'success');
        }
    }
    
    autoSave() {
        // Auto-save every 30 seconds
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveDraft();
        }, 30000);
    }
    
    resetForm() {
        document.getElementById('blogForm').reset();
        this.tags = [];
        this.updateTagPreview();
        document.getElementById('previewSection').style.display = 'none';
        this.setDefaultDate();
    }
    
    // Utility Functions
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        if (type === 'success') {
            notification.style.backgroundColor = '#10B981';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#EF4444';
        } else {
            notification.style.backgroundColor = '#3B82F6';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize the blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const blogManager = new BlogManager();
    
    // Show page loading animation
    if (window.loadingAnimation) {
        window.loadingAnimation.show('Loading management interface...', 1500);
    }
    
    // Check for saved draft on page load
    const draftData = JSON.parse(localStorage.getItem('blogDraft') || '{}');
    if (Object.keys(draftData).length > 0) {
        if (confirm('You have a saved draft. Would you like to load it?')) {
            blogManager.loadDraft();
        }
    }
});
