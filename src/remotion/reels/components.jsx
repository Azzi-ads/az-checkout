import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { C, inter, anton, brl } from './theme.js';

// ---- helpers de animação ----

// entrada com mola + saída suave. Retorna {opacity, y, scale}
export const useInOut = (enterDur = 12, holdFrames, exitDur = 10) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, mass: 0.7 }, durationInFrames: enterDur });
  const exitStart = holdFrames - exitDur;
  const exit = interpolate(frame, [exitStart, holdFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {
    opacity: Math.min(enter, exit),
    y: interpolate(enter, [0, 1], [40, 0]),
    scale: interpolate(enter, [0, 1], [0.86, 1]) * interpolate(exit, [0, 1], [0.96, 1]),
  };
};

// ---- Pílula / chip ----
export const Pill = ({ children, color = C.white, icon, delay = 0, big }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.6 } });
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: big ? '20px 30px' : '14px 22px',
        borderRadius: 999,
        background: C.bg,
        border: `1.5px solid ${C.stroke}`,
        backdropFilter: 'blur(14px)',
        boxShadow: C.shadow,
        transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) scale(${interpolate(s, [0, 1], [0.8, 1])})`,
        opacity: s,
        fontFamily: inter,
        fontWeight: 800,
        color: C.white,
        fontSize: big ? 46 : 34,
        letterSpacing: -0.5,
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <span style={{ fontSize: big ? 48 : 36 }}>{icon}</span>}
      <span>{children}</span>
      {color !== C.white && (
        <span style={{ width: 12, height: 12, borderRadius: 99, background: color, boxShadow: `0 0 16px ${color}` }} />
      )}
    </div>
  );
};

// ---- Número grande com count-up ----
export const MoneyCounter = ({ to, from = 0, startFrame = 0, dur = 26, suffix, label, color = C.money }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [startFrame, startFrame + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const val = from + (to - from) * p;
  const pop = spring({ frame: frame - startFrame, fps, config: { damping: 12, mass: 0.5 } });
  return (
    <div style={{ textAlign: 'center', fontFamily: anton }}>
      {label && (
        <div style={{ fontFamily: inter, fontWeight: 700, fontSize: 30, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>
          {label}
        </div>
      )}
      <div
        style={{
          fontSize: 150,
          lineHeight: 0.95,
          color,
          textShadow: `0 0 38px ${color}66, 0 10px 30px rgba(0,0,0,0.5)`,
          transform: `scale(${interpolate(pop, [0, 1], [0.7, 1])})`,
          letterSpacing: -2,
        }}
      >
        {brl(val)}
        {suffix && <span style={{ fontSize: 64, color: C.white, marginLeft: 8 }}>{suffix}</span>}
      </div>
    </div>
  );
};

// ---- Cartão de conceito (título + linhas) ----
export const ConceptCard = ({ kicker, title, lines = [], accent = C.yellow, holdFrames = 120 }) => {
  const { opacity, y, scale } = useInOut(14, holdFrames, 12);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        width: 880,
        padding: '40px 44px',
        borderRadius: 34,
        background: C.bg,
        border: `1.5px solid ${C.stroke}`,
        backdropFilter: 'blur(18px)',
        boxShadow: C.shadow,
        fontFamily: inter,
      }}
    >
      {kicker && (
        <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 999, background: accent, color: '#111', fontWeight: 900, fontSize: 26, marginBottom: 18, letterSpacing: 1 }}>
          {kicker}
        </div>
      )}
      <div style={{ fontFamily: anton, fontSize: 78, color: C.white, lineHeight: 1, letterSpacing: -1, marginBottom: lines.length ? 20 : 0 }}>
        {title}
      </div>
      {lines.map((ln, i) => {
        const s = spring({ frame: frame - 8 - i * 6, fps, config: { damping: 16 } });
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 38,
              fontWeight: 700,
              color: C.muted,
              marginTop: 12,
              opacity: s,
              transform: `translateX(${interpolate(s, [0, 1], [-20, 0])}px)`,
            }}
          >
            <span style={{ color: accent, fontSize: 30 }}>▸</span>
            <span>{ln}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---- Legenda de ênfase: tela inteira borrada + frase ----
export const EmphasisCaption = ({ text, holdFrames, accentWords = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, mass: 0.8 }, durationInFrames: 14 });
  const exit = interpolate(frame, [holdFrames - 10, holdFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const blur = interpolate(enter, [0, 1], [0, 22]);
  const dim = interpolate(enter, [0, 1], [0, 0.55]) * exit;
  const words = text.split(' ');
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: exit }}>
      <AbsoluteFill style={{ backdropFilter: `blur(${blur}px)`, background: `rgba(6,6,10,${dim})` }} />
      <div
        style={{
          position: 'relative',
          width: 920,
          textAlign: 'center',
          fontFamily: anton,
          fontSize: 96,
          lineHeight: 1.02,
          color: C.white,
          letterSpacing: -1,
          textShadow: '0 8px 40px rgba(0,0,0,0.6)',
          transform: `scale(${interpolate(enter, [0, 1], [0.82, 1])})`,
          opacity: enter,
        }}
      >
        {words.map((w, i) => {
          const wsp = spring({ frame: frame - 4 - i * 2.2, fps, config: { damping: 20 } });
          const isAccent = accentWords.includes(w.replace(/[.,!?]/g, '').toLowerCase());
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: 18,
                color: isAccent ? C.money : C.white,
                opacity: wsp,
                transform: `translateY(${interpolate(wsp, [0, 1], [22, 0])}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- Comparação Não/Sim ----
export const VersusBlock = ({ holdFrames = 150 }) => {
  const { opacity, y, scale } = useInOut(14, holdFrames, 12);
  const Row = ({ ok, children, delay }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = spring({ frame: frame - delay, fps, config: { damping: 15 } });
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '20px 26px',
          borderRadius: 22,
          background: ok ? 'rgba(25,229,122,0.14)' : 'rgba(255,81,96,0.12)',
          border: `1.5px solid ${ok ? 'rgba(25,229,122,0.5)' : 'rgba(255,81,96,0.45)'}`,
          fontFamily: inter,
          fontWeight: 800,
          fontSize: 40,
          color: C.white,
          opacity: s,
          transform: `translateX(${interpolate(s, [0, 1], [ok ? 30 : -30, 0])}px)`,
          textDecoration: ok ? 'none' : 'line-through',
        }}
      >
        <span style={{ fontSize: 46 }}>{ok ? '✅' : '❌'}</span>
        {children}
      </div>
    );
  };
  return (
    <div style={{ opacity, transform: `translateY(${y}px) scale(${scale})`, display: 'flex', flexDirection: 'column', gap: 18, width: 840 }}>
      <Row ok={false} delay={2}>Apostar e perder dinheiro</Row>
      <Row ok={true} delay={10}>Trazer cadastros novos</Row>
    </div>
  );
};

// ---- Barra de progresso topo ----
export const ProgressBar = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 7, background: 'rgba(255,255,255,0.15)' }}>
      <div style={{ height: '100%', width: `${p * 100}%`, background: C.yellow, boxShadow: `0 0 12px ${C.yellow}` }} />
    </div>
  );
};
