// Patch artwork drawn as SVG (ported from the preview build). Used by the 3D patch rail and its fallback.
const SANS = 'font-family="Archivo Variable, Archivo, Arial, sans-serif"';
const SLAB = 'font-family="Graduate, Rockwell, Georgia, serif"';
const CENTER = 'cx="100" cy="100"';

/** Star outline path centred on (cx, cy). */
export function starPath(cx: number, cy: number, r: number, inner = 0.4, points = 5): string {
  let d = "";
  for (let s = 0; s < 2 * points; s++) {
    const ang = -Math.PI / 2 + (s * Math.PI) / points;
    const rad = s % 2 ? r * inner : r;
    d += `${s ? "L" : "M"}${(cx + Math.cos(ang) * rad).toFixed(1)} ${(cy + Math.sin(ang) * rad).toFixed(1)}`;
  }
  return d + "Z";
}

export const SVG_DEFS = `
<pattern id="satin" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><rect width="1.1" height="3" fill="#fff" fill-opacity=".5"/><rect x="1.6" width=".7" height="3" fill="#000" fill-opacity=".35"/></pattern>
<pattern id="twill" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-48)"><rect width="1.6" height="5" fill="#fff" fill-opacity=".45"/><rect x="2.6" width="1" height="5" fill="#000" fill-opacity=".3"/></pattern>
<pattern id="weave" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#fff" fill-opacity=".22"/><rect x="1" y="1" width="1" height="1" fill="#000" fill-opacity=".18"/></pattern>
<filter id="pvc" x="-15%" y="-15%" width="130%" height="135%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b"/>
  <feSpecularLighting in="b" surfaceScale="2.6" specularConstant=".55" specularExponent="16" lighting-color="#ffffff" result="s"><feDistantLight azimuth="235" elevation="50"/></feSpecularLighting>
  <feComposite in="s" in2="SourceAlpha" operator="in" result="sp"/>
  <feComposite in="SourceGraphic" in2="sp" operator="arithmetic" k1="0" k2="1" k3=".55" k4="0" result="lit"/>
  <feDropShadow in="lit" dx="0" dy="1.6" stdDeviation="1.2" flood-color="#000" flood-opacity=".38"/>
</filter>
<filter id="puff" x="-15%" y="-25%" width="130%" height="150%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/>
  <feSpecularLighting in="b" surfaceScale="5" specularConstant=".75" specularExponent="18" lighting-color="#ffffff" result="s"><feDistantLight azimuth="235" elevation="45"/></feSpecularLighting>
  <feComposite in="s" in2="SourceAlpha" operator="in" result="sp"/>
  <feComposite in="SourceGraphic" in2="sp" operator="arithmetic" k1="0" k2="1" k3=".7" k4="0" result="lit"/>
  <feDropShadow in="lit" dx="0" dy="2.4" stdDeviation="1.6" flood-color="#000" flood-opacity=".4"/>
</filter>
<filter id="fuzz" x="-8%" y="-8%" width="116%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation=".35" result="db"/>
  <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b"/>
  <feSpecularLighting in="b" surfaceScale="3" specularConstant=".45" specularExponent="10" lighting-color="#ffffff" result="s"><feDistantLight azimuth="235" elevation="50"/></feSpecularLighting>
  <feComposite in="s" in2="db" operator="in" result="sp"/>
  <feComposite in="db" in2="sp" operator="arithmetic" k1="0" k2="1" k3=".45" k4="0" result="lit"/>
  <feDropShadow in="lit" dx="0" dy="1.6" stdDeviation="1.3" flood-color="#000" flood-opacity=".35"/>
</filter>
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="9" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 .18  0 0 0 0 .1  0 0 0 0 .05  0 0 0 -1.1 .62" result="a"/>
  <feComposite in="a" in2="SourceAlpha" operator="in" result="g"/>
  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge>
</filter>
<filter id="stitch" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="1.2" stdDeviation="1" flood-color="#000" flood-opacity=".35"/></filter>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e3a1"/><stop offset=".4" stop-color="#c3922e"/><stop offset=".6" stop-color="#f3d88a"/><stop offset="1" stop-color="#8f6420"/></linearGradient>
<linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7fa"/><stop offset=".35" stop-color="#9fb1c1"/><stop offset=".55" stop-color="#eef3f7"/><stop offset="1" stop-color="#6b8196"/></linearGradient>
<linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1b5a"/><stop offset=".35" stop-color="#b8326b"/><stop offset=".62" stop-color="#f2793a"/><stop offset=".82" stop-color="#ffc861"/><stop offset="1" stop-color="#ffe9a8"/></linearGradient>
<radialGradient id="seqA" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff6d6"/><stop offset=".45" stop-color="#e9b949"/><stop offset="1" stop-color="#8a5b12"/></radialGradient>
<radialGradient id="seqB" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffe1f1"/><stop offset=".45" stop-color="#e2558f"/><stop offset="1" stop-color="#7a1340"/></radialGradient>
<path id="ring66" d="M100,100 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0"/>
<path id="arcTop" d="M34 104 A66 66 0 0 1 166 104"/>
<path id="arcBot" d="M40 112 A62 62 0 0 0 160 112"/>
<path id="rockerArc" d="M30 124 C56 74 144 74 170 124"/>
<path id="rockerArcHi" d="M30 104 C56 54 144 54 170 104"/>
<clipPath id="c-star"><path d="${starPath(100, 104, 86, 0.46)}"/></clipPath>
<clipPath id="c-round"><circle cx="100" cy="100" r="80"/></clipPath>
<clipPath id="c-rect"><rect x="18" y="44" width="164" height="112" rx="10"/></clipPath>
<mask id="m-moon"><rect width="200" height="200" fill="#000"/><circle cx="92" cy="94" r="40" fill="#fff"/><circle cx="112" cy="80" r="35" fill="#000"/></mask>
`;
const SHIELD = "M100 16 L174 38 C174 98 162 150 100 186 C38 150 26 98 26 38 Z";
const BIKER = "M12 108C40 30 160 30 188 108L160 128C140 76 60 76 40 128Z";
const ROCKER = "M12 128C40 50 160 50 188 128L160 148C140 96 60 96 40 148Z";

