/** Reference:
* @author alois zingl
* @link https://zingl.github.io/
*/
export class DataMatrix {
  private enc: number[];
  private cw: number;
  private ce: number;

  constructor(private text: string, private rect: boolean) {
    this.enc = [];
    this.cw = 0;
    this.ce = 0;
  }

  private push(val: number) {
    this.cw = 40 * this.cw + val;
    if (this.ce++ === 2) {
      this.enc.push(++this.cw >> 8);
      this.enc.push(this.cw & 255);
      this.ce = this.cw = 0;
    }
  }

  private static costFunctions: Array<(c: number) => number> = [
    function (c) { return ((c - 48) & 255) < 10 ? 6 : c < 128 ? 12 : 24; }, // ascii
    function (c) { return ((c - 48) & 255) < 10 || ((c - 65) & 255) < 26 || c === 32 ? 8 : c < 128 ? 16 : 16 + DataMatrix.costFunctions[1](c & 127); }, // c40
    function (c) { return ((c - 48) & 255) < 10 || ((c - 97) & 255) < 26 || c === 32 ? 8 : c < 128 ? 16 : 16 + DataMatrix.costFunctions[2](c & 127); }, // text
    function (c) { return ((c - 48) & 255) < 10 || ((c - 65) & 255) < 26 || c === 32 || c === 13 || c === 62 || c === 42 ? 8 : 1e9; }, // x12
    function (c) { return c >= 32 && c < 95 ? 9 : 1e9; }, // edifact
    function (c) { return 12; } // base256
  ];

  private latchCosts: number[] = [0, 24, 24, 24, 21, 25];
  private countCosts: number[] = [0, 12, 12, 12, 12, 25];

