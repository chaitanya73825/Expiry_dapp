import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

const QRTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generateTestQR();
  }, []);

  const generateTestQR = async () => {
    try {
      console.log('Attempting to generate QR code...');
      
      if (canvasRef.current) {
        const testUrl = 'https://example.com/test';
        
        await QRCode.toCanvas(canvasRef.current, testUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        
        console.log('QR code generated successfully!');
        setError('QR Generated Successfully!');
      } else {
        setError('Canvas ref is null');
      }
    } catch (err) {
      console.error('QR generation error:', err);
      setError(`Error: ${err}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #333', margin: '20px' }}>
      <h3>QR Code Test</h3>
      <div style={{ marginBottom: '10px' }}>
        Status: {error}
      </div>
      <canvas 
        ref={canvasRef} 
        style={{ 
          border: '1px solid #ccc',
          background: 'white'
        }}
      />
      <div>
        <button onClick={generateTestQR} style={{ marginTop: '10px' }}>
          Regenerate QR
        </button>
      </div>
    </div>
  );
};

export default QRTest;
