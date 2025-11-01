import React from 'react';
import { format } from 'date-fns';
import { Printer, Download, Building, Phone, Mail, MapPin, Calendar, User, CreditCard, CheckCircle } from 'lucide-react';
import { formatPHPCurrencyCompact } from '../utils/currency';

const Receipt = ({ payment, onClose, showModal = true }) => {
  // Add validation to prevent errors
  if (!payment) {
    console.error('Receipt component: payment prop is required');
    if (onClose) onClose();
    return null;
  }

  // Ensure payment has required properties
  const safePayment = {
    id: payment.id || 'N/A',
    amount: payment.amount || 0,
    status: payment.status || 'unknown',
    created_at: payment.created_at || new Date().toISOString(),
    completed_at: payment.completed_at || payment.created_at || new Date().toISOString(),
    appointment_id: payment.appointment_id || 'N/A',
    paypal_payment_id: payment.paypal_payment_id || 'N/A',
    appointment: payment.appointment || {}
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    if (!printContent) {
      console.error('Receipt content not found for printing');
      return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${safePayment.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
              color: #000;
            }
            .receipt-container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border: 1px solid #ddd;
              border-radius: 8px;
              overflow: hidden;
            }
            .receipt-header { 
              background: #3b82f6; 
              color: white; 
              padding: 20px; 
              text-align: center;
            }
            .receipt-body { 
              padding: 20px; 
            }
            .receipt-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px; 
              padding-bottom: 8px;
              border-bottom: 1px dotted #ddd;
            }
            .receipt-total { 
              font-size: 18px; 
              font-weight: bold; 
              background: #f8f9fa; 
              padding: 15px; 
              margin: 15px 0;
              border-radius: 4px;
            }
            .receipt-footer { 
              text-align: center; 
              color: #666; 
              font-size: 12px; 
              margin-top: 20px;
              padding-top: 15px;
              border-top: 2px solid #3b82f6;
            }
            .status-badge { 
              background: #10b981; 
              color: white; 
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: bold;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownload = () => {
    try {
      const receiptText = `
DENTIST APPOINTMENT SYSTEM
PAYMENT RECEIPT

Receipt #: ${safePayment.id}
Date: ${format(new Date(safePayment.completed_at), 'PPpp')}

PATIENT INFORMATION
Name: ${safePayment.appointment?.patient?.full_name || 'N/A'}
Appointment ID: #${safePayment.appointment_id}

SERVICE DETAILS
Service: ${safePayment.appointment?.service?.name || 'N/A'}
Dentist: Dr. ${safePayment.appointment?.dentist?.full_name || 'N/A'}
Date: ${safePayment.appointment?.appointment_time ? format(new Date(safePayment.appointment.appointment_time), 'PPP') : 'N/A'}
Time: ${safePayment.appointment?.appointment_time ? format(new Date(safePayment.appointment.appointment_time), 'p') : 'N/A'}

PAYMENT DETAILS
Amount: ${formatPHPCurrencyCompact(safePayment.amount)}
Method: PayPal
Status: ${safePayment.status === 'completed' ? 'PAID' : safePayment.status.toUpperCase()}
Transaction ID: ${safePayment.paypal_payment_id}

Thank you for choosing our dental services!
      `;

      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${safePayment.id}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const receiptContent = (
    <div id="receipt-content" className="receipt-container bg-white">
      {/* Header */}
      <div className="receipt-header bg-blue-600 text-white p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Building className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Dentist Appointment System</h1>
        </div>
        <p className="text-blue-100">Payment Receipt</p>
        <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3 inline-block">
          <p className="text-sm">Receipt #</p>
          <p className="text-xl font-bold">#{safePayment.id}</p>
        </div>
      </div>

      {/* Body */}
      <div className="receipt-body p-6">
        {/* Status */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">
              {safePayment.status === 'completed' ? 'PAYMENT COMPLETED' : safePayment.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {format(new Date(safePayment.completed_at || safePayment.created_at), 'PPPP')} at {format(new Date(safePayment.completed_at || safePayment.created_at), 'p')}
          </p>
        </div>

        {/* Patient Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Patient Information
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="receipt-row">
              <span className="text-gray-600">Patient Name:</span>
              <span className="font-medium">{safePayment.appointment?.patient?.full_name || 'N/A'}</span>
            </div>
            <div className="receipt-row">
              <span className="text-gray-600">Appointment ID:</span>
              <span className="font-mono">#{safePayment.appointment_id}</span>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Service Details
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="receipt-row">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{safePayment.appointment?.service?.name || 'N/A'}</span>
            </div>
            <div className="receipt-row">
              <span className="text-gray-600">Dentist:</span>
              <span className="font-medium">Dr. {safePayment.appointment?.dentist?.full_name || 'N/A'}</span>
            </div>
            <div className="receipt-row">
              <span className="text-gray-600">Appointment Date:</span>
              <span className="font-medium">
                {safePayment.appointment?.appointment_time ? 
                  format(new Date(safePayment.appointment.appointment_time), 'PPP') : 'N/A'}
              </span>
            </div>
            <div className="receipt-row">
              <span className="text-gray-600">Appointment Time:</span>
              <span className="font-medium">
                {safePayment.appointment?.appointment_time ? 
                  format(new Date(safePayment.appointment.appointment_time), 'p') : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
            Payment Details
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="receipt-row">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">PayPal</span>
            </div>
            <div className="receipt-row">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm">{safePayment.paypal_payment_id || 'N/A'}</span>
            </div>
            <div className="receipt-row">
              <span className="text-gray-600">Payment Date:</span>
              <span className="font-medium">
                {format(new Date(safePayment.completed_at || safePayment.created_at), 'PPpp')}
              </span>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="receipt-total bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total Amount Paid:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatPHPCurrencyCompact(safePayment.amount)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="receipt-footer text-center text-gray-600 text-sm mt-6 pt-4 border-t-2 border-blue-600">
          <p className="font-semibold mb-2">Thank you for choosing our dental services!</p>
          <p>This is an official receipt for your payment.</p>
          <p className="mt-2">For any inquiries, please contact us at your convenience.</p>
          <div className="flex items-center justify-center space-x-4 mt-3 text-xs">
            <div className="flex items-center space-x-1">
              <Phone className="w-3 h-3" />
              <span>+63 123 456 7890</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-3 h-3" />
              <span>info@dentistapp.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!showModal) {
    return receiptContent;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center no-print">
          <h2 className="text-xl font-semibold text-gray-900">Payment Receipt</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-4">
          {receiptContent}
        </div>
      </div>
    </div>
  );
};

export default Receipt;
