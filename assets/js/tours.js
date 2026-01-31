const toursData = [
    { date: '15.10.2024', city: 'Москва', venue: 'Base Club', year: 2024, link: '#' },
    { date: '20.10.2024', city: 'Санкт-Петербург', venue: 'Aurora', year: 2024, link: '#' },
    { date: '10.02.2025', city: 'Екатеринбург', venue: 'Tele Club', year: 2025, link: null }, // Нет ссылки
    { date: '05.03.2025', city: 'Новосибирск', venue: 'Podzemka', year: 2025, link: null },
    { date: '01.01.2026', city: 'Мировой Тур', venue: 'TBA', year: 2026, link: null }
];

document.addEventListener('DOMContentLoaded', () => {
    const tourContainer = document.getElementById('tour-list');
    const filterBtns = document.querySelectorAll('.filter-tour');

    if (!tourContainer) return;

    function renderTours(yearFilter) {
        tourContainer.innerHTML = '';
        
        const filtered = toursData.filter(tour => 
            yearFilter === 'all' || tour.year == yearFilter
        );

        if (filtered.length === 0) {
            tourContainer.innerHTML = '<p class="text-center">Концертов в этом году пока нет.</p>';
            return;
        }

        filtered.forEach(tour => {
            const item = document.createElement('div');
            item.className = 'tour-item fade-in';
            
            // Логика кнопки
            let btnHtml = '';
            if (tour.link) {
                btnHtml = `<a href="${tour.link}" target="_blank" class="cta-btn" style="padding: 10px 20px;">Билеты</a>`;
            } else {
                btnHtml = `<button class="cta-btn no-ticket" style="padding: 10px 20px; opacity: 0.5;">Скоро</button>`;
            }

            item.innerHTML = `
                <div class="tour-date">${tour.date}</div>
                <div class="tour-info">
                    <div class="tour-city">${tour.city}</div>
                    <div class="tour-venue">${tour.venue}</div>
                </div>
                <div class="tour-action">
                    ${btnHtml}
                </div>
            `;
            tourContainer.appendChild(item);
        });

        // Модальное окно для "Скоро"
        document.querySelectorAll('.no-ticket').forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Продажи билетов скоро откроются. Следите за новостями!');
            });
        });
    }

    // Инициализация
    renderTours('all');

    // Обработчики фильтров
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTours(btn.dataset.year);
        });
    });
});