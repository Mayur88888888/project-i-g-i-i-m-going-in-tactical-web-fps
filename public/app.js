/* Project I.G.I. - I'm Going In (Web Tactical FPS Engine) */

// Global Game State
const GAME = {
  active: false,
  paused: false,
  pdaOpen: false,
  builderOpen: false,
  scoresOpen: false,
  currentMission: null,
  missionId: 'mission_1',
  score: 0,
  startTime: 0,
  elapsedSeconds: 0,
  kills: 0,
  headshots: 0,
  stealthKills: 0,
  alarmsTriggered: 0,
  alarmActive: false,
  alarmTimer: 0,
  weather: 'night', // 'day', 'night', 'fog'
  modeNVG: false,
  modeThermal: false,
  
  // Player state
  player: {
    health: 100,
    maxHealth: 100,
    armor: 100,
    maxArmor: 100,
    visibility: 20, // 0 - 100%
    isCrouching: false,
    isSprinting: false,
    selectedWeaponIndex: 1, // Default L96 SD
    scopeZoom: 1, // 1x, 4x, 10x
    isScoping: false,
  },

  // High Scores cache
  highScores: [],
};

// Weapons Definition
const WEAPONS = [
  {
    id: 'knife',
    name: 'COMBAT KNIFE',
    type: 'melee',
    damage: 100,
    range: 3.5,
    suppressed: true,
    fireRate: 600, // ms
    clipSize: 0,
    reserveAmmo: 0,
    clipAmmo: 0,
    hudTag: 'SILENT TAKEDOWN',
  },
  {
    id: 'pistol_sd',
    name: 'L96 SUPPRESSED',
    type: 'handgun',
    damage: 38,
    range: 70,
    suppressed: true,
    fireRate: 250,
    clipSize: 12,
    reserveAmmo: 48,
    clipAmmo: 12,
    hudTag: 'SUPPRESSED (SILENT)',
  },
  {
    id: 'mp5_sd',
    name: 'MP5 SD',
    type: 'smg',
    damage: 28,
    range: 90,
    suppressed: true,
    fireRate: 110,
    clipSize: 30,
    reserveAmmo: 120,
    clipAmmo: 30,
    hudTag: 'SUPPRESSED AUTO',
  },
  {
    id: 'ak47',
    name: 'AK-47 ASSAULT RIFLE',
    type: 'rifle',
    damage: 52,
    range: 130,
    suppressed: false, // LOUD!
    fireRate: 130,
    clipSize: 30,
    reserveAmmo: 150,
    clipAmmo: 30,
    hudTag: 'UNSUPPRESSED (LOUD)',
  },
  {
    id: 'svd_sniper',
    name: 'SVD DRAGUNOV SNIPER',
    type: 'sniper',
    damage: 160,
    range: 300,
    suppressed: false, // LOUD!
    fireRate: 850,
    clipSize: 10,
    reserveAmmo: 30,
    clipAmmo: 10,
    hudTag: 'HIGH POWER SCOPE',
  }
];

// Mission Campaigns Data
const MISSIONS = {
  mission_1: {
    id: 'mission_1',
    title: 'MISSION 1: TRAINYARD INFILTRATION',
    desc: 'Infiltrate the high-security military trainyard. Hack the main mainframe terminal inside the supply warehouse, neutralize perimeter guards, and escape via the helipad extraction point.',
    loadout: 'L96 SD, MP5 SD, SVD SNIPER',
    security: 'CLASS III (CCTV & ALARMS)',
    mapType: 'trainyard',
    weather: 'night',
    objectives: [
      { id: 'obj_infiltrate', text: 'Infiltrate Trainyard Warehouse', done: false },
      { id: 'obj_hack', text: 'Hack Security Computer Terminal [F]', done: false },
      { id: 'obj_cmd', text: 'Neutralize Base Guard Commander', done: false },
      { id: 'obj_escape', text: 'Proceed to Helipad Extraction Point', done: false },
    ]
  },
  mission_2: {
    id: 'mission_2',
    title: 'MISSION 2: EAGLE\'S NEST AIRBASE & SAM SITE',
    desc: 'Infiltrate the mountain airbase radar compound. Destroy the central SAM missile radar dish, override CCTV security feeds, and steal classified flight manifests.',
    loadout: 'L96 SD, AK-47, SVD SNIPER',
    security: 'CLASS IV (SEARCHLIGHTS & CCTV)',
    mapType: 'airbase',
    weather: 'fog',
    objectives: [
      { id: 'obj_sam', text: 'Plant Explosives on SAM Radar Dish', done: false },
      { id: 'obj_cctv', text: 'Disable CCTV Security Generator', done: false },
      { id: 'obj_manifest', text: 'Retrieve Flight Manifests in Barracks', done: false },
      { id: 'obj_truck', text: 'Escape via Military Transport Truck', done: false },
    ]
  },
  mission_3: {
    id: 'mission_3',
    title: 'MISSION 3: SIBERIAN ARCTIC OUTPOST',
    desc: 'Deep arctic snow infiltration in dense whiteout conditions. Thermal and Night Vision mandatory. Neutralize watchtower snipers, eliminate Colonel Harrison, and steal nuclear missile schematics.',
    loadout: 'MP5 SD, SVD SNIPER, COMBAT KNIFE',
    security: 'HEAVY PATROLS & SNIPERS',
    mapType: 'snow_outpost',
    weather: 'fog',
    objectives: [
      { id: 'obj_snipers', text: 'Eliminate 3 Watchtower Snipers', done: false },
      { id: 'obj_schematics', text: 'Steal Nuclear Blueprint Schematics', done: false },
      { id: 'obj_harrison', text: 'Eliminate Colonel Harrison', done: false },
      { id: 'obj_snowmobile', text: 'Reach Snowmobile Extraction Route', done: false },
    ]
  },
  mission_4: {
    id: 'mission_4',
    title: 'MISSION 4: UNDERGROUND SILO COMPLEX',
    desc: 'Infiltrate the subterranean nuclear missile silo. Override laser containment grids, rescue captured operative Ekaterina, and initiate nuclear silo lock-down protocol.',
    loadout: 'L96 SD, MP5 SD, AK-47',
    security: 'MAXIMUM LOCKDOWN (AUTOMATED TURRETS)',
    mapType: 'underground_silo',
    weather: 'night',
    objectives: [
      { id: 'obj_laser', text: 'Override Silo Security Laser Grid', done: false },
      { id: 'obj_ekaterina', text: 'Rescue Agent Ekaterina in Cell 4', done: false },
      { id: 'obj_lockdown', text: 'Initiate Silo Meltdown Lockdown', done: false },
      { id: 'obj_elevator', text: 'Escape via Underground Freight Elevator', done: false },
    ]
  }
};

