import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export interface PromoCodeApplication {
  promoCode: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
}

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

export interface EventInfo {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  venue?: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  is_online: boolean;
  online_link?: string;
}

export interface SimpleProduct {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface SimpleCartItem {
  product: SimpleProduct;
  quantity: number;
}

export interface CheckoutState {
  items: CartItem[];
  simpleItems: SimpleCartItem[];
  subtotal: number;
  discountAmount: number;
  discount: number;
  total: number;
  eventId: string | null;
  eventTitle: string | null;
  eventInfo: EventInfo | null;
  attendeeInfo: AttendeeInfo | null;
  promoCode: string | null;
  promoCodeApplication: PromoCodeApplication | null;
  currentStep: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { ticketType: TicketType; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { ticketTypeId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { ticketTypeId: string; quantity: number } }
  | { type: 'ADD_SIMPLE_ITEM'; payload: { product: SimpleProduct; quantity: number } }
  | { type: 'REMOVE_SIMPLE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_SIMPLE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_SIMPLE_CART' }
  | { type: 'SET_EVENT'; payload: { eventId: string; eventTitle: string } }
  | { type: 'SET_EVENT_INFO'; payload: EventInfo }
  | { type: 'SET_ATTENDEE_INFO'; payload: AttendeeInfo }
  | { type: 'SET_PROMO_CODE'; payload: PromoCodeApplication | null }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'CLEAR_CART' };

// localStorage key for cart persistence
const CART_STORAGE_KEY = 'steppers-life-cart';

// Function to load cart from localStorage
function loadCartFromStorage(): CheckoutState {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      return {
        ...parsedCart,
        // Ensure all required fields exist with defaults
        items: parsedCart.items || [],
        simpleItems: parsedCart.simpleItems || [],
        subtotal: parsedCart.subtotal || 0,
        discountAmount: parsedCart.discountAmount || 0,
        discount: parsedCart.discount || 0,
        total: parsedCart.total || 0,
        eventId: parsedCart.eventId || null,
        eventTitle: parsedCart.eventTitle || null,
        eventInfo: parsedCart.eventInfo || null,
        attendeeInfo: parsedCart.attendeeInfo || null,
        promoCode: parsedCart.promoCode || null,
        promoCodeApplication: parsedCart.promoCodeApplication || null,
        currentStep: parsedCart.currentStep || 1,
      };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  
  return {
    items: [],
    simpleItems: [],
    subtotal: 0,
    discountAmount: 0,
    discount: 0,
    total: 0,
    eventId: null,
    eventTitle: null,
    eventInfo: null,
    attendeeInfo: null,
    promoCode: null,
    promoCodeApplication: null,
    currentStep: 1,
  };
}

// Function to save cart to localStorage
function saveCartToStorage(state: CheckoutState) {
  try {
    const stateWithTimestamp = {
      ...state,
      lastUpdated: Date.now()
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

const initialState: CheckoutState = loadCartFromStorage();

// Helper function to calculate totals
function calculateTotals(items: CartItem[], simpleItems: SimpleCartItem[], promoCodeApplication: PromoCodeApplication | null) {
  const eventSubtotal = items.reduce((sum, item) => sum + (item.ticketType.price * item.quantity), 0);
  const simpleSubtotal = simpleItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const subtotal = eventSubtotal + simpleSubtotal;
  const discountAmount = promoCodeApplication ? promoCodeApplication.discountAmount : 0;
  const total = Math.max(0, subtotal - discountAmount);
  
  return { subtotal, discountAmount, discount: discountAmount, total };
}

function cartReducer(state: CheckoutState, action: CartAction): CheckoutState {
  let newState: CheckoutState;
  
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

      const { subtotal, discountAmount, discount, total } = calculateTotals(newItems, state.simpleItems, state.promoCodeApplication);
      newState = { ...state, items: newItems, subtotal, discountAmount, discount, total };
      break;
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.ticketType.id !== action.payload.ticketTypeId);
      const { subtotal, discountAmount, discount, total } = calculateTotals(newItems, state.simpleItems, state.promoCodeApplication);
      newState = { ...state, items: newItems, subtotal, discountAmount, discount, total };
      break;
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.ticketType.id === action.payload.ticketTypeId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);

      const { subtotal, discountAmount, discount, total } = calculateTotals(newItems, state.simpleItems, state.promoCodeApplication);
      newState = { ...state, items: newItems, subtotal, discountAmount, discount, total };
      break;
    }

    case 'SET_EVENT':
      newState = { ...state, eventId: action.payload.eventId, eventTitle: action.payload.eventTitle };
      break;

    case 'SET_EVENT_INFO':
      newState = { ...state, eventInfo: action.payload };
      break;

    case 'ADD_SIMPLE_ITEM': {
      const existingItemIndex = state.simpleItems.findIndex(
        item => item.product.id === action.payload.product.id
      );

      let newSimpleItems: SimpleCartItem[];
      if (existingItemIndex !== -1) {
        newSimpleItems = state.simpleItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newSimpleItems = [...state.simpleItems, action.payload];
      }

      const { subtotal, discountAmount, discount, total } = calculateTotals(state.items, newSimpleItems, state.promoCodeApplication);
      newState = { ...state, simpleItems: newSimpleItems, subtotal, discountAmount, discount, total };
      break;
    }

    case 'REMOVE_SIMPLE_ITEM': {
      const newSimpleItems = state.simpleItems.filter(item => item.product.id !== action.payload.productId);
      const { subtotal, discountAmount, discount, total } = calculateTotals(state.items, newSimpleItems, state.promoCodeApplication);
      newState = { ...state, simpleItems: newSimpleItems, subtotal, discountAmount, discount, total };
      break;
    }

    case 'UPDATE_SIMPLE_QUANTITY': {
      const newSimpleItems = state.simpleItems.map(item =>
        item.product.id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);

      const { subtotal, discountAmount, discount, total } = calculateTotals(state.items, newSimpleItems, state.promoCodeApplication);
      newState = { ...state, simpleItems: newSimpleItems, subtotal, discountAmount, discount, total };
      break;
    }

    case 'CLEAR_SIMPLE_CART': {
      const { subtotal, discountAmount, discount, total } = calculateTotals(state.items, [], state.promoCodeApplication);
      newState = { ...state, simpleItems: [], subtotal, discountAmount, discount, total };
      break;
    }

    case 'SET_ATTENDEE_INFO':
      newState = { ...state, attendeeInfo: action.payload };
      break;

    case 'SET_PROMO_CODE': {
      const { subtotal, discountAmount, discount, total } = calculateTotals(state.items, state.simpleItems, action.payload);
      newState = { 
        ...state, 
        promoCode: action.payload?.promoCode || null,
        promoCodeApplication: action.payload, 
        subtotal, 
        discountAmount,
        discount, 
        total 
      };
      break;
    }

    case 'SET_STEP':
      newState = { ...state, currentStep: action.payload };
      break;

    case 'CLEAR_CART': {
      newState = {
        items: [],
        simpleItems: [],
        subtotal: 0,
        discountAmount: 0,
        discount: 0,
        total: 0,
        eventId: null,
        eventTitle: null,
        eventInfo: null,
        attendeeInfo: null,
        promoCode: null,
        promoCodeApplication: null,
        currentStep: 1,
      };
      break;
    }

    default:
      newState = state;
  }

