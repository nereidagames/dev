/**
 * Enhanced Login Screen UI Template - Ported from ActionScript BSP
 * Provides professional, 1:1 matching visual style from original game
 */

export const ENHANCED_AUTH_HTML = `
<style>
    /* --- BSP LOGIN STYLE (Enhanced v2 - Port from ActionScript) --- */
    #auth-screen {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: transparent;
        z-index: 99998;
        display: none;
        flex-direction: column; justify-content: space-between;
        font-family: 'Titan One', cursive;
        pointer-events: none;
    }

    .bsp-interactive { pointer-events: auto !important; }

    #bsp-welcome-screen {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column; justify-content: space-between;
        padding: 10px;
        pointer-events: none;
    }

    .bsp-top-header {
        text-align: center; margin-top: 15px;
        text-shadow: 4px 4px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000; 
        color: white; font-size: 48px;
        pointer-events: auto;
        font-weight: 900;
        letter-spacing: 3px;
    }

    .bsp-top-header span {
        color: #f1c40f;
        text-shadow: 4px 4px 0 #f39c12, -1px -1px 0 #d35400, 1px -1px 0 #d35400, -1px 1px 0 #d35400;
    }

    .bsp-right-buttons {
        position: absolute; right: 30px; top: 50%; transform: translateY(-60%);
        display: flex; flex-direction: column; gap: 20px;
        align-items: flex-end;
        z-index: 100;
        pointer-events: none; 
    }

    .bsp-big-btn {
        width: 200px;
        height: 100px;
        border: 5px solid white; 
        border-radius: 25px;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        cursor: pointer; transition: all 0.15s;
        box-shadow: 0 10px 0 rgba(0,0,0,0.6), inset 0 -3px 0 rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.3);
        color: white; text-shadow: 3px 3px 0 #000;
        font-size: 22px;
        font-weight: 900;
        text-align: center; line-height: 1.1;
        pointer-events: auto;
    }
    
    .bsp-big-btn:active { 
        transform: translateY(8px);
        box-shadow: 0 2px 0 rgba(0,0,0,0.4), inset 0 -3px 0 rgba(0,0,0,0.3);
    }
    
    .bsp-big-btn:hover {
        transform: scale(1.05);
    }

    .btn-new-user { background: linear-gradient(to bottom, #8ede13 0%, #5ba806 100%); }
    .btn-login-big { background: linear-gradient(to bottom, #4facfe 0%, #0072ff 100%); }

    .bsp-bottom-bar {
        display: flex; justify-content: space-between; align-items: flex-end;
        width: 100%; padding-bottom: 15px;
        pointer-events: none;
    }

    .bsp-left-icon {
        width: 120px;
        height: 120px;
        cursor: pointer;
        transition: transform 0.2s;
        pointer-events: auto;
    }
    
    .bsp-left-icon:active {
        transform: scale(0.95);
    }
    
    .bsp-left-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
    }

    .bsp-tip-box {
        background-color: #3498db;
        border: 4px solid white; 
        border-radius: 18px;
        padding: 12px 18px; 
        color: white; 
        font-size: 14px;
        max-width: 320px; 
        position: relative;
        box-shadow: 0 8px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
        pointer-events: auto;
        text-shadow: 2px 2px 0 #000;
        font-weight: 900;
    }
    
    .bsp-tip-box::after {
        content: ''; 
        position: absolute; 
        bottom: -14px; 
        right: 30px;
        border-width: 14px 14px 0; 
        border-style: solid;
        border-color: white transparent transparent transparent;
    }

    .btn-privacy {
        background: linear-gradient(to bottom, #f39c12 0%, #d35400 100%);
        border: 4px solid white; 
        border-radius: 15px;
        padding: 12px 24px; 
        color: white; 
        font-size: 14px;
        cursor: pointer; 
        box-shadow: 0 6px 0 #a04000, inset 0 1px 0 rgba(255,255,255,0.2);
        pointer-events: auto;
        text-shadow: 2px 2px 0 #000;
        font-weight: 900;
        transition: all 0.1s;
    }
    
    .btn-privacy:active {
        transform: translateY(4px);
        box-shadow: 0 2px 0 #a04000;
    }

    /* --- LOGIN MODAL --- */
    #bsp-login-modal {
        position: absolute; right: 60px; top: 50%; transform: translateY(-50%);
        width: 360px;
        background: linear-gradient(135deg, #4facfe 0%, #3498db 50%, #2980b9 100%);
        border: 6px solid white; 
        border-radius: 30px;
        padding: 30px; 
        display: none;
        flex-direction: column; 
        gap: 14px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.4), 0 0 30px rgba(79,172,254,0.3);
        pointer-events: auto;
        z-index: 101;
    }
    
    .bsp-modal-title { 
        font-size: 32px; 
        color: white; 
        text-align: center; 
        text-shadow: 3px 3px 0 #000; 
        margin-bottom: 12px;
        font-weight: 900;
    }
    
    .bsp-input {
        width: 100%; 
        height: 52px;
        border-radius: 14px; 
        border: 2px solid transparent;
        padding: 0 18px; 
        font-family: 'Titan One', cursive; 
        font-size: 16px;
        box-shadow: inset 0 4px 8px rgba(0,0,0,0.15), 0 0 0 3px rgba(255,255,255,0.3);
        background-color: white;
        transition: all 0.2s;
        font-weight: bold;
    }
    
    .bsp-input:focus {
        outline: none;
        box-shadow: inset 0 4px 8px rgba(0,0,0,0.15), 0 0 0 4px rgba(255,255,255,0.6);
        background-color: #f5f5f5;
    }
    
    .bsp-input::placeholder {
        color: #95a5a6;
        font-weight: normal;
    }
    
    .bsp-checkbox-row { 
        display: flex; 
        align-items: center; 
        gap: 12px; 
        color: white; 
        text-shadow: 2px 2px 0 #000; 
        font-size: 15px;
        font-weight: 900;
    }
    
    .bsp-checkbox { 
        width: 24px; 
        height: 24px; 
        cursor: pointer;
        accent-color: #2ecc71;
    }

    .bsp-flag-row {
        display: flex; 
        justify-content: center; 
        align-items: center; 
        gap: 12px;
        padding: 10px;
        background: rgba(0,0,0,0.15);
        border-radius: 12px;
        border: 2px solid rgba(255,255,255,0.2);
    }

    .server-flag-icon {
        width: 45px;
        height: 30px;
        background-size: cover;
        background-position: center;
        border-radius: 5px;
        border: 2px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
    }

    .server-flag-text {
        color: white;
        font-size: 14px;
        text-shadow: 2px 2px 0 #000;
        font-weight: 900;
    }

    .bsp-btn-row { 
        display: flex; 
        gap: 12px; 
        margin-top: 10px; 
    }
    
    .bsp-btn-small {
        flex: 1; 
        height: 56px;
        border: 4px solid white; 
        border-radius: 14px;
        font-size: 20px; 
        color: white; 
        cursor: pointer;
        display: flex; 
        justify-content: center; 
        align-items: center;
        box-shadow: 0 6px 0 rgba(0,0,0,0.5);
        font-family: 'Titan One', cursive;
        font-weight: 900;
        text-shadow: 2px 2px 0 #000;
        transition: all 0.1s;
    }
    
    .bsp-btn-small:active { 
        transform: translateY(4px); 
        box-shadow: 0 2px 0 rgba(0,0,0,0.3); 
    }
    
    .btn-red { background: linear-gradient(to bottom, #e74c3c 0%, #c0392b 100%); }
    .btn-green { background: linear-gradient(to bottom, #2ecc71 0%, #27ae60 100%); }

    .bsp-reset-password {
        text-align: center; 
        font-size: 13px; 
        color: white; 
        text-shadow: 2px 2px 0 #000; 
        margin-top: 8px; 
        cursor: pointer; 
        text-decoration: underline;
        font-weight: 900;
        transition: opacity 0.2s;
    }
    
    .bsp-reset-password:hover {
        opacity: 0.8;
    }

    .bsp-auth-message {
        color: #f1c40f;
        text-align: center;
        text-shadow: 2px 2px 0 #000;
        font-size: 14px;
        margin-top: 8px;
        font-weight: 900;
        min-height: 22px;
    }

    /* --- REGISTER SCREEN --- */
    #bsp-register-screen {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: none;
        pointer-events: none;
    }

    .bsp-skin-selector {
        position: absolute; left: 50px; top: 50%; transform: translateY(-50%);
        display: flex; flex-direction: column; gap: 18px;
        pointer-events: auto;
    }

    .selector-row { 
        display: flex; 
        align-items: center; 
        gap: 12px; 
    }
    
    .selector-icon {
        width: 80px; 
        height: 80px;
        background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%); 
        border: 5px solid white; 
        border-radius: 18px;
        display: flex; 
        justify-content: center; 
        align-items: center;
        box-shadow: 0 6px 12px rgba(0,0,0,0.5);
    }
    
    .selector-icon img { 
        width: 90%; 
        object-fit: contain;
    }
    
    .selector-arrow {
        width: 56px; 
        height: 56px;
        background: linear-gradient(to bottom, #fff 0%, #f5f5f5 100%);
        border: 4px solid #3498db; 
        border-radius: 14px;
        display: flex; 
        justify-content: center; 
        align-items: center;
        font-size: 32px; 
        color: #3498db; 
        cursor: pointer;
        box-shadow: 0 6px 0 #2980b9;
        transition: all 0.1s;
        font-weight: bold;
    }
    
    .selector-arrow:active { 
        transform: translateY(4px); 
        box-shadow: 0 2px 0 #2980b9; 
    }
    
    .selector-arrow:hover {
        transform: scale(1.08);
    }

    .bsp-register-panel {
        position: absolute; right: 30px; top: 50%; transform: translateY(-50%);
        width: 360px;
        background: linear-gradient(135deg, #8ede13 0%, #7ccf0d 50%, #6ab30a 100%);
        border: 6px solid white;
        border-radius: 30px;
        padding: 25px; 
        display: flex; 
        flex-direction: column; 
        gap: 11px;
        pointer-events: auto;
        z-index: 101;
        box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.4);
    }

    .bsp-register-header { 
        text-align: center; 
        margin-bottom: 12px;
        color: white;
        text-shadow: 3px 3px 0 #000;
        font-size: 28px;
        font-weight: 900;
    }

    .bsp-register-header img { 
        width: 55px; 
        height: 55px;
        object-fit: contain;
        margin-top: 6px;
    }

    .bsp-terms-box {
        background: linear-gradient(to bottom, #3498db 0%, #2980b9 100%);
        color: white; 
        font-size: 12px; 
        text-align: center; 
        padding: 10px; 
        border-radius: 10px; 
        margin-top: 6px; 
        border: 3px solid white;
        cursor: pointer;
        font-weight: 900;
        text-shadow: 2px 2px 0 #000;
        box-shadow: 0 4px 0 rgba(0,0,0,0.3);
    }
    
    @media (max-width: 768px) {
        .bsp-top-header { font-size: 36px; margin-top: 10px; }
        .bsp-big-btn { width: 160px; height: 85px; font-size: 18px; }
        .bsp-right-buttons { right: 15px; gap: 12px; }
        #bsp-login-modal, .bsp-register-panel { width: 88%; right: 6%; left: auto; }
        .bsp-skin-selector { left: 15px; transform: scale(0.85) translateY(-50%); }
        .bsp-left-icon { width: 90px; height: 90px; }
        .bsp-tip-box { max-width: 200px; font-size: 12px; padding: 8px 12px; }
    }
    
    @media (max-width: 480px) {
        .bsp-top-header { font-size: 28px; }
        .bsp-big-btn { width: 130px; height: 70px; font-size: 14px; }
        #bsp-login-modal, .bsp-register-panel { width: 95%; right: 2.5%; font-size: 14px; }
        .bsp-modal-title, .bsp-register-header { font-size: 20px; }
        .bsp-input, .bsp-btn-small { font-size: 14px; }
        .bsp-left-icon { width: 70px; height: 70px; }
        .bsp-tip-box { max-width: 140px; font-size: 10px; }
        .bsp-right-buttons { gap: 10px; }
    }
</style>

<div id="auth-screen">
    <div id="bsp-welcome-screen">
        <div class="bsp-top-header bsp-interactive">Witaj na <span>HyperCubesPlanet</span></div>
        <div class="bsp-right-buttons">
            <div id="btn-show-register" class="bsp-big-btn btn-new-user bsp-interactive">Nowy<br>Użytkownik</div>
            <div id="btn-show-login" class="bsp-big-btn btn-login-big bsp-interactive">Zaloguj</div>
        </div>
        <div class="bsp-bottom-bar">
            <div class="bsp-left-icon bsp-interactive">
                <img src="icons/DexMcFly.png" alt="DexMcFly" onerror="this.style.display='none'">
            </div>
            <div class="bsp-tip-box">📝 WSKAZÓWKA: Możesz się zalogować jako: BlockStarPlanet, MovieStarPlanet lub własny nick</div>
            <div class="btn-privacy bsp-interactive">Polityka Prywatności</div>
        </div>
    </div>
    
    <!-- LOGIN MODAL -->
    <div id="bsp-login-modal">
        <div class="bsp-modal-title">Zaloguj tutaj</div>
        <form id="login-form" style="display:flex; flex-direction:column; gap:11px;">
            <input id="login-username" class="bsp-input" type="text" placeholder="Nazwa użytkownika" required>
            <input id="login-password" class="bsp-input" type="password" placeholder="Wprowadź hasło" required>
            <div class="bsp-checkbox-row">
                <input type="checkbox" class="bsp-checkbox" id="login-remember">
                <label for="login-remember">Zapisz moje hasło</label>
            </div>
            <div class="bsp-flag-row">
                <div class="server-flag-icon" style="background-image: url('icons/ServerPL.png');"></div>
                <span class="server-flag-text">Polska</span>
            </div>
            <div class="bsp-btn-row">
                <div id="btn-login-cancel" class="bsp-btn-small btn-red">Anuluj</div>
                <button type="submit" class="bsp-btn-small btn-green">Ok</button>
            </div>
            <div class="bsp-reset-password" id="btn-reset-password">Nie pamiętasz hasła?</div>
        </form>
        <div id="auth-message" class="bsp-auth-message"></div>
    </div>
    
    <!-- REGISTER SCREEN -->
    <div id="bsp-register-screen">
        <div class="bsp-skin-selector">
            <div class="selector-row">
                <div id="skin-prev" class="selector-arrow bsp-interactive">⬅</div>
                <div class="selector-icon"><img src="icons/icon-newhypercube.png" onerror="this.src='icons/icon-build.png'"></div>
                <div id="skin-next" class="selector-arrow bsp-interactive">➡</div>
            </div>
            <div class="selector-row" style="opacity:0.5; filter:grayscale(1);">
                <div class="selector-arrow">⬅</div>
                <div class="selector-icon"><img src="icons/icon-jump.png"></div>
                <div class="selector-arrow">➡</div>
            </div>
        </div>
        <div class="bsp-register-panel">
            <div class="bsp-register-header">Nowy Gracz 🎮</div>
            <form id="register-form" style="display:flex; flex-direction:column; gap:10px;">
                <input id="register-username" class="bsp-input" type="text" placeholder="Wprowadź nick" required minlength="3" maxlength="15">
                <input id="register-password" class="bsp-input" type="password" placeholder="Wprowadź hasło" required minlength="6">
                <input id="register-password-confirm" class="bsp-input" type="password" placeholder="Powtórz hasło" required>
                <div class="bsp-checkbox-row"><input type="checkbox" class="bsp-checkbox" id="reg-hide-pass"><label for="reg-hide-pass">Ukryć hasło?</label></div>
                <div class="bsp-flag-row">
                    <div class="server-flag-icon" style="background-image: url('icons/ServerPL.png');"></div>
                    <span class="server-flag-text">Polska</span>
                </div>
                <div class="bsp-btn-row"><div id="btn-register-cancel" class="bsp-btn-small btn-red">Anuluj</div><button type="submit" class="bsp-btn-small btn-green">Ok</button></div>
            </form>
            <div class="bsp-terms-box">📋 Warunki Korzystania</div>
            <div class="btn-privacy bsp-interactive" style="font-size:12px; padding:8px; text-align:center; margin-top:4px;">Polityka Prywatności</div>
        </div>
    </div>
</div>
`;
