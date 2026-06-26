/* PLIK: DiggingManager.js - Z EFEKTYWNYM USUWANIEM BLOKÓW I NOWYM SYSTEMEM XP */

import * as THREE from 'three';
import { API_BASE_URL, STORAGE_KEYS } from './Config.js';

// Paleta kolorów (bez tekstur!)
const COLORS = {
    stone: 0x808080,
    bedrock: 0x1E90FF,
    obsidian: 0x2F4F4F,
    lava: 0xFF4500,
    border_gold: 0xFFD700,
    border_black: 0x000000,
    clay: 0x8B4513,
    bone: 0xFFFFFF,
    core: 0xFF4500,
    radiation: 0x32CD32,
    dream: 0x9370DB,
    nightmare: 0x4B0082,
    nether: 0x8B0000,
    inferno: 0xFF0000
};

// Definicje rud
const ORE_VALUES = {
    clay: 1, bone: 2, core: 3, radiation: 5,
    dream: 8, nightmare: 12, nether: 17, inferno: 25
};

const ORE_NAMES = {
    clay: 'Glina', bone: 'Kość', core: 'Rdzeń', radiation: 'Promieniowanie',
    dream: 'Sen', nightmare: 'Koszmar', nether: 'Nether', inferno: 'Piekło',
    stone: 'Kamień', bedrock: 'Bedrock', obsidian: 'Obsydian', lava: 'Lawa',
    border_gold: 'Złota Ramka', border_black: 'Czarna Ramka'
};

// Ulepszenia
const LASER_UPGRADES = [
    { name: 'Base Laser', power: 1.0, cost: 0 },
    { name: 'Super Laser', power: 3.0, cost: 25 },
    { name: 'Mega Laser', power: 5.0, cost: 50 },
    { name: 'Ultra Laser', power: 10.0, cost: 100 },
    { name: 'Epic Laser', power: 20.0, cost: 200 },
    { name: 'Monster Laser', power: 40.0, cost: 400 }
];

const STORAGE_UPGRADES = [
    { name: 'Base Storage', capacity: 10, cost: 0 },
    { name: 'Extra Pocket', capacity: 20, cost: 25 },
    { name: 'Big Bag', capacity: 30, cost: 50 },
    { name: 'Many Bags', capacity: 40, cost: 100 },
    { name: 'Compressed Container', capacity: 50, cost: 200 },
    { name: 'Pocket Dimension', capacity: 75, cost: 400 }
];

const LAVA_SURGE_DEPTHS = [16, 48, 80];

// ROZMIAR CHUNKA - 16x16x16 bloków
const CHUNK_SIZE = 16;

// Dystans renderowania - osobno dla każdej osi
const RENDER_DISTANCE = {
    x: 2,  // szerokość
    z: 2,  // głębokość
    y: 1   // wysokość (zmniejszone dla oszczędności)
};

export class DiggingManager {
    constructor(game, uiManager) {
        this.game = game;
        this.ui = uiManager;
        
        // Scena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111122);
        
        // Panorama nieba
        this.skyMesh = null;
        this.currentSkyId = 200; // Domyślnie Clouds
        
        // Stan gry
        this.isActive = false;
        this.roomId = null;
        this.ws = null;
        this.roomPlayers = [];
        this.maxPlayers = 6;
        
        // Remote players
        this.remotePlayers = new Map();
        
        // Wymiary świata
        this.worldSize = 50;
        this.worldHeight = 120;
        this.halfSize = 25;
        
        // SYSTEM CHUNKÓW
        this.chunks = new Map(); // klucz "cx,cy,cz" -> { meshes, blockCount, visible }
        this.chunkData = new Map(); // klucz bloku "x,y,z" -> { chunkKey, type, instanceIndex, mesh }
        this.activeChunks = new Set(); // aktualnie widoczne chunki
        this.lastPlayerChunk = null; // ostatni chunk w którym był gracz
        
        // Geometria dla wszystkich chunków (współdzielona)
        this.sharedGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.dummy = new THREE.Object3D();
        
        // Kolizje
        this.collisionMap = new Map(); // szybka mapa dla kolizji
        
        // Pozycja gracza
        this.playerPos = new THREE.Vector3(0, this.worldHeight - 1, 0);
        this.originalPlayerPos = null;
        this.originalCollidables = [];
        this.originalCollisionMap = null;
        
        // Ekwipunek
        this.crystals = [];
        this.zoins = 0;
        this.score = 0;
        this.dynamite = 2;
        this.health = 100;
        this.maxHealth = 100;
        
        // Ulepszenia
        this.laserLevel = 0;
        this.storageLevel = 0;
        
        // Kopanie
        this.isMining = false;
        this.isMiningPressed = false;
        this.miningProgress = 0;
        this.miningTarget = null;
        this.miningTargetKey = null;
        this.miningStartTime = 0;
        this.miningTotalTime = 0;
        this.miningInterval = null;
        
        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Inne
        this.playerLight = null;
        this.lavaWarningActive = false;
        this.lavaWarningTimer = null;
        this.lavaSurgeActive = false;
        
        // Timer
        this.timerInterval = null;
        this.timeRemaining = 1800;
        
        // Bindowanie
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        
        // Setup oświetlenia
        this.setupLighting();
        
        // Ustaw domyślną panoramę nieba
        this.setSky(200);
    }
    
