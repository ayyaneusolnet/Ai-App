import React, { useState } from 'react';
import { X, Building, Shield, Check, Copy, AlertCircle } from 'lucide-react';
import { TIERS } from '../lib/tiers';
import { database } from '../lib/database';
import { emailService } from '../lib/supabase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: string;
  user: any;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, selectedTier, user }) => {
  const [paymentData, setPaymentData] = useState({
    accountName: '',
    transferAmount: '',
    transactionId: '',
    transferDate: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tier = TIERS[selectedTier];
  const bankDetails = {
    bankName: 'Meezan Bank Limited',
    accountTitle: 'AI Business Solutions',
    accountNumber: '01234567890123',
    iban: 'PK36MEZN0001234567890123',
    branchCode: '0123',
    swiftCode: 'MEZNPKKA'
  };

  const copyBankDetails = () => {
    const details = `Bank: ${bankDetails.bankName}
Account Title: ${bankDetails.accountTitle}
Account Number: ${bankDetails.accountNumber}
IBAN: ${bankDetails.iban}
Amount: $${tier.price.toFixed(2)}`;
    
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async () => {
    if (!paymentData.accountName || !paymentData.transferAmount || !paymentData.transactionId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Process payment with tier upgrade
      const paymentResult = await PaymentProcessor.processPayment(
        parseFloat(paymentData.transferAmount),
        'USD',
        'bank_transfer',
        user,
        selectedTier
      );
      
      if (paymentResult.success) {
        // Payment successful - tier already updated in PaymentProcessor
        alert(`Payment successful! Your plan has been upgraded to ${tier.name}. Please refresh the page to see changes.`);
        
        // Trigger page refresh to update UI
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert('Payment failed. Please try again.');
      }
      
      // Create payment record
      const payment = {
        amount: parseFloat(paymentData.transferAmount),
        currency: 'USD',
        status: 'completed',
        payment_method: 'bank_transfer',
        transaction_id: paymentResult.transactionId || paymentData.transactionId,
        tier: selectedTier,
        billing_period_start: new Date().toISOString().split('T')[0],
        billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payment_details: {
          account_name: paymentData.accountName,
          transfer_date: paymentData.transferDate,
          notes: paymentData.notes,
          bank_details: bankDetails
        }
      };

      const { data, error } = await database.createPayment(payment);

    } catch (error) {
      console.error('Payment error:', error);
      alert('Error processing payment. Please try again.');
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bank Transfer Payment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">{tier.name} Plan</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-400">Monthly subscription:</span>
                <span className="text-blue-800 dark:text-blue-300 font-semibold">${tier.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-blue-300 dark:border-blue-700 pt-1">
                <span className="text-blue-800 dark:text-blue-300">Total Amount:</span>
                <span className="text-blue-800 dark:text-blue-300">${tier.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Payment Instructions</h4>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                    Please transfer the exact amount to our bank account and submit the payment details below.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800 dark:text-white flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Bank Details</span>
                </h4>
                <button
                  onClick={copyBankDetails}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Details'}</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-gray-400">Bank Name:</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-gray-400">Account Title:</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{bankDetails.accountTitle}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-gray-400">Account Number:</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{bankDetails.accountNumber}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-gray-400">IBAN:</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{bankDetails.iban}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-gray-400">Branch Code:</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{bankDetails.branchCode}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-gray-400">SWIFT Code:</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{bankDetails.swiftCode}</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-300 font-semibold">
                  Transfer Amount: ${tier.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-white">Payment Confirmation Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    Your Account Name *
                  </label>
                  <input
                    type="text"
                    value={paymentData.accountName}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, accountName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Name on your bank account"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    Transfer Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentData.transferAmount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, transferAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={tier.price.toFixed(2)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    Transaction ID / Reference *
                  </label>
                  <input
                    type="text"
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Bank transaction reference"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    Transfer Date
                  </label>
                  <input
                    type="date"
                    value={paymentData.transferDate}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, transferDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none dark:bg-gray-700 dark:text-white"
                  placeholder="Any additional information about the transfer..."
                />
              </div>
            </div>

            <button
              onClick={handleSubmitPayment}
              disabled={isSubmitting || !paymentData.accountName || !paymentData.transferAmount || !paymentData.transactionId}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting Payment...' : 'Submit Payment Confirmation'}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-400">
                Your payment will be verified within 24 hours and your plan will be activated automatically.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;