// Web Audio API Synthesizer
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.alarmOsc = null;
    this.alarmGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playGunshot(type) {
    this.init();
    const t = this.ctx.currentTime;
    
    if (type === 'suppressed') {
      // Quiet thud sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } else if (type === 'loud') {
      // Heavy unsuppressed blast
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(80, t + 0.25);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start(t);
      whiteNoise.stop(t + 0.25);
    } else if (type === 'sniper') {
      // High power punch + echo
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(1.0, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

      noise.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.4);
    } else if (type === 'knife') {
      // Swish sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  playReload() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.setValueAtTime(1200, t + 0.08);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playClick() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  playAlertShout() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.setValueAtTime(330, t + 0.1);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  startAlarmSiren() {
    this.init();
    if (this.alarmOsc) return;
    this.alarmOsc = this.ctx.createOscillator();
    this.alarmGain = this.ctx.createGain();
    this.alarmOsc.type = 'sawtooth';
    this.alarmGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    // LFO Siren modulation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 1.2; // 1.2 Hz wobble
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    this.alarmOsc.frequency.value = 600;
    lfoGain.connect(this.alarmOsc.frequency);

    this.alarmOsc.connect(this.alarmGain);
    this.alarmGain.connect(this.ctx.destination);
    this.alarmOsc.start();
    lfo.start();
  }

  stopAlarmSiren() {
    if (this.alarmOsc) {
      this.alarmOsc.stop();
      this.alarmOsc.disconnect();
      this.alarmOsc = null;
    }
  }

  speakRadioMessage(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }
}

const audio = new SoundEngine();

// 3D Scene Variables
let scene, camera, renderer;
let playerMesh, weaponMesh, weaponFlashLight;
let guards = [];
let cameras = [];
let terminals = [];
let alarmBoxes = [];
let buildings = [];
let helipadMesh = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Movement state
const moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  sprint: false,
  crouch: false,
  velocity: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  isGrounded: true,
};

// Main Initialization Function
function initApp() {
  console.log("Initializing Project I.G.I. Engine...");

  // Setup 3D Scene
  setupThreeJS();

  // Setup Event Listeners
  setupEventListeners();

  // Populate Mission Selector
  renderMissionSelector();

  // Fetch High Scores from API
  fetchScores();

  // Start Main Loop
  requestAnimationFrame(gameLoop);
}

// Setup Three.js Canvas & Renderer
function setupThreeJS() {
  const container = document.getElementById('canvas-container');
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050a06);
  scene.fog = new THREE.FogExp2(0x050a06, 0.015);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.7, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // FPS Weapon Camera Rig
  createWeaponRig();

  window.addEventListener('resize', onWindowResize);
}

// Create First Person Hands & Weapon Model
function createWeaponRig() {
  const weaponGroup = new THREE.Group();
  
  // Gun Body Mesh
  const gunGeo = new THREE.BoxGeometry(0.08, 0.12, 0.45);
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.8 });
  weaponMesh = new THREE.Mesh(gunGeo, gunMat);
  weaponMesh.position.set(0.18, -0.18, -0.4);

  // Silencer tube
  const silencerGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 12);
  const silencerMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
  const silencer = new THREE.Mesh(silencerGeo, silencerMat);
  silencer.rotation.x = Math.PI / 2;
  silencer.position.set(0, 0.02, -0.32);
  weaponMesh.add(silencer);

  // Muzzle Flash Light
  weaponFlashLight = new THREE.PointLight(0xffaa22, 0, 5);
  weaponFlashLight.position.set(0, 0.02, -0.5);
  weaponMesh.add(weaponFlashLight);

  camera.add(weaponMesh);
  scene.add(camera);
}

// Update 3D Weapon Model based on active weapon
function updateWeaponModel() {
  const curWep = WEAPONS[GAME.player.selectedWeaponIndex];
  document.getElementById('hud-weapon-name').textContent = curWep.name;
  document.getElementById('hud-ammo-clip').textContent = curWep.clipAmmo;
  document.getElementById('hud-ammo-reserve').textContent = curWep.reserveAmmo;
  document.getElementById('hud-silencer-tag').textContent = curWep.hudTag;

  // Active weapon slot visual highlight
  document.querySelectorAll('.weapon-slot-item').forEach((el, idx) => {
    if (idx === GAME.player.selectedWeaponIndex) el.classList.add('active');
    else el.classList.remove('active');
  });

  if (!weaponMesh) return;
  if (curWep.id === 'knife') {
    weaponMesh.scale.set(0.5, 0.8, 0.6);
  } else if (curWep.id === 'svd_sniper') {
    weaponMesh.scale.set(1.1, 1.2, 1.8);
  } else {
    weaponMesh.scale.set(1, 1, 1);
  }
}

// Setup Keyboard & Mouse Listeners
function setupEventListeners() {
  // Pointer lock controls on canvas click
  const container = document.getElementById('canvas-container');
  container.addEventListener('click', () => {
    if (GAME.active && !GAME.paused && !GAME.pdaOpen) {
      container.requestPointerLock();
      audio.init();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === container) {
      // Locked
    } else {
      // Unlocked
    }
  });

  // Mouse movement for FPS camera rotation
  document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement !== container || GAME.paused || GAME.pdaOpen) return;

    const sensitivity = 0.0022;
    moveState.yaw -= e.movementX * sensitivity;
    moveState.pitch -= e.movementY * sensitivity;

    // Limit pitch (look up/down)
    moveState.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, moveState.pitch));

    camera.rotation.order = 'YXZ';
    camera.rotation.y = moveState.yaw;
    camera.rotation.x = moveState.pitch;

    // Update compass heading display
    const deg = Math.round(((moveState.yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) * (180 / Math.PI));
    let dirStr = 'N';
    if (deg > 22 && deg <= 67) dirStr = 'NE';
    else if (deg > 67 && deg <= 112) dirStr = 'E';
    else if (deg > 112 && deg <= 157) dirStr = 'SE';
    else if (deg > 157 && deg <= 202) dirStr = 'S';
    else if (deg > 202 && deg <= 247) dirStr = 'SW';
    else if (deg > 247 && deg <= 292) dirStr = 'W';
    else if (deg > 292 && deg <= 337) dirStr = 'NW';
    
    document.getElementById('hud-compass').textContent = `${String(deg).padStart(3, '0')}° ${dirStr}`;
  });

  // Mouse Click / Shoot
  document.addEventListener('mousedown', (e) => {
    if (document.pointerLockElement !== container || GAME.paused || GAME.pdaOpen) return;

    if (e.button === 0) { // Left click: Shoot
      shootWeapon();
    } else if (e.button === 2) { // Right click: Scope aim
      toggleScope();
    }
  });

  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyM' || e.code === 'Tab') {
      e.preventDefault();
      if (GAME.active) togglePDA();
      return;
    }

    if (!GAME.active || GAME.pdaOpen) return;

    switch (e.code) {
      case 'KeyW': moveState.forward = true; break;
      case 'KeyS': moveState.backward = true; break;
      case 'KeyA': moveState.left = true; break;
      case 'KeyD': moveState.right = true; break;
      case 'ShiftLeft': moveState.sprint = true; break;
      case 'KeyC': moveState.crouch = !moveState.crouch; break;
      case 'Space': if (moveState.isGrounded) moveState.velocity.y = 5.0; break;
      case 'KeyR': reloadWeapon(); break;
      case 'KeyF': interactObject(); break;
      case 'KeyN': toggleNVG(); break;
      case 'KeyV': toggleThermal(); break;
      case 'Digit1': selectWeapon(0); break;
      case 'Digit2': selectWeapon(1); break;
      case 'Digit3': selectWeapon(2); break;
      case 'Digit4': selectWeapon(3); break;
      case 'Digit5': selectWeapon(4); break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW': moveState.forward = false; break;
      case 'KeyS': moveState.backward = false; break;
      case 'KeyA': moveState.left = false; break;
      case 'KeyD': moveState.right = false; break;
      case 'ShiftLeft': moveState.sprint = false; break;
    }
  });

  // UI Buttons
  document.getElementById('btn-start-mission').addEventListener('click', startActiveMission);
  document.getElementById('btn-close-pda').addEventListener('click', togglePDA);
  document.getElementById('btn-pda-nvg').addEventListener('click', toggleNVG);
  document.getElementById('btn-pda-thermal').addEventListener('click', toggleThermal);
  document.getElementById('btn-debrief-menu').addEventListener('click', exitToMainMenu);
  document.getElementById('btn-debrief-retry').addEventListener('click', startActiveMission);
  
  document.getElementById('btn-open-builder').addEventListener('click', () => {
    document.getElementById('builder-modal').style.display = 'flex';
  });
  document.getElementById('btn-close-builder').addEventListener('click', () => {
    document.getElementById('builder-modal').style.display = 'none';
  });
  document.getElementById('btn-save-launch-custom').addEventListener('click', launchCustomMission);

  document.getElementById('btn-open-scores').addEventListener('click', () => {
    document.getElementById('scores-modal').style.display = 'flex';
    fetchScores();
  });
  document.getElementById('btn-close-scores').addEventListener('click', () => {
    document.getElementById('scores-modal').style.display = 'none';
  });
}

