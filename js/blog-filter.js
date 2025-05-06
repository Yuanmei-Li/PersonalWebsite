document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 1. 加载文章数据
        const response = await fetch('/data/posts.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        // 2. 渲染文章
        renderPosts(data.posts);
        
        // 3. 初始化筛选和分页
        initFilters(data.posts);
        
        // 4. 初始化图片查看器
        initImageViewer();
        
    } catch (error) {
        console.error('Failed to load blog data:', error);
        document.querySelector('.blog-posts').innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load posts. Please try again later.</p>
            </div>
        `;
    }
});

function renderPosts(posts) {
    const container = document.querySelector('.blog-posts');
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postEl = document.createElement('article');
        postEl.className = 'blog-post';
        postEl.dataset.id = post.id;
        postEl.dataset.tags = post.tags.join(',');
        postEl.dataset.categories = post.categories.join(',');
        
        // 构建图片HTML
        const imagesHTML = post.images?.length ? `
            <div class="post-image-gallery">
                <div class="gallery-grid">
                    ${post.images.map(img => `
                        <div class="gallery-item">
                            <img src="${img.src}" alt="${img.alt || ''}" 
                                 data-caption="${img.caption || ''}">
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';
        
        postEl.innerHTML = `
            <div class="post-header">
                <h2>${post.title}</h2>
                <div class="post-meta">
                    <span class="post-date"><i class="far fa-calendar"></i> ${post.date}</span>
                    <span class="post-category"><i class="fas fa-tag"></i> ${post.categories.join(', ')}</span>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${imagesHTML}
                <div class="post-footer">
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <a href="#" class="btn-secondary read-more">Continue Reading</a>
                </div>
            </div>
        `;
        
        container.appendChild(postEl);
    });
    
    // 添加分页控件
    addPagination(posts.length);
}

function initFilters(allPostsData) {
    const allPosts = Array.from(document.querySelectorAll('.blog-post'));
    let filteredPosts = [...allPosts];
    let currentPage = 1;
    
    // 分类筛选
    document.querySelectorAll('.category-filter a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            filterPosts(category, 'categories');
            setActiveFilter(this, '.category-filter');
        });
    });
    
    // 标签筛选
    document.querySelectorAll('.tag-cloud-filter a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tag = this.dataset.tag;
            filterPosts(tag, 'tags');
            setActiveFilter(this, '.tag-cloud-filter');
        });
    });
    
    function filterPosts(value, type) {
        currentPage = 1;
        
        filteredPosts = allPosts.filter(post => {
            const postId = parseInt(post.dataset.id);
            const postData = allPostsData.find(p => p.id === postId);
            
            if (!value || value === 'all') return true;
            
            if (type === 'categories') {
                return postData.categories.some(cat => 
                    cat.toLowerCase() === value.toLowerCase());
            } else {
                return postData.tags.some(t => 
                    t.toLowerCase() === value.toLowerCase());
            }
        });
        
        updateDisplay();
    }
    
    function updateDisplay() {
        allPosts.forEach(post => post.style.display = 'none');
        
        const startIdx = (currentPage - 1) * 5;
        filteredPosts.slice(startIdx, startIdx + 5).forEach(post => {
            post.style.display = 'block';
        });
        
        updatePagination();
    }
    
    function updatePagination() {
        const totalPages = Math.ceil(filteredPosts.length / 5);
        document.getElementById('pageIndicator').textContent = 
            `Page ${currentPage} of ${totalPages}`;
        
        document.getElementById('prevPage').disabled = currentPage <= 1;
        document.getElementById('nextPage').disabled = currentPage >= totalPages;
    }
    
    function setActiveFilter(element, parentSelector) {
        document.querySelectorAll(`${parentSelector} a`).forEach(el => {
            el.classList.remove('active');
        });
        element.classList.add('active');
    }
    
    // 分页按钮事件
    document.getElementById('prevPage')?.addEventListener('click', () => {
        if(currentPage > 1) {
            currentPage--;
            updateDisplay();
        }
    });
    
    document.getElementById('nextPage')?.addEventListener('click', () => {
        if(currentPage < Math.ceil(filteredPosts.length / 5)) {
            currentPage++;
            updateDisplay();
        }
    });
    
    updateDisplay();
}

function initImageViewer() {
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer';
    viewer.innerHTML = `
        <span class="close-viewer">&times;</span>
        <div class="image-viewer-content">
            <img src="" alt="">
            <p class="image-viewer-caption"></p>
        </div>
    `;
    document.body.appendChild(viewer);
    
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.addEventListener('click', () => {
            const viewerImg = viewer.querySelector('img');
            const caption = viewer.querySelector('.image-viewer-caption');
            
            viewerImg.src = img.src;
            viewerImg.alt = img.alt;
            caption.textContent = img.dataset.caption || '';
            
            viewer.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    viewer.querySelector('.close-viewer').addEventListener('click', () => {
        viewer.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    viewer.addEventListener('click', (e) => {
        if(e.target === viewer) {
            viewer.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function addPagination(totalPosts) {
    const container = document.querySelector('.blog-posts');
    container.insertAdjacentHTML('beforeend', `
        <div class="pagination-controls">
            <button id="prevPage" class="btn-secondary" disabled>
                <i class="fas fa-chevron-left"></i>
            </button>
            <span id="pageIndicator">Page 1 of ${Math.ceil(totalPosts / 5)}</span>
            <button id="nextPage" class="btn-secondary" ${totalPosts <= 5 ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `);
}