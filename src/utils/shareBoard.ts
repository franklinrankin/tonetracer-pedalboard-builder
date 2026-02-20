// Utility functions for encoding/decoding board state for shareable links

import { Board, BoardSlot } from '../types';

// Compact format for sharing - only includes essential data
interface ShareableBoardData {
  n: string; // name
  g: string[]; // genres
  c: { // constraints
    w: number; // maxWidthMm
    d: number; // maxDepthMm
    b: number; // maxBudget
    p: number; // maxPedalCount
  };
  s: Array<{ // slots
    i: string; // pedal id
    x?: number; // positionX
    y?: number; // positionY
    r?: number; // rotation
  }>;
}

/**
 * Encode a board into a compact shareable string
 */
export function encodeBoardForShare(board: Board, selectedGenres: string[]): string {
  const data: ShareableBoardData = {
    n: board.name || 'Shared Board',
    g: selectedGenres,
    c: {
      w: board.constraints.maxWidthMm,
      d: board.constraints.maxDepthMm,
      b: board.constraints.maxBudget,
      p: board.constraints.maxPedalCount || 8,
    },
    s: board.slots.map(slot => {
      const slotData: ShareableBoardData['s'][0] = { i: slot.pedal.id };
      if (slot.positionX !== undefined) slotData.x = Math.round(slot.positionX * 10) / 10;
      if (slot.positionY !== undefined) slotData.y = Math.round(slot.positionY * 10) / 10;
      if (slot.rotation !== undefined && slot.rotation !== 0) slotData.r = slot.rotation;
      return slotData;
    }),
  };
  
  // Convert to JSON and then base64
  const json = JSON.stringify(data);
  // Use URL-safe base64 encoding
  const base64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => 
    String.fromCharCode(parseInt(p1, 16))
  ));
  // Make it URL-safe
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode a shared board string back into board data
 */
export function decodeBoardFromShare(encoded: string): ShareableBoardData | null {
  try {
    // Restore standard base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) base64 += '=';
    
    // Decode base64 to JSON
    const json = decodeURIComponent(
      atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    
    return JSON.parse(json) as ShareableBoardData;
  } catch (e) {
    console.error('Failed to decode shared board:', e);
    return null;
  }
}

/**
 * Convert decoded share data back to a partial board structure
 * Returns the data needed to reconstruct the board
 */
export function parseShareData(data: ShareableBoardData) {
  return {
    name: data.n,
    genres: data.g,
    constraints: {
      maxWidthMm: data.c.w,
      maxDepthMm: data.c.d,
      maxBudget: data.c.b,
      maxPedalCount: data.c.p,
    },
    slots: data.s.map(s => ({
      pedalId: s.i,
      positionX: s.x,
      positionY: s.y,
      rotation: s.r || 0,
    })),
  };
}

/**
 * Generate a shareable URL for a board
 */
export function generateShareUrl(board: Board, selectedGenres: string[]): string {
  const encoded = encodeBoardForShare(board, selectedGenres);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?board=${encoded}`;
}

/**
 * Check if current URL has shared board data
 */
export function getSharedBoardFromUrl(): ReturnType<typeof parseShareData> | null {
  const params = new URLSearchParams(window.location.search);
  const boardParam = params.get('board');
  
  if (!boardParam) return null;
  
  const decoded = decodeBoardFromShare(boardParam);
  if (!decoded) return null;
  
  return parseShareData(decoded);
}

/**
 * Clear the board parameter from URL without reload
 */
export function clearShareFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('board');
  window.history.replaceState({}, '', url.toString());
}
