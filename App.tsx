
import React, { useState, useEffect } from 'react';
import { ALL_ROOMS } from './constants';
import { RoomConfig, RoomOrder, Language, AvailabilitySettings } from './types';
import RoomGrid from './components/RoomGrid';
import OrderModal from './components/OrderModal';
import PrintPreviewModal from './components/PrintPreviewModal'; 
import GuestView from './components/GuestView'; 
import LoginModal from './components/LoginModal';
import MenuSettingsModal from './components/MenuSettingsModal';
import { subscribeToOrders, saveOrderToFirebase, subscribeToSettings, saveSettingsToFirebase } from './services/firebase';
import { ChevronLeft, ChevronRight, Calendar, Ban, Check, Printer, Monitor, Unlock, PenTool, Store, AlertTriangle, ShieldAlert, ExternalLink, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  
  // --- Date Management ---
  const getToday = (): Date => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
  }

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0); 
    d.setDate(d.getDate() + 1); // Default to tomorrow
    return d;
  });

  const formatDateKey = (date: Date): string => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  const dateKey = formatDateKey(selectedDate);

  // --- Data State ---
  const [allOrders, setAllOrders] = useState<Record<string, Record<string, RoomOrder>>>({});
  const [currentDayOrders, setCurrentDayOrders] = useState<Record<string, RoomOrder>>({});
  
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings>({ 
      isMcDonaldsClosed: false, 
      isChineseClosed: false, 
      unavailableItems: [] 
  });

  // --- UI State ---
  const [selectedRoom, setSelectedRoom] = useState<RoomConfig | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showMenuSettings, setShowMenuSettings] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Guest Mode State (Persisted)
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('eastin_kiosk_mode') === 'true';
      }
      return false;
  });

  // --- Bug Fix: Auto Date Refresh at Midnight ---
  useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 10) {
            setSelectedDate(prev => {
                const copy = new Date(prev);
                return copy; 
            });
        }
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // --- Real-time Sync: Orders ---
  useEffect(() => {
    const handleFirebaseError = (error: any) => {
        console.error("Orders Subscription Error:", error);
        if (error.code === 'permission-denied') {
            setDbError('permission-denied');
        } else {
            setDbError(error.message || 'Unknown database error');
        }
    };

    const unsubscribe = subscribeToOrders(dateKey, (orders) => {
        setDbError(null);
        setCurrentDayOrders(orders);
        setAllOrders(prev => ({
            ...prev,
            [dateKey]: orders
        }));
    }, handleFirebaseError);
    return () => unsubscribe();
  }, [dateKey]);

  // --- Real-time Sync: Availability Settings ---
  useEffect(() => {
      const handleSettingsError = (error: any) => {
          console.error("Settings Subscription Error:", error);
          if (error.code === 'permission-denied') {
              setDbError('permission-denied');
          }
      };

      const unsubscribe = subscribeToSettings((settings) => {
          setAvailabilitySettings(settings);
      }, handleSettingsError);
      return () => unsubscribe();
  }, []);

  // Persist Guest Mode
  useEffect(() => {
      localStorage.setItem('eastin_kiosk_mode', String(isGuestMode));
  }, [isGuestMode]);

  // Reset override when date changes
  useEffect(() => {
      setIsOverrideMode(false);
  }, [selectedDate]);

  // Kiosk Mode Security
  useEffect(() => {
    if (isGuestMode) {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isGuestMode]);

  const getDateLabel = (date: Date): string => {
     return date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  const handleDateChange = (offset: number) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + offset);
      newDate.setHours(0, 0, 0, 0);

      const today = getToday();
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 7);

      if (newDate.getTime() < today.getTime()) return; 
      if (newDate.getTime() > maxDate.getTime()) return; 

      setSelectedDate(newDate);
  };

  const getRestrictionStatus = (): { locked: boolean; label: string; color: string; canStaffUnlock: boolean } => {
      const now = new Date();
      const today = getToday(); 
      const targetDate = new Date(selectedDate);
      targetDate.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (targetDate.getTime() <= today.getTime()) {
          if (targetDate.getTime() === today.getTime()) {
             const currentHour = now.getHours();
             if (currentHour < 12) {
                 return { locked: true, label: 'LOCKED (Today)', color: 'text-orange-500', canStaffUnlock: true };
             }
          }
          return { locked: true, label: 'VIEW ONLY (Past)', color: 'text-gray-500', canStaffUnlock: false };
      }

      if (targetDate.getTime() === tomorrow.getTime()) {
          const currentHour = now.getHours();
          const currentMin = now.getMinutes();
          const currentTimeVal = currentHour * 60 + currentMin;
          const closeTime = 23 * 60 + 15; 

          if (currentTimeVal > closeTime) {
              return { locked: true, label: 'CLOSED (Cutoff 23:15)', color: 'text-red-500', canStaffUnlock: true };
          }
          return { locked: false, label: 'OPEN FOR TOMORROW', color: 'text-green-600', canStaffUnlock: false };
      }

      return { locked: false, label: 'OPEN (Pre-order)', color: 'text-blue-600', canStaffUnlock: false }; 
  };

  const status = getRestrictionStatus();
  const restricted = status.locked && !isOverrideMode;

  const handleRoomClick = (room: RoomConfig) => {
    setSelectedRoom(room);
    if (!isGuestMode) setLanguage('zh');
  };

  const handleGuestRoomSelect = (roomId: string) => {
      const room = ALL_ROOMS.find(r => r.id === roomId);
      if (room) {
          const today = getToday();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          setSelectedDate(tomorrow);
          setSelectedRoom(room);
      }
  };

  const checkBreakfastPermission = (roomId: string): boolean => {
     const order = currentDayOrders[roomId];
     return order?.hasBreakfast === true;
  };

  const handleSaveOrder = async (order: RoomOrder) => {
    let saveDateKey = dateKey;
    if (isGuestMode) {
        const today = getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        saveDateKey = formatDateKey(tomorrow);
    }
    
    try {
        if (saveDateKey === dateKey) {
            setCurrentDayOrders(prev => ({ ...prev, [order.roomId]: order }));
        }
        await saveOrderToFirebase(saveDateKey, order);
    } catch (error: any) {
        console.error("Save Order Error:", error);
        if (error.code === 'permission-denied') {
            setDbError('permission-denied');
        }
    }
  };

  const handleSaveSettings = async (settings: AvailabilitySettings) => {
      try {
          setAvailabilitySettings(settings);
          await saveSettingsToFirebase(settings);
      } catch (error: any) {
          console.error("Save Settings Error:", error);
          if (error.code === 'permission-denied') {
              setDbError('permission-denied');
          }
      }
  };

  const handleToggleBreakfast = async (roomId: string) => {
      if (restricted) return;
      const existingOrder = currentDayOrders[roomId];
      const newStatus = !(existingOrder?.hasBreakfast);
      const updatedOrder: RoomOrder = existingOrder 
          ? { ...existingOrder, hasBreakfast: newStatus }
          : { roomId, orderSets: [], call7am: false, call8am: false, isCompleted: false, hasBreakfast: true };
      
      try {
          setCurrentDayOrders(prev => ({ ...prev, [roomId]: updatedOrder }));
          await saveOrderToFirebase(dateKey, updatedOrder);
      } catch (error: any) {
          if (error.code === 'permission-denied') {
              setDbError('permission-denied');
          }
      }
  };

  const completedCount = Object.values(currentDayOrders).filter((o: RoomOrder) => o.isCompleted).length;
  const progress = Math.round((completedCount / ALL_ROOMS.length) * 100);

  const LangBtn = ({ lang, label }: { lang: Language, label: string }) => (
    <button onClick={() => setLanguage(lang)} className={`px-2 py-1 text-xs rounded-md border ${language === lang ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>{label}</button>
  );

  return (
    <div className={`min-h-screen pb-20 ${isGuestMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      
      {/* Database Permission Error Overlay */}
      {dbError === 'permission-denied' && (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-red-50 p-8 rounded-3xl border-2 border-red-200 max-w-xl shadow-2xl">
                  <ShieldAlert className="w-20 h-20 text-red-600 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">資料庫存取權限錯誤</h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                      Firebase 資料庫拒絕了存取請求。這通常是因為 <strong>Firestore Security Rules</strong> 尚未設定為允許讀寫。<br/>
                      <span className="text-sm mt-2 block font-medium bg-red-100 text-red-800 p-2 rounded">
                          錯誤代碼: Missing or insufficient permissions.
                      </span>
                  </p>
                  
                  <div className="bg-gray-900 text-left p-4 rounded-xl mb-8 overflow-x-auto">
                      <p className="text-blue-400 text-xs mb-2 font-mono">// 請在 Firebase Console -> Firestore -> Rules 貼上：</p>
                      <pre className="text-white text-xs font-mono">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                      </pre>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a 
                        href="https://console.firebase.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                      >
                          前往 Firebase 控制台 <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                      <button 
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all"
                      >
                          重新整理網頁 <RefreshCw className="w-4 h-4 ml-2" />
                      </button>
                  </div>
                  <p className="mt-6 text-xs text-gray-400 italic">完成修改並點擊 Publish 後，請重新整理此頁面。</p>
              </div>
          </div>
      )}

      {isGuestMode && !selectedRoom && (
          <GuestView 
            rooms={ALL_ROOMS} 
            onRoomSelect={handleGuestRoomSelect} 
            onExit={() => setShowLoginModal(true)}
            currentLanguage={language}
            onLanguageChange={setLanguage}
            checkPermission={checkBreakfastPermission}
          />
      )}

      {!isGuestMode && (
         <>
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40 print:hidden">
              <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Logo & Stats */}
                <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
                  <div className="flex items-center space-x-3">
                      <img src="https://www.eastin-taipei.com.tw/images/logo.png" alt="Eastin Taipei" className="h-10 w-auto object-contain"/>
                      <div>
                          <div className="flex items-center space-x-2">
                              <h1 className="text-sm md:text-xl font-bold text-gray-800 uppercase leading-tight">EASTIN TAIPEI<br/><span className="text-blue-600">BREAKFAST</span></h1>
                              <button onClick={() => setIsGuestMode(!isGuestMode)} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors ml-2"><Monitor className="w-4 h-4" /></button>
                          </div>
                      </div>
                  </div>
                  <div className="flex md:hidden space-x-1"><LangBtn lang="zh" label="中" /><LangBtn lang="en" label="EN" /></div>
                </div>

                {/* Date Picker */}
                <div className="flex items-center bg-gray-100 rounded-full p-1 shadow-inner order-last md:order-none w-full md:w-auto justify-between md:justify-center relative">
                    <button onClick={() => handleDateChange(-1)} disabled={selectedDate.getTime() <= getToday().getTime()} className="p-2 rounded-full hover:bg-white disabled:opacity-30 transition-colors text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
                    <div className="flex items-center px-4 space-x-2 justify-center flex-1 md:flex-initial">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-gray-700 text-sm md:text-base whitespace-nowrap">{getDateLabel(selectedDate)}</span>
                    </div>
                    <button onClick={() => handleDateChange(1)} disabled={selectedDate.getTime() >= (getToday().getTime() + 7 * 86400000)} className="p-2 rounded-full hover:bg-white disabled:opacity-30 transition-colors text-gray-600"><ChevronRight className="w-5 h-5" /></button>
                    {status.canStaffUnlock && status.locked && (
                         <button onClick={() => setIsOverrideMode(!isOverrideMode)} className={`ml-3 flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${isOverrideMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'}`}>
                             {isOverrideMode ? <Unlock className="w-3 h-3 mr-1" /> : <PenTool className="w-3 h-3 mr-1" />}
                             {isOverrideMode ? 'Editing' : '修正'}
                         </button>
                    )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2 md:space-x-3 w-full md:w-auto justify-end">
                   <div className="hidden md:flex space-x-1 mr-2"><LangBtn lang="zh" label="中" /><LangBtn lang="en" label="EN" /></div>
                   <button onClick={() => setShowMenuSettings(true)} className={`flex items-center justify-center p-2 border rounded-lg transition-colors shadow-sm ${availabilitySettings.isMcDonaldsClosed || availabilitySettings.isChineseClosed || availabilitySettings.unavailableItems.length > 0 ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}><Store className="w-4 h-4" /></button>
                   <button onClick={() => setShowPreview(true)} className="flex items-center justify-center space-x-1 md:space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold"><Printer className="w-4 h-4" /><span className="hidden sm:inline">Print / Export</span><span className="sm:hidden">Print</span></button>
                </div>
              </div>

              {/* Status Bar */}
              <div className="bg-gray-50 border-t border-gray-100 px-4 py-1 flex justify-between items-center text-xs text-gray-500 overflow-x-auto">
                  <div className="flex items-center space-x-3">
                      <span>Ordered: <strong className="text-gray-800">{completedCount}</strong> / {ALL_ROOMS.length}</span>
                      <div className="flex space-x-1">
                          {availabilitySettings.isMcDonaldsClosed && (<span className="bg-red-600 text-white px-1.5 py-0.5 rounded font-bold flex items-center shadow-sm"><AlertTriangle className="w-3 h-3 mr-1"/> 麥當勞公休</span>)}
                          {availabilitySettings.isChineseClosed && (<span className="bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold flex items-center shadow-sm"><AlertTriangle className="w-3 h-3 mr-1"/> 老漿家公休</span>)}
                          {availabilitySettings.unavailableItems.length > 0 && (<span className="bg-yellow-500 text-white px-1.5 py-0.5 rounded font-bold flex items-center shadow-sm"><AlertTriangle className="w-3 h-3 mr-1"/> 特定餐點缺貨</span>)}
                      </div>
                  </div>
                  <span className={`${isOverrideMode ? 'text-red-600' : status.color} font-bold flex items-center ml-2 flex-shrink-0`}>
                      {restricted ? <Ban className="w-3 h-3 mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                      {isOverrideMode ? 'STAFF OVERRIDE ACTIVE' : status.label}
                  </span>
              </div>
              <div className="h-1 w-full bg-gray-100"><div className="h-1 bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 print:hidden">
              <RoomGrid rooms={ALL_ROOMS} orders={currentDayOrders} onRoomClick={handleRoomClick} onToggleBreakfast={handleToggleBreakfast}/>
            </main>
         </>
      )}

      {selectedRoom && (
        <OrderModal 
          room={selectedRoom} 
          initialOrder={currentDayOrders[selectedRoom.id]}
          allOrders={currentDayOrders}
          currentLanguage={language}
          onLanguageChange={setLanguage}
          readOnly={restricted}
          readOnlyLabel={isOverrideMode ? undefined : status.label}
          requireStaffName={!isGuestMode}
          onSave={handleSaveOrder} 
          onClose={() => setSelectedRoom(null)} 
          availabilitySettings={availabilitySettings}
        />
      )}

      {showMenuSettings && (
          <MenuSettingsModal 
              settings={availabilitySettings}
              onSave={handleSaveSettings}
              onClose={() => setShowMenuSettings(false)}
          />
      )}

      {showPreview && (
        <PrintPreviewModal 
          orders={currentDayOrders}
          dateKey={dateKey}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showLoginModal && (
        <LoginModal 
            onSuccess={() => { setShowLoginModal(false); setIsGuestMode(false); }}
            onCancel={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default App;
