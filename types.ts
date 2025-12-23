
export type Language = 'zh' | 'en' | 'jp' | 'ko';

export enum MenuCategory {
    WESTERN = 'WESTERN',
    CHINESE = 'CHINESE'
  }
  
  export enum RoomType {
    SINGLE = '1-Pax',
    DOUBLE = '2-Pax',
    QUAD = '4-Pax'
  }
  
  export interface MenuItem {
    id: string;
    code: string;
    name: string; // Default (Chinese)
    translations: {
      en: string;
      jp: string;
      ko: string;
    };
    category: MenuCategory;
    type: 'main' | 'drink';
    hasSugarOption?: boolean; // For Soy Milk
  }
  
  export interface OrderSet {
    id: string; // Unique ID for this specific set selection
    mainId: string | null;
    drinkId: string | null;
    drinkSugar?: 'Normal' | 'No Sugar'; // Only for soy milk
    isAddOn: boolean;
  }
  
  export interface RoomOrder {
    roomId: string;
    orderSets: OrderSet[];
    call7am: boolean; // Call guest at 7 AM (Western arrival)
    call8am: boolean; // Call guest at 8 AM (Chinese arrival)
    isCompleted: boolean;
    note?: string; // Additional guest notes
    combineWithRooms?: string[]; // Combine delivery with other rooms
    noBreakfast?: boolean; // New: Guest requested no breakfast
    mcdonaldsVoucher?: boolean; // New: Guest requested McDonald's voucher
    hasBreakfast?: boolean; // New: Staff toggle to authorize breakfast ordering
    staffName?: string; // New: Name of the staff who took the order
  }
  
  export interface RoomConfig {
    id: string;
    type: RoomType;
    defaultQuota: number;
    floor: number;
  }
  
  export interface DailyStats {
    totalWesternMains: Record<string, number>;
    totalChineseMains: Record<string, number>;
    totalDrinks: Record<string, number>;
  }

  // New Interface for Menu Availability
  export interface AvailabilitySettings {
      isMcDonaldsClosed: boolean;
      isChineseClosed: boolean;
      unavailableItems: string[]; // List of IDs that are out of stock
  }
