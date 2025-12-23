
import React, { useMemo } from 'react';
import { RoomConfig, RoomOrder, MenuCategory } from '../types';
import { CheckCircle2, Link, Ban, Ticket, AlertCircle, PenTool } from 'lucide-react';
import { ALL_MENU_ITEMS } from '../constants';

interface RoomGridProps {
  rooms: RoomConfig[];
  orders: Record<string, RoomOrder>;
  onRoomClick: (room: RoomConfig) => void;
  onToggleBreakfast: (roomId: string) => void;
}

// Pastel colors for different groups (excluding emerald/green which is for standard orders)
const GROUP_COLORS = [
    'bg-blue-100 border-blue-400 text-blue-800',
    'bg-purple-100 border-purple-400 text-purple-800',
    'bg-amber-100 border-amber-400 text-amber-800',
    'bg-pink-100 border-pink-400 text-pink-800',
    'bg-cyan-100 border-cyan-400 text-cyan-800',
    'bg-rose-100 border-rose-400 text-rose-800',
];

const RoomGrid: React.FC<RoomGridProps> = ({ rooms, orders, onRoomClick, onToggleBreakfast }) => {
  // Sort descending: 14F then 13F
  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a: number, b: number) => b - a);

  // Group Logic Calculation
  const roomGroupColors = useMemo(() => {
    const parentMap: Record<string, string> = {};
    
    // Initialize Union-Find
    rooms.forEach(r => parentMap[r.id] = r.id);

    const find = (id: string): string => {
        if (parentMap[id] === id) return id;
        parentMap[id] = find(parentMap[id]);
        return parentMap[id];
    };

    const union = (id1: string, id2: string) => {
        const root1 = find(id1);
        const root2 = find(id2);
        if (root1 !== root2) {
            parentMap[root1] = root2;
        }
    };

    // Build connections
    Object.values(orders).forEach((order: RoomOrder) => {
        if (order.isCompleted && order.combineWithRooms && order.combineWithRooms.length > 0) {
            order.combineWithRooms.forEach(targetRoomId => {
                // Only union if the target room actually exists in our system to avoid bad data
                if (rooms.some(r => r.id === targetRoomId)) {
                    union(order.roomId, targetRoomId);
                }
            });
        }
    });

    // Determine Groups
    const groups: Record<string, string[]> = {};
    rooms.forEach(r => {
        const root = find(r.id);
        if (!groups[root]) groups[root] = [];
        groups[root].push(r.id);
    });

    // Assign Colors to Groups with Size > 1
    const colorMap: Record<string, string> = {};
    let colorIndex = 0;

    Object.values(groups).forEach(members => {
        // We only color group if it has more than 1 member AND at least one member has an active order
        const hasActiveOrder = members.some(mid => orders[mid]?.isCompleted);
        
        if (members.length > 1 && hasActiveOrder) {
            colorMap[members.join(',')] = GROUP_COLORS[colorIndex % GROUP_COLORS.length];
            colorIndex++;
        }
    });

    // Flatten to RoomId -> ColorClass
    const finalRoomColors: Record<string, string> = {};
    Object.entries(groups).forEach(([root, members]) => {
        const colorClass = colorMap[members.join(',')];
        if (colorClass) {
            members.forEach(m => finalRoomColors[m] = colorClass);
        }
    });

    return finalRoomColors;
  }, [orders, rooms]);


  const getStatusContent = (roomId: string) => {
    const order = orders[roomId];
    if (!order || !order.isCompleted) return null;
    
    // If Special Status (No Breakfast or Voucher), we usually don't show Calls, 
    // but just in case logic changes, we guard it.
    if (order.noBreakfast || order.mcdonaldsVoucher) return null;

    // Check what types of food are in the order
    const hasWestern = order.orderSets.some(s => {
        const m = ALL_MENU_ITEMS.find(i => i.id === s.mainId);
        const d = ALL_MENU_ITEMS.find(i => i.id === s.drinkId);
        return m?.category === MenuCategory.WESTERN || d?.category === MenuCategory.WESTERN;
    });

    const hasChinese = order.orderSets.some(s => {
        const m = ALL_MENU_ITEMS.find(i => i.id === s.mainId);
        const d = ALL_MENU_ITEMS.find(i => i.id === s.drinkId);
        return m?.category === MenuCategory.CHINESE || d?.category === MenuCategory.CHINESE;
    });

    return (
        <div className="absolute -top-3 -right-2 flex space-x-1">
             {/* 7 AM Indicators */}
             {order.call7am && (
                 <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow border border-yellow-500 z-10">7C</span>
             )}
             {!order.call7am && order.call8am && hasWestern && (
                  <span className="bg-gray-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow border border-gray-600 z-10">NC</span>
             )}

             {/* 8 AM Indicators */}
             {order.call8am && (
                 <span className="bg-orange-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow border border-orange-500 z-10">8C</span>
             )}
             {!order.call8am && order.call7am && hasChinese && (
                  <span className="bg-gray-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow border border-gray-600 z-10">NC</span>
             )}
        </div>
    );
  };

  return (
    <div className="space-y-8">
      {floors.map(floor => (
        <div key={floor}>
          <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">{floor}F</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {rooms.filter(r => r.floor === floor).map(room => {
              const order = orders[room.id];
              const isOrdered = order?.isCompleted;
              
              // Draft check: Order exists, has sets or notes, but NOT completed
              const isDraft = !isOrdered && order && (order.orderSets.length > 0 || (order.note && order.note.length > 0));

              const groupColorClass = roomGroupColors[room.id];
              const linkedRooms = order?.combineWithRooms;
              const hasBreakfast = order?.hasBreakfast || false;
              const hasNote = order?.note && order.note.trim().length > 0;
              const staffName = order?.staffName;
              
              // Determine background class
              let bgClass = 'bg-white border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500';
              
              if (isOrdered) {
                  if (order.noBreakfast) {
                      // Deep Red / White Text
                      bgClass = 'bg-red-800 border-red-900 text-white hover:bg-red-700 shadow-md';
                  } else if (order.mcdonaldsVoucher) {
                      // Dark Gray / White Text
                      bgClass = 'bg-gray-600 border-gray-700 text-white hover:bg-gray-500 shadow-md';
                  } else if (groupColorClass) {
                      // Grouped Order
                      bgClass = `${groupColorClass} shadow-sm`;
                  } else {
                      // Standard Order (Green)
                      bgClass = 'bg-emerald-100 border-emerald-400 text-emerald-800 shadow-sm';
                  }
              }

              return (
                <button
                  key={room.id}
                  onClick={() => onRoomClick(room)}
                  className={`
                    relative p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all min-h-[80px]
                    ${bgClass}
                  `}
                >
                  {/* Breakfast Auth Toggle */}
                  <div 
                    className="absolute top-1 left-1 z-20"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleBreakfast(room.id);
                    }}
                  >
                      <input 
                        type="checkbox" 
                        checked={hasBreakfast}
                        onChange={() => {}} // Handled by div onClick
                        className="w-5 h-5 cursor-pointer accent-blue-600"
                        title="Toggle Breakfast Included"
                      />
                  </div>

                  {/* Note Indicator */}
                  {hasNote && (
                      <div className="absolute top-1.5 left-7 z-20" title={order.note}>
                          <AlertCircle className="w-4 h-4 text-red-600 fill-white" />
                      </div>
                  )}

                  {getStatusContent(room.id)}
                  
                  <span className="text-lg font-bold">{room.id}</span>
                  <span className="text-[10px] uppercase font-medium opacity-70">{room.type}</span>
                  
                  {isOrdered && !order.noBreakfast && !order.mcdonaldsVoucher && <CheckCircle2 className="w-4 h-4 mt-1 opacity-60" />}
                  {isOrdered && order.noBreakfast && <Ban className="w-4 h-4 mt-1 opacity-80" />}
                  {isOrdered && order.mcdonaldsVoucher && <Ticket className="w-4 h-4 mt-1 opacity-80" />}

                  {/* Draft / Modification Indicator - Moved to Bottom Left */}
                  {isDraft && (
                      <div className="absolute bottom-1 left-1 bg-amber-100 text-amber-700 rounded-full p-1 shadow-sm border border-amber-200 z-10" title="Order in progress">
                          <PenTool className="w-3 h-3" />
                      </div>
                  )}
                  
                  {/* Linked Room Indicator & Staff Name (Stacked) */}
                  <div className={`absolute bottom-1 right-1 flex flex-col items-end opacity-80 space-y-0.5 ${order?.noBreakfast || order?.mcdonaldsVoucher ? 'text-white' : ''}`}>
                      {linkedRooms && linkedRooms.length > 0 && (
                          <div className="flex items-center" title={`Linked with: ${linkedRooms.join(', ')}`}>
                              <Link className="w-3 h-3 mr-0.5" />
                              <span className="text-[9px] font-bold leading-none">{linkedRooms.join(',')}</span>
                          </div>
                      )}
                      
                      {staffName && !isDraft && (
                          <span className={`text-[9px] font-bold leading-none ${order?.noBreakfast || order?.mcdonaldsVoucher ? 'text-white/80' : 'text-gray-500'}`}>
                              {staffName}
                          </span>
                      )}
                  </div>

                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomGrid;
