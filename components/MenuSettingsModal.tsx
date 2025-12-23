
import React, { useState } from 'react';
import { AvailabilitySettings, MenuItem, MenuCategory } from '../types';
import { WESTERN_MAINS, WESTERN_DRINKS, CHINESE_MAINS, CHINESE_DRINKS } from '../constants';
import { X, Store, AlertTriangle, CheckSquare, Square } from 'lucide-react';

interface MenuSettingsModalProps {
    settings: AvailabilitySettings;
    onSave: (settings: AvailabilitySettings) => void;
    onClose: () => void;
}

const MenuSettingsModal: React.FC<MenuSettingsModalProps> = ({ settings, onSave, onClose }) => {
    // Local state for edits
    const [localSettings, setLocalSettings] = useState<AvailabilitySettings>(settings);
    const [showPartialList, setShowPartialList] = useState(false);

    const toggleMcDonalds = () => {
        setLocalSettings(prev => ({
            ...prev,
            isMcDonaldsClosed: !prev.isMcDonaldsClosed
        }));
    };

    const toggleChinese = () => {
        setLocalSettings(prev => ({
            ...prev,
            isChineseClosed: !prev.isChineseClosed
        }));
    };

    const togglePartial = () => {
        setShowPartialList(!showPartialList);
    };

    const toggleItemAvailability = (itemId: string) => {
        setLocalSettings(prev => {
            const currentList = prev.unavailableItems;
            if (currentList.includes(itemId)) {
                return { ...prev, unavailableItems: currentList.filter(id => id !== itemId) };
            } else {
                return { ...prev, unavailableItems: [...currentList, itemId] };
            }
        });
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    const renderItemGrid = (title: string, items: MenuItem[]) => (
        <div className="mb-4">
            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">{title}</h4>
            <div className="grid grid-cols-2 gap-2">
                {items.map(item => {
                    const isUnavailable = localSettings.unavailableItems.includes(item.id);
                    return (
                        <div 
                            key={item.id} 
                            onClick={() => toggleItemAvailability(item.id)}
                            className={`
                                p-2 rounded cursor-pointer border flex items-center transition-all
                                ${isUnavailable ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200 hover:border-blue-400'}
                            `}
                        >
                            <div className={`w-5 h-5 flex items-center justify-center rounded border mr-2 ${isUnavailable ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`}>
                                {isUnavailable && <X className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm ${isUnavailable ? 'text-red-600 font-bold line-through' : 'text-gray-700'}`}>
                                {item.code} {item.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-gray-800 text-white p-4 rounded-t-xl flex justify-between items-center">
                    <div className="flex items-center">
                        <Store className="w-6 h-6 mr-2" />
                        <h2 className="text-xl font-bold">餐點供應設定 (Menu Availability)</h2>
                    </div>
                    <button onClick={onClose} className="hover:bg-gray-700 p-2 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    
                    <div className="space-y-4 mb-6">
                        {/* 1. McDonald's Global Toggle */}
                        <div 
                            onClick={toggleMcDonalds}
                            className={`p-4 rounded-lg border-2 cursor-pointer flex items-center justify-between transition-all ${localSettings.isMcDonaldsClosed ? 'bg-red-100 border-red-500' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}
                        >
                            <div className="flex items-center">
                                <AlertTriangle className={`w-6 h-6 mr-3 ${localSettings.isMcDonaldsClosed ? 'text-red-600' : 'text-gray-400'}`} />
                                <div>
                                    <h3 className={`font-bold text-lg ${localSettings.isMcDonaldsClosed ? 'text-red-800' : 'text-gray-700'}`}>
                                        沒麥當勞 (No McDonald's)
                                    </h3>
                                    <p className="text-sm text-gray-500">勾選此項將顯示「麥當勞公休」並隱藏所有麥當勞餐點。</p>
                                </div>
                            </div>
                            {localSettings.isMcDonaldsClosed ? <CheckSquare className="w-8 h-8 text-red-600" /> : <Square className="w-8 h-8 text-gray-300" />}
                        </div>

                        {/* 2. Chinese Global Toggle */}
                        <div 
                            onClick={toggleChinese}
                            className={`p-4 rounded-lg border-2 cursor-pointer flex items-center justify-between transition-all ${localSettings.isChineseClosed ? 'bg-red-100 border-red-500' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}
                        >
                            <div className="flex items-center">
                                <AlertTriangle className={`w-6 h-6 mr-3 ${localSettings.isChineseClosed ? 'text-red-600' : 'text-gray-400'}`} />
                                <div>
                                    <h3 className={`font-bold text-lg ${localSettings.isChineseClosed ? 'text-red-800' : 'text-gray-700'}`}>
                                        沒老漿家 (No Chinese Traditional)
                                    </h3>
                                    <p className="text-sm text-gray-500">勾選此項將顯示「中式餐點公休」並隱藏所有中式餐點。</p>
                                </div>
                            </div>
                            {localSettings.isChineseClosed ? <CheckSquare className="w-8 h-8 text-red-600" /> : <Square className="w-8 h-8 text-gray-300" />}
                        </div>

                        {/* 3. Partial Items Toggle */}
                        <div 
                            onClick={togglePartial}
                            className={`p-4 rounded-lg border-2 cursor-pointer flex items-center justify-between transition-all ${showPartialList ? 'bg-orange-50 border-orange-400' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}
                        >
                            <div className="flex items-center">
                                <Store className={`w-6 h-6 mr-3 ${showPartialList ? 'text-orange-600' : 'text-gray-400'}`} />
                                <div>
                                    <h3 className={`font-bold text-lg ${showPartialList ? 'text-orange-800' : 'text-gray-700'}`}>
                                        沒部分餐點 (Partial Items Unavailable)
                                    </h3>
                                    <p className="text-sm text-gray-500">勾選此項可展開菜單，個別設定特定品項為「暫停供應」。</p>
                                </div>
                            </div>
                            {showPartialList ? <CheckSquare className="w-8 h-8 text-orange-600" /> : <Square className="w-8 h-8 text-gray-300" />}
                        </div>
                    </div>

                    {/* Detailed List for Partial Selection */}
                    {showPartialList && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
                            <h3 className="font-bold text-lg text-gray-800 mb-4 bg-orange-100 p-2 rounded text-center border border-orange-200">
                                點擊項目以標示為「缺貨 / 停售」
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-blue-600 font-bold mb-2">麥當勞 (McDonald's)</h3>
                                    {renderItemGrid('主餐 (Mains)', WESTERN_MAINS)}
                                    {renderItemGrid('飲品 (Drinks)', WESTERN_DRINKS)}
                                </div>
                                <div>
                                    <h3 className="text-orange-600 font-bold mb-2">老漿家 (Chinese)</h3>
                                    {renderItemGrid('主餐 (Mains)', CHINESE_MAINS)}
                                    {renderItemGrid('飲品 (Drinks)', CHINESE_DRINKS)}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-bold"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow font-bold"
                    >
                        儲存設定 (Save)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuSettingsModal;
