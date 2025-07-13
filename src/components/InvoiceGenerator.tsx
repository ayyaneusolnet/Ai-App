import React, { useState, useRef } from 'react';
import { 
  Download, 
  Eye, 
  Upload, 
  X, 
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useDropzone } from 'react-dropzone';
import { TierManager } from '../lib/tiers';
import TierUpgradeModal from './TierUpgradeModal';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  dueDate: string;
  items: InvoiceItem[];
  logo?: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  notes: string;
  terms: string;
  taxRate: number;
  taxAmount: number;
  paymentInfo: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
  };
}

interface InvoiceGeneratorProps {
  onSave: (invoice: any) => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ onSave }) => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    companyName: 'Your Company Name',
    companyAddress: '123 Business St, City, State 12345',
    companyEmail: 'contact@yourcompany.com',
    companyPhone: '+1 (555) 123-4567',
    notes: 'Thank you for your business!',
    terms: 'Payment is due within 30 days of invoice date.',
    taxRate: 0,
    taxAmount: 0,
    paymentInfo: {
      bankName: 'Meezan Bank Limited',
      accountTitle: 'Your Business Name',
      accountNumber: '01234567890123',
      iban: 'PK36MEZN0001234567890123'
    }
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setInvoiceData(prev => ({ ...prev, logo: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    }
  });

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = (subtotal?: number) => {
    const baseAmount = subtotal || calculateSubtotal();
    return (baseAmount * invoiceData.taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  // Update tax amount when tax rate or items change
  React.useEffect(() => {
    const subtotal = calculateSubtotal();
    const newTaxAmount = calculateTax(subtotal);
    setInvoiceData(prev => ({ ...prev, taxAmount: newTaxAmount }));
  }, [invoiceData.taxRate, invoiceData.items]);

  const generatePDF = async () => {
    // Check tier limits
    if (!TierManager.canUseFeature('pdfExports')) {
      setShowUpgradeModal(true);
      return;
    }
    
    if (!invoiceRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${invoiceData.invoiceNumber || 'draft'}.pdf`);
      TierManager.updateUsage('pdfExports');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    // Check tier limits
    if (!TierManager.canUseFeature('invoices')) {
      setShowUpgradeModal(true);
      return;
    }
    
    if (!invoiceData.clientName || !invoiceData.clientEmail) {
      alert('Please fill in client name and email');
      return;
    }

    const invoiceToSave = {
      invoice_number: invoiceData.invoiceNumber || `INV-${Date.now()}`,
      client_name: invoiceData.clientName,
      client_email: invoiceData.clientEmail,
      client_address: invoiceData.clientAddress,
      amount: calculateTotal(),
      tax_rate: invoiceData.taxRate,
      tax_amount: calculateTax(),
      due_date: invoiceData.dueDate,
      items: invoiceData.items,
      company_info: {
        name: invoiceData.companyName,
        address: invoiceData.companyAddress,
        email: invoiceData.companyEmail,
        phone: invoiceData.companyPhone,
        logo: invoiceData.logo
      },
      payment_info: invoiceData.paymentInfo,
      notes: invoiceData.notes,
      terms: invoiceData.terms,
      status: 'draft'
    };

    console.log('💾 Saving invoice:', invoiceToSave);
    onSave(invoiceToSave);
    TierManager.updateUsage('invoices');
  };

  const InvoicePreview = () => (
    <div ref={invoiceRef} className="bg-white p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          {invoiceData.logo && (
            <img src={invoiceData.logo} alt="Company Logo" className="h-16 w-auto" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{invoiceData.companyName}</h1>
            <p className="text-slate-600">{invoiceData.companyAddress}</p>
            <p className="text-slate-600">{invoiceData.companyEmail}</p>
            <p className="text-slate-600">{invoiceData.companyPhone}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-slate-800">INVOICE</h2>
          <p className="text-slate-600">#{invoiceData.invoiceNumber}</p>
          <p className="text-slate-600">Date: {new Date().toLocaleDateString()}</p>
          <p className="text-slate-600">Due: {invoiceData.dueDate}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Bill To:</h3>
        <div className="text-slate-600">
          <p className="font-medium">{invoiceData.clientName}</p>
          <p>{invoiceData.clientEmail}</p>
          <p className="whitespace-pre-line">{invoiceData.clientAddress}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-4 py-2 text-left">Description</th>
              <th className="border border-slate-300 px-4 py-2 text-center">Qty</th>
              <th className="border border-slate-300 px-4 py-2 text-right">Rate</th>
              <th className="border border-slate-300 px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index}>
                <td className="border border-slate-300 px-4 py-2">{item.description}</td>
                <td className="border border-slate-300 px-4 py-2 text-center">{item.quantity}</td>
                <td className="border border-slate-300 px-4 py-2 text-right">${item.rate.toFixed(2)}</td>
                <td className="border border-slate-300 px-4 py-2 text-right">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          {invoiceData.taxRate > 0 && (
            <div className="flex justify-between py-2">
              <span>Tax ({invoiceData.taxRate}%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t border-slate-300 font-bold text-lg">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-8 p-4 bg-slate-50 rounded-lg border">
        <h4 className="font-semibold text-slate-800 mb-3">Payment Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Bank Name:</p>
            <p className="font-medium text-slate-800">{invoiceData.paymentInfo.bankName}</p>
          </div>
          <div>
            <p className="text-slate-600">Account Title:</p>
            <p className="font-medium text-slate-800">{invoiceData.paymentInfo.accountTitle}</p>
          </div>
          <div>
            <p className="text-slate-600">Account Number:</p>
            <p className="font-medium text-slate-800">{invoiceData.paymentInfo.accountNumber}</p>
          </div>
          <div>
            <p className="text-slate-600">IBAN:</p>
            <p className="font-medium text-slate-800">{invoiceData.paymentInfo.iban}</p>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {invoiceData.notes && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Notes:</h4>
            <p className="text-slate-600 text-sm">{invoiceData.notes}</p>
          </div>
        )}
        {invoiceData.terms && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Terms & Conditions:</h4>
            <p className="text-slate-600 text-sm">{invoiceData.terms}</p>
          </div>
        )}
      </div>
    </div>
  );

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Invoice Preview</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
        <InvoicePreview />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="bg-slate-50 rounded-lg p-6 border">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Company Information</h3>
        
        {/* Logo Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo</label>
          <div {...getRootProps()} className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-slate-400 transition-colors">
            <input {...getInputProps()} />
            {invoiceData.logo ? (
              <div className="flex items-center justify-center space-x-4">
                <img src={invoiceData.logo} alt="Logo" className="h-16 w-auto" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInvoiceData(prev => ({ ...prev, logo: undefined }));
                  }}
                  className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">Drop your logo here or click to upload</p>
                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
            <input
              type="text"
              value={invoiceData.companyName}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Email</label>
            <input
              type="email"
              value={invoiceData.companyEmail}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, companyEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Address</label>
            <textarea
              value={invoiceData.companyAddress}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, companyAddress: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Phone</label>
            <input
              type="tel"
              value={invoiceData.companyPhone}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, companyPhone: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Number</label>
          <input
            type="text"
            value={invoiceData.invoiceNumber}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={`INV-${Date.now()}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
          <input
            type="date"
            value={invoiceData.dueDate}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Client Name</label>
          <input
            type="text"
            value={invoiceData.clientName}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter client name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Client Email</label>
          <input
            type="email"
            value={invoiceData.clientEmail}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="client@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Client Address</label>
        <textarea
          value={invoiceData.clientAddress}
          onChange={(e) => setInvoiceData(prev => ({ ...prev, clientAddress: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none"
          placeholder="Client address"
        />
      </div>

      {/* Invoice Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-slate-700">Invoice Items</label>
          <button
            onClick={addItem}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {invoiceData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-5">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Item description"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Qty"
                  min="1"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Rate"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={`$${item.amount.toFixed(2)}`}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
              <div className="col-span-1">
                {invoiceData.items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tax Configuration */}
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={invoiceData.taxRate}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                step="0.01"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tax Amount
              </label>
              <input
                type="text"
                value={`$${calculateTax().toFixed(2)}`}
                readOnly
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
            </div>
            {invoiceData.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Tax ({invoiceData.taxRate}%):</span>
                <span className="font-medium">${calculateTax().toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold text-slate-800">Total:</span>
              <span className="text-xl font-bold text-green-600">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-slate-50 rounded-lg p-6 border">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bank Name</label>
            <input
              type="text"
              value={invoiceData.paymentInfo.bankName}
              onChange={(e) => setInvoiceData(prev => ({
                ...prev,
                paymentInfo: { ...prev.paymentInfo, bankName: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Account Title</label>
            <input
              type="text"
              value={invoiceData.paymentInfo.accountTitle}
              onChange={(e) => setInvoiceData(prev => ({
                ...prev,
                paymentInfo: { ...prev.paymentInfo, accountTitle: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Account Number</label>
            <input
              type="text"
              value={invoiceData.paymentInfo.accountNumber}
              onChange={(e) => setInvoiceData(prev => ({
                ...prev,
                paymentInfo: { ...prev.paymentInfo, accountNumber: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">IBAN</label>
            <input
              type="text"
              value={invoiceData.paymentInfo.iban}
              onChange={(e) => setInvoiceData(prev => ({
                ...prev,
                paymentInfo: { ...prev.paymentInfo, iban: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
          <textarea
            value={invoiceData.notes}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
            placeholder="Additional notes..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Terms & Conditions</label>
          <textarea
            value={invoiceData.terms}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, terms: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
            placeholder="Payment terms..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Invoice</span>
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>
      </div>
      
      <TierUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentFeature="invoice generation"
      />
    </div>
  );
};

export default InvoiceGenerator;