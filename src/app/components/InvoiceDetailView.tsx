import { Printer, Download, X } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import brickImage from '../../assets/799b5e090af0c56945bf82c5795a9cd1c7470511.png';

interface InvoiceDetailViewProps {
  invoice: Invoice;
  onClose: () => void;
}

export function InvoiceDetailView({ invoice, onClose }: InvoiceDetailViewProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-area');
    if (!printContent) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.pavatiNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
            * { box-sizing: border-box; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 2px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f9f9f9; font-weight: 600; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
            .company-name { font-size: 28px; font-weight: bold; margin: 10px 0; }
            .contact-info { display: flex; justify-content: space-between; margin: 10px 0; font-size: 14px; }
            .customer-section { margin: 20px 0; }
            .customer-info { font-size: 14px; line-height: 1.6; }
            .invoice-title { text-align: center; font-size: 24px; font-weight: bold; text-decoration: underline; margin: 20px 0; }
            .summary-box { border: 2px solid #000; padding: 10px; margin-top: 20px; }
            .summary-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .totals-table { width: auto; margin-left: auto; margin-top: 20px; }
            .signature-section { margin-top: 40px; }
            @media print {
              body { margin: 0; padding: 15px; }
              button { display: none; }
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
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = () => {
    alert('PDF download functionality would be implemented here using a library like jsPDF or react-pdf');
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm max-w-4xl mx-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between print:hidden">
          <h3 className="text-xl">Invoice Details</h3>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download size={18} />
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div id="invoice-print-area" className="p-8">
          {/* Header Section */}
          <div className="border-b-2 border-black pb-4 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="64" height="12" fill="#dc2626" stroke="#991b1b" strokeWidth="1"/>
                  <rect x="8" y="24" width="64" height="12" fill="#dc2626" stroke="#991b1b" strokeWidth="1"/>
                  <rect x="8" y="40" width="64" height="12" fill="#dc2626" stroke="#991b1b" strokeWidth="1"/>
                  <text x="16" y="16" fontSize="8" fill="#fff" fontFamily="Arial, sans-serif">JC</text>
                  <text x="16" y="32" fontSize="8" fill="#fff" fontFamily="Arial, sans-serif">Bricks</text>
                </svg>
                <div>
                  <h1 className="text-3xl mb-1">JC Bricks Manufacturing</h1>
                  <p className="text-sm">Village Bisnawda Dhar Road Indore-453001 (M.P.) India</p>
                </div>
              </div>
              <img src={brickImage} alt="Brick" className="w-24 h-auto" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
              <div>
                <p><strong>Contact No.:</strong> 9826305085, 9926777485</p>
                <p><strong>WhatsApp No.:</strong> 9977175856</p>
              </div>
              <div className="text-right">
                <p><strong>Email ID:</strong> jcbricksmanufacturing@gmail.com</p>
                <p className="mt-2"><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: '2-digit' 
                })}</p>
              </div>
            </div>
          </div>

          {/* Customer Invoice Title */}
          <h2 className="text-2xl text-center mb-6 underline decoration-2">Customer Invoice</h2>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <p className="mb-1"><strong>Name:</strong> {invoice.customerName}</p>
              <p className="mb-1"><strong>Address:</strong> {invoice.site}</p>
              <p className="mb-1"><strong>Contact No.:</strong> {invoice.vehicleNo}</p>
            </div>
            <div>
              <p><strong>Email ID:</strong></p>
            </div>
          </div>

          {/* Invoice Table */}
          <table className="w-full mb-6 border-2 border-black">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 border-2 border-black text-center">S. N.</th>
                <th className="p-3 border-2 border-black text-center">Date</th>
                <th className="p-3 border-2 border-black text-center">Product Detail</th>
                <th className="p-3 border-2 border-black text-center">Quantity</th>
                <th className="p-3 border-2 border-black text-center">Pavti No.</th>
                <th className="p-3 border-2 border-black text-center">Rate</th>
                <th className="p-3 border-2 border-black text-center">Total Amount</th>
                <th className="p-3 border-2 border-black text-center">Advance Amount</th>
                <th className="p-3 border-2 border-black text-center">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-2 border-black text-center">{invoice.sNo}</td>
                <td className="p-3 border-2 border-black text-center whitespace-nowrap">
                  {new Date(invoice.date).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: '2-digit' 
                  })}
                </td>
                <td className="p-3 border-2 border-black text-center">{invoice.product}</td>
                <td className="p-3 border-2 border-black text-center">{invoice.quantity}</td>
                <td className="p-3 border-2 border-black text-center">{invoice.pavatiNo}</td>
                <td className="p-3 border-2 border-black text-center">{invoice.rate}</td>
                <td className="p-3 border-2 border-black text-center">₹ {invoice.amount.toLocaleString()}</td>
                <td className="p-3 border-2 border-black text-center">₹ {invoice.advance.toLocaleString()}</td>
                <td className="p-3 border-2 border-black text-center">₹ {invoice.balance.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex justify-between items-start mt-8">
            <div>
              <p className="mb-2"><strong>Total Bricks = {invoice.quantity}</strong></p>
              <div className="mt-8">
                <p className="mb-1">Authorized Signatory</p>
                <p>JC Bricks Manufacturing</p>
              </div>
            </div>
            
            <div className="border-2 border-black">
              <div className="flex border-b-2 border-black">
                <div className="p-3 pr-8 border-r-2 border-black min-w-[180px]"><strong>Total Amount =</strong></div>
                <div className="p-3 min-w-[140px] text-right"><strong>₹ {invoice.amount.toLocaleString()}</strong></div>
              </div>
              <div className="flex border-b-2 border-black">
                <div className="p-3 pr-8 border-r-2 border-black"><strong>Deposit =</strong></div>
                <div className="p-3 text-right"><strong>₹ {invoice.advance.toLocaleString()}</strong></div>
              </div>
              <div className="flex">
                <div className="p-3 pr-8 border-r-2 border-black"><strong>Total Balance =</strong></div>
                <div className="p-3 text-right"><strong>₹ {invoice.balance.toLocaleString()}</strong></div>
              </div>
            </div>
          </div>

          {invoice.remarks && (
            <div className="mt-6 p-4 border-2 border-slate-300 rounded">
              <p className="text-sm"><strong>Remarks:</strong> {invoice.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
