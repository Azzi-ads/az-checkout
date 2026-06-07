import { Composition } from 'remotion';
import { HelloAZ } from './HelloAZ.jsx';
import { Reels } from './reels/Reels.jsx';

// Registre aqui cada vídeo (Composition). Cada um vira um item no estúdio.
export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Reels"
        component={Reels}
        durationInFrames={3132}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="HelloAZ"
        component={HelloAZ}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          titulo: 'AZ Checkout',
          subtitulo: 'Seu checkout que vende mais',
        }}
      />
    </>
  );
};