/** A solid border plus a dashed "stitch" line on top. */
const stitchBorder = (e: string, t: string, l: string, i: string, r: number) =>
          `<${e} ${t} fill="none" stroke="${l}" stroke-width="${r}"/><${e} ${t} fill="none" stroke="${i}" stroke-width="${r}" stroke-dasharray="1.1 1.9"/>`;
const sparkle = (e: number, t: number, l: number) =>
          `M${e} ${t - l}L${e + 0.28 * l} ${t - 0.28 * l}L${e + l} ${t}L${e + 0.28 * l} ${t + 0.28 * l}L${e} ${t + l}L${e - 0.28 * l} ${t + 0.28 * l}L${e - l} ${t}L${e - 0.28 * l} ${t - 0.28 * l}Z`;
/** Saguaro cactus silhouette. */
const cactus = (e: number, t: number, l: number, i: string) => {
          let r = 0.16 * l,
            a = l / 100;
          return `<g fill="${i}">
    <rect x="${e - r / 2}" y="${t - l}" width="${r}" height="${l}" rx="${r / 2}"/>
    <path d="M${e - r / 2} ${t - 46 * a}h${-12 * a}a${7 * a} ${7 * a} 0 0 1 ${-7 * a} ${-7 * a}v${-18 * a}a${5 * a} ${5 * a} 0 0 1 ${10 * a} 0v${12 * a}h${9 * a}z"/>
    <path d="M${e + r / 2} ${t - 58 * a}h${12 * a}a${7 * a} ${7 * a} 0 0 0 ${7 * a} ${-7 * a}v${-14 * a}a${5 * a} ${5 * a} 0 0 0 ${-10 * a} 0v${8 * a}h${-9 * a}z"/>
  </g>`;
};
export const ART: Record<string, string> = {
          embroidered: `<g filter="url(#stitch)">
    <circle ${CENTER} r="86" fill="#1c2f5e"/>
    <g clip-path="url(#c-round)">
      <rect x="0" y="0" width="200" height="104" fill="#b8282e"/>
      ${Array.from({ length: 13 }, (e, t) => {
        let l = Math.PI + (t * Math.PI) / 13,
          i = Math.PI + ((t + 1) * Math.PI) / 13;
        return t % 2
          ? ""
          : `<path d="M100 104L${100 + 120 * Math.cos(l)} ${104 + 120 * Math.sin(l)}L${100 + 120 * Math.cos(i)} ${104 + 120 * Math.sin(i)}Z" fill="#f2c230"/>`;
      }).join("")}
      <rect x="0" y="104" width="200" height="96" fill="#1c2f5e"/>
      <path d="${starPath(100, 104, 30, 0.42)}" fill="#c4692c"/>
    </g>
    <circle ${CENTER} r="86" fill="url(#satin)" opacity=".35"/>
    <text ${SANS} font-weight="800" font-size="9" letter-spacing="1.4" fill="#f4ecd8" text-anchor="middle"><textPath href="#arcBot" startOffset="50%">ARIZONA \xb7 EMBROIDERED</textPath></text>
    ${stitchBorder("circle", `${CENTER} r="86"`, "#f0e6cc", "#bba67a", 9)}
  </g>`,
          pvc: `<path d="${SHIELD}" fill="#c4692c" filter="url(#pvc)"/>
    <path d="${SHIELD}" fill="#26323a" transform="translate(100 101) scale(.88) translate(-100 -101)" filter="url(#pvc)"/>
    <circle cx="100" cy="86" r="34" fill="#f2a43a" filter="url(#pvc)"/>
    <polygon points="44,132 78,92 96,112 116,88 156,132" fill="#7d5a44" filter="url(#pvc)"/>
    <g filter="url(#pvc)">${cactus(100, 134, 70, "#4f8a5b")}</g>
    <text x="100" y="153" text-anchor="middle" ${SANS} font-weight="850" font-size="11.5" letter-spacing="1.2" textLength="86" lengthAdjust="spacingAndGlyphs" fill="#f3ead8" filter="url(#pvc)">DESERT RUNNER</text>`,
          chenille: `<g ${SLAB} text-anchor="middle" font-size="176" stroke-linejoin="round">
    <text x="100" y="168" fill="#2f2a26" stroke="#2f2a26" stroke-width="26" filter="url(#stitch)">A</text>
    <text x="100" y="168" fill="#f3ead6" stroke="#f3ead6" stroke-width="16">A</text>
    <g filter="url(#fuzz)"><text x="100" y="168" fill="#8d1d2c">A</text></g>
  </g>`,
          woven: `<g filter="url(#stitch)">
    <rect x="14" y="56" width="172" height="88" rx="4" fill="#efe6d2"/>
    <rect x="14" y="56" width="172" height="88" rx="4" fill="url(#weave)"/>
    <rect x="21" y="63" width="158" height="74" rx="2" fill="none" stroke="#2b3a2f" stroke-width="1.2"/>
    ${cactus(44, 128, 52, "#2b3a2f")}
    <text x="112" y="94" text-anchor="middle" ${SANS} font-weight="800" font-size="15" letter-spacing="1.4" fill="#2b3a2f" style="font-stretch:88%">SONORAN</text>
    <text x="112" y="110" text-anchor="middle" ${SANS} font-weight="600" font-size="8.5" letter-spacing="3.2" fill="#2b3a2f">SUPPLY CO.</text>
    <line x1="74" y1="117" x2="150" y2="117" stroke="#b5562c" stroke-width="1"/>
    <text x="112" y="129" text-anchor="middle" ${SANS} font-weight="500" font-size="6.5" letter-spacing="2.4" fill="#b5562c">WOVEN \xb7 FINE DETAIL</text>
  </g>`,
          printed: `<g filter="url(#stitch)">
    <rect x="18" y="44" width="164" height="112" rx="10" fill="url(#sunset)"/>
    <g clip-path="url(#c-rect)">
      <circle cx="122" cy="118" r="26" fill="#ffe08a" opacity=".95"/>
      <path d="M18 132 C50 114 74 120 96 128 S150 112 182 124 V156 H18Z" fill="#5a2a4a"/>
      <path d="M18 142 C60 132 110 146 182 136 V156 H18Z" fill="#2c1530"/>
      ${cactus(52, 150, 64, "#1b0f1f")}${cactus(152, 152, 44, "#1b0f1f")}
    </g>
    ${stitchBorder("rect", 'x="18" y="44" width="164" height="112" rx="10"', "#2c1530", "#5b3a5c", 6)}
    <text x="100" y="70" text-anchor="middle" ${SANS} font-weight="800" font-size="11" letter-spacing="3" fill="#fff3dc">FULL-COLOR PRINT</text>
  </g>`,
          leather: `<g filter="url(#stitch)">
    <path d="M30 52 H170 L182 100 L170 148 H30 L18 100 Z" fill="#a8683a" filter="url(#grain)"/>
    <path d="M36 60 H164 L174 100 L164 140 H36 L26 100 Z" fill="none" stroke="#6e3f1f" stroke-width="1.4" stroke-dasharray="3 2.4"/>
    <g ${SANS} text-anchor="middle" font-weight="800" letter-spacing="2.4">
      <text x="100" y="99.8" font-size="20" fill="#c99168" style="font-stretch:110%">CANYON</text>
      <text x="100" y="99" font-size="20" fill="#5e3216" style="font-stretch:110%">CANYON</text>
      <text x="100" y="120.8" font-size="9" letter-spacing="4" fill="#c99168">GOODS \xb7 AZ</text>
      <text x="100" y="120" font-size="9" letter-spacing="4" fill="#5e3216">GOODS \xb7 AZ</text>
    </g>
    <path d="M70 76 L84 66 L92 72 L104 62 L130 76" fill="none" stroke="#5e3216" stroke-width="2" stroke-linejoin="round"/>
  </g>`,
          silicone: `<rect x="22" y="58" width="156" height="84" rx="22" fill="#2a2d31" filter="url(#puff)"/>
    <g filter="url(#puff)" ${SANS} text-anchor="middle" font-weight="900">
      <text x="100" y="104" font-size="30" fill="#ff7a3d" letter-spacing="1" style="font-stretch:80%">DRY HEAT</text>
    </g>
    <text x="100" y="124" text-anchor="middle" ${SANS} font-weight="600" font-size="8" letter-spacing="3" fill="#9aa1a8">SILICONE \xb7 RAISED 3D</text>`,
          sequin: (() => {
            let e = "";
            for (let t = 24; t <= 178; t += 9)
              for (let l = 24 + ((t / 9) % 2) * 4.5; l <= 178; l += 9)
                e += `<circle cx="${l}" cy="${t}" r="4.6" fill="url(#${(l + t) % 27 < 13 ? "seqA" : "seqB"})"/>`;
            return `<path d="${starPath(100, 104, 86, 0.46)}" fill="#3a0f24" filter="url(#stitch)"/>
      <g clip-path="url(#c-star)">${e}</g>
      <path d="${starPath(100, 104, 86, 0.46)}" fill="none" stroke="#f7e0a3" stroke-width="3"/>
      <path d="${sparkle(150, 40, 9)}" fill="#fff"/><path d="${sparkle(46, 150, 6)}" fill="#fff"/>`;
          })(),
          velcro: `<rect x="14" y="42" width="172" height="116" rx="12" fill="#3f4130" filter="url(#pvc)"/>
    <rect x="22" y="50" width="156" height="100" rx="7" fill="#6e6c48" filter="url(#pvc)"/>
    <g filter="url(#pvc)" fill="#e0d6b8">
      <rect x="42" y="66" width="14" height="58" rx="7"/><circle cx="49" cy="128" r="13"/>
    </g>
    <rect x="46" y="76" width="6" height="50" rx="3" fill="#c84b2a"/><circle cx="49" cy="128" r="9" fill="#c84b2a"/>
    <g filter="url(#pvc)" fill="#e0d6b8" ${SANS} font-weight="900" text-anchor="middle">
      <text x="120" y="92" font-size="17" style="font-stretch:78%" letter-spacing="1">IT'S A</text>
      <text x="120" y="120" font-size="27" style="font-stretch:78%" letter-spacing="1">DRY HEAT</text>
    </g>
    <text x="120" y="138" text-anchor="middle" ${SANS} font-weight="700" font-size="6.5" letter-spacing="1.4" fill="#c4bb98">HOOK &amp; LOOP BACKING</text>`,
          keychain: `<circle cx="100" cy="30" r="15" fill="none" stroke="url(#chrome)" stroke-width="5"/>
    <rect x="96" y="42" width="8" height="16" rx="3" fill="url(#chrome)"/>
    <circle cx="100" cy="116" r="62" fill="#f2a43a" filter="url(#pvc)"/>
    <circle cx="100" cy="116" r="52" fill="#1d6f6a" filter="url(#pvc)"/>
    <circle cx="100" cy="64" r="6" fill="#efe9dd" stroke="#c98a2b" stroke-width="2"/>
    <g filter="url(#pvc)">${cactus(100, 146, 58, "#f3ead8")}</g>
    <text x="100" y="164" text-anchor="middle" ${SANS} font-weight="900" font-size="11" letter-spacing="2" fill="#f2a43a">AZ</text>`,
          pin: `<g filter="url(#stitch)">
    <path d="M100 20 C140 20 166 50 166 94 C166 140 132 176 100 182 C68 176 34 140 34 94 C34 50 60 20 100 20Z" fill="url(#metal)"/>
    <path d="M100 30 C134 30 156 56 156 94 C156 134 128 166 100 172 C72 166 44 134 44 94 C44 56 66 30 100 30Z" fill="#0f4c5c"/>
    <path d="M44 120 C70 104 90 116 100 122 C114 112 134 104 156 118 V140 C140 156 120 168 100 172 C80 168 58 156 44 140Z" fill="#e0773a"/>
    <circle cx="128" cy="70" r="16" fill="#f2c94c" stroke="url(#metal)" stroke-width="3"/>
    ${cactus(84, 128, 74, "#3f8f5c")}
    <path d="M100 30 C134 30 156 56 156 94 C156 134 128 166 100 172 C72 166 44 134 44 94 C44 56 66 30 100 30Z" fill="none" stroke="url(#metal)" stroke-width="3"/>
    <ellipse cx="78" cy="52" rx="30" ry="10" fill="#fff" opacity=".22" transform="rotate(-24 78 52)"/>
  </g>`,
          charm: `<circle cx="100" cy="100" r="74" fill="#f6b4c8" filter="url(#pvc)"/>
    <g filter="url(#pvc)">
      <rect x="80" y="44" width="40" height="104" rx="20" fill="#58a46b"/>
      <path d="M80 98h-16a10 10 0 0 1-10-10v-18a8 8 0 0 1 16 0v14h10z" fill="#58a46b"/>
      <path d="M120 84h16a10 10 0 0 0 10-10v-14a8 8 0 0 0-16 0v10h-10z" fill="#58a46b"/>
    </g>
    <circle cx="92" cy="86" r="5" fill="#1d1d1d"/><circle cx="110" cy="86" r="5" fill="#1d1d1d"/>
    <circle cx="93.5" cy="84.5" r="1.6" fill="#fff"/><circle cx="111.5" cy="84.5" r="1.6" fill="#fff"/>
    <path d="M94 100 q7 7 14 0" fill="none" stroke="#1d1d1d" stroke-width="3" stroke-linecap="round"/>
    <circle cx="84" cy="98" r="4" fill="#f58aa8" opacity=".8"/><circle cx="118" cy="98" r="4" fill="#f58aa8" opacity=".8"/>
    <path d="M100 44 l-6 -10 l12 0z" fill="#ff5a7a"/>`,
          coin: `<circle ${CENTER} r="88" fill="url(#metal)" filter="url(#stitch)"/>
    <circle ${CENTER} r="88" fill="none" stroke="#7a5418" stroke-width="5" stroke-dasharray="2 2.2"/>
    <circle ${CENTER} r="74" fill="#13324d"/>
    <circle ${CENTER} r="74" fill="none" stroke="url(#metal)" stroke-width="3"/>
    <circle ${CENTER} r="56" fill="none" stroke="url(#metal)" stroke-width="1.5"/>
    <text ${SANS} font-weight="800" font-size="10.5" letter-spacing="2.6" fill="url(#metal)" text-anchor="middle"><textPath href="#arcTop" startOffset="50%">HONOR \xb7 CREW \xb7 SERVICE</textPath></text>
    <path d="${starPath(100, 98, 34, 0.42)}" fill="url(#metal)"/>
    <text x="100" y="140" text-anchor="middle" ${SANS} font-weight="900" font-size="12" letter-spacing="2" fill="url(#metal)">2026</text>`,
          morale: `<circle ${CENTER} r="86" fill="#3b4675" filter="url(#pvc)"/>
    <circle ${CENTER} r="77" fill="#18203d" filter="url(#pvc)"/>
    <g filter="url(#glow)" fill="#d8f59a">
      <circle cx="92" cy="94" r="40" mask="url(#m-moon)"/>
      <path d="${sparkle(142, 62, 7)}"/><path d="${sparkle(150, 106, 5)}"/><path d="${sparkle(130, 132, 4)}"/><path d="${sparkle(58, 60, 4)}"/>
      <text x="100" y="158" text-anchor="middle" ${SANS} font-weight="800" font-size="12.5" letter-spacing="3">NIGHT SHIFT</text>
    </g>`,
          fire: `<g filter="url(#stitch)">
    <path d="M100 18 L124 60 L172 52 L150 100 L172 148 L124 140 L100 182 L76 140 L28 148 L50 100 L28 52 L76 60 Z" fill="#a31d22"/>
    <path d="M100 18 L124 60 L172 52 L150 100 L172 148 L124 140 L100 182 L76 140 L28 148 L50 100 L28 52 L76 60 Z" fill="url(#satin)" opacity=".3"/>
    ${stitchBorder("path", 'd="M100 18 L124 60 L172 52 L150 100 L172 148 L124 140 L100 182 L76 140 L28 148 L50 100 L28 52 L76 60 Z"', "#f2d27a", "#b99a45", 5)}
    <circle ${CENTER} r="34" fill="#f2d27a"/>
    <text x="100" y="96" text-anchor="middle" ${SANS} font-weight="900" font-size="9" letter-spacing="1.6" fill="#7a1418">STATION</text>
    <text x="100" y="120" text-anchor="middle" ${SANS} font-weight="900" font-size="24" fill="#7a1418">27</text>
  </g>`,
          hockey: `<g filter="url(#stitch)">
    <path d="M100 18 L170 40 L164 120 C156 156 128 174 100 184 C72 174 44 156 36 120 L30 40 Z" fill="#0f2f4f"/>
    <path d="M100 18 L170 40 L164 120 C156 156 128 174 100 184 C72 174 44 156 36 120 L30 40 Z" fill="url(#satin)" opacity=".3"/>
    ${stitchBorder("path", 'd="M100 18 L170 40 L164 120 C156 156 128 174 100 184 C72 174 44 156 36 120 L30 40 Z"', "#e9eef3", "#a9b6c2", 7)}
    <g stroke="#e9eef3" stroke-width="7" stroke-linecap="round"><path d="M66 78 L122 142"/><path d="M134 78 L78 142"/><path d="M122 142 h14"/><path d="M78 142 h-14"/></g>
    <ellipse cx="100" cy="160" rx="14" ry="5" fill="#111"/>
    <text x="100" y="64" text-anchor="middle" ${SANS} font-weight="900" font-size="14" letter-spacing="2" fill="#7fd3ff" style="font-stretch:85%">DESERT ICE</text>
  </g>`,
          soccer: `<g filter="url(#stitch)">
    <circle ${CENTER} r="86" fill="#14532d"/><circle ${CENTER} r="86" fill="url(#satin)" opacity=".3"/>
    <circle cx="100" cy="92" r="40" fill="#f6f4ef"/>
    <path d="M100 74 l16 12 -6 19 h-20 l-6 -19 z" fill="#1d1d1d"/>
    <g stroke="#1d1d1d" stroke-width="2.4" fill="none"><path d="M100 74 V54"/><path d="M116 86 L136 80"/><path d="M110 105 L122 124"/><path d="M90 105 L78 124"/><path d="M84 86 L64 80"/></g>
    <text x="100" y="156" text-anchor="middle" ${SANS} font-weight="900" font-size="17" letter-spacing="3" fill="#f2c230">DESERT FC</text>
    ${stitchBorder("circle", `${CENTER} r="86"`, "#f2c230", "#b89120", 8)}
  </g>`,
          baseball: `<g filter="url(#stitch)">
    <circle ${CENTER} r="86" fill="#f4efe3"/>
    <g fill="none" stroke="#c0262d" stroke-width="2.6" stroke-dasharray="5 4"><path d="M34 48 C54 76 54 124 34 152"/><path d="M166 48 C146 76 146 124 166 152"/></g>
    <text x="100" y="92" text-anchor="middle" ${SLAB} font-size="26" fill="#1c2f5e">CACTUS</text>
    <text x="100" y="124" text-anchor="middle" ${SLAB} font-size="30" fill="#c0262d">NINE</text>
    ${stitchBorder("circle", `${CENTER} r="86"`, "#1c2f5e", "#3c5590", 8)}
  </g>`,
          hat: `<g filter="url(#stitch)">
    <polygon points="100,34 166,64 166,136 100,166 34,136 34,64" fill="#3c2a1f"/>
    <polygon points="100,34 166,64 166,136 100,166 34,136 34,64" fill="url(#satin)" opacity=".25"/>
    ${stitchBorder("polygon", 'points="100,34 166,64 166,136 100,166 34,136 34,64"', "#e7c27a", "#a8853f", 6)}
    <circle cx="100" cy="88" r="20" fill="#e98a3a"/>
    <path d="M52 118 L80 92 L96 106 L114 86 L148 118 Z" fill="#e7c27a"/>
    <text x="100" y="140" text-anchor="middle" ${SANS} font-weight="900" font-size="13" letter-spacing="2.5" fill="#e7c27a">SUN VALLEY</text>
  </g>`,
          badge: `<path d="${starPath(100, 102, 84, 0.62, 7)}" fill="url(#metal)" filter="url(#stitch)"/>
    ${Array.from({ length: 7 }, (e, t) => {
      let l = -Math.PI / 2 + (2 * t * Math.PI) / 7;
      return `<circle cx="${(100 + 84 * Math.cos(l)).toFixed(1)}" cy="${(102 + 84 * Math.sin(l)).toFixed(1)}" r="7" fill="url(#metal)"/>`;
    }).join("")}
    <circle cx="100" cy="102" r="40" fill="#1e2c45"/>
    <circle cx="100" cy="102" r="40" fill="none" stroke="#f3e2a6" stroke-width="2"/>
    <text x="100" y="98" text-anchor="middle" ${SANS} font-weight="900" font-size="12" letter-spacing="2" fill="#f3e2a6">PATROL</text>
    <text x="100" y="116" text-anchor="middle" ${SANS} font-weight="700" font-size="8" letter-spacing="2.4" fill="#f3e2a6">UNIT 12</text>`,
          name: `<g filter="url(#stitch)">
    <rect x="16" y="68" width="168" height="64" rx="10" fill="#1f3b5a"/>
    <rect x="16" y="68" width="168" height="64" rx="10" fill="url(#twill)" opacity=".25"/>
    ${stitchBorder("rect", 'x="16" y="68" width="168" height="64" rx="10"', "#f2efe6", "#b9b4a5", 6)}
    <text x="100" y="112" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="34" fill="#f2efe6">Marco</text>
  </g>`,
          tactical: `<rect x="26" y="40" width="148" height="120" rx="10" fill="#3d4636" filter="url(#pvc)"/>
    <rect x="34" y="48" width="132" height="104" rx="6" fill="#59654d" filter="url(#pvc)"/>
    <g fill="none" stroke="#c9c3a3" stroke-width="3" filter="url(#pvc)"><circle cx="100" cy="92" r="26"/><path d="M100 56 V128 M64 92 H136"/></g>
    <text x="100" y="144" text-anchor="middle" ${SANS} font-weight="900" font-size="13" letter-spacing="3" fill="#c9c3a3">GRID 6</text>`,
          jacket: `<g filter="url(#stitch)">
    <circle ${CENTER} r="88" fill="#1b1b1b"/>
    <circle cx="100" cy="92" r="44" fill="#d9542b"/>
    <g fill="#1b1b1b"><rect x="40" y="96" width="120" height="5"/><rect x="44" y="108" width="112" height="5"/><rect x="50" y="120" width="100" height="5"/></g>
    <path d="M24 136 L64 98 L90 120 L116 92 L176 136 Z" fill="#2d2a27"/>
    <text ${SANS} font-weight="900" font-size="15" letter-spacing="3" fill="#f2e3c6" text-anchor="middle"><textPath href="#arcTop" startOffset="50%">HIGH DESERT</textPath></text>
    <text x="100" y="164" text-anchor="middle" ${SANS} font-weight="800" font-size="10" letter-spacing="4" fill="#f2e3c6">BACK PATCH</text>
    ${stitchBorder("circle", `${CENTER} r="88"`, "#f2e3c6", "#b8a98a", 6)}
  </g>`,
          biker: `<g filter="url(#stitch)">
      <path d="${BIKER}" fill="#141414"/><path d="${BIKER}" fill="url(#satin)" opacity=".3"/>
      <text ${SANS} font-weight="900" font-size="19" letter-spacing="2.5" fill="#e9b949" text-anchor="middle" style="font-stretch:112%"><textPath href="#rockerArcHi" startOffset="50%">IRON SUN</textPath></text>
      ${stitchBorder("path", `d="${BIKER}"`, "#e9b949", "#b0882e", 6)}
      <circle cx="100" cy="140" r="26" fill="#141414"/>
      <circle cx="100" cy="140" r="15" fill="#e9b949"/>
      ${Array.from({ length: 12 }, (e, t) => {
        let l = (t * Math.PI) / 6;
        return `<path d="M${100 + 17 * Math.cos(l)} ${140 + 17 * Math.sin(l)}L${100 + 24 * Math.cos(l)} ${140 + 24 * Math.sin(l)}" stroke="#e9b949" stroke-width="3"/>`;
      }).join("")}
      <rect x="146" y="152" width="34" height="22" rx="3" fill="#141414"/>
      <text x="163" y="167.5" text-anchor="middle" ${SANS} font-weight="900" font-size="11" fill="#e9b949">MC</text>
      ${stitchBorder("rect", 'x="146" y="152" width="34" height="22" rx="3"', "#e9b949", "#b0882e", 3)}
    </g>`,
          rocker: `<g filter="url(#stitch)">
      <path d="${ROCKER}" fill="#f1ece0"/>
      <text ${SANS} font-weight="900" font-size="16" letter-spacing="2" fill="#141414" text-anchor="middle"><textPath href="#rockerArc" startOffset="50%">RIDE FREE</textPath></text>
      ${stitchBorder("path", `d="${ROCKER}"`, "#141414", "#3d3d3d", 6)}
    </g>`,
          basketball: `<g filter="url(#stitch)">
    <circle ${CENTER} r="84" fill="#e46a25"/><circle ${CENTER} r="84" fill="url(#twill)" opacity=".2"/>
    <g fill="none" stroke="#2a160b" stroke-width="4"><path d="M100 16 V184"/><path d="M16 100 H184"/><path d="M40 40 C70 70 70 130 40 160"/><path d="M160 40 C130 70 130 130 160 160"/></g>
    <rect x="34" y="84" width="132" height="32" rx="6" fill="#1b1b1b"/>
    <text x="100" y="107" text-anchor="middle" ${SANS} font-weight="900" font-size="18" letter-spacing="3" fill="#ffd166">HOOPS</text>
    ${stitchBorder("circle", `${CENTER} r="84"`, "#2a160b", "#4a2a17", 5)}
  </g>`,
          football: `<g filter="url(#stitch)">
    <path d="M100 18 L170 40 L164 120 C156 156 128 174 100 184 C72 174 44 156 36 120 L30 40 Z" fill="#5a1e24"/>
    ${stitchBorder("path", 'd="M100 18 L170 40 L164 120 C156 156 128 174 100 184 C72 174 44 156 36 120 L30 40 Z"', "#e9b949", "#b0882e", 7)}
    <ellipse cx="100" cy="88" rx="44" ry="26" fill="#7a4a24" transform="rotate(-20 100 88)"/>
    <path d="M78 96 L122 80" stroke="#f4efe3" stroke-width="3"/>
    ${[0, 1, 2, 3, 4].map((e) => `<path d="M${86 + 7 * e} ${88 - 2.4 * e} l3 7" stroke="#f4efe3" stroke-width="2.4"/>`).join("")}
    <text x="100" y="140" text-anchor="middle" ${SANS} font-weight="900" font-size="12" letter-spacing="2" fill="#e9b949">FRIDAY</text>
    <text x="100" y="156" text-anchor="middle" ${SANS} font-weight="900" font-size="12" letter-spacing="2" fill="#e9b949">NIGHTS</text>
  </g>`,
          cowboy: `<g filter="url(#stitch)">
    <circle ${CENTER} r="86" fill="#5b3a22"/><circle ${CENTER} r="86" fill="url(#satin)" opacity=".28"/>
    <path d="M58 70 C60 52 76 50 84 62 C90 54 110 54 116 62 C124 50 140 52 142 70 C150 62 168 62 172 54 C170 74 150 84 136 82 L130 112 C126 128 112 140 100 140 C88 140 74 128 70 112 L64 82 C50 84 30 74 28 54 C32 62 50 62 58 70Z" fill="#f2e6cf"/>
    <circle cx="86" cy="98" r="7" fill="#5b3a22"/><circle cx="114" cy="98" r="7" fill="#5b3a22"/>
    <path d="M94 124 h4 M102 124 h4" stroke="#5b3a22" stroke-width="3" stroke-linecap="round"/>
    <path d="${starPath(100, 160, 10)}" fill="#e9b949"/>
    ${stitchBorder("circle", `${CENTER} r="86"`, "#e9b949", "#a98330", 7)}
  </g>`,
          anime: `<g filter="url(#stitch)">
    <rect x="22" y="22" width="156" height="156" rx="40" fill="#ffd1e3"/>
    <rect x="22" y="22" width="156" height="156" rx="40" fill="url(#satin)" opacity=".25"/>
    ${stitchBorder("rect", 'x="22" y="22" width="156" height="156" rx="40"', "#7a3cff", "#5a22c8", 6)}
    <rect x="70" y="48" width="60" height="116" rx="30" fill="#4bb46e"/>
    <path d="M70 110 h-14 a10 10 0 0 1 -10 -10 v-16 a7 7 0 0 1 14 0 v12 h10z" fill="#4bb46e"/>
    <path d="M130 96 h14 a10 10 0 0 0 10 -10 v-12 a7 7 0 0 0 -14 0 v8 h-10z" fill="#4bb46e"/>
    <ellipse cx="88" cy="96" rx="9" ry="12" fill="#1d1d1d"/><ellipse cx="112" cy="96" rx="9" ry="12" fill="#1d1d1d"/>
    <path d="${sparkle(91, 91, 4)}" fill="#fff"/><path d="${sparkle(115, 91, 4)}" fill="#fff"/>
    <path d="M94 116 q6 6 12 0" fill="none" stroke="#1d1d1d" stroke-width="3" stroke-linecap="round"/>
    <circle cx="80" cy="114" r="5" fill="#ff7aa8" opacity=".85"/><circle cx="120" cy="114" r="5" fill="#ff7aa8" opacity=".85"/>
    <path d="${sparkle(150, 52, 8)}" fill="#7a3cff"/><path d="${sparkle(48, 150, 6)}" fill="#7a3cff"/>
  </g>`,
          holiday: `<g filter="url(#stitch)">
    <circle ${CENTER} r="86" fill="#173f2b"/><circle ${CENTER} r="86" fill="url(#satin)" opacity=".28"/>
    ${cactus(100, 160, 100, "#5bb36f")}
    <path d="M86 62 C88 40 112 36 122 48 L114 60 Z" fill="#d7262e"/>
    <rect x="82" y="58" width="36" height="9" rx="4" fill="#f6f4ef"/>
    <circle cx="124" cy="46" r="6" fill="#f6f4ef"/>
    <g fill="#f6f4ef"><path d="${sparkle(48, 70, 6)}"/><path d="${sparkle(152, 78, 5)}"/><path d="${sparkle(58, 128, 4)}"/><path d="${sparkle(146, 132, 5)}"/></g>
    ${stitchBorder("circle", `${CENTER} r="86"`, "#d7262e", "#9e1a20", 8)}
  </g>`,
          bingo: `<circle ${CENTER} r="84" fill="#f4efe3" filter="url(#pvc)"/>
    <circle ${CENTER} r="84" fill="none" stroke="#2a6fdb" stroke-width="18"/>
    <circle ${CENTER} r="50" fill="#fff" stroke="#2a6fdb" stroke-width="3"/>
    <text x="100" y="94" text-anchor="middle" ${SANS} font-weight="900" font-size="24" fill="#2a6fdb">B</text>
    <text x="100" y="126" text-anchor="middle" ${SANS} font-weight="900" font-size="32" fill="#1b1b1b">12</text>
    <ellipse cx="70" cy="52" rx="28" ry="10" fill="#fff" opacity=".35" transform="rotate(-30 70 52)"/>`,
          wholesale: `<g filter="url(#stitch)">
    <rect x="38" y="46" width="124" height="82" rx="8" fill="#26323a" transform="rotate(-8 100 87)"/>
    <rect x="38" y="62" width="124" height="82" rx="8" fill="#c4692c" transform="rotate(4 100 103)"/>
    <rect x="38" y="78" width="124" height="82" rx="8" fill="#f3ead8"/>
    ${stitchBorder("rect", 'x="38" y="78" width="124" height="82" rx="8"', "#26323a", "#4a5a64", 5)}
    <text x="100" y="116" text-anchor="middle" ${SANS} font-weight="900" font-size="13" letter-spacing="1.5" fill="#26323a">YOUR LOGO</text>
    <text x="100" y="136" text-anchor="middle" ${SANS} font-weight="700" font-size="8.5" letter-spacing="3" fill="#c4692c">\xd7 5,000 PCS</text>
  </g>`,
        };

