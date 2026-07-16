import type { Point, ShapeEffect, CustomShape } from '../store/useAppStore';

export const generatePathString = (pts: Point[], close = true) => {
  if (pts.length === 0) return '';
  let d = '';
  let isFirst = true;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (p.x === -999999 || p.y === -999999) {
      if (close && !isFirst) d += ' Z';
      isFirst = true;
    } else {
      d += `${isFirst ? ' M' : ' L'} ${p.x} ${p.y}`;
      isFirst = false;
    }
  }
  if (close && !isFirst) d += ' Z';
  return d.trim();
};

// Returns { defsString, fill, stroke, filter, strokeWidth }
export const getShapeSvgAttributes = (effect: ShapeEffect, uid: string) => {
  let fill = 'transparent';
  let stroke = 'white';
  let filter = '';
  let strokeWidth = '0';
  let defs = '';

  const colors = effect.colors || ['#ff0080', '#7928ca', '#ff4d4d'];
  const intensity = effect.intensity || 1;

  switch (effect.type) {
    case 'glass':
      fill = `rgba(255, 255, 255, ${effect.opacity})`;
      stroke = `rgba(255, 255, 255, ${Math.min(1, effect.opacity + 0.4)})`;
      strokeWidth = '2';
      break;

    case 'mesh':
      fill = `url(#mesh-${uid})`;
      defs += `
        <linearGradient id="mesh-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0] || '#ff0080'}" />
          <stop offset="50%" stop-color="${colors[1] || '#7928ca'}" />
          <stop offset="100%" stop-color="${colors[2] || '#ff4d4d'}" />
        </linearGradient>
      `;
      break;

    case 'holographic':
      fill = `url(#holo-${uid})`;
      stroke = 'rgba(255, 255, 255, 0.5)';
      strokeWidth = '2';
      defs += `
        <linearGradient id="holo-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          ${colors.map((c, i) => `<stop offset="${(i / Math.max(1, colors.length - 1)) * 100}%" stop-color="${c}" />`).join('')}
        </linearGradient>
      `;
      break;

    case 'noise':
      fill = colors[0] || '#444';
      filter = `url(#noise-${uid})`;
      defs += `
        <filter id="noise-${uid}" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="${intensity}" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.3 0" in="noise" result="coloredNoise" />
          <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
          <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
        </filter>
      `;
      break;

    case 'aberration':
      fill = `url(#abGrad-${uid})`;
      filter = `url(#aberration-${uid})`;
      defs += `
        <linearGradient id="abGrad-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0] || '#ffffff'}" />
          <stop offset="100%" stop-color="${colors[1] || '#aaaaaa'}" />
        </linearGradient>
        <filter id="aberration-${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feOffset dx="${intensity * 5}" dy="0" in="SourceGraphic" result="red-shift">
            <animate attributeName="dx" values="${intensity * 5};${intensity * 8};${intensity * 5}" dur="3s" repeatCount="indefinite" />
          </feOffset>
          <feOffset dx="${-intensity * 5}" dy="0" in="SourceGraphic" result="blue-shift">
            <animate attributeName="dx" values="${-intensity * 5};${-intensity * 8};${-intensity * 5}" dur="4s" repeatCount="indefinite" />
          </feOffset>
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" in="red-shift" result="red-only" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" in="blue-shift" result="blue-only" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" in="SourceGraphic" result="green-only" />
          <feBlend mode="screen" in="red-only" in2="blue-only" result="rb" />
          <feBlend mode="screen" in="rb" in2="green-only" result="rgb" />
        </filter>
      `;
      break;

    case 'liquid':
      fill = colors[0] || '#ff00ff';
      filter = `url(#liquid-${uid})`;
      defs += `
        <filter id="liquid-${uid}">
          <feGaussianBlur in="SourceGraphic" stdDeviation="${intensity * 10}" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      `;
      break;

    case 'warp':
      fill = `url(#warpGrad-${uid})`;
      filter = `url(#warp-${uid})`;
      defs += `
        <linearGradient id="warpGrad-${uid}">
          <stop offset="0%" stop-color="${colors[0] || '#ff0080'}" />
          <stop offset="100%" stop-color="${colors[1] || '#00f0ff'}" />
        </linearGradient>
        <filter id="warp-${uid}" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="${intensity * 0.05}" numOctaves="2" result="turbulence">
            <animate attributeName="baseFrequency" values="${intensity * 0.05};${intensity * 0.08};${intensity * 0.05}" dur="5s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="${intensity * 20}" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      `;
      break;

    case 'duotone':
      fill = `url(#duotoneGrad-${uid})`;
      filter = `url(#duotone-${uid})`;
      defs += `
        <linearGradient id="duotoneGrad-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#000000" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
        <filter id="duotone-${uid}">
          <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" result="gray" />
          <feComponentTransfer in="gray">
            <feFuncR type="table" tableValues="${hexToR(colors[0])} ${hexToR(colors[colors.length - 1] || colors[1])}" />
            <feFuncG type="table" tableValues="${hexToG(colors[0])} ${hexToG(colors[colors.length - 1] || colors[1])}" />
            <feFuncB type="table" tableValues="${hexToB(colors[0])} ${hexToB(colors[colors.length - 1] || colors[1])}" />
          </feComponentTransfer>
        </filter>
      `;
      break;

    case 'neon':
      fill = 'transparent';
      stroke = colors[0] || '#00f0ff';
      strokeWidth = `${intensity * 2}`;
      filter = `url(#neon-${uid})`;
      defs += `
        <filter id="neon-${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="${intensity * 2}" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      `;
      break;

    case 'emboss':
      fill = colors[0] || '#888888';
      filter = `url(#emboss-${uid})`;
      defs += `
        <filter id="emboss-${uid}">
          <feGaussianBlur in="SourceAlpha" stdDeviation="${intensity * 2}" result="blur" />
          <feDiffuseLighting in="blur" surfaceScale="${intensity * 5}" diffuseConstant="1" lighting-color="#ffffff" result="light">
            <fePointLight x="-100" y="-100" z="50" />
          </feDiffuseLighting>
          <feComposite in="light" in2="SourceGraphic" operator="in" result="lit" />
          <feBlend mode="multiply" in="lit" in2="SourceGraphic" />
        </filter>
      `;
      break;

    case 'paper':
      fill = colors[0] || '#ffffff';
      filter = `url(#paper-${uid})`;
      defs += `
        <filter id="paper-${uid}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="${intensity * 2}" dy="${intensity * 2}" stdDeviation="${intensity}" flood-color="#000000" flood-opacity="0.3"/>
          <feDropShadow dx="${intensity * 5}" dy="${intensity * 5}" stdDeviation="${intensity * 3}" flood-color="#000000" flood-opacity="0.1"/>
        </filter>
      `;
      break;

    case 'halftone':
      fill = `url(#halftone-${uid})`;
      defs += `
        <pattern id="halftone-${uid}" patternUnits="userSpaceOnUse" width="${intensity * 10}" height="${intensity * 10}">
          <circle cx="${intensity * 5}" cy="${intensity * 5}" r="${intensity * 3}" fill="${colors[0] || '#ffffff'}" />
        </pattern>
      `;
      break;

    case 'sketch':
      fill = 'transparent';
      stroke = colors[0] || '#ffffff';
      strokeWidth = '2';
      filter = `url(#sketch-${uid})`;
      defs += `
        <filter id="sketch-${uid}">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="${intensity * 10}" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      `;
      break;

    case 'oil':
      fill = `url(#oil-${uid})`;
      defs += `
        <linearGradient id="oil-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          ${colors.map((c, i) => `<stop offset="${(i / Math.max(1, colors.length - 1)) * 100}%" stop-color="${c}" />`).join('')}
        </linearGradient>
      `;
      filter = `url(#oilFilter-${uid})`;
      defs += `
        <filter id="oilFilter-${uid}">
          <feTurbulence type="fractalNoise" baseFrequency="${intensity * 0.02}" numOctaves="4" result="noise">
            <animate attributeName="baseFrequency" values="${intensity * 0.02};${intensity * 0.03};${intensity * 0.02}" dur="8s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="${intensity * 30}" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      `;
      break;

    case 'shadow':
      fill = colors[0] || '#ffffff';
      filter = `url(#longshadow-${uid})`;
      defs += `
        <filter id="longshadow-${uid}" x="-20%" y="-20%" width="200%" height="200%">
          <feDropShadow dx="${intensity * 10}" dy="${intensity * 10}" stdDeviation="0" flood-color="${colors[1] || '#ff0080'}" flood-opacity="1"/>
          <feDropShadow dx="${intensity * 20}" dy="${intensity * 20}" stdDeviation="0" flood-color="${colors[2] || '#00f0ff'}" flood-opacity="0.5"/>
        </filter>
      `;
      break;
  }

  return { defs, fill, stroke, filter, strokeWidth };
};

