import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface AttendeeInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface CartItem {
  id: string;
  eventId: number;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  type: 'ticket' | 'table';
  
  // Ticket specific
  ticketType?: string;
  quantity: number;
  pricePerItem: number;
  
  // Table specific
  tableId?: number;
  tableNumber?: string;
  capacity?: number;
  
  totalAmount: number;
  attendeeInfo: AttendeeInfo;
}

export interface CartState {
  items: CartItem[];
  total: number;
  currentStep: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_ATTENDEE_INFO'; payload: { id: string; attendeeInfo: AttendeeInfo } }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  total: 0,
  currentStep: 1,
};

function generateCartItemId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem: CartItem = {
        ...action.payload,
        id: generateCartItemId()
      };

      const newItems = [...state.items, newItem];
      const total = newItems.reduce((sum, item) => sum + item.totalAmount, 0);
      
      return { ...state, items: newItems, total };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      const total = newItems.reduce((sum, item) => sum + item.totalAmount, 0);
      return { ...state, items: newItems, total };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { 
              ...item, 
              quantity: action.payload.quantity,
              totalAmount: item.pricePerItem * action.payload.quantity
            }
          : item
      ).filter(item => item.quantity > 0);

      const total = newItems.reduce((sum, item) => sum + item.totalAmount, 0);
      return { ...state, items: newItems, total };
    }

    case 'UPDATE_ATTENDEE_INFO': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, attendeeInfo: action.payload.attendeeInfo }
          : item
      );

      return { ...state, items: newItems };
    }

    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

// Legacy compatibility types
export interface LegacyTicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  availableQuantity: number;
}

export interface LegacyCartItem {
  ticketType: LegacyTicketType;
  quantity: number;
}

export interface LegacyAttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  dietaryRestrictions: string;
  specialRequests: string;
}

export interface LegacyCheckoutState {
  items: LegacyCartItem[];
  total: number;
  eventId: string | null;
  eventTitle: string | null;
  attendeeInfo: LegacyAttendeeInfo | null;
  currentStep: number;
}

interface CartContextType {
  // New enhanced methods
  state: CartState;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateAttendeeInfo: (id: string, attendeeInfo: AttendeeInfo) => void;
  setStep: (step: number) => void;
  clearCart: () => void;
  getTicketItems: () => CartItem[];
  getTableItems: () => CartItem[];
  
  // Legacy compatibility methods
  addItem: (ticketType: LegacyTicketType, quantity: number) => void;
  removeItem: (ticketTypeId: string) => void;
  setEvent: (eventId: string, eventTitle: string) => void;
  setAttendeeInfo: (info: LegacyAttendeeInfo) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function EnhancedCartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const updateAttendeeInfo = (id: string, attendeeInfo: AttendeeInfo) => {
    dispatch({ type: 'UPDATE_ATTENDEE_INFO', payload: { id, attendeeInfo } });
  };

  const setStep = (step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTicketItems = () => {
    return state.items.filter(item => item.type === 'ticket');
  };

  const getTableItems = () => {
    return state.items.filter(item => item.type === 'table');
  };

  return (
    <CartContext.Provider value={{
      state,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateAttendeeInfo,
      setStep,
      clearCart,
      getTicketItems,
      getTableItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within an EnhancedCartProvider');
  }
  return context;
}

// Legacy compatibility functions for existing code
export function useEnhancedCart() {
  return useCart();
}