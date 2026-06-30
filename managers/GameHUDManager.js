/**
 * Main Game HUD Manager - Ported from ActionScript BSP
 * Manages the main HUD bar, currency display, level info, notifications
 */

export class GameHUDManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.hudElement = null;
        this.playerInfoPanel = null;
        this.currencyPanel = null;
        this.notificationsContainer = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;

        // Create HUD structure
        this.createHUDLayout();
        this.initializeStyles();
        this.setupEventListeners();
        this.initialized = true;
    }

    createHUDLayout() {
        const hudContainer = document.getElementById('ui-layer') || document.body;

        // Create main HUD bar
        this.hudElement = document.createElement('div');
        this.hudElement.id = 'game-hud';
        this.hudElement.className = 'bsp-hud-main';
        this.hudElement.innerHTML = `
            <!-- Top HUD Bar -->
            <div id="hud-top-bar" class="hud-top-bar">
                <!-- Left: Player Info -->
                <div id="hud-player-panel" class="hud-panel hud-player-panel">
                    <div class="hud-avatar-container">
                        <img id="hud-player-avatar" class="hud-avatar" src="icons/favicon.png" alt="Avatar">
                    </div>
                    <div class="hud-player-info">
                        <div id="hud-player-name" class="hud-player-name">PlayerName</div>
                        <div class="hud-level-bar-container">
                            <div class="hud-level-bar-bg">
                                <div id="hud-level-bar-fill" class="hud-level-bar-fill"></div>
                            </div>
                            <div id="hud-level-text" class="hud-level-text">Lvl. 1</div>
                        </div>
                    </div>
                </div>

                <!-- Center: Status/Notifications -->
                <div id="hud-center-status" class="hud-center-status">
                    <div id="hud-status-text" class="hud-status-text">Gotów do gry!</div>
                </div>

                <!-- Right: Currency & Resources -->
                <div id="hud-currency-panel" class="hud-panel hud-currency-panel">
                    <div class="hud-currency-item">
                        <img class="hud-currency-icon" src="icons/coin-icon.png" alt="Coins" onerror="this.src='icons/favicon.png'">
                        <span id="hud-coins-amount" class="hud-currency-amount">0</span>
                    </div>
                    <div class="hud-currency-item">
                        <img class="hud-currency-icon" src="icons/gem-icon.png" alt="Gems" onerror="this.src='icons/favicon.png'">
                        <span id="hud-gems-amount" class="hud-currency-amount">0</span>
                    </div>
                    <button id="hud-menu-btn" class="hud-menu-button">☰ Menu</button>
                </div>
            </div>

            <!-- Notifications Container -->
            <div id="hud-notifications" class="hud-notifications-container"></div>

            <!-- Quick Actions Bar (Mobile) -->
            <div id="hud-mobile-quickbar" class="hud-mobile-quickbar" style="display:none;">
                <button class="hud-mobile-btn" id="hud-mobile-inventory">🎒</button>
                <button class="hud-mobile-btn" id="hud-mobile-friends">👥</button>
                <button class="hud-mobile-btn" id="hud-mobile-shop">🛍️</button>
                <button class="hud-mobile-btn" id="hud-mobile-settings">⚙️</button>
            </div>
        `;

        hudContainer.appendChild(this.hudElement);
        this.playerInfoPanel = document.getElementById('hud-player-panel');
        this.currencyPanel = document.getElementById('hud-currency-panel');
        this.notificationsContainer = document.getElementById('hud-notifications');
    }

    initializeStyles() {
        if (document.getElementById('game-hud-styles')) return;

        const style = document.createElement('style');
        style.id = 'game-hud-styles';
        style.textContent = `
            #game-hud {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: auto;
                z-index: 99000;
                font-family: 'Titan One', cursive;
                pointer-events: auto;
            }

            .hud-top-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(to bottom, rgba(44, 62, 80, 0.95) 0%, rgba(52, 73, 94, 0.9) 100%);
                border-bottom: 4px solid #f39c12;
                padding: 8px 15px;
                gap: 20px;
                backdrop-filter: blur(5px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            }

            .hud-panel {
                display: flex;
                align-items: center;
                gap: 12px;
                background: rgba(0,0,0,0.2);
                padding: 8px 12px;
                border-radius: 10px;
                border: 2px solid rgba(255,255,255,0.1);
            }

            .hud-player-panel {
                flex: 0 0 auto;
                min-width: 200px;
            }

            .hud-avatar-container {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: 3px solid #f39c12;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }

            .hud-avatar {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .hud-player-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
                min-width: 140px;
            }

            .hud-player-name {
                color: #f1c40f;
                font-size: 16px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .hud-level-bar-container {
                position: relative;
                height: 18px;
            }

            .hud-level-bar-bg {
                width: 100%;
                height: 100%;
                background: linear-gradient(to bottom, #1a252f 0%, #0f1823 100%);
                border: 2px solid #f39c12;
                border-radius: 6px;
                overflow: hidden;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
            }

            .hud-level-bar-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(to right, #2ecc71 0%, #27ae60 100%);
                transition: width 0.3s ease;
                box-shadow: inset -1px 0 2px rgba(0,0,0,0.2);
            }

            .hud-level-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                pointer-events: none;
                white-space: nowrap;
            }

            .hud-center-status {
                flex: 1;
                text-align: center;
            }

            .hud-status-text {
                color: #f1c40f;
                font-size: 14px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                animation: pulse 2s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            .hud-currency-panel {
                flex: 0 0 auto;
                min-width: 250px;
                justify-content: flex-end;
            }

            .hud-currency-item {
                display: flex;
                align-items: center;
                gap: 6px;
                background: rgba(0,0,0,0.3);
                padding: 6px 12px;
                border-radius: 8px;
                border: 2px solid rgba(255,255,255,0.15);
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .hud-currency-item:hover {
                background: rgba(0,0,0,0.5);
                border-color: rgba(255,255,255,0.3);
                transform: scale(1.05);
            }

            .hud-currency-icon {
                width: 24px;
                height: 24px;
                object-fit: contain;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            }

            .hud-currency-amount {
                color: white;
                font-size: 14px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                min-width: 50px;
            }

            .hud-menu-button {
                background: linear-gradient(to bottom, #f39c12 0%, #e67e22 100%);
                border: 3px solid white;
                border-radius: 8px;
                padding: 6px 12px;
                color: white;
                font-family: 'Titan One', cursive;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 0 #d68910;
                transition: all 0.1s ease;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }

            .hud-menu-button:active {
                transform: translateY(2px);
                box-shadow: 0 2px 0 #d68910;
            }

            .hud-notifications-container {
                position: fixed;
                top: 70px;
                right: 20px;
                z-index: 99001;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: auto;
            }

            .hud-notification {
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                border: 3px solid white;
                border-radius: 10px;
                padding: 12px 15px;
                color: white;
                font-size: 14px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                min-width: 220px;
                animation: slideIn 0.3s ease;
            }

            .hud-notification.success {
                background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            }

            .hud-notification.warning {
                background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
            }

            .hud-notification.error {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .hud-mobile-quickbar {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 60px;
                background: linear-gradient(to top, rgba(44, 62, 80, 0.95) 0%, rgba(52, 73, 94, 0.9) 100%);
                border-top: 4px solid #f39c12;
                display: flex;
                justify-content: space-around;
                align-items: center;
                gap: 5px;
                z-index: 98000;
                backdrop-filter: blur(5px);
            }

            .hud-mobile-btn {
                flex: 1;
                height: 50px;
                background: linear-gradient(to bottom, #3498db 0%, #2980b9 100%);
                border: 3px solid white;
                border-radius: 10px 10px 0 0;
                color: white;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.1s ease;
                box-shadow: 0 -4px 0 rgba(0,0,0,0.3);
            }

            .hud-mobile-btn:active {
                transform: translateY(-2px);
                box-shadow: 0 -2px 0 rgba(0,0,0,0.3);
            }

            @media (max-width: 768px) {
                .hud-top-bar {
                    flex-wrap: wrap;
                    padding: 8px 10px;
                    gap: 10px;
                }

                .hud-player-panel {
                    min-width: 160px;
                }

                .hud-player-name {
                    font-size: 14px;
                }

                .hud-currency-panel {
                    min-width: 180px;
                }

                .hud-center-status {
                    display: none;
                }

                .hud-mobile-quickbar {
                    display: flex;
                }
            }

            @media (max-width: 480px) {
                .hud-top-bar {
                    flex-direction: column;
                    align-items: stretch;
                    padding: 6px;
                }

                .hud-player-panel {
                    min-width: auto;
                }

                .hud-currency-item {
                    flex: 1;
                    justify-content: center;
                }

                .hud-menu-button {
                    padding: 4px 8px;
                    font-size: 12px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    updatePlayerInfo(name, avatar, level, xp, maxXp) {
        if (!this.initialized) return;

        // Update player name
        const nameEl = document.getElementById('hud-player-name');
        if (nameEl) nameEl.textContent = name;

        // Update avatar
        const avatarEl = document.getElementById('hud-player-avatar');
        if (avatarEl && avatar) avatarEl.src = avatar;

        // Update level bar
        const levelText = document.getElementById('hud-level-text');
        if (levelText) levelText.textContent = `Lvl. ${level}`;

        const fillEl = document.getElementById('hud-level-bar-fill');
        if (fillEl && maxXp > 0) {
            const percent = (xp / maxXp) * 100;
            fillEl.style.width = percent + '%';
        }
    }

    updateCurrency(coins, gems) {
        if (!this.initialized) return;

        const coinsEl = document.getElementById('hud-coins-amount');
        if (coinsEl) coinsEl.textContent = this.formatNumber(coins);

        const gemsEl = document.getElementById('hud-gems-amount');
        if (gemsEl) gemsEl.textContent = this.formatNumber(gems);
    }

    showNotification(message, type = 'info', duration = 4000) {
        if (!this.notificationsContainer) return;

        const notification = document.createElement('div');
        notification.className = `hud-notification ${type}`;
        notification.textContent = message;

        this.notificationsContainer.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    setStatusText(text) {
        const statusEl = document.getElementById('hud-status-text');
        if (statusEl) statusEl.textContent = text;
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    showMobileQuickBar(show = true) {
        const quickbar = document.getElementById('hud-mobile-quickbar');
        if (quickbar) quickbar.style.display = show ? 'flex' : 'none';
    }

    dispose() {
        if (this.hudElement) {
            this.hudElement.remove();
            this.hudElement = null;
        }
        this.initialized = false;
    }
}
