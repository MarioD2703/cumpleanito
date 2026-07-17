// CONFIGURACIÓN
const TEST_MODE = false; // ¡Cambiado a false para activar la cuenta regresiva real!
const TEST_SECONDS = 10; 

// Fecha real del evento: 00:00:00 en zona horaria GMT-5 (Hora de Perú/Colombia/Ecuador)
// Formato ISO 8601 con el desplazamiento "-05:00" para asegurar la sincronía exacta.
const REAL_TARGET_DATE = new Date("2026-07-18T00:00:00-05:00").getTime();

// Playlist original (Pon aquí tus archivos .mp3, nombres y duraciones exactas en segundos)
const ORIGINAL_PLAYLIST = [
   { src: "cancion1.mp3", title: "Majiko - Avenir", duration: 211 }, 
    { src: "cancion2.mp3", title: "Trigger - Places", duration: 261 }, 
    { src: "cancion3.mp3", title: "DiverDiva - Shadow Effect", duration: 236 },
{ src: "cancion4.mp3", title: "Liella! - ビタミンSUMMER", duration: 209  }, 
    { src: "cancion5.mp3", title: "SKY-HI  JUST BREATHE feat. 3RACHA of Stray Kids (Prod. UTA)", duration: 270 }, 
    { src: "cancion6.mp3", title: "Hanamonogatari - Pony Tail", duration: 158  },
{ src: "cancion7.mp3", title: "L'Arc-en-Ciel - Blurry Eyes", duration: 260 }, 
    { src: "cancion8.mp3", title: "Kensuke Ushio - The door", duration: 134 }, 
    { src: "cancion9.mp3", title: "トリノコシティ (feat. 桐谷遥 & 桃井愛莉 & 初音ミク) ", duration: 205 },
  { src: "cancion10.mp3", title: "天樂 feat. 鏡音リン", duration: 276 }, 
    { src: "cancion11.mp3", title: "Togenashi Togeari - Bleeding Hearts ", duration: 255 }, 
    { src: "cancion12.mp3", title: "One OK Rock - Take Me To The Top", duration: 195 },
{ src: "cancion13.mp3", title: "4s4ki - 許", duration: 176 },
{ src: "cancion14.mp3", title: "フールフールフール feat. Ado (fool,fool,fool)", duration: 191 }
];

// Calcular la duración total de la playlist en segundos
const TOTAL_PLAYLIST_DURATION = ORIGINAL_PLAYLIST.reduce((acc, song) => acc + song.duration, 0);

