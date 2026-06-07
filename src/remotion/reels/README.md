# Reels — edição dinâmica (CPA)

Edição vertical 9:16 do vídeo talking-head, com motion graphics sincronizados à fala
e legendas de ênfase (fundo borrado) só nos picos.

## Arquivos
- `Reels.jsx` — linha do tempo (o que aparece e quando). Tempos em segundos via `f(seg)`.
- `components.jsx` — peças de motion (Pill, MoneyCounter, ConceptCard, EmphasisCaption, VersusBlock).
- `theme.js` — cores, fontes (Inter + Anton) e formato de moeda BR.
- A fala transcrita com tempos está em `.work/whisper_out.json` / `.work/transcript.txt`.

## Como mexer
- **Trocar um texto / tempo:** edite o `<Sequence from={f(...)}>` correspondente em `Reels.jsx`.
- **Reenquadramento:** `objectPosition: '59% 28%'` em `VideoLayer` (x% = horizontal, y% = vertical).
- **Mais/menos zoom dinâmico:** array `beats` e `baseZoom` em `VideoLayer`.

## Pré-requisitos (uma vez)
O vídeo precisa estar em `public/source.mp4` (H.264). Para gerar a partir do original:
```
ffmpeg -i ORIGINAL.MOV -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a aac -b:a 160k public/source.mp4
```

## Prévia ao vivo
```
npm run video        # abre o estúdio do Remotion (mexe e vê na hora)
```

## Renderizar
```
npx remotion render src/remotion/index.js Reels saida.mp4 --concurrency=4
```
