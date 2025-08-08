import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';

interface CheckoutModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  total: number;
}

type CheckoutStep = 'form' | 'processing' | 'success';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, setIsOpen, total }) => {
  const { dispatch } = useCart();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<CheckoutStep>('form');

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
    }, 2500);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after a delay to allow for closing animation
    setTimeout(() => {
        if(step === 'success') {
            dispatch({ type: 'CLEAR_CART' });
        }
        setPhone('');
        setStep('form');
    }, 300);
  };

  if (!isOpen) return null;

  const renderForm = () => (
    <form onSubmit={handlePayment}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
            Secure Checkout
        </h3>
        <span className="text-sm font-semibold text-gray-500">Powered by <span className="text-blue-600 font-bold">Paystack</span></span>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          You are paying a total of{' '}
          <span className="font-bold text-teal-600">Ksh {total.toLocaleString()}</span>.
        </p>
        <div className="mt-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">M-Pesa Number for Payment & Receipt</label>
            <input 
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                placeholder="0712345678"
                required
            />
        </div>
      </div>
      <div className="mt-6 sm:flex sm:flex-row-reverse">
        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 sm:ml-3 sm:w-auto">
          Pay Ksh {total.toLocaleString()}
        </button>
        <button type="button" onClick={handleClose} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
          Cancel
        </button>
      </div>
    </form>
  );

  const renderProcessing = () => (
    <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
           <svg className="h-8 w-8 text-teal-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-6 text-gray-900">Connecting to Paystack...</h3>
        <p className="mt-2 text-sm text-gray-600">Check your phone for a payment prompt to enter your PIN.</p>
    </div>
  )

  const renderSuccess = () => (
    <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-6 text-gray-900">Payment Successful!</h3>
        <p className="mt-2 text-sm text-gray-600">Asante sana! Your payment via Paystack is confirmed. A receipt has been sent to {phone}.</p>
        <div className="mt-6">
            <button type="button" onClick={handleClose} className="inline-flex w-full justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 sm:w-auto">
                Close
            </button>
        </div>
    </div>
  )


  return (
    <div className="relative z-40" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            {step === 'form' && renderForm()}
            {step === 'processing' && renderProcessing()}
            {step === 'success' && renderSuccess()}
          </div>
        </div>
      </div>
    </div>
  );
};