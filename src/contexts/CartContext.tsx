import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  availableQuantity: number;
}

export interface CartItem {
  ticketType: TicketType;
  quantity: number;
}

export interface AttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  dietaryRestrictions: string;
  specialRequests: string;
}

export interface CheckoutState {
  items: CartItem[];
  total: number;
  eventId: string | null;
  eventTitle: string | null;
  attendeeInfo: AttendeeInfo | null;
  currentStep: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { ticketType: TicketType; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { ticketTypeId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { ticketTypeId: string; quantity: number } }
  | { type: 'SET_EVENT'; payload: { eventId: string; eventTitle: string } }
  | { type: 'SET_ATTENDEE_INFO'; payload: AttendeeInfo }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'CLEAR_CART' };

const initialState: CheckoutState = {
  items: [],
  total: 0,
  eventId: null,
  eventTitle: null,
  attendeeInfo: null,
  currentStep: 1,
};

function cartReducer(state: CheckoutState, action: CartAction): CheckoutState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.ticketType.id === action.payload.ticketType.id
      );

      let newItems: CartItem[];
      if (existingItemIndex !== -1) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }

      const total = newItems.reduce((sum, item) => sum + (item.ticketType.price * item.quantity), 0);
      return { ...state, items: newItems, total };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.ticketType.id !== action.payload.ticketTypeId);
      const total = newItems.reduce((sum, item) => sum + (item.ticketType.price * item.quantity), 0);
      return { ...state, items: newItems, total };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.ticketType.id === action.payload.ticketTypeId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);

      const total = newItems.reduce((sum, item) => sum + (item.ticketType.price * item.quantity), 0);
      return { ...state, items: newItems, total };
    }

    case 'SET_EVENT':
      return { ...state, eventId: action.payload.eventId, eventTitle: action.payload.eventTitle };

    case 'SET_ATTENDEE_INFO':
      return { ...state, attendeeInfo: action.payload };

    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

interface CartContextType {
  state: CheckoutState;
  addItem: (ticketType: TicketType, quantity: number) => void;
  removeItem: (ticketTypeId: string) => void;
  updateQuantity: (ticketTypeId: string, quantity: number) => void;
  setEvent: (eventId: string, eventTitle: string) => void;
  setAttendeeInfo: (info: AttendeeInfo) => void;
  setStep: (step: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (ticketType: TicketType, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { ticketType, quantity } });
  };

  const removeItem = (ticketTypeId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { ticketTypeId } });
  };

  const updateQuantity = (ticketTypeId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { ticketTypeId, quantity } });
  };

  const setEvent = (eventId: string, eventTitle: string) => {
    dispatch({ type: 'SET_EVENT', payload: { eventId, eventTitle } });
  };

  const setAttendeeInfo = (info: AttendeeInfo) => {
    dispatch({ type: 'SET_ATTENDEE_INFO', payload: info });
  };

  const setStep = (step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      setEvent,
      setAttendeeInfo,
      setStep,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}