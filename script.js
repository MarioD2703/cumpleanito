// CONFIGURACIÓN
const TEST_MODE = false; 
const TEST_SECONDS = 600; 

const REAL_TARGET_DATE = new Date("2026-07-18T00:00:00-05:00").getTime();

const ORIGINAL_PLAYLIST = [
    { src: "cancion1.mp3", title: "Majiko - Avenir", duration: 211 }, 
    { src: "cancion2.mp3", title: "Trigger - Places", duration: 261 }, 
    { src: "cancion3.mp3", title: "DiverDiva - Shadow Effect", duration: 236 },
    { src: "cancion4.mp3", title: "Liella! - ビタミンSUMMER", duration: 209  }, 
    { src: "cancion5.mp3", title: "SKY-HI  JUST BREATHE feat. 3RACHA of Stray Kids (Prod. UTA)", duration: 226 }, 
    { src: "cancion6.mp3", title: "Hanamonogatari - Pony Tail", duration: 158  },
    { src: "cancion7.mp3", title: "L'Arc-en-Ciel - Blurry Eyes", duration: 260 }, 
    { src: "cancion8.mp3", title: "Kensuke Ushio - The door", duration: 134 }, 
    { src: "cancion9.mp3", title: "トリノコシティ (feat. 桐谷遥 & 桃井愛莉 & 初音ミク) ", duration: 205 },
    { src: "cancion10.mp3", title: "天樂 feat. 鏡音リン", duration: 276 }, 
    { src: "cancion11.mp3", title: "Togenashi Togeari - Bleeding Hearts ", duration: 255 }, 
    { src: "cancion12.mp3", title: "One OK Rock - Take Me To The Top", duration: 195 },
    { src: "cancion13.mp3", title: "4s4ki - 許", duration: 176 },
    { src: "cancion14.mp3", title: "フールフールフール feat. Ado (fool,fool,fool)", duration: 191 },
    { src: "cancion15.mp3", title: "Mili - String Theocracy", duration: 175 }
];

const TOTAL_PLAYLIST_DURATION = ORIGINAL_PLAYLIST.reduce((acc, song) => acc + song.duration, 0);

function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

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

let targetDate;
if (TEST_MODE) {
    targetDate = new Date().getTime() + (TEST_SECONDS * 1000);
} else {
    targetDate = REAL_TARGET_DATE;
}

const music = document.getElementById("background-music");
music.volume = 0.2;

function syncPlaylist() {
    const currentUnixTimeSeconds = Math.floor(Date.now() / 1000);
    const currentCycleNumber = Math.floor(currentUnixTimeSeconds / TOTAL_PLAYLIST_DURATION);
    const activePlaylist = shufflePlaylist(ORIGINAL_PLAYLIST, currentCycleNumber);
    const currentCycleSecond = currentUnixTimeSeconds % TOTAL_PLAYLIST_DURATION;

    let accumulatedTime = 0;
    let selectedSongIndex = 0;
    let startOffset = 0;

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

    let nextSong;
    if (selectedSongIndex + 1 < activePlaylist.length) {
        nextSong = activePlaylist[selectedSongIndex + 1];
    } else {
        const nextPlaylist = shufflePlaylist(ORIGINAL_PLAYLIST, currentCycleNumber + 1);
        nextSong = nextPlaylist[0];
    }

    if (music.getAttribute("src") !== currentSong.src) {
        music.src = currentSong.src;
        document.getElementById("track-title").innerText = currentSong.title;
    }

    document.getElementById("next-track-title").innerText = nextSong.title;
    music.currentTime = startOffset;
}

music.addEventListener('ended', () => {
    syncPlaylist();
    music.play().catch(err => console.log("Error al reproducir la siguiente canción", err));
});

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
}

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