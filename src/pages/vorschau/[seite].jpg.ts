// Vorschaubilder 1200 × 630 (JPG) für /steuerstrategie/ und /vermoegensstrategie/ (Mail-Signatur, WhatsApp, LinkedIn).
// Entstehen beim Veröffentlichen aus Eyebrow, Überschrift und den drei Punkten der jeweiligen Seite.
import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import S from '../../data/steuerstrategie.json';
import V from '../../data/vermoegensstrategie.json';

export function getStaticPaths() {
  return [
    { params: { seite: 'steuerstrategie' }, props: { d: S, marke: 'STEUERSTRATEGIE-GESPRÄCH' } },
    { params: { seite: 'vermoegensstrategie' }, props: { d: V, marke: 'VERMÖGENSSTRATEGIE-GESPRÄCH' } }
  ];
}

const W = 1200, H = 630;
const root = process.cwd();
const schrift = (n: string) => readFileSync(join(root, 'node_modules/@fontsource/source-sans-3/files', n));
const fonts = [
  { name: 'S', data: schrift('source-sans-3-latin-800-normal.woff'), weight: 800 as const, style: 'normal' as const },
  { name: 'S', data: schrift('source-sans-3-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const }
];
const svgData = (pfad: string, farbe?: string) => {
  let s = readFileSync(join(root, 'public', pfad), 'utf8');
  if (farbe) s = s.replace(/fill:\s*#[0-9a-f]{6}/gi, 'fill: ' + farbe);
  return 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64');
};
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}) =>
  ({ type, props: { style, children, ...extra } });

export const GET: APIRoute = async ({ props }) => {
  const { d, marke } = props as { d: any; marke: string };
  const ph = 600;
  const person = await sharp(join(root, 'public/uploads/domenico-freigestellt.webp')).resize({ height: ph }).png().toBuffer();
  const pw = (await sharp(person).metadata()).width || 420;
  const tree = el('div', { width: W, height: H, display: 'flex', position: 'relative', backgroundImage: 'linear-gradient(135deg, #273365, #141d3a)', fontFamily: 'S', color: '#fff' }, [
    el('img', { position: 'absolute', right: -60, top: -40, width: 620, height: 700, opacity: 0.07 }, undefined, { src: svgData('/uploads/logos/schild-mono.svg'), width: 620, height: 700 }),
    el('img', { position: 'absolute', right: 40, bottom: 0, width: pw, height: ph }, undefined, { src: 'data:image/png;base64,' + person.toString('base64'), width: pw, height: ph }),
    el('div', { position: 'absolute', left: 72, top: 60, display: 'flex', backgroundColor: '#998a6d', color: '#fff', borderRadius: 10, padding: '13px 22px', fontSize: 21, fontWeight: 800, letterSpacing: 3 }, marke),
    el('div', { position: 'absolute', left: 72, top: 150, width: 690, display: 'flex', flexDirection: 'column' }, [
      el('div', { fontSize: 62, fontWeight: 800, lineHeight: 1.05, letterSpacing: -0.5 }, d.hero.zeile1),
      el('div', { fontSize: 62, fontWeight: 800, lineHeight: 1.05, letterSpacing: -0.5, color: '#ccc4af' }, d.hero.zeile2),
      el('div', { marginTop: 30, display: 'flex', flexDirection: 'column' },
        (d.hero.punkte as string[]).slice(0, 3).map((p) => el('div', { display: 'flex', alignItems: 'center', fontSize: 25, fontWeight: 400, marginTop: 9, color: 'rgba(255,255,255,0.94)' }, [
          el('div', { width: 10, height: 10, borderRadius: 5, backgroundColor: '#998a6d', marginRight: 14 }), p
        ])))
    ]),
    el('img', { position: 'absolute', left: 72, bottom: 44, width: 230, height: 44 }, undefined, { src: svgData('/uploads/logos/logo-quer-mittig.svg', '#ffffff'), width: 230, height: 44 })
  ]);
  const svg = await satori(tree as any, { width: W, height: H, fonts });
  const jpg = await sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  return new Response(jpg, { headers: { 'Content-Type': 'image/jpeg' } });
};