// Generates a complete SVG string, suitable for a Data URL
export const generateStandaloneSVG = (shape: CustomShape): string => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  shape.points.forEach(p => {
    if (p.x === -999999 || p.y === -999999) return;
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });
  
  const width = maxX - minX;
  const height = maxY - minY;
  const maxDim = Math.max(width, height) || 1;
  
  // Massive padding required for some filters like blur, warp, long shadow
  const padding = maxDim * 0.5; 
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  const { defs, fill, stroke, filter, strokeWidth } = getShapeSvgAttributes(shape.effect, shape.id);
  const pathData = generatePathString(shape.points);

  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width + padding * 2}" height="${height + padding * 2}">
      <defs>${defs}</defs>
      <path d="${pathData}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" filter="${filter}" />
    </svg>
  `;
  
  return svgStr.trim();
};

export const createSVGDataUrl = (shape: CustomShape): string => {
  const svgStr = generateStandaloneSVG(shape);
  // btoa requires ascii, encodeURIComponent handles utf8 chars properly
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;
};

// Hex to RGB normalized (0-1) for feComponentTransfer
const hexToR = (h: string) => h ? (parseInt(h.slice(1,3), 16) / 255).toFixed(3) : '0';
const hexToG = (h: string) => h ? (parseInt(h.slice(3,5), 16) / 255).toFixed(3) : '0';
const hexToB = (h: string) => h ? (parseInt(h.slice(5,7), 16) / 255).toFixed(3) : '0';