// Render Mission Cards in Selector
function renderMissionSelector() {
  const grid = document.getElementById('mission-grid');
  grid.innerHTML = '';

  Object.values(MISSIONS).forEach((m, idx) => {
    const card = document.createElement('div');
    card.className = `mission-card ${m.id === GAME.missionId ? 'selected' : ''}`;
    card.innerHTML = `
      <div class="mission-number">OPERATION 0${idx + 1}</div>
      <div class="mission-title">${m.title}</div>
      <div class="mission-desc">${m.desc}</div>
      <div class="mission-meta">
        <span>ATMOSPHERE: ${m.weather.toUpperCase()}</span>
        <span>SECURITY: ${m.security}</span>
      </div>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.mission-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      GAME.missionId = m.id;
      
      document.getElementById('brief-mission-title').textContent = m.title;
      document.getElementById('brief-mission-desc').textContent = m.desc;
      document.getElementById('brief-loadout').textContent = m.loadout;
      document.getElementById('brief-security').textContent = m.security;
    });
    grid.appendChild(card);
  });
}

// Build 3D Mission Level
function loadMissionWorld(missionData) {
  // Clear old scene objects
  guards.forEach(g => scene.remove(g.mesh));
  cameras.forEach(c => scene.remove(c.mesh));
  terminals.forEach(t => scene.remove(t.mesh));
  alarmBoxes.forEach(a => scene.remove(a.mesh));
  buildings.forEach(b => scene.remove(b));
  if (helipadMesh) scene.remove(helipadMesh);

  guards = [];
  cameras = [];
  terminals = [];
  alarmBoxes = [];
  buildings = [];

  GAME.currentMission = JSON.parse(JSON.stringify(missionData));
  GAME.weather = GAME.currentMission.weather || 'night';
  GAME.alarmActive = false;
  GAME.alarmTimer = 0;
  audio.stopAlarmSiren();

  // Reset Alarm HUD status
  document.getElementById('alarm-status-text').textContent = 'NORMAL';
  document.getElementById('alarm-status-text').style.color = 'var(--igi-green)';
  document.getElementById('alarm-panel').style.borderColor = '#555';

  // Environment Lighting & Fog
  if (GAME.weather === 'night') {
    scene.background = new THREE.Color(0x030804);
    scene.fog = new THREE.FogExp2(0x030804, 0.012);
    
    const moonLight = new THREE.DirectionalLight(0x4466aa, 0.8);
    moonLight.position.set(50, 100, 50);
    scene.add(moonLight);

    const ambientLight = new THREE.AmbientLight(0x112211, 0.6);
    scene.add(ambientLight);
  } else if (GAME.weather === 'fog') {
    scene.background = new THREE.Color(0x8090a0);
    scene.fog = new THREE.FogExp2(0x8090a0, 0.025);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
    sunLight.position.set(20, 80, 20);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x556677, 0.8);
    scene.add(ambientLight);
  } else {
    scene.background = new THREE.Color(0x5588cc);
    scene.fog = new THREE.FogExp2(0x5588cc, 0.005);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(100, 150, 50);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x8899aa, 0.7);
    scene.add(ambientLight);
  }

  // Create Ground Plane (200x200)
  const groundGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
  const groundMat = new THREE.MeshStandardMaterial({
    color: GAME.weather === 'fog' ? 0xddeeff : (GAME.weather === 'night' ? 0x0f1d12 : 0x223824),
    roughness: 0.9,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Perimeter Fences
  createPerimeterFence();

  // Build Map Architecture based on mapType
  if (GAME.currentMission.mapType === 'trainyard') {
    buildTrainyardMap();
  } else if (GAME.currentMission.mapType === 'airbase') {
    buildAirbaseMap();
  } else if (GAME.currentMission.mapType === 'snow_outpost') {
    buildSnowOutpostMap();
  } else {
    buildUndergroundSiloMap();
  }

  // Set Player Start Position
  camera.position.set(0, 1.7, 80);
  moveState.yaw = Math.PI;

  // Radio Briefing Subtitle
  showRadioSubtitle(`Jones, you are in position for ${GAME.currentMission.title}. Keep your head down, bypass security grids, and eliminate priority targets.`);
  audio.speakRadioMessage("Jones, you are in position. Stealth is imperative. Bypass security grids and complete all primary objectives.");
}

// Perimeter Wire Fence Creation
function createPerimeterFence() {
  const fenceGeo = new THREE.BoxGeometry(200, 4, 0.2);
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x334433, wireframe: true });
  
  const f1 = new THREE.Mesh(fenceGeo, fenceMat); f1.position.set(0, 2, -100); scene.add(f1);
  const f2 = new THREE.Mesh(fenceGeo, fenceMat); f2.position.set(0, 2, 100); scene.add(f2);
  const f3 = new THREE.Mesh(fenceGeo, fenceMat); f3.position.set(-100, 2, 0); f3.rotation.y = Math.PI / 2; scene.add(f3);
  const f4 = new THREE.Mesh(fenceGeo, fenceMat); f4.position.set(100, 2, 0); f4.rotation.y = Math.PI / 2; scene.add(f4);
}

// Build Trainyard Level Architecture
function buildTrainyardMap() {
  // Main Warehouse Building
  const whGeo = new THREE.BoxGeometry(30, 10, 40);
  const whMat = new THREE.MeshStandardMaterial({ color: 0x222a22, roughness: 0.7 });
  const warehouse = new THREE.Mesh(whGeo, whMat);
  warehouse.position.set(0, 5, 0);
  scene.add(warehouse);
  buildings.push(warehouse);

  // Train Tracks & Carriages
  for (let i = -3; i <= 3; i++) {
    const carGeo = new THREE.BoxGeometry(6, 4, 18);
    const carMat = new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.6 });
    const carriage = new THREE.Mesh(carGeo, carMat);
    carriage.position.set(-35, 2, i * 22);
    scene.add(carriage);
    buildings.push(carriage);
  }

  // Watchtowers with Searchlights
  createWatchtower(-40, 0, -40);
  createWatchtower(40, 0, -40);

  // Computer Security Terminal inside Warehouse
  createTerminal(0, 1.2, -18);

  // Helipad Escape Zone
  createHelipad(0, 0.1, -70);

  // Spawn Guards
  spawnGuard(-20, 0, 20, 'PATROL');
  spawnGuard(20, 0, 10, 'PATROL');
  spawnGuard(0, 0, -10, 'COMMANDER'); // Priority Guard Commander Target!
  spawnGuard(-30, 0, -20, 'PATROL');
  spawnGuard(35, 0, -35, 'PATROL');
  spawnGuard(0, 0, 40, 'PATROL');

  // Spawn CCTV Cameras
  createCCTVCamera(-14, 7, 0);
  createCCTVCamera(14, 7, 0);

  // Alarm Boxes
  createAlarmBox(-14, 1.5, 5);
  createAlarmBox(14, 1.5, 5);
}

// Build Airbase SAM Level
function buildAirbaseMap() {
  // Runway
  const runGeo = new THREE.PlaneGeometry(30, 160);
  const runMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const runway = new THREE.Mesh(runGeo, runMat);
  runway.rotation.x = -Math.PI / 2;
  runway.position.set(0, 0.05, 0);
  scene.add(runway);

  // SAM Radar Dish Object
  const samBaseGeo = new THREE.CylinderGeometry(4, 5, 4, 12);
  const samDishGeo = new THREE.SphereGeometry(6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const samMat = new THREE.MeshStandardMaterial({ color: 0x556655, metalness: 0.8 });
  const samMesh = new THREE.Mesh(samDishGeo, samMat);
  samMesh.position.set(-40, 8, -20);
  samMesh.rotation.x = Math.PI / 4;
  scene.add(samMesh);
  buildings.push(samMesh);

  // Barracks
  const barGeo = new THREE.BoxGeometry(20, 6, 30);
  const barMat = new THREE.MeshStandardMaterial({ color: 0x334433 });
  const barracks = new THREE.Mesh(barGeo, barMat);
  barracks.position.set(35, 3, 0);
  scene.add(barracks);
  buildings.push(barracks);

  // Terminals & CCTV
  createTerminal(35, 1.2, 5);
  createCCTVCamera(-38, 6, -15);
  createCCTVCamera(32, 6, -10);

  // Guards
  for (let i = 0; i < 8; i++) {
    const x = (Math.random() - 0.5) * 80;
    const z = (Math.random() - 0.5) * 80;
    spawnGuard(x, 0, z, 'PATROL');
  }
}

// Build Snow Outpost Level
function buildSnowOutpostMap() {
  // Watchtowers with Snipers
  createWatchtower(-30, 0, 20);
  createWatchtower(30, 0, 20);
  createWatchtower(0, 0, -40);

  spawnGuard(-30, 10, 20, 'SNIPER');
  spawnGuard(30, 10, 20, 'SNIPER');
  spawnGuard(0, 10, -40, 'SNIPER');

  // Colonel Harrison Target
  spawnGuard(0, 0, -20, 'COMMANDER');

  // Bunker
  const bGeo = new THREE.BoxGeometry(25, 7, 25);
  const bMat = new THREE.MeshStandardMaterial({ color: 0x223344 });
  const bunker = new THREE.Mesh(bGeo, bMat);
  bunker.position.set(0, 3.5, -20);
  scene.add(bunker);
  buildings.push(bunker);

  createTerminal(0, 1.2, -22);
}

// Build Underground Silo Level
function buildUndergroundSiloMap() {
  // Underground Vault Walls
  const vGeo = new THREE.BoxGeometry(60, 12, 80);
  const vMat = new THREE.MeshStandardMaterial({ color: 0x111a13, roughness: 0.9, side: THREE.BackSide });
  const vault = new THREE.Mesh(vGeo, vMat);
  vault.position.set(0, 6, 0);
  scene.add(vault);

  createTerminal(0, 1.2, -30);
  
  for (let i = 0; i < 10; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 50;
    spawnGuard(x, 0, z, 'PATROL');
  }
}

// Helper: Create Watchtower
function createWatchtower(x, y, z) {
  const legGeo = new THREE.CylinderGeometry(0.3, 0.3, 10);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  
  const l1 = new THREE.Mesh(legGeo, legMat); l1.position.set(x - 3, y + 5, z - 3); scene.add(l1);
  const l2 = new THREE.Mesh(legGeo, legMat); l2.position.set(x + 3, y + 5, z - 3); scene.add(l2);
  const l3 = new THREE.Mesh(legGeo, legMat); l3.position.set(x - 3, y + 5, z + 3); scene.add(l3);
  const l4 = new THREE.Mesh(legGeo, legMat); l4.position.set(x + 3, y + 5, z + 3); scene.add(l4);

  const platGeo = new THREE.BoxGeometry(8, 0.5, 8);
  const platMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const platform = new THREE.Mesh(platGeo, platMat);
  platform.position.set(x, y + 10, z);
  scene.add(platform);
  buildings.push(platform);

  // Searchlight Spotlight
  const light = new THREE.SpotLight(0xffffaa, 2, 60, Math.PI / 6, 0.5);
  light.position.set(x, y + 10, z);
  light.target.position.set(x, 0, z + 20);
  scene.add(light);
  scene.add(light.target);
}

// Helper: Create Helipad
function createHelipad(x, y, z) {
  const padGeo = new THREE.CylinderGeometry(10, 10, 0.2, 24);
  const padMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  helipadMesh = new THREE.Mesh(padGeo, padMat);
  helipadMesh.position.set(x, y, z);
  scene.add(helipadMesh);
}

// Helper: Create Computer Security Terminal
function createTerminal(x, y, z) {
  const termGeo = new THREE.BoxGeometry(1.2, 1.8, 0.8);
  const termMat = new THREE.MeshStandardMaterial({ color: 0x224422, emissive: 0x113311 });
  const mesh = new THREE.Mesh(termGeo, termMat);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  terminals.push({ mesh, x, y, z, hacked: false });
}

// Helper: Create CCTV Security Camera
function createCCTVCamera(x, y, z) {
  const camGeo = new THREE.BoxGeometry(0.6, 0.4, 1.2);
  const camMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
  const mesh = new THREE.Mesh(camGeo, camMat);
  mesh.position.set(x, y, z);

  // Laser detection cone visual mesh
  const coneGeo = new THREE.ConeGeometry(5, 15, 12);
  const coneMat = new THREE.MeshBasicMaterial({ color: 0x33ccff, transparent: true, opacity: 0.15, wireframe: true });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.rotation.x = -Math.PI / 3;
  cone.position.set(0, -6, 5);
  mesh.add(cone);

  scene.add(mesh);
  cameras.push({ mesh, x, y, z, rotationAngle: 0, destroyed: false });
}

// Helper: Create Alarm Terminal Box
function createAlarmBox(x, y, z) {
  const boxGeo = new THREE.BoxGeometry(0.8, 1.2, 0.4);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xaa2222, emissive: 0x440000 });
  const mesh = new THREE.Mesh(boxGeo, boxMat);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  alarmBoxes.push({ mesh, x, y, z });
}

// Spawn Enemy Guard with AI
function spawnGuard(x, y, z, type = 'PATROL') {
  const group = new THREE.Group();

  // Guard Body Mesh
  const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.7, 8);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: type === 'COMMANDER' ? 0xaa3333 : 0x2e4228,
    roughness: 0.8
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.85;
  group.add(body);

  // Guard Head
  const headGeo = new THREE.SphereGeometry(0.25, 8, 8);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xd2a679 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.8;
  group.add(head);

  // Rifle Model
  const gunGeo = new THREE.BoxGeometry(0.1, 0.1, 0.8);
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const gun = new THREE.Mesh(gunGeo, gunMat);
  gun.position.set(0.3, 1.2, -0.3);
  group.add(gun);

  group.position.set(x, y, z);
  scene.add(group);

  guards.push({
    mesh: group,
    type: type,
    state: 'PATROL', // 'PATROL', 'SUSPICIOUS', 'ALERT', 'DEAD'
    health: type === 'COMMANDER' ? 120 : 60,
    maxHealth: type === 'COMMANDER' ? 120 : 60,
    speed: type === 'COMMANDER' ? 2.8 : 2.2,
    patrolOrigin: new THREE.Vector3(x, y, z),
    targetPos: new THREE.Vector3(x + (Math.random() - 0.5) * 20, y, z + (Math.random() - 0.5) * 20),
    lastShotTime: 0,
    headMesh: head,
  });
}

// Weapon Shoot Action
function shootWeapon() {
  const curWep = WEAPONS[GAME.player.selectedWeaponIndex];

  if (curWep.id !== 'knife' && curWep.clipAmmo <= 0) {
    audio.playClick();
    reloadWeapon();
    return;
  }

  if (curWep.id !== 'knife') {
    curWep.clipAmmo--;
    document.getElementById('hud-ammo-clip').textContent = curWep.clipAmmo;
  }

  // Play Sound Effect
  if (curWep.id === 'knife') audio.playGunshot('knife');
  else if (curWep.id === 'svd_sniper') audio.playGunshot('sniper');
  else if (curWep.suppressed) audio.playGunshot('suppressed');
  else audio.playGunshot('loud');

  // Muzzle flash light trigger
  weaponFlashLight.intensity = 3;
  setTimeout(() => { weaponFlashLight.intensity = 0; }, 40);

  // Recoil Animation Kick
  weaponMesh.position.z += 0.05;
  setTimeout(() => { weaponMesh.position.z -= 0.05; }, 80);

  // Unsuppressed gunshot noise detection radius!
  if (!curWep.suppressed) {
    alertNearbyGuards(camera.position, 60);
  }

  // Raycast Hit Check
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

  // Check Guard Hits
  const guardMeshes = guards.filter(g => g.state !== 'DEAD').map(g => g.mesh);
  const intersects = raycaster.intersectObjects(guardMeshes, true);

  if (intersects.length > 0) {
    const hitObj = intersects[0].object;
    const hitPoint = intersects[0].point;

    // Find parent guard
    let parentGroup = hitObj;
    while (parentGroup.parent && parentGroup.parent !== scene) {
      parentGroup = parentGroup.parent;
    }

    const guardObj = guards.find(g => g.mesh === parentGroup);
    if (guardObj) {
      const isHeadshot = (hitObj === guardObj.headMesh || hitPoint.y > guardObj.mesh.position.y + 1.5);
      const hitDamage = isHeadshot ? curWep.damage * 2.5 : curWep.damage;

      guardObj.health -= hitDamage;

      if (isHeadshot) GAME.headshots++;

      if (guardObj.health <= 0) {
        killGuard(guardObj, curWep.suppressed);
      } else {
        guardObj.state = 'ALERT';
        audio.playAlertShout();
      }
    }
  }

  // Check CCTV Camera Hits
  const cameraMeshes = cameras.filter(c => !c.destroyed).map(c => c.mesh);
  const camIntersects = raycaster.intersectObjects(cameraMeshes, true);
  if (camIntersects.length > 0) {
    const camMesh = camIntersects[0].object;
    const camObj = cameras.find(c => c.mesh === camMesh || c.mesh === camMesh.parent);
    if (camObj) {
      camObj.destroyed = true;
      camObj.mesh.visible = false;
      audio.playClick();
      showRadioSubtitle("CCTV security camera destroyed!");
    }
  }
}

// Reload Weapon
function reloadWeapon() {
  const curWep = WEAPONS[GAME.player.selectedWeaponIndex];
  if (curWep.id === 'knife' || curWep.reserveAmmo <= 0 || curWep.clipAmmo === curWep.clipSize) return;

  const needed = curWep.clipSize - curWep.clipAmmo;
  const toLoad = Math.min(needed, curWep.reserveAmmo);
  
  curWep.clipAmmo += toLoad;
  curWep.reserveAmmo -= toLoad;

  audio.playReload();
  updateWeaponModel();
}

// Select Weapon Slot
function selectWeapon(index) {
  if (index < 0 || index >= WEAPONS.length) return;
  GAME.player.selectedWeaponIndex = index;
  audio.playClick();
  updateWeaponModel();
}

// Toggle Scope Aim
function toggleScope() {
  const curWep = WEAPONS[GAME.player.selectedWeaponIndex];
  if (curWep.id !== 'svd_sniper') return;

  GAME.player.isScoping = !GAME.player.isScoping;
  const scopeEl = document.getElementById('sniper-scope');

  if (GAME.player.isScoping) {
    camera.fov = 18; // High zoom
    scopeEl.style.display = 'block';
  } else {
    camera.fov = 70;
    scopeEl.style.display = 'none';
  }
  camera.updateProjectionMatrix();
}

// Alert Nearby Guards when loud noise occurs
function alertNearbyGuards(sourcePos, radius) {
  guards.forEach(g => {
    if (g.state === 'DEAD') return;
    const dist = g.mesh.position.distanceTo(sourcePos);
    if (dist <= radius) {
      g.state = 'SUSPICIOUS';
      g.targetPos.copy(sourcePos);
    }
  });
}

// Kill Guard Logic
function killGuard(guardObj, silent) {
  guardObj.state = 'DEAD';
  guardObj.mesh.rotation.x = Math.PI / 2; // Fall to ground
  guardObj.mesh.position.y = 0.2;

  GAME.kills++;
  if (silent) GAME.stealthKills++;
  GAME.score += guardObj.type === 'COMMANDER' ? 500 : 200;

  // Objective check: Eliminate Commander
  if (guardObj.type === 'COMMANDER') {
    completeObjective('obj_cmd');
    completeObjective('obj_harrison');
  }
}

// Trigger Base Security Alarm
function triggerBaseAlarm(reasonText = "BASE ALARM TRIGGERED!") {
  if (GAME.alarmActive) return;
  
  GAME.alarmActive = true;
  GAME.alarmsTriggered++;
  audio.startAlarmSiren();

  document.getElementById('alarm-status-text').textContent = 'EMERGENCY RED ALERT!';
  document.getElementById('alarm-status-text').style.color = 'var(--igi-red)';
  document.getElementById('alarm-panel').style.borderColor = 'var(--igi-red)';

  showRadioSubtitle(`ANYA HQ: ${reasonText} Enemy reinforcements inbound!`);

  // Alert all guards globally
  guards.forEach(g => {
    if (g.state !== 'DEAD') g.state = 'ALERT';
  });

  // Spawn 3 Reinforcement Guards
  spawnGuard(camera.position.x + 30, 0, camera.position.z + 30, 'PATROL');
  spawnGuard(camera.position.x - 30, 0, camera.position.z - 30, 'PATROL');
}

// Interact with Terminal [F]
function interactObject() {
  // Terminal interact check
  terminals.forEach(t => {
    if (!t.hacked && camera.position.distanceTo(t.mesh.position) < 3.5) {
      t.hacked = true;
      audio.playClick();
      showRadioSubtitle("Security mainframe terminal hacked! CCTV override active.");
      completeObjective('obj_hack');
      completeObjective('obj_cctv');
      completeObjective('obj_laser');
    }
  });

  // Helipad / Escape check
  if (helipadMesh && camera.position.distanceTo(helipadMesh.position) < 8.0) {
    completeObjective('obj_escape');
    completeObjective('obj_truck');
    completeObjective('obj_snowmobile');
    completeObjective('obj_elevator');
    checkMissionVictory();
  }
}

// Complete Mission Objective
function completeObjective(objId) {
  if (!GAME.currentMission) return;
  const obj = GAME.currentMission.objectives.find(o => o.id === objId);
  if (obj && !obj.done) {
    obj.done = true;
    GAME.score += 1000;
    audio.playClick();
    showRadioSubtitle(`OBJECTIVE COMPLETE: ${obj.text}`);
    updatePDAMap();
  }

  // Check if all primary objectives completed
  const allDone = GAME.currentMission.objectives.every(o => o.done);
  if (allDone) {
    checkMissionVictory();
  }
}

// Check Victory
function checkMissionVictory() {
  GAME.active = false;
  document.exitPointerLock();
  audio.stopAlarmSiren();

  const totalTime = Math.floor((Date.now() - GAME.startTime) / 1000);
  const minutes = String(Math.floor(totalTime / 60)).padStart(2, '0');
  const seconds = String(totalTime % 60).padStart(2, '0');

  // Calculate Rating Grade
  let grade = 'COMMANDER';
  let stealthStr = '100% GHOST SILENCE';
  if (GAME.alarmsTriggered === 0 && GAME.kills === GAME.stealthKills) {
    grade = 'GHOST';
  } else if (GAME.alarmsTriggered <= 1) {
    grade = 'SHADOW';
    stealthStr = 'TACTICAL STEALTH';
  } else {
    grade = 'COMMANDO';
    stealthStr = 'COMBAT ASSAULT';
  }

  // Populate Debrief Screen
  document.getElementById('debrief-status-title').textContent = 'MISSION ACCOMPLISHED';
  document.getElementById('debrief-status-title').className = 'debrief-title success';
  document.getElementById('debrief-grade').textContent = grade;
  document.getElementById('debrief-score').textContent = GAME.score.toLocaleString();
  document.getElementById('debrief-time').textContent = `${minutes}:${seconds}`;
  document.getElementById('debrief-kills').textContent = GAME.kills;
  document.getElementById('debrief-stealth-rating').textContent = stealthStr;
  document.getElementById('debrief-alarms').textContent = GAME.alarmsTriggered;
  document.getElementById('debrief-headshots').textContent = `${GAME.kills > 0 ? Math.round((GAME.headshots / GAME.kills) * 100) : 100}%`;

  document.getElementById('debrief-modal').style.display = 'flex';

  // Save Score to API Backend
  saveScoreToAPI({
    player_name: "David Jones",
    mission_id: GAME.missionId,
    score: GAME.score,
    time_seconds: totalTime,
    kills: GAME.kills,
    stealth_rating: grade
  });
}

// Check Player Game Over
function triggerGameOver() {
  GAME.active = false;
  document.exitPointerLock();
  audio.stopAlarmSiren();

  document.getElementById('debrief-status-title').textContent = 'AGENT KILLED IN ACTION';
  document.getElementById('debrief-status-title').className = 'debrief-title failed';
  document.getElementById('debrief-status-sub').textContent = 'Agent David Jones was compromised by hostile security forces.';
  document.getElementById('debrief-grade').textContent = 'FAILED';
  document.getElementById('debrief-score').textContent = '0';
  document.getElementById('debrief-modal').style.display = 'flex';
}

// Toggle Satellite PDA Map Overlay (M or TAB)
function togglePDA() {
  GAME.pdaOpen = !GAME.pdaOpen;
  const pdaEl = document.getElementById('tactical-pda');
  
  if (GAME.pdaOpen) {
    pdaEl.style.display = 'flex';
    document.exitPointerLock();
    updatePDAMap();
  } else {
    pdaEl.style.display = 'none';
    const container = document.getElementById('canvas-container');
    container.requestPointerLock();
  }
}

// Toggle Night Vision (NVG)
function toggleNVG() {
  GAME.modeNVG = !GAME.modeNVG;
  GAME.modeThermal = false;
  
  const container = document.getElementById('canvas-container');
  container.classList.remove('thermal-mode');
  
  if (GAME.modeNVG) {
    container.classList.add('nvg-mode');
    audio.playClick();
  } else {
    container.classList.remove('nvg-mode');
  }
}

// Toggle Thermal Vision
function toggleThermal() {
  GAME.modeThermal = !GAME.modeThermal;
  GAME.modeNVG = false;

  const container = document.getElementById('canvas-container');
  container.classList.remove('nvg-mode');

  if (GAME.modeThermal) {
    container.classList.add('thermal-mode');
    audio.playClick();
  } else {
    container.classList.remove('thermal-mode');
  }
}

// Update Satellite PDA 2D Radar Canvas
function updatePDAMap() {
  const canvas = document.getElementById('sat-map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  ctx.fillStyle = '#050a06';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const scale = 2.5;

  // Grid Lines
  ctx.strokeStyle = 'rgba(58, 242, 75, 0.15)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // Draw Buildings
  ctx.fillStyle = '#1e3a22';
  buildings.forEach(b => {
    const mapX = centerX + (b.position.x - camera.position.x) * scale;
    const mapY = centerY + (b.position.z - camera.position.z) * scale;
    ctx.fillRect(mapX - 15, mapY - 15, 30, 30);
  });

  // Draw Guards (Red dots)
  guards.forEach(g => {
    if (g.state === 'DEAD') return;
    const mapX = centerX + (g.mesh.position.x - camera.position.x) * scale;
    const mapY = centerY + (g.mesh.position.z - camera.position.z) * scale;
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(mapX, mapY, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw Player (White dot & Direction Arrow)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
  ctx.fill();

  // PDA Objectives List UI
  const objList = document.getElementById('pda-objectives-list');
  if (objList && GAME.currentMission) {
    objList.innerHTML = '';
    GAME.currentMission.objectives.forEach(o => {
      const item = document.createElement('div');
      item.className = `objective-item ${o.done ? 'completed' : ''}`;
      item.innerHTML = `
        <span class="obj-checkbox ${o.done ? 'checked' : ''}"></span>
        <span>${o.text}</span>
      `;
      objList.appendChild(item);
    });
  }

  document.getElementById('pda-coords').textContent = `GPS: ${camera.position.x.toFixed(1)}° N, ${camera.position.z.toFixed(1)}° E`;
}

// Show Subtitle Text for Anya Voice Briefings
function showRadioSubtitle(text) {
  const box = document.getElementById('radio-subtitles');
  const body = document.getElementById('radio-text');
  body.textContent = text;
  box.style.display = 'block';

  setTimeout(() => {
    box.style.display = 'none';
  }, 6000);
}

// Start Active Selected Mission
function startActiveMission() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('debrief-modal').style.display = 'none';

  GAME.active = true;
  GAME.paused = false;
  GAME.score = 0;
  GAME.kills = 0;
  GAME.headshots = 0;
  GAME.stealthKills = 0;
  GAME.alarmsTriggered = 0;
  GAME.player.health = 100;
  GAME.player.armor = 100;
  GAME.startTime = Date.now();

  // Reset weapons ammo
  WEAPONS.forEach(w => {
    w.clipAmmo = w.clipSize;
  });

  const mData = MISSIONS[GAME.missionId] || MISSIONS['mission_1'];
  loadMissionWorld(mData);
  updateWeaponModel();

  const container = document.getElementById('canvas-container');
  container.requestPointerLock();
}

// Launch Custom Mission from Sandbox Editor
function launchCustomMission() {
  const title = document.getElementById('custom-title').value;
  const desc = document.getElementById('custom-desc').value;
  const mapType = document.getElementById('custom-map-type').value;
  const weather = document.getElementById('custom-weather').value;

  const customData = {
    id: `custom_${Date.now()}`,
    title: title.toUpperCase(),
    desc: desc,
    loadout: 'CUSTOM LOADOUT',
    security: 'CUSTOM PATROLS',
    mapType: mapType,
    weather: weather,
    objectives: [
      { id: 'obj_hack', text: 'Hack Mainframe Terminal', done: false },
      { id: 'obj_cmd', text: 'Eliminate Target Commander', done: false },
      { id: 'obj_escape', text: 'Escape to Extraction Point', done: false },
    ]
  };

  document.getElementById('builder-modal').style.display = 'none';
  GAME.currentMission = customData;
  GAME.missionId = customData.id;

  startActiveMission();
}

// Return to Main HQ Menu
function exitToMainMenu() {
  GAME.active = false;
  document.exitPointerLock();
  audio.stopAlarmSiren();

  document.getElementById('debrief-modal').style.display = 'none';
  document.getElementById('main-menu').style.display = 'flex';
}

// Main Frame Update Loop
function gameLoop(time) {
  requestAnimationFrame(gameLoop);

  if (!GAME.active || GAME.paused) {
    renderer.render(scene, camera);
    return;
  }

  const delta = 0.016; // approx 60fps

  // Player Physics & Movement Logic
  updatePlayerMovement(delta);

  // Update Guard AI Behavior
  updateGuardAI(delta);

  // Update CCTV Cameras
  updateCCTVLogic(delta);

  // Action Prompt Check [F]
  updateInteractionPrompts();

  // Radar Minimap Update
  updateMinimapRadar();

  // Render 3D Scene
  renderer.render(scene, camera);
}

// Update Player Position & Collision
function updatePlayerMovement(delta) {
  const moveSpeed = (moveState.sprint ? 7.5 : (moveState.crouch ? 2.5 : 4.5));
  
  const moveDir = new THREE.Vector3();
  if (moveState.forward) moveDir.z -= 1;
  if (moveState.backward) moveDir.z += 1;
  if (moveState.left) moveDir.x -= 1;
  if (moveState.right) moveDir.x += 1;
  moveDir.normalize();

  moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), moveState.yaw);

  camera.position.x += moveDir.x * moveSpeed * delta;
  camera.position.z += moveDir.z * moveSpeed * delta;

  // Crouch Camera Height adjustment
  const targetCamY = moveState.crouch ? 0.9 : 1.7;
  camera.position.y += (targetCamY - camera.position.y) * 0.15;

  // Stealth Visibility Meter Calculation
  let vis = moveState.sprint ? 80 : (moveState.crouch ? 15 : 40);
  if (GAME.weather === 'fog') vis *= 0.6;
  GAME.player.visibility = vis;
  
  document.getElementById('bar-stealth').style.width = `${vis}%`;
  document.getElementById('bar-health').style.width = `${GAME.player.health}%`;
  document.getElementById('bar-armor').style.width = `${GAME.player.armor}%`;
}

// Update Enemy Guard AI Logic
function updateGuardAI(delta) {
  guards.forEach(g => {
    if (g.state === 'DEAD') return;

    const distToPlayer = g.mesh.position.distanceTo(camera.position);

    // Guard Vision Cone Check
    if (distToPlayer < 45) {
      const guardForward = new THREE.Vector3(0, 0, -1).applyQuaternion(g.mesh.quaternion);
      const toPlayer = new THREE.Vector3().subVectors(camera.position, g.mesh.position).normalize();
      const angle = guardForward.angleTo(toPlayer);

      // Vision angle test
      if (angle < Math.PI / 3 && distToPlayer < (45 * (GAME.player.visibility / 100))) {
        if (g.state !== 'ALERT') {
          g.state = 'ALERT';
          audio.playAlertShout();
          triggerBaseAlarm("INTRUDER SPOTTED BY GUARD PATROL!");
        }
      }
    }

    if (g.state === 'PATROL') {
      // Walk towards target patrol position
      const dir = new THREE.Vector3().subVectors(g.targetPos, g.mesh.position);
      if (dir.length() < 1.5) {
        g.targetPos.set(
          g.patrolOrigin.x + (Math.random() - 0.5) * 30,
          0,
          g.patrolOrigin.z + (Math.random() - 0.5) * 30
        );
      } else {
        dir.y = 0; dir.normalize();
        g.mesh.position.addScaledVector(dir, g.speed * delta);
        g.mesh.lookAt(g.targetPos.x, g.mesh.position.y, g.targetPos.z);
      }
    } else if (g.state === 'ALERT') {
      // Chase & Shoot Player
      g.mesh.lookAt(camera.position.x, g.mesh.position.y, camera.position.z);
      
      if (distToPlayer > 8) {
        const dir = new THREE.Vector3().subVectors(camera.position, g.mesh.position);
        dir.y = 0; dir.normalize();
        g.mesh.position.addScaledVector(dir, g.speed * 1.3 * delta);
      }

      // Shoot at player every 1.2 seconds
      const now = Date.now();
      if (now - g.lastShotTime > 1200) {
        g.lastShotTime = now;
        audio.playGunshot('loud');

        // Player takes damage based on distance
        if (distToPlayer < 30) {
          const dmg = 15;
          if (GAME.player.armor > 0) {
            GAME.player.armor = Math.max(0, GAME.player.armor - dmg);
          } else {
            GAME.player.health = Math.max(0, GAME.player.health - dmg);
          }

          // Damage Red Flash
          const flash = document.getElementById('damage-flash');
          flash.style.opacity = '0.8';
          setTimeout(() => { flash.style.opacity = '0'; }, 150);

          if (GAME.player.health <= 0) {
            triggerGameOver();
          }
        }
      }
    }
  });
}

// Update CCTV Logic
function updateCCTVLogic(delta) {
  cameras.forEach(c => {
    if (c.destroyed) return;

    c.rotationAngle += delta * 0.8;
    c.mesh.rotation.y = Math.sin(c.rotationAngle) * 0.8;

    // Detection check
    const dist = camera.position.distanceTo(c.mesh.position);
    if (dist < 25) {
      triggerBaseAlarm("CCTV CAMERA SPOTTED INTRUDER!");
    }
  });
}

// Action Prompts Overlay Check
function updateInteractionPrompts() {
  const prompt = document.getElementById('action-prompt');
  let nearObj = false;

  terminals.forEach(t => {
    if (!t.hacked && camera.position.distanceTo(t.mesh.position) < 3.5) {
      prompt.innerHTML = `PRESS <span style="color: var(--igi-green); font-weight: bold;">[F]</span> TO HACK SECURITY TERMINAL`;
      prompt.style.display = 'block';
      nearObj = true;
    }
  });

  if (helipadMesh && camera.position.distanceTo(helipadMesh.position) < 8.0) {
    prompt.innerHTML = `PRESS <span style="color: var(--igi-green); font-weight: bold;">[F]</span> TO ESCAPE VIA HELICOPTER`;
    prompt.style.display = 'block';
    nearObj = true;
  }

  if (!nearObj) {
    prompt.style.display = 'none';
  }
}

// Minimap Radar Dot Update
function updateMinimapRadar() {
  const container = document.getElementById('radar-blips-container');
  if (!container) return;
  container.innerHTML = '';

  const scale = 1.2;

  // Add Guard Blips
  guards.forEach(g => {
    if (g.state === 'DEAD') return;
    const relX = (g.mesh.position.x - camera.position.x) * scale;
    const relZ = (g.mesh.position.z - camera.position.z) * scale;

    if (Math.hypot(relX, relZ) < 60) {
      const dot = document.createElement('div');
      dot.className = 'radar-dot enemy';
      dot.style.left = `${70 + relX}px`;
      dot.style.top = `${70 + relZ}px`;
      container.appendChild(dot);
    }
  });

  // Player Dot Center
  const playerDot = document.createElement('div');
  playerDot.className = 'radar-dot player';
  playerDot.style.left = '70px';
  playerDot.style.top = '70px';
  container.appendChild(playerDot);
}

// Window Resize Handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// API Calls (Cloudflare Worker Durable Object SQLite)
async function fetchScores() {
  try {
    const res = await fetch('./api/scores');
    if (res.ok) {
      const data = await res.json();
      GAME.highScores = data.scores || [];
      renderScoresTable();
    }
  } catch (err) {
    console.error("Failed to fetch high scores:", err);
  }
}

async function saveScoreToAPI(scoreObj) {
  try {
    await fetch('./api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreObj)
    });
    fetchScores();
  } catch (err) {
    console.error("Failed to save score:", err);
  }
}

function renderScoresTable() {
  const tbody = document.getElementById('scores-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (GAME.highScores.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888;">No classified score records archived yet. Complete operations to establish record.</td></tr>`;
    return;
  }

  GAME.highScores.forEach(s => {
    const tr = document.createElement('tr');
    const dateStr = new Date(s.created_at).toLocaleDateString();
    const min = String(Math.floor(s.time_seconds / 60)).padStart(2, '0');
    const sec = String(s.time_seconds % 60).padStart(2, '0');

    tr.innerHTML = `
      <td style="color: var(--igi-green); font-weight: bold;">${s.player_name}</td>
      <td>${(s.mission_id || 'MISSION 1').toUpperCase()}</td>
      <td style="color: var(--igi-amber);">${s.score.toLocaleString()}</td>
      <td>${min}:${sec}</td>
      <td>${s.kills}</td>
      <td><span style="border: 1px solid var(--igi-green); padding: 2px 6px; font-size: 11px;">${s.stealth_rating}</span></td>
      <td style="color: #777;">${dateStr}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Initialize application on DOM ready
window.addEventListener('DOMContentLoaded', initApp);
