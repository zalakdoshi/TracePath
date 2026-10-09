import QRCode from 'qrcode';

export async function generateQR(data) {
  try {
    const png = await QRCode.toBuffer(data, {
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return png;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}
