document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 1. 加载文章数据
        const response = await fetch('/PersonalWebsite/data/posts.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch post data. HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.posts ||!Array.isArray(data.posts)) {
            throw new Error('Invalid post data format. Expected an object with a "posts" array.');
        }
        
        // 2. 渲染文章
        renderPosts(data.posts);
        
        // 3. 初始化筛选和分页
        initFilters(data.posts);
        
        // 4. 初始化图片查看器
        initImageViewer();
        
    } catch (error) {
        console.error('Failed to load blog data:', error);
        const errorMessage = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load posts. ${error.message}</p>
            </div>
        `;
        document.querySelector('.blog-posts').innerHTML = errorMessage;
    }
});

function renderPosts(posts) {
    try {
        const container = document.querySelector('.blog-posts');
        if (!container) {
            throw new Error('Could not find the blog posts container element.');
        }
        container.innerHTML = '';
        
        posts.forEach(post => {
            if (!post.id ||!post.title ||!post.date ||!post.categories ||!post.tags ||!post.content) {
                throw new Error(`Invalid post data. Missing required fields in post with id ${post.id}`);
            }
            const postEl = document.createElement('article');
            postEl.className = 'blog-post';
            postEl.dataset.id = post.id;
            postEl.dataset.tags = post.tags.join(',');
            postEl.dataset.categories = post.categories.join(',');
            
            // 构建图片HTML
            const imagesHTML = post.images?.length ? `
                <div class="post-image-gallery">
                    <div class="gallery-grid">
                        ${post.images.map(img => {
                            if (!img.src) {
                                throw new Error(`Invalid image data in post with id ${post.id}. Missing "src" field.`);
                            }
                            return `
                                <div class="gallery-item">
                                    <img src="${img.src}" alt="${img.alt || ''}" 
                                         data-caption="${img.caption || ''}">
                                </div>
                            `;
                        }).join('')}
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
    } catch (error) {
        console.error('Failed to render posts:', error);
        const errorMessage = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to render posts. ${error.message}</p>
            </div>
        `;
        document.querySelector('.blog-posts').innerHTML = errorMessage;
    }
}

function initFilters(allPostsData) {
    try {
        const allPosts = Array.from(document.querySelectorAll('.blog-post'));
        if (allPosts.length === 0) {
            throw new Error('No blog posts found for filtering.');
        }
        let filteredPosts = [...allPosts];
        let currentPage = 1;
        
        // 分类筛选
        const categoryLinks = document.querySelectorAll('.category-filter a');
        if (categoryLinks.length === 0) {
            throw new Error('No category filter links found.');
        }
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.dataset.category;
                if (!category) {
                    throw new Error('Missing "data-category" attribute on category filter link.');
                }
                filterPosts(category, 'categories');
                setActiveFilter(this, '.category-filter');
            });
        });
        
        // 标签筛选
        const tagLinks = document.querySelectorAll('.tag-cloud-filter a');
        if (tagLinks.length === 0) {
            throw new Error('No tag filter links found.');
        }
        tagLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const tag = this.dataset.tag;
                if (!tag) {
                    throw new Error('Missing "data-tag" attribute on tag filter link.');
                }
                filterPosts(tag, 'tags');
                setActiveFilter(this, '.tag-cloud-filter');
            });
        });
        
        function filterPosts(value, type) {
            try {
                currentPage = 1;
                
                filteredPosts = allPosts.filter(post => {
                    const postId = parseInt(post.dataset.id);
                    const postData = allPostsData.find(p => p.id === postId);
                    if (!postData) {
                        throw new Error(`Could not find post data for post with id ${postId}`);
                    }
                    
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
            } catch (error) {
                console.error('Failed to filter posts:', error);
            }
        }
        
        function updateDisplay() {
            try {
                allPosts.forEach(post => post.style.display = 'none');
                
                const startIdx = (currentPage - 1) * 5;
                filteredPosts.slice(startIdx, startIdx + 5).forEach(post => {
                    post.style.display = 'block';
                });
                
                updatePagination();
            } catch (error) {
                console.error('Failed to update post display:', error);
            }
        }
        
        function updatePagination() {
            try {
                const totalPages = Math.ceil(filteredPosts.length / 5);
                const pageIndicator = document.getElementById('pageIndicator');
                if (!pageIndicator) {
                    throw new Error('Could not find the page indicator element.');
                }
                pageIndicator.textContent = 
                    `Page ${currentPage} of ${totalPages}`;
                
                const prevPageButton = document.getElementById('prevPage');
                if (!prevPageButton) {
                    throw new Error('Could not find the previous page button element.');
                }
                prevPageButton.disabled = currentPage <= 1;
                
                const nextPageButton = document.getElementById('nextPage');
                if (!nextPageButton) {
                    throw new Error('Could not find the next page button element.');
                }
                nextPageButton.disabled = currentPage >= totalPages;
            } catch (error) {
                console.error('Failed to update pagination:', error);
            }
        }
        
        function setActiveFilter(element, parentSelector) {
            try {
                const links = document.querySelectorAll(`${parentSelector} a`);
                if (links.length === 0) {
                    throw new Error(`No links found in ${parentSelector}`);
                }
                links.forEach(el => {
                    el.classList.remove('active');
                });
                element.classList.add('active');
            } catch (error) {
                console.error('Failed to set active filter:', error);
            }
        }
        
        // 分页按钮事件
        const prevPageButton = document.getElementById('prevPage');
        if (prevPageButton) {
            prevPageButton.addEventListener('click', () => {
                if(currentPage > 1) {
                    currentPage--;
                    updateDisplay();
                }
            });
        } else {
            console.error('Could not find the previous page button element.');
        }
        
        const nextPageButton = document.getElementById('nextPage');
        if (nextPageButton) {
            nextPageButton.addEventListener('click', () => {
                if(currentPage < Math.ceil(filteredPosts.length / 5)) {
                    currentPage++;
                    updateDisplay();
                }
            });
        } else {
            console.error('Could not find the next page button element.');
        }
        
        updateDisplay();
    } catch (error) {
        console.error('Failed to initialize filters:', error);
    }
}

function initImageViewer() {
    try {
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
        
        const galleryImages = document.querySelectorAll('.gallery-item img');
        if (galleryImages.length === 0) {
            throw new Error('No gallery images found for image viewer.');
        }
        galleryImages.forEach(img => {
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
        
        const closeButton = viewer.querySelector('.close-viewer');
        if (!closeButton) {
            throw new Error('Could not find the close button for the image viewer.');
        }
        closeButton.addEventListener('click', () => {
            viewer.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        viewer.addEventListener('click', (e) => {
            if(e.target === viewer) {
                viewer.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    } catch (error) {
        console.error('Failed to initialize image viewer:', error);
    }
}

function addPagination(totalPosts) {
    try {
        const container = document.querySelector('.blog-posts');
        if (!container) {
            throw new Error('Could not find the blog posts container element for pagination.');
        }
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
    } catch (error) {
        console.error('Failed to add pagination:', error);
    }
}
