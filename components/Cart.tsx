import React from 'react';
import { CartItem, CheckoutPhase, Order } from '../types';
import { CartIcon, CheckIcon, SpinnerIcon, ShieldCheckIcon } from './Icons';

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
      case 'authorizing':
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
            <ShieldCheckIcon className="w-12 h-12 text-blue-500" />
            <p className="mt-4 text-lg font-semibold text-gray-800">Authorizing Payment</p>
            <p className="text-sm">Generating secure Shared Payment Token...<br/>Your financial details are not shared directly with the merchant.</p>
          </div>
        );
      case 'processing':
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <SpinnerIcon className="w-12 h-12 animate-spin text-blue-500" />
            <p className="mt-4 text-lg font-semibold text-gray-800">Processing Payment...</p>
            <p className="text-sm">Please wait, this won't take long.</p>
          </div>
        );
      case 'complete':
        if (!completedOrder) return null;
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2 flex items-center gap-2">
              <CheckIcon className="text-green-500"/>
              Order Confirmed!
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 text-sm">
                <p className="bg-gray-100 p-2 rounded-md text-gray-700">Order ID: <span className="font-mono text-blue-500">{completedOrder.id}</span></p>
                <h3 className="font-bold my-3 text-gray-600">Items Purchased:</h3>
                <div className="space-y-2">
                    {completedOrder.items.map(item => (
                    <div key={item.productId} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                        <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">
                            {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                        </div>
                        <p className="font-bold text-gray-800">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                    ))}
                </div>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span className="text-gray-600">Total Paid:</span>
                <span className="text-green-600">${completedOrder.total.toFixed(2)}</span>
              </div>
              <button
                onClick={onStartNewOrder}
                className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2 flex items-center gap-2">
              <CartIcon/>
              {isConfirming ? 'Confirm Your Order' : 'Shopping Cart'}
            </h2>
            {cartItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.productId} className={`bg-gray-50 border border-gray-200 p-2 rounded-md transition-all ${isConfirming ? 'opacity-60' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                        <p className="font-bold text-gray-800">${(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button
                          onClick={() => onDecreaseQuantity(item.productId)}
                          disabled={isConfirming}
                          className="w-7 h-7 bg-gray-200 rounded-md flex items-center justify-center text-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >-</button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onIncreaseQuantity(item.productId)}
                          disabled={isConfirming}
                          className="w-7 h-7 bg-gray-200 rounded-md flex items-center justify-center text-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Increase quantity of ${item.name}`}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span className="text-gray-600">Total:</span>
                <span className="text-gray-900">${total.toFixed(2)}</span>
              </div>
              {isConfirming ? (
                <div className="space-y-2">
                    <button
                        onClick={onConfirmAndPay}
                        disabled={cartItems.length === 0}
                        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Confirm & Pay
                    </button>
                    <button
                        onClick={onCancelCheckout}
                        className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
              ) : (
                <button
                  onClick={onInitiateCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
