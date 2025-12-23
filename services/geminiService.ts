
import { GoogleGenAI } from "@google/genai";
import { RoomOrder } from "../types";
import { ALL_MENU_ITEMS, ALL_ROOMS } from "../constants";

export const generateKitchenBriefing = async (orders: Record<string, RoomOrder>): Promise<string> => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return "API Key not found. Cannot generate AI briefing.";
        }

        const ai = new GoogleGenAI({ apiKey });

        // Transform data into a readable prompt
        const completedOrders = Object.values(orders).filter(o => o.isCompleted);
        
        let orderSummaryText = `Total Rooms Ordered: ${completedOrders.length} / ${ALL_ROOMS.length}\n`;
        
        // Count specials
        let specials: string[] = [];
        let noBreakfastCount = 0;
        let voucherCount = 0;

        completedOrders.forEach(o => {
            if (o.noBreakfast) {
                specials.push(`Room ${o.roomId}: NO BREAKFAST`);
                noBreakfastCount++;
                return;
            }
            if (o.mcdonaldsVoucher) {
                specials.push(`Room ${o.roomId}: MCDONALD'S VOUCHER (No Meal Prep)`);
                voucherCount++;
                return;
            }

            o.orderSets.forEach(set => {
                if (set.drinkSugar === 'No Sugar') {
                    const drinkName = ALL_MENU_ITEMS.find(i => i.id === set.drinkId)?.name;
                    specials.push(`Room ${o.roomId}: ${drinkName} (No Sugar)`);
                }
            });
            // Check for Call requests to add to briefing
            if (o.call7am) specials.push(`Room ${o.roomId}: Call at 7:00 AM (7C)`);
            if (o.call8am) specials.push(`Room ${o.roomId}: Call at 8:00 AM (8C)`);
            
            // Add Room Notes
            if (o.note) specials.push(`Room ${o.roomId} Note: ${o.note}`);

            // Add Combine Info
            if (o.combineWithRooms && o.combineWithRooms.length > 0) {
                specials.push(`Room ${o.roomId}: DELIVER TOGETHER WITH ROOMS ${o.combineWithRooms.join(', ')}`);
            }
        });

        const prompt = `
        You are a helpful kitchen assistant for a hotel. 
        Analyze the following breakfast order data and provide a concise, professional briefing for the Chef and Front Desk.
        
        Data:
        ${orderSummaryText}
        No Breakfast Rooms: ${noBreakfastCount}
        Voucher Rooms: ${voucherCount}

        Special Requests List:
        ${specials.join('\n')}

        Please provide:
        1. An encouraging opening.
        2. A "Watch Out" list for the kitchen regarding special dietary modifications (like No Sugar or guest notes).
        3. A "Front Desk Alert" list for rooms requiring morning calls, vouchers, or special delivery instructions (e.g., Combined Delivery).
        4. A short closing.
        
        Keep it brief and easy to read on a dashboard. Use Markdown.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text || "No response generated.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Failed to generate AI briefing. Please check console.";
    }
};
