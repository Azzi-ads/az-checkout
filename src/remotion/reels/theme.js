import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';

export const inter = loadInter().fontFamily;
export const anton = loadAnton().fontFamily;

export const C = {
  bg: 'rgba(12,12,16,0.72)',
  bgSolid: '#0c0c10',
  glass: 'rgba(18,18,24,0.55)',
  stroke: 'rgba(255,255,255,0.14)',
  white: '#ffffff',
  muted: '#c5c5d0',
  money: '#19e57a',
  moneyDark: '#0c8f4d',
  yellow: '#ffd400',
  purple: '#9b6cff',
  red: '#ff5160',
  shadow: '0 18px 48px rgba(0,0,0,0.45)',
};

export const FPS = 30;

// formata número como moeda BR sem centavos -> "R$ 1.500"
export const brl = (n) =>
  'R$ ' + Math.round(n).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
