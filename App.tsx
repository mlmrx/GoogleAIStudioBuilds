import React, { useState, useEffect } from 'react';
import { Product, CartItem, ChatMessage, CheckoutPhase, Order } from './types';
import { PRODUCTS } from './constants';
import { runAgentInteraction } from './services/geminiService';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import AgentPanel from './components/AgentPanel';
import Cart from './components/Cart';

const App: React.FC = () => {
  const [products] = useState<Product[]>(PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>('browsing');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setChatHistory([{ 
      sender: 'agent', 
      content: "Welcome. I'm your personal shopping assistant for Apple products. How can I help you find the perfect device today? You can ask me to find products, add them to your cart, or view your cart." 
    }]);
  }, []);

  const addAgentMessage = (content: string) => {
    setChatHistory(prev => [...prev, { sender: 'agent', content }]);
  };

  const handleSearchProducts = (query: string, maxPrice?: number): string => {
    let results = [...products];
    if (query) {
      results = results.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()));
    }
    if (maxPrice) {
      results = results.filter(p => p.price <= maxPrice);
    }
    setFilteredProducts(results);
    if (results.length > 0) {
      return `I found ${results.length} products matching your criteria. I've updated the product list for you.`;
    }
    return "I couldn't find any products matching your criteria. Please try a different search.";
  };

  const handleAddToCart = (productId: string, quantity: number): string => {
    if (checkoutPhase !== 'browsing') {
      return "You can't add items to the cart while a checkout is in progress.";
    }
    const product = products.find(p => p.id === productId);
    if (!product) {
      return `I couldn't find a product with ID ${productId}.`;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { productId, name: product.name, price: product.price, quantity }];
    });
    return `Successfully added ${quantity} of "${product.name}" to your cart.`;
  };

  const handleGetCart = (): string => {
    if (cart.length === 0) {
      return "Your cart is currently empty.";
    }
    const cartDetails = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
    return `Your cart contains: ${cartDetails}. The total is $${total}.`;
  };

  const handleInitiateCheckout = (): string => {
    if (cart.length === 0) {
      return "There is nothing in your cart to checkout.";
    }
    setCheckoutPhase('confirming');
    return "Great! Please review your order in the cart panel and click 'Confirm & Pay' to proceed.";
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number): string => {
    if (checkoutPhase !== 'browsing') {
      return "You can't modify the cart while a checkout is in progress.";
    }
    const product = products.find(p => p.id === productId);
    if (!product) {
      return `I couldn't find a product with ID ${productId}.`;
    }
    const itemInCart = cart.find(item => item.productId === productId);
    if (!itemInCart) {
        return `Product "${product.name}" is not in the cart.`;
    }
    
    if (quantity > 0) {
      setCart(prevCart => prevCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ));
      return `Updated "${product.name}" quantity to ${quantity}.`;
    } else {
      setCart(prevCart => prevCart.filter(item => item.productId !== productId));
      return `Removed "${product.name}" from the cart.`;
    }
  };

  const handleIncreaseQuantity = (productId: string) => {
    if (checkoutPhase !== 'browsing') return;
    setCart(prevCart => {
      return prevCart.map(item =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
    });
  };

  const handleDecreaseQuantity = (productId: string) => {
    if (checkoutPhase !== 'browsing') return;
    setCart(prevCart => {
      const item = prevCart.find(i => i.productId === productId);
      if (item && item.quantity <= 1) {
        return prevCart.filter(i => i.productId !== productId);
      }
      return prevCart.map(item =>
        item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const handleConfirmAndPay = () => {
    setCheckoutPhase('authorizing');
    addAgentMessage("Thank you. To protect your payment details, I'm now creating a secure, single-use token for this transaction. This is part of the Agentic Commerce Protocol.");

    setTimeout(() => {
      setCheckoutPhase('processing');
      addAgentMessage("Secure token created. I'm now processing your payment with the merchant. This may take a moment.");
      
      setTimeout(() => {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const order: Order = {
          id: `ACP-${Date.now()}`,
          items: [...cart],
          total,
          date: new Date(),
        };
        setCompletedOrder(order);
        setCheckoutPhase('complete');
        addAgentMessage(`Success! Your payment is complete. Your order #${order.id} has been confirmed. Thank you for your purchase!`);
        setCart([]);
      }, 2500);
    }, 2000);
  };
  
  const handleCancelCheckout = () => {
    setCheckoutPhase('browsing');
    addAgentMessage("No problem, the checkout has been cancelled. You can continue shopping.");
  };

  const handleStartNewOrder = () => {
    setCheckoutPhase('browsing');
    setCompletedOrder(null);
    setFilteredProducts(PRODUCTS);
    addAgentMessage("What would you like to find next?");
  };

  const handleUserMessage = async (message: string) => {
    setChatHistory(prev => [...prev, { sender: 'user', content: message }]);
    setIsLoading(true);

    try {
      const result = await runAgentInteraction(message, products);
      let agentResponse = "I'm sorry, I couldn't process that request. Could you try rephrasing it?";
      
      if (result.functionCalls && result.functionCalls.length > 0) {
        const call = result.functionCalls[0];
        console.log("Agent wants to call function:", call);

        switch (call.name) {
          case 'searchProducts':
            agentResponse = handleSearchProducts(call.args.query, call.args.maxPrice);
            break;
          case 'addToCart':
            agentResponse = handleAddToCart(call.args.productId, call.args.quantity);
            break;
          case 'getCart':
            agentResponse = handleGetCart();
            break;
          case 'checkout':
            agentResponse = handleInitiateCheckout();
            break;
          case 'updateCartQuantity':
            agentResponse = handleUpdateCartQuantity(call.args.productId, call.args.quantity);
            break;
          default:
            agentResponse = `Unknown function call: ${call.name}`;
        }
      } else if(result.text) {
        agentResponse = result.text;
      }
      
      addAgentMessage(agentResponse);
    } catch (error) {
      console.error("Error processing agent interaction:", error);
      addAgentMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen font-sans">
      <Header />
      <main className="container mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">
        <div className="lg:col-span-4 xl:col-span-3 h-full overflow-y-auto bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <ProductGrid products={filteredProducts} />
        </div>
        <div className="lg:col-span-5 xl:col-span-6 h-full flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm">
          <AgentPanel 
            chatHistory={chatHistory} 
            onSendMessage={handleUserMessage} 
            isLoading={isLoading} 
          />
        </div>
        <div className="lg:col-span-3 xl:col-span-3 h-full overflow-y-auto bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <Cart 
            cartItems={cart}
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
      </main>
    </div>
  );
};

export default App;
