// Matter.js aliases
const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events,
    Vector = Matter.Vector;

// Game State
const GAME_STATE = {
    PLAYING: 'playing',
    GAME_OVER: 'gameover'
};

let currentState = GAME_STATE.PLAYING;
let stableScore = 0;
let stableTimer = 0; // ms
const STABLE_THRESHOLD = 0.5; // velocity threshold

// Settings
const settings = {
    gravity: 0.2,    // Reset to 0.2 as requested
    restitution: 0.2, // Low bounciness
    friction: 0.95,   // High friction
    platformFriction: Infinity, // Zero slip
    airFriction: 0.05, // Air resistance
    bananaScale: 1.0
};

// Setup
const engine = Engine.create();
const world = engine.world;
let render;
let runner;
let platform;
let deathZoneY = 800;

// Input
let mouseX = window.innerWidth / 2;
let mouseY = 100;

function init() {
    // Create renderer
    render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent',
            hasBounds: true
        }
    });

    // Platform
    const platformWidth = Math.min(600, window.innerWidth * 0.8 * 1.2);
    const platformHeight = 40;
    const startY = window.innerHeight - 50;

    platform = Bodies.rectangle(window.innerWidth / 2, startY, platformWidth, platformHeight, {
        isStatic: true,
        friction: settings.platformFriction,
        frictionStatic: Infinity,
        render: { fillStyle: '#8e44ad' },
        label: 'platform'
    });

    deathZoneY = startY + 50;

    Composite.add(world, platform);

    // Start runner
    runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // Apply initial settings
    engine.gravity.y = settings.gravity;

    // Events
    window.addEventListener('resize', onResize);

    // Draw High Score Line
    Events.on(render, 'afterRender', drawHighScoreLine);

    // Input Handling
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    });

    // Spawn Input
    render.canvas.addEventListener('click', (e) => trySpawnBanana(e.clientX, e.clientY));
    render.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (e.changedTouches.length > 0) {
            const t = e.changedTouches[0];
            trySpawnBanana(t.clientX, t.clientY);
        }
    });

    // GUI
    setupGUI();

    // Game Loop
    Events.on(engine, 'beforeUpdate', updateGameLoop);
}

function updateGameLoop(event) {
    if (currentState !== GAME_STATE.PLAYING) return;

    // 1. Check Game Over & Score Logic
    let maxScoreHeight = 0;
    let allStable = true;
    let hasBananas = false;
    const platformTop = platform.position.y - 20;

    const bodies = Composite.allBodies(world);
    for (const body of bodies) {
        if (body.isStatic || body.label === 'platform') continue;

        // Game Over Check
        if (body.position.y > deathZoneY) {
            triggerGameOver();
            return;
        }

        hasBananas = true;

        // Score Calculation
        const h = platformTop - body.bounds.min.y;
        if (h > maxScoreHeight) maxScoreHeight = h;

        // Stability Check
        if (body.speed > STABLE_THRESHOLD || body.angularSpeed > STABLE_THRESHOLD) {
            allStable = false;
        }
    }

    // 2. Update Stability / High Score
    updateStabilityLogic(hasBananas, maxScoreHeight, allStable);
}

function updateStabilityLogic(hasBananas, maxScoreHeight, allStable) {
    const currentScore = Math.max(0, maxScoreHeight / 50);
    const stabilityEl = document.getElementById('stability-indicator');

    if (!stabilityEl) return;

    if (hasBananas && currentScore > stableScore && allStable && currentScore > 0.1) {
        stableTimer += engine.timing.lastDelta;
        stabilityEl.style.display = 'block';
        stabilityEl.textContent = `Verifying... ${(stableTimer / 1000).toFixed(1)}s`;

        if (stableTimer > 1000) {
            // New Record
            stableScore = currentScore;
            stableTimer = 0;
            const scoreEl = document.getElementById('score-display');
            if (scoreEl) scoreEl.textContent = `Height: ${stableScore.toFixed(2)}m`;

            stabilityEl.style.display = 'none'; // Hide verifying

            // Flash "New Record" (Optional, could be improved UI)
            // For now just update score
        }
    } else {
        stableTimer = 0;
        stabilityEl.style.display = 'none';
    }
}

