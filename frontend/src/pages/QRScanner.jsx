// src/pages/QRScanner.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamAuth } from '../context/TeamAuthContext';
import QrScanner from 'qr-scanner';

const QRScanner = () => {
  const navigate = useNavigate();
  const { team } = useTeamAuth();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentCamera, setCurrentCamera] = useState('environment');

  // Handle QR code scan result
  const handleScanResult = useCallback((result) => {
    if (!mountedRef.current) return;
    
    console.log('QR Code detected:', result.data);
    
    try {
      const url = new URL(result.data);
      const pathParts = url.pathname.split('/');
      
      const venueIndex = pathParts.indexOf('venue');
      const questionIndex = pathParts.indexOf('question');
      
      if (venueIndex !== -1 && questionIndex !== -1) {
        const venueId = pathParts[venueIndex + 1];
        const questionId = pathParts[questionIndex + 1];
        const token = url.searchParams.get('token');
        
        if (venueId && questionId && token) {
          // Stop scanner before navigation
          if (scannerRef.current) {
            scannerRef.current.stop();
          }
          navigate(`/venue/${venueId}/question/${questionId}?token=${token}`);
        } else {
          setError('Invalid QR code format');
        }
      } else {
        setError('Invalid QR code. Please scan a valid question QR code.');
      }
    } catch (err) {
      console.error('QR parse error:', err);
      setError('Invalid QR code format. Please scan a valid question QR code.');
    }
  }, [navigate]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      } catch (err) {
        console.warn('Scanner cleanup error:', err);
      }
      scannerRef.current = null;
    }
  }, []);

  // Initialize camera
  useEffect(() => {
    mountedRef.current = true;
    let timeoutId;

    const initCamera = async () => {
      if (!mountedRef.current || !teamId) return;
      
      setIsInitializing(true);
      setError('');
      
      try {
        // Add small delay to prevent rapid initialization
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, 100);
        });

        if (!mountedRef.current) return;

        // Check camera availability
        const hasCameraAvailable = await QrScanner.hasCamera();
        if (!hasCameraAvailable) {
          if (mountedRef.current) {
            setError('No camera found. Please use file upload option.');
            setHasCamera(false);
            setIsInitializing(false);
          }
          return;
        }

        if (mountedRef.current) {
          setHasCamera(true);
        }

        if (videoRef.current && mountedRef.current) {
          // Clean up any existing scanner
          cleanup();

          // Create new QR scanner with optimized settings
          const qrScanner = new QrScanner(
            videoRef.current,
            handleScanResult,
            {
              onDecodeError: () => {
                // Silent - no logging for decode errors to reduce console spam
              },
              highlightScanRegion: false,
              highlightCodeOutline: false,
              preferredCamera: currentCamera,
              maxScansPerSecond: 2,
              calculateScanRegion: (video) => {
                const size = Math.min(video.videoWidth, video.videoHeight) * 0.7;
                return {
                  x: (video.videoWidth - size) / 2,
                  y: (video.videoHeight - size) / 2,
                  width: size,
                  height: size,
                };
              }
            }
          );

          scannerRef.current = qrScanner;

          try {
            await qrScanner.start();
            if (mountedRef.current) {
              setIsScanning(true);
              setError('');
            }
          } catch (startError) {
            console.error('Camera start error:', startError);
            if (mountedRef.current) {
              // Try fallback camera
              const fallbackCamera = currentCamera === 'environment' ? 'user' : 'environment';
              try {
                await qrScanner.setCamera(fallbackCamera);
                await qrScanner.start();
                if (mountedRef.current) {
                  setCurrentCamera(fallbackCamera);
                  setIsScanning(true);
                  setError('');
                }
              } catch (fallbackError) {
                console.error('Fallback camera error:', fallbackError);
                if (mountedRef.current) {
                  setError('Camera access denied. Please allow camera permissions and try again.');
                  setHasCamera(false);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Camera initialization error:', err);
        if (mountedRef.current) {
          setError('Camera initialization failed. Please refresh and try again.');
          setHasCamera(false);
        }
      } finally {
        if (mountedRef.current) {
          setIsInitializing(false);
        }
      }
    };

    initCamera();

    return () => {
      mountedRef.current = false;
      if (timeoutId) clearTimeout(timeoutId);
      cleanup();
    };
  }, [currentCamera, teamId, handleScanResult, cleanup]);

  const switchCamera = useCallback(async () => {
    if (!scannerRef.current || !hasCamera || isInitializing) return;
    
    try {
      const newCamera = currentCamera === 'environment' ? 'user' : 'environment';
      await scannerRef.current.setCamera(newCamera);
      setCurrentCamera(newCamera);
      setError('');
    } catch (err) {
      console.error('Camera switch error:', err);
      setError('Unable to switch camera. Try refreshing the page.');
    }
  }, [currentCamera, hasCamera, isInitializing]);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      const result = await QrScanner.scanImage(file);
      console.log('QR Code from file:', result);
      
      // Parse the result same way as camera scan
      try {
        const url = new URL(result);
        const pathParts = url.pathname.split('/');
        
        const venueIndex = pathParts.indexOf('venue');
        const questionIndex = pathParts.indexOf('question');
        
        if (venueIndex !== -1 && questionIndex !== -1) {
          const venueId = pathParts[venueIndex + 1];
          const questionId = pathParts[questionIndex + 1];
          const token = url.searchParams.get('token');
          
          if (venueId && questionId && token) {
            if (scannerRef.current) {
              scannerRef.current.stop();
            }
            navigate(`/venue/${venueId}/question/${questionId}?token=${token}`);
          } else {
            setError('Invalid QR code format');
          }
        } else {
          setError('Invalid QR code. Please scan a valid question QR code.');
        }
      } catch (parseErr) {
        setError('Invalid QR code format. Please scan a valid question QR code.');
      }
    } catch (err) {
      console.error('File scan error:', err);
      setError('No QR code found. Ensure the image contains a clear, well-lit QR code.');
    }
  }, [navigate]);

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const retryCamera = useCallback(() => {
    setError('');
    setIsInitializing(true);
    setIsScanning(false);
    setCurrentCamera(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  const handleClose = () => {
    cleanup();
    navigate('/');
  };

  if (!teamId) {
    navigate('/');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Scan QR Code</h2>
                <p className="text-xs text-slate-400">{team?.venue || 'Loading...'}</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="hover:bg-red-100/20 text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <span>{error}</span>
                {!hasCamera && (
                  <button
                    onClick={retryCamera}
                    className="mt-2 text-red-400 hover:text-red-300 underline text-xs"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Camera Scanner */}
            {(hasCamera || isInitializing) && (
              <div className="relative">
                <div className="relative overflow-hidden rounded-lg bg-black border border-slate-700/50">
                  <video
                    ref={videoRef}
                    className="w-full h-80 object-cover"
                    playsInline
                    muted
                    autoPlay
                    style={{
                      transform: currentCamera === 'user' ? 'scaleX(-1)' : 'none'
                    }}
                  />
                  
                  {/* Loading Overlay */}
                  {isInitializing && (
                    <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-20">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-300 text-sm">Starting camera...</p>
                        <p className="text-slate-400 text-xs mt-1">
                          {currentCamera === 'environment' ? 'Back camera' : 'Front camera'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Scanning Overlay */}
                  {isScanning && !isInitializing && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      {/* Darkened overlay with cutout effect */}
                      <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 right-0 bg-black/60" style={{height: 'calc(50% - 112px)'}}></div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60" style={{height: 'calc(50% - 112px)'}}></div>
                        <div className="absolute top-0 left-0 bottom-0 bg-black/60" style={{width: 'calc(50% - 112px)'}}></div>
                        <div className="absolute top-0 right-0 bottom-0 bg-black/60" style={{width: 'calc(50% - 112px)'}}></div>
                      </div>

                      {/* Scan frame */}
                      <div 
                        className="absolute border-2 border-blue-400 rounded-lg"
                        style={{
                          top: '50%',
                          left: '50%',
                          width: '224px',
                          height: '224px',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-300 rounded-tl-lg"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-300 rounded-tr-lg"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-300 rounded-bl-lg"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-300 rounded-br-lg"></div>
                      </div>
                      
                      {/* Status indicator */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/50">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-slate-200 text-sm font-medium">Scanning...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Camera Switch Button */}
                  {/* {hasCamera && isScanning && !isInitializing && (
                    <button
                      onClick={switchCamera}
                      className="absolute top-4 right-4 bg-slate-900/70 backdrop-blur-sm hover:bg-slate-800/80 text-white p-2 rounded-full border border-slate-700/50 shadow-lg transition-all hover:scale-105 z-15"
                      aria-label="Switch camera"
                      title={`Switch to ${currentCamera === 'environment' ? 'front' : 'back'} camera`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )} */}
                </div>
                
                {hasCamera && isScanning && !isInitializing && (
                  <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <span className="text-emerald-400 text-sm font-medium">Camera ready</span>
                      <p className="text-emerald-400/80 text-xs">
                        {currentCamera === 'environment' ? 'Back camera' : 'Front camera'} active
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* File Upload Option */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800/95 text-slate-400">OR</span>
                </div>
              </div>
              
              <button
                onClick={triggerFileUpload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-emerald-600/40 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload QR Code Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              
              {/* Instructions */}
              <div className="bg-slate-700/30 backdrop-blur-sm border border-slate-600/50 rounded-lg p-4">
                <p className="text-sm text-slate-300 text-center leading-relaxed">
                  <span className="font-medium text-white">Position QR code</span> within the blue frame above, or upload an image with a QR code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;