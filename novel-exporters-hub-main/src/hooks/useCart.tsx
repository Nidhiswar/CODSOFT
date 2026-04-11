import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/data/products';
import { api } from '@/lib/api';

export type WeightUnit = 'kg' | 'g';

interface CartItem extends Product {
    quantity: number;
    unit: WeightUnit;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updateUnit: (productId: string, unit: WeightUnit) => void;
    totalItems: number;
    requestQuote: (deliveryNote?: string, deliveryDate?: string, deliveryLocation?: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart';
const CART_SNAPSHOT_KEY = 'cart_snapshot_at';

const isWeightUnit = (unit: unknown): unit is WeightUnit => unit === 'kg' || unit === 'g';

const normalizeCart = (rawCart: unknown): CartItem[] => {
    if (!Array.isArray(rawCart)) return [];

    return rawCart
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && typeof (item as { id?: unknown }).id === 'string')
        .map(item => {
            const quantity = typeof item.quantity === 'number' ? item.quantity : Number(item.quantity);
            return {
                ...(item as unknown as Product),
                quantity: Number.isFinite(quantity) ? Math.max(1, quantity) : 1,
                unit: isWeightUnit(item.unit) ? item.unit : 'kg'
            } as CartItem;
        });
};

const parseStoredCart = (): CartItem[] => {
    try {
        const rawCart = localStorage.getItem(CART_STORAGE_KEY);
        if (!rawCart) return [];

        const parsed = JSON.parse(rawCart);
        return normalizeCart(parsed);
    } catch {
        return [];
    }
};

const persistCartSnapshot = (cart: CartItem[]) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    localStorage.setItem(CART_SNAPSHOT_KEY, Date.now().toString());
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => parseStoredCart());
    const syncQueueRef = useRef<Promise<unknown>>(Promise.resolve());

    const queueBackendSync = useCallback((nextCart: CartItem[]) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        syncQueueRef.current = syncQueueRef.current
            .catch(() => undefined)
            .then(() => api.updateCart(nextCart))
            .catch(() => {
                console.error('Failed to sync cart');
            });
    }, []);

    const applyCartUpdate = useCallback((updater: (prev: CartItem[]) => CartItem[]) => {
        setCart(prev => {
            const next = updater(prev);
            persistCartSnapshot(next);
            queueBackendSync(next);
            return next;
        });
    }, [queueBackendSync]);

    // Hydrate cart once and prevent late API responses from reviving stale items.
    useEffect(() => {
        const localCartAtMount = parseStoredCart();
        const hasSnapshotAtMount = localStorage.getItem(CART_SNAPSHOT_KEY) !== null;
        if (!hasSnapshotAtMount && localCartAtMount.length > 0) {
            persistCartSnapshot(localCartAtMount);
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        let isActive = true;

        api.getMe()
            .then(user => {
                if (!isActive || !user) return;

                const backendCart = normalizeCart(user.cart);
                const latestLocalCart = parseStoredCart();
                const hasLatestLocalSnapshot = localStorage.getItem(CART_SNAPSHOT_KEY) !== null;

                if (hasLatestLocalSnapshot) {
                    setCart(latestLocalCart);
                    queueBackendSync(latestLocalCart);
                    return;
                }

                setCart(backendCart);
                persistCartSnapshot(backendCart);
            })
            .catch(() => {
                // Keep local cart when backend sync fails.
            });

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        const handleStorageSync = (event: StorageEvent) => {
            if (event.key === CART_STORAGE_KEY) {
                setCart(parseStoredCart());
            }
        };

        window.addEventListener('storage', handleStorageSync);
        return () => window.removeEventListener('storage', handleStorageSync);
    }, []);

    const addToCart = (product: Product) => {
        applyCartUpdate(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1, unit: 'kg' as WeightUnit }];
        });
    };

    const removeFromCart = (productId: string) => {
        applyCartUpdate(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        applyCartUpdate(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        ));
    };

    const updateUnit = (productId: string, unit: WeightUnit) => {
        applyCartUpdate(prev => prev.map(item =>
            item.id === productId ? { ...item, unit } : item
        ));
    };

    const clearCart = () => {
        applyCartUpdate(() => []);
    };

    const totalItems = cart.length;

    const requestQuote = async (deliveryNote?: string, deliveryDate?: string, deliveryLocation?: string) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Login required");

        // Validate all quantities are at least 1
        const invalidItems = cart.filter(item => item.quantity < 1);
        if (invalidItems.length > 0) {
            throw new Error("All products must have a quantity of at least 1");
        }

        await api.createOrder({
            products: cart.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit
            })),
            delivery_request: deliveryNote,
            requested_delivery_date: deliveryDate,
            delivery_location: deliveryLocation
        });

        clearCart();
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            updateQuantity,
            updateUnit,
            totalItems,
            requestQuote
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
