document.addEventListener('DOMContentLoaded', () => {
    // 1. Мобильное меню (Бургер)
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if (burger) {
        burger.addEventListener('click', () => {
            // Переключение меню
            nav.classList.toggle('nav-active');
            
            // Анимация иконки бургера
            burger.classList.toggle('toggle');
        });
    }

    // 2. Подсветка активной страницы в меню
    const currentPage = window.location.pathname.split('/').pop();
    const links = document.querySelectorAll('.nav-links a');
    
    links.forEach(link => {
        if (link.getAttribute('href') === currentPage || (currentPage === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    // 3. Анимация при скролле (Intersection Observer)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Анимировать только один раз
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // 4. Модальное окно (если есть на странице)
    const modal = document.getElementById('imageModal');
    const imgTrigger = document.querySelector('.modal-trigger');
    const modalImg = document.getElementById('img01');
    const closeBtn = document.querySelector('.close-modal');

    if (modal && imgTrigger) {
        imgTrigger.addEventListener('click', function() {
            modal.style.display = "flex";
            modalImg.src = this.src;
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = "none";
        });
        
        // Закрытие по клику вне картинки
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }
});