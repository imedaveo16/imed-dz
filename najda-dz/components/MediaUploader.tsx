import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, X, Play, Square, ImagePlus, Trash2, Paperclip } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface MediaUploaderProps {
  photos: File[];
  audioBlob: Blob | null;
  onPhotosChange: (files: File[]) => void;
  onAudioChange: (blob: Blob | null) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  photos,
  audioBlob,
  onPhotosChange,
  onAudioChange
}) => {
  const { t } = useLanguage();
  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onAudioChange(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
            if (prev >= 30) {
                stopRecording();
                return 30;
            }
            return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("لا يمكن الوصول إلى الميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  };

  const deleteAudio = () => {
    onAudioChange(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const playAudio = () => {
    if (audioBlob) {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current = null;
            setIsPlaying(false);
        } else {
            const url = URL.createObjectURL(audioBlob);
            const audio = new Audio(url);
            audioPlayerRef.current = audio;
            audio.onended = () => {
                setIsPlaying(false);
                audioPlayerRef.current = null;
            };
            audio.play();
            setIsPlaying(true);
        }
    }
  };

  // Photo Handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      onPhotosChange([...photos, ...newPhotos]);
      e.target.value = ''; // Reset input to allow re-selection
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhoto = e.target.files[0];
      onPhotosChange([...photos, newPhoto]);
      e.target.value = ''; // Reset input to allow re-capture
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
       
       <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
                <Paperclip className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">{t('mediaTitle')} <span className="text-sm font-normal text-slate-400">{t('optional')}</span></h2>
        </div>

      {/* Audio Recording Section */}
      <div className="bg-white border-2 border-slate-100 hover:border-red-100 rounded-2xl p-4 shadow-sm transition-colors">
        <label className="block text-sm font-bold text-slate-700 mb-3">
            {t('audioLabel')}
        </label>
        
        {!audioBlob ? (
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
                {isRecording ? (
                    <span className="text-red-500 font-bold animate-pulse flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-600 mx-2 shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
                        {t('audioRec')} {formatTime(recordingTime)} / 0:30
                    </span>
                ) : (
                    t('audioInstruction')
                )}
            </div>
            
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-4 rounded-full transition-all shadow-md ${
                isRecording 
                ? 'bg-red-50 text-red-600 ring-2 ring-red-500 ring-offset-2' 
                : 'bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
            <button
                type="button" 
                onClick={playAudio}
                className="flex items-center text-slate-700 font-semibold px-2 hover:text-red-600 transition-colors"
            >
                {isPlaying ? <Square className="w-5 h-5 mx-2 fill-current text-red-600" /> : <Play className="w-5 h-5 mx-2 fill-current" />}
                <span>{t('audioPlay')} ({formatTime(recordingTime)})</span>
            </button>
            <button 
                type="button"
                onClick={deleteAudio}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
                <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Photos Section */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
           {t('photosLabel')}
        </label>
        <div className="grid grid-cols-4 gap-3">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
              <img 
                src={URL.createObjectURL(photo)} 
                alt="Upload preview" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 rtl:right-auto rtl:left-1 bg-black/60 text-white p-1 rounded-full hover:bg-red-600 transition-colors backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {/* Camera Button */}
          <label className="aspect-square flex flex-col items-center justify-center bg-slate-800 text-white rounded-xl cursor-pointer hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-slate-200 group">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              onChange={handleCameraCapture}
            />
            <div className="bg-white/10 p-2 rounded-full mb-1 group-hover:bg-white/20 transition-colors">
                 <Camera className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">{t('camera')}</span>
          </label>

          {/* Gallery Button */}
          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all bg-white group">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handlePhotoSelect}
            />
            <ImagePlus className="w-6 h-6 text-slate-400 mb-1 group-hover:text-red-500 transition-colors" />
            <span className="text-[10px] text-slate-500 font-bold group-hover:text-red-600">{t('gallery')}</span>
          </label>
        </div>
      </div>
    </div>
  );
};