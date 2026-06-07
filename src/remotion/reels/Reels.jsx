import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { C, inter, anton, FPS } from './theme.js';
import {
  Pill,
  MoneyCounter,
  ConceptCard,
  EmphasisCaption,
  VersusBlock,
  ProgressBar,
  useInOut,
} from './components.jsx';

const f = (s) => Math.round(s * FPS);

// ---------- camada de vídeo: reenquadre 9:16 + zoom dinâmico ----------
const VideoLayer = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const baseZoom = interpolate(frame, [0, durationInFrames], [1.07, 1.16]);
  const beats = [1.6, 9.6, 20.4, 29.4, 37.6, 56.2, 60.5, 73.8, 82.8, 99].map((s) => s * FPS);
  let bump = 0;
  for (const b of beats) {
    bump += interpolate(frame, [b - 3, b + 5, b + 22], [0, 0.045, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  const zoom = baseZoom + bump;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
      <OffthreadVideo
        src={staticFile('source.mp4')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '59% 28%',
          transform: `scale(${zoom})`,
        }}
      />
      {/* grade cinematográfica + vinheta */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 80% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.45) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const Slot = ({ pos = 'center', children }) => (
  <AbsoluteFill
    style={{
      alignItems: 'center',
      justifyContent: pos === 'top' ? 'flex-start' : pos === 'bottom' ? 'flex-end' : 'center',
      paddingTop: pos === 'top' ? 180 : 0,
      paddingBottom: pos === 'bottom' ? 300 : 0,
    }}
  >
    {children}
  </AbsoluteFill>
);

const MoneyPanel = ({ children, holdFrames }) => {
  const { opacity, scale, y } = useInOut(12, holdFrames, 10);
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        padding: '44px 64px',
        borderRadius: 40,
        background: 'rgba(6,6,10,0.5)',
        border: `1.5px solid ${C.stroke}`,
        backdropFilter: 'blur(12px)',
        boxShadow: C.shadow,
      }}
    >
      {children}
    </div>
  );
};

const Label = ({ children, color = C.muted }) => (
  <div style={{ fontFamily: inter, fontWeight: 800, fontSize: 34, color, textAlign: 'center', marginBottom: 22, letterSpacing: 0.5 }}>
    {children}
  </div>
);

export const Reels = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <VideoLayer />

      {/* 1 — HOOK (legenda de ênfase) */}
      <Sequence from={f(1.5)} durationInFrames={f(5.3) - f(1.5)}>
        <EmphasisCaption
          text="Não existe jeito mais fácil de fazer dinheiro"
          accentWords={['fácil', 'dinheiro']}
          holdFrames={f(5.3) - f(1.5)}
        />
      </Sequence>

      {/* 2 — O que é CPA */}
      <Sequence from={f(9.6)} durationInFrames={f(16.6) - f(9.6)}>
        <Slot pos="top">
          <ConceptCard
            kicker="MÉTODO"
            title="CPA"
            lines={['O jeito mais simples de ganhar online', 'Sem precisar aparecer ou vender nada']}
            accent={C.yellow}
            holdFrames={f(16.6) - f(9.6)}
          />
        </Slot>
      </Sequence>

      {/* 3 — As casas pagam por cadastro */}
      <Sequence from={f(20.4)} durationInFrames={f(29.1) - f(20.4)}>
        <Slot pos="top">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <Label color={C.white}>As casas pagam por cadastro novo</Label>
            <div style={{ display: 'flex', gap: 18 }}>
              <Pill color={C.money} delay={4}>SuperBet</Pill>
              <Pill color={C.money} delay={10}>SportingBet</Pill>
            </div>
            <div style={{ marginTop: 6 }}>
              <Pill icon="✅" delay={18} big>Casas legalizadas</Pill>
            </div>
          </div>
        </Slot>
      </Sequence>

      {/* 4 — Depósito mínimo */}
      <Sequence from={f(29.4)} durationInFrames={f(33.4) - f(29.4)}>
        <Slot pos="bottom">
          <Pill icon="💰" big color={C.yellow}>Depósito mínimo: R$ 50</Pill>
        </Slot>
      </Sequence>

      {/* 5 — Quanto pagam por cadastro */}
      <Sequence from={f(37.6)} durationInFrames={f(45) - f(37.6)}>
        <Slot pos="center">
          <MoneyPanel holdFrames={f(45) - f(37.6)}>
            <MoneyCounter to={200} from={120} startFrame={4} dur={30} label="ELES TE PAGAM ATÉ" />
            <div style={{ fontFamily: inter, fontWeight: 800, fontSize: 38, color: C.white, textAlign: 'center', marginTop: 14 }}>
              por cada cadastro 🤝
            </div>
          </MoneyPanel>
        </Slot>
      </Sequence>

      {/* 6 — A conta: 10 por dia */}
      <Sequence from={f(56.2)} durationInFrames={f(60.5) - f(56.2)}>
        <Slot pos="center">
          <MoneyPanel holdFrames={f(60.5) - f(56.2)}>
            <Label>10 cadastros por dia</Label>
            <MoneyCounter to={1500} startFrame={3} dur={24} suffix="/dia" />
          </MoneyPanel>
        </Slot>
      </Sequence>

      {/* 7 — R$15.000 no mês (clímax) */}
      <Sequence from={f(60.5)} durationInFrames={f(63.8) - f(60.5)}>
        <Slot pos="center">
          <MoneyPanel holdFrames={f(63.8) - f(60.5)}>
            <MoneyCounter to={15000} startFrame={2} dur={26} suffix="/mês" label="NO FINAL DO MÊS" />
          </MoneyPanel>
        </Slot>
      </Sequence>

      {/* 8a — Não é apostar */}
      <Sequence from={f(73.8)} durationInFrames={f(77.6) - f(73.8)}>
        <Slot pos="center">
          <VersusBlock holdFrames={f(77.6) - f(73.8)} />
        </Slot>
      </Sequence>

      {/* 8b — Traga pessoas (ênfase) */}
      <Sequence from={f(77.6)} durationInFrames={f(81.2) - f(77.6)}>
        <EmphasisCaption
          text="Traga pessoas novas pro seu link"
          accentWords={['link', 'pessoas']}
          holdFrames={f(81.2) - f(77.6)}
        />
      </Sequence>

      {/* 9 — O painel liberado */}
      <Sequence from={f(82.8)} durationInFrames={f(97.8) - f(82.8)}>
        <Slot pos="top">
          <ConceptCard
            kicker="LIBERADO PRA VOCÊ"
            title="O PAINEL"
            lines={['Eu disponibilizo tudo pronto', 'Você entra na minha base de redes', 'Só traz as pessoas — o resto é comigo']}
            accent={C.purple}
            holdFrames={f(97.8) - f(82.8)}
          />
        </Slot>
      </Sequence>

      {/* 10 — Outro */}
      <Sequence from={f(98.8)} durationInFrames={f(103.6) - f(98.8)}>
        <EmphasisCaption text="Faça dinheiro 💸" accentWords={['dinheiro']} holdFrames={f(103.6) - f(98.8)} />
      </Sequence>

      <ProgressBar />
    </AbsoluteFill>
  );
};
