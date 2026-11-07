import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box } from '@mui/material';
import jsQR from 'jsqr';

interface Props {
  onResult: (text: string) => void;
}

/** Leitor de QR pela camera traseira; chama onResult uma vez com o texto lido. */
const QrScanner: React.FC<Props> = ({ onResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let done = false;
    const canvas = document.createElement('canvas');

    const tick = () => {
      const video = videoRef.current;
      if (!video || done) return;
      if (video.readyState >= 2 && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const found = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
          if (found?.data) {
            done = true;
            onResult(found.data);
            return;
          }
        }
      }
      raf = window.setTimeout(tick, 200) as unknown as number;
    };

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((s) => {
        stream = s;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = s;
        video.setAttribute('playsinline', 'true');
        void video.play();
        tick();
      })
      .catch(() => setError('Não foi possível abrir a câmera. Permita o acesso à câmera ou digite o código.'));

    return () => {
      done = true;
      window.clearTimeout(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onResult]);

  if (error) return <Alert severity="warning">{error}</Alert>;
  return (
    <Box
      component="video"
      ref={videoRef}
      muted
      playsInline
      sx={{ width: '100%', maxHeight: '60vh', bgcolor: '#000', borderRadius: 1, objectFit: 'cover' }}
    />
  );
};

export default QrScanner;
