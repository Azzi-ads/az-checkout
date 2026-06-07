import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Cores do design system AZ (tema preto + amarelo).
const BG = '#0a0a0a';
const YELLOW = '#ffd400';
const TEXT = '#f5f5f5';
const MUTED = '#9a9a9a';

export const HelloAZ = ({ titulo, subtitulo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrada do título com mola (spring).
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const scale = interpolate(enter, [0, 1], [0.8, 1]);
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // Subtítulo entra um pouco depois.
  const subOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Manrope, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          textAlign: 'center',
          padding: 80,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '10px 22px',
            borderRadius: 999,
            backgroundColor: YELLOW,
            color: '#000',
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: 1,
            marginBottom: 28,
          }}
        >
          AZ
        </div>
        <h1
          style={{
            color: TEXT,
            fontSize: 96,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          {titulo}
        </h1>
        <p
          style={{
            color: MUTED,
            fontSize: 40,
            marginTop: 24,
            opacity: subOpacity,
          }}
        >
          {subtitulo}
        </p>
      </div>
    </AbsoluteFill>
  );
};
