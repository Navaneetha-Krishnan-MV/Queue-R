import React, { useState, useEffect } from 'react';
import { adminAPI, venueAPI } from '../../utils/api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Printer, QrCode } from 'lucide-react';

const QRGenerator = () => {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [qrCodes, setQRCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await venueAPI.getAll();
      setVenues(response.data);
    } catch (error) {
      console.error('Failed to fetch venues');
    }
  };

  const generateQRForVenue = async () => {
    if (!selectedVenue) {
      setMessage('❌ Please select a venue');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await adminAPI.getQRCodes(selectedVenue);
      setQRCodes(response.data.qrCodes);
      setMessage(`✅ ${response.data.message}`);
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Failed to generate QR codes'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateAllQR = async () => {
    setLoading(true);
    setMessage('Generating QR codes for all venues...');

    try {
      const response = await adminAPI.getAllQRCodes();
      const allVenues = response?.data?.venues || [];

      if (!allVenues.length) {
        setMessage('❌ No venues found');
        setLoading(false);
        return;
      }

      const qrData = [];
      allVenues.forEach(venue => {
        (venue.qrCodes || []).forEach(qr => {
          qrData.push({
            ...qr,
            venueId: venue.venueId,
            venueName: venue.venueName
          });
        });
      });

      if (!qrData.length) {
        setMessage('❌ No QR codes found');
        setLoading(false);
        return;
      }

      const venuesMap = new Map();
      qrData.forEach(item => {
        if (!venuesMap.has(item.venueId)) {
          venuesMap.set(item.venueId, {
            venueName: item.venueName,
            qrCodes: []
          });
        }
        venuesMap.get(item.venueId).qrCodes.push(item);
      });

      const zip = new JSZip();

      for (const [venueId, venueData] of venuesMap.entries()) {
        const sanitizedVenueName = venueData.venueName.replace(/[^a-z0-9_\-\s]/gi, '_').trim();
        const venueFolder = zip.folder(sanitizedVenueName);

        for (const qr of venueData.qrCodes) {
          try {
            const base64Data = qr.qrCodeImage.startsWith('data:')
              ? qr.qrCodeImage.split(',')[1]
              : qr.qrCodeImage;

            if (!base64Data) {
              console.error(`No base64 data for question ${qr.questionId}`);
              continue;
            }

            const filename = `${sanitizedVenueName}_Q${qr.questionId}.png`;
            venueFolder.file(filename, base64Data, { base64: true });
          } catch (err) {
            console.error(`Error processing QR code for question ${qr.questionId}:`, err);
          }
        }
      }

      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      saveAs(content, `venue_qr_codes_${timestamp}.zip`);

      setMessage(`✅ Successfully downloaded ${qrData.length} QR codes for ${venuesMap.size} venues`);
    } catch (error) {
      console.error('Error generating QR codes:', error);
      setMessage(`❌ ${error.response?.data?.message || error.message || 'Failed to generate QR codes'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (qrCodeImage, venueName, questionId) => {
    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `${venueName}-Q${questionId}.png`;
    link.click();
  };

  const printQRCodes = () => {
    const printWindow = window.open('', '_blank');
    const qrCodesHTML = qrCodes.map(qr => `
      <div style="page-break-after: always; text-align: center; padding: 20px;">
        <h2>${qr.venueName} - Question ${qr.questionId}</h2>
        <img src="${qr.qrCodeImage}" style="width: 300px; height: 300px;" />
        <p><strong>Question:</strong> ${qr.questionText}</p>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ${qrCodes[0]?.venueName}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${qrCodesHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <QrCode className="h-6 w-6" />
            Generate QR Codes
          </CardTitle>
          <CardDescription>
            Generate and download QR codes for individual venues or all venues at once
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {message && (
            <Alert variant={message.includes('✅') ? 'default' : 'destructive'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Venue Selection Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium mb-2 block">
                  Select Venue
                </label>
                <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a venue..." />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map(venue => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.venueName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={generateQRForVenue}
                disabled={loading || !selectedVenue}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={generateAllQR}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating All...
                  </>
                ) : (
                  'Generate All Venues'
                )}
              </Button>

              {qrCodes.length > 0 && (
                <Button
                  onClick={printQRCodes}
                  variant="secondary"
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print QR Codes
                </Button>
              )}
            </div>
          </div>

          {/* QR Codes Grid */}
          {qrCodes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Generated QR Codes
                </h3>
                <Badge variant="secondary">
                  {qrCodes.length} QR Code{qrCodes.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qrCodes.map((qr, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {qr.venueName}
                        </CardTitle>
                        <Badge variant="outline">
                          Q{qr.questionId}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex justify-center">
                        <img 
                          src={qr.qrCodeImage} 
                          alt={`QR Code ${qr.questionId}`}
                          className="w-48 h-48 max-w-full border rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {qr.questionText}
                        </p>
                      </div>

                      <Button
                        onClick={() => downloadQRCode(qr.qrCodeImage, qr.venueName, qr.questionId)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRGenerator;