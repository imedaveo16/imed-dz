import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  User,
  FileText,
  Languages,
  Clock
} from 'lucide-react';
import { Button } from './components/Button';
import { MapPicker } from './components/MapPicker';
import { MediaUploader } from './components/MediaUploader';
import { EMERGENCY_TYPES_METADATA, ALGERIA_PHONE_REGEX, APP_LOGO_URL } from './constants';
import { AppStep, EmergencyType, ReportData, Coordinates } from './types';
import { supabase } from './supabaseClient';
import { useLanguage } from './LanguageContext';

function App() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [step, setStep] = useState<AppStep>('FORM');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [data, setData] = useState<ReportData>({
    phoneNumber: '',
    emergencyType: null,
    location: null,
    locationManual: false,
    description: '',
    photos: [],
    audioBlob: null
  });

  const [errors, setErrors] = useState<{ phone?: string; type?: string; location?: string }>({});

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9+]/g, '');
    setData(prev => ({ ...prev, phoneNumber: val }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData(prev => ({ ...prev, description: e.target.value }));
  };

  const handleTypeSelect = (type: EmergencyType) => {
    setData(prev => ({ ...prev, emergencyType: type }));
    if (errors.type) setErrors(prev => ({ ...prev, type: undefined }));
  };

  const handleLocationSelect = (coords: Coordinates) => {
    setData(prev => ({ ...prev, location: coords, locationManual: true }));
    if (errors.location) setErrors(prev => ({ ...prev, location: undefined }));
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'fr' : 'ar');
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!data.phoneNumber || !ALGERIA_PHONE_REGEX.test(data.phoneNumber)) {
      newErrors.phone = t('errPhone');
      isValid = false;
    }

    if (!data.emergencyType) {
      newErrors.type = t('errType');
      isValid = false;
    }

    // Location is MANDATORY
    if (!data.location) {
      newErrors.location = t('errLocation');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const uploadMedia = async (file: File | Blob, path: string) => {
    try {
        const { data: uploadData, error } = await supabase.storage
            .from('emergency-media')
            .upload(path, file);
        
        if (error) {
            console.warn('Media upload failed (bucket might be missing or restricted):', error.message);
            return null;
        }
        
        const { data: publicUrlData } = supabase.storage
            .from('emergency-media')
            .getPublicUrl(path);
            
        return publicUrlData.publicUrl;
    } catch (e) {
        console.warn('Media upload exception:', e);
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setStep('SUBMITTING');
    
    try {
        // 1. Prepare Media URLs
        const timestamp = Date.now();
        // Remove spaces/special chars from folder name just in case
        const safePhone = data.phoneNumber.replace(/[^0-9]/g, ''); 
        const folder = `${safePhone}_${timestamp}`;
        const imageUrls: string[] = [];
        let audioUrl: string | null = null;

        // Upload Photos
        if (data.photos.length > 0) {
            await Promise.all(data.photos.map(async (photo, index) => {
                const path = `${folder}/image_${index}.jpg`;
                const url = await uploadMedia(photo, path);
                if (url) imageUrls.push(url);
            }));
        }

        // Upload Audio
        if (data.audioBlob) {
            const path = `${folder}/audio.webm`;
            audioUrl = await uploadMedia(data.audioBlob, path);
        }

        // 2. Prepare Description (Only append Audio URL)
        let finalDescription = data.description || '';
        
        if (audioUrl) {
            finalDescription += `\n\n[Audio]: ${audioUrl}`;
        }
        
        // 3. Insert Report Data
        const locationWKT = `POINT(${data.location!.lng} ${data.location!.lat})`;

        const insertPayload = {
            phone: data.phoneNumber,
            type: data.emergencyType, // This remains consistent with DB (e.g. 'حريق') regardless of UI language
            location: locationWKT, 
            description: finalDescription.trim(),
            images: imageUrls 
        };

        const { error } = await supabase
            .from('reports')
            .insert([insertPayload]);

        if (error) {
            throw error;
        }

        console.log('Report Submitted Successfully');
        setStep('SUCCESS');
        window.scrollTo(0,0);

    } catch (err: any) {
        console.error('Submission Error Object:', err);
        
        let message = t('unknownError');
        
        if (err) {
             if (err.code === '23514') {
                 message = t('dbError');
             } else if (err.message) {
                 message = err.message;
             }
        }
        
        alert(`${t('submitError')}\n${message}`);
        setStep('FORM');
    }
  };

  if (step === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-xl shadow-green-100">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">{t('successTitle')}</h1>
        <p className="text-slate-600 mb-2 max-w-xs text-lg font-medium">
            {t('successMsg')}
        </p>
        <p className="text-slate-400 mb-12 max-w-xs text-sm">
          {t('successCall')} <span className="font-mono font-bold text-slate-600" dir="ltr">{data.phoneNumber}</span> {t('successConfirm')}
        </p>
        
        <Button 
            variant="outline" 
            onClick={() => {
                setData({
                    phoneNumber: '',
                    emergencyType: null,
                    location: null,
                    locationManual: false,
                    description: '',
                    photos: [],
                    audioBlob: null
                });
                setStep('FORM');
            }}
            className="border-red-200 text-red-600 hover:bg-red-50"
        >
          {t('submitAnother')}
        </Button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 flex flex-col ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
      {/* Official Top Bar */}
      <div className="relative bg-slate-900 text-white py-2 px-4 text-center text-[10px] sm:text-xs leading-tight border-b-2 border-red-600">
        {/* Algerian Flag (Left for AR, Right for FR) */}
        <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} z-10`}>
             <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Algeria.svg" 
              alt="Algeria" 
              className="h-7 w-auto rounded shadow-sm"
              referrerPolicy="no-referrer"
            />
        </div>

        {/* Civil Protection Logo (Right for AR, Left for FR) */}
        <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} z-10`}>
             <img 
              src={APP_LOGO_URL} 
              alt="Civil Protection" 
              className="h-9 w-auto object-contain drop-shadow-sm filter brightness-110"
              referrerPolicy="no-referrer"
            />
        </div>

        <p className="font-medium opacity-90">{t('republic')}</p>
        <p className="font-medium opacity-90">{t('ministry')}</p>
        <p className="font-bold text-red-400">{t('directorate')}</p>
      </div>

      {/* Red Gradient Header */}
      <header className="bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-white shadow-lg sticky top-0 z-30">
        <div className="w-full px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white p-1.5 rounded-full shadow-md">
                <img 
                src={APP_LOGO_URL} 
                alt="Logo" 
                className="h-10 w-10 object-contain"
                referrerPolicy="no-referrer"
                />
            </div>
            <div>
              <h1 className="font-black text-xl sm:text-2xl leading-none mb-1 tracking-wide">{t('appName')}</h1>
              <p className="text-[10px] sm:text-[11px] font-bold text-red-100 opacity-90">{t('appSubtitle')}</p>
            </div>
          </div>
          
          {/* Digital Clock - Centered/Flexible */}
          <div className="hidden sm:flex flex-1 justify-center items-center px-4">
             <div className="bg-black/10 backdrop-blur-md border border-white/10 px-6 py-2 rounded-xl shadow-inner group transition-all hover:bg-black/20 flex items-center gap-2 transform hover:scale-105 duration-300">
                <Clock className="w-6 h-6 text-red-100 opacity-90" />
                <span className="font-mono text-3xl font-black tracking-widest text-white drop-shadow-md tabular-nums leading-none pt-1">
                  {currentTime.toLocaleTimeString('en-GB', { hour12: false })}
                </span>
             </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Clock (Small) */}
             <div className="sm:hidden font-mono font-bold text-sm bg-black/10 px-2 py-1 rounded text-white/90">
                {currentTime.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute:'2-digit' })}
             </div>

            {/* Language Toggle */}
            <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/20 transition-all text-xs font-bold"
            >
                <Languages className="w-4 h-4" />
                <span>{language === 'ar' ? 'FR' : 'عربي'}</span>
            </button>
            
            {/* Emergency Numbers (Hidden on small screens) */}
            <div className="hidden sm:flex items-center gap-2">
                <a href="tel:1021" className="bg-white/10 px-3 py-2 rounded-lg border border-white/20 font-mono text-lg font-black tracking-wider hover:bg-white/20 transition-all">1021</a>
                <a href="tel:14" className="bg-white/10 px-3 py-2 rounded-lg border border-white/20 font-mono text-lg font-black tracking-wider hover:bg-white/20 transition-all">14</a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8 flex-grow">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Emergency Type Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">{t('typeTitle')}</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {EMERGENCY_TYPES_METADATA.map((type) => {
                const isSelected = data.emergencyType === type.id;
                const Icon = type.icon;
                const typeInfo = t(type.id) || { label: type.id, subLabel: '' };
                
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeSelect(type.id)}
                    className={`
                      relative overflow-hidden rounded-2xl p-4 transition-all duration-300 text-center
                      border-2 flex flex-col items-center justify-center gap-3 group
                      ${isSelected 
                        ? `${type.borderColor} ${type.color} text-white shadow-xl scale-[1.02] ring-2 ring-offset-2 ring-red-100` 
                        : 'bg-white border-slate-100 hover:border-red-200 hover:bg-red-50/30 hover:shadow-md'
                      }
                      aspect-[4/5]
                    `}
                  >
                    <div className={`p-3 rounded-full transition-colors ${isSelected ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}`}>
                      <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : type.textColor}`} />
                    </div>
                    <div>
                      <div className={`font-bold text-lg leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {typeInfo.label}
                      </div>
                      <div className={`text-[10px] mt-1 line-clamp-2 ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                        {typeInfo.subLabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.type && <p className="text-red-600 bg-red-50 p-2 rounded-lg text-sm font-bold border border-red-100 inline-block">{errors.type}</p>}
          </section>

          {/* Location Picker */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
                    <MapPin className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">{t('locationTitle')}</h2>
            </div>
            <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${errors.location ? 'border-red-300 shadow-red-100 shadow-lg' : 'border-slate-200 hover:border-red-200'}`}>
                <MapPicker 
                location={data.location} 
                onLocationSelect={handleLocationSelect} 
                />
            </div>
            {errors.location && <p className="text-red-600 bg-red-50 p-2 rounded-lg text-sm font-bold border border-red-100 inline-block">{errors.location}</p>}
          </section>

          {/* Phone Number Input */}
          <section className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
                    <User className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  {t('phoneTitle')}
                  <span className="text-red-500 mx-1 text-sm align-top">*</span>
                </h2>
            </div>
            <div className="relative group">
              <input
                type="tel"
                required
                placeholder={t('phonePlaceholder')}
                value={data.phoneNumber}
                onChange={handlePhoneChange}
                className={`
                    w-full px-4 py-4 bg-white border-2 rounded-xl text-lg font-mono font-bold text-slate-800 outline-none transition-all duration-300
                    ${isRTL ? 'pl-12' : 'pr-12'} 
                    ${errors.phone 
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 hover:border-red-200'
                    }
                `}
                dir="ltr"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
              <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none group-focus-within:text-red-500 transition-colors ${isRTL ? 'left-4' : 'right-4'}`}>
                🇩🇿
              </div>
            </div>
            {errors.phone ? (
              <p className="text-red-600 bg-red-50 p-2 rounded-lg text-sm font-bold border border-red-100 inline-block">{errors.phone}</p>
            ) : (
              <p className="text-slate-400 text-xs px-2">{t('phoneHelp')}</p>
            )}
          </section>

          {/* Description Input */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
                    <FileText className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  {t('descTitle')}
                  <span className="text-sm font-normal text-slate-400 mx-2">{t('optional')}</span>
                </h2>
            </div>
            <div className="relative">
              <textarea
                rows={3}
                placeholder={t('descPlaceholder')}
                value={data.description}
                onChange={handleDescriptionChange}
                className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-base text-slate-800 outline-none transition-all duration-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 hover:border-red-200 resize-none"
              />
            </div>
          </section>

          {/* Media Upload */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
             <MediaUploader
               photos={data.photos}
               audioBlob={data.audioBlob}
               onPhotosChange={(files) => setData(prev => ({ ...prev, photos: files }))}
               onAudioChange={(blob) => setData(prev => ({ ...prev, audioBlob: blob }))}
             />
          </section>

          {/* Submit Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-20 sm:relative sm:bg-transparent sm:border-0 sm:p-0">
             <Button 
                type="submit" 
                fullWidth 
                isLoading={step === 'SUBMITTING'}
                className="text-lg py-4 shadow-xl shadow-red-600/30 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 border border-white/10"
             >
               {t('submit')} <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
             </Button>
          </div>

        </form>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 mt-auto border-t-4 border-red-600 bg-slate-100 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rotate-45"></div>
        <p className="text-sm font-bold text-slate-500">
          {t('footerRights')}
        </p>
      </footer>
    </div>
  );
}

export default App;