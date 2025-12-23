
import React from 'react';
import { RoomOrder, MenuCategory } from '../types';
import { ALL_ROOMS, ALL_MENU_ITEMS, WESTERN_MAINS, CHINESE_MAINS, WESTERN_DRINKS, CHINESE_DRINKS } from '../constants';
import { generateAndDownloadExcel } from '../services/excelService';
import { X, Download, Printer } from 'lucide-react';

interface PrintPreviewModalProps {
  orders: Record<string, RoomOrder>;
  dateKey: string;
  onClose: () => void;
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ orders, dateKey, onClose }) => {

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    generateAndDownloadExcel(orders, dateKey);
  };

  // --- Statistics Calculation ---
  const stats: Record<string, number> = {};
  ALL_MENU_ITEMS.forEach(item => stats[item.id] = 0);
  let soyMilkNoSugarCount = 0; 
  let hotSoyMilkNoSugarCount = 0;
  let westernCount = 0; 
  let noBreakfastCount = 0;
  let voucherCount = 0;

  Object.values(orders).forEach((order: RoomOrder) => {
      if(!order.isCompleted) return;
      if (order.noBreakfast) { noBreakfastCount++; return; }
      if (order.mcdonaldsVoucher) { voucherCount++; return; }

      order.orderSets.forEach(set => {
          if (set.mainId) {
              stats[set.mainId] = (stats[set.mainId] || 0) + 1;
              const m = ALL_MENU_ITEMS.find(i => i.id === set.mainId);
              if (m?.category === MenuCategory.WESTERN) westernCount++;
          }
          if (set.drinkId) {
              stats[set.drinkId] = (stats[set.drinkId] || 0) + 1;
          }
          if (set.drinkId === 'ce' && set.drinkSugar === 'No Sugar') soyMilkNoSugarCount++;
          if (set.drinkId === 'cg' && set.drinkSugar === 'No Sugar') hotSoyMilkNoSugarCount++;
      });
  });

  // --- Chinese Traditional Pricing & Layout Logic ---
  
  // 1. Define Prices
  const CHINESE_PRICES: Record<string, number> = {
      // Mains
      'c6': 70,  // 里肌肉飯糰
      'c10': 45, // 素飯糰
      'c7': 50,  // 燒餅油條
      'c13': 70, // 燒餅蔥爆豬
      'c8': 65,  // 蘿蔔糕加蛋
      'c9': 100, // 小籠包
      'c11': 35, // 饅頭夾蔥蛋
      'c12': 50, // 起司蛋餅
      // Drinks
      'ce': 35, // 冰豆漿
      'cf': 35, // 冰米漿
      'cg': 35, // 熱豆漿
      'ch': 35, // 熱米漿
      'ice_clear': 35, // 冰清
      'hot_clear': 35  // 熱清
  };

  // 2. Define Display Rows (Order matches screenshot)
  const chineseMainsRows = [
      { id: 'c6', label: '里肌肉飯糰' },
      { id: 'c10', label: '素飯糰' },
      { id: 'c7', label: '燒餅油條' },
      { id: 'c13', label: '燒餅蔥爆豬' },
      { id: 'c8', label: '蘿蔔糕加蛋' },
      { id: 'c9', label: '小籠包' },
      { id: 'c11', label: '饅頭夾蔥蛋' },
      { id: 'c12', label: '起司蛋餅' },
  ];

  const chineseDrinksRows = [
      { id: 'ce', label: '冰豆漿', isSoy: true },
      { id: 'cf', label: '冰米漿' },
      { id: 'cg', label: '熱豆漿', isHotSoy: true },
      { id: 'ch', label: '熱米漿' },
      { id: 'ice_clear', label: '冰清', isVirtual: true },
      { id: 'hot_clear', label: '熱清', isVirtual: true },
  ];

  let totalChineseAmount = 0;

  return (
    <div className="fixed inset-0 bg-white z-[100] overflow-y-auto flex flex-col">
      {/* Action Header (Hidden when printing) */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md print:hidden sticky top-0 z-50">
        <h2 className="text-xl font-bold flex items-center">
            <span className="mr-2">Print Preview:</span> {dateKey}
        </h2>
        <div className="flex space-x-4">
            <button 
                onClick={handleDownload}
                className="flex items-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-bold transition-colors"
            >
                <Download className="w-4 h-4 mr-2" /> Download Excel
            </button>
            <button 
                onClick={handlePrint}
                className="flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-bold transition-colors"
            >
                <Printer className="w-4 h-4 mr-2" /> Print
            </button>
            <button 
                onClick={onClose}
                className="flex items-center bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm font-bold transition-colors"
            >
                <X className="w-4 h-4 mr-2" /> Close
            </button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="p-8 max-w-[297mm] mx-auto bg-white min-h-screen print:p-0 print:w-full">
        
        {/* Header on Paper */}
        <div className="mb-6 text-center border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Eastin Taipei Hotel Breakfast Order</h1>
            <p className="text-lg font-mono">Date: {dateKey}</p>
        </div>

        {/* Order Table */}
        <table className="w-full border-collapse border border-black text-sm mb-8 text-center">
            <thead className="bg-gray-100">
                <tr>
                    {/* Reordered Columns: 7C -> Room -> 8C */}
                    <th className="border border-black p-2 w-10">7C</th>
                    <th className="border border-black p-2 w-16">Room</th>
                    <th className="border border-black p-2 w-10">8C</th>
                    <th className="border border-black p-2 w-12">份數</th>
                    <th className="border border-black p-2">7點麥當勞</th>
                    <th className="border border-black p-2">8點老漿家</th>
                    <th className="border border-black p-2 w-48 text-left">備註</th>
                </tr>
            </thead>
            <tbody>
                {ALL_ROOMS.map(room => {
                    const orderData = orders[room.id];
                    
                    // Filter: Hide row if no completed order
                    if (!orderData || !orderData.isCompleted) {
                        return null;
                    }

                    // Processing Logic
                    const westernOrders: string[] = [];
                    const chineseOrders: string[] = [];
                    
                    // Call Logic: Checkmark only
                    const call7Val = (orderData.call7am) ? '✓' : '';
                    const call8Val = (orderData.call8am) ? '✓' : '';

                    if (orderData.noBreakfast) {
                         return (
                            <tr key={room.id} className="bg-red-50">
                                <td className="border border-black p-2"></td>
                                <td className="border border-black p-2 font-bold">{room.id}</td>
                                <td className="border border-black p-2"></td>
                                <td className="border border-black p-2">{room.defaultQuota}</td>
                                <td className="border border-black p-2 text-red-600 font-bold" colSpan={2}>NO BREAKFAST</td>
                                <td className="border border-black p-2 text-left">{orderData.note}</td>
                            </tr>
                        );
                    }
                    if (orderData.mcdonaldsVoucher) {
                         return (
                            <tr key={room.id} className="bg-gray-50">
                                <td className="border border-black p-2"></td>
                                <td className="border border-black p-2 font-bold">{room.id}</td>
                                <td className="border border-black p-2"></td>
                                <td className="border border-black p-2">{room.defaultQuota}</td>
                                <td className="border border-black p-2 font-bold" colSpan={2}>MCDONALD'S VOUCHER</td>
                                <td className="border border-black p-2 text-left">{orderData.note}</td>
                            </tr>
                        );
                    }

                    orderData.orderSets.forEach(set => {
                        const main = ALL_MENU_ITEMS.find(i => i.id === set.mainId);
                        const drink = ALL_MENU_ITEMS.find(i => i.id === set.drinkId);
                        
                        // Simplify: (01)+(A) -> (01+A)
                        const mainCode = main ? main.code.replace(/[()]/g, '') : '';
                        let drinkCode = drink ? drink.code.replace(/[()]/g, '') : '';
                        
                        // Handle No Sugar Custom Formatting: E -> 清E, G -> 清G
                        const isNoSugar = set.drinkSugar === 'No Sugar';
                        if (isNoSugar && (set.drinkId === 'ce' || set.drinkId === 'cg')) {
                             drinkCode = '清' + drinkCode;
                        }

                        let orderStr = '';
                        if (mainCode && drinkCode) {
                            orderStr = `(${mainCode}+${drinkCode})`;
                        } else if (mainCode) {
                            orderStr = `(${mainCode})`;
                        } else if (drinkCode) {
                            orderStr = `(${drinkCode})`;
                        }

                        // Add sugar note if necessary, BUT ignore if we already converted to 清E/清G
                        if (isNoSugar && !(set.drinkId === 'ce' || set.drinkId === 'cg')) {
                            orderStr += '(無糖)';
                        }

                        if (orderStr) {
                            if (main?.category === MenuCategory.WESTERN || drink?.category === MenuCategory.WESTERN) {
                                westernOrders.push(orderStr);
                            } else if (main?.category === MenuCategory.CHINESE || drink?.category === MenuCategory.CHINESE) {
                                chineseOrders.push(orderStr);
                            }
                        }
                    });

                    // Combine Note
                    let finalNote = orderData.note || '';
                    if (orderData.combineWithRooms && orderData.combineWithRooms.length > 0) {
                        const prefix = `[與 ${orderData.combineWithRooms.join(', ')} 同放]`;
                        finalNote = finalNote ? `${prefix} ${finalNote}` : prefix;
                    }

                    return (
                        <tr key={room.id}>
                            <td className="border border-black p-2 font-bold text-lg">{call7Val}</td>
                            <td className="border border-black p-2 font-bold">{room.id}</td>
                            <td className="border border-black p-2 font-bold text-lg">{call8Val}</td>
                            <td className="border border-black p-2">{room.defaultQuota}</td>
                            <td className="border border-black p-2">{westernOrders.join('、')}</td>
                            <td className="border border-black p-2">{chineseOrders.join('、')}</td>
                            <td className="border border-black p-2 text-left text-xs">{finalNote}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>

        {/* Kitchen Summary Section - Scaled 75% | 3-Column Layout */}
        <div className="break-inside-avoid origin-top-left scale-75 w-[133.33%]">
            <h2 className="text-xl font-bold mb-4 border-b border-black pb-1">總計 (Summary)</h2>
            <div className="grid grid-cols-3 gap-6 text-sm">
                
                {/* Column 1: McDonald's Section */}
                <div>
                    <h3 className="font-bold mb-2 bg-gray-200 p-1">麥當勞 (McDonald's)</h3>
                    {/* Date increased to text-xl */}
                    <div className="mb-2 font-bold text-blue-800 border-b border-blue-200 pb-1 text-xl">
                        配送日期 (Date): {dateKey}
                    </div>
                    <table className="w-full border-collapse border border-gray-300">
                        <tbody>
                            {/* Mains */}
                            {WESTERN_MAINS.map(m => (
                                <tr key={m.id}>
                                    {/* Items Bolded */}
                                    <td className="border border-gray-300 p-1 align-middle text-lg font-bold">
                                        {/* Special Formatting for Bagel (w4) */}
                                        {m.id === 'w4' ? (
                                            <div className="leading-tight">
                                                <span>(04) 現烤焙果</span>
                                                <br/>
                                                <span className="text-xs text-gray-500 font-medium tracking-tight">+乳酪起司抹醬及草莓醬</span>
                                            </div>
                                        ) : (
                                            `${m.code} ${m.name}`
                                        )}
                                    </td>
                                    <td className="border border-gray-300 p-1 w-12 text-center font-bold align-middle text-xl">{stats[m.id] || 0}</td>
                                </tr>
                            ))}
                            {/* Hash Brown */}
                            <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                                <td className="border border-gray-300 p-1 text-lg">附餐: 薯餅</td>
                                <td className="border border-gray-300 p-1 text-center text-xl">{westernCount}</td>
                            </tr>
                            {/* Drinks */}
                            <tr className="bg-gray-100"><td colSpan={2} className="border border-gray-300 p-1 text-sm font-bold text-gray-500">飲品 (Drinks)</td></tr>
                            {WESTERN_DRINKS.map(d => (
                                <tr key={d.id}>
                                    {/* Drinks Bolded */}
                                    <td className="border border-gray-300 p-1 text-lg font-bold">{d.code} {d.name}</td>
                                    <td className="border border-gray-300 p-1 w-12 text-center font-bold text-xl">{stats[d.id] || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Column 2: Chinese Section */}
                <div>
                    <h3 className="font-bold mb-2 bg-gray-200 p-1">老漿家 (Chinese Traditional)</h3>
                    {/* Date increased to text-xl */}
                    <div className="mb-2 font-bold text-blue-800 border-b border-blue-200 pb-1 text-xl">
                        配送日期 (Date): {dateKey}
                    </div>
                    
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 p-1 text-left text-lg font-bold text-gray-500">主食</th>
                                <th className="border border-gray-300 p-1 w-16 text-center text-xs font-bold text-gray-500">數量</th>
                                <th className="border border-gray-300 p-1 w-12 text-center text-xs font-bold text-gray-500">單價</th>
                                <th className="border border-gray-300 p-1 w-14 text-center text-xs font-bold text-gray-500">小計</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Mains Rows */}
                            {chineseMainsRows.map(row => {
                                const count = stats[row.id] || 0;
                                const price = CHINESE_PRICES[row.id];
                                const subtotal = count * price;
                                totalChineseAmount += subtotal;

                                return (
                                    <tr key={row.id}>
                                        {/* Items Bolded */}
                                        <td className="border border-gray-300 p-1 text-2xl font-bold">{row.label}</td>
                                        <td className="border border-gray-300 p-1 w-16 text-center text-2xl font-bold">{count}</td>
                                        <td className="border border-gray-300 p-1 text-center text-gray-500 text-lg">{price}</td>
                                        <td className="border border-gray-300 p-1 text-center font-bold text-lg">{subtotal}</td>
                                    </tr>
                                );
                            })}

                            {/* Drinks Header Row */}
                            <tr className="bg-gray-100">
                                <td className="border border-gray-300 p-1 text-lg font-bold text-gray-500" colSpan={4}>飲料 (Drinks)</td>
                            </tr>

                            {/* Drinks Rows */}
                            {chineseDrinksRows.map(row => {
                                let count = 0;
                                if (row.isVirtual) {
                                    if (row.id === 'ice_clear') count = soyMilkNoSugarCount;
                                    if (row.id === 'hot_clear') count = hotSoyMilkNoSugarCount;
                                } else {
                                    count = stats[row.id] || 0;
                                    if (row.isSoy) count = Math.max(0, count - soyMilkNoSugarCount);
                                    if (row.isHotSoy) count = Math.max(0, count - hotSoyMilkNoSugarCount);
                                }
                                
                                const price = CHINESE_PRICES[row.id];
                                const subtotal = count * price;
                                totalChineseAmount += subtotal;

                                return (
                                    <tr key={row.id}>
                                        {/* Drinks Bolded */}
                                        <td className="border border-gray-300 p-1 text-2xl font-bold">{row.label}</td>
                                        <td className="border border-gray-300 p-1 w-16 text-center text-2xl font-bold">{count}</td>
                                        <td className="border border-gray-300 p-1 text-center text-gray-500 text-lg">{price}</td>
                                        <td className="border border-gray-300 p-1 text-center font-bold text-lg">{subtotal}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50 font-bold border-t border-gray-300">
                                <td className="border border-gray-300 p-1 text-right" colSpan={3}>金額總計</td>
                                <td className="border border-gray-300 p-1 text-center text-xl">{totalChineseAmount}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Column 3: Special Status & Requests */}
                <div>
                    <h3 className="font-bold mb-2 bg-gray-200 p-1">特殊狀態 (Special)</h3>
                    <table className="w-full border-collapse border border-gray-300 mb-4">
                        <tbody>
                             <tr>
                                <td className="border border-gray-300 p-1 text-lg">不需要早餐 (No Breakfast)</td>
                                <td className="border border-gray-300 p-1 w-12 text-center font-bold text-xl">{noBreakfastCount || 0}</td>
                            </tr>
                             <tr>
                                <td className="border border-gray-300 p-1 text-lg">麥當勞餐券 (Voucher)</td>
                                <td className="border border-gray-300 p-1 w-12 text-center font-bold text-xl">{voucherCount || 0}</td>
                            </tr>
                        </tbody>
                    </table>

                    {(soyMilkNoSugarCount > 0 || hotSoyMilkNoSugarCount > 0) && (
                        <>
                            <h3 className="font-bold mb-2 bg-gray-200 p-1">特殊需求 (Requests)</h3>
                            <table className="w-full border-collapse border border-gray-300">
                                <tbody>
                                    {soyMilkNoSugarCount > 0 && (
                                        <tr>
                                            <td className="border border-gray-300 p-1 text-lg">冰豆漿 (無糖)</td>
                                            <td className="border border-gray-300 p-1 w-12 text-center font-bold text-xl">{soyMilkNoSugarCount}</td>
                                        </tr>
                                    )}
                                    {hotSoyMilkNoSugarCount > 0 && (
                                        <tr>
                                            <td className="border border-gray-300 p-1 text-lg">熱豆漿 (無糖)</td>
                                            <td className="border border-gray-300 p-1 w-12 text-center font-bold text-xl">{hotSoyMilkNoSugarCount}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-right text-gray-500">
            Generated by Eastin Breakfast Manager
        </div>

      </div>
    </div>
  );
};

export default PrintPreviewModal;
