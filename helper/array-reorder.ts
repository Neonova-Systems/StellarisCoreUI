/**
 * Utility functions for reordering arrays based on item IDs
 */

export interface ReorderableItem {
    id: string;
    [key: string]: any;
}

/**
 * Moves an item to the first position in the array
 * @param items - Array of items with id property
 * @param itemId - ID of the item to move to first position
 * @returns New array with the item moved to first position, or original array if no change needed
 */
export function moveToFirst<T extends ReorderableItem>(items: T[], itemId: string): T[] {
    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex > 0) {
        const itemToMove = items[itemIndex];
        return [itemToMove, ...items.slice(0, itemIndex), ...items.slice(itemIndex + 1)];
    }
    return items;
}

/**
 * Moves an item to the last position in the array
 * @param items - Array of items with id property
 * @param itemId - ID of the item to move to last position
 * @returns New array with the item moved to last position, or original array if no change needed
 */
export function moveToLast<T extends ReorderableItem>(items: T[], itemId: string): T[] {
    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex >= 0 && itemIndex < items.length - 1) {
        const itemToMove = items[itemIndex];
        return [...items.slice(0, itemIndex), ...items.slice(itemIndex + 1), itemToMove];
    }
    return items;
}
