
export function hslToHex(hslString: string): string {
  try {
    // Handle empty or invalid input
    if (!hslString || hslString.trim() === '') {
      return "#000000";
    }
    
    const [h, s, l] = hslString.split(' ').map(val => parseFloat(val.replace('%', '')));
    
    // Check if any of the values is NaN
    if (isNaN(h) || isNaN(s) || isNaN(l)) {
      return "#000000"; // Return a default color if input is invalid
    }
    
    const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
    const x = c * (1 - Math.abs(h / 60 % 2 - 1));
    const m = l / 100 - c / 2;
    let r, g, b;
    if (h >= 0 && h < 60) {
      [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
      [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
      [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
      [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }
    const toHex = (n: number): string => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch (error) {
    console.error("Error converting HSL to HEX:", error);
    return "#000000"; // Return a default color if there's an error
  }
}

export function hexToHsl(hex: string): string {
  try {
    // Return a default HSL value if hex is empty or invalid
    if (!hex || !hex.startsWith('#')) {
      return "0 0% 0%";
    }
    
    // If it's not a complete hex code yet, return a default to prevent NaN errors
    if (hex.length < 7) {
      return "0 0% 0%";
    }
    
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Check if any RGB value is NaN
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return "0 0% 0%";
    }
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h = Math.round(h * 60);
    }
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `${h} ${s}% ${l}%`;
  } catch (error) {
    console.error("Error converting HEX to HSL:", error);
    return "0 0% 0%"; // Return a default HSL if there's an error
  }
}
