
import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, ArrowRight, X, Delete, AlertCircle } from 'lucide-react';
import { RoomConfig, Language } from '../types';
import { UI_TEXT } from '../constants';

interface GuestViewProps {
  onRoomSelect: (roomId: string) => void;
  onExit: () => void;
  rooms: RoomConfig[];
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  checkPermission: (roomId: string) => boolean; // Logic to check hasBreakfast
}

const GuestView: React.FC<GuestViewProps> = ({ onRoomSelect, onExit, rooms, currentLanguage, onLanguageChange, checkPermission }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showKeypad, setShowKeypad] = useState(false);
  const [inputRoom, setInputRoom] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showNoAuthModal, setShowNoAuthModal] = useState(false);

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Time: HH:mm
  const timeString = currentTime.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Format Date: Wed 10.Dec.2025
  const dateString = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, '.');

  // Format Chinese Date: 2025年12月10日 星期三
  const dateStringZH = currentTime.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // Mock Weather Data (Taipei)
  const weatherData = [
    { day: 'Today', icon: <CloudRain className="w-5 h-5 md:w-6 md:h-6 text-blue-300" />, temp: '19.9°C' },
    { day: 'Tmrw', icon: <Cloud className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />, temp: '21.0°C' },
    { day: 'Fri', icon: <Sun className="w-5 h-5 md:w-6 md:h-6 text-yellow-300" />, temp: '24.5°C' },
  ];

  const handleNumClick = (num: string) => {
    if (inputRoom.length < 4) { // Allow up to 4 digits for admin code
      setInputRoom(prev => prev + num);
      setErrorMsg('');
    }
  };

  const handleDelete = () => {
    setInputRoom(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleSubmit = () => {
    // 0. Secret Admin Code
    if (inputRoom === '0000') {
        setShowKeypad(false);
        setInputRoom('');
        onExit(); // Trigger Login Modal
        return;
    }

    // 1. Check if Room Exists
    const roomExists = rooms.some(r => r.id === inputRoom);
    if (!roomExists) {
      setErrorMsg(UI_TEXT.invalidRoom[currentLanguage]);
      setTimeout(() => setErrorMsg(''), 2000);
      return;
    }

    // 2. Check Permission (Breakfast Included)
    const allowed = checkPermission(inputRoom);
    if (!allowed) {
      // Replaced alert with custom modal
      setShowNoAuthModal(true);
      setInputRoom('');
      setShowKeypad(false);
      return;
    }

    // 3. Proceed
    onRoomSelect(inputRoom);
    setInputRoom('');
    setShowKeypad(false);
  };

  const t = (key: string) => UI_TEXT[key][currentLanguage];
  const tLang = (key: string, lang: Language) => UI_TEXT[key][lang];

  return (
    <div className="fixed inset-0 bg-slate-900 text-white z-[60] flex flex-col items-center justify-between font-sans overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-10"></div>
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/20 to-transparent -z-10"></div>

      {/* Header Bar */}
      <div className="w-full flex justify-between items-start p-6 md:p-10 z-10 max-h-[40vh]">
        {/* Logo (Top Left) */}
        <div className="flex items-start pt-2">
            <img 
                src="https://www.eastin-taipei.com.tw/images/logo.png" 
                alt="Eastin Taipei" 
                className="h-28 md:h-48 w-auto object-contain"
            />
        </div>

        {/* Info Group (Top Right): Date + Location + Weather */}
        <div className="flex flex-col items-end text-right space-y-3">
             <div>
                <span className="text-2xl md:text-4xl font-bold tracking-widest text-slate-100 drop-shadow-md block">{dateString}</span>
                {/* New Chinese Date Display */}
                <span className="text-lg md:text-2xl font-bold tracking-wide text-gray-200 block mt-1">{dateStringZH}</span>
                <span className="text-sm md:text-lg text-blue-300 font-medium tracking-wider uppercase block mt-1">Taipei City</span>
             </div>

             <div className="flex items-center space-x-3 bg-white/10 p-2 md:p-3 rounded-xl backdrop-blur-sm border border-white/5 shadow-lg">
                 {weatherData.map((w, idx) => (
                     <div key={idx} className="flex flex-col items-center px-2 min-w-[50px]">
                         <span className="text-slate-400 text-[10px] md:text-xs uppercase mb-1">{w.day}</span>
                         <div className="mb-1">{w.icon}</div>
                         <span className="text-sm md:text-base font-bold text-slate-100">{w.temp}</span>
                     </div>
                 ))}
             </div>
        </div>
        
        {/* Hidden Exit Button (Top Left Overlay - Backup) */}
        <button onClick={onExit} className="absolute top-0 left-0 w-32 h-32 opacity-0 z-50 cursor-default" aria-hidden="true" tabIndex={-1}>Exit</button>
      </div>

      {/* Main Center Area: Clock */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-0 -mt-4">
         <h1 className="text-[7rem] md:text-[10rem] leading-none font-bold tracking-tighter text-white drop-shadow-2xl font-mono select-none">
            {timeString}
         </h1>
      </div>

      {/* Bottom Action Area */}
      <div className="w-full flex justify-center pb-8 md:pb-12 z-10">
          <button 
            onClick={() => setShowKeypad(true)}
            // Modified styles: Dark Gray background, white border/shadow for contrast
            className="group relative px-8 py-5 md:px-12 md:py-6 
                       bg-gray-800 hover:bg-gray-700 
                       rounded-[2rem] 
                       shadow-[0_0_40px_-10px_rgba(255,255,255,0.15)] 
                       transition-all transform hover:scale-105 active:scale-95 
                       flex items-center 
                       border-2 border-gray-500/50 
                       w-[90%] md:w-auto max-w-4xl justify-between md:justify-start"
          >
            <div className="flex flex-col items-start text-left">
                <div className="mb-2 md:mb-3">
                    {/* Main Text: White */}
                    <span className="text-3xl md:text-4xl font-bold tracking-wide block mb-1 text-white">{UI_TEXT.guestEntryBtn.zh}</span>
                    {/* Sub Text: Light Gray (High Contrast) */}
                    <span className="text-xl md:text-2xl font-semibold opacity-90 block text-gray-300">{UI_TEXT.guestEntryBtn.en}</span>
                </div>
                
                <div className="flex flex-col space-y-0.5 text-[10px] md:text-sm font-medium opacity-80 text-gray-400 border-l-2 border-gray-500 pl-3 py-0.5">
                    <span>{UI_TEXT.guestEntrySub.zh}</span>
                    <span>{UI_TEXT.guestEntrySub.en}</span>
                    <span>{UI_TEXT.guestEntrySub.jp}</span>
                    <span>{UI_TEXT.guestEntrySub.ko}</span>
                </div>
            </div>
            <ArrowRight className="ml-4 md:ml-12 w-10 h-10 md:w-14 md:h-14 text-white group-hover:translate-x-3 transition-transform drop-shadow-md" />
          </button>
      </div>

      {/* Keypad Modal Overlay */}
      {showKeypad && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-2xl border border-slate-600 w-full max-w-md relative animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <span className="text-slate-300 text-lg font-medium">{t('enterRoom')}</span>
                      <button 
                        onClick={() => setShowKeypad(false)} 
                        className="p-2 md:p-3 bg-slate-700 rounded-full hover:bg-slate-600 text-white transition-colors"
                      >
                          <X className="w-6 h-6"/>
                      </button>
                  </div>
                  
                  {/* Display Screen */}
                  <div className={`w-full h-20 md:h-24 bg-slate-900 rounded-2xl mb-6 flex items-center justify-center text-5xl font-mono tracking-[0.2em] border-2 shadow-inner ${errorMsg ? 'border-red-500 text-red-500' : 'border-slate-700 text-white'}`}>
                      {errorMsg ? <span className="text-2xl tracking-normal">{errorMsg}</span> : (inputRoom || <span className="text-slate-800">---</span>)}
                  </div>

                  {/* Numpad Grid */}
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                          <button 
                            key={num} 
                            onClick={() => handleNumClick(num.toString())}
                            className="w-full aspect-[4/3] bg-slate-700/50 rounded-2xl text-3xl font-bold hover:bg-slate-700 active:bg-blue-600 active:text-white transition-all shadow-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1"
                          >
                              {num}
                          </button>
                      ))}
                      <button 
                        onClick={handleDelete} 
                        className="w-full aspect-[4/3] bg-red-900/30 text-red-200 rounded-2xl flex items-center justify-center hover:bg-red-900/50 active:bg-red-800 transition-all border-b-4 border-slate-900 active:border-b-0 active:translate-y-1"
                      >
                          <Delete className="w-8 h-8" />
                      </button>
                      <button 
                        onClick={() => handleNumClick('0')}
                        className="w-full aspect-[4/3] bg-slate-700/50 rounded-2xl text-3xl font-bold hover:bg-slate-700 active:bg-blue-600 active:text-white transition-all shadow-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1"
                      >
                          0
                      </button>
                      <button 
                        onClick={handleSubmit} 
                        className="w-full aspect-[4/3] bg-green-600 text-white rounded-2xl flex items-center justify-center hover:bg-green-500 active:bg-green-700 transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)] border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
                      >
                          <ArrowRight className="w-10 h-10" />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* No Permission / Add-on Info Modal */}
      {showNoAuthModal && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 w-full max-w-lg animate-in zoom-in-95 duration-200 relative text-gray-900">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                          <AlertCircle className="w-12 h-12 text-red-600" />
                      </div>
                      
                      <div className="space-y-6 w-full">
                          {(['zh', 'en', 'jp', 'ko'] as Language[]).map((lang) => (
                              <div key={lang} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                  <h3 className="text-xl font-bold text-red-600 mb-1">
                                      {tLang('noBreakfastWarn', lang)}
                                  </h3>
                                  <p className="text-gray-600 font-medium">
                                      {tLang('addOnPrice', lang)}
                                  </p>
                              </div>
                          ))}
                      </div>

                      <button 
                          onClick={() => setShowNoAuthModal(false)}
                          className="mt-8 w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-colors"
                      >
                          {tLang('iUnderstand', currentLanguage)} / OK
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default GuestView;
