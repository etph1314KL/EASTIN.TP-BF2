
import React, { useState, useEffect } from 'react';
import { MenuCategory, RoomConfig, RoomOrder, OrderSet, Language, MenuItem, AvailabilitySettings } from '../types';
import { WESTERN_MAINS, WESTERN_DRINKS, CHINESE_MAINS, CHINESE_DRINKS, ALL_MENU_ITEMS, UI_TEXT } from '../constants';
import { X, Plus, Trash2, Utensils, Phone, AlertCircle, MessageSquare, Link, ArrowRight, Ban, Ticket, Lock, Image as ImageIcon, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface OrderModalProps {
  room: RoomConfig;
  initialOrder?: RoomOrder;
  allOrders?: Record<string, RoomOrder>; // Need full data for reverse lookup of merged rooms
  currentLanguage: Language;
  onLanguageChange?: (lang: Language) => void;
  readOnly?: boolean;
  readOnlyLabel?: string;
  requireStaffName?: boolean;
  onSave: (order: RoomOrder) => void;
  onClose: () => void;
  availabilitySettings?: AvailabilitySettings;
}

const OrderModal: React.FC<OrderModalProps> = ({ 
    room, 
    initialOrder, 
    allOrders = {}, 
    currentLanguage, 
    onLanguageChange, 
    readOnly = false, 
    readOnlyLabel, 
    requireStaffName = false,
    onSave, 
    onClose,
    availabilitySettings = { isMcDonaldsClosed: false, isChineseClosed: false, unavailableItems: [] }
}) => {
  const [sets, setSets] = useState<OrderSet[]>([]);
  const [call7am, setCall7am] = useState(false);
  const [call8am, setCall8am] = useState(false);
  const [roomNote, setRoomNote] = useState('');
  
  // Combine Room Logic
  const [isCombined, setIsCombined] = useState(false);
  const [combinedRooms, setCombinedRooms] = useState<string[]>([]);
  const [combineInput, setCombineInput] = useState('');
  
  // Reverse Combine Logic (Rooms that added THIS room)
  const [linkedByOthers, setLinkedByOthers] = useState<string[]>([]);

  // Special Status
  const [noBreakfast, setNoBreakfast] = useState(false);
  const [isVoucher, setIsVoucher] = useState(false);

  // Alert State
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);
  const [showVoucherAlert, setShowVoucherAlert] = useState(false);

  // Staff Name Entry State
  const [showStaffInput, setShowStaffInput] = useState(false);
  const [staffName, setStaffName] = useState('');

  // Menu Image Viewer State
  const [showMenuViewer, setShowMenuViewer] = useState(false);
  const [currentMenuIndex, setCurrentMenuIndex] = useState(0);

  // Helper to identify Staff Mode
  const isStaff = requireStaffName;

  const MENU_IMAGES = [
      { 
          labelKey: 'westernLabel', 
          src: 'https://www.eastin-taipei.com.tw/upload/fac_b/253a22bcfaad09d46a1a27b26d41f19a.jpg' 
      },
      { 
          labelKey: 'chineseLabel', 
          src: 'https://www.eastin-taipei.com.tw/upload/fac_b/3662c2875fb2a3c7e0c56c204b13dd0c.jpg' 
      }
  ];

  // Initialize state
  useEffect(() => {
    if (initialOrder && initialOrder.orderSets.length > 0) {
      setSets(initialOrder.orderSets);
      setCall7am(initialOrder.call7am);
      setCall8am(initialOrder.call8am);
      setRoomNote(initialOrder.note || '');
      setNoBreakfast(initialOrder.noBreakfast || false);
      setIsVoucher(initialOrder.mcdonaldsVoucher || false);
      setStaffName(initialOrder.staffName || '');

      if (initialOrder.combineWithRooms && initialOrder.combineWithRooms.length > 0) {
          setIsCombined(true);
          setCombinedRooms(initialOrder.combineWithRooms);
      } else {
          setIsCombined(false);
          setCombinedRooms([]);
      }
    } else {
      const defaultSets: OrderSet[] = Array.from({ length: room.defaultQuota }).map((_, i) => ({
        id: `default-${i}`,
        mainId: null,
        drinkId: null,
        isAddOn: false
      }));
      setSets(defaultSets);
      setRoomNote('');
      setIsCombined(false);
      setCombinedRooms([]);
      setNoBreakfast(false);
      setIsVoucher(false);
      setStaffName('');
    }

    // Find rooms that have combined WITH this room
    const reverseLinks: string[] = [];
    Object.values(allOrders).forEach((o: RoomOrder) => {
        if (o.roomId !== room.id && o.combineWithRooms && o.combineWithRooms.includes(room.id)) {
            reverseLinks.push(o.roomId);
        }
    });
    setLinkedByOthers(reverseLinks);

  }, [initialOrder, room.defaultQuota, allOrders, room.id]);

  // Helper to build Order Object for Saves
  const buildOrderData = (currentSets: OrderSet[], isCompletedStatus: boolean): RoomOrder => {
      const finalSets = (noBreakfast || isVoucher) ? [] : currentSets;
      
      const hasW = finalSets.some(s => {
          const m = ALL_MENU_ITEMS.find(i => i.id === s.mainId);
          const d = ALL_MENU_ITEMS.find(i => i.id === s.drinkId);
          return m?.category === MenuCategory.WESTERN || d?.category === MenuCategory.WESTERN;
      });

      const hasC = finalSets.some(s => {
          const m = ALL_MENU_ITEMS.find(i => i.id === s.mainId);
          const d = ALL_MENU_ITEMS.find(i => i.id === s.drinkId);
          return m?.category === MenuCategory.CHINESE || d?.category === MenuCategory.CHINESE;
      });

      return {
          roomId: room.id,
          orderSets: finalSets,
          call7am: (noBreakfast || isVoucher) ? false : (hasW ? call7am : false),
          call8am: (noBreakfast || isVoucher) ? false : (hasC ? call8am : false),
          isCompleted: isCompletedStatus, // Dynamic status
          note: roomNote,
          combineWithRooms: isCombined && combinedRooms.length > 0 ? combinedRooms : undefined,
          noBreakfast: noBreakfast,
          mcdonaldsVoucher: isVoucher,
          staffName: staffName || undefined,
          hasBreakfast: initialOrder?.hasBreakfast ?? true
      };
  };

  const updateSet = (id: string, field: keyof OrderSet, value: any) => {
    if (readOnly) return;
    setSets(prev => prev.map(s => {
      if (s.id !== id) return s;
      
      const newSet = { ...s, [field]: value };
      
      if (field === 'mainId' && value) {
        const main = ALL_MENU_ITEMS.find(i => i.id === value);
        const currentDrink = ALL_MENU_ITEMS.find(i => i.id === s.drinkId);
        
        if (main && currentDrink && main.category !== currentDrink.category) {
            newSet.drinkId = null; 
            newSet.drinkSugar = undefined;
        }
      }
      
      if (field === 'drinkId' && value) {
          const drink = ALL_MENU_ITEMS.find(i => i.id === value);
          const currentMain = ALL_MENU_ITEMS.find(i => i.id === s.mainId);

          if (drink && currentMain && drink.category !== currentMain.category) {
              newSet.mainId = null;
          }
      }

      return newSet;
    }));
  };

  const handleAddSetClick = () => {
    if (readOnly) return;
    
    // Logic Changed:
    // If Staff: Directly add the set.
    // If Guest: Show alert ONLY. Do NOT add the set.
    if (isStaff) {
        confirmAddSet();
    } else {
        setShowPaymentAlert(true);
    }
  };

  const confirmAddSet = () => {
    const newSet: OrderSet = {
      id: `addon-${Date.now()}`,
      mainId: null,
      drinkId: null,
      isAddOn: true
    };
    const newSets = [...sets, newSet];
    setSets(newSets);
    setShowPaymentAlert(false);

    // STAFF: Auto-save immediately as Incomplete (Draft)
    if (isStaff) {
        onSave(buildOrderData(newSets, false));
    }
  };

  const removeSet = (id: string) => {
    if (readOnly) return;
    
    // Only Staff can delete
    if (!isStaff) return;

    const newSets = sets.filter(s => s.id !== id);
    setSets(newSets);

    // STAFF: Auto-save immediately as Incomplete (Draft)
    if (isStaff) {
        onSave(buildOrderData(newSets, false));
    }
  };

  // Combine Room Handlers
  const handleAddCombinedRoom = () => {
      if (readOnly) return;
      const trimmed = combineInput.trim();
      if (trimmed.length === 3 && !combinedRooms.includes(trimmed) && trimmed !== room.id) {
          setCombinedRooms(prev => [...prev, trimmed]);
          setCombineInput('');
      }
  };

  const handleRemoveCombinedRoom = (roomToRemove: string) => {
      if (readOnly) return;
      setCombinedRooms(prev => prev.filter(r => r !== roomToRemove));
  };

  const handleKeyDownCombined = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          handleAddCombinedRoom();
      }
  };

  // Menu Image Handlers
  const handleNextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentMenuIndex((prev) => (prev + 1) % MENU_IMAGES.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentMenuIndex((prev) => (prev === 0 ? MENU_IMAGES.length - 1 : prev - 1));
  };

  // Special Status Handlers
  const handleNoBreakfastChange = (checked: boolean) => {
    if (readOnly) return;
    setNoBreakfast(checked);
    if (checked) {
        setIsVoucher(false);
    }
  };

  const handleVoucherChange = (checked: boolean) => {
    if (readOnly) return;
    setIsVoucher(checked);
    if (checked) {
        setNoBreakfast(false);
        // Show alert if it's Guest Mode (implied by !requireStaffName)
        if (!requireStaffName) {
            setShowVoucherAlert(true);
        }
    }
  };

  // --- Availability Logic Helpers ---
  const isItemDisabled = (item: MenuItem): boolean => {
      if (item.category === MenuCategory.WESTERN && availabilitySettings.isMcDonaldsClosed) return true;
      if (item.category === MenuCategory.CHINESE && availabilitySettings.isChineseClosed) return true;
      if (availabilitySettings.unavailableItems.includes(item.id)) return true;
      return false;
  };

  const getAvailableDrinks = (setId: string) => {
    const set = sets.find(s => s.id === setId);
    if (!set || !set.mainId) return [...WESTERN_DRINKS, ...CHINESE_DRINKS]; 
    
    const main = ALL_MENU_ITEMS.find(m => m.id === set.mainId);
    if (!main) return [...WESTERN_DRINKS, ...CHINESE_DRINKS];

    return main.category === MenuCategory.WESTERN ? WESTERN_DRINKS : CHINESE_DRINKS;
  };

  const getAvailableMains = (setId: string) => {
      const set = sets.find(s => s.id === setId);
      if (!set || !set.drinkId) return [...WESTERN_MAINS, ...CHINESE_MAINS];

      const drink = ALL_MENU_ITEMS.find(d => d.id === set.drinkId);
      if(!drink) return [...WESTERN_MAINS, ...CHINESE_MAINS];

      return drink.category === MenuCategory.WESTERN ? WESTERN_MAINS : CHINESE_MAINS;
  }

  const hasWestern = sets.some(s => {
      const m = ALL_MENU_ITEMS.find(i => i.id === s.mainId);
      const d = ALL_MENU_ITEMS.find(i => i.id === s.drinkId);
      return m?.category === MenuCategory.WESTERN || d?.category === MenuCategory.WESTERN;
  });

  const hasChinese = sets.some(s => {
      const m = ALL_MENU_ITEMS.find(i => i.id === s.mainId);
      const d = ALL_MENU_ITEMS.find(i => i.id === s.drinkId);
      return m?.category === MenuCategory.CHINESE || d?.category === MenuCategory.CHINESE;
  });

  const handlePreSave = () => {
      if (readOnly) return;
      if (requireStaffName) {
          setShowStaffInput(true);
      } else {
          executeSave(null); 
      }
  };

  const executeSave = (finalStaffName: string | null) => {
    // FIX: Force isCompleted = true when "Confirm" is clicked
    const orderData = buildOrderData(sets, true);
    if (finalStaffName) orderData.staffName = finalStaffName;

    onSave(orderData);
    onClose();
  };

  const handleClear = () => {
      if (readOnly) return;
      const defaultSets: OrderSet[] = Array.from({ length: room.defaultQuota }).map((_, i) => ({
        id: `default-${i}`,
        mainId: null,
        drinkId: null,
        isAddOn: false
      }));

      // FIX: Preserve existing hasBreakfast status on clear
      const preservedHasBreakfast = initialOrder?.hasBreakfast ?? true;

      onSave({
          roomId: room.id,
          orderSets: defaultSets,
          call7am: false,
          call8am: false,
          isCompleted: false, 
          note: '',
          combineWithRooms: undefined,
          noBreakfast: false,
          mcdonaldsVoucher: false,
          staffName: undefined,
          hasBreakfast: preservedHasBreakfast
      });
      onClose();
  }

  const t = (key: string) => UI_TEXT[key][currentLanguage];
  
  const getItemName = (item: MenuItem) => {
      let name = currentLanguage === 'zh' ? item.name : (item.translations[currentLanguage as keyof typeof item.translations] || item.name);
      if (isItemDisabled(item) && !availabilitySettings.isMcDonaldsClosed && !availabilitySettings.isChineseClosed) {
          name += ` ${t('itemUnavailable')}`;
      }
      return name;
  };

  const isFoodDisabled = noBreakfast || isVoucher;

  const LangSwitcher = () => {
      if (!onLanguageChange) return null;
      const languages: Language[] = !requireStaffName 
          ? ['zh', 'en', 'jp', 'ko']
          : ['zh', 'en'];

      return (
          <div className="flex space-x-1 mr-4 bg-gray-100 p-1 rounded-lg">
              {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => onLanguageChange(lang)}
                    className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${currentLanguage === lang ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                  >
                      {lang === 'zh' ? '中' : lang === 'en' ? 'EN' : lang === 'jp' ? '日' : '韓'}
                  </button>
              ))}
          </div>
      )
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {/* (Overlays Code... ) */}
      {showMenuViewer && (
          <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4 md:p-10" onClick={() => setShowMenuViewer(false)}>
              <button onClick={() => setShowMenuViewer(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[90]"><X className="w-8 h-8" /></button>
              <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                  <h3 className="text-white text-2xl font-bold mb-4 bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm">{t(MENU_IMAGES[currentMenuIndex].labelKey)}</h3>
                  <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
                       <img src={MENU_IMAGES[currentMenuIndex].src} alt="Menu" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"/>
                       <button onClick={handlePrevImage} className="absolute left-2 md:left-4 p-3 bg-black/40 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-all"><ChevronLeft className="w-8 h-8" /></button>
                       <button onClick={handleNextImage} className="absolute right-2 md:right-4 p-3 bg-black/40 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-all"><ChevronRight className="w-8 h-8" /></button>
                  </div>
                  <div className="flex space-x-2 mt-6">
                      {MENU_IMAGES.map((_, idx) => (
                          <div key={idx} className={`w-3 h-3 rounded-full transition-all ${idx === currentMenuIndex ? 'bg-blue-500 scale-125' : 'bg-gray-500'}`}/>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* ReadOnly Banner */}
      {readOnly && (
         <div className="absolute top-0 left-0 right-0 z-[60] flex justify-center pt-10 pointer-events-none">
             <div className="bg-red-600 text-white px-6 py-2 rounded-full shadow-xl font-bold flex items-center animate-bounce pointer-events-auto">
                 <Lock className="w-4 h-4 mr-2" />
                 {readOnlyLabel || 'Ordering Locked'}
             </div>
         </div>
      )}

      {/* Payment Alert */}
      {showPaymentAlert && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4" onClick={() => setShowPaymentAlert(false)}>
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <AlertCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{t('paymentAlertMsg')}</h3>
                      <button onClick={() => setShowPaymentAlert(false)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors w-full">{t('iUnderstand')}</button>
                  </div>
              </div>
          </div>
      )}

      {/* Voucher Alert for Guests */}
      {showVoucherAlert && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => {}}>
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 flex flex-col items-center text-center">
                   <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Ticket className="w-8 h-8 text-yellow-600" />
                   </div>
                   <h3 className="text-lg font-bold text-gray-800 mb-2">{t('voucher')}</h3>
                   <p className="text-gray-600 font-medium mb-6 leading-relaxed">
                       {t('voucherAlertMsg')}
                   </p>
                   <button
                      onClick={() => setShowVoucherAlert(false)}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                   >
                      {t('iUnderstand')}
                   </button>
              </div>
          </div>
      )}

      {/* Staff Input */}
      {showStaffInput && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95">
                  <div className="flex flex-col items-center">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">{t('staffNameLabel')}</h3>
                      <input type="text" autoFocus placeholder={t('enterName')} className="w-full p-3 border rounded-lg text-center text-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none" value={staffName} onChange={(e) => setStaffName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && staffName.trim()) { executeSave(staffName); }}}/>
                      <div className="flex gap-3 w-full">
                           <button onClick={() => setShowStaffInput(false)} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors">{t('cancel')}</button>
                          <button onClick={() => executeSave(staffName)} disabled={!staffName.trim()} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">{t('confirm')}</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-50">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Room {room.id} <span className="text-gray-400 font-normal text-lg">| {room.type}</span></h2>
                {readOnly && <span className="text-red-500 text-xs font-bold flex items-center mt-1"><Lock className="w-3 h-3 mr-1"/> READ ONLY MODE</span>}
            </div>
            <button onClick={() => setShowMenuViewer(true)} className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-200"><ImageIcon className="w-4 h-4 mr-1.5" />{t('viewMenu')}</button>
          </div>
          <div className="flex items-center"><LangSwitcher /><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {(availabilitySettings.isMcDonaldsClosed || availabilitySettings.isChineseClosed) && (
              <div className="space-y-2">
                  {availabilitySettings.isMcDonaldsClosed && (<div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-center font-bold"><AlertTriangle className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />{t('mcdonaldsClosedMsg')}</div>)}
                  {availabilitySettings.isChineseClosed && (<div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg flex items-center font-bold"><AlertTriangle className="w-5 h-5 mr-2 text-orange-600 flex-shrink-0" />{t('chineseClosedMsg')}</div>)}
              </div>
          )}

          {/* Room Note */}
          <div className={`bg-gray-50 p-3 rounded-lg border border-gray-200 ${readOnly ? 'opacity-70' : ''}`}>
            <div className="flex items-center text-gray-600 mb-2">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{t('noteLabel')}</span>
            </div>
            <textarea className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 min-h-[60px]" placeholder={t('roomNotePlaceholder')} value={roomNote} onChange={(e) => setRoomNote(e.target.value)} disabled={readOnly}/>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-2 border-t border-gray-200">
                <label className={`flex items-center ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input type="checkbox" className="w-4 h-4 text-red-600 rounded mr-2" checked={noBreakfast} onChange={(e) => handleNoBreakfastChange(e.target.checked)} disabled={readOnly}/>
                    <span className={`text-sm font-bold flex items-center ${noBreakfast ? 'text-red-600' : 'text-gray-600'}`}><Ban className="w-4 h-4 mr-1" />{t('noBreakfast')}</span>
                </label>
                <label className={`flex items-center ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input type="checkbox" className="w-4 h-4 text-gray-600 rounded mr-2" checked={isVoucher} onChange={(e) => handleVoucherChange(e.target.checked)} disabled={readOnly}/>
                    <span className={`text-sm font-bold flex items-center ${isVoucher ? 'text-gray-700' : 'text-gray-600'}`}><Ticket className="w-4 h-4 mr-1" />{t('voucher')}</span>
                </label>
            </div>
          </div>

          {/* Combined Room Section (Improved) */}
          {!isFoodDisabled && (
          <div className={`bg-purple-50 p-3 rounded-lg border border-purple-200 ${readOnly ? 'opacity-70' : ''}`}>
                 <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                     <label className={`flex items-center ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'} mb-2 sm:mb-0 mt-1`}>
                         <input type="checkbox" className="w-4 h-4 text-purple-600 rounded mr-2" checked={isCombined} onChange={(e) => !readOnly && setIsCombined(e.target.checked)} disabled={readOnly}/>
                         <span className="text-sm font-medium text-purple-800 flex items-center"><Link className="w-4 h-4 mr-1" />{t('combineLabel')}</span>
                     </label>
                     
                     {isCombined && (
                         <div className="flex flex-col space-y-2 flex-1 ml-0 sm:ml-4">
                             <div className="flex items-center space-x-2">
                                 <input type="text" className="p-1.5 border border-purple-300 rounded text-sm w-24 text-center focus:outline-none focus:border-purple-500" placeholder={t('roomNoPlaceholder')} maxLength={3} value={combineInput} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); setCombineInput(val); }} onKeyDown={handleKeyDownCombined} disabled={readOnly}/>
                                 <button onClick={handleAddCombinedRoom} disabled={readOnly} className="p-1.5 bg-purple-200 text-purple-700 rounded hover:bg-purple-300 transition-colors disabled:opacity-50"><ArrowRight className="w-4 h-4" /></button>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                 {combinedRooms.map(r => (
                                     <span key={r} className="inline-flex items-center px-2 py-1 rounded bg-purple-600 text-white text-xs font-bold animate-in zoom-in">{r}<button onClick={() => handleRemoveCombinedRoom(r)} disabled={readOnly} className="ml-1.5 hover:text-purple-200 disabled:hidden"><X className="w-3 h-3" /></button></span>
                                 ))}
                             </div>
                         </div>
                     )}
                 </div>

                 {/* New: Display if OTHER rooms linked to this one */}
                 {linkedByOthers.length > 0 && (
                     <div className="mt-3 pt-2 border-t border-purple-200 text-xs text-purple-800 font-bold flex items-start animate-pulse">
                         <Link className="w-3 h-3 mr-1 mt-0.5" />
                         <span>Linked by other rooms: {linkedByOthers.join(', ')} (Deliver together)</span>
                     </div>
                 )}
            </div>
          )}

          {/* Order Sets */}
          {isFoodDisabled ? (
              <div className={`p-8 rounded-lg text-center border-2 border-dashed ${noBreakfast ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
                  {noBreakfast && <Ban className="w-12 h-12 mx-auto mb-3 opacity-20" />}
                  {isVoucher && <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />}
                  <h3 className="text-lg font-bold">{noBreakfast ? t('noBreakfast') : t('voucher')}</h3>
                  <p className="text-sm opacity-70 mt-1">{t('mealSet')} selection is disabled.</p>
              </div>
          ) : (
             <>
                {sets.map((set, index) => {
                    const availableMains = getAvailableMains(set.id);
                    const availableDrinks = getAvailableDrinks(set.id);
                    const selectedDrink = ALL_MENU_ITEMS.find(d => d.id === set.drinkId);
                    const selectedMain = ALL_MENU_ITEMS.find(m => m.id === set.mainId);

                    return (
                        <div key={set.id} className={`p-4 rounded-lg border ${set.isAddOn ? 'bg-blue-50/40 border-blue-200' : 'bg-gray-50/50 border-gray-200'} ${readOnly ? 'opacity-80' : ''}`}>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                    <span className="font-semibold text-gray-700 flex items-center mr-3">
                                        {set.isAddOn ? <Plus className="w-4 h-4 mr-1"/> : <Utensils className="w-4 h-4 mr-1"/>}
                                        {set.isAddOn ? `${t('addOnLabel')} (Add-on)` : `${t('mealSet')} ${index + 1}`}
                                    </span>
                                </div>
                                {!readOnly && isStaff && (<button onClick={() => removeSet(set.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('mainTitle')}</label>
                                    <select className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100" value={set.mainId || 'none'} onChange={(e) => updateSet(set.id, 'mainId', e.target.value === 'none' ? null : e.target.value)} disabled={readOnly}>
                                        <option value="">{t('selectMain')}</option>
                                        <option value="none">{t('none')}</option>
                                        <optgroup label={availabilitySettings.isMcDonaldsClosed ? `${t('westernLabel')} (${t('mcdonaldsClosedMsg')})` : t('westernLabel')}>
                                            {WESTERN_MAINS.map(m => (<option key={m.id} value={m.id} disabled={!availableMains.find(am => am.id === m.id) || isItemDisabled(m)}>{m.code} {getItemName(m)}</option>))}
                                        </optgroup>
                                        <optgroup label={availabilitySettings.isChineseClosed ? `${t('chineseLabel')} (${t('chineseClosedMsg')})` : t('chineseLabel')}>
                                            {CHINESE_MAINS.map(m => (<option key={m.id} value={m.id} disabled={!availableMains.find(am => am.id === m.id) || isItemDisabled(m)}>{m.code} {getItemName(m)}</option>))}
                                        </optgroup>
                                    </select>
                                    {selectedMain?.category === MenuCategory.WESTERN && (<p className="text-[11px] text-orange-600 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> {t('hashBrownNote')}</p>)}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('drinkTitle')}</label>
                                    <select className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100" value={set.drinkId || 'none'} onChange={(e) => updateSet(set.id, 'drinkId', e.target.value === 'none' ? null : e.target.value)} disabled={readOnly}>
                                        <option value="">{t('selectDrink')}</option>
                                        <option value="none">{t('none')}</option>
                                        <optgroup label="Western">{WESTERN_DRINKS.map(d => (<option key={d.id} value={d.id} disabled={!availableDrinks.find(ad => ad.id === d.id) || isItemDisabled(d)}>{d.code} {getItemName(d)}</option>))}</optgroup>
                                        <optgroup label="Chinese">{CHINESE_DRINKS.map(d => (<option key={d.id} value={d.id} disabled={!availableDrinks.find(ad => ad.id === d.id) || isItemDisabled(d)}>{d.code} {getItemName(d)}</option>))}</optgroup>
                                    </select>
                                    {selectedDrink?.hasSugarOption && (
                                        <div className="mt-2 flex space-x-4 bg-white p-2 rounded border border-gray-100">
                                            <label className={`flex items-center space-x-1 ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}><input type="radio" name={`sugar-${set.id}`} checked={set.drinkSugar !== 'No Sugar'} onChange={() => updateSet(set.id, 'drinkSugar', 'Normal')} disabled={readOnly}/><span className="text-xs">{t('normalSugar')}</span></label>
                                            <label className={`flex items-center space-x-1 ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}><input type="radio" name={`sugar-${set.id}`} checked={set.drinkSugar === 'No Sugar'} onChange={() => updateSet(set.id, 'drinkSugar', 'No Sugar')} disabled={readOnly}/><span className="text-xs text-red-600 font-bold">{t('noSugar')}</span></label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="flex flex-col items-center space-y-2">
                    <button onClick={handleAddSetClick} disabled={readOnly} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex justify-center items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-500"><Plus className="w-5 h-5 mr-2" /> {t('addOnBtn')}</button>
                    <span className="text-xs text-blue-600 font-medium">{t('addOnPrice')}</span>
                </div>

                <div className={`bg-yellow-50/50 p-4 rounded-lg border border-yellow-200 ${readOnly ? 'opacity-70' : ''}`}>
                    <h3 className="font-semibold text-yellow-800 mb-2 flex items-center"><Phone className="w-4 h-4 mr-2"/> {t('callTitle')}</h3>
                    <div className="flex space-x-6">
                        <label className={`flex items-center space-x-2 ${(readOnly || !hasWestern) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input type="checkbox" className="w-5 h-5 rounded text-blue-600" checked={call7am} onChange={(e) => setCall7am(e.target.checked)} disabled={readOnly || !hasWestern}/>
                            <div><span className="text-sm font-medium block">07:00</span><span className="text-[10px] text-gray-500">{t('mcdonalds')}</span></div>
                        </label>
                        <label className={`flex items-center space-x-2 ${(readOnly || !hasChinese) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input type="checkbox" className="w-5 h-5 rounded text-blue-600" checked={call8am} onChange={(e) => setCall8am(e.target.checked)} disabled={readOnly || !hasChinese}/>
                            <div><span className="text-sm font-medium block">08:00</span><span className="text-[10px] text-gray-500">{t('chineseSimple')}</span></div>
                        </label>
                    </div>
                    <p className="text-xs text-yellow-700 mt-2 leading-relaxed">* {t('callNote')}</p>
                </div>
             </>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-between items-center">
          {!readOnly ? (<button onClick={handleClear} className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-semibold text-sm">{t('clear')}</button>) : (<div></div>)}
          <div className="space-x-3">
              <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">{readOnly ? 'Close' : t('cancel')}</button>
              {!readOnly && (<button onClick={handlePreSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors font-semibold">{t('confirm')}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
