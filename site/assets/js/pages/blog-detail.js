// Blog Detail Page JavaScript
class BlogDetail {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.blogId = this.getBlogIdFromURL();
        this.blog = null;
        this.liked = false;
        this.bookmarked = false;
        this.commentsKey = `blog:${this.blogId}:comments`;
        this.nextCommentIdKey = `blog:${this.blogId}:nextCommentId`;
        this.comments = [];
        // comments UI config/state
        this.maxReplyDepth = 3; // 0-based: top-level is 0, last allowed is 2 (3 levels total)
        this.repliesPageSize = 2;
        this.repliesVisibleCountById = {};
        this.likedCommentIdsKey = `blog:${this.blogId}:likedCommentIds`;
        this.likedCommentIds = this.getLikedCommentIds();
        this.replySortMode = 'hybrid'; // 'likes' | 'time' | 'hybrid'
        this.annotationsKey = `blog:${this.blogId}:annotations`;
        this.annotations = [];
        this.activeSelection = null;
        this.selectionToolbar = null;
        this.notePopover = null;
        this.notePreview = null;
        this.editingAnnotationId = null;
        this.pendingAnnotation = null;

        this.handleArticleSelection = this.handleArticleSelection.bind(this);
        this.handleContentClick = this.handleContentClick.bind(this);
        this.handleAnnotationDocumentClick = this.handleAnnotationDocumentClick.bind(this);
        this.handleReadingNotesClick = this.handleReadingNotesClick.bind(this);
        this.init();
    }
    
    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.loadAnnotations();
        this.loadBlog();
        this.setupAnnotationTools();
        this.loadRelatedBlogs();
        this.loadComments();
    }
    
    // Theme Management
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
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
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Like button
        const likeBtn = document.getElementById('likeBtn');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => this.toggleLike());
        }
        
        // Bookmark button
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', () => this.toggleBookmark());
        }
        
        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareBlog());
        }
        
        // Comment form
        const commentForm = document.querySelector('.comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e));
        }
        
        // Related blog cards
        document.addEventListener('click', (e) => {
            if (e.target.closest('.related-blog-card')) {
                const card = e.target.closest('.related-blog-card');
                const blogId = card.dataset.blogId;
                if (blogId) {
                    window.location.href = `blog-detail.html?id=${blogId}`;
                }
            }
        });
    }
    
    // URL Management
    getBlogIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || '1';
    }
    
    // Blog Loading
    loadBlog() {
        const blogs = this.getAllBlogs();
        this.blog = blogs.find(blog => String(blog.id) === String(this.blogId));
        
        if (!this.blog) {
            this.showError('Blog not found');
            return;
        }
        
        this.renderBlog();
    }

    getAllBlogs() {
        const localBlogs = this.getSampleBlogs();
        const curatedBlogs = this.getCuratedBlogs();
        const byId = new Map();

        [...localBlogs, ...curatedBlogs].forEach((blog) => {
            if (!blog || blog.id === undefined || blog.id === null) return;
            byId.set(String(blog.id), blog);
        });

        return Array.from(byId.values());
    }

    getCuratedBlogs() {
        if (typeof BlogXiv === 'undefined' || !BlogXiv.prototype.getCuratedCommunityBlogs) {
            return [];
        }

        return BlogXiv.prototype
            .getCuratedCommunityBlogs()
            .map((blog, index) => this.createCuratedDetailBlog(blog, index));
    }

    createCuratedDetailBlog(blog, index) {
        const tagCount = Array.isArray(blog.tags) ? blog.tags.length : 0;
        const ageWeight = Math.max(0, 140 - index);

        return {
            ...blog,
            authorBio: `${blog.sourceName || blog.author} contributor covering ${blog.category.toLowerCase()} research and practice.`,
            likes: blog.likes ?? (ageWeight + tagCount * 9),
            comments: blog.comments ?? Math.max(4, Math.round((ageWeight + tagCount * 4) / 8)),
            content: blog.content || this.buildExternalBlogContent(blog)
        };
    }

    buildExternalBlogContent(blog) {
        const tags = Array.isArray(blog.tags) ? blog.tags : [];
        const safeTitle = this.escapeHTML(blog.title);
        const safeExcerpt = this.escapeHTML(blog.excerpt || '');
        const safeSource = this.escapeHTML(blog.sourceName || 'Original source');
        const safeUrl = this.escapeHTML(blog.url || '#');
        const safeCover = this.escapeHTML(blog.coverImage || '');
        const safeCoverAlt = this.escapeHTML(blog.coverAlt || blog.title);
        const safeCategory = this.escapeHTML(blog.category || 'Research');
        const topicList = tags.length
            ? `<ul>${tags.map(tag => `<li>${this.escapeHTML(tag)}</li>`).join('')}</ul>`
            : '<p>No topic tags are available for this article.</p>';

        return `
            ${safeCover ? `
                <figure class="external-blog-cover">
                    <img src="${safeCover}" alt="${safeCoverAlt}" loading="lazy" referrerpolicy="no-referrer">
                    <figcaption>${safeSource}</figcaption>
                </figure>
            ` : ''}
            <h2>Curated Summary</h2>
            <p>${safeExcerpt}</p>
            <p>This BlogXiv entry points to a trusted external article from <strong>${safeSource}</strong>. Use this page to save notes, comments, and related reading context, then continue to the original article for the full post.</p>
            <h2>Why It Matters</h2>
            <p>The article sits in the <strong>${safeCategory}</strong> track, making it useful for readers following multimodal AI, generative media, and world-model research progress.</p>
            <h2>Topics</h2>
            ${topicList}
            <div class="external-source-callout">
                <div>
                    <strong>Read the complete article</strong>
                    <p>${safeTitle} is hosted by ${safeSource}.</p>
                </div>
                <a class="btn btn-primary" href="${safeUrl}" target="_blank" rel="noopener noreferrer">Read original</a>
            </div>
        `;
    }
    
    getSampleBlogs() {
        // This should match the data from assets/js/app.js
        return [
            {
                id: 1,
                title: "GPT-4 and Beyond: The Evolution of Large Language Models",
                excerpt: "Exploring the latest breakthroughs in large language models, from GPT-4 to multimodal capabilities and their impact on AI research.",
                author: "Dr. Sarah Chen",
                authorBio: "AI Researcher at Stanford University, specializing in natural language processing and multimodal AI systems.",
                category: "Multimodal Model",
                tags: ["LLM", "GPT-4", "Multimodal", "NLP"],
                readTime: "12 min read",
                publishDate: "2024-01-15",
                likes: 342,
                comments: 45,
                content: `
                    <h2>Introduction</h2>
                    <p>The field of artificial intelligence has witnessed unprecedented growth in recent years, particularly in the domain of <strong>Large Language Models (LLMs)</strong>. The release of GPT-4 marked a significant milestone in this journey, demonstrating capabilities that were previously thought to be years away.</p>
                    
                    <h2>The Evolution of Language Models</h2>
                    <p>Language models have evolved from simple statistical approaches to sophisticated neural architectures. The progression from GPT-1 to GPT-4 represents not just an increase in scale, but fundamental improvements in:</p>
                    
                    <ul>
                        <li><strong>Architecture Design</strong>: More efficient transformer variants</li>
                        <li><strong>Training Data</strong>: Curated, high-quality datasets</li>
                        <li><strong>Alignment</strong>: Better human preference modeling</li>
                        <li><strong>Multimodal Capabilities</strong>: Integration of vision and language</li>
                    </ul>
                    
                    <h2>Key Innovations in GPT-4</h2>
                    <p>GPT-4 introduced several groundbreaking features that set it apart from its predecessors:</p>
                    
                    <h3>Multimodal Understanding</h3>
                    <p>One of the most significant advances is GPT-4's ability to process both text and images. This multimodal capability enables the model to:</p>
                    
                    <blockquote>
                        "The integration of vision and language processing represents a fundamental shift in how AI systems understand and interact with the world around us."
                    </blockquote>
                    
                    <h3>Improved Reasoning</h3>
                    <p>GPT-4 demonstrates enhanced reasoning capabilities, particularly in complex problem-solving scenarios. The model can now:</p>
                    
                    <ul>
                        <li>Break down complex problems into manageable steps</li>
                        <li>Maintain context across longer conversations</li>
                        <li>Provide more accurate and nuanced responses</li>
                    </ul>
                    
                    <h2>Technical Architecture</h2>
                    <p>The technical implementation of GPT-4 involves several key components:</p>
                    
                    <pre><code># Simplified GPT-4 Architecture
class GPT4Model:
    def __init__(self):
        self.embedding_layer = EmbeddingLayer()
        self.transformer_blocks = TransformerBlocks()
        self.output_layer = OutputLayer()
    
    def forward(self, input_tokens):
        embeddings = self.embedding_layer(input_tokens)
        hidden_states = self.transformer_blocks(embeddings)
        output = self.output_layer(hidden_states)
        return output</code></pre>
                    
                    <h2>Applications and Impact</h2>
                    <p>The applications of GPT-4 span across numerous domains:</p>
                    
                    <h3>Education</h3>
                    <p>GPT-4 is revolutionizing education by providing personalized tutoring, automated grading, and interactive learning experiences.</p>
                    
                    <h3>Healthcare</h3>
                    <p>In healthcare, GPT-4 assists with medical documentation, patient communication, and clinical decision support.</p>
                    
                    <h3>Creative Industries</h3>
                    <p>The model's creative capabilities are being leveraged in content creation, design, and entertainment.</p>
                    
                    <h2>Challenges and Limitations</h2>
                    <p>Despite its impressive capabilities, GPT-4 faces several challenges:</p>
                    
                    <ul>
                        <li><strong>Hallucination</strong>: The model can generate factually incorrect information</li>
                        <li><strong>Bias</strong>: Training data biases can manifest in outputs</li>
                        <li><strong>Computational Cost</strong>: High resource requirements for training and inference</li>
                        <li><strong>Safety Concerns</strong>: Potential misuse and harmful content generation</li>
                    </ul>
                    
                    <h2>Future Directions</h2>
                    <p>The future of large language models looks promising, with several exciting developments on the horizon:</p>
                    
                    <ul>
                        <li>More efficient architectures reducing computational requirements</li>
                        <li>Better alignment with human values and preferences</li>
                        <li>Integration with external tools and APIs</li>
                        <li>Real-time learning and adaptation capabilities</li>
                    </ul>
                    
                    <h2>Conclusion</h2>
                    <p>GPT-4 represents a significant milestone in the evolution of artificial intelligence. Its multimodal capabilities, improved reasoning, and broad applicability make it a powerful tool for various applications. However, addressing the challenges of hallucination, bias, and safety remains crucial for the continued advancement of this technology.</p>
                    
                    <p>As we look toward the future, the development of even more sophisticated language models promises to further transform how we interact with AI systems and leverage their capabilities for human benefit.</p>
                `
            },
            {
                id: 2,
                title: "Model Quantization: Making AI More Efficient",
                excerpt: "A comprehensive guide to model quantization techniques that reduce computational requirements while maintaining performance.",
                author: "Dr. Alex Kim",
                authorBio: "Machine Learning Engineer at Google Research, focusing on model optimization and efficient AI deployment.",
                category: "Multimodal Model",
                tags: ["Quantization", "Model Compression", "Efficiency", "Optimization"],
                readTime: "15 min read",
                publishDate: "2024-01-14",
                likes: 289,
                comments: 32,
                content: `
                    <h2>Introduction to Model Quantization</h2>
                    <p>Model quantization is a crucial technique in the field of <strong>efficient AI</strong>, enabling the deployment of large neural networks on resource-constrained devices. This comprehensive guide explores various quantization methods and their practical applications.</p>
                    
                    <h2>What is Quantization?</h2>
                    <p>Quantization is the process of reducing the precision of model parameters and activations, typically from 32-bit floating-point numbers to lower precision formats like 8-bit integers or even binary values.</p>
                    
                    <h2>Types of Quantization</h2>
                    
                    <h3>Post-Training Quantization (PTQ)</h3>
                    <p>Post-training quantization applies quantization to a pre-trained model without additional training:</p>
                    
                    <ul>
                        <li><strong>Static Quantization</strong>: Uses calibration data to determine quantization parameters</li>
                        <li><strong>Dynamic Quantization</strong>: Quantizes weights statically but activations dynamically</li>
                    </ul>
                    
                    <h3>Quantization-Aware Training (QAT)</h3>
                    <p>QAT incorporates quantization during the training process, allowing the model to adapt to the reduced precision:</p>
                    
                    <blockquote>
                        "Quantization-aware training typically achieves better accuracy than post-training quantization, especially for aggressive quantization schemes."
                    </blockquote>
                    
                    <h2>Quantization Techniques</h2>
                    
                    <h3>Linear Quantization</h3>
                    <p>Linear quantization maps floating-point values to integers using a linear transformation:</p>
                    
                    <pre><code># Linear quantization formula
q = round((x - zero_point) / scale)
x_quantized = q * scale + zero_point</code></pre>
                    
                    <h3>Non-Linear Quantization</h3>
                    <p>Non-linear quantization uses logarithmic or other non-linear mappings to better preserve the distribution of values.</p>
                    
                    <h2>Implementation Strategies</h2>
                    
                    <h3>Layer-wise Quantization</h3>
                    <p>Different layers may require different quantization strategies based on their sensitivity to precision reduction.</p>
                    
                    <h3>Channel-wise Quantization</h3>
                    <p>Applying different quantization parameters to different channels can improve accuracy.</p>
                    
                    <h2>Performance Metrics</h2>
                    <p>When evaluating quantization techniques, consider:</p>
                    
                    <ul>
                        <li><strong>Accuracy Loss</strong>: How much performance degrades</li>
                        <li><strong>Model Size</strong>: Reduction in storage requirements</li>
                        <li><strong>Inference Speed</strong>: Improvement in inference time</li>
                        <li><strong>Memory Usage</strong>: Reduction in memory footprint</li>
                    </ul>
                    
                    <h2>Practical Applications</h2>
                    
                    <h3>Mobile Deployment</h3>
                    <p>Quantized models are essential for mobile applications where computational resources are limited.</p>
                    
                    <h3>Edge Computing</h3>
                    <p>Edge devices benefit significantly from quantized models that can run efficiently on specialized hardware.</p>
                    
                    <h3>Cloud Optimization</h3>
                    <p>Even in cloud environments, quantized models can reduce costs and improve throughput.</p>
                    
                    <h2>Challenges and Solutions</h2>
                    
                    <h3>Accuracy Degradation</h3>
                    <p>Aggressive quantization can lead to significant accuracy loss. Solutions include:</p>
                    
                    <ul>
                        <li>Mixed-precision quantization</li>
                        <li>Knowledge distillation</li>
                        <li>Progressive quantization</li>
                    </ul>
                    
                    <h3>Hardware Compatibility</h3>
                    <p>Different hardware platforms support different quantization formats. It's important to choose quantization schemes that are compatible with target hardware.</p>
                    
                    <h2>Best Practices</h2>
                    
                    <ol>
                        <li><strong>Start with Post-Training Quantization</strong>: It's simpler and often sufficient</li>
                        <li><strong>Use Calibration Data</strong>: Representative data improves quantization quality</li>
                        <li><strong>Monitor Accuracy</strong>: Always validate quantized model performance</li>
                        <li><strong>Consider Hardware Constraints</strong>: Choose quantization schemes based on target hardware</li>
                    </ol>
                    
                    <h2>Future Directions</h2>
                    <p>The field of model quantization continues to evolve with new techniques and applications:</p>
                    
                    <ul>
                        <li>Learned quantization parameters</li>
                        <li>Hardware-aware quantization</li>
                        <li>Dynamic quantization strategies</li>
                        <li>Integration with neural architecture search</li>
                    </ul>
                    
                    <h2>Conclusion</h2>
                    <p>Model quantization is a powerful technique for making AI models more efficient and deployable. By carefully choosing quantization strategies and monitoring performance, developers can achieve significant improvements in model efficiency while maintaining acceptable accuracy levels.</p>
                `
            }
            // Add more sample blogs as needed
        ];
    }
    
    renderBlog() {
        if (!this.blog) return;
        
        // Update page title
        document.getElementById('pageTitle').textContent = `${this.blog.title} - BlogXiv`;
        
        // Update breadcrumb
        document.getElementById('breadcrumbCategory').textContent = this.blog.category;
        document.getElementById('breadcrumbTitle').textContent = this.blog.title;
        
        // Update blog header
        document.getElementById('blogCategory').textContent = this.blog.category;
        document.getElementById('blogReadTime').textContent = this.blog.readTime;
        document.getElementById('blogPublishDate').textContent = this.formatDate(this.blog.publishDate);
        document.getElementById('blogTitle').textContent = this.blog.title;
        document.getElementById('blogExcerpt').textContent = this.blog.excerpt;
        
        // Update author info
        document.getElementById('authorName').textContent = this.blog.author;
        document.getElementById('authorBio').textContent = this.blog.authorBio || 'AI Researcher and Content Creator';
        this.renderAuthorAvatar();
        
        // Update like count
        document.getElementById('likeCount').textContent = this.blog.likes;
        
        // Update blog content
        const contentElement = document.getElementById('blogContent');
        if (contentElement) {
            contentElement.innerHTML = this.blog.content;
            this.applyAnnotations();
        }
        
        // Update tags
        this.renderTags();
        this.ensureReadingNotesSection();
        this.renderReadingNotes();
    }

    renderAuthorAvatar() {
        const avatar = document.querySelector('.blog-author-info .author-avatar');
        if (!avatar) return;

        if (!this.blog.authorAvatar) {
            avatar.innerHTML = '';
            return;
        }

        avatar.innerHTML = `<img src="${this.escapeHTML(this.blog.authorAvatar)}" alt="${this.escapeHTML(this.blog.author)}" loading="lazy" referrerpolicy="no-referrer">`;
    }
    
    renderTags() {
        const tagsContainer = document.getElementById('blogTags');
        if (!this.blog.tags) return;
        
        tagsContainer.innerHTML = this.blog.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
    }


    loadRelatedBlogs() {
        const relatedContainer = document.getElementById('relatedBlogs');
        const allBlogs = this.getAllBlogs();
        if (!relatedContainer || !this.blog) return;
        
        // Get related blogs (same category, excluding current blog)
        const relatedBlogs = allBlogs
            .filter(blog => String(blog.id) !== String(this.blogId) && blog.category === this.blog.category)
            .slice(0, 3);
        
        if (relatedBlogs.length === 0) {
            relatedContainer.innerHTML = '<p>No related blogs found.</p>';
            return;
        }
        
        relatedContainer.innerHTML = relatedBlogs.map(blog => `
            <div class="related-blog-card" data-blog-id="${blog.id}">
                <h3>${blog.title}</h3>
                <p>${blog.excerpt}</p>
                <div class="blog-meta">
                    <span>${blog.sourceName || blog.author}</span>
                    <span>•</span>
                    <span>${blog.readTime}</span>
                </div>
            </div>
        `).join('');
    }
    
    // Comments: load, persist, render (nested)
    loadComments() {
        const stored = this.getStoredComments();
        if (stored && Array.isArray(stored)) {
            this.comments = stored;
        } else {
            this.comments = this.seedDefaultComments();
            this.saveStoredComments();
        }
        this.renderComments();
    }

    getStoredComments() {
        try {
            const raw = localStorage.getItem(this.commentsKey);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    saveStoredComments() {
        try {
            localStorage.setItem(this.commentsKey, JSON.stringify(this.comments));
        } catch (e) {
            // no-op
        }
    }

    getNextCommentId() {
        let nextId = parseInt(localStorage.getItem(this.nextCommentIdKey) || '4', 10);
        localStorage.setItem(this.nextCommentIdKey, String(nextId + 1));
        return nextId;
    }

    seedDefaultComments() {
        // initial nested structure
        // ids 1..3 reserved so next starts from 4
        localStorage.setItem(this.nextCommentIdKey, '4');
        return [
            {
                id: 1,
                author: "Dr. Jane Smith",
                date: "2024-01-16",
                content: "Excellent overview of the current state of LLMs. The section on multimodal capabilities is particularly insightful.",
                likes: 3,
                replies: [
                    {
                        id: 2,
                        author: "Prof. Michael Johnson",
                        date: "2024-01-16",
                        content: "Totally agree. The multimodal part changes the game.",
                        likes: 2,
                        replies: []
                    }
                ]
            },
            {
                id: 3,
                author: "Sarah Wilson",
                date: "2024-01-15",
                content: "This is exactly what I was looking for. The technical details are well-explained and accessible. Thank you for sharing!",
                likes: 1,
                replies: []
            }
        ];
    }

    renderComments() {
        const container = document.getElementById('commentsList');
        if (!container) return;
        const sortedTopLevel = this.sortComments(this.comments);
        container.innerHTML = sortedTopLevel.map(c => this.renderSingleComment(c, 0)).join('');
        this.bindCommentEvents();
    }

    renderSingleComment(comment, depth) {
        const content = this.escapeHTML(comment.content || '');
        const canReply = depth < (this.maxReplyDepth - 1);

        const allReplies = comment.replies || [];
        const visibleCount = this.repliesVisibleCountById[comment.id] ?? this.repliesPageSize;
        const sortedReplies = this.sortComments(allReplies);
        const visibleReplies = sortedReplies.slice(0, visibleCount);
        const hasMore = sortedReplies.length > visibleCount;

        const repliesHTML = visibleReplies
            .map(c => this.renderSingleComment(c, depth + 1))
            .join('');

        return `
            <div class="comment" data-comment-id="${comment.id}" data-depth="${depth}">
                <div class="comment-header">
                    <div class="comment-avatar"></div>
                    <div class="comment-author">${this.escapeHTML(comment.author || 'Guest')}</div>
                    <div class="comment-date">${this.formatDate(comment.date)}</div>
                </div>
                <div class="comment-content">${content}</div>
                <div class="comment-actions">
                    <button class="comment-like-btn comment-btn ${this.likedCommentIds.has(comment.id) ? 'liked' : ''}" data-comment-id="${comment.id}">
                        <svg class="icon-heart" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        <span class="like-count">${comment.likes || 0}</span>
                    </button>
                    ${canReply ? `<button class=\"comment-reply-btn comment-btn\" data-comment-id=\"${comment.id}\"><svg class=\"icon-reply\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12l7-7v4h7v6h-7v4z\"></path></svg><span>Reply</span></button>` : ''}
                </div>
                <div class="comment-replies">
                    ${repliesHTML}
                    ${hasMore ? `<button class="show-more-replies" data-comment-id="${comment.id}">Show more replies (${allReplies.length - visibleReplies.length})</button>` : ''}
                </div>
            </div>
        `;
    }

    sortComments(list) {
        const items = Array.isArray(list) ? [...list] : [];
        const mode = this.replySortMode || 'hybrid';
        items.sort((a, b) => {
            const likesDiff = (b.likes || 0) - (a.likes || 0);
            const timeDiff = (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0);
            if (mode === 'likes') return likesDiff || timeDiff;
            if (mode === 'time') return timeDiff || likesDiff;
            // hybrid: likes first, then time
            return likesDiff || timeDiff;
        });
        return items;
    }

    escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Reading notes and inline annotations
    loadAnnotations() {
        try {
            const raw = localStorage.getItem(this.annotationsKey);
            const parsed = raw ? JSON.parse(raw) : [];
            this.annotations = Array.isArray(parsed)
                ? parsed.filter(item => Number.isFinite(item.start) && Number.isFinite(item.end) && item.end > item.start)
                : [];
        } catch (e) {
            this.annotations = [];
        }
    }

    saveAnnotations() {
        try {
            localStorage.setItem(this.annotationsKey, JSON.stringify(this.annotations));
        } catch (e) {
            // no-op
        }
    }

    setupAnnotationTools() {
        const content = document.getElementById('blogContent');
        if (!content || !this.blog) return;

        this.ensureAnnotationChrome();
        content.removeEventListener('click', this.handleContentClick);
        content.addEventListener('click', this.handleContentClick);

        document.removeEventListener('mouseup', this.handleArticleSelection);
        document.removeEventListener('keyup', this.handleArticleSelection);
        document.removeEventListener('mousedown', this.handleAnnotationDocumentClick);
        document.addEventListener('mouseup', this.handleArticleSelection);
        document.addEventListener('keyup', this.handleArticleSelection);
        document.addEventListener('mousedown', this.handleAnnotationDocumentClick);
    }

    ensureAnnotationChrome() {
        if (!this.selectionToolbar) {
            const toolbar = document.createElement('div');
            toolbar.className = 'selection-toolbar';
            toolbar.setAttribute('aria-hidden', 'true');
            toolbar.innerHTML = `
                <button type="button" class="selection-toolbar-btn" data-annotation-action="highlight">Highlight</button>
                <span class="selection-toolbar-divider" aria-hidden="true"></span>
                <button type="button" class="selection-toolbar-btn primary" data-annotation-action="note">Note</button>
            `;
            toolbar.addEventListener('mousedown', event => event.preventDefault());
            toolbar.addEventListener('click', event => {
                const action = event.target.closest('[data-annotation-action]')?.dataset.annotationAction;
                if (!action) return;
                if (action === 'highlight') this.createAnnotationFromSelection('');
                if (action === 'note') this.openNotePopoverForSelection();
            });
            document.body.appendChild(toolbar);
            this.selectionToolbar = toolbar;
        }

        if (!this.notePopover) {
            const popover = document.createElement('div');
            popover.className = 'note-popover';
            popover.setAttribute('aria-hidden', 'true');
            popover.innerHTML = `
                <div class="note-popover-header">
                    <div class="note-popover-title">Reading Note</div>
                    <button type="button" class="note-popover-close">Close</button>
                </div>
                <div class="note-popover-body">
                    <div class="note-popover-excerpt"></div>
                    <textarea class="note-popover-textarea" placeholder="Write a note..."></textarea>
                </div>
                <div class="note-popover-footer">
                    <button type="button" class="note-popover-btn secondary" data-note-action="cancel">Cancel</button>
                    <button type="button" class="note-popover-btn primary" data-note-action="save">Save</button>
                </div>
            `;
            popover.addEventListener('click', event => {
                const close = event.target.closest('.note-popover-close');
                const action = event.target.closest('[data-note-action]')?.dataset.noteAction;
                if (close || action === 'cancel') {
                    this.hideNotePopover();
                    return;
                }
                if (action === 'save') {
                    this.saveNotePopover();
                }
            });
            document.body.appendChild(popover);
            this.notePopover = popover;
        }

        if (!this.notePreview) {
            const preview = document.createElement('div');
            preview.className = 'note-preview';
            preview.setAttribute('aria-hidden', 'true');
            preview.innerHTML = `
                <div class="note-popover-text"></div>
                <div class="note-popover-meta"></div>
                <div class="note-preview-actions">
                    <button type="button" data-preview-action="edit">Edit</button>
                    <button type="button" data-preview-action="delete">Delete</button>
                </div>
            `;
            preview.addEventListener('click', event => {
                const action = event.target.closest('[data-preview-action]')?.dataset.previewAction;
                const annotationId = preview.dataset.annotationId;
                if (!action || !annotationId) return;
                if (action === 'edit') this.openNotePopoverForExisting(annotationId);
                if (action === 'delete') this.deleteAnnotation(annotationId);
            });
            document.body.appendChild(preview);
            this.notePreview = preview;
        }
    }

    ensureReadingNotesSection() {
        if (document.querySelector('.reading-notes')) return;
        const tags = document.getElementById('blogTags');
        if (!tags) return;

        const section = document.createElement('section');
        section.className = 'reading-notes';
        section.innerHTML = `
            <div class="reading-notes-header">
                <h2>Reading Notes</h2>
                <button type="button" class="reading-notes-clear">Clear all</button>
            </div>
            <p class="reading-notes-empty">No notes yet.</p>
            <ul class="reading-notes-list"></ul>
        `;
        section.addEventListener('click', this.handleReadingNotesClick);
        tags.insertAdjacentElement('afterend', section);
    }

    handleArticleSelection() {
        if (!this.selectionToolbar || !this.blog) return;
        setTimeout(() => {
            const selection = window.getSelection();
            const content = document.getElementById('blogContent');
            if (!selection || !content || selection.rangeCount === 0 || selection.isCollapsed) {
                this.hideSelectionToolbar();
                return;
            }

            const range = selection.getRangeAt(0);
            if (!content.contains(range.commonAncestorContainer)) {
                this.hideSelectionToolbar();
                return;
            }

            const offsets = this.getSelectionOffsets(content, range);
            if (!offsets || offsets.text.length < 2) {
                this.hideSelectionToolbar();
                return;
            }

            this.activeSelection = offsets;
            this.positionFloatingElement(this.selectionToolbar, range.getBoundingClientRect(), 'top');
            this.selectionToolbar.classList.add('visible');
            this.selectionToolbar.setAttribute('aria-hidden', 'false');
        }, 0);
    }

    getSelectionOffsets(root, range) {
        const rawText = range.toString();
        const leading = rawText.match(/^\s*/)?.[0].length || 0;
        const trailing = rawText.match(/\s*$/)?.[0].length || 0;
        const text = rawText.trim();
        if (!text) return null;

        const preSelectionRange = document.createRange();
        preSelectionRange.selectNodeContents(root);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length + leading;
        const end = start + rawText.length - leading - trailing;
        return { start, end, text };
    }

    hideSelectionToolbar() {
        if (!this.selectionToolbar) return;
        this.selectionToolbar.classList.remove('visible');
        this.selectionToolbar.setAttribute('aria-hidden', 'true');
    }

    createAnnotationFromSelection(note) {
        if (!this.activeSelection) return;
        const { start, end, text } = this.activeSelection;
        if (this.annotationOverlaps(start, end)) {
            this.showNotification('This text already has a note or highlight.', 'error');
            this.hideSelectionToolbar();
            return;
        }

        const annotation = {
            id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            start,
            end,
            text,
            note: note.trim(),
            createdAt: new Date().toISOString()
        };

        this.annotations.push(annotation);
        this.annotations.sort((a, b) => a.start - b.start);
        this.saveAnnotations();
        this.renderAnnotatedContent();
        this.renderReadingNotes();
        this.clearNativeSelection();
        this.hideSelectionToolbar();
        this.hideNotePopover();
        this.showNotification(annotation.note ? 'Note saved.' : 'Highlight saved.', 'success');
    }

    annotationOverlaps(start, end, ignoredId = null) {
        return this.annotations.some(item => {
            if (item.id === ignoredId) return false;
            return Math.max(start, item.start) < Math.min(end, item.end);
        });
    }

    openNotePopoverForSelection() {
        if (!this.activeSelection || !this.notePopover) return;
        this.pendingAnnotation = this.activeSelection;
        this.editingAnnotationId = null;
        this.notePopover.querySelector('.note-popover-title').textContent = 'Reading Note';
        this.notePopover.querySelector('.note-popover-excerpt').textContent = this.activeSelection.text;
        this.notePopover.querySelector('.note-popover-textarea').value = '';
        this.showNotePopoverNearSelection();
    }

    openNotePopoverForExisting(annotationId) {
        const annotation = this.annotations.find(item => item.id === annotationId);
        if (!annotation || !this.notePopover) return;
        this.pendingAnnotation = null;
        this.editingAnnotationId = annotationId;
        this.notePopover.querySelector('.note-popover-title').textContent = 'Edit Note';
        this.notePopover.querySelector('.note-popover-excerpt').textContent = annotation.text;
        this.notePopover.querySelector('.note-popover-textarea').value = annotation.note || '';

        const target = document.querySelector(`.blog-annotation[data-annotation-id="${annotationId}"]`);
        const rect = target ? target.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 1, height: 1 };
        this.positionFloatingElement(this.notePopover, rect, 'bottom');
        this.notePopover.classList.add('visible');
        this.notePopover.setAttribute('aria-hidden', 'false');
        this.hideNotePreview();
        this.notePopover.querySelector('.note-popover-textarea').focus();
    }

    showNotePopoverNearSelection() {
        if (!this.notePopover) return;
        const selection = window.getSelection();
        const rect = selection && selection.rangeCount ? selection.getRangeAt(0).getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 1, height: 1 };
        this.positionFloatingElement(this.notePopover, rect, 'bottom');
        this.notePopover.classList.add('visible');
        this.notePopover.setAttribute('aria-hidden', 'false');
        this.notePopover.querySelector('.note-popover-textarea').focus();
    }

    saveNotePopover() {
        if (!this.notePopover) return;
        const textarea = this.notePopover.querySelector('.note-popover-textarea');
        const note = textarea ? textarea.value.trim() : '';
        if (!note) {
            this.showNotification('Please enter a note.', 'error');
            return;
        }

        if (this.editingAnnotationId) {
            const annotation = this.annotations.find(item => item.id === this.editingAnnotationId);
            if (annotation) {
                annotation.note = note;
                annotation.updatedAt = new Date().toISOString();
                this.saveAnnotations();
                this.renderAnnotatedContent();
                this.renderReadingNotes();
                this.hideNotePopover();
                this.showNotification('Note updated.', 'success');
            }
            return;
        }

        this.createAnnotationFromSelection(note);
    }

    hideNotePopover() {
        if (!this.notePopover) return;
        this.notePopover.classList.remove('visible');
        this.notePopover.setAttribute('aria-hidden', 'true');
        this.pendingAnnotation = null;
        this.editingAnnotationId = null;
    }

    handleContentClick(event) {
        const target = event.target.closest('.blog-annotation');
        if (!target) return;
        const annotation = this.annotations.find(item => item.id === target.dataset.annotationId);
        if (annotation) this.showAnnotationPreview(annotation, target.getBoundingClientRect());
    }

    showAnnotationPreview(annotation, rect) {
        if (!this.notePreview) return;
        this.notePreview.dataset.annotationId = annotation.id;
        this.notePreview.querySelector('.note-popover-text').textContent = annotation.note || 'Highlight';
        this.notePreview.querySelector('.note-popover-meta').textContent = this.formatDate(annotation.updatedAt || annotation.createdAt);
        this.positionFloatingElement(this.notePreview, rect, 'bottom');
        this.notePreview.classList.add('visible');
        this.notePreview.setAttribute('aria-hidden', 'false');
        this.hideNotePopover();
    }

    hideNotePreview() {
        if (!this.notePreview) return;
        this.notePreview.classList.remove('visible');
        this.notePreview.setAttribute('aria-hidden', 'true');
    }

    handleAnnotationDocumentClick(event) {
        const insideToolbar = event.target.closest('.selection-toolbar');
        const insidePopover = event.target.closest('.note-popover');
        const insidePreview = event.target.closest('.note-preview');
        const insideAnnotation = event.target.closest('.blog-annotation');
        if (!insideToolbar && !insidePopover) {
            this.hideSelectionToolbar();
        }
        if (!insidePopover && !insidePreview && !insideAnnotation) {
            this.hideNotePreview();
        }
    }

    renderAnnotatedContent() {
        if (!this.blog) return;
        const content = document.getElementById('blogContent');
        if (!content) return;
        content.innerHTML = this.blog.content;
        this.applyAnnotations();
    }

    applyAnnotations() {
        const content = document.getElementById('blogContent');
        if (!content || !this.annotations.length) return;

        [...this.annotations]
            .sort((a, b) => b.start - a.start)
            .forEach(annotation => this.wrapAnnotationRange(content, annotation));
    }

    wrapAnnotationRange(root, annotation) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: node => {
                if (node.parentElement?.closest('.blog-annotation')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        let cursor = 0;
        let node;

        while ((node = walker.nextNode())) {
            const length = node.nodeValue.length;
            const nodeStart = cursor;
            const nodeEnd = cursor + length;
            if (nodeEnd > annotation.start && nodeStart < annotation.end) {
                nodes.push({ node, nodeStart, nodeEnd });
            }
            cursor = nodeEnd;
            if (cursor >= annotation.end) break;
        }

        nodes.reverse().forEach(({ node, nodeStart }) => {
            const localStart = Math.max(0, annotation.start - nodeStart);
            const localEnd = Math.min(node.nodeValue.length, annotation.end - nodeStart);
            if (localStart >= localEnd) return;

            const range = document.createRange();
            range.setStart(node, localStart);
            range.setEnd(node, localEnd);
            const span = document.createElement('span');
            span.className = `blog-annotation ${annotation.note ? 'has-note' : 'is-highlight'}`;
            span.dataset.annotationId = annotation.id;
            span.tabIndex = 0;
            span.setAttribute('role', 'button');
            span.setAttribute('aria-label', annotation.note ? 'Open reading note' : 'Open highlight');
            range.surroundContents(span);
        });
    }

    renderReadingNotes() {
        this.ensureReadingNotesSection();
        const section = document.querySelector('.reading-notes');
        if (!section) return;

        const empty = section.querySelector('.reading-notes-empty');
        const list = section.querySelector('.reading-notes-list');
        const clearButton = section.querySelector('.reading-notes-clear');
        const sorted = [...this.annotations].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

        if (clearButton) clearButton.style.display = sorted.length ? 'inline-flex' : 'none';
        if (empty) empty.style.display = sorted.length ? 'none' : 'block';
        if (!list) return;

        list.innerHTML = sorted.map(annotation => `
            <li class="reading-notes-item" data-annotation-id="${annotation.id}">
                <div class="note-excerpt">${this.escapeHTML(annotation.text)}</div>
                <div class="note-text">${this.escapeHTML(annotation.note || 'Highlight')}</div>
                <footer>
                    <time>${this.formatDate(annotation.updatedAt || annotation.createdAt)}</time>
                    <span class="note-actions">
                        <button type="button" data-note-list-action="jump">Jump</button>
                        <button type="button" data-note-list-action="edit">Edit</button>
                        <button type="button" data-note-list-action="delete">Delete</button>
                    </span>
                </footer>
            </li>
        `).join('');
    }

    handleReadingNotesClick(event) {
        const clearButton = event.target.closest('.reading-notes-clear');
        if (clearButton) {
            this.annotations = [];
            this.saveAnnotations();
            this.renderAnnotatedContent();
            this.renderReadingNotes();
            this.hideNotePreview();
            this.hideNotePopover();
            return;
        }

        const action = event.target.closest('[data-note-list-action]')?.dataset.noteListAction;
        const item = event.target.closest('.reading-notes-item');
        if (!action || !item) return;
        const annotationId = item.dataset.annotationId;
        if (action === 'jump') this.jumpToAnnotation(annotationId);
        if (action === 'edit') this.openNotePopoverForExisting(annotationId);
        if (action === 'delete') this.deleteAnnotation(annotationId);
    }

    jumpToAnnotation(annotationId) {
        const target = document.querySelector(`.blog-annotation[data-annotation-id="${annotationId}"]`);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('is-focused');
        setTimeout(() => target.classList.remove('is-focused'), 1400);
    }

    deleteAnnotation(annotationId) {
        this.annotations = this.annotations.filter(item => item.id !== annotationId);
        this.saveAnnotations();
        this.renderAnnotatedContent();
        this.renderReadingNotes();
        this.hideNotePreview();
        this.hideNotePopover();
        this.showNotification('Note deleted.', 'success');
    }

    clearNativeSelection() {
        const selection = window.getSelection();
        if (selection) selection.removeAllRanges();
        this.activeSelection = null;
    }

    positionFloatingElement(element, rect, placement = 'bottom') {
        if (!element || !rect) return;
        element.style.display = 'flex';
        const margin = 12;
        const width = element.offsetWidth || 280;
        const height = element.offsetHeight || 48;
        const left = Math.min(
            Math.max(margin, rect.left + rect.width / 2 - width / 2),
            window.innerWidth - width - margin
        );
        const preferredTop = placement === 'top' ? rect.top - height - 10 : rect.bottom + 10;
        const top = Math.min(
            Math.max(margin, preferredTop),
            window.innerHeight - height - margin
        );
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
    }
    
    // Interactive Functions
    toggleLike() {
        this.liked = !this.liked;
        const likeBtn = document.getElementById('likeBtn');
        const likeCount = document.getElementById('likeCount');
        
        if (this.liked) {
            likeBtn.style.backgroundColor = 'var(--primary-blue)';
            likeBtn.style.color = 'var(--white)';
            likeCount.textContent = parseInt(likeCount.textContent) + 1;
        } else {
            likeBtn.style.backgroundColor = '';
            likeBtn.style.color = '';
            likeCount.textContent = parseInt(likeCount.textContent) - 1;
        }
    }
    
    toggleBookmark() {
        this.bookmarked = !this.bookmarked;
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        
        if (this.bookmarked) {
            bookmarkBtn.style.backgroundColor = 'var(--primary-blue)';
            bookmarkBtn.style.color = 'var(--white)';
            bookmarkBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg><span>Bookmarked</span>';
        } else {
            bookmarkBtn.style.backgroundColor = '';
            bookmarkBtn.style.color = '';
            bookmarkBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg><span>Bookmark</span>';
        }
    }
    
    shareBlog() {
        if (navigator.share) {
            navigator.share({
                title: this.blog.title,
                text: this.blog.excerpt,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('Link copied to clipboard!', 'success');
            });
        }
    }
    
    handleCommentSubmit(e) {
        e.preventDefault();
        const commentInput = e.target.querySelector('.comment-input');
        const comment = commentInput.value.trim();
        
        if (!comment) {
            this.showNotification('Please enter a comment.', 'error');
            return;
        }
        
        // Add top-level comment into nested model
        const newComment = {
            id: this.getNextCommentId(),
            author: 'You',
            date: new Date().toISOString(),
            content: comment,
            likes: 0,
            replies: []
        };
        this.comments.unshift(newComment);
        this.saveStoredComments();
        this.renderComments();
        this.showNotification('Comment posted successfully!', 'success');
        commentInput.value = '';
    }

    // Delegated events for reply
    bindCommentEvents() {
        const container = document.getElementById('commentsList');
        if (!container) return;
        container.removeEventListener('click', this._commentClickHandler);
        this._commentClickHandler = (e) => {
            const likeBtn = e.target.closest('.comment-like-btn');
            if (likeBtn) {
                const id = parseInt(likeBtn.dataset.commentId || '0', 10);
                this.toggleCommentLike(id);
                return;
            }
            const replyBtn = e.target.closest('.comment-reply-btn');
            if (replyBtn) {
                const root = replyBtn.closest('.comment');
                if (root) this.toggleReplyForm(root);
                return;
            }
            const showMoreBtn = e.target.closest('.show-more-replies');
            if (showMoreBtn) {
                const id = parseInt(showMoreBtn.dataset.commentId || '0', 10);
                const current = this.repliesVisibleCountById[id] ?? this.repliesPageSize;
                this.repliesVisibleCountById[id] = current + this.repliesPageSize;
                this.renderComments();
                return;
            }
            const submitBtn = e.target.closest('.reply-submit-btn');
            if (submitBtn) {
                const form = submitBtn.closest('.reply-form');
                if (form) this.submitReplyForm(form);
                return;
            }
            const cancelBtn = e.target.closest('.reply-cancel-btn');
            if (cancelBtn) {
                const form = cancelBtn.closest('.reply-form');
                if (form) form.remove();
                return;
            }
        };
        container.addEventListener('click', this._commentClickHandler);
    }

    getLikedCommentIds() {
        try {
            const raw = localStorage.getItem(this.likedCommentIdsKey);
            const arr = raw ? JSON.parse(raw) : [];
            return new Set(Array.isArray(arr) ? arr : []);
        } catch (e) {
            return new Set();
        }
    }

    saveLikedCommentIds() {
        try {
            localStorage.setItem(this.likedCommentIdsKey, JSON.stringify(Array.from(this.likedCommentIds)));
        } catch (e) {
            // no-op
        }
    }

    toggleCommentLike(id) {
        if (!this.isLoggedIn()) {
            this.showNotification('Please log in to like comments.', 'error');
            return;
        }
        const liked = this.likedCommentIds.has(id);
        this.updateCommentById(this.comments, id, (c) => {
            const current = c.likes || 0;
            c.likes = liked ? Math.max(0, current - 1) : current + 1;
        });
        if (liked) this.likedCommentIds.delete(id); else this.likedCommentIds.add(id);
        this.saveLikedCommentIds();
        this.saveStoredComments();
        // resort siblings of the updated node's parent by likes for visible slice
        this.renderComments();
    }

    updateCommentById(list, targetId, updater) {
        for (let i = 0; i < list.length; i++) {
            const c = list[i];
            if (c.id === targetId) {
                updater(c);
                return true;
            }
            if (c.replies && c.replies.length) {
                const found = this.updateCommentById(c.replies, targetId, updater);
                if (found) return true;
            }
        }
        return false;
    }

    isLoggedIn() {
        try {
            const raw = localStorage.getItem('blogxiv_user');
            if (!raw) return false;
            const user = JSON.parse(raw);
            return !!(user && (user.email || user.name));
        } catch (e) {
            return false;
        }
    }

    toggleReplyForm(commentEl) {
        const existing = commentEl.querySelector('.reply-form');
        if (existing) {
            existing.remove();
            return;
        }
        const form = document.createElement('div');
        form.className = 'reply-form';
        form.innerHTML = `
            <textarea class="reply-input" placeholder="Write a reply..." rows="3"></textarea>
            <div class="reply-actions">
                <button class="btn btn-primary reply-submit-btn">Reply</button>
                <button class="btn btn-outline reply-cancel-btn" type="button">Cancel</button>
            </div>
        `;
        const actions = commentEl.querySelector('.comment-actions');
        if (actions) {
            actions.insertAdjacentElement('afterend', form);
        } else {
            commentEl.appendChild(form);
        }
    }

    submitReplyForm(formEl) {
        const commentEl = formEl.closest('.comment');
        const parentId = parseInt(commentEl?.dataset.commentId || '0', 10);
        const depth = parseInt(commentEl?.dataset.depth || '0', 10);
        if (depth >= (this.maxReplyDepth - 1)) {
            this.showNotification('Reply depth limit reached.', 'error');
            formEl.remove();
            return;
        }
        const textarea = formEl.querySelector('.reply-input');
        const text = textarea ? textarea.value.trim() : '';
        if (!text) {
            this.showNotification('Please enter a reply.', 'error');
            return;
        }
        const reply = {
            id: this.getNextCommentId(),
            author: 'You',
            date: new Date().toISOString(),
            content: text,
            likes: 0,
            replies: []
        };
        this.addReplyById(this.comments, parentId, reply);
        this.saveStoredComments();
        this.renderComments();
        this.showNotification('Reply posted!', 'success');
    }

    addReplyById(list, targetId, reply) {
        for (let i = 0; i < list.length; i++) {
            const c = list[i];
            if (c.id === targetId) {
                c.replies = c.replies || [];
                c.replies.push(reply);
                return true;
            }
            if (c.replies && c.replies.length) {
                const found = this.addReplyById(c.replies, targetId, reply);
                if (found) return true;
            }
        }
        return false;
    }
    
    // Utility Functions
    formatDate(dateString) {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;
        const now = new Date();
        const diffTime = now - date;
        const oneDay = 1000 * 60 * 60 * 24;
        const diffDays = Math.floor(Math.abs(diffTime) / oneDay);
        
        if (Math.abs(diffTime) < oneDay) return diffTime >= 0 ? 'Today' : 'Tomorrow';
        if (diffTime < 0) return date.toLocaleDateString();
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
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h2>Error</h2>
            <p>${message}</p>
            <a href="index.html" class="btn btn-primary">Go Home</a>
        `;
        
        document.querySelector('.blog-detail-container').innerHTML = '';
        document.querySelector('.blog-detail-container').appendChild(errorDiv);
    }
}

// Initialize the blog detail page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogDetail();
});
