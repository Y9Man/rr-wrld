document.addEventListener('DOMContentLoaded', () => {
    
    // ЭЛЕМЕНТЫ DOM
    const playerBar = document.getElementById('player-bar');
    const audio = document.getElementById('audio-source');
    
    // Инфо
    const coverEl = document.getElementById('player-cover');
    const titleEl = document.getElementById('player-title');
    const artistEl = document.getElementById('player-artist');
    
    // Кнопки
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Прогресс и громкость
    const progressBar = document.getElementById('progress-bar');
    const currTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const volumeBar = document.getElementById('volume-bar');

    // СОСТОЯНИЕ
    let currentPlaylist = []; 
    let currentTrackIndex = 0; 
    let isPlaying = false;
    let currentAlbumInfo = {}; 
    let currentAlbumId = null;

    // ==========================================
    // 1. УМНОЕ СОХРАНЕНИЕ (SessionStorage)
    // ==========================================

    function savePlayerState() {
        if (!currentAlbumId) return;

        const state = {
            albumId: currentAlbumId,
            trackIndex: currentTrackIndex,
            currentTime: audio.currentTime,
            isPlaying: !audio.paused,
            volume: audio.volume
        };
        
        // Используем sessionStorage вместо localStorage!
        // Это предотвращает наложение звука, если открыто несколько вкладок.
        sessionStorage.setItem('viperrPlayerState', JSON.stringify(state));
    }

    function restorePlayerState() {
        const savedStateJSON = sessionStorage.getItem('viperrPlayerState');
        if (!savedStateJSON) return;

        const state = JSON.parse(savedStateJSON);
        
        // Восстанавливаем громкость
        if (state.volume) {
            audio.volume = state.volume;
            volumeBar.value = state.volume * 100;
            updateVolumeVisual(state.volume * 100);
        }

        // Если есть сохраненный альбом
        if (state.albumId && typeof albumsData !== 'undefined') {
            // Загружаем данные (false = не включаем сразу)
            playAlbum(state.albumId, false); 
            
            currentTrackIndex = state.trackIndex;
            loadTrack(currentTrackIndex, false);
            
            audio.currentTime = state.currentTime;

            // ПРОВЕРКА: Это перезагрузка (F5) или переход?
            // Если F5 (reload) -> мы НЕ включаем музыку автоматически
            // Если Переход (navigate) -> включаем
            const navEntry = performance.getEntriesByType("navigation")[0];
            const isReload = navEntry && navEntry.type === 'reload';

            if (state.isPlaying && !isReload) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        isPlaying = true;
                        updatePlayBtn();
                    }).catch(err => console.log("Автоплей заблокирован:", err));
                }
            } else {
                // Если это F5, то показываем плеер, но ставим на паузу
                isPlaying = false;
                updatePlayBtn();
            }
        }
    }

    // Сохраняем состояние при уходе со страницы
    window.addEventListener('beforeunload', savePlayerState);

    // ==========================================
    // 2. ЛОГИКА ЗАПУСКА
    // ==========================================
    
    window.playAlbum = function(albumId, autoPlay = true) {
        if (typeof albumsData === 'undefined') return;

        if (currentAlbumId === albumId) {
            if (autoPlay) togglePlay();
            return;
        }

        const album = albumsData[albumId];
        if (!album) return;

        currentPlaylist = album.tracks;
        currentAlbumInfo = { artist: album.artist, cover: album.cover };
        currentAlbumId = albumId;
        currentTrackIndex = 0;
        
        playerBar.classList.add('active');
        document.body.classList.add('has-player');
        
        loadTrack(currentTrackIndex, autoPlay);
    };

    function loadTrack(index, autoPlay = true) {
        const track = currentPlaylist[index];
        titleEl.textContent = track.title;
        artistEl.textContent = currentAlbumInfo.artist;
        coverEl.src = currentAlbumInfo.cover;
        audio.src = track.src;

        if (autoPlay) {
            playAudio();
        }
    }

    // ==========================================
    // 3. УПРАВЛЕНИЕ
    // ==========================================

    function playAudio() {
        audio.play().then(() => {
            isPlaying = true;
            updatePlayBtn();
        }).catch(err => console.error(err));
    }

    function pauseAudio() {
        audio.pause();
        isPlaying = false;
        updatePlayBtn();
    }

    function togglePlay() {
        if (isPlaying) pauseAudio();
        else playAudio();
    }

    function updatePlayBtn() {
        playPauseBtn.innerHTML = isPlaying ? 
            '<i class="fa-solid fa-pause"></i>' : 
            '<i class="fa-solid fa-play"></i>';
    }

    playPauseBtn.addEventListener('click', togglePlay);

    nextBtn.addEventListener('click', () => {
        if (currentTrackIndex < currentPlaylist.length - 1) {
            currentTrackIndex++;
            loadTrack(currentTrackIndex, true);
        } else {
            currentTrackIndex = 0;
            loadTrack(currentTrackIndex, false);
            pauseAudio();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
        } else if (currentTrackIndex > 0) {
            currentTrackIndex--; 
            loadTrack(currentTrackIndex, true);
        } else {
            playAudio();
        }
    });

    audio.addEventListener('ended', () => nextBtn.click());

    // ==========================================
    // 4. ПРОГРЕСС И ГРОМКОСТЬ
    // ==========================================
    
    audio.addEventListener('timeupdate', (e) => {
        const { duration, currentTime } = e.srcElement;
        if (isNaN(duration)) return;
        
        const progressPercent = (currentTime / duration) * 100;
        progressBar.value = progressPercent;
        currTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
        
        progressBar.style.background = `linear-gradient(to right, #8a2be2 ${progressPercent}%, #333 ${progressPercent}%)`;
        
        // Частое сохранение не нужно при sessionStorage, достаточно beforeunload
    });

    progressBar.addEventListener('input', () => {
        const duration = audio.duration;
        audio.currentTime = (progressBar.value / 100) * duration;
    });

    volumeBar.addEventListener('input', (e) => {
        const val = e.target.value;
        audio.volume = val / 100;
        updateVolumeVisual(val);
    });

    function updateVolumeVisual(val) {
        volumeBar.style.background = `linear-gradient(to right, #fff ${val}%, #333 ${val}%)`;
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // ==========================================
    // 5. ДЕЛЕГИРОВАНИЕ
    // ==========================================
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-play-track');
        if (btn) {
            e.preventDefault();
            const albumId = btn.dataset.albumId;
            playAlbum(albumId);
        }
    });

    // Запуск восстановления
    setTimeout(restorePlayerState, 50);
});