    setupLighting() {
        console.log("💡 Setting up lighting");
        
        const ambient = new THREE.AmbientLight(0x606080);
        this.scene.add(ambient);
        
        const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight1.position.set(10, 30, 10);
        this.scene.add(dirLight1);
        
        const dirLight2 = new THREE.DirectionalLight(0xffaa88, 0.8);
        dirLight2.position.set(-10, 20, -10);
        this.scene.add(dirLight2);
        
        this.playerLight = new THREE.PointLight(0xffaa66, 1.5, 30);
        this.scene.add(this.playerLight);
    }

    // Ustawianie panoramy nieba
    setSky(skyId) {
        // Usuń starą panoramę
        if (this.skyMesh) {
            this.scene.remove(this.skyMesh);
            if (this.skyMesh.geometry) this.skyMesh.geometry.dispose();
            if (this.skyMesh.material) {
                if (Array.isArray(this.skyMesh.material)) {
                    this.skyMesh.material.forEach(m => m.dispose());
                } else {
                    this.skyMesh.material.dispose();
                }
            }
        }

        // Dla ID 200 (Clouds) - nasza domyślna panorama
        if (skyId === 200) {
            const geometry = new THREE.SphereGeometry(500, 60, 40);
            const texture = new THREE.TextureLoader().load('textures/sky/clouds.png');
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide
            });
            this.skyMesh = new THREE.Mesh(geometry, material);
            this.scene.add(this.skyMesh);
            this.currentSkyId = 200;
            console.log("☁️ Digging: Ustawiono panoramę Clouds");
        }
        // Tutaj można dodać kolejne panoramy w przyszłości
    }
    
    // Funkcja do obliczania klucza chunka na podstawie pozycji bloku
    getChunkKeyFromPosition(x, y, z) {
        const cx = Math.floor(x / CHUNK_SIZE);
        const cy = Math.floor(y / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        return `${cx},${cy},${cz}`;
    }
    
    // Funkcja do obliczania klucza chunka na podstawie pozycji gracza
    getChunkKeyFromPlayer(pos) {
        const cx = Math.floor(pos.x / CHUNK_SIZE);
        const cy = Math.floor(pos.y / CHUNK_SIZE);
        const cz = Math.floor(pos.z / CHUNK_SIZE);
        return { cx, cy, cz, key: `${cx},${cy},${cz}` };
    }
    
    // Aktualizacja widocznych chunków na podstawie pozycji gracza
    updateVisibleChunks() {
        const playerChunk = this.getChunkKeyFromPlayer(this.playerPos);
        
        // Sprawdź czy gracz przeszedł do innego chunka
        if (this.lastPlayerChunk === playerChunk.key) return;
        
        this.lastPlayerChunk = playerChunk.key;
        console.log(`📍 Player moved to chunk ${playerChunk.key}`);
        
        // Oblicz które chunki powinny być widoczne
        const shouldBeVisible = new Set();
        
        // Używamy osobnych dystansów dla każdej osi
        for (let dx = -RENDER_DISTANCE.x; dx <= RENDER_DISTANCE.x; dx++) {
            for (let dy = -RENDER_DISTANCE.y; dy <= RENDER_DISTANCE.y; dy++) {
                for (let dz = -RENDER_DISTANCE.z; dz <= RENDER_DISTANCE.z; dz++) {
                    const cx = playerChunk.cx + dx;
                    const cy = playerChunk.cy + dy;
                    const cz = playerChunk.cz + dz;
                    const key = `${cx},${cy},${cz}`;
                    
                    // Sprawdź czy chunk istnieje
                    if (this.chunks.has(key)) {
                        shouldBeVisible.add(key);
                    }
                }
            }
        }
        
        console.log(`👁️ Visible chunks: ${shouldBeVisible.size}`);
        
        // Ukryj chunki które nie powinny być widoczne
        this.activeChunks.forEach(key => {
            if (!shouldBeVisible.has(key)) {
                const chunk = this.chunks.get(key);
                if (chunk && chunk.meshes) {
                    chunk.meshes.forEach(mesh => {
                        if (mesh) mesh.visible = false;
                    });
                    chunk.visible = false;
                }
            }
        });
        
        // Pokaż chunki które powinny być widoczne
        shouldBeVisible.forEach(key => {
            const chunk = this.chunks.get(key);
            if (chunk && chunk.meshes) {
                chunk.meshes.forEach(mesh => {
                    if (mesh) mesh.visible = true;
                });
                chunk.visible = true;
            }
        });
        
        this.activeChunks = shouldBeVisible;
    }
    
    async startDiggingMode() {
        console.log("🪣 Starting digging mode...");
        this.isActive = true;
        this.resetRound();
        
        if (this.game.characterManager?.character) {
            this.originalPlayerPos = this.game.characterManager.character.position.clone();
        }
        
        if (this.game.playerController) {
            this.originalCollidables = [...this.game.playerController.collidableObjects];
            this.originalCollisionMap = this.game.playerController.collisionMap;
        }
        
        await this.connectWebSocket();
        await this.createOrJoinRoom();
        
        if (this.game.characterManager?.character) {
            this.game.scene.remove(this.game.characterManager.character);
            if (this.game.characterManager.shadow) {
                this.game.scene.remove(this.game.characterManager.shadow);
            }
            this.scene.add(this.game.characterManager.character);
            if (this.game.characterManager.shadow) {
                this.scene.add(this.game.characterManager.shadow);
            }
        }
        
        document.querySelector('.ui-overlay').style.display = 'none';
        document.getElementById('digging-ui-container').style.display = 'block';
        
        this.updatePlayerCounter();
        
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('contextmenu', this.onContextMenu);
        
        this.startTimer();
        this.updateUI();
    }
    
    resetRound() {
        this.timeRemaining = 1800;
        this.crystals = [];
        this.zoins = 0;
        this.score = 0;
        this.dynamite = 2;
        this.health = 100;
        this.laserLevel = 0;
        this.storageLevel = 0;
        this.isMining = false;
        this.isMiningPressed = false;
        this.miningProgress = 0;
        this.miningTarget = null;
        
        // Wyczyść chunki
        this.clearAllChunks();
    }
    
    async connectWebSocket() {
        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(`wss://hypercubes-nexus-server.onrender.com?token=${token}`);
                
                this.ws.onopen = () => {
                    console.log("🔌 Connected to digging server");
                    resolve();
                };
                
                this.ws.onmessage = (e) => {
                    const data = JSON.parse(e.data);
                    this.handleMessage(data);
                };
                
                this.ws.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    reject(error);
                };
                
                this.ws.onclose = () => {
                    console.log("🔌 Disconnected from digging server");
                };
            } catch (error) {
                console.error("Failed to connect WebSocket:", error);
                reject(error);
            }
        });
    }
    
    async createOrJoinRoom() {
        try {
            const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
            
            const roomsResponse = await fetch(`${API_BASE_URL}/api/digging/rooms`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (roomsResponse.ok) {
                const rooms = await roomsResponse.json();
                const availableRoom = rooms.find(r => r.playerCount < r.maxPlayers);
                
                if (availableRoom) {
                    const joinResponse = await fetch(`${API_BASE_URL}/api/digging/join/${availableRoom.id}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (joinResponse.ok) {
                        const data = await joinResponse.json();
                        this.roomId = data.roomId;
                        this.maxPlayers = data.maxPlayers;
                        this.roomPlayers = data.players || [];
                        
                        console.log(`🚪 Joined existing room: ${this.roomId} (${data.playerCount}/${data.maxPlayers})`);
                        
                        this.ws.send(JSON.stringify({
                            type: 'joinDigging',
                            roomId: this.roomId
                        }));
                        
                        return;
                    }
                }
            }
            
            const createResponse = await fetch(`${API_BASE_URL}/api/digging/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });
            
            if (createResponse.ok) {
                const data = await createResponse.json();
                this.roomId = data.roomId;
                this.worldSize = data.worldSize;
                this.worldHeight = data.worldHeight;
                this.halfSize = Math.floor(this.worldSize / 2);
                this.maxPlayers = data.maxPlayers;
                
                console.log(`🏠 Created new room: ${this.roomId}`);
                
                this.ws.send(JSON.stringify({
                    type: 'joinDigging',
                    roomId: this.roomId
                }));
            } else {
                throw new Error("Failed to create or join room");
            }
        } catch (error) {
            console.error("Room error:", error);
            this.ui.showMessage("Błąd łączenia z pokojem", "error");
        }
    }
    
    handleMessage(data) {
        console.log("📨 Received:", data.type);
        
        switch(data.type) {
            case 'diggingWorld':
                console.log("🌍 Building world from server data...");
                this.worldSize = data.worldSize;
                this.worldHeight = data.worldHeight;
                this.halfSize = Math.floor(this.worldSize / 2);
                this.maxPlayers = data.maxPlayers;
                this.roomPlayers = data.players || [];
                this.timeRemaining = data.timeRemaining;
                
                this.buildWorldAsChunks(data.worldData);
                this.updatePlayerCounter();
                break;
                
            case 'blockMined':
                this.removeBlockLocally(data.x, data.y, data.z);
                
                if (data.crystal && data.playerId !== this.game.userId) {
                    const crystalName = ORE_NAMES[data.crystal.type] || data.crystal.name || 'kryształ';
                    this.ui.showMessage(`Gracz znalazł ${crystalName}!`, 'info');
                }
                break;
                
            case 'playerJoined':
                if (!this.roomPlayers.includes(data.playerId)) {
                    this.roomPlayers.push(data.playerId);
                }
                this.addRemotePlayer(data.playerId, data.username);
                this.updatePlayerCounter();
                this.ui.showMessage(`${data.username} dołączył do kopania`, 'info');
                break;
                
            case 'playerLeft':
                const index = this.roomPlayers.indexOf(data.playerId);
                if (index > -1) this.roomPlayers.splice(index, 1);
                this.removeRemotePlayer(data.playerId);
                this.updatePlayerCounter();
                break;
                
            case 'playerMove':
                this.updateRemotePlayer(data.playerId, data.position, data.rotation);
                break;
        }
    }
    
    // Budowanie świata z podziałem na chunki
    buildWorldAsChunks(worldData) {
        console.log("🏗️ Building world chunks...");
        const startTime = performance.now();
        
        this.clearAllChunks();
        
        // Grupuj bloki według chunków
        const blocksByChunk = new Map();
        
        for (const [key, block] of Object.entries(worldData.blocks)) {
            const chunkKey = this.getChunkKeyFromPosition(block.x, block.y, block.z);
            
            if (!blocksByChunk.has(chunkKey)) {
                blocksByChunk.set(chunkKey, []);
            }
            
            blocksByChunk.get(chunkKey).push({
                x: block.x,
                y: block.y,
                z: block.z,
                type: block.type,
                key
            });
            
            // Zapisz informację o bloku dla szybkiego dostępu
            this.chunkData.set(key, {
                chunkKey,
                type: block.type
            });
            
            // Dodaj do mapy kolizji
            this.collisionMap.set(key, true);
        }
        
        console.log(`📦 Created ${blocksByChunk.size} chunks`);
        
        // Stwórz InstancedMesh dla każdego chunka
        blocksByChunk.forEach((blocks, chunkKey) => {
            this.buildChunk(chunkKey, blocks);
        });
        
        // Ustaw pozycję gracza
        this.playerPos.set(0, this.worldHeight - 1, 0);
        if (this.game.characterManager?.character) {
            this.game.characterManager.character.position.copy(this.playerPos);
        }
        
        // WYMUŚ aktualizację widocznych chunków
        this.lastPlayerChunk = null; // Reset żeby wymusić aktualizację
        this.updateVisibleChunks();
        
        // Aktualizuj kolizje w playerController
        if (this.game.playerController) {
            this.game.playerController.collidableObjects = this.getAllVisibleCollidables();
            this.game.playerController.collisionMap = this.collisionMap;
        }
        
        if (this.game.cameraController) {
            this.game.cameraController.collidableObjects = this.getAllVisibleCollidables();
        }
        
        const endTime = performance.now();
        console.log(`✅ World built in ${(endTime - startTime).toFixed(0)}ms`);
    }
    
    // Budowanie pojedynczego chunka
    buildChunk(chunkKey, blocks) {
        // Grupuj bloki w chunku według typu (dla InstancedMesh)
        const blocksByType = new Map();
        
        blocks.forEach(block => {
            if (!blocksByType.has(block.type)) {
                blocksByType.set(block.type, []);
            }
            blocksByType.get(block.type).push(block);
        });
        
        // Stwórz InstancedMesh dla każdego typu w tym chunku
        const chunkMeshes = [];
        let totalBlocks = 0;
        
        blocksByType.forEach((positions, type) => {
            const count = positions.length;
            const color = COLORS[type] || 0x808080;
            
            const material = new THREE.MeshBasicMaterial({ color });
            const mesh = new THREE.InstancedMesh(this.geometry, material, count);
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.frustumCulled = true;
            mesh.userData = { type, chunkKey };
            
            positions.forEach((pos, index) => {
                this.dummy.position.set(pos.x, pos.y, pos.z);
                this.dummy.updateMatrix();
                mesh.setMatrixAt(index, this.dummy.matrix);
                
                // ZAPISUJEMY INDEKS INSTANCJI!
                this.chunkData.set(pos.key, {
                    chunkKey,
                    type,
                    instanceIndex: index,
                    mesh
                });
            });
            
            mesh.instanceMatrix.needsUpdate = true;
            chunkMeshes.push(mesh);
            totalBlocks += count;
        });
        
        // Zapisz chunk
        this.chunks.set(chunkKey, {
            meshes: chunkMeshes,
            blockCount: totalBlocks,
            visible: false
        });
        
        // Dodaj meshe do sceny (na razie niewidoczne)
        chunkMeshes.forEach(mesh => {
            mesh.visible = false;
            this.scene.add(mesh);
        });
    }
    
    // Pobierz wszystkie widoczne obiekty do kolizji
    getAllVisibleCollidables() {
        const collidables = [];
        this.activeChunks.forEach(chunkKey => {
            const chunk = this.chunks.get(chunkKey);
            if (chunk && chunk.meshes) {
                chunk.meshes.forEach(mesh => {
                    if (mesh) collidables.push(mesh);
                });
            }
        });
        return collidables;
    }
    
    // Usuń wszystkie chunki
    clearAllChunks() {
        console.log("🧹 Clearing all chunks...");
        
        this.chunks.forEach(chunk => {
            if (chunk.meshes) {
                chunk.meshes.forEach(mesh => {
                    this.scene.remove(mesh);
                    mesh.dispose();
                });
            }
        });
        
        this.chunks.clear();
        this.chunkData.clear();
        this.collisionMap.clear();
        this.activeChunks.clear();
        this.lastPlayerChunk = null;
    }
    
    addRemotePlayer(playerId, username) {
        if (playerId === this.game.userId) return;
        if (this.remotePlayers.has(playerId)) return;
        
        const geometry = new THREE.BoxGeometry(0.6, 1.8, 0.6);
        const material = new THREE.MeshBasicMaterial({ color: 0x3498db });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, this.worldHeight - 1, 0);
        
        this.scene.add(mesh);
        
        this.remotePlayers.set(playerId, {
            mesh,
            username,
            position: new THREE.Vector3(0, this.worldHeight - 1, 0),
            rotation: new THREE.Quaternion()
        });
    }
    
    removeRemotePlayer(playerId) {
        const player = this.remotePlayers.get(playerId);
        if (player) {
            this.scene.remove(player.mesh);
            this.remotePlayers.delete(playerId);
        }
    }
    
    updateRemotePlayer(playerId, position, rotation) {
        const player = this.remotePlayers.get(playerId);
        if (player) {
            player.position.set(position.x, position.y, position.z);
            if (rotation) {
                player.rotation.set(rotation.x, rotation.y, rotation.z, rotation.w);
            }
        }
    }
    
    updatePlayerCounter() {
        const counterEl = document.getElementById('dig-player-count');
        if (counterEl) {
            counterEl.textContent = `${this.roomPlayers.length}/${this.maxPlayers}`;
        }
    }
    
    // EFEKTYWNE USUWANIE BLOKA - Z INDEKSAMI INSTANCJI
    removeBlockLocally(x, y, z) {
        const key = `${x},${y},${z}`;
        const blockInfo = this.chunkData.get(key);
        if (!blockInfo) return false;
        
        const { chunkKey, type, instanceIndex, mesh } = blockInfo;
        
        // Usuń z mapy kolizji
        this.collisionMap.delete(key);
        
        // Usuń z chunkData
        this.chunkData.delete(key);
        
        if (!mesh) return false;
        
        // Sprawdź czy mesh jeszcze istnieje w scenie
        if (!mesh.parent) return false;
        
        // Przesuń ostatnią instancję na miejsce usuwanej
        const lastIndex = mesh.count - 1;
        
        if (instanceIndex !== lastIndex && lastIndex >= 0) {
            // Skopiuj macierz ostatniej instancji
            const tempMatrix = new THREE.Matrix4();
            mesh.getMatrixAt(lastIndex, tempMatrix);
            mesh.setMatrixAt(instanceIndex, tempMatrix);
            
            // Zaktualizuj dane bloku który został przeniesiony
            for (const [otherKey, otherInfo] of this.chunkData.entries()) {
                if (otherInfo.mesh === mesh && otherInfo.instanceIndex === lastIndex) {
                    otherInfo.instanceIndex = instanceIndex;
                    this.chunkData.set(otherKey, otherInfo);
                    break;
                }
            }
        }
        
        // Zmniejsz liczbę instancji
        mesh.count--;
        mesh.instanceMatrix.needsUpdate = true;
        
        // Jeśli chunk stał się pusty, możemy go usunąć
        if (mesh.count === 0) {
            const chunk = this.chunks.get(chunkKey);
            if (chunk) {
                const meshIndex = chunk.meshes.indexOf(mesh);
                if (meshIndex !== -1) {
                    chunk.meshes.splice(meshIndex, 1);
                    this.scene.remove(mesh);
                    mesh.dispose();
                }
                
                // Jeśli chunk nie ma już żadnych meshy, usuń go
                if (chunk.meshes.length === 0) {
                    this.chunks.delete(chunkKey);
                }
            }
        }
        
        return true;
    }
    
    getBlockUnderCursor() {
        this.raycaster.setFromCamera(this.mouse, this.game.camera);
        
        // Zbierz wszystkie widoczne meshe
        const visibleMeshes = [];
        this.activeChunks.forEach(chunkKey => {
            const chunk = this.chunks.get(chunkKey);
            if (chunk && chunk.meshes) {
                chunk.meshes.forEach(mesh => visibleMeshes.push(mesh));
            }
        });
        
        const intersects = this.raycaster.intersectObjects(visibleMeshes);
        
        if (intersects.length === 0) return null;
        
        for (const hit of intersects) {
            const mesh = hit.object;
            const instanceIndex = hit.instanceId;
            
            // Pobierz pozycję z macierzy instancji
            const matrix = new THREE.Matrix4();
            mesh.getMatrixAt(instanceIndex, matrix);
            const position = new THREE.Vector3().setFromMatrixPosition(matrix);
            
            const x = Math.round(position.x);
            const y = Math.round(position.y);
            const z = Math.round(position.z);
            const key = `${x},${y},${z}`;
            
            // Sprawdź czy blok nadal istnieje
            if (!this.chunkData.has(key)) continue;
            
            const type = mesh.userData.type;
            
            return {
                key,
                x, y, z,
                type,
                definition: { name: ORE_NAMES[type] || type, value: ORE_VALUES[type] || 0 }
            };
        }
        
        return null;
    }
    
    onMouseMove(event) {
        if (!this.isActive) return;
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        if (this.isMining && this.isMiningPressed) {
            const currentTarget = this.getBlockUnderCursor();
            if (!currentTarget || currentTarget.key !== this.miningTargetKey) {
                this.stopMining();
                if (currentTarget) {
                    this.startMining(currentTarget);
                }
            }
        }
    }
    
    onMouseDown(event) {
        if (!this.isActive) return;
        
        if (event.button === 0) {
            event.preventDefault();
            this.isMiningPressed = true;
            this.startMining();
        } else if (event.button === 2) {
            event.preventDefault();
            this.useDynamite();
        }
    }
    
    onMouseUp(event) {
        if (!this.isActive) return;
        
        if (event.button === 0) {
            event.preventDefault();
            this.isMiningPressed = false;
            this.stopMining();
        }
    }
    
    onContextMenu(event) {
        event.preventDefault();
    }
    
    startMining(target = null) {
        if (this.isMining) return;
        
        if (!target) {
            target = this.getBlockUnderCursor();
        }
        
        if (!target) return;
        
        const { type, key } = target;
        
        if (type === 'border_gold' || type === 'border_black' || type === 'bedrock') {
            this.ui.showMessage("Nie możesz zniszczyć tego bloku!", "error");
            this.isMiningPressed = false;
            return;
        }
        
        if (type === 'obsidian' || type === 'lava') {
            if (this.dynamite <= 0) {
                this.ui.showMessage("Potrzebujesz dynamitu!", "error");
                this.isMiningPressed = false;
                return;
            }
            this.useDynamite(target);
            this.isMiningPressed = false;
            return;
        }
        
        const maxCapacity = STORAGE_UPGRADES[this.storageLevel].capacity;
        if (this.crystals.length >= maxCapacity && ORE_VALUES[type]) {
            this.ui.showMessage("B.I.T. pełny! Zredeemuj kryształy!", "warning");
            this.isMiningPressed = false;
            return;
        }
        
        this.isMining = true;
        this.miningTarget = target;
        this.miningTargetKey = key;
        
        const depth = this.worldHeight - 1 - target.y;
        const depthMultiplier = depth > 60 ? 3.0 : (depth > 40 ? 2.0 : (depth > 20 ? 1.5 : 1.0));
        const laserPower = LASER_UPGRADES[this.laserLevel].power;
        
        this.miningTotalTime = (5000 * depthMultiplier) / laserPower;
        this.miningStartTime = Date.now();
        
        document.getElementById('dig-mining-progress').style.display = 'block';
        
        this.miningInterval = setInterval(() => {
            if (!this.isMining || !this.isMiningPressed) {
                this.stopMining();
                return;
            }
            
            const elapsed = Date.now() - this.miningStartTime;
            this.miningProgress = Math.min(1, elapsed / this.miningTotalTime);
            
            const miningBar = document.getElementById('dig-mining-bar');
            if (miningBar) {
                miningBar.style.width = `${this.miningProgress * 100}%`;
            }
            
            if (elapsed >= this.miningTotalTime) {
                this.completeMining();
            }
        }, 50);
    }
    
    stopMining() {
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = null;
        }
        
        this.isMining = false;
        this.miningProgress = 0;
        this.miningTarget = null;
        this.miningTargetKey = null;
        
        document.getElementById('dig-mining-progress').style.display = 'none';
    }
    
    completeMining() {
        clearInterval(this.miningInterval);
        this.miningInterval = null;
        
        if (!this.miningTarget) return;
        
        const { x, y, z, type } = this.miningTarget;
        
        let crystal = null;
        if (ORE_VALUES[type]) {
            crystal = {
                type: type,
                name: ORE_NAMES[type] || type,
                value: ORE_VALUES[type]
            };
            this.crystals.push(crystal);
            this.ui.showCrystalFound(crystal);
        }
        
        // Wyślij do serwera
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'blockMined',
                x, y, z,
                crystal
            }));
        }
        
        // Usuń lokalnie
        this.removeBlockLocally(x, y, z);
        
        if (type === 'lava') {
            this.takeDamage(20);
        }
        
        if (this.isMiningPressed) {
            setTimeout(() => {
                if (this.isMiningPressed) {
                    this.startMining();
                }
            }, 100);
        }
        
        this.isMining = false;
        this.miningProgress = 0;
        this.miningTarget = null;
        this.miningTargetKey = null;
        
        document.getElementById('dig-mining-progress').style.display = 'none';
        
        this.updateUI();
    }
    
    useDynamite(target = null) {
        if (this.dynamite <= 0) {
            this.ui.showMessage("Nie masz dynamitu!", "error");
            return;
        }
        
        const center = target ? { x: target.x, y: target.y, z: target.z } : this.playerPos;
        const blocksToRemove = [];
        
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                for (let z = -2; z <= 2; z++) {
                    const dist = Math.sqrt(x*x + y*y + z*z);
                    if (dist > 2.5) continue;
                    
                    const key = `${Math.floor(center.x + x)},${Math.floor(center.y + y)},${Math.floor(center.z + z)}`;
                    const blockInfo = this.chunkData.get(key);
                    if (blockInfo && blockInfo.type !== 'border_gold' && blockInfo.type !== 'border_black' && blockInfo.type !== 'bedrock') {
                        blocksToRemove.push({ 
                            key, 
                            x: center.x + x, 
                            y: center.y + y, 
                            z: center.z + z, 
                            type: blockInfo.type 
                        });
                    }
                }
            }
        }
        
        let crystalsFound = 0;
        const minedBlocks = [];
        
        blocksToRemove.forEach(block => {
            if (ORE_VALUES[block.type]) {
                crystalsFound += ORE_VALUES[block.type];
                this.crystals.push({
                    type: block.type,
                    name: ORE_NAMES[block.type] || block.type,
                    value: ORE_VALUES[block.type]
                });
            }
            
            minedBlocks.push({
                x: block.x,
                y: block.y,
                z: block.z,
                type: block.type,
                crystal: ORE_VALUES[block.type] ? { type: block.type, value: ORE_VALUES[block.type] } : null
            });
            
            this.removeBlockLocally(block.x, block.y, block.z);
        });
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            minedBlocks.forEach(block => {
                this.ws.send(JSON.stringify({
                    type: 'blockMined',
                    x: block.x,
                    y: block.y,
                    z: block.z,
                    crystal: block.crystal
                }));
            });
        }
        
        this.dynamite--;
        
        if (crystalsFound > 0) {
            this.ui.showMessage(`Dynamit! Znaleziono kryształy o wartości ${crystalsFound} Zoins!`, "success");
        }
        
        this.updateUI();
    }
    
    redeemCrystals() {
        const depth = this.worldHeight - 1 - this.playerPos.y;
        if (depth > 2) {
            this.ui.showMessage("Musisz być na powierzchni przy Ziggi!", "error");
            return;
        }
        
        if (this.crystals.length === 0) {
            this.ui.showMessage("Nie masz kryształów!", "error");
            return;
        }
        
        let totalValue = 0;
        this.crystals.forEach(c => totalValue += c.value);
        
        this.zoins += totalValue;
        this.score += totalValue;
        this.crystals = [];
        
        this.ui.showMessage(`Zredeemowano! Zdobyto: ${totalValue} Zoins!`, "success");
        this.updateUI();
    }
    
    upgradeLaser() {
        if (this.laserLevel >= LASER_UPGRADES.length - 1) {
            this.ui.showMessage("Maksymalny laser!", "error");
            return;
        }
        
        const next = LASER_UPGRADES[this.laserLevel + 1];
        if (this.zoins < next.cost) {
            this.ui.showMessage(`Potrzebujesz ${next.cost} Zoins!`, "error");
            return;
        }
        
        this.zoins -= next.cost;
        this.laserLevel++;
        this.ui.showMessage(`Ulepszono do: ${next.name}!`, "success");
        this.updateUI();
    }
    
    upgradeStorage() {
        if (this.storageLevel >= STORAGE_UPGRADES.length - 1) {
            this.ui.showMessage("Maksymalny ekwipunek!", "error");
            return;
        }
        
        const next = STORAGE_UPGRADES[this.storageLevel + 1];
        if (this.zoins < next.cost) {
            this.ui.showMessage(`Potrzebujesz ${next.cost} Zoins!`, "error");
            return;
        }
        
        this.zoins -= next.cost;
        this.storageLevel++;
        this.ui.showMessage(`Ulepszono do: ${next.name}! Pojemność: ${next.capacity}`, "success");
        this.updateUI();
    }
    
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            
            const mins = Math.floor(this.timeRemaining / 60);
            const secs = this.timeRemaining % 60;
            const timerEl = document.getElementById('dig-timer');
            if (timerEl) {
                timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            
            if (this.timeRemaining <= 0) {
                this.endRound();
            }
        }, 1000);
    }
    
    // NOWA METODA: Wysyłanie wyników kopania do serwera
    async submitDiggingResults() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not connected");
            return;
        }
        
        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/digging/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    score: this.score,
                    depth: this.worldHeight - 1 - this.playerPos.y,
                    crystals: this.crystals.length,
                    zoins: this.zoins,
                    xpReward: Math.floor(this.score / 10),
                    coinReward: Math.floor(this.score / 5)
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.levelUp) {
                    this.ui.showMessage(`Awans na poziom ${data.newLevel}!`, 'success');
                }
                // Aktualizuj UI z nowymi danymi
                if (this.ui.updateLevelInfo) {
                    this.ui.updateLevelInfo(data.newLevel, data.newXp, data.maxXp);
                }
                if (this.ui.updateCoinCounter) {
                    this.ui.updateCoinCounter(data.newCoins);
                }
            }
        } catch (error) {
            console.error("Error submitting digging results:", error);
        }
    }
    
    endRound() {
        clearInterval(this.timerInterval);
        clearInterval(this.miningInterval);
        this.isActive = false;
        
        // Oblicz nagrody
        const xpReward = Math.floor(this.score / 10);
        const coinReward = Math.floor(this.score / 5);
        
        // Wyślij wyniki do serwera
        this.submitDiggingResults();
        
        this.ui.showMessage(`Koniec rundy! Zdobyto: ${this.score} punktów!`, "success");
        this.ui.showMessage(`Nagroda: ${xpReward} XP, ${coinReward} monet!`, "success");
        
        setTimeout(() => this.exitDiggingMode(), 5000);
    }
    
    exitDiggingMode() {
        console.log("🚪 Exiting digging mode...");
        this.isActive = false;
        this.isMiningPressed = false;
        this.stopMining();
        
        clearInterval(this.timerInterval);
        clearInterval(this.miningInterval);
        clearTimeout(this.lavaWarningTimer);
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'leaveDigging' }));
            this.ws.close();
        }
        
        window.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('contextmenu', this.onContextMenu);
        
        if (this.game.characterManager?.character) {
            this.scene.remove(this.game.characterManager.character);
            if (this.game.characterManager.shadow) {
                this.scene.remove(this.game.characterManager.shadow);
            }
            this.game.scene.add(this.game.characterManager.character);
            if (this.game.characterManager.shadow) {
                this.game.scene.add(this.game.characterManager.shadow);
            }
        }
        
        if (this.game.characterManager?.character && this.originalPlayerPos) {
            this.game.characterManager.character.position.copy(this.originalPlayerPos);
        }
        
        this.clearAllChunks();
        
        // Usuń panoramę nieba
        if (this.skyMesh) {
            this.scene.remove(this.skyMesh);
            if (this.skyMesh.geometry) this.skyMesh.geometry.dispose();
            if (this.skyMesh.material) {
                if (Array.isArray(this.skyMesh.material)) {
                    this.skyMesh.material.forEach(m => m.dispose());
                } else {
                    this.skyMesh.material.dispose();
                }
            }
            this.skyMesh = null;
        }
        
        this.remotePlayers.forEach(player => {
            this.scene.remove(player.mesh);
        });
        this.remotePlayers.clear();
        
        if (this.game.playerController) {
            this.game.playerController.collidableObjects = this.originalCollidables;
            this.game.playerController.collisionMap = this.originalCollisionMap;
        }
        
        if (this.game.cameraController) {
            this.game.cameraController.collidableObjects = this.originalCollidables;
        }
        
        document.getElementById('digging-ui-container').style.display = 'none';
        document.querySelector('.ui-overlay').style.display = 'block';
        
        if (this.game.isMobile) {
            document.getElementById('joystick-zone').style.display = 'block';
        }
        
        const jumpButton = document.getElementById('jump-button');
        if (jumpButton) {
            jumpButton.style.display = this.game.isMobile ? 'block' : 'none';
        }
    }
    
    cleanup() {
        console.log("🧹 Cleanup called");
        this.exitDiggingMode();
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateUI();
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        const droppedValue = this.crystals.reduce((sum, c) => sum + c.value, 0);
        this.crystals = [];
        
        this.playerPos.set(0, this.worldHeight - 1, 0);
        if (this.game.characterManager?.character) {
            this.game.characterManager.character.position.copy(this.playerPos);
        }
        this.health = this.maxHealth;
        
        this.ui.showMessage(`Zginąłeś! Straciłeś kryształy o wartości ${droppedValue} Zoins!`, "error");
        this.updateUI();
    }
    
    updateUI() {
        const maxCap = STORAGE_UPGRADES[this.storageLevel].capacity;
        const laser = LASER_UPGRADES[this.laserLevel];
        
        const crystalCount = document.getElementById('dig-crystal-count');
        const crystalMax = document.getElementById('dig-crystal-max');
        const crystalBar = document.getElementById('dig-crystal-bar');
        
        if (crystalCount) crystalCount.textContent = this.crystals.length;
        if (crystalMax) crystalMax.textContent = maxCap;
        if (crystalBar) crystalBar.style.width = `${(this.crystals.length / maxCap) * 100}%`;
        
        const zoinsEl = document.getElementById('dig-zoins');
        if (zoinsEl) zoinsEl.textContent = this.zoins;
        
        const dynamiteEl = document.getElementById('dig-dynamite-count');
        if (dynamiteEl) dynamiteEl.textContent = this.dynamite;
        
        const healthBar = document.getElementById('dig-health-bar');
        const healthText = document.getElementById('dig-health-text');
        if (healthBar) healthBar.style.width = `${(this.health / this.maxHealth) * 100}%`;
        if (healthText) healthText.textContent = `${this.health}/${this.maxHealth}`;
        
        const laserName = document.getElementById('dig-laser-name');
        const laserPower = document.getElementById('dig-laser-power');
        if (laserName) laserName.textContent = laser.name;
        if (laserPower) laserPower.textContent = `${Math.round(laser.power * 100)}%`;
        
        const storageName = document.getElementById('dig-storage-name');
        const storageCapacity = document.getElementById('dig-storage-capacity');
        if (storageName) storageName.textContent = STORAGE_UPGRADES[this.storageLevel].name;
        if (storageCapacity) storageCapacity.textContent = maxCap;
        
        const depthEl = document.getElementById('dig-depth');
        if (depthEl) {
            const depth = this.worldHeight - 1 - this.playerPos.y;
            depthEl.textContent = `${depth}m`;
        }
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        if (this.playerLight) {
            this.playerLight.position.copy(this.playerPos);
        }
        
        if (this.game.characterManager?.character) {
            // Zapamiętaj starą pozycję
            const oldPos = this.playerPos.clone();
            this.playerPos.copy(this.game.characterManager.character.position);
            
            // Sprawdź czy gracz zmienił chunk
            const oldChunk = this.getChunkKeyFromPosition(oldPos.x, oldPos.y, oldPos.z);
            const newChunk = this.getChunkKeyFromPosition(this.playerPos.x, this.playerPos.y, this.playerPos.z);
            
            if (oldChunk !== newChunk) {
                this.updateVisibleChunks();
                
                // Aktualizuj obiekty kolizji w playerController
                if (this.game.playerController) {
                    this.game.playerController.collidableObjects = this.getAllVisibleCollidables();
                }
                if (this.game.cameraController) {
                    this.game.cameraController.collidableObjects = this.getAllVisibleCollidables();
                }
            }
            
            const depth = this.worldHeight - 1 - this.playerPos.y;
            const depthEl = document.getElementById('dig-depth');
            if (depthEl) depthEl.textContent = `${depth}m`;
            
            const key = `${Math.floor(this.playerPos.x)},${Math.floor(this.playerPos.y)},${Math.floor(this.playerPos.z)}`;
            const block = this.chunkData.get(key);
            if (block && block.type === 'lava' && !this.lavaSurgeActive) {
                this.takeDamage(1);
            }
            
            // Wyślij pozycję do serwera (co 100ms)
            if (this.ws && this.ws.readyState === WebSocket.OPEN && Math.random() < 0.1) {
                this.ws.send(JSON.stringify({
                    type: 'playerMove',
                    position: {
                        x: this.playerPos.x,
                        y: this.playerPos.y,
                        z: this.playerPos.z
                    },
                    rotation: this.game.characterManager.character.quaternion
                }));
            }
        }
        
        this.remotePlayers.forEach(player => {
            player.mesh.position.lerp(player.position, 0.1);
        });
        
        this.game.core.render(this.scene);
    }
}