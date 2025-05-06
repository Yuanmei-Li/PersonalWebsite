

// Update Last Modified Date
function updateLastModified() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const updateDate = new Date().toLocaleDateString('en-US', options);
    document.getElementById('update-date').textContent = updateDate;
}

// Initialize all functions when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initWaveBackground();
    updateLastModified();
    
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add active class to current page in navigation
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (currentPage === linkPage) {
            link.classList.add('active');
        }
    });
});


// Console welcome message
console.log('%cWelcome to Yuanmei Li\'s Research Portfolio', 'color: #3e92cc; font-size: 16px;');
console.log('%cExploring hydrodynamic quantum analogs since 2022', 'color: #daffef;');
// 分页功能
document.addEventListener('DOMContentLoaded', function() {
    const posts = document.querySelectorAll('.blog-post');
    const itemsPerPage = 5;
    let currentPage = 1;
    
    // 只在文章数量超过每页显示数量时初始化分页
    if(posts.length > itemsPerPage) {
        const totalPages = Math.ceil(posts.length / itemsPerPage);
        const paginationControls = document.querySelector('.pagination-controls');
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        const pageIndicator = document.getElementById('pageIndicator');

        function updatePagination() {
            // 更新页面指示器
            pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
            
            // 更新按钮状态
            prevButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage === totalPages;
            
            // 显示/隐藏文章
            posts.forEach((post, index) => {
                const shouldShow = index >= (currentPage - 1) * itemsPerPage && 
                                 index < currentPage * itemsPerPage;
                post.style.display = shouldShow ? 'block' : 'none';
            });
            
            // 触发布局更新（用于动画）
            void document.body.offsetHeight;
        }

        prevButton.addEventListener('click', () => {
            if(currentPage > 1) {
                currentPage--;
                updatePagination();
            }
        });

        nextButton.addEventListener('click', () => {
            if(currentPage < totalPages) {
                currentPage++;
                updatePagination();
            }
        });

        // 初始状态隐藏多余文章
        posts.forEach((post, index) => {
            if(index >= itemsPerPage) post.style.display = 'none';
        });
        
        // 显示分页控件
        paginationControls.style.display = 'flex';
    } else {
        // 隐藏分页控件
        document.querySelector('.pagination-controls').style.display = 'none';
    }
    
});

document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("theme-toggle");
    const icon = toggleBtn.querySelector("i");
  
    function setThemeIcon(theme) {
      if (theme === "night") {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
      } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
      }
    }
  
    function toggleTheme() {
      const body = document.body; // 关键修改：改为操作body元素
      const isDay = body.classList.contains("day-mode");
      const newTheme = isDay ? "night" : "day";
  
      body.classList.toggle("day-mode", !isDay);
      body.classList.toggle("night-mode", isDay);
      localStorage.setItem("theme", newTheme);
      setThemeIcon(newTheme);
    }
  
    const savedTheme = localStorage.getItem("theme") || "day";
    document.body.classList.add(`${savedTheme}-mode`);  // 关键修改：将主题类添加到body
    setThemeIcon(savedTheme);
    toggleBtn.addEventListener("click", toggleTheme);
});

// 添加到 main.js
window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    document.querySelectorAll('.hero-image img, .profile-photo').forEach(el => {
        el.style.transform = `translateY(${scrollY * 0.2}px)`;
    });
    
    document.querySelectorAll('.glass-container').forEach(el => {
        el.style.transform = `translateY(${scrollY * 0.05}px)`;
    });
});

// 自动激活当前页面导航项
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkPage = link.getAttribute('href');
      if (currentPage === linkPage) {
        link.classList.add('active');
        
        // 可选：同时激活父级<li>（如果存在）
        link.closest('li')?.classList.add('active-item');
      }
    });
  });

// 图片查看器功能
document.addEventListener('DOMContentLoaded', function() {
    // 创建图片查看器元素
    const imageViewer = document.createElement('div');
    imageViewer.className = 'image-viewer';
    imageViewer.innerHTML = `
        <span class="close-viewer">&times;</span>
        <div class="image-viewer-content">
            <img src="" alt="">
            <p class="image-viewer-caption"></p>
        </div>
    `;
    document.body.appendChild(imageViewer);
    
    const viewerImg = imageViewer.querySelector('img');
    const viewerCaption = imageViewer.querySelector('.image-viewer-caption');
    const closeBtn = imageViewer.querySelector('.close-viewer');
    
    // 为所有图片添加点击事件
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.addEventListener('click', function() {
            viewerImg.src = this.src;
            viewerImg.alt = this.alt;
            viewerCaption.textContent = this.dataset.caption || '';
            imageViewer.classList.add('active');
            document.body.style.overflow = 'hidden'; // 防止滚动
        });
    });
    
    // 关闭查看器
    closeBtn.addEventListener('click', function() {
        imageViewer.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // 点击背景关闭
    imageViewer.addEventListener('click', function(e) {
        if (e.target === imageViewer) {
            imageViewer.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

