/* =========================================================
   REVIX — HORIZONTAL LIQUID WAVES
   ========================================================= */

const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

let mouse = {
    x: -1000,
    y: -1000
};


/* ---------------------------------------------------------
   WAVE CONFIGURATION
   --------------------------------------------------------- */

const waves = [

    {
        base: 0.70,
        amplitude: 38,
        frequency: 0.0060,
        speed: 0.00022,
        thickness: 1.2,
        opacity: 0.72,
        glow: 13
    },

    {
        base: 0.76,
        amplitude: 27,
        frequency: 0.0053,
        speed: 0.00018,
        thickness: 0.8,
        opacity: 0.38,
        glow: 8
    },

    {
        base: 0.81,
        amplitude: 34,
        frequency: 0.0046,
        speed: 0.00016,
        thickness: 1,
        opacity: 0.48,
        glow: 10
    },

    {
        base: 0.86,
        amplitude: 25,
        frequency: 0.0040,
        speed: 0.00014,
        thickness: 0.75,
        opacity: 0.30,
        glow: 7
    },

    {
        base: 0.91,
        amplitude: 20,
        frequency: 0.0035,
        speed: 0.00012,
        thickness: 0.7,
        opacity: 0.23,
        glow: 6
    }

];


/* ---------------------------------------------------------
   STARS
   --------------------------------------------------------- */

const stars = [];

const STAR_COUNT = 115;

function createStars() {

    stars.length = 0;

    for (let i = 0; i < STAR_COUNT; i++) {

        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight * 0.88,

            radius:
                Math.random() < 0.85
                    ? Math.random() * 1.1 + 0.25
                    : Math.random() * 1.8 + 0.7,

            baseAlpha:
                Math.random() * 0.48 + 0.20,

            phase:
                Math.random() * Math.PI * 2,

            twinkle:
                Math.random() * 0.0015 + 0.0004,

            drift:
                Math.random() * 0.08 + 0.02
        });

    }

}


/* ---------------------------------------------------------
   RESIZE
   --------------------------------------------------------- */

function resizeCanvas() {

    width = window.innerWidth;
    height = window.innerHeight;

    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    createStars();
}

window.addEventListener(
    "resize",
    resizeCanvas
);


/* ---------------------------------------------------------
   MOUSE
   --------------------------------------------------------- */

window.addEventListener(
    "mousemove",
    (event) => {

        mouse.x = event.clientX;
        mouse.y = event.clientY;

    },
    { passive: true }
);


window.addEventListener(
    "mouseleave",
    () => {

        mouse.x = -1000;
        mouse.y = -1000;

    }
);


/* ---------------------------------------------------------
   BACKGROUND
   --------------------------------------------------------- */

function drawBackground() {

    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        height
    );

    gradient.addColorStop(
        0,
        "rgba(0, 4, 3, 0)"
    );

    gradient.addColorStop(
        0.45,
        "rgba(2, 22, 15, 0.04)"
    );

    gradient.addColorStop(
        1,
        "rgba(5, 40, 28, 0.17)"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );
}


/* ---------------------------------------------------------
   SUBTLE GRID
   --------------------------------------------------------- */

function drawGrid() {

    const gridSize = 42;

    ctx.save();

    ctx.lineWidth = 0.5;

    ctx.strokeStyle =
        "rgba(58, 128, 101, 0.055)";

    const startY = height * 0.14;

    for (
        let x = 0;
        x < width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(x, startY);
        ctx.lineTo(x, height);

        ctx.stroke();

    }

    for (
        let y = startY;
        y < height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(width, y);

        ctx.stroke();

    }

    ctx.restore();
}


/* ---------------------------------------------------------
   STAR RENDERING
   --------------------------------------------------------- */

