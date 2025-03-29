// ==UserScript==
// @name              Loading Overlay, Inactivity Monitor, and Request Modifier
// @namespace         http://tampermonkey.net/
// @version           1.0.1
// @description       Adds a loading overlay, monitors inactivity, and modifies certain requests. Removes Google Tag Manager scripts.
// @author            Martynas Miliauskas
// @match             https://www.b1.lt/*
// @icon              https://b1.lt/favicon.ico
// @downloadURL       https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/overlay.user.js
// @updateURL         https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/overlay.user.js
// @run-at            document-start
// @license           GNU GPLv3
// ==/UserScript==

// -------------- Splash Screen -----------------------------
const overlay = document.createElement('div');
Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    zIndex: '9999',
});

const loaderIcon = document.createElement('i');
loaderIcon.className = 'fa-b1-loader';
Object.assign(loaderIcon.style, {
    width: '20vh',
    height: '20vh',
});

overlay.appendChild(loaderIcon);
document.documentElement.appendChild(overlay);

window.addEventListener('load', () => {
    setTimeout(() => overlay.remove(), 50);
});

// -------------- Inactivity Monitor ------------------------
const isInAppMode = window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches;

let loadTime = Date.now();
const checkInterval = 30 * 60 * 1000;
let isMinimized = false;

const checkWindowState = () => {
    isMinimized = document.hidden || document.visibilityState === 'hidden';
};

const checkInactivity = () => {
    if (isMinimized && (Date.now() - loadTime) >= checkInterval) {
        window.close();
    }
};

if (isInAppMode) {
    console.log('Website is opened in App Mode.');

    window.addEventListener('focus', () => {
        loadTime = Date.now();
    });

    document.addEventListener('visibilitychange', checkWindowState);
    checkWindowState();
    setInterval(checkInactivity, 301000);
}

// -------------- XMLHttpRequest Interceptor ----------------
const originalOpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (url.includes("warehouse/light-sales")) {
        url = "data:text/plain,";
    } else if (url.includes("sidebar")) {
        url = 'data:application/json,{ "data": [ { "id": 0, "label": "Žinynai", "icon": "fa-folder-open", "isPrimary": true, "isMinimizible": true, "isAlwaysOpen": false, "items": [ { "id": 84, "label": "Prekės", "url": "/reference-book/items", "helpUrl": "/zinynai", "helpName": "Žinynai", "icon": "fa-folder-open" }, { "id": 85, "label": "Prekių požymiai", "url": "/reference-book/item-attributes", "helpUrl": "/zinynai", "helpName": "Žinynai", "icon": "fa-folder-open" }, { "id": 86, "label": "Prekių grupės", "url": "/reference-book/item-groups", "helpUrl": "/zinynai", "helpName": "Žinynai", "icon": "fa-folder-open" } ] } ], "code": 200 }';
    }

    return originalOpen.apply(this, [method, url, ...rest]);
};

// -------------- Remove Google Tag Manager -----------------
const removeGTM = () => {
    const removeElements = (selector) => {
        document.querySelectorAll(selector).forEach(el => el.remove());
    };

    removeElements('script[src*="googletagmanager.com"], script[src*="cloudflareinsights.com"], noscript');
    document.querySelectorAll('script').forEach(script => {
        if (script.textContent.includes('googletagmanager.com') || script.textContent.includes('gtag(')) {
            script.remove();
        }
    });
};

removeGTM();
const observer = new MutationObserver(() => removeGTM());
observer.observe(document.body, { childList: true, subtree: true });