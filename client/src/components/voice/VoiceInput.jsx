import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, X, Check } from 'lucide-react';
import GlassButton from '../ui/GlassButton';

const VoiceInput = ({ onTranscriptComplete, isListening, setIsListening }) => {
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please enable it in your browser settings.');
        } else if (event.error === 'no-speech') {
          // Ignored, just no speech detected
        } else {
          setError(`Recognition notification: ${event.error}`);
        }
        if (setIsListening) setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (setIsListening) setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore cleanup stop errors
        }
      }
    };
  }, [isSupported, setIsListening]);

  const toggleListening = () => {
    if (!isSupported) return;
    
    setError('');
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
      if (setIsListening) setIsListening(false);
    } else {
      setTranscript(''); // Clear previous transcript when starting new dictation
      try {
        recognitionRef.current.start();
        if (setIsListening) setIsListening(true);
      } catch (e) {
        setError('Could not start microphone. It might already be active.');
      }
    }
  };

  const handleDone = () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
      if (setIsListening) setIsListening(false);
    }
    if (transcript.trim()) {
      onTranscriptComplete(transcript.trim());
      setTranscript('');
    }
  };

  const handleClear = () => {
    setTranscript('');
    setError('');
  };

  if (!isSupported) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-center">
        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
        Voice dictation is not supported in this browser environment. You can type your issue description below.
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            {isListening ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                Listening...
              </>
            ) : (
              'Voice Input'
            )}
          </h4>
          <p className="text-xs text-slate-500 mt-1">Dictate your civic issue (English / en-IN)</p>
        </div>
        
        <GlassButton 
          type="button"
          onClick={toggleListening}
          variant={isListening ? 'danger' : 'primary'}
          className="text-sm py-1.5 px-4 rounded-full flex items-center gap-2"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </GlassButton>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-2 rounded mb-3 flex items-start">
          <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {(transcript || isListening) && (
        <div className="mt-3 bg-white border border-slate-200 rounded-lg p-3 animate-in fade-in duration-300">
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-700 resize-none outline-none"
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Speak now..."
          />
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={handleClear}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1 flex items-center cursor-pointer"
            >
              <X className="w-3 h-3 mr-1" /> Clear
            </button>
            <button 
              type="button" 
              onClick={handleDone}
              className="text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-md flex items-center cursor-pointer disabled:opacity-50"
              disabled={!transcript.trim()}
            >
              <Check className="w-3 h-3 mr-1" /> Use this text
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
