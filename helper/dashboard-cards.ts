import { createState, Accessor } from "ags";
import { DASHBOARD_CARDS_ORDER_JSON, moveToFirst, moveToLast, readJson, writeJson } from "./";
import { NotificationCard } from "../card/notification-card";
import ControlCenter from "../card/control-center";
import ExploitDeck from "../card/exploit-deck";
import AstalNotifd from "gi://AstalNotifd";

export interface DashboardCard {
    id: string;
    component: () => any;
}

export type CardId = 'notification' | 'control-center' | 'exploit-deck';

/**
 * Create and manage dashboard cards with persistence
 */
export function createDashboardCards(notifications: Accessor<AstalNotifd.Notification[]>) {
    const DEFAULT_ORDER: CardId[] = ['notification', 'control-center', 'exploit-deck'];
    
    // Load saved card order from JSON file
    const savedCardOrder = readJson<CardId[]>(DASHBOARD_CARDS_ORDER_JSON, DEFAULT_ORDER);
    
    // Create component map for easy lookup
    const componentMap = {
        'notification': (onDragUp: () => void, onDragDown: () => void) => 
            NotificationCard({ notifications, onDragUp, onDragDown }),
        'control-center': (onDragUp: () => void, onDragDown: () => void) => 
            ControlCenter({ onDragUp, onDragDown }),
        'exploit-deck': (onDragUp: () => void, onDragDown: () => void) => 
            ExploitDeck({ onDragUp, onDragDown })
    };
    
    // Save card order to JSON file
    const saveCardOrder = (cards: DashboardCard[]): void => {
        const order = cards.map(card => card.id as CardId);
        writeJson(DASHBOARD_CARDS_ORDER_JSON, order);
    };
    
    // Handle drag up with persistence
    const handleDragUp = (cardId: string): void => {
        setDashboardCards(cards => {
            const newCards = moveToFirst(cards, cardId);
            saveCardOrder(newCards);
            return newCards;
        });
    };
    
    // Handle drag down with persistence
    const handleDragDown = (cardId: string): void => {
        setDashboardCards(cards => {
            const newCards = moveToLast(cards, cardId);
            saveCardOrder(newCards);
            return newCards;
        });
    };
    
    // Create cards array from order
    const createCardsFromOrder = (order: CardId[]): DashboardCard[] => {
        return order.map(id => ({
            id,
            component: () => componentMap[id](
                () => handleDragUp(id),
                () => handleDragDown(id)
            )
        }));
    };
    
    // Initialize state with saved order
    const [dashboardCards, setDashboardCards] = createState(createCardsFromOrder(savedCardOrder));
    
    return {
        dashboardCards,
        resetToDefault: () => {
            const defaultCards = createCardsFromOrder(DEFAULT_ORDER);
            setDashboardCards(defaultCards);
            saveCardOrder(defaultCards);
        }
    };
}
