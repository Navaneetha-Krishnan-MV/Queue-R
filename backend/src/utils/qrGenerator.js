const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

class QRGenerator {
  static generateToken() {
    return uuidv4();
  }

  static async generateQRCode(questionId, token) {
    const url = `${process.env.FRONTEND_URL}/question/${questionId}?token=${token}`;
    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2
      });
      return {
        url,
        qrCodeDataURL
      };
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  static async generateBulkQRCodes(questions) {
    const results = [];
    for (const question of questions) {
      const token = this.generateToken();
      const qrData = await this.generateQRCode(question.questionId, token);
      results.push({
        questionId: question.questionId,
        questionText: question.questionText,
        token,
        qrUrl: qrData.url,
        qrCodeImage: qrData.qrCodeDataURL
      });
    }
    return results;
  }
}

module.exports = QRGenerator;