/* PLIK: AuthManager.js */
import { API_BASE_URL, STORAGE_KEYS } from './Config.js';

export class AuthManager {
    constructor(onLoginSuccess) {
        this.onLoginSuccess = onLoginSuccess; 
    }

    bindEvents() {
        this.uiElements = {
            screen: document.getElementById('auth-screen'),
            welcomeView: document.getElementById('welcome-view'),
            loginForm: document.getElementById('login-form'),
            registerForm: document.getElementById('register-form'),
            message: document.getElementById('auth-message')
        };
        // Reszta eventów jest obsługiwana przez IntroManager, 
        // AuthManager służy teraz głównie do sesji.
    }

    async checkSession(uiManager) {
        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json().catch(() => null);
                    if (data?.thumbnail && uiManager) {
                        uiManager.updatePlayerAvatar(data.thumbnail);
                    }
                    if (data?.user) {
                        this.onLoginSuccess(data.user, token, data.thumbnail);
                        return;
                    }
                }

                // Nie blokuj wejścia do gry na skutek 401/403/404; po prostu przejdź do ekranu logowania.
                console.warn('Sesja nieprawidłowa lub backend zwrócił błąd:', response.status);
                localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER_ID);
            } catch (err) {
                console.warn('Błąd sesji:', err.message || err);
                localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER_ID);
            }
        }

        this.showAuthScreen();
    }

    showAuthScreen() {
        // Ta metoda jest nadpisywana w main.js, aby uruchamiać IntroManager.js
        // Domyślna implementacja (na wszelki wypadek):
        if (this.uiElements && this.uiElements.screen) {
            this.uiElements.screen.style.display = 'flex';
        }
    }
}
