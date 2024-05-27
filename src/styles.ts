export const labelStyles = `
body {
    margin: 0;
    padding: 0;
}
.label {
    position: relative;
    background:white;
    color: black;
    height: 31.75mm;
    width: 57.15mm;
    border: 0.5px solid #ffdfd4;
    margin: 0px;
    box-sizing: border-box;
    overflow: hidden;
}
.item {
    height: 19mm;
    overflow: hidden;
    padding: 4px;
    font-family: Arial,sans-serif;
}

.barcode {
    white-space: nowrap;
    position: absolute;
    bottom: 0;
    z-index: 3;
}

.barcode div {
    font-size: 10px;
    font-family: monospace;
    margin-left: 10px;
    line-height: 1em;
}
.barcode div small{
    color: #888;
    font-size: 8px;
    display: block;
}
.barcode img {
    width: 35mm;
    height: 4mm;
    object-fit: cover;
    object-position: top;
}

.alternative .barcode {
    left: 50%;
    transform: translateX(-50%);
}

.alternative .price {
    display: none;
}

.alternative .barcode img {
    width: 50mm;
    height: 12mm;
}
.alternative .barcode div {
margin-left: 0;
}
.alternative .barcode div {
    font-size: 11px;
    display: flex;
    justify-content: space-between
}
.alternative .barcode div small {
    color: black;
    font-size: 9px;
}

.price {
    position: absolute;
    bottom: 22px;
    font-size: 50px;
    right: 0;
    overflow: hidden;
    object-position: center;
    margin-right: 3px;
    line-height: 1em;
    font-family: "Book Antiqua", serif;
    padding-right: 10px;
}
.deposit {
    position: absolute;
    right: 2px;
    bottom: 3px;
    font-family: math;
    font-size: 16px;
    font-weight: 700;
}
.inactive {
    height: 5px;
    width: 80px;
    background-color: #e5e5f7;
    opacity: 0.8;
    background-image: repeating-linear-gradient(45deg, #E91E63 25%, transparent 25%, transparent 75%, #E91E63 75%, #E91E63), repeating-linear-gradient(45deg, #E91E63 25%, #e5e5f7 25%, #e5e5f7 75%, #E91E63 75%, #E91E63);
    background-position: 0 0, 10px 10px;
    background-size: 20px 20px;
    position: absolute;
    bottom: 0;
    right: 0;
}

`
