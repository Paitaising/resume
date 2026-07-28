/**
 * 张笑源 - 个人介绍网站
 * 交互脚本
 * 版本: 1.0.0
 */

(function() {
    'use strict';

    // 错误处理
    window.onerror = function(msg, url, line, col, error) {
        console.error('JavaScript Error:', msg, 'at', url, 'line', line);
        return false;
    };

    // 检查浏览器兼容性
    var isModernBrowser = 'querySelector' in document &&
                          'addEventListener' in window &&
                          'classList' in document.createElement('div');

    if (!isModernBrowser) {
        console.warn('当前浏览器可能不支持所有功能，建议使用现代浏览器');
    }

    // ==================== 工具函数（外层作用域） ====================

    // 安全的DOM查询（供所有事件处理器使用）
    function safeQuerySelector(selector) {
        try {
            return document.querySelector(selector);
        } catch (e) {
            console.warn('Selector error:', selector, e);
            return null;
        }
    }

    function safeQuerySelectorAll(selector) {
        try {
            return document.querySelectorAll(selector);
        } catch (e) {
            console.warn('Selector error:', selector, e);
            return [];
        }
    }

    // 节流函数
    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    // 防抖函数
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    // ==================== 导航菜单功能 ====================

    var navToggle = safeQuerySelector('.nav-toggle');
    var navMenu = safeQuerySelector('.nav-menu');
    var navLinks = safeQuerySelectorAll('.nav-link');
    var navbar = safeQuerySelector('.navbar');

    // 移动端汉堡菜单切换
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
    }

    // 点击导航链接后关闭移动菜单
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (navToggle) navToggle.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    });

    // 点击页面其他区域关闭移动菜单
    document.addEventListener('click', function(e) {
        if (navMenu && navToggle) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        }
    });

    // ==================== 导航高亮功能 ====================

    var sections = safeQuerySelectorAll('section[id], header[id]');

    function updateActiveNav() {
        var scrollPosition = window.scrollY + 150;

        sections.forEach(function(section) {
            var sectionTop = section.offsetTop;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(function(link) {
                    link.classList.remove('active');
                });

                var activeLink = safeQuerySelector('.nav-link[href="#' + sectionId + '"]');
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }

    // 使用节流优化滚动监听
    window.addEventListener('scroll', throttle(updateActiveNav, 100));
    updateActiveNav();

    // ==================== 导航栏滚动效果 ====================

    var lastScrollTop = 0;
    var scrollThreshold = 100;

    window.addEventListener('scroll', throttle(function() {
        var scrollTop = window.scrollY;

        if (!navbar) return;

        // 添加滚动状态类
        if (scrollTop > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // 智能隐藏/显示导航栏（向下滚动隐藏，向上滚动显示）
        if (scrollTop > scrollThreshold) {
            if (scrollTop > lastScrollTop + 5) {
                navbar.style.transform = 'translateY(-100%)';
            } else if (scrollTop < lastScrollTop - 5) {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    }, 100));

    // ==================== 返回顶部按钮 ====================

    var backToTopButton = document.getElementById('backToTop');

    function toggleBackToTop() {
        if (backToTopButton) {
            if (window.scrollY > 400) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }
    }

    window.addEventListener('scroll', throttle(toggleBackToTop, 100));

    if (backToTopButton) {
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==================== 平滑滚动增强 ====================

    safeQuerySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var targetId = this.getAttribute('href');
            var targetElement = safeQuerySelector(targetId);

            if (targetElement) {
                var navbarHeight = navbar ? navbar.offsetHeight : 72;
                var offsetTop = targetElement.offsetTop - navbarHeight;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==================== Intersection Observer 动画 ====================

    // 检查浏览器是否支持 IntersectionObserver
    if ('IntersectionObserver' in window) {
        var observerOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.1
        };

        var animationObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var element = entry.target;
                    element.classList.add('animate-visible');

                    var delay = element.getAttribute('data-delay');
                    if (delay) {
                        element.style.animationDelay = delay + 'ms';
                    }

                    animationObserver.unobserve(element);
                }
            });
        }, observerOptions);

        var animateElements = safeQuerySelectorAll(
            '.education-card, .skill-category, .project-card, .contact-item, .section-header'
        );

        animateElements.forEach(function(element, index) {
            element.classList.add('animate-on-scroll');
            element.setAttribute('data-delay', (index % 3) * 100);
            animationObserver.observe(element);
        });
    } else {
        // 降级处理：直接显示所有元素
        safeQuerySelectorAll('.animate-on-scroll').forEach(function(el) {
            el.classList.add('animate-visible');
        });
    }

    // ==================== 数字计数动画 ====================

    function animateCounter(element, target, duration) {
        var startTime = null;
        var hasPlus = target.toString().includes('+');
        var numericTarget = parseInt(target.toString().replace('+', ''));

        if (isNaN(numericTarget)) return;

        function update(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var easeProgress = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(easeProgress * numericTarget);

            element.textContent = current + (hasPlus ? '+' : '');

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    if ('IntersectionObserver' in window) {
        var statNumbers = safeQuerySelectorAll('.stat-number');

        var statObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var element = entry.target;
                    var targetValue = element.textContent;
                    animateCounter(element, targetValue, 2000);
                    statObserver.unobserve(element);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(function(stat) {
            statObserver.observe(stat);
        });
    }

    // ==================== 导航栏滚动进度条 ====================

    var progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    function updateScrollProgress() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = scrollPercent + '%';
    }

    window.addEventListener('scroll', throttle(updateScrollProgress, 50));

    // ==================== 卡片倾斜效果（仅桌面端） ====================

    if (window.matchMedia('(hover: hover)').matches) {
        var cards = safeQuerySelectorAll('.project-card, .skill-category, .contact-item');

        cards.forEach(function(card) {
            card.addEventListener('mousemove', function(e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                var centerX = rect.width / 2;
                var centerY = rect.height / 2;
                var rotateX = (y - centerY) / 20;
                var rotateY = (centerX - x) / 20;

                card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
            });

            card.addEventListener('mouseleave', function() {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // ==================== 键盘快捷键 ====================

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (navToggle) navToggle.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        }

        if (e.key === 'Home' && !e.ctrlKey) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // ==================== 性能优化 ====================

    // 页面可见性变化时暂停/恢复动画
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            document.body.classList.add('page-hidden');
        } else {
            document.body.classList.remove('page-hidden');
        }
    });

    // ==================== 控制台输出 ====================

    console.log('%c张笑源 - 个人介绍网站', 'color: #2563EB; font-size: 20px; font-weight: bold;');
    console.log('%c技术栈: HTML5 + CSS3 + JavaScript', 'color: #64748B; font-size: 12px;');
    console.log('%c交互效果已加载 ✓', 'color: #10B981; font-size: 12px;');

    // ==================== 页面完全加载后 ====================

window.addEventListener('load', function() {
    document.body.classList.add('loaded');

    setTimeout(function() {
        var heroContent = safeQuerySelector('.hero-content');
        if (heroContent) {
            heroContent.classList.add('animate-visible');
        }
    }, 300);
});

})();