  // Save to localStorage after state change
  if (newState !== state) {
    saveCartToStorage(newState);
  }
  
  return newState;
}

interface CartContextType {
  state: CheckoutState;
  addItem: (ticketType: TicketType, quantity: number) => void;
  removeItem: (ticketTypeId: string) => void;
  updateQuantity: (ticketTypeId: string, quantity: number) => void;
  addSimpleItem: (product: SimpleProduct, quantity: number) => void;
  removeSimpleItem: (productId: string) => void;
  updateSimpleQuantity: (productId: string, quantity: number) => void;
  clearSimpleCart: () => void;
  setEvent: (eventId: string, eventTitle: string) => void;
  setEventInfo: (eventInfo: EventInfo) => void;
  setAttendeeInfo: (info: AttendeeInfo) => void;
  setPromoCode: (application: PromoCodeApplication | null) => void;
  setStep: (step: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Handle localStorage persistence
  useEffect(() => {
    // Clear expired cart items (older than 24 hours)
    const clearExpiredCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          const lastUpdated = parsedCart.lastUpdated || 0;
          const twentyFourHours = 24 * 60 * 60 * 1000;
          
          if (Date.now() - lastUpdated > twentyFourHours) {
            localStorage.removeItem(CART_STORAGE_KEY);
            dispatch({ type: 'CLEAR_CART' });
          }
        }
      } catch (error) {
        console.error('Error checking cart expiration:', error);
      }
    };

    clearExpiredCart();
  }, []);

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

  const addSimpleItem = (product: SimpleProduct, quantity: number) => {
    dispatch({ type: 'ADD_SIMPLE_ITEM', payload: { product, quantity } });
  };

  const removeSimpleItem = (productId: string) => {
    dispatch({ type: 'REMOVE_SIMPLE_ITEM', payload: { productId } });
  };

  const updateSimpleQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_SIMPLE_QUANTITY', payload: { productId, quantity } });
  };

  const clearSimpleCart = () => {
    dispatch({ type: 'CLEAR_SIMPLE_CART' });
  };

  const setEventInfo = (eventInfo: EventInfo) => {
    dispatch({ type: 'SET_EVENT_INFO', payload: eventInfo });
  };

  const setAttendeeInfo = (info: AttendeeInfo) => {
    dispatch({ type: 'SET_ATTENDEE_INFO', payload: info });
  };

  const setPromoCode = (application: PromoCodeApplication | null) => {
    dispatch({ type: 'SET_PROMO_CODE', payload: application });
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
      addSimpleItem,
      removeSimpleItem,
      updateSimpleQuantity,
      clearSimpleCart,
      setEvent,
      setEventInfo,
      setAttendeeInfo,
      setPromoCode,
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