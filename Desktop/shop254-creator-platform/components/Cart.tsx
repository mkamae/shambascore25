

import React, { useState, Fragment, useMemo } from 'react';
import { useCart } from '../hooks/useCart';
import { CheckoutModal } from './CheckoutModal';
import { CartIcon } from './icons/CartIcon';

interface CartProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, setIsOpen }) => {
  const { state, dispatch } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const subtotal = useMemo(() => 
    state.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [state.items]
  );

  const handleCheckout = () => {
    setIsOpen(false);
    setIsCheckoutOpen(true);
  }

  const handleClose = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <>
    <div className="relative z-30" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Background backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ${isOpen ? 'ease-in-out duration-500 opacity-100' : 'ease-in-out duration-500 opacity-0'}`}
        onClick={handleClose}
      ></div>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className={`pointer-events-auto w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-gray-900" id="slide-over-title">Shopping Cart</h2>
                    <div className="ml-3 flex h-7 items-center">
                      <button type="button" className="relative -m-2 p-2 text-gray-400 hover:text-gray-500" onClick={handleClose}>
                        <span className="absolute -inset-0.5"></span>
                        <span className="sr-only">Close panel</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flow-root">
                      {state.items.length > 0 ? (
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {state.items.map((item) => (
                            <li key={item.id} className="flex py-6">
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img src={item.imageUrls[0]} alt={item.name} className="h-full w-full object-cover object-center"/>
                              </div>
                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>{item.name}</h3>
                                    <p className="ml-4">Ksh {item.price.toLocaleString()}</p>
                                  </div>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <p className="text-gray-500">Qty {item.quantity}</p>
                                  <div className="flex">
                                    <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })} type="button" className="font-medium text-teal-600 hover:text-teal-500">Ondoa</button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-10">
                            <CartIcon className="mx-auto h-12 w-12 text-gray-400"/>
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">Your cart is empty</h3>
                            <p className="mt-1 text-sm text-gray-500">Ongeza vitu from the storefront.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {state.items.length > 0 && (
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>Ksh {subtotal.toLocaleString()}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                    <div className="mt-6">
                      <button onClick={handleCheckout} className="flex w-full items-center justify-center rounded-md border border-transparent bg-teal-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-700">
                        Checkout
                      </button>
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                      <p>
                        or&nbsp;
                        <button type="button" className="font-medium text-teal-600 hover:text-teal-500" onClick={handleClose}>
                          Continue Shopping
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <CheckoutModal isOpen={isCheckoutOpen} setIsOpen={setIsCheckoutOpen} total={subtotal} />
    </>
  );
};