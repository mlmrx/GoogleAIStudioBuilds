import React, { useState, useEffect } from 'react';
import { ChatMessage, CartItem, Product, CheckoutPhase, Order } from './types';
import { PRODUCTS } from './constants';
import * as geminiService from './services/geminiService';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import AgentPanel from './components/AgentPanel';
import Cart from './components/Cart';
import { Part } from '@google/genai';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(PRODUCTS);
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>('browsing');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    geminiService.startChatSession();
    setChatHistory([{ sender: 'agent', content: "Hello! I'm your AI shopping assistant. How can I help you find the perfect Apple product today?" }]);
  }, []);

  // Tool implementations
  const handleSearchProducts = (args: { query?: string; category?: string }): Product[] => {
    let filtered = PRODUCTS;
    if (args.category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === args.category!.toLowerCase());
    }
    if (args.query) {
      const lowerQuery = args.query.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      );
    }
    setDisplayedProducts(filtered);
    return filtered;
  };

  const handleAddToCart = (args: { productId: string; quantity?: number }): { success: boolean, message: string } => {
    const product = PRODUCTS.find(p => p.id === args.productId);
    if (!product) {
      return { success: false, message: `Product with ID ${args.productId} not found.` };
    }
    const quantity = args.quantity || 1;
    setCartItems(prev => {
      const existingItem = prev.find(item => item.productId === args.productId);
      if (existingItem) {
        return prev.map(item => item.productId === args.productId ? { ...item, quantity: item.quantity + quantity } : item);
      } else {
        return [...prev, { productId: args.productId, name: product.name, price: product.price, quantity }];
      }
    });
    return { success: true, message: `Added ${quantity} of ${product.name} to the cart.` };
  };

  const handleViewCart = (): CartItem[] => {
    return cartItems;
  };

  const handleInitiateCheckout = (): { success: boolean, message: string } => {
    if (cartItems.length > 0) {
      setCheckoutPhase('confirming');
      return { success: true, message: "Proceeding to checkout. Please confirm your order." };
    }
    return { success: false, message: "Your cart is empty." };
  };

  const handleConfirmAndPay = (): { success: boolean, message: string } => {
    if (cartItems.length === 0) {
      return { success: false, message: "Cannot checkout with an empty cart." };
    }
    setCheckoutPhase('authorizing');
    setTimeout(() => {
      setCheckoutPhase('processing');
      setTimeout(() => {
        const order: Order = {
          id: `ORD-${Date.now()}`,
          items: [...cartItems],
          total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          date: new Date(),
        };
        setCompletedOrder(order);
        setCheckoutPhase('complete');
        setCartItems([]);
      }, 2000);
    }, 1500);
    return { success: true, message: "Payment authorized. Processing your order now." };
  };

  const handleCancelCheckout = (): { success: boolean, message: string } => {
    setCheckoutPhase('browsing');
    return { success: true, message: "Checkout cancelled." };
  };

  const handleSendMessage = async (message: string) => {
    const newUserMessage: ChatMessage = { sender: 'user', content: message };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      let response = await geminiService.sendMessage(message);

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const toolResults: Part[] = [];

        for (const call of functionCalls) {
          const { name, args } = call;
          let result: any;
          switch (name) {
            case 'searchProducts':
              result = handleSearchProducts(args as any);
              break;
            case 'addToCart':
              result = handleAddToCart(args as any);
              break;
            case 'viewCart':
              result = handleViewCart();
              break;
            case 'initiateCheckout':
              result = handleInitiateCheckout();
              break;
            case 'confirmAndPay':
              result = handleConfirmAndPay();
              break;
            case 'cancelCheckout':
              result = handleCancelCheckout();
              break;
            default:
              result = { error: 'Unknown function' };
          }
          toolResults.push({ functionResponse: { name, response: { result } } });
        }
        response = await geminiService.sendMessage(toolResults);
      }

      if (response.text) {
        const newAgentMessage: ChatMessage = { sender: 'agent', content: response.text.trim() };
        setChatHistory(prev => [...prev, newAgentMessage]);
      }
    } catch (error) {
      console.error("Error communicating with agent:", error);
      const errorMessage: ChatMessage = { sender: 'agent', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncreaseQuantity = (productId: string) => {
    setCartItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item));
  };
  
  const handleDecreaseQuantity = (productId: string) => {
    setCartItems(prev => {
        const item = prev.find(item => item.productId === productId);
        if (item && item.quantity > 1) {
            return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i);
        }
        return prev.filter(i => i.productId !== productId);
    });
  };

  const handleStartNewOrder = () => {
    setCompletedOrder(null);
    setCheckoutPhase('browsing');
    setDisplayedProducts(PRODUCTS);
    setChatHistory([{ sender: 'agent', content: "Welcome back! What can I help you find?" }]);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <main className="container mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="md:col-span-2 xl:col-span-3">
              <ProductGrid products={displayedProducts} />
            </div>
          </div>
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            <div className="h-[60vh] min-h-[400px] max-h-[700px] border border-gray-200 rounded-xl shadow-sm">
                <AgentPanel
                    chatHistory={chatHistory}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                />
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm h-[400px]">
                <Cart 
                    cartItems={cartItems}
                    checkoutPhase={checkoutPhase}
                    completedOrder={completedOrder}
                    onInitiateCheckout={handleInitiateCheckout}
                    onConfirmAndPay={handleConfirmAndPay}
                    onCancelCheckout={handleCancelCheckout}
                    onStartNewOrder={handleStartNewOrder}
                    onIncreaseQuantity={handleIncreaseQuantity}
                    onDecreaseQuantity={handleDecreaseQuantity}
                />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
