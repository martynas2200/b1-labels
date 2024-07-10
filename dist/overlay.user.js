// ==UserScript==
// @name              Loading Overlay and Inactivity Monitor
// @namespace         http://tampermonkey.net/
// @version           1.0.0
// @description       Introduces a loading overlay and an inactivity monitor that closes the window when the application is inactive applies only for Application Mode.
// @author            Martynas Miliauskas
// @match             https://www.b1.lt/*
// @icon              https://b1.lt/favicon.ico
// @downloadURL       https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/overlay.user.js
// @updateURL         https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/overlay.user.js
// @run-at            document-start
// @grant             unsafeWindow
// @license           GNU GPLv3
// ==/UserScript==

// -------------- Splash screen -----------------------------

let overlay = document.createElement('div')
overlay.style.position = 'fixed'
overlay.style.top = '0'
overlay.style.left = '0'
overlay.style.width = '100%'
overlay.style.height = '100%'
overlay.style.backgroundColor = '#333'
overlay.style.display = 'flex'
overlay.style.justifyContent = 'space-evenly'
overlay.style.alignItems = 'center'
overlay.style.zIndex = '9999'

// use default fa-b1-loader
const i = document.createElement('i')
i.className = 'fa-b1-loader'
i.style.width = '20vh'
i.style.height = '20vh'
overlay.appendChild(i)
document.documentElement.appendChild(overlay)

window.addEventListener('load', () => {
  setTimeout(() => {
    overlay.remove()
    window.clarity('stop')
  }, 200)
})

// ---------- Close the window if the app was minimized and not used

const isInAppMode = window.matchMedia('(display-mode: standalone)').matches
                 || window.matchMedia('(display-mode: fullscreen)').matches;
let loadTime = Date.now();
let checkInterval = 20 * 60 * 1000; // 20 minutes
let isMinimized = false;

function checkWindowState() {
    if (document.hidden || document.visibilityState === 'hidden') {
        isMinimized = true;
    } else {
        isMinimized = false;
    }
}

function checkInactivity() {
    if (isMinimized && (Date.now() - loadTime) >= checkInterval) {
        window.close();
    }
}

// Update the load time whenever the window is focused
window.onfocus = function() {
    loadTime = Date.now();
};

document.addEventListener('visibilitychange', checkWindowState);
checkWindowState();
setInterval(checkInactivity, 301000);



if (isInAppMode) {
    console.log('Website is opened in App Mode.');
    window.onfocus = function() {
        loadTime = Date.now();
    };

    document.addEventListener('visibilitychange', checkWindowState);
    checkWindowState();
    setInterval(checkInactivity, 301000);
}