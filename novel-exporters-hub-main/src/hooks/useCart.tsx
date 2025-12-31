import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/products';
import { api } from '@/lib/api';

interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    updateQuantity: (productId: string, quantity: number) => void;
    totalItems: number;
    requestQuote: (deliveryNote?: string, deliveryDate?: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage or backend on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }

        const token = localStorage.getItem('token');
        if (token) {
            api.getMe().then(user => {
                if (user && user.cart) {
                    setCart(user.cart);
                }
            });
        }
    }, []);

    // Save cart to localStorage and sync with backend
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));

        const token = localStorage.getItem('token');
        if (token && cart.length > 0) {
            api.updateCart(cart);
        }
    }, [cart]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        ));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const requestQuote = async (deliveryNote?: string, deliveryDate?: string) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Login required");

        await api.createOrder({
            products: cart.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity
            })),
            delivery_request: deliveryNote,
            requested_delivery_date: deliveryDate
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