/** Artwork for a patch key as a standalone <svg> (falls back to embroidered). */
export function artSvg(art: string, label?: string): string {
  const a11y = label ? `role="img" aria-label="${label.replace(/"/g, "")}"` : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" ${a11y}>${ART[art] ?? ART.embroidered}</svg>`;
}

/** Self-contained 512px SVG (defs and fonts inlined) for drawing onto a canvas. */
export function artSvgForCanvas(art: string, fontCss = ""): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="512" height="512"><defs>${fontCss ? `<style>${fontCss}</style>` : ""}${SVG_DEFS}</defs>${ART[art] ?? ART.embroidered}</svg>`;
}

const HOOK = '<svg class="hook" viewBox="0 0 30 64" aria-hidden="true" focusable="false"><path class="hk" d="M6 22C6 11 24 11 24 18C24 23 15 23 15 28V52C15 60 6 60 6 53" fill="none" stroke-width="2.6" stroke-linecap="round"/><path class="hk2" d="M7.4 20C8.3 14 21.4 13.5 22.6 17.4" fill="none" stroke-width="1" stroke-linecap="round" opacity=".8"/></svg>';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** A patch hanging on its card, as HTML (used by the no-WebGL fallback and the detail view). */
export function hangCard(o: { art: string; label?: string; print: string; tag?: string; swing?: boolean }): string {
  return `<span class="hang${o.swing ? " swing" : ""}"><span>${HOOK}</span>${o.tag ? `<span class="tag">${esc(o.tag)}</span>` : ""}<span class="card"><span class="hole"></span><span class="art">${artSvg(o.art, o.label)}</span><span class="print">Custom Patches Arizona · ${esc(o.print)}</span></span></span>`;
}

