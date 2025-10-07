import React from 'react';
import { CartItem, CheckoutPhase, Order } from '../types';
import { CartIcon, CheckIcon, SpinnerIcon } from './Icons';

interface CartProps {
  cartItems: CartItem[];
  checkoutPhase: CheckoutPhase;
  completedOrder: Order | null;
  onInitiateCheckout: () => void;
  onConfirmAndPay: () => void;
  onCancelCheckout: () => void;
  onStartNewOrder: () => void;
  onIncreaseQuantity: (productId: string) => void;
  onDecreaseQuantity: (productId: string) => void;
}

const Cart: React.FC<CartProps> = ({ 
  cartItems, 
  checkoutPhase, 
  completedOrder,
  onInitiateCheckout,
  onConfirmAndPay,
  onCancelCheckout,
  onStartNewOrder,
  onIncreaseQuantity,
  onDecreaseQuantity
}) => {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderContent = () => {
    switch (checkoutPhase) {
      case 'processing':
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <SpinnerIcon className="w-12 h-12 animate-spin text-cyan-400" />
            <p className="mt-4 text-lg font-semibold">Processing Payment...</p>
            <p className="text-sm">Please wait, this won't take long.</p>
          </div>
        );
      case 'complete':
        if (!completedOrder) return null;
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-slate-700 pb-2 flex items-center gap-2">
              <CheckIcon className="text-green-400"/>
              Order Confirmed!
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 text-sm">
                <p className="bg-slate-800 p-2 rounded-md">Order ID: <span className="font-mono text-cyan-400">{completedOrder.id}</span></p>
                <h3 className="font-bold my-3 text-slate-300">Items Purchased:</h3>
                <div className="space-y-2">
                    {completedOrder.items.map(item => (
                    <div key={item.productId} className="flex justify-between items-center bg-slate-800 p-2 rounded-md">
                        <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-slate-400">
                            {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                        </div>
                        <p className="font-bold text-cyan-400">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                    ))}
                </div>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span className="text-slate-300">Total Paid:</span>
                <span className="text-green-400">${completedOrder.total.toFixed(2)}</span>
              </div>
              <button
                onClick={onStartNewOrder}
                className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors"
              >
                Shop Again
              </button>
            </div>
          </div>
        );
      case 'browsing':
      case 'confirming':
      default:
        const isConfirming = checkoutPhase === 'confirming';
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-slate-700 pb-2 flex items-center gap-2">
              <CartIcon/>
              {isConfirming ? 'Confirm Your Order' : 'Shopping Cart'}
            </h2>
            {cartItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.productId} className={`bg-slate-800 p-2 rounded-md transition-all ${isConfirming ? 'opacity-60' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-slate-400">${item.price.toFixed(2)} each</p>
                        </div>
                        <p className="font-bold text-cyan-400">${(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button
                          onClick={() => onDecreaseQuantity(item.productId)}
                          disabled={isConfirming}
                          className="w-7 h-7 bg-slate-700 rounded-md flex items-center justify-center text-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >-</button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onIncreaseQuantity(item.productId)}
                          disabled={isConfirming}
                          className="w-7 h-7 bg-slate-700 rounded-md flex items-center justify-center text-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Increase quantity of ${item.name}`}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-auto pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span className="text-slate-300">Total:</span>
                <span className="text-cyan-300">${total.toFixed(2)}</span>
              </div>
              {isConfirming ? (
                <div className="space-y-2">
                    <button
                        onClick={onConfirmAndPay}
                        disabled={cartItems.length === 0}
                        className="w-full bg-violet-600 text-white font-bold py-2 px-4 rounded-md hover:bg-violet-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        Confirm & Pay
                    </button>
                    <button
                        onClick={onCancelCheckout}
                        className="w-full bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
              ) : (
                <button
                  onClick={onInitiateCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full bg-violet-600 text-white font-bold py-2 px-4 rounded-md hover:bg-violet-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  Checkout
                </button>
              )}
            </div>
          </div>
        );
    }
  };

  return <div className="flex flex-col h-full">{renderContent()}</div>;
};

export default Cart;