  public encode(): number[][] {
    let c: number, i: number, p: number, cm = 0, nm = 0;
    let bytes: number[][] = [];
    bytes[this.text.length] = [...this.countCosts];

    for (p = this.text.length; p-- > 0;) {
      for (c = 1e9, i = 0; i < this.countCosts.length; i++) {
        this.countCosts[i] += DataMatrix.costFunctions[i](this.text.charCodeAt(p));
        c = Math.min(c, Math.ceil(this.countCosts[i] / 12) * 12);
      }
      if (DataMatrix.costFunctions[0](this.text.charCodeAt(p)) > 6) {
        this.countCosts[0] = Math.ceil(this.countCosts[0] / 12) * 12;
      }
      for (i = 0; i < this.countCosts.length; i++) {
        if (c + this.latchCosts[i] < this.countCosts[i]) {
          this.countCosts[i] = c + this.latchCosts[i];
        }
      }
      bytes[p] = [...this.countCosts];
    }

    for (p = 0; ; cm = nm) {
      c = bytes[p][cm] - this.latchCosts[cm];
      if (p + [0, 2, 2, 2, 3, 0][cm] >= this.text.length) {
        nm = 0;
      } else {
        for (i = DataMatrix.costFunctions.length; i-- > 0;) {
          if (Math.ceil((bytes[p + 1][i] + DataMatrix.costFunctions[i](this.text.charCodeAt(p))) / 12) * 12 === c) {
            nm = i;
          }
        }
      }

      if (cm !== nm && cm > 0) {
        if (cm < 4) {
          this.enc.push(254);
        } else if (cm === 4) {
          this.enc.push(31 | this.cw & 255);
        } else {
          if (this.ce > 249) {
            this.enc.push((Math.floor(this.ce / 250) + 250 + (149 * (this.enc.length + 1)) % 255) & 255);
          }
          this.enc.push((this.ce % 250 + (149 * (this.enc.length + 1)) % 255 + 1) & 255);
          while (this.ce > 0) {
            this.enc.push((this.text.charCodeAt(p - this.ce) + (149 * (this.enc.length + 1)) % 255 + 1) & 255);
            this.ce--;
          }
        }
      }

      if (p >= this.text.length) break;
      if (cm !== nm) this.cw = this.ce = 0;
      if (cm !== nm && nm > 0) this.enc.push([230, 239, 238, 240, 231][nm - 1]);

      if (nm === 0) {
        c = this.text.charCodeAt(p++);
        i = (c - 48) & 255;
        if (i < 10 && p < this.text.length && ((this.text.charCodeAt(p) - 48) & 255) < 10) {
          this.enc.push(i * 10 + this.text.charCodeAt(p++) - 48 + 130);
        } else {
          if (c > 127) this.enc.push(235);
          this.enc.push((c & 127) + 1);
        }
        if (cm === 4 || this.ce < 0) this.ce--;
      } else if (nm < 4) {
        const sets = [
          [31, 0, 32, 119, 47, 133, 57, 179, 64, 173, 90, 207, 95, 277, 127, 386, 255, 1],
          [31, 0, 32, 119, 47, 133, 57, 179, 64, 173, 90, 258, 95, 277, 122, 335, 127, 386, 255, 1],
          [13, 55, 32, 119, 42, 167, 57, 179, 62, 243, 90, 207, 255, 3]
        ][nm - 1];

        do {
          c = this.text.charCodeAt(p++);
          if (c > 127) {
            this.push(1);
            this.push(30);
            c &= 127;
          }
          for (i = 0; c > sets[i]; i += 2);
          if ((sets[i + 1] & 3) < 3) this.push(sets[i + 1] & 3);
          this.push(c - (sets[i + 1] >> 2));
        } while (this.ce > 0);
      } else if (nm === 4) {
        if (this.ce > 0) this.enc.push(255 & this.cw + (this.text.charCodeAt(p++) & 63));
        for (this.cw = this.ce = 0; this.ce < 3; this.ce++) {
          this.cw = 64 * (this.cw + (this.text.charCodeAt(p++) & 63));
        }
        this.enc.push(this.cw >> 16);
        this.enc.push((this.cw >> 8) & 255);
      } else {
        p++;
        this.ce++;
      }
    }
    var el = this.enc.length; // compute symbol size
    var h, w, nc = 1, nr = 1, fw, fh; // symbol size, regions, region size
    var j = -1, l, r, s, b = 1, k;

    if (this.ce == -1 || (cm && cm < 5)) nm = 1; // c40/text/x12/edifact unlatch removable
    if (this.rect && el - nm < 50) { // rectangular symbol possible
      k = [16, 7, 28, 11, 24, 14, 32, 18, 32, 24, 44, 28]; // symbol width, checkwords
      do {
        w = k[++j]; // width w/o finder pattern
        h = 6 + (j & 12); // height
        l = w * h / 8; // # of bytes in symbol
      } while (l - k[++j] < el - nm); // data + check fit in symbol?
      if (w > 25) nc = 2; // column regions
    } else { // square symbol
      w = h = 6;
      i = 2; // size increment
      k = [5, 7, 10, 12, 14, 18, 20, 24, 28, 36, 42, 48, 56, 68, 84,
        112, 144, 192, 224, 272, 336, 408, 496, 620]; // RS checkwords
      do {
        if (++j == k.length) return []; // message too long for Datamatrix
        if (w > 11 * i) i = 4 + i & 12; // advance increment
        w = h += i;
        l = (w * h) >> 3;
      } while (l - k[j] < el - nm); // data + check fit in symbol?
      if (w > 27) nr = nc = 2 * Math.floor(w / 54) + 2; // regions
      if (l > 255) b = 2 * (l >> 9) + 2; // blocks
    }
    s = k[j]; // RS checkwords
    if (l - s + 1 == el && nm > 0) { // remove last unlatch to fit in smaller symbol
      el--; 				// replace edifact unlatch by char
      if (this.ce == -1) this.enc[el - 1] ^= 31 ^ (this.enc[el] - 1) & 63;
    }
    fw = w / nc; fh = h / nr; // region size
    if (el < l - s) this.enc[el++] = 129; // first padding
    while (el < l - s) // add more padding
      this.enc[el++] = (((149 * el) % 253) + 130) % 254;

    s /= b; // compute Reed Solomon error detection and correction
    var rs = new Array(70), rc = new Array(70); // reed/solomon code
    var lg = new Array(256), ex = new Array(255); // log/exp table for multiplication
    for (j = 1, i = 0; i < 255; i++) { // compute log/exp table of Galois field
      ex[i] = j; lg[j] = i;
      j += j; if (j > 255) j ^= 301; // GF polynomial a^8+a^5+a^3+a^2+1 = 100101101b = 301
    }
    for (rs[s] = 0, i = 1; i <= s; i++)  // compute RS generator polynomial
      for (j = s - i, rs[j] = 1; j < s; j++)
        rs[j] = rs[j + 1] ^ ex[(lg[rs[j]] + i) % 255];
    for (c = 0; c < b; c++) { // compute RS correction data for each block
      for (i = 0; i <= s; i++) rc[i] = 0;
      for (i = c; i < el; i += b)
        for (j = 0, k = rc[0] ^ this.enc[i]; j < s; j++)
          rc[j] = rc[j + 1] ^ (k ? ex[(lg[rs[j]] + lg[k]) % 255] : 0);
      for (i = 0; i < s; i++) // add interleaved correction data
        this.enc[el + c + i * b] = rc[i];
    }
    // layout perimeter finder pattern
    var mat: number[][] = Array(h + 2 * nr).fill(null).map(function () { return []; });
    for (i = 0; i < w + 2 * nc; i += fw + 2) // vertical
      for (j = 0; j < h; j++) {
        mat[j + (j / fh | 0) * 2 + 1][i] = 1;
        if ((j & 1) == 1) mat[j + (j / fh | 0) * 2][i + fw + 1] = 1;
      }
    for (i = 0; i < h + 2 * nr; i += fh + 2) // horizontal
      for (j = 0; j < w + 2 * nc; j++) {
        mat[i + fh + 1][j] = 1;
        if ((j & 1) == 0) mat[i][j] = 1;
      }
    // layout data
    s = 2; c = 0; r = 4; // step,column,row of data position
    for (i = 0; i < l; r -= s, c += s) { // diagonal steps
      if (r == h - 3 && c == -1) // corner A layout
        k = [w, 6 - h, w, 5 - h, w, 4 - h, w, 3 - h, w - 1, 3 - h, 3, 2, 2, 2, 1, 2];
      else if (r == h + 1 && c == 1 && (w & 7) == 0 && (h & 7) == 6) // corner D layout
        k = [w - 2, -h, w - 3, -h, w - 4, -h, w - 2, -1 - h, w - 3, -1 - h, w - 4, -1 - h, w - 2, -2, -1, -2];
      else {
        if (r == 0 && c == w - 2 && (w & 3)) continue; // corner B: omit upper left
        if (r < 0 || c >= w || r >= h || c < 0) {  // outside
          s = -s; r += 2 + s / 2; c += 2 - s / 2;        // turn around
          while (r < 0 || c >= w || r >= h || c < 0) { r -= s; c += s; }
        }
        if (r == h - 2 && c == 0 && (w & 3)) // corner B layout
          k = [w - 1, 3 - h, w - 1, 2 - h, w - 2, 2 - h, w - 3, 2 - h, w - 4, 2 - h, 0, 1, 0, 0, 0, -1];
        else if (r == h - 2 && c == 0 && (w & 7) == 4) // corner C layout
          k = [w - 1, 5 - h, w - 1, 4 - h, w - 1, 3 - h, w - 1, 2 - h, w - 2, 2 - h, 0, 1, 0, 0, 0, -1];
        else if (r == 1 && c == w - 1 && (w & 7) == 0 && (h & 7) == 6) continue; // omit corner D
        else k = [0, 0, -1, 0, -2, 0, 0, -1, -1, -1, -2, -1, -1, -2, -2, -2]; // nominal L-shape layout
      }
      for (el = this.enc[i++], j = 0; el > 0; j += 2, el >>= 1) { // layout each bit
        if (el & 1) {
          var x = c + k[j], y = r + k[j + 1];
          if (x < 0) { x += w; y += 4 - ((w + 4) & 7); } // wrap around
          if (y < 0) { y += h; x += 4 - ((h + 4) & 7); }
          mat[y + 2 * (y / fh | 0) + 1][x + 2 * (x / fw | 0) + 1] = 1; // add region gap
        }
      }
    }
    for (i = w; i & 3; i--) mat[i][i] = 1; // unfilled corner
    return mat; // width and height of symbol
  }
  public toPath(mat: number[][]): string {
    let path = "", x, y, d;
    mat.forEach(function (y) { y.unshift(0); }); // add padding around matrix
    mat.push([]); mat.unshift([]);
    for (; ;) {		// draw polygons
      for (y = 0; y + 2 < mat.length; y++) // look for set pixel
        if ((x = mat[y + 1].indexOf(1) - 1) >= 0 || (x = mat[y + 1].indexOf(5) - 1) >= 0) break;
      if (y + 2 == mat.length || path.length > 1e7) return path;
      if (x != null) { // found set pixel
        var c = mat[y + 1][x + 1] ?? 0 >> 2, p = ""; // from start
        for (let x0: number = x, y0 = y, d = 1; p.length < 1e6;) { // encircle pixel area
          do x += 2 * d - 1; // move left/right
          while ((mat[y][x + d] ^ mat[y + 1][x + d]) & mat[y + d][x + d] & 1); // follow horizontal edge
          d ^= mat[y + d][x + d] & 1; // turn up/down
          do mat[d ? ++y : y--][x + 1] ^= 2; // move and mark edge
          while ((mat[y + d][x] ^ mat[y + d][x + 1]) & mat[y + d][x + 1 - d] & 1); // follow vertical edge
          if (x == x0 && y == y0) break; // returned to start
          d ^= 1 ^ mat[y + d][x + 1 - d] & 1; // turn left/right
          if (c) p = "V" + y + "H" + x + p; // add points counterclockwise
          else p += "H" + x + "V" + y; // add clockwise
        }

        path += "M" + x + " " + y + p + (c ? "V" + y : "H" + x) + "Z"; // close path
        for (d = 0, y = 1; y < mat.length - 1; y++) // clear pixel between marked edges
          for (x = 1; x < mat[y].length; x++) {
            d ^= (mat[y][x] >> 1) & 1; // invert pixels inside, clr marking
            mat[y][x] = 5 * d ^ mat[y][x] & 5;
          }
      }
    }
  }
}

