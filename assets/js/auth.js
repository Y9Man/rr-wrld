document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. НАСТРОЙКИ FIREBASE
    // ==========================================
    const firebaseConfig = {
      apiKey: "AIzaSyB9BaXzSzPy5j_Q7Q6237DKYWHVPF7uDIA",
      authDomain: "rr-wrld.firebaseapp.com",
      projectId: "rr-wrld",
      storageBucket: "rr-wrld.firebasestorage.app",
      messagingSenderId: "810576494634",
      appId: "1:810576494634:web:e42aa47bacc4c0e8700353",
      measurementId: "G-7JN5P0XR0R"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

    // ==========================================
    // 2. ЭЛЕМЕНТЫ ИНТЕРФЕЙСА
    // ==========================================
    const modal = document.getElementById('authOverlay');
    const openBtnDesktop = document.getElementById('openAuthBtn');
    const openBtnMobile = document.getElementById('mobileAuthBtn');
    const closeBtn = document.getElementById('authClose');
    
    const authForms = document.getElementById('authForms');
    const userProfile = document.getElementById('userProfile');
    
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const tabs = document.querySelectorAll('.auth-tab');

    // Кнопки соцсетей
    const googleBtn = document.getElementById('googleLogin');
    const githubBtn = document.getElementById('githubLogin');

    const profileName = document.getElementById('profileName');
    const profileStatus = document.querySelector('.profile-status');

    // ==========================================
    // 3. ОТКРЫТИЕ / ЗАКРЫТИЕ
    // ==========================================
    function openModal() {
        if(modal) modal.classList.add('active');
        const mobileMenu = document.getElementById('mobileMenu');
        const burger = document.getElementById('burger');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            burger.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (openBtnDesktop) openBtnDesktop.addEventListener('click', openModal);
    if (openBtnMobile) openBtnMobile.addEventListener('click', openModal);

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            const formId = tab.dataset.tab === 'login' ? 'loginForm' : 'registerForm';
            document.getElementById(formId).classList.add('active');
        });
    });

    // ==========================================
    // 4. ЛОГИКА АВТОРИЗАЦИИ
    // ==========================================

    // --- ФУНКЦИЯ ДЛЯ СОЦСЕТЕЙ (Google / GitHub) ---
    function socialLogin(provider) {
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                // Сохраняем пользователя в БД (merge: true, чтобы не затереть старые данные)
                return db.collection("users").doc(user.uid).set({
                    username: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    avatar: user.photoURL, // Берем аватарку от Google/GitHub
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    status: "VIP FAN"
                }, { merge: true });
            })
            .then(() => {
                console.log("Успешный вход через соцсеть");
            })
            .catch((error) => {
                console.error(error);
                alert("Ошибка: " + error.message);
            });
    }

    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            socialLogin(provider);
        });
    }

    if (githubBtn) {
        githubBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GithubAuthProvider();
            socialLogin(provider);
        });
    }

    // --- РЕГИСТРАЦИЯ (Email) ---
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPass').value;
            const nickname = document.getElementById('regName').value;

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    return db.collection("users").doc(userCredential.user.uid).set({
                        username: nickname,
                        status: "VIP FAN",
                        avatar: null, // Нет аватарки
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                })
                .catch((error) => alert("Ошибка: " + error.message));
        });
    }

    // --- ВХОД (Email) ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginName').value;
            const password = document.getElementById('loginPass').value;

            auth.signInWithEmailAndPassword(email, password)
                .catch((error) => alert("Ошибка входа: " + error.message));
        });
    }

    // --- ВЫХОД ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut();
        });
    }

    // ==========================================
    // 5. ПРОВЕРКА СТАТУСА (ГЛАВНАЯ ФУНКЦИЯ)
    // ==========================================
    auth.onAuthStateChanged((user) => {
        if (user) {
            // > ЗАЛОГИНЕН
            authForms.style.display = 'none';
            userProfile.style.display = 'block';

            // Берем данные из базы
            db.collection("users").doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    profileName.textContent = data.username;
                    profileStatus.textContent = data.status || "FAN";

                    // АВАТАРКА (Если есть картинка - ставим её, если нет - иконку)
                    let avatarHtml = `<i class="fa-solid fa-user-astronaut"></i>`;
                    let tinyAvatar = `<i class="fa-solid fa-user-astronaut"></i>`;

                    if (data.avatar) {
                        avatarHtml = `<img src="${data.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                        tinyAvatar = `<img src="${data.avatar}" style="width: 20px; height: 20px; border-radius: 50%; vertical-align: middle; margin-right: 5px; object-fit: cover;">`;
                    }

                    document.querySelector('.profile-avatar').innerHTML = avatarHtml;

                    // Обновляем кнопку в хедере
                    const btnContent = `${tinyAvatar} ${data.username}`;
                    if (openBtnDesktop) openBtnDesktop.innerHTML = btnContent;
                    if (openBtnMobile) openBtnMobile.innerHTML = btnContent;
                }
            });

        } else {
            // > НЕ ЗАЛОГИНЕН
            authForms.style.display = 'block';
            userProfile.style.display = 'none';

            const btnContent = `<i class="fa-regular fa-user"></i> Войти`;
            if (openBtnDesktop) openBtnDesktop.innerHTML = btnContent;
            if (openBtnMobile) openBtnMobile.innerHTML = btnContent;
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. НАСТРОЙКИ FIREBASE
    // ==========================================
    const firebaseConfig = {
      apiKey: "AIzaSyB9BaXzSzPy5j_Q7Q6237DKYWHVPF7uDIA",
      authDomain: "rr-wrld.firebaseapp.com",
      projectId: "rr-wrld",
      storageBucket: "rr-wrld.firebasestorage.app",
      messagingSenderId: "810576494634",
      appId: "1:810576494634:web:e42aa47bacc4c0e8700353",
      measurementId: "G-7JN5P0XR0R"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

    // ==========================================
    // 2. ЭЛЕМЕНТЫ ИНТЕРФЕЙСА
    // ==========================================
    const modal = document.getElementById('authOverlay');
    const openBtnDesktop = document.getElementById('openAuthBtn');
    const openBtnMobile = document.getElementById('mobileAuthBtn');
    const closeBtn = document.getElementById('authClose');
    
    const authForms = document.getElementById('authForms');
    const userProfile = document.getElementById('userProfile');
    
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const tabs = document.querySelectorAll('.auth-tab');

    // Кнопки соцсетей
    const googleBtn = document.getElementById('googleLogin');
    const githubBtn = document.getElementById('githubLogin');

    // Профиль и редактирование
    const profileName = document.getElementById('profileName');
    const profileStatus = document.querySelector('.profile-status');
    const editNameBtn = document.getElementById('editNameBtn'); // Кнопка карандаша

    // ==========================================
    // 3. ОТКРЫТИЕ / ЗАКРЫТИЕ
    // ==========================================
    function openModal() {
        if(modal) modal.classList.add('active');
        const mobileMenu = document.getElementById('mobileMenu');
        const burger = document.getElementById('burger');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            burger.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (openBtnDesktop) openBtnDesktop.addEventListener('click', openModal);
    if (openBtnMobile) openBtnMobile.addEventListener('click', openModal);

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            const formId = tab.dataset.tab === 'login' ? 'loginForm' : 'registerForm';
            document.getElementById(formId).classList.add('active');
        });
    });

    // ==========================================
    // 4. ЛОГИКА АВТОРИЗАЦИИ
    // ==========================================

    // --- СМЕНА НИКА (НОВАЯ ФУНКЦИЯ) ---
    if (editNameBtn) {
        editNameBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) return;

            // Спрашиваем новый ник
            const newName = prompt("Введите новый никнейм:", profileName.textContent);

            // Если ввел и не пустая строка
            if (newName && newName.trim() !== "") {
                try {
                    // Обновляем в БД
                    await db.collection("users").doc(user.uid).update({
                        username: newName
                    });
                    
                    // Сразу обновляем на экране, не ожидая перезагрузки
                    profileName.textContent = newName;
                    updateHeaderButton(newName, null); // Обновляем кнопку вверху
                    
                } catch (error) {
                    alert("Ошибка обновления: " + error.message);
                }
            }
        });
    }

    // --- ФУНКЦИЯ ДЛЯ СОЦСЕТЕЙ (С ЗАЩИТОЙ) ---
    function socialLogin(provider) {
        if (googleBtn) googleBtn.disabled = true;
        if (githubBtn) githubBtn.disabled = true;
        
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                return db.collection("users").doc(user.uid).set({
                    username: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    avatar: user.photoURL,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    status: "VIP FAN"
                }, { merge: true });
            })
            .catch((error) => {
                if (error.code !== 'auth/popup-closed-by-user') {
                    alert("Ошибка: " + error.message);
                }
            })
            .finally(() => {
                if (googleBtn) googleBtn.disabled = false;
                if (githubBtn) githubBtn.disabled = false;
            });
    }

    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            socialLogin(provider);
        });
    }

    if (githubBtn) {
        githubBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GithubAuthProvider();
            socialLogin(provider);
        });
    }

    // --- РЕГИСТРАЦИЯ (Email) ---
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPass').value;
            const nickname = document.getElementById('regName').value;

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    return db.collection("users").doc(userCredential.user.uid).set({
                        username: nickname,
                        status: "VIP FAN",
                        avatar: null,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                })
                .catch((error) => alert("Ошибка: " + error.message));
        });
    }

    // --- ВХОД (Email) ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginName').value;
            const password = document.getElementById('loginPass').value;

            auth.signInWithEmailAndPassword(email, password)
                .catch((error) => alert("Ошибка входа: " + error.message));
        });
    }

    // --- ВЫХОД ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut();
        });
    }

    // Вспомогательная функция для обновления кнопки
    function updateHeaderButton(name, avatar) {
        let tinyAvatar = `<i class="fa-solid fa-user-astronaut"></i>`;
        
        // Если аватар передан (или берем старый, если null)
        if (avatar) {
             tinyAvatar = `<img src="${avatar}" style="width: 20px; height: 20px; border-radius: 50%; vertical-align: middle; margin-right: 5px; object-fit: cover;">`;
        } else {
            // Если аватара нет, пытаемся найти текущий в DOM
            const existingImg = document.querySelector('.profile-avatar img');
            if (existingImg) {
                tinyAvatar = `<img src="${existingImg.src}" style="width: 20px; height: 20px; border-radius: 50%; vertical-align: middle; margin-right: 5px; object-fit: cover;">`;
            }
        }

        const btnContent = `${tinyAvatar} ${name}`;
        if (openBtnDesktop) openBtnDesktop.innerHTML = btnContent;
        if (openBtnMobile) openBtnMobile.innerHTML = btnContent;
    }

    // ==========================================
    // 5. ПРОВЕРКА СТАТУСА (ГЛАВНАЯ ФУНКЦИЯ)
    // ==========================================
    auth.onAuthStateChanged((user) => {
        if (user) {
            authForms.style.display = 'none';
            userProfile.style.display = 'block';

            db.collection("users").doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    profileName.textContent = data.username;
                    profileStatus.textContent = data.status || "FAN";

                    let avatarHtml = `<i class="fa-solid fa-user-astronaut"></i>`;
                    if (data.avatar) {
                        avatarHtml = `<img src="${data.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                    }
                    document.querySelector('.profile-avatar').innerHTML = avatarHtml;
                    
                    updateHeaderButton(data.username, data.avatar);
                }
            });

        } else {
            authForms.style.display = 'block';
            userProfile.style.display = 'none';

            const btnContent = `<i class="fa-regular fa-user"></i> Войти`;
            if (openBtnDesktop) openBtnDesktop.innerHTML = btnContent;
            if (openBtnMobile) openBtnMobile.innerHTML = btnContent;
        }
    });
});