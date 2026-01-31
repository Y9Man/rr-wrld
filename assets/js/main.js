/**
 * VIPERR FAN SITE - MAIN SCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. PRELOADER (ПРЕЛОАДЕР)
    // =========================================
    const preloader = document.getElementById('preloader');
    
    // Имитация загрузки (минимум 1.5 секунды)
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (preloader) {
                preloader.style.opacity = '0';
                preloader.style.pointerEvents = 'none';
                
                setTimeout(() => {
                    preloader.style.display = 'none';
                    // Запускаем анимацию на главной
                    initHeroAnimations();
                }, 500);
            }
        }, 1500);
    });

    // =========================================
    // 2. MOBILE MENU (БУРГЕР)
    // =========================================
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.mobile-nav__link');
    const body = document.body;

    // Проверяем, есть ли элементы на странице
    if (burger && mobileMenu) {
        
        // Клик по бургеру
        burger.addEventListener('click', (e) => {
            e.stopPropagation(); // Чтобы клик не уходил дальше
            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Блокируем прокрутку сайта
            if (mobileMenu.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });

        // Закрытие при клике на ссылку
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                mobileMenu.classList.remove('active');
                body.style.overflow = '';
            });
        });
    }

    // =========================================
    // 3. HEADER SCROLL EFFECT
    // =========================================
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // =========================================
    // 4. ANIMATIONS (FADE UP)
    // =========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up, .fade-in').forEach(el => {
        observer.observe(el);
    });

    function initHeroAnimations() {
        const heroElements = document.querySelectorAll('.hero .fade-up');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 200); 
        });
    }

    // =========================================
    // 5. AUDIO VISUALS (КНОПКИ)
    // =========================================
    // Меняет иконку Play/Pause на карточках, но не включает звук (звук через player.js)
    const playButtons = document.querySelectorAll('.btn-play');
    
    playButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            // Сброс всех остальных иконок
            document.querySelectorAll('.btn-play i').forEach(i => {
                if (i !== icon) {
                    i.classList.remove('fa-pause');
                    i.classList.add('fa-play');
                }
            });
            
            // Переключение текущей
            if (icon.classList.contains('fa-play')) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        });
    });

});