export class Code128 {

  constructor(private text: string) { }

  public encode(): number[][] {
    var t = 3, enc = [], i, j, c, mat = [];
    for (i = 0; i < this.text.length; i++) {
      c = this.text.charCodeAt(i);
      if (t != 2) { // alpha mode
        for (j = 0; j + i < this.text.length; j++) // count digits
          if (this.text.charCodeAt(i + j) - 48 >>> 0 > 9) break; // digit ?
        if ((j > 1 && i == 0) || (j > 3 && (i + j < this.text.length || (j & 1) == 0))) {
          enc.push(i == 0 ? 105 : 99); // Start / Code C
          t = 2; // to digit
        }
      }
      if (t == 2) // digit mode
        if (c - 48 >>> 0 < 10 && i + 1 < this.text.length && this.text.charCodeAt(i + 1) - 48 >>> 0 < 10)
          enc.push(+this.text.substr(i++, 2)); // 2 digits
        else t = 3; // exit digit
      if (t != 2) { // alpha mode
        if (t > 2 || ((c & 127) < 32 && t) || ((c & 127) > 95 && !t)) { // change ?
          for (j = t > 2 ? i : i + 1; j < this.text.length; j++) // A or B needed?
            if ((this.text.charCodeAt(j) - 32) & 64) break; // < 32 or > 95
          j = j == this.text.length || (this.text.charCodeAt(j) & 96) ? 1 : 0;
          enc.push(i == 0 ? 103 + j : j != t ? 101 - j : 98); // start:code:shift
          t = j; // change mode
        }
        if (c > 127) enc.push(101 - t); // FNC4: code chars > 127
        enc.push(((c & 127) + 64) % 96);
      }
    }
    if (i == 0) enc.push(103); // empty message
    j = enc[0]; // check digit
    for (i = 1; i < enc.length; i++) j += i * enc[i];
    enc.push(j % 103); enc.push(106); // stop

    c = [358, 310, 307, 76, 70, 38, 100, 98, 50, 292, 290, 274, 206, 110, 103, 230, 118, 115, 313, 302, 295, 370, 314, 439, 422, 406, 403,
      434, 410, 409, 364, 355, 283, 140, 44, 35, 196, 52, 49, 324, 276, 273, 220, 199, 55, 236, 227, 59, 443, 327, 279, 372, 369, 375,
      428, 419, 395, 436, 433, 397, 445, 289, 453, 152, 134, 88, 67, 22, 19, 200, 194, 104, 97, 26, 25, 265, 296, 477, 266, 61, 158, 94,
      79, 242, 122, 121, 466, 458, 457, 367, 379, 475, 188, 143, 47, 244, 241, 468, 465, 239, 247, 431, 471, 322, 328, 334, 285];
    for (t = i = 0; i < enc.length; i++, t++) { // code to pattern
      mat[t++] = 1;
      for (j = 256; j > 0; j >>= 1, t++)
        if (c[enc[i]] & j) mat[t] = 1;
    }
    mat[t++] = mat[t] = 1;
    return [mat];
  }
  /** convert a black&white image matrix to html/css
  * @param mat 0/1 image matrix array
  * @param size optional (3): single bar in pixel, or as [width,height]
  * @param blocks optional (5): # of bar/space classes
  * @return html/css of 2D barcode
  */
  public toHtml(mat: number[][], size: number | number[] = 3, blocks: number = 5): string {
    if (!Array.isArray(size)) size = [size || 3, size || 3];
    let s = "barcode" + size[0] + size[1], b, ss; // style class
    let html = "<style> ." + s + " div {float:left; margin:0; height:" + size[1] + "px}";
    blocks = blocks || 5;
    for (var i = 0; i < blocks; i++) // define bars/spaces
      for (var j = 0; j < blocks; j++)
        html += "." + s + " .bar" + j + i + " {border-left:" + j * size[0] + "px solid; margin-right:" + i * size[0] + "px}";
    html += "</style><div class=" + s + " style='line-height:" + size[1] + "px; display:inline-block'>";

    for (i = 0; i < mat.length; i++) // convert matrix
      for (j = 0; j < mat[i].length;) {
        if (i && !j) html += "<br style='clear:both' />";
        for (b = 0; j < mat[i].length; b++, j++) // bars
          if (!mat[i][j] || b + 1 == blocks) break;
        for (ss = 0; j < mat[i].length; ss++, j++) // spaces
          if (mat[i][j] || ss + 1 == blocks) break;
        html += "<div class=bar" + b + ss + "></div>";
      }
    return html + "</div>"; // html/css of 2D barcode
  }
}