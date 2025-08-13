// ==UserScript==
// @name              B1 Label Printing
// @namespace         http://tampermonkey.net/
// @homepage          https://github.com/martynas2200/b1-labels
// @version           2.1.1
// @description       Standard label printing interface
// @author            Martynas Miliauskas
// @match             https://www.b1.lt/*
// @icon              https://b1.lt/favicon.ico
// @connect           b1.lt
// @connect           raw.githubusercontent.com
// @downloadURL       https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/labels.user.js
// @updateURL         https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/labels.user.js
// @grant             GM.setValue
// @grant             GM.getValue
// @grant             unsafeWindow
// @grant             GM_xmlhttpRequest
// @license           GNU GPLv3
// ==/UserScript==

(function () {
    'use strict';

    const MINIMAL_TRANSLATIONS = {
        en: {
            barcode: 'Barcode',
            foundXItems: '{1} items found',
            multipleItemsFound: 'Multiple items found',
            itemCreated: 'Item created',
            itemNotFound: 'Item not found!',
            itemUpdated: 'Item updated',
            notAllItemsActive: 'Not all items are active; Do you want to proceed?',
            oddNumberOfItems: 'Odd number of items; Do you want to proceed?',
            success: 'Success',
            error: 'Error',
            failed: 'Failed',
            loading: 'Loading...',
            nlabelsToBePrinted: 'labels to be printed',
            noData: 'No data to print!',
            invalidId: 'Invalid ID',
            longTimeAgo: 'a long time ago',
            twoMonthsAgo: 'two months ago',
            oneMonthAgo: 'a month ago',
            threeWeeksAgo: 'three weeks ago',
            twoWeeksAgo: 'two weeks ago',
            daysAgo: '{1} days ago',
            yesterday: 'yesterday',
            hoursAgo: '{1} hours ago',
            minutesAgo: '{1} minutes ago',
        },
        lt: {
            barcode: 'Barkodas',
            foundXItems: 'Rasta {1} prekių',
            multipleItemsFound: 'Rasta daugiau negu viena prekė!',
            itemCreated: 'Prekė sukurta',
            itemNotFound: 'Prekė nerasta!',
            itemUpdated: 'Prekė atnaujinta',
            notAllItemsActive: 'Ne visos prekės aktyvios, ar norite tęsti?',
            oddNumberOfItems: 'Nelyginis prekių skaičius, ar norite tęsti?',
            success: 'Sėkmingai atlikta',
            error: 'Įvyko klaida',
            failed: 'Nepavyko',
            loading: 'Kraunama...',
            nlabelsToBePrinted: 'etiketės spausdinimui',
            noData: 'Nepakanka duomenų spausdinimui!',
            invalidId: 'Neteisingas ID',
            longTimeAgo: 'labai seniai',
            twoMonthsAgo: 'prieš du mėnesius',
            oneMonthAgo: 'prieš mėnesį',
            threeWeeksAgo: 'prieš tris savaites',
            twoWeeksAgo: 'prieš dvi savaites',
            daysAgo: 'prieš {1} dienas',
            yesterday: 'vakar',
            hoursAgo: 'prieš {1} valandas',
            minutesAgo: 'prieš {1} minutes',
        },
    };

    const currentLanguage = navigator.language.split('-')[0] === 'lt' ? 'lt' : 'en';
    const i18n = (key, values = []) => {
        let translation = MINIMAL_TRANSLATIONS[currentLanguage]?.[key] ?? MINIMAL_TRANSLATIONS.en[key] ?? key;
        values.forEach((value, index) => {
            translation = translation.replace(`{${index + 1}}`, value);
        });
        return translation;
    };

    var printStyles = "﻿.is_a_bug{display:none}@media print{body{margin:0;padding:0;max-width:58.3mm;display:inline-flex;flex-wrap:wrap}}.label{all:revert;position:relative;background:#fff;color:#000;height:31.75mm;width:57.15mm;border:.5px solid #ffdfd4;margin:0px;box-sizing:border-box;overflow:hidden}.item{height:19mm;overflow:hidden;padding:4px;font-family:Arial,sans-serif;font-size:initial;line-height:initial}.barcode{white-space:nowrap;position:absolute;bottom:0;z-index:3}.barcode div{font-size:10px;font-family:monospace;margin-left:6px;line-height:1em}.barcode p{margin:0}.dm{width:6mm;height:6mm;transform:rotate(270deg);padding:3px;fill:#000}.subtext{position:absolute;right:2px;bottom:3px;font-family:serif;font-size:18px;font-weight:500;z-index:10;line-height:1em}.price{position:absolute;bottom:21px;font-size:50px;right:0;overflow:hidden;object-position:center;margin-right:3px;line-height:1em;font-family:\"Book Antiqua\",serif;padding:0px 10px}.price-per-unit{color:#777}.barcodeOnly .item{font-size:.9em;margin-right:15px}.barcodeOnly .barcode{left:50%;transform:translateX(-50%) scale(1.4);width:max-content}.barcodeOnly .barcode>div{margin-left:0;font-size:8px;writing-mode:vertical-lr;position:absolute;right:-1.2em;bottom:1.2em}.barcodeOnly .price,.barcodeOnly .price-per-unit,.barcodeOnly .subtext{display:none}.label.fridge::before{content:\"\";display:block;position:absolute;border-top:.5px dashed #ff9b79;width:100%;bottom:7mm}.label.fridge .item{font-size:15px;height:12mm}.label.fridge .barcode p,.label.fridge .price-per-unit{display:none}.label.fridge .subtext{font-family:\"Book Antiqua\",serif;font-size:1em;bottom:11mm;left:0;right:unset;background:#888;color:#fff;padding:0px 3px;margin-left:6px;border-radius:3px;padding-top:2px}.label.fridge .price,.label.fridge .barcode{bottom:8mm;line-height:.9em}.label.half{width:28.575mm;display:block;border-right:.5px dashed #ff9b79}.label.half+.label.half:nth-of-type(even){border-right-style:solid;border-left-style:none}.label.half .item{font-size:.75em;font-size:12px;text-align:center}.label.half .subtext{padding:0px 3px;border-radius:3px;font-size:.95em}.label.half .price{right:0;left:0;margin:0px 3px;padding:0px;text-align:center;font-size:38px}.label.half .barcode div{font-size:8px;margin:0px;padding:0px;bottom:0}.label.half .barcode p{display:none}.label.weight{display:grid;grid-template-columns:min-content 1fr;align-items:center;justify-content:space-between;padding:5px;box-sizing:border-box;writing-mode:vertical-rl;grid-column-gap:2px;grid-row-gap:0px;font-family:\"Arial\"}.label.weight .barcode{grid-column:1;position:static;width:8mm;height:8mm;transform:unset}.label.weight .item{grid-column:span 2;text-align:left;font-size:11pt;font-size:10pt;max-width:60pt;padding:0px;height:unset}.label.weight .price{all:revert;grid-row:2;grid-column:span 2;text-align:center;justify-self:center;align-self:end;font-size:16pt;font-weight:bold;line-height:1em;font-family:\"Book Antiqua\",serif;margin-right:4px}.label.weight .price::after{content:\"  €\"}.label.weight .kg-price{grid-column:2;justify-self:center;align-self:end}.label.weight .kg-text{grid-column:2}.label.weight .kg-text,.label.weight .weight-text{justify-self:center;align-self:baseline;color:#999;font-size:.8em;line-height:.6}.label.weight .weight-text{grid-column:1}.label.weight .weight{grid-column:1;justify-self:center;align-self:end}.label.weight .expiry{grid-column:2;text-align:center;justify-self:center;align-self:center;line-height:.9;font-size:.8em;color:#000}.label.weight .expiry::before{content:\"Geriausia iki \";color:#444;display:inline;font-family:Arial}.label.weight.half{display:grid;writing-mode:unset}.label.weight.half .price{font-size:18px}.label.weight.half *:not(.price){font-size:9pt}.label.weight.half .item{max-width:unset;max-height:11mm}.label.weight.half .dm{grid-row:3/span 3}.label.weight.half .weight{grid-column:2}.label.weight.half .expiry::before{content:\" \";display:inline-block;position:static;background-repeat:no-repeat;background-image:url(\"data:image/svg+xml,%3Csvg fill='%23000000' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='15px' height='15px' viewBox='0 0 612 612' xml:space='preserve'%3E%3Cg%3E%3Cg%3E%3Cpath d='M612,463.781c0-70.342-49.018-129.199-114.75-144.379c-10.763-2.482-21.951-3.84-33.469-3.84 c-3.218,0-6.397,0.139-9.562,0.34c-71.829,4.58-129.725,60.291-137.69,131.145c-0.617,5.494-0.966,11.073-0.966,16.734 c0,10.662,1.152,21.052,3.289,31.078C333.139,561.792,392.584,612,463.781,612C545.641,612,612,545.641,612,463.781z M463.781,561.797c-54.133,0-98.016-43.883-98.016-98.016s43.883-98.016,98.016-98.016s98.016,43.883,98.016,98.016 S517.914,561.797,463.781,561.797z'/%3E%3Cpolygon points='482.906,396.844 449.438,396.844 449.438,449.438 396.844,449.438 396.844,482.906 482.906,482.906 482.906,449.438 482.906,449.438 '/%3E%3Cpath d='M109.969,0c-9.228,0-16.734,7.507-16.734,16.734v38.25v40.641c0,9.228,7.506,16.734,16.734,16.734h14.344 c9.228,0,16.734-7.507,16.734-16.734V54.984v-38.25C141.047,7.507,133.541,0,124.312,0H109.969z'/%3E%3Cpath d='M372.938,0c-9.228,0-16.734,7.507-16.734,16.734v38.25v40.641c0,9.228,7.507,16.734,16.734,16.734h14.344 c9.228,0,16.734-7.507,16.734-16.734V54.984v-38.25C404.016,7.507,396.509,0,387.281,0H372.938z'/%3E%3Cpath d='M38.25,494.859h236.672c-2.333-11.6-3.572-23.586-3.572-35.859c0-4.021,0.177-7.999,0.435-11.953H71.719 c-15.845,0-28.688-12.843-28.688-28.688v-229.5h411.188v88.707c3.165-0.163,6.354-0.253,9.562-0.253 c11.437,0,22.61,1.109,33.469,3.141V93.234c0-21.124-17.126-38.25-38.25-38.25h-31.078v40.641c0,22.41-18.23,40.641-40.641,40.641 h-14.344c-22.41,0-40.641-18.231-40.641-40.641V54.984H164.953v40.641c0,22.41-18.231,40.641-40.641,40.641h-14.344 c-22.41,0-40.641-18.231-40.641-40.641V54.984H38.25C17.126,54.984,0,72.111,0,93.234v363.375 C0,477.733,17.126,494.859,38.25,494.859z'/%3E%3Ccircle cx='134.774' cy='260.578' r='37.954'/%3E%3Ccircle cx='248.625' cy='260.578' r='37.954'/%3E%3Ccircle cx='362.477' cy='260.578' r='37.954'/%3E%3Ccircle cx='248.625' cy='375.328' r='37.953'/%3E%3Ccircle cx='134.774' cy='375.328' r='37.953'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\");height:15px;width:15px}.label.weight.half .expiry{display:flex;align-items:center}.label.weight.half .manufacturer,.label.weight.half .weight-text,.label.weight.half .kg-text,.label.weight.half .package{display:none}.label.weight .manufacturer,.label.weight .description{font-size:.7em;grid-column:span 2}.label.weight .package{font-size:.7em;grid-column:span 2}.label.weight .package{grid-row:3;grid-column:span 2;text-align:center;justify-self:center;align-self:center;margin-right:-5px;margin-left:5px;color:#444;font-size:10px;line-height:.8em}del{color:gray;position:relative;text-decoration:none;position:absolute;bottom:0;right:5px;font-size:1.4em;line-height:1em}del:after{content:\"\";display:block;position:absolute;width:110%;height:2px;border-radius:1px;background:darkred;top:9px;left:-5%;transform:skewY(-14deg)}";

    const getDataMatrixMat = (text, rect = false) => {
        var enc = [], cw = 0, ce = 0;
        function push(val) {
            cw = 40 * cw + val;
            if (ce++ == 2) {
                enc.push(++cw >> 8);
                enc.push(cw & 255);
                ce = cw = 0;
            }
        }
        var cost = [
            function (c) { return ((c - 48) & 255) < 10 ? 6 : c < 128 ? 12 : 24; },
            function (c) { return ((c - 48) & 255) < 10 || ((c - 65) & 255) < 26 || c == 32 ? 8 : c < 128 ? 16 : 16 + cost[1](c & 127); },
            function (c) { return ((c - 48) & 255) < 10 || ((c - 97) & 255) < 26 || c == 32 ? 8 : c < 128 ? 16 : 16 + cost[2](c & 127); },
            function (c) { return ((c - 48) & 255) < 10 || ((c - 65) & 255) < 26 || c == 32 || c == 13 || c == 62 || c == 42 ? 8 : 1e9; },
            function (c) { return c >= 32 && c < 95 ? 9 : 1e9; },
            function (c) { return 12; }
        ];
        var latch = [0, 24, 24, 24, 21, 25];
        var count = [0, 12, 12, 12, 12, 25];
        var c, i, p, cm = 0, nm = 0;
        var bytes = [];
        bytes[text.length] = count.slice();
        for (p = text.length; p-- > 0;) {
            for (c = 1e9, i = 0; i < count.length; i++) {
                count[i] += cost[i](text.charCodeAt(p));
                c = Math.min(c, Math.ceil(count[i] / 12) * 12);
            }
            if (cost[0](text.charCodeAt(p)) > 6)
                count[0] = Math.ceil(count[0] / 12) * 12;
            for (i = 0; i < count.length; i++)
                if (c + latch[i] < count[i])
                    count[i] = c + latch[i];
            bytes[p] = count.slice();
        }
        for (p = 0;; cm = nm) {
            c = bytes[p][cm] - latch[cm];
            if (p + [0, 2, 2, 2, 3, 0][cm] >= text.length)
                nm = 0;
            else
                for (i = cost.length; i-- > 0;)
                    if (Math.ceil((bytes[p + 1][i] + cost[i](text.charCodeAt(p))) / 12) * 12 == c)
                        nm = i;
            if (cm != nm && cm > 0)
                if (cm < 4)
                    enc.push(254);
                else if (cm == 4)
                    enc.push(31 | cw & 255);
                else {
                    if (ce > 249)
                        enc.push((ce / 250 + 250 + (149 * (enc.length + 1)) % 255) & 255);
                    enc.push((ce % 250 + (149 * (enc.length + 1)) % 255 + 1) & 255);
                    for (; ce > 0; ce--)
                        enc.push((text.charCodeAt(p - ce) + (149 * (enc.length + 1)) % 255 + 1) & 255);
                }
            if (p >= text.length)
                break;
            if (cm != nm)
                cw = ce = 0;
            if (cm != nm && nm > 0)
                enc.push([230, 239, 238, 240, 231][nm - 1]);
            if (nm == 0) {
                c = text.charCodeAt(p++);
                i = (c - 48) & 255;
                if (i < 10 && p < text.length && ((text.charCodeAt(p) - 48) & 255) < 10)
                    enc.push(i * 10 + text.charCodeAt(p++) - 48 + 130);
                else {
                    if (c > 127)
                        enc.push(235);
                    enc.push((c & 127) + 1);
                }
                if (cm == 4 || ce < 0)
                    ce--;
            }
            else if (nm < 4) {
                var set = [[31, 0, 32, 119, 47, 133, 57, 179, 64, 173, 90, 207, 95, 277, 127, 386, 255, 1],
                    [31, 0, 32, 119, 47, 133, 57, 179, 64, 173, 90, 258, 95, 277, 122, 335, 127, 386, 255, 1],
                    [13, 55, 32, 119, 42, 167, 57, 179, 62, 243, 90, 207, 255, 3]][nm - 1];
                do {
                    c = text.charCodeAt(p++);
                    if (c > 127) {
                        push(1);
                        push(30);
                        c &= 127;
                    }
                    for (i = 0; c > set[i]; i += 2)
                        ;
                    if ((set[i + 1] & 3) < 3)
                        push(set[i + 1] & 3);
                    push(c - (set[i + 1] >> 2));
                } while (ce > 0);
            }
            else if (nm == 4) {
                if (ce > 0)
                    enc.push(255 & cw + (text.charCodeAt(p++) & 63));
                for (cw = ce = 0; ce < 3; ce++)
                    cw = 64 * (cw + (text.charCodeAt(p++) & 63));
                enc.push(cw >> 16);
                enc.push((cw >> 8) & 255);
            }
            else {
                p++;
                ce++;
            }
        }
        var el = enc.length;
        var h, w, nc = 1, nr = 1, fw, fh;
        var j = -1, l, r, s, b = 1, k;
        if (ce == -1 || (cm && cm < 5))
            nm = 1;
        if (rect && el - nm < 50) {
            k = [16, 7, 28, 11, 24, 14, 32, 18, 32, 24, 44, 28];
            do {
                w = k[++j];
                h = 6 + (j & 12);
                l = w * h / 8;
            } while (l - k[++j] < el - nm);
            if (w > 25)
                nc = 2;
        }
        else {
            w = h = 6;
            i = 2;
            k = [5, 7, 10, 12, 14, 18, 20, 24, 28, 36, 42, 48, 56, 68, 84,
                112, 144, 192, 224, 272, 336, 408, 496, 620];
            do {
                if (++j == k.length)
                    return [];
                if (w > 11 * i)
                    i = 4 + i & 12;
                w = h += i;
                l = (w * h) >> 3;
            } while (l - k[j] < el - nm);
            if (w > 27)
                nr = nc = 2 * Math.floor(w / 54) + 2;
            if (l > 255)
                b = 2 * (l >> 9) + 2;
        }
        s = k[j];
        if (l - s + 1 == el && nm > 0) {
            el--;
            if (ce == -1)
                enc[el - 1] ^= 31 ^ (enc[el] - 1) & 63;
        }
        fw = w / nc;
        fh = h / nr;
        if (el < l - s)
            enc[el++] = 129;
        while (el < l - s)
            enc[el++] = (((149 * el) % 253) + 130) % 254;
        s /= b;
        var rs = new Array(70), rc = new Array(70);
        var lg = new Array(256), ex = new Array(255);
        for (j = 1, i = 0; i < 255; i++) {
            ex[i] = j;
            lg[j] = i;
            j += j;
            if (j > 255)
                j ^= 301;
        }
        for (rs[s] = 0, i = 1; i <= s; i++)
            for (j = s - i, rs[j] = 1; j < s; j++)
                rs[j] = rs[j + 1] ^ ex[(lg[rs[j]] + i) % 255];
        for (c = 0; c < b; c++) {
            for (i = 0; i <= s; i++)
                rc[i] = 0;
            for (i = c; i < el; i += b)
                for (j = 0, k = rc[0] ^ enc[i]; j < s; j++)
                    rc[j] = rc[j + 1] ^ (k ? ex[(lg[rs[j]] + lg[k]) % 255] : 0);
            for (i = 0; i < s; i++)
                enc[el + c + i * b] = rc[i];
        }
        var mat = Array(h + 2 * nr).fill(null).map(function () { return []; });
        for (i = 0; i < w + 2 * nc; i += fw + 2)
            for (j = 0; j < h; j++) {
                mat[j + (j / fh | 0) * 2 + 1][i] = 1;
                if ((j & 1) == 1)
                    mat[j + (j / fh | 0) * 2][i + fw + 1] = 1;
            }
        for (i = 0; i < h + 2 * nr; i += fh + 2)
            for (j = 0; j < w + 2 * nc; j++) {
                mat[i + fh + 1][j] = 1;
                if ((j & 1) == 0)
                    mat[i][j] = 1;
            }
        s = 2;
        c = 0;
        r = 4;
        for (i = 0; i < l; r -= s, c += s) {
            if (r == h - 3 && c == -1)
                k = [w, 6 - h, w, 5 - h, w, 4 - h, w, 3 - h, w - 1, 3 - h, 3, 2, 2, 2, 1, 2];
            else if (r == h + 1 && c == 1 && (w & 7) == 0 && (h & 7) == 6)
                k = [w - 2, -h, w - 3, -h, w - 4, -h, w - 2, -1 - h, w - 3, -1 - h, w - 4, -1 - h, w - 2, -2, -1, -2];
            else {
                if (r == 0 && c == w - 2 && (w & 3))
                    continue;
                if (r < 0 || c >= w || r >= h || c < 0) {
                    s = -s;
                    r += 2 + s / 2;
                    c += 2 - s / 2;
                    while (r < 0 || c >= w || r >= h || c < 0) {
                        r -= s;
                        c += s;
                    }
                }
                if (r == h - 2 && c == 0 && (w & 3))
                    k = [w - 1, 3 - h, w - 1, 2 - h, w - 2, 2 - h, w - 3, 2 - h, w - 4, 2 - h, 0, 1, 0, 0, 0, -1];
                else if (r == h - 2 && c == 0 && (w & 7) == 4)
                    k = [w - 1, 5 - h, w - 1, 4 - h, w - 1, 3 - h, w - 1, 2 - h, w - 2, 2 - h, 0, 1, 0, 0, 0, -1];
                else if (r == 1 && c == w - 1 && (w & 7) == 0 && (h & 7) == 6)
                    continue;
                else
                    k = [0, 0, -1, 0, -2, 0, 0, -1, -1, -1, -2, -1, -1, -2, -2, -2];
            }
            for (el = enc[i++], j = 0; el > 0; j += 2, el >>= 1) {
                if (el & 1) {
                    var x = c + k[j], y = r + k[j + 1];
                    if (x < 0) {
                        x += w;
                        y += 4 - ((w + 4) & 7);
                    }
                    if (y < 0) {
                        y += h;
                        x += 4 - ((h + 4) & 7);
                    }
                    mat[y + 2 * (y / fh | 0) + 1][x + 2 * (x / fw | 0) + 1] = 1;
                }
            }
        }
        for (i = w; i & 3; i--)
            mat[i][i] = 1;
        return mat;
    };
    const toPath = (mat) => {
        var path = "", x, y;
        mat.forEach(function (y) { y.unshift(0); });
        mat.push([]);
        mat.unshift([]);
        for (;;) {
            for (y = 0; y + 2 < mat.length; y++)
                if ((x = mat[y + 1].indexOf(1) - 1) >= 0 || (x = mat[y + 1].indexOf(5) - 1) >= 0)
                    break;
            if (y + 2 == mat.length || path.length > 1e7)
                return path;
            var c = mat[y + 1][x + 1] >> 2, p = "";
            for (var x0 = x, y0 = y, d = 1; p.length < 1e6;) {
                do
                    x += 2 * d - 1;
                while ((mat[y][x + d] ^ mat[y + 1][x + d]) & mat[y + d][x + d] & 1);
                d ^= mat[y + d][x + d] & 1;
                do
                    mat[d ? ++y : y--][x + 1] ^= 2;
                while ((mat[y + d][x] ^ mat[y + d][x + 1]) & mat[y + d][x + 1 - d] & 1);
                if (x == x0 && y == y0)
                    break;
                d ^= 1 ^ mat[y + d][x + 1 - d] & 1;
                if (c)
                    p = "V" + y + "H" + x + p;
                else
                    p += "H" + x + "V" + y;
            }
            path += "M" + x + " " + y + p + (c ? "V" + y : "H" + x) + "Z";
            for (d = 0, y = 1; y < mat.length - 1; y++)
                for (x = 1; x < mat[y].length; x++) {
                    d ^= (mat[y][x] >> 1) & 1;
                    mat[y][x] = 5 * d ^ mat[y][x] & 5;
                }
        }
    };
    class Code128 {
        text;
        constructor(text) {
            this.text = text;
        }
        encode() {
            var t = 3, enc = [], i, j, c, mat = [];
            for (i = 0; i < this.text.length; i++) {
                c = this.text.charCodeAt(i);
                if (t != 2) {
                    for (j = 0; j + i < this.text.length; j++)
                        if (this.text.charCodeAt(i + j) - 48 >>> 0 > 9)
                            break;
                    if ((j > 1 && i == 0) || (j > 3 && (i + j < this.text.length || (j & 1) == 0))) {
                        enc.push(i == 0 ? 105 : 99);
                        t = 2;
                    }
                }
                if (t == 2)
                    if (c - 48 >>> 0 < 10 && i + 1 < this.text.length && this.text.charCodeAt(i + 1) - 48 >>> 0 < 10)
                        enc.push(+this.text.substr(i++, 2));
                    else
                        t = 3;
                if (t != 2) {
                    if (t > 2 || ((c & 127) < 32 && t) || ((c & 127) > 95 && !t)) {
                        for (j = t > 2 ? i : i + 1; j < this.text.length; j++)
                            if ((this.text.charCodeAt(j) - 32) & 64)
                                break;
                        j = j == this.text.length || (this.text.charCodeAt(j) & 96) ? 1 : 0;
                        enc.push(i == 0 ? 103 + j : j != t ? 101 - j : 98);
                        t = j;
                    }
                    if (c > 127)
                        enc.push(101 - t);
                    enc.push(((c & 127) + 64) % 96);
                }
            }
            if (i == 0)
                enc.push(103);
            j = enc[0];
            for (i = 1; i < enc.length; i++)
                j += i * enc[i];
            enc.push(j % 103);
            enc.push(106);
            c = [358, 310, 307, 76, 70, 38, 100, 98, 50, 292, 290, 274, 206, 110, 103, 230, 118, 115, 313, 302, 295, 370, 314, 439, 422, 406, 403,
                434, 410, 409, 364, 355, 283, 140, 44, 35, 196, 52, 49, 324, 276, 273, 220, 199, 55, 236, 227, 59, 443, 327, 279, 372, 369, 375,
                428, 419, 395, 436, 433, 397, 445, 289, 453, 152, 134, 88, 67, 22, 19, 200, 194, 104, 97, 26, 25, 265, 296, 477, 266, 61, 158, 94,
                79, 242, 122, 121, 466, 458, 457, 367, 379, 475, 188, 143, 47, 244, 241, 468, 465, 239, 247, 431, 471, 322, 328, 334, 285];
            for (t = i = 0; i < enc.length; i++, t++) {
                mat[t++] = 1;
                for (j = 256; j > 0; j >>= 1, t++)
                    if (c[enc[i]] & j)
                        mat[t] = 1;
            }
            mat[t++] = mat[t] = 1;
            return [mat];
        }
        toHtml(mat, size = 3, blocks = 5) {
            if (!Array.isArray(size))
                size = [size || 3, size || 3];
            let s = "barcode" + size[0] + size[1], b, ss;
            let html = "<style> ." + s + " div {float:left; margin:0; height:" + size[1] + "px}";
            blocks = blocks || 5;
            for (var i = 0; i < blocks; i++)
                for (var j = 0; j < blocks; j++)
                    html += "." + s + " .bar" + j + i + " {border-left:" + j * size[0] + "px solid; margin-right:" + i * size[0] + "px}";
            html += "</style><div class=" + s + " style='line-height:" + size[1] + "px; display:inline-block'>";
            for (i = 0; i < mat.length; i++)
                for (j = 0; j < mat[i].length;) {
                    if (i && !j)
                        html += "<br style='clear:both' />";
                    for (b = 0; j < mat[i].length; b++, j++)
                        if (!mat[i][j] || b + 1 == blocks)
                            break;
                    for (ss = 0; j < mat[i].length; ss++, j++)
                        if (mat[i][j] || ss + 1 == blocks)
                            break;
                    html += "<div class=bar" + b + ss + "></div>";
                }
            return html + "</div>";
        }
    }

    class LabelGenerator {
        items = [];
        success = false;
        type;
        constructor(data = undefined, type = 'normal') {
            this.type = type;
            if (data == null) ;
            else if (data instanceof Promise) {
                void data.then((data) => {
                    this.items = data;
                    this.print();
                });
            }
            else {
                this.items = data;
                this.print();
            }
        }
        print() {
            this.items = this.items.filter((item) => item.barcode != null);
            if (!this.isAllItemsActive()) {
                if (!confirm(i18n('notAllItemsActive'))) {
                    return;
                }
            }
            if (this.type == 'half' && this.items.length % 2 != 0) {
                if (!confirm(i18n('oddNumberOfItems'))) {
                    return;
                }
            }
            if (this.items.length > 0) {
                void this.printLabelsUsingBrowser(this.items);
            }
            else {
                alert(i18n('noData'));
            }
        }
        isAllItemsActive() {
            return this.items.every((item) => item.isActive);
        }
        makeUpperCaseBold(text) {
            const regex = /("[^"]+"|[A-ZŽĄČĘĖĮŠŲŪ]{3,})/g;
            return text.replace(regex, '<b>$1</b>');
        }
        static getPricePerUnit(item) {
            const regex = /(?:,?\s*)?(?:(\d+)\s*x\s*)?(\d+(\.\d+)?(?:,\d+)?)[\s]*(k?g|m?l|vnt|pak|rul)\b/i;
            const match = item.name.match(regex);
            if (match) {
                const match2 = item.name.replace(match[0], '').match(regex);
                if (match2) {
                    return null;
                }
                const multiplier = match[1] ? parseInt(match[1]) : 1;
                const amount = parseFloat(match[2].replace(',', '.')) * multiplier;
                const unit = match[4].replace('.', '').toLowerCase();
                let pricePerUnit;
                if (unit === 'g' || unit === 'ml') {
                    pricePerUnit =
                        (item.priceWithVat / (amount / 1000)).toFixed(2) +
                            (unit === 'ml' ? ' €/l' : ' €/kg');
                }
                else {
                    pricePerUnit = (item.priceWithVat / amount).toFixed(2) + ' €/' + unit;
                }
                if (parseFloat(pricePerUnit) === item.priceWithVat) {
                    return null;
                }
                return pricePerUnit;
            }
            return null;
        }
        generateLabel(data, type = this.type) {
            const label = document.createElement('div');
            label.className = 'label';
            if (data.weight != null) {
                return this.generateWeightLabel(data, type === 'half');
            }
            else if (type !== 'normal') {
                label.classList.add(type);
            }
            label.appendChild(this.createDivWithClass('item', this.makeUpperCaseBold(data.name), true));
            if (data.barcode != null && type !== 'half') {
                label.appendChild(this.createCode123Div(data));
            }
            else if (data.barcode != null) {
                label.appendChild(this.createDMDiv(data.barcode));
            }
            label.appendChild(this.createDivWithClass('price', this.getItemPrice(data)));
            if (data.packageCode != null) {
                const packagePrice = 0.1 * data.packageQuantity;
                label.appendChild(this.createDivWithClass('subtext', 'Tara +' + packagePrice.toFixed(2)));
            }
            else if (data.measurementUnitCanBeWeighed == true) {
                label.appendChild(this.createDivWithClass('subtext', '/ 1 ' + data.measurementUnitName));
            }
            return label;
        }
        getItemPrice(data) {
            if (data.priceWithVat == null || data.priceWithVat === 0) {
                return '';
            }
            if (typeof data.priceWithVat === 'number') {
                return data.priceWithVat.toFixed(2);
            }
            else {
                return parseFloat(data.priceWithVat).toFixed(2).toString();
            }
        }
        createCode123Div(data) {
            const barcode = document.createElement('div');
            barcode.className = 'barcode';
            barcode.appendChild(this.createDivWithClass('barcode-text', data.barcode));
            const code128 = new Code128(data.barcode);
            const p = document.createElement('p');
            p.innerHTML = code128.toHtml(code128.encode(), this.type == 'barcodeOnly' ? [1, 50] : [1, 15]);
            barcode.appendChild(p);
            return barcode;
        }
        generateWeightLabel(data, half = false) {
            const label = document.createElement('div');
            if (data.weight == null ||
                data.totalPrice == null ||
                data.priceWithVat == null ||
                data.barcode == null ||
                data.barcode.length > 13) {
                return label;
            }
            label.className = 'label weight' + (half ? ' half' : '');
            const elements = [
                { className: 'item', text: data.name },
                {
                    className: 'price',
                    text: half && data.addPackageFee
                        ? (data.totalPrice + 0.01).toFixed(2)
                        : data.totalPrice.toFixed(2),
                },
                {
                    className: 'weight',
                    text: (data.measurementUnitCanBeWeighed
                        ? Number(data.weight).toFixed(3)
                        : data.weight.toString()) +
                        (half ? ' ' + data.measurementUnitName : ''),
                },
                {
                    className: 'kg-price',
                    text: data.priceWithVat.toFixed(2) + (half ? ' €/kg' : ''),
                },
                { className: 'weight-text', text: data.measurementUnitName },
                { className: 'kg-text', text: '€/' + data.measurementUnitName },
            ];
            if (data.addPackageFee && !half) {
                elements.push({ className: 'package', text: '+ 0,01 (fas. maišelis)' });
            }
            elements.forEach(({ className, text }) => {
                label.appendChild(this.createDivWithClass(className, text));
            });
            const barcodeString = (data.addPackageFee ? '1102\t1\n' : '') +
                this.createPackedItemBarcode(data) +
                '\t1\n\r';
            label.appendChild(this.createDMDiv(barcodeString));
            if (data.expiryDate != null) {
                const date = new Date(data.expiryDate).toLocaleDateString('lt-LT', {
                    month: '2-digit',
                    day: '2-digit',
                });
                label.appendChild(this.createDivWithClass('expiry', date));
            }
            if (data.addManufacturer == true && data.manufacturerName != null) {
                label.appendChild(this.createDivWithClass('manufacturer', data.manufacturerName));
            }
            return label;
        }
        createDivWithClass(className, text, raw = false) {
            const div = document.createElement('div');
            div.className = className;
            if (raw) {
                div.innerHTML = text;
            }
            else {
                div.textContent = text;
            }
            return div;
        }
        createPackageBarcode(items) {
            if (items.length < 1) {
                throw new Error('No items to create package barcode');
            }
            let barcodeString = '';
            items.forEach((item) => {
                if (item.barcode == null) {
                    throw new Error('Item has no barcode');
                }
                const quantity = item.weight != null ? item.weight : 1;
                barcodeString += `${item.barcode}\t${quantity}\n`;
            });
            barcodeString += '\r';
            return barcodeString;
        }
        createPackedItemBarcode(data) {
            if (data.barcode == null) {
                throw new Error('Item has no barcode');
            }
            return ('2200' +
                data.barcode.padStart(13, '0') +
                data.weight.toFixed(3).replace('.', '').padStart(4, '0'));
        }
        createDMDiv(barcodeString, big = false) {
            if (typeof barcodeString !== 'string') {
                throw new Error('Barcode string must be a string');
            }
            else if (barcodeString.length < 1) {
                throw new Error('Barcode string cannot be empty');
            }
            const barcode = document.createElement('div');
            barcode.className = 'barcode dm';
            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            const path = document.createElementNS(svgNS, 'path');
            const matrix = getDataMatrixMat(barcodeString);
            const actualSize = matrix.length;
            path.setAttribute('transform', 'scale(1)');
            path.setAttribute('d', toPath(matrix));
            svg.appendChild(path);
            svg.setAttribute('class', 'datamatrix');
            svg.setAttribute('viewBox', `0 0 ${actualSize} ${actualSize}`);
            if (big === true) {
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.style.maxWidth = '60px';
                svg.style.maxHeight = '60px';
            }
            else {
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.style.maxWidth = '30px';
                svg.style.maxHeight = '30px';
            }
            svg.style.imageRendering = 'pixelated';
            svg.style.shapeRendering = 'crispEdges';
            barcode.appendChild(svg);
            return barcode;
        }
        isItInAppMode() {
            return (window.matchMedia('(display-mode: standalone)').matches ||
                window.matchMedia('(display-mode: fullscreen)').matches);
        }
        async printLabelsUsingBrowser(data) {
            const labels = data.map((item) => this.generateLabel(item));
            const popup = window.open('', '_blank', this.isItInAppMode() ? 'width=250,height=300' : 'width=800,height=600');
            if (popup == null) {
                alert('Please allow popups for this site');
                return;
            }
            popup.document.title = `${labels.length} ${i18n('nlabelsToBePrinted')}`;
            popup.document.head.appendChild(this.createStyleElement());
            labels.forEach((label) => {
                popup.document.body.appendChild(label);
            });
            this.success = true;
            popup.print();
        }
        createStyleElement() {
            const style = document.createElement('style');
            style.innerHTML = `${printStyles}`;
            return style;
        }
    }

    class AngularServiceLocator {
        static injector = null;
        static getInjector() {
            if (this.injector) {
                return this.injector;
            }
            const appElement = document.querySelector('[ng-app]');
            if (!appElement) {
                throw new Error('Angular app not found');
            }
            this.injector = angular.element(appElement).injector();
            return this.injector;
        }
        static getService(serviceName) {
            return this.getInjector().get(serviceName);
        }
    }

    class UINotification {
        notificationService;
        constructor() {
            try {
                this.notificationService = AngularServiceLocator.getService('Notification');
            }
            catch (error) {
                console.error('Failed to get Notification service', error);
                this.notificationService = {
                    info: (options) => alert(options),
                    error: (options) => alert(options),
                    success: (options) => alert(options),
                    warning: (options) => alert(options),
                    primary: (options) => alert(options)
                };
            }
        }
        info(options) {
            this.notificationService.info(options);
        }
        error(options) {
            this.notificationService.error(options);
        }
        success(options) {
            this.notificationService.success(options);
        }
        warning(options) {
            this.notificationService.warning(options);
        }
        primary(options) {
            this.notificationService.primary(options);
        }
    }

    function calculateTotalPrice(priceWithVat, quantity) {
        if (priceWithVat == null || quantity == null) {
            return 0;
        }
        const totalPrice = priceWithVat * quantity;
        return Math.round((totalPrice + Number.EPSILON) * 100) / 100;
    }

    function modalHTML(i18n) { return `<div class="modal-header"> <button type="button" class="close" ng-click="closeModal()" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> <h4 class="modal-title" id="weightLabelModalLabel">{{ !item.measurementUnitCanBeWeighed ? i18n('label') : i18n('weightLabel')}}</h4>
</div>
<div class="modal-body {{ item.weight > 9999 ? 'background-white-red' : '' }}"> <div class="form"> <div class="form-group"> <label for="productName">{{i18n('name')}}</label> <input type="text" class="form-control" ng-model="item.name" readonly> </div> <div class="row"> <div class="form-group col-sm-4"> <label for="productWeight">{{ (!item.measurementUnitCanBeWeighed ? i18n('quantity') : i18n('weight') + ' (g)')}}</label> <input type="text" class="form-control" ng-model="item.weight" ng-keyup="handleWeightChange(item.weight)" ng-keydown="hideVirtualKeyboard()"> </div> <div class="form-group col-sm-4"> <label for="totalPrice">{{i18n('totalPrice')}} (€)</label> <input type="number" step="0.01" class="form-control" readonly ng-model="item.totalPrice"> </div> <div class="form-group col-sm-4"> <label for="kgPrice">{{ i18n('price') + ' 1 ' + item.measurementUnitName }} (€)</label> <input type="number" step="0.01" class="form-control" readonly ng-model="item.priceWithVat"> </div> </div> <div class="row"> <div class="col-sm-6"> <div class="form-group"> <label for="expiryDate">{{i18n('expiryDate')}}</label> <input type="date" class="form-control" ng-model="item.expiryDate" ng-click="picker($event)"> </div> <div class="form-group"> <div class="checkbox-form"> <label> <input type="checkbox" class="ace" ng-model="item.addManufacturer"> <span class="lbl display-inline">&nbsp;{{i18n('addManufacturer')}}&nbsp; {{ item.manufacturerName }}</span> </label> </div> <div class="checkbox-form"> <label> <input type="checkbox" class="ace" ng-model="item.addPackageFee" checked> <span class="lbl display-inline">&nbsp;{{i18n('addPackageFee')}}</span> </label> </div> </div> </div> <div class="col-sm-6" ng-show="virtualKeyboardVisible"> <div class="keyboard"> <button class="key btn" ng-click="key('7')">7</button> <button class="key btn" ng-click="key('8')">8</button> <button class="key btn" ng-click="key('9')">9</button> <button class="key btn" ng-click="key('4')">4</button> <button class="key btn" ng-click="key('5')">5</button> <button class="key btn" ng-click="key('6')">6</button> <button class="key btn" ng-click="key('1')">1</button> <button class="key btn" ng-click="key('2')">2</button> <button class="key btn" ng-click="key('3')">3</button> <button class="key btn" ng-click="key('0')">0</button> <button class="key btn btn-grey" ng-click="key('c')">C</button> <button class="key btn btn-danger backspace" ng-click="key('d')">⌫</button> </div> </div> </div> </div>
</div> <div class="modal-footer"> <button type="button" class="btn btn-secondary" ng-click="closeModal()"> <i class="fa fa-times"></i>&nbsp;{{i18n('close')}}</button> <button type="button" class="btn btn-primary" ng-click="add()" ng-if="addButton"> <i class="fa fa-plus"></i>&nbsp;{{i18n('add')}}</button> <button type="button" class="btn btn-purple" ng-click="print()" "> <i class=" fa fa-print"></i>&nbsp;{{i18n('print')}}&nbsp;[{{ i18n('normal')}}]</button>
</div>`; }

    class WeightLabelModal {
        modalService;
        notifier;
        controller;
        modalScope;
        constructor(modalService, notifier, controller) {
            this.modalService = modalService;
            this.notifier = notifier;
            this.controller = controller;
            this.modalScope = {
                item: null,
                weight: '',
                virtualKeyboardVisible: this.controller !== undefined,
                addButton: this.controller !== undefined,
                hideVirtualKeyboard: this.hideVirtualKeyboard.bind(this),
                handleWeightChange: this.handleWeightChange.bind(this),
                key: this.key.bind(this),
                add: this.add.bind(this),
                print: this.print.bind(this),
                picker: this.showPicker.bind(this),
                i18n: i18n
            };
        }
        hideVirtualKeyboard() {
            this.modalScope.virtualKeyboardVisible = false;
        }
        key(input) {
            if (!this.modalScope.item) {
                return;
            }
            if (input === 'd' && this.modalScope.item.weight) {
                this.modalScope.item.weight = this.modalScope.item.weight.toString().slice(0, -1);
            }
            else if (input === 'c') {
                this.modalScope.item.weight = '';
            }
            else if (input !== 'd') {
                this.modalScope.item.weight = (this.modalScope.item.weight || '') + input;
            }
            this.modalScope.handleWeightChange();
        }
        show(item) {
            if (!item || !item.name || !item.priceWithVat) {
                this.notifier.error(i18n('noData'));
                return Promise.reject();
            }
            this.setupModalItem(item);
            return this.modalService.showModal({
                template: modalHTML(),
                scopeProperties: this.modalScope,
                size: 'md',
                windowClass: 'weight-label-modal',
            });
        }
        setupModalItem(item) {
            this.modalScope.item = {
                ...item,
                weight: '',
                addManufacturer: false,
                addPackageFee: true,
            };
        }
        getWeightItem() {
            const item = { ...this.modalScope.item };
            if (!item || !item.weight) {
                this.notifier.error(i18n('missingWeight'));
                return null;
            }
            item.weight = item.measurementUnitCanBeWeighed ? this.gToKg(parseFloat(item.weight.toString())) : parseFloat(item.weight.toString());
            if (item.weight > 9.999) {
                this.notifier.error(i18n('maxWeight'));
                return null;
            }
            item.addManufacturer =
                !!item.addManufacturer && !!item.manufacturerName?.length;
            return item;
        }
        add() {
            if (this.controller !== undefined) {
                const item = this.getWeightItem();
                if (item) {
                    void this.controller?.processItem(item, true);
                }
            }
        }
        print() {
            const item = this.getWeightItem();
            if (item) {
                this.notifier.success({
                    title: i18n('printJobIsSent'),
                    message: `${item.weight}${item.measurementUnitName}`,
                });
                new LabelGenerator([item]);
            }
        }
        handleWeightChange() {
            if (!this.modalScope.item) {
                return;
            }
            this.modalScope.item.totalPrice = calculateTotalPrice(this.modalScope.item.priceWithVat, this.modalScope.item.measurementUnitCanBeWeighed ?
                this.gToKg(Number(this.modalScope.item.weight || 0)) : Number(this.modalScope.item.weight || 0));
        }
        gToKg(weight) {
            return weight / 1000;
        }
        showPicker(event) {
            const target = event.target;
            if (target?.showPicker) {
                target.showPicker();
            }
        }
    }

    class ModalService {
        $uibModal;
        $rootScope;
        modalInstance = null;
        constructor() {
            const injector = angular.element(document.body).injector();
            this.$uibModal = injector.get('$uibModal');
            this.$rootScope = injector.get('$rootScope');
        }
        async showModal(config) {
            const modalScope = this.$rootScope.$new(true);
            if (config.scopeProperties) {
                Object.defineProperties(modalScope, Object.entries(config.scopeProperties).reduce((acc, [key, value]) => ({
                    ...acc,
                    [key]: {
                        get: () => config.scopeProperties[key],
                        set: (v) => config.scopeProperties[key] = v,
                        enumerable: true,
                        configurable: true
                    }
                }), {}));
            }
            this.modalInstance = this.$uibModal.open({
                animation: true,
                template: config.template,
                scope: modalScope,
                size: config.size || 'lg',
                backdrop: config.backdrop || 'static',
                windowClass: config.windowClass || '',
            });
            modalScope.closeModal = () => {
                this.modalInstance.close();
                modalScope.$destroy();
                config.onClose?.();
            };
            return this.modalInstance.result;
        }
    }

    class AdminPrintUserscript {
        pageReady = false;
        notification = new UINotification();
        modal = new ModalService();
        currentUrl;
        constructor() {
            this.currentUrl = window.location.pathname;
            this.init();
            void this.handleUrlChange(null, this.currentUrl);
            console.debug('LabelsUserscript initialized');
        }
        init() {
            this.overrideHistoryMethods();
            this.setupPopStateListener();
        }
        overrideHistoryMethods() {
            const originalPushState = history.pushState;
            history.pushState = (state, title, url) => {
                const previousUrl = this.currentUrl;
                const result = originalPushState.apply(history, [state, title, url]);
                this.currentUrl = window.location.pathname;
                void this.handleUrlChange(previousUrl, this.currentUrl);
                return result;
            };
            const originalReplaceState = history.replaceState;
            history.replaceState = (state, title, url) => {
                const previousUrl = this.currentUrl;
                const result = originalReplaceState.apply(history, [state, title, url]);
                this.currentUrl = window.location.pathname;
                void this.handleUrlChange(previousUrl, this.currentUrl);
                return result;
            };
        }
        setupPopStateListener() {
            window.addEventListener('popstate', () => {
                const previousUrl = this.currentUrl;
                this.currentUrl = window.location.pathname;
                void this.handleUrlChange(previousUrl, this.currentUrl);
            });
        }
        async handleUrlChange(previousUrl, currentUrl, tries = 0) {
            this.pageReady = false;
            void new Promise(resolve => setTimeout(resolve, 200));
            let success = false;
            switch (this.currentUrl) {
                case '/en/reference-book/items':
                case '/en/warehouse/purchases/edit':
                case '/reference-book/items':
                case '/warehouse/purchases/edit':
                    success = await this.addPrintButton();
                    if (success) {
                        setTimeout(() => {
                            if (document.querySelector('.print') == null) {
                                void this.addPrintButton();
                            }
                        }, 1000);
                    }
                    break;
                case '/en/reference-book/items/edit':
                case '/reference-book/items/edit':
                    success = await this.addPrintButton('.btn-ctrl', true);
                    break;
                default:
                    success = true;
                    break;
            }
            if (success) {
                this.pageReady = true;
            }
            if (!this.pageReady && tries < 5) {
                setTimeout(() => {
                    void this.handleUrlChange(null, this.currentUrl, tries + 1);
                }, 600);
            }
        }
        getDataRows() {
            const dataRows = document.querySelector('.data-rows');
            if (dataRows == null) {
                this.notification.error(i18n('error'));
                throw new Error('Data rows not found');
            }
            return dataRows;
        }
        extractDataFromAngularItemList() {
            const dataRows = this.getDataRows();
            return angular.element(dataRows).controller().grid.data.filter((a) => a._select);
        }
        async extractDataFromAngularPurchaseView() {
            const dataRows = this.getDataRows();
            const selectedRows = angular.element(dataRows).controller().data.filter((a) => a._select);
            const items = [];
            selectedRows.forEach((row) => {
                items.push({
                    name: row.itemName,
                    barcode: row.itemBarcode,
                    code: row.itemCode,
                    id: row.itemId,
                    priceWithVat: row.itemPriceWithVat,
                    priceWithoutVat: row.itemPriceWithoutVat,
                    measurementUnitName: row.measurementUnitName,
                    isActive: true
                });
            });
            return items;
        }
        extractDataFromAngularItemView() {
            const form = document.querySelector('ng-form');
            if (form == null) {
                this.notification.error(i18n('error'));
                return [];
            }
            const data = angular.element(form).controller().model;
            return [data];
        }
        async getViewItems() {
            let items = [];
            switch (window.location.pathname) {
                case '/en/reference-book/items':
                case '/reference-book/items':
                    items = this.extractDataFromAngularItemList();
                    break;
                case '/en/warehouse/purchases/edit':
                case '/warehouse/purchases/edit':
                    items = await this.extractDataFromAngularPurchaseView();
                    break;
                case '/en/reference-book/items/edit':
                case '/reference-book/items/edit':
                    items = this.extractDataFromAngularItemView();
                    break;
            }
            return items;
        }
        async addPrintButton(parentSelector = '.buttons-left', withName = false) {
            const buttonsLeft = document.querySelector(parentSelector);
            if (buttonsLeft == null) {
                return false;
            }
            const icon = document.querySelector('i.fa-cloud-upload');
            if (icon != null) {
                const grandParent = icon.parentElement?.parentElement;
                if (grandParent != null) {
                    grandParent.remove();
                }
            }
            let printDiv = document.createElement('div');
            printDiv.className = 'print';
            let button = document.createElement('button');
            button.title = i18n('print');
            button.type = 'button';
            button.className = 'btn btn-sm btn-purple';
            let i = document.createElement('i');
            i.className = 'fa fa-fw fa-print';
            button.appendChild(i);
            if (withName) {
                const span = document.createElement('span');
                span.className = 'margin-left-5';
                span.textContent = i18n('print');
                button.appendChild(span);
            }
            button.addEventListener('click', () => {
                void this.printLabels();
            });
            printDiv.appendChild(button);
            buttonsLeft.appendChild(printDiv);
            button = document.createElement('button');
            button.title = i18n('weightLabel');
            button.type = 'button';
            button.className = 'btn btn-sm btn-pink';
            i = document.createElement('i');
            i.className = 'fa fa-fw fa-balance-scale';
            button.appendChild(i);
            if (withName) {
                const span = document.createElement('span');
                span.className = 'margin-left-5';
                span.textContent = i18n('weightLabel');
                button.appendChild(span);
            }
            button.addEventListener('click', () => { void this.goToWeightLabelModal(); });
            printDiv = document.createElement('div');
            printDiv.appendChild(button);
            buttonsLeft.appendChild(printDiv);
            return true;
        }
        async goToWeightLabelModal() {
            const items = await this.getViewItems();
            if (items.length < 1) {
                this.notification.error(i18n('noItemsSelected'));
                return;
            }
            if (items.length > 1) {
                this.notification.error(i18n('onlyOneItem'));
                return;
            }
            const item = items[0];
            const modal = new WeightLabelModal(this.modal, this.notification);
            void modal.show(item);
        }
        async printLabels() {
            const items = await this.getViewItems();
            if (items.length < 1) {
                this.notification.error(i18n('noItemsSelected'));
                return;
            }
            void new LabelGenerator(items);
        }
    }
    window.addEventListener('load', () => {
        void new AdminPrintUserscript();
    });

})();
