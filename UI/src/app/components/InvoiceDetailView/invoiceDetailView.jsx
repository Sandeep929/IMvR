import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import brickImage from '../../../assets/799b5e090af0c56945bf82c5795a9cd1c7470511.png';
import './invoiceDetailView.css';
import logo from "../../../assets/Gemini_Generated_Image_98lfx498lfx498lf.png";

export function InvoiceDetailView({ invoice, onClose }) {
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

    // Normalize items — support both new multi-item format and old single-item format
    const items = invoice.items && invoice.items.length > 0
        ? invoice.items
        : (invoice.product ? [{ product: invoice.product, quantity: invoice.quantity, rate: invoice.rate, amount: invoice.amount }] : []);

    // Normalize payments — support new payments array and old advance field
    const payments = invoice.payments && invoice.payments.length > 0
        ? invoice.payments
        : (invoice.advance > 0 ? [{ date: invoice.date, amount: invoice.advance, method: 'Cash', remarks: 'Advance' }] : []);

    const totalAmount = invoice.totalAmount ?? invoice.amount ?? 0;
    const totalAdvance = invoice.totalAdvance ?? invoice.advance ?? 0;
    const balance = invoice.balance ?? 0;

    return (
        <div className="invoice-detail-container">
            <div className="invoice-detail-card">
                <div className="invoice-detail-header">
                    <h3 className="header-title">Invoice Details</h3>
                    <div className="header-actions">
                        <button
                            onClick={handleDownloadPDF}
                            className="action-btn btn-pdf"
                        >
                            <Download size={18} />
                            PDF
                        </button>
                        <button
                            onClick={handlePrint}
                            className="action-btn btn-print"
                        >
                            <Printer size={18} />
                            Print
                        </button>
                        <button
                            onClick={onClose}
                            className="action-btn btn-close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div id="invoice-print-area" className="invoice-print-area">
                    {/* Header Section */}
                    <div className="print-header-section">
                        <div className="company-branding">
                            <div className="branding-left">
                                <img src={logo} alt="logo" className='logo-img' />
                                <div>
                                    <h1 className="company-name">JC Bricks Manufacturing</h1>
                                    <p className="company-address">Village Bisnawda Dhar Road Indore-453001 (M.P.) India</p>
                                </div>
                            </div>
                            <img src={brickImage} alt="Brick" className="brick-logo" />
                        </div>

                        <div className="contact-info-grid">
                            <div>
                                <p><strong>Contact No.:</strong> 9826305085, 9926777485</p>
                                <p><strong>WhatsApp No.:</strong> 9977175856</p>
                            </div>
                            <div className="contact-right">
                                <p><strong>Email ID:</strong> jcbricksmanufacturing@gmail.com</p>
                                <p style={{ marginTop: '0.5rem' }}>
                                    <strong>Date:</strong> {new Date(invoice.date).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Invoice Title */}
                    <h2 className="customer-invoice-title">Customer Invoice</h2>

                    {/* Customer Details */}
                    <div className="customer-details-grid">
                        <div>
                            <p><strong>Name:</strong> {invoice.customerName}</p>
                            <p><strong>Site:</strong> {invoice.site}</p>
                            <p><strong>Vehicle No.:</strong> {invoice.vehicleNo}</p>
                        </div>
                        <div>
                            <p><strong>Pavati No.:</strong> {invoice.pavatiNo}</p>
                            {invoice.orderNo && <p><strong>Order No.:</strong> {invoice.orderNo}</p>}
                            {invoice.marfat && <p><strong>Marfat (Via):</strong> {invoice.marfat}</p>}
                        </div>
                    </div>

                    {/* Invoice Items Table */}
                    <table className="invoice-detail-table">
                        <thead>
                            <tr>
                                <th>S. N.</th>
                                <th>Product Detail</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.product}</td>
                                    <td>{item.quantity}</td>
                                    <td>₹ {Number(item.rate).toFixed(2)}</td>
                                    <td>₹ {Number(item.amount).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Payment History Table */}
                    {payments.length > 0 && (
                        <>
                            <h4 style={{ marginTop: '1.2rem', marginBottom: '0.4rem', fontWeight: 600 }}>Payment History</h4>
                            <table className="invoice-detail-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date</th>
                                        <th>Method</th>
                                        <th>Remarks</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment, pIdx) => (
                                        <tr key={pIdx}>
                                            <td>{pIdx + 1}</td>
                                            <td>{new Date(payment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                                            <td>{payment.method || 'Cash'}</td>
                                            <td>{payment.remarks || '-'}</td>
                                            <td>₹ {Number(payment.amount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Totals Section */}
                    <div className="totals-section">
                        <div className="totals-left">
                            <p style={{ marginBottom: '0.5rem' }}><strong>Total Quantity = {items.reduce((s, i) => s + Number(i.quantity), 0)}</strong></p>
                            <div className="signature-box">
                                <p>Authorized Signatory</p>
                                <p>JC Bricks Manufacturing</p>
                            </div>
                        </div>

                        <div className="totals-right">
                            <div className="total-row">
                                <div className="total-label"><strong>Total Amount =</strong></div>
                                <div className="total-value"><strong>₹ {Number(totalAmount).toLocaleString()}</strong></div>
                            </div>
                            <div className="total-row">
                                <div className="total-label"><strong>Total Received =</strong></div>
                                <div className="total-value"><strong>₹ {Number(totalAdvance).toLocaleString()}</strong></div>
                            </div>
                            <div className="total-row">
                                <div className="total-label"><strong>Balance Due =</strong></div>
                                <div className="total-value"><strong>₹ {Number(balance).toLocaleString()}</strong></div>
                            </div>
                        </div>
                    </div>

                    {invoice.remarks && (
                        <div className="remarks-box">
                            <p><strong>Remarks:</strong> {invoice.remarks}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