function drawHighScoreLine() {
    if (stableScore <= 0) return;

    const context = render.context;
    const platformTop = platform.position.y - 20;
    const lineY = platformTop - (stableScore * 50);
    const viewY = lineY - render.bounds.min.y;

    if (viewY > 0 && viewY < render.canvas.height) {
        context.beginPath();
        context.moveTo(0, viewY);
        context.lineTo(render.canvas.width, viewY);
        context.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        context.lineWidth = 2;
        context.setLineDash([10, 10]);
        context.stroke();
        context.setLineDash([]);

        context.fillStyle = 'rgba(255, 215, 0, 0.8)';
        context.font = '16px Arial';
        context.fillText(`Record: ${stableScore.toFixed(2)}m`, 10, viewY - 5);
    }
}

function trySpawnBanana(inX, inY) {
    if (currentState !== GAME_STATE.PLAYING) return;

    let targetX = inX !== undefined ? inX : mouseX;

    // Constrain Spawn Position
    const spawnX = Math.max(50, Math.min(window.innerWidth - 50, targetX));
    const spawnY = Math.max(0, inY !== undefined ? inY : mouseY);

    spawnBanana(spawnX, spawnY);
}

function spawnBanana(x, y) {
    const screenScale = Math.min(window.innerWidth / 400, 1.2);
    const currentScale = screenScale * settings.bananaScale;

    // Tight Crescent Vertices
    const vertices = [
        { x: 10, y: 0 },
        { x: 50, y: -10 },
        { x: 90, y: 0 },
        { x: 80, y: 20 },
        { x: 50, y: 25 },
        { x: 20, y: 20 }
    ];

    const body = Bodies.fromVertices(x, y, [vertices], {
        angle: Math.random() * Math.PI,
        restitution: settings.restitution,
        friction: settings.friction,
        frictionAir: settings.airFriction,
        density: 0.002,
        render: {
            sprite: {
                texture: 'assets/banana.png',
                xScale: 0.16, // Fixed scale for now, could be dynamic
                yScale: 0.16
            }
        }
    });

    if (body) Composite.add(world, body);
}

function triggerGameOver() {
    currentState = GAME_STATE.GAME_OVER;
    const finalScoreEl = document.getElementById('final-score');
    if (finalScoreEl) finalScoreEl.textContent = `Height: ${stableScore.toFixed(2)}m`;

    const goScreen = document.getElementById('game-over-screen');
    if (goScreen) goScreen.classList.add('visible');

    // Restart Button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent restart click from triggering spawn
            restartGame();
        });
        restartBtn.addEventListener('touchend', (e) => {
            e.preventDefault(); // Prevent standard click emulation if needed
            e.stopPropagation();
            restartGame();
        });
    }
}

function restartGame() {
    // Clear all bananas
    // Iterate and remove individually to ensure compatibility
    const bodies = Composite.allBodies(world);
    for (const body of bodies) {
        if (!body.isStatic && body.label !== 'platform') {
            Composite.remove(world, body);
        }
    }

    stableScore = 0;
    stableTimer = 0;
    document.getElementById('score-display').textContent = 'Height: 0.00m';
    document.getElementById('stability-indicator').style.display = 'none';
    document.getElementById('game-over-screen').classList.remove('visible');

    currentState = GAME_STATE.PLAYING;
}

function onResize() {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    // Re-center platform if needed? 
    // For now simpler to just reload or let it be slightly off-center until restart.
    // If strict, we'd enable Body.setPosition(platform, ...).
}

function setupGUI() {
    const gui = new lil.GUI({ title: 'Debug Mode' });
    const f1 = gui.addFolder('Physics');
    f1.add(settings, 'gravity', 0, 0.5).name('Gravity').onChange(v => engine.gravity.y = v);
    f1.add(settings, 'airFriction', 0, 0.5).name('Air Resistance').onChange(v => {
        Composite.allBodies(world).forEach(b => {
            if (!b.isStatic && b.label !== 'platform') b.frictionAir = v;
        });
    });
    f1.add(settings, 'friction', 0, 1.0).name('Friction');
    // f1.open(); // Start closed

    const f2 = gui.addFolder('Game');
    f2.add({ restart: restartGame }, 'restart').name('Restart');

    // Default closed
    gui.close();
}

window.onload = init;
