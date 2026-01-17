// Matter.js aliases
const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events;

// Settings
const settings = {
    gravity: 1,
    restitution: 0.6, // Bounciness
    friction: 0.5,
    bananaScale: 1.0,
    spawnRate: 10,
    clearAll: () => {
        const bodies = Composite.allBodies(engine.world);
        // Keep walls (static bodies)
        const nonStatic = bodies.filter(b => !b.isStatic);
        Composite.remove(engine.world, nonStatic);
    }
};

// Setup
const engine = Engine.create();
const world = engine.world;
let render;
let runner;
let ground, leftWall, rightWall;

function init() {
    // Create renderer
    render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });

    // Create walls
    updateWalls();

    // Mouse control (for dragging interactions if desired, mainly for compatibility)
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });
    Composite.add(world, mouseConstraint);

    // Keep the mouse in sync with rendering
    render.mouse = mouse;

    // Start runner
    runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // Events
    window.addEventListener('resize', onResize);
    // Use 'pointerdown' for unified mouse/touch handling, but we want to avoid issues with dragging settings
    // A simple click/tap on the background should spawn.
    render.canvas.addEventListener('pointerdown', handleInput);

    // GUI
    setupGUI();
}

function updateWalls() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const wallThickness = 60;

    // Remove existing walls if they exist
    if (ground) Composite.remove(world, ground);
    if (leftWall) Composite.remove(world, leftWall);
    if (rightWall) Composite.remove(world, rightWall);

    ground = Bodies.rectangle(width / 2, height + wallThickness / 2 - 10, width, wallThickness, { isStatic: true, render: { fillStyle: '#2e2b44' } });
    leftWall = Bodies.rectangle(0 - wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });
    rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });

    Composite.add(world, [ground, leftWall, rightWall]);

    // Update render bounds
    render.bounds.max.x = width;
    render.bounds.max.y = height;
    render.options.width = width;
    render.options.height = height;
    render.canvas.width = width;
    render.canvas.height = height;
}

function onResize() {
    updateWalls();
}

function handleInput(event) {
    // Prevent default to stop scrolling/zooming on crazy tapping
    // event.preventDefault(); // Note: might interfere with UI if not careful, but canvas is below UI usually.

    const x = event.clientX;
    const y = event.clientY;

    spawnBanana(x, y);
}

function spawnBanana(x, y) {
    const baseSize = 50;
    const screenScale = Math.min(window.innerWidth / 400, 1.2);
    const currentScale = screenScale * settings.bananaScale;

    // Define crescent banana vertices (approximate unscaled 100x100 box)
    const vertices = [
        { x: 40, y: -45 },
        { x: 50, y: -20 },
        { x: 50, y: 10 },
        { x: 35, y: 45 },
        { x: 10, y: 35 },
        { x: 10, y: 10 },
        { x: 20, y: -30 }
    ];

    const body = Bodies.fromVertices(x, y, [vertices], {
        angle: Math.random() * Math.PI * 2,
        restitution: settings.restitution,
        friction: settings.friction,
        render: {
            sprite: {
                texture: 'assets/banana.png',
                // Initial scale guess, will need to be matched to the body size
                xScale: currentScale * 0.12,
                yScale: currentScale * 0.12
            }
        }
    });

    if (body) {
        // Scale the body to match the desired size
        // Default vertices height is ~90px. Target is roughly baseSize * currentScale.
        const scaleFactor = (baseSize * currentScale) / 50;
        Matter.Body.scale(body, scaleFactor, scaleFactor);

        // Adjust sprite to stick to body
        // 0.12 is a guess for 1024px image on a ~50px body.
        // If image is 1024px, 0.12 * 1024 = 122px.
        // Body is 50px * scaleFactor.
        // We probably need to scale sprite exactly by scaleFactor * constant.
        if (body.render.sprite) {
            body.render.sprite.xScale = scaleFactor * 0.16; // Tuned
            body.render.sprite.yScale = scaleFactor * 0.16;
        }

        Composite.add(world, body);
    }
}

function setupGUI() {
    const gui = new lil.GUI({ title: 'Banana Settings' });

    gui.add(settings, 'gravity', 0, 5).onChange(v => engine.gravity.y = v);
    gui.add(settings, 'restitution', 0, 1.2).name('Bounciness');
    gui.add(settings, 'bananaScale', 0.5, 3.0).name('Size Multiplier');
    gui.add(settings, 'clearAll').name('Clear Bananas');
}

// Run
init();
