// Данные дискографии
const discographyData = [
    {
        artist: 'kai',
        type: 'album',
        title: 'GOD SYSTEM',
        year: '2024',
        desc: 'Новейший альбом, переосмысляющий звучание.',
        // ВСТАВЬ BASE64 ДЛЯ ОБЛОЖКИ GOD SYSTEM
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        link: '#'
    },
    {
        artist: '9mice',
        type: 'single',
        title: 'POISON',
        year: '2024',
        desc: 'Агрессивный сингл с тяжелым басом.',
        // ВСТАВЬ BASE64 ДЛЯ ОБЛОЖКИ POISON
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        link: '#'
    },
    // Добавьте больше релизов здесь...
];

document.addEventListener('DOMContentLoaded', () => {
    const discoContainer = document.getElementById('discography-grid');
    
    // Функция рендера карточек
    function renderCards(artistFilter, typeFilter = 'all') {
        if (!discoContainer) return;
        
        discoContainer.innerHTML = '';
        
        const filtered = discographyData.filter(item => {
            const artistMatch = item.artist === artistFilter || artistFilter === 'all';
            const typeMatch = typeFilter === 'all' || item.type === typeFilter;
            return artistMatch && typeMatch;
        });

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card fade-in';
            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${item.img}" alt="${item.title}">
                </div>
                <h3>${item.title}</h3>
                <p>${item.year} | ${item.type.toUpperCase()}</p>
                <button class="toggle-details">Подробнее</button>
                <div class="card-details">
                    <p style="margin-top:10px;">${item.desc}</p>
                    <a href="${item.link}" target="_blank" class="cta-btn" style="font-size:0.8rem; padding:5px 15px;">Слушать</a>
                </div>
            `;
            discoContainer.appendChild(card);
        });

        // Повторная инициализация аккордеона для новых элементов
        document.querySelectorAll('.toggle-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const details = e.target.nextElementSibling;
                details.classList.toggle('open');
                e.target.textContent = details.classList.contains('open') ? 'Свернуть' : 'Подробнее';
            });
        });
    }

    // Определение текущей страницы и рендер
    if (document.body.classList.contains('page-kai')) {
        renderCards('kai');
    } else if (document.body.classList.contains('page-9mice')) {
        renderCards('9mice');
    } else if (document.body.classList.contains('page-home')) {
        // На главной странице логика табов
        const tabBtns = document.querySelectorAll('.tab-btn');
        renderCards('kai'); // По умолчанию Kai

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Удаляем активный класс у всех
                tabBtns.forEach(b => b.classList.remove('active'));
                // Добавляем текущему
                btn.classList.add('active');
                // Рендерим
                renderCards(btn.dataset.artist);
            });
        });
    }

    // Фильтры на страницах артистов
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const artist = document.body.classList.contains('page-kai') ? 'kai' : '9mice';
            renderCards(artist, btn.dataset.type);
        });
    });
});