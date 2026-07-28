/**
 * 响应式测试工具
 * 用于测试不同设备的显示效果
 */

(function() {
    'use strict';

    // 设备配置
    var devices = [
        { name: 'iPhone SE', width: 375, height: 667, dpr: 2 },
        { name: 'iPhone 12/13', width: 390, height: 844, dpr: 3 },
        { name: 'iPhone 14 Pro Max', width: 430, height: 932, dpr: 3 },
        { name: 'Samsung Galaxy S21', width: 360, height: 800, dpr: 3 },
        { name: 'iPad Mini', width: 768, height: 1024, dpr: 2 },
        { name: 'iPad Air', width: 820, height: 1180, dpr: 2 },
        { name: 'iPad Pro 11"', width: 834, height: 1194, dpr: 2 },
        { name: 'iPad Pro 12.9"', width: 1024, height: 1366, dpr: 2 },
        { name: 'Laptop 13"', width: 1280, height: 800, dpr: 1 },
        { name: 'Laptop 15"', width: 1440, height: 900, dpr: 1 },
        { name: 'Desktop 1080p', width: 1920, height: 1080, dpr: 1 },
        { name: 'Desktop 2K', width: 2560, height: 1440, dpr: 1 }
    ];

    // 断点配置
    var breakpoints = {
        mobile: 480,
        tablet: 768,
        laptop: 1024,
        desktop: 1200,
        large: 1400,
        xlarge: 1600
    };

    // 当前设备信息
    function getCurrentDeviceInfo() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var dpr = window.devicePixelRatio || 1;
        var orientation = width > height ? 'landscape' : 'portrait';
        var touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        var deviceType = 'mobile';
        if (width >= breakpoints.xlarge) deviceType = 'xlarge-desktop';
        else if (width >= breakpoints.large) deviceType = 'large-desktop';
        else if (width >= breakpoints.desktop) deviceType = 'desktop';
        else if (width >= breakpoints.laptop) deviceType = 'laptop';
        else if (width >= breakpoints.tablet) deviceType = 'tablet';

        return {
            width: width,
            height: height,
            dpr: dpr,
            orientation: orientation,
            touchDevice: touchDevice,
            deviceType: deviceType,
            userAgent: navigator.userAgent
        };
    }

    // 检测元素是否可见
    function isElementVisible(el) {
        var rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // 检测响应式问题
    function checkResponsiveIssues() {
        var issues = [];

        // 检查水平溢出
        if (document.body.scrollWidth > window.innerWidth) {
            issues.push({
                type: 'overflow',
                message: '页面存在水平溢出',
                severity: 'error'
            });
        }

        // 检查字体大小
        var computedFont = window.getComputedStyle(document.body).fontSize;
        var fontSize = parseFloat(computedFont);
        if (fontSize < 14 && window.innerWidth < 768) {
            issues.push({
                type: 'font',
                message: '移动端字体过小: ' + computedFont,
                severity: 'warning'
            });
        }

        // 检查触摸目标大小
        var links = document.querySelectorAll('a, button');
        links.forEach(function(link) {
            var rect = link.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                if (link.offsetParent !== null) { // 元素可见
                    issues.push({
                        type: 'touch-target',
                        message: '触摸目标过小: ' + (link.textContent || link.className).substring(0, 30),
                        severity: 'warning',
                        element: link
                    });
                }
            }
        });

        // 检查图片
        var images = document.querySelectorAll('img');
        images.forEach(function(img) {
            if (img.naturalWidth > window.innerWidth) {
                issues.push({
                    type: 'image',
                    message: '图片超出容器宽度: ' + (img.src || '').substring(0, 50),
                    severity: 'warning'
                });
            }
        });

        return issues;
    }

    // 显示设备信息面板
    function showDeviceInfo() {
        var info = getCurrentDeviceInfo();

        var panel = document.getElementById('responsive-info-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'responsive-info-panel';
            panel.style.cssText = [
                'position: fixed',
                'bottom: 80px',
                'left: 16px',
                'background: rgba(15, 23, 42, 0.95)',
                'color: #F1F5F9',
                'padding: 16px',
                'border-radius: 10px',
                'font-size: 12px',
                'font-family: monospace',
                'z-index: 99999',
                'max-width: 300px',
                'box-shadow: 0 10px 25px rgba(0,0,0,0.3)',
                'backdrop-filter: blur(10px)',
                'border: 1px solid rgba(255,255,255,0.1)',
                'display: none'
            ].join(';');
            document.body.appendChild(panel);
        }

        var issues = checkResponsiveIssues();
        var issuesHtml = issues.length > 0
            ? '<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.2)">' +
              '<div style="color:#F59E0B;font-weight:bold">⚠️ 发现 ' + issues.length + ' 个问题</div>' +
              issues.map(function(i) {
                  var color = i.severity === 'error' ? '#EF4444' : '#F59E0B';
                  return '<div style="color:' + color + ';margin-top:4px">• ' + i.message + '</div>';
              }).join('') +
              '</div>'
            : '<div style="margin-top:8px;color:#10B981">✅ 无响应式问题</div>';

        panel.innerHTML = [
            '<div style="font-weight:bold;color:#3B82F6;margin-bottom:8px">📱 设备信息</div>',
            '<div>尺寸: ' + info.width + ' × ' + info.height + '</div>',
            '<div>DPR: ' + info.dpr + 'x</div>',
            '<div>方向: ' + info.orientation + '</div>',
            '<div>类型: ' + info.deviceType + '</div>',
            '<div>触摸: ' + (info.touchDevice ? '是' : '否') + '</div>',
            issuesHtml
        ].join('');

        panel.style.display = 'block';
    }

    // 隐藏设备信息面板
    function hideDeviceInfo() {
        var panel = document.getElementById('responsive-info-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    // 切换设备信息面板
    function toggleDeviceInfo() {
        var panel = document.getElementById('responsive-info-panel');
        if (panel && panel.style.display === 'block') {
            hideDeviceInfo();
        } else {
            showDeviceInfo();
        }
    }

    // 快捷键显示设备信息
    document.addEventListener('keydown', function(e) {
        // Ctrl + Shift + I 显示设备信息
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            toggleDeviceInfo();
        }
    });

    // 监听窗口大小变化
    var resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            var panel = document.getElementById('responsive-info-panel');
            if (panel && panel.style.display === 'block') {
                showDeviceInfo();
            }
        }, 250);
    });

    // 监听方向变化
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            var panel = document.getElementById('responsive-info-panel');
            if (panel && panel.style.display === 'block') {
                showDeviceInfo();
            }
        }, 100);
    });

    // 导出到全局（可选）
    window.ResponsiveTest = {
        getDeviceInfo: getCurrentDeviceInfo,
        checkIssues: checkResponsiveIssues,
        showInfo: showDeviceInfo,
        hideInfo: hideDeviceInfo,
        toggle: toggleDeviceInfo,
        devices: devices,
        breakpoints: breakpoints
    };

    // 控制台输出
    console.log('%c响应式测试工具已加载', 'color: #10B981; font-size: 12px;');
    console.log('%c按 Ctrl+Shift+I 切换设备信息面板', 'color: #94A3B8; font-size: 11px;');
    console.log('%c或使用 ResponsiveTest.toggle() 方法', 'color: #94A3B8; font-size: 11px;');

})();
