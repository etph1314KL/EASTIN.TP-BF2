
import * as XLSX from 'xlsx';
import { RoomOrder, MenuItem, MenuCategory } from '../types';
import { ALL_MENU_ITEMS, ALL_ROOMS, WESTERN_MAINS, CHINESE_MAINS } from '../constants';

export const generateAndDownloadExcel = (orders: Record<string, RoomOrder>, dateKey: string) => {
  // 1. Prepare Data for Sheet 1: Room Detail List
  const detailRows: any[] = [];

  ALL_ROOMS.forEach(room => {
    const orderData = orders[room.id];
    
    // Default Empty Row if no order
    if (!orderData || !orderData.isCompleted) {
      detailRows.push({
        '日期': dateKey,
        '房號': room.id,
        '房型': room.type,
        '西式早餐(7點)': '',
        '中式早餐(8點)': '',
        '7點通知': '',
        '8點通知': '',
        '備註': ''
      });
      return;
    }

    // Handle Special Status (No Breakfast / Voucher)
    if (orderData.noBreakfast) {
        detailRows.push({
            '日期': dateKey,
            '房號': room.id,
            '房型': room.type,
            '西式早餐(7點)': '不需要早餐 (No Breakfast)',
            '中式早餐(8點)': '',
            '7點通知': '',
            '8點通知': '',
            '備註': orderData.note || ''
        });
        return;
    }

    if (orderData.mcdonaldsVoucher) {
        detailRows.push({
            '日期': dateKey,
            '房號': room.id,
            '房型': room.type,
            '西式早餐(7點)': '麥當勞餐券 (Voucher)',
            '中式早餐(8點)': '',
            '7點通知': '',
            '8點通知': '',
            '備註': orderData.note || ''
        });
        return;
    }

    // Normal Food Order
    const westernOrders: string[] = [];
    const chineseOrders: string[] = [];
    
    let hasWestern = false;
    let hasChinese = false;

    if (orderData.orderSets) {
        orderData.orderSets.forEach(set => {
            const main = ALL_MENU_ITEMS.find(i => i.id === set.mainId);
            const drink = ALL_MENU_ITEMS.find(i => i.id === set.drinkId);
            
            // Build the string: "(01)麥香魚+(A)冰檸檬紅茶"
            let parts = [];
            if (main) {
                let mainName = `${main.code}${main.name}`;
                parts.push(mainName);
            }
            if (drink) {
                let drinkName = `${drink.code}${drink.name}`;
                if (set.drinkSugar === 'No Sugar') {
                    drinkName += '(無糖)';
                }
                parts.push(drinkName);
            }

            const orderStr = parts.join('+');

            if (orderStr) {
                if (main?.category === MenuCategory.WESTERN || drink?.category === MenuCategory.WESTERN) {
                    westernOrders.push(orderStr);
                    hasWestern = true;
                } else if (main?.category === MenuCategory.CHINESE || drink?.category === MenuCategory.CHINESE) {
                    chineseOrders.push(orderStr);
                    hasChinese = true;
                }
            }
        });
    }

    // Call Logic for Excel
    let call7Val = '';
    if (hasWestern) {
        call7Val = orderData.call7am ? '7C' : 'NC';
    }

    let call8Val = '';
    if (hasChinese) {
        call8Val = orderData.call8am ? '8C' : 'NC';
    }

    // Combine Note
    let finalNote = orderData.note || '';
    if (orderData.combineWithRooms && orderData.combineWithRooms.length > 0) {
        const prefix = `[與 ${orderData.combineWithRooms.join(', ')} 房同放]`;
        finalNote = finalNote ? `${prefix} ${finalNote}` : prefix;
    }

    detailRows.push({
      '日期': dateKey,
      '房號': room.id,
      '房型': room.type,
      '西式早餐(7點)': westernOrders.join('、'), // Use Chinese comma separator
      '中式早餐(8點)': chineseOrders.join('、'),
      '7點通知': call7Val,
      '8點通知': call8Val,
      '備註': finalNote
    });
  });

  // 2. Prepare Data for Sheet 2: Kitchen Summary
  const summaryRows: any[] = [];
  const stats: Record<string, number> = {};

  // Initialize stats
  ALL_MENU_ITEMS.forEach(item => {
      stats[item.id] = 0;
  });
  let soyMilkNoSugarCount = 0; 
  let hotSoyMilkNoSugarCount = 0;
  let westernCount = 0; // Total Western Sets (for Hash Browns)
  let noBreakfastCount = 0;
  let voucherCount = 0;

  Object.values(orders).forEach(order => {
      if(!order.isCompleted) return;
      
      if (order.noBreakfast) {
          noBreakfastCount++;
          return;
      }
      if (order.mcdonaldsVoucher) {
          voucherCount++;
          return;
      }

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

  summaryRows.push({ '項目': '--- 西式主餐 (Western Main) ---', '數量': '' });
  WESTERN_MAINS.forEach(m => summaryRows.push({ '項目': `${m.code} ${m.name}`, '數量': stats[m.id] }));
  summaryRows.push({ '項目': '附餐: 薯餅 (Hash Brown)', '數量': westernCount });
  
  summaryRows.push({ '項目': '', '數量': '' });
  summaryRows.push({ '項目': '--- 中式主餐 (Chinese Main) ---', '數量': '' });
  CHINESE_MAINS.forEach(m => summaryRows.push({ '項目': `${m.code} ${m.name}`, '數量': stats[m.id] }));

  summaryRows.push({ '項目': '', '數量': '' });
  summaryRows.push({ '項目': '--- 特殊狀態 (Status) ---', '數量': '' });
  summaryRows.push({ '項目': '不需要早餐 (No Breakfast)', '數量': noBreakfastCount });
  summaryRows.push({ '項目': '麥當勞餐券 (Voucher)', '數量': voucherCount });
  
  summaryRows.push({ '項目': '', '數量': '' });
  summaryRows.push({ '項目': '--- 特殊需求 (Special) ---', '數量': '' });
  if (soyMilkNoSugarCount > 0) summaryRows.push({ '項目': '冰豆漿 (無糖)', '數量': soyMilkNoSugarCount });
  if (hotSoyMilkNoSugarCount > 0) summaryRows.push({ '項目': '熱豆漿 (無糖)', '數量': hotSoyMilkNoSugarCount });

  // 3. Create Workbook
  const wb = XLSX.utils.book_new();
  
  const wsDetail = XLSX.utils.json_to_sheet(detailRows);
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);

  // Set column widths
  wsDetail['!cols'] = [
      { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 50 }, { wch: 50 }, { wch: 10 }, { wch: 10 }, { wch: 30 }
  ];
  wsSummary['!cols'] = [{ wch: 40 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, wsDetail, "訂單明細 (Details)");
  XLSX.utils.book_append_sheet(wb, wsSummary, "廚房統計 (Kitchen)");

  // 4. Download
  XLSX.writeFile(wb, `Breakfast_Orders_${dateKey}.xlsx`);
};