// Función generadora de números pseudoaleatorios basados en una semilla (Algoritmo LCG)
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Mezclar una lista de manera determinista basándose en una semilla (Fisher-Yates modificado)
function shufflePlaylist(playlist, seed) {
    const shuffled = [...playlist];
    let temp, j;
    for (let i = shuffled.length - 1; i > 0; i--) {
        j = Math.floor(seededRandom(seed + i) * (i + 1));
        temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

// Determinar fecha final del countdown
let targetDate;
if (TEST_MODE) {
    targetDate = new Date().getTime() + (TEST_SECONDS * 1000);
} else {
    targetDate = REAL_TARGET_DATE;
}

const music = document.getElementById("background-music");

// Configurar el volumen a nivel medio (0.5 es el 50%)
music.volume = 0.2;

// Sincronizar la playlist aleatoria basándose en el tiempo global Unix
function syncPlaylist() {
    const currentUnixTimeSeconds = Math.floor(Date.now() / 1000);
    
    // 1. Determinar en qué "número de ciclo" de reproducción estamos
    const currentCycleNumber = Math.floor(currentUnixTimeSeconds / TOTAL_PLAYLIST_DURATION);
    
    // 2. Mezclar la playlist usando el número de ciclo como semilla
    const activePlaylist = shufflePlaylist(ORIGINAL_PLAYLIST, currentCycleNumber);

    // 3. Obtener el segundo actual dentro del ciclo actual
    const currentCycleSecond = currentUnixTimeSeconds % TOTAL_PLAYLIST_DURATION;

    let accumulatedTime = 0;
    let selectedSongIndex = 0;
    let startOffset = 0;

    // 4. Identificar qué canción de la lista mezclada corresponde reproducir ahora
    for (let i = 0; i < activePlaylist.length; i++) {
        const song = activePlaylist[i];
        if (currentCycleSecond < accumulatedTime + song.duration) {
            selectedSongIndex = i;
            startOffset = currentCycleSecond - accumulatedTime;
            break;
        }
        accumulatedTime += song.duration;
    }

    const currentSong = activePlaylist[selectedSongIndex];

    // 5. Determinar la siguiente canción del ciclo actual (o del siguiente si es la última)
    let nextSong;
    if (selectedSongIndex + 1 < activePlaylist.length) {
        nextSong = activePlaylist[selectedSongIndex + 1];
    } else {
        const nextPlaylist = shufflePlaylist(ORIGINAL_PLAYLIST, currentCycleNumber + 1);
        nextSong = nextPlaylist[0];
    }

    // Cambiar la fuente si es una canción distinta
    if (music.getAttribute("src") !== currentSong.src) {
        music.src = currentSong.src;
        document.getElementById("track-title").innerText = currentSong.title;
    }

    // Mostrar el título de la siguiente canción
    document.getElementById("next-track-title").innerText = nextSong.title;

    // Configurar el punto de inicio exacto
    music.currentTime = startOffset;
}

// Al finalizar una canción, recalculamos para pasar a la siguiente de la lista mezclada
music.addEventListener('ended', () => {
    syncPlaylist();
    music.play().catch(err => console.log("Error al reproducir la siguiente canción", err));
});

// Evento para iniciar la reproducción al primer clic del usuario en la pantalla
document.body.addEventListener('click', () => {
    syncPlaylist();

    if (music.paused) {
        music.play()
            .then(() => {
                const audioIndicator = document.getElementById("audio-indicator");
                if (audioIndicator) {
                    audioIndicator.classList.add("fade-out");
                    setTimeout(() => audioIndicator.remove(), 500);
                }
            })
            .catch(error => {
                console.log("La reproducción automática fue bloqueada por el navegador.", error);
            });
    }
}, { once: true });

// Lógica del contador
const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
        clearInterval(countdownInterval);
        
        document.getElementById("days").innerText = "00";
        document.getElementById("hours").innerText = "00";
        document.getElementById("minutes").innerText = "00";
        document.getElementById("seconds").innerText = "00";

        const countdownElement = document.getElementById("countdown");
        countdownElement.style.opacity = "0";

        setTimeout(() => {
            countdownElement.style.display = "none";
            document.getElementById("title").innerText = "🎉✨¡Feliz Cumpleaños Lucii 0w0!✨🎉";
            startBalloonRain();
            const magicContainer = document.getElementById("magic-container");
            magicContainer.classList.remove("hidden");
        }, 500);

        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = String(days).padStart(2, '0');
    document.getElementById("hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
    document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');

}, 1000);

// Función de globos
function startBalloonRain() {
    const container = document.getElementById("balloon-container");
    const colors = ["#ff477e", "#ff7096", "#ff85a1", "#fbb1bd", "#f9bec7", "#48cae4", "#90e0ef"];

    const rainInterval = setInterval(() => {
        const balloon = document.createElement("div");
        balloon.classList.add("balloon");
        
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomLeft = Math.random() * 100;
        const randomSize = Math.random() * (50 - 30) + 30;
        const randomDuration = Math.random() * (8 - 4) + 4;

        balloon.style.backgroundColor = randomColor;
        balloon.style.left = `${randomLeft}vw`;
        balloon.style.width = `${randomSize}px`;
        balloon.style.height = `${randomSize * 1.2}px`;
        balloon.style.animationDuration = `${randomDuration}s`;

        container.appendChild(balloon);

        setTimeout(() => {
            balloon.remove();
        }, randomDuration * 1000);
    }, 300);

    setTimeout(() => {
        clearInterval(rainInterval);
    }, 15000);
}

// EVENTO GLOBAL DE CLICS PARA GENERAR CHISPITAS
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('magic-button')) return;
    createSparkles(e.clientX, e.clientY);
});

function createSparkles(x, y) {
    const sparkleCount = 10;
    const colors = ["#ff477e", "#ff7096", "#48cae4", "#90e0ef", "#ffd166", "#06d6a0", "#ffffff"];

    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement("div");
        sparkle.classList.add("sparkle-particle");

        sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        sparkle.style.left = `${x + window.scrollX - 4}px`;
        sparkle.style.top = `${y + window.scrollY - 4}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * (120 - 50) + 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        sparkle.style.setProperty('--tx', `${tx}px`);
        sparkle.style.setProperty('--ty', `${ty}px`);

        const size = Math.random() * (10 - 4) + 4;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;

        document.body.appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, 800);
    }
}