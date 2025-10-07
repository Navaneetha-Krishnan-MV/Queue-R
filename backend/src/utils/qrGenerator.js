const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');

class QRGenerator {
  static generateToken() {
    return uuidv4();
  }

  static async generateQRCode(venueId, questionId, token) {
    const url = `${config.FRONTEND_URL}/venue/${venueId}/question/${questionId}?token=${token}`;
    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return {
        url,
        qrCodeDataURL
      };
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }
}

module.exports = QRGenerator;