function drawStars(time) {

    for (const star of stars) {

        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        /*
         * Only stars near the cursor respond.
         * There is NO cursor circle/halo.
         */

        let influence = 0;

        if (distance < 150) {

            influence =
                1 - distance / 150;

        }

        /*
         * Small physical displacement.
         */

        const pushX =
            distance > 0
                ? -(dx / distance) *
                  influence *
                  9
                : 0;

        const pushY =
            distance > 0
                ? -(dy / distance) *
                  influence *
                  9
                : 0;

        /*
         * Slow natural twinkle.
         */

        const twinkle =
            Math.sin(
                time * star.twinkle +
                star.phase
            ) * 0.22;

        const alpha =
            Math.max(
                0.08,
                star.baseAlpha + twinkle
            );


        ctx.save();

        /*
         * Tiny movement around cursor.
         */

        ctx.translate(
            pushX,
            pushY
        );

        /*
         * Star glow.
         */

        if (
            influence > 0.15 ||
            star.radius > 1.2
        ) {

            const glowRadius =
                star.radius * 7;

            const glow =
                ctx.createRadialGradient(
                    star.x,
                    star.y,
                    0,
                    star.x,
                    star.y,
                    glowRadius
                );

            glow.addColorStop(
                0,
                `rgba(145,255,211,${alpha * 0.45})`
            );

            glow.addColorStop(
                0.35,
                `rgba(75,220,158,${alpha * 0.14})`
            );

            glow.addColorStop(
                1,
                "rgba(0,0,0,0)"
            );

            ctx.fillStyle = glow;

            ctx.beginPath();

            ctx.arc(
                star.x,
                star.y,
                glowRadius,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }


        /*
         * Actual star.
         */

        ctx.fillStyle =
            `rgba(218,255,238,${alpha})`;

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.radius +
                influence * 0.55,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.restore();

    }

}


/* ---------------------------------------------------------
   WAVE FUNCTION
   --------------------------------------------------------- */

function waveY(
    x,
    wave,
    time
) {

    /*
     * Two very gentle sine components.

     * This creates a long,
     * continuous liquid ribbon rather
     * than a spectrum-like oscillation.
     */

    const primary =
        Math.sin(
            x * wave.frequency +
            time * wave.speed
        );

    const secondary =
        Math.sin(
            x * wave.frequency * 0.43 -
            time * wave.speed * 0.55
        );

    const combined =
        primary * 0.78 +
        secondary * 0.22;

    return (
        height * wave.base +
        combined * wave.amplitude
    );

}


/* ---------------------------------------------------------
   WAVE PATH
   --------------------------------------------------------- */

function createWavePath(
    wave,
    time
) {

    ctx.beginPath();

    /*
     * Smooth horizontal sampling.
     */

    const step = 5;

    for (
        let x = -30;
        x <= width + 30;
        x += step
    ) {

        const y =
            waveY(
                x,
                wave,
                time
            );

        if (x === -30) {

            ctx.moveTo(
                x,
                y
            );

        } else {

            ctx.lineTo(
                x,
                y
            );

        }

    }

}


/* ---------------------------------------------------------
   WAVE GLOW
   --------------------------------------------------------- */

function drawWaveGlow(
    wave,
    time
) {

    createWavePath(
        wave,
        time
    );

    ctx.save();

    ctx.lineWidth =
        wave.thickness + 3;

    ctx.strokeStyle =
        `rgba(43, 230, 153, ${wave.opacity * 0.13})`;

    ctx.shadowColor =
        "rgba(46, 230, 153, 0.65)";

    ctx.shadowBlur =
        wave.glow;

    ctx.stroke();

    ctx.restore();

}


/* ---------------------------------------------------------
   WAVE CORE
   --------------------------------------------------------- */

function drawWaveCore(
    wave,
    time
) {

    createWavePath(
        wave,
        time
    );

    ctx.save();

    ctx.lineWidth =
        wave.thickness;

    ctx.strokeStyle =
        `rgba(105, 245, 190, ${wave.opacity})`;

    ctx.shadowColor =
        "rgba(75, 255, 183, 0.85)";

    ctx.shadowBlur =
        wave.glow * 0.35;

    ctx.stroke();

    ctx.restore();

}


/* ---------------------------------------------------------
   WAVE BODY / ATMOSPHERE
   --------------------------------------------------------- */

function drawWaveAtmosphere(
    wave,
    time
) {

    ctx.save();

    createWavePath(
        wave,
        time
    );

    ctx.lineWidth = 18;

    ctx.strokeStyle =
        "rgba(17, 125, 87, 0.025)";

    ctx.shadowColor =
        "rgba(35, 210, 142, 0.14)";

    ctx.shadowBlur = 30;

    ctx.stroke();

    ctx.restore();

}


/* ---------------------------------------------------------
   DRAW ALL WAVES
   --------------------------------------------------------- */

function drawWaves(time) {

    /*
     * Draw back layers first.
     */

    for (
        let i = waves.length - 1;
        i >= 0;
        i--
    ) {

        drawWaveAtmosphere(
            waves[i],
            time
        );

    }


    /*
     * Glow borders.
     */

    for (
        let i = waves.length - 1;
        i >= 0;
        i--
    ) {

        drawWaveGlow(
            waves[i],
            time
        );

    }


    /*
     * Sharp luminous borders.
     */

    for (
        let i = waves.length - 1;
        i >= 0;
        i--
    ) {

        drawWaveCore(
            waves[i],
            time
        );

    }

}


/* ---------------------------------------------------------
   MAIN ANIMATION
   --------------------------------------------------------- */

function animate(time) {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawBackground();

    drawGrid();

    drawStars(time);

    drawWaves(time);


    requestAnimationFrame(
        animate
    );

}


/* ---------------------------------------------------------
   START
   --------------------------------------------------------- */

resizeCanvas();

requestAnimationFrame(
    animate
);