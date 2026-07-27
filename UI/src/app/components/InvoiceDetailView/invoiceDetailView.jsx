import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import brickImage from '../../../assets/print-logo.png';
import './invoiceDetailView.css';
import logo from "../../../assets/jc-bricks.webp";
import { generateInvoicePDF } from '../../../services/pdfGenerator';

export function InvoiceDetailView({ invoice, customers = [], onClose }) {
    const customer = customers.find(c => c.name === invoice.customerName);
    const displayPhone = invoice.customerPhone || (customer ? (customer.phone || customer.mobile || '') : '');

    const companyInfo = JSON.parse(localStorage.getItem('companySettings') || '{}');

    const handlePrint = async () => {
        try {
            const doc = await generateInvoicePDF(invoice, customers, companyInfo, { margin: 4 });
            const blob = doc.output('blob');
            const blobUrl = URL.createObjectURL(blob);
            let iframe = document.getElementById('pdf-print-iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'pdf-print-iframe';
                iframe.style.position = 'fixed';
                iframe.style.width = '0px';
                iframe.style.height = '0px';
                iframe.style.border = 'none';
                document.body.appendChild(iframe);
            }
            iframe.src = blobUrl;
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                }, 200);
            };
        } catch (err) {
            console.error('Failed to print PDF:', err);
            alert('Failed to print PDF: ' + err.message);
        }
    };

    const handleDownloadPDF = async () => {
        const customerPrefix = invoice.customerName ? invoice.customerName.replace(/\s+/g, '_') + '_' : '';
        const pavatiSuffix = invoice.pavatiNo ? `Inv_${invoice.pavatiNo}_` : '';
        const defaultFilename = `${customerPrefix}${pavatiSuffix}${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;
        
        try {
            const doc = await generateInvoicePDF(invoice, customers, companyInfo);
            doc.save(defaultFilename);
        } catch (err) {
            alert('Failed to generate PDF: ' + err.message);
        }
    };
    const compName = companyInfo.name || 'JC Bricks Manufacturing';
    const compAddress = companyInfo.address || 'Village Bisnawda Dhar Road Indore-453001 (M.P.) India';
    const compPhone = companyInfo.phone || '9826305085, 9926777485';
    const compWhatsapp = companyInfo.whatsapp || '9977175856';
    const compEmail = companyInfo.email || 'jcbricksmanufacturing@gmail.com';

    // Normalize items — support both new multi-item format and old single-item format
    const items = invoice.items && invoice.items.length > 0
        ? invoice.items
        : (invoice.product ? [{ product: invoice.product, quantity: invoice.quantity, rate: invoice.rate, amount: invoice.amount }] : []);

    // Normalize payments — support new payments array and old advance field
    const payments = invoice.payments && invoice.payments.length > 0
        ? invoice.payments
        : (invoice.advance > 0 ? [{ date: invoice.date, amount: invoice.advance, method: 'Cash', remarks: 'Advance' }] : []);

    const totalAmount = Math.round((invoice.totalAmount ?? invoice.amount ?? 0) * 100) / 100;
    const totalAdvance = Math.round((invoice.totalAdvance ?? invoice.advance ?? 0) * 100) / 100;
    const rawBalance = Math.round((invoice.balance ?? 0) * 100) / 100;
    const balance = rawBalance === 0 ? 0 : rawBalance;

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
                            <img src={logo} alt="logo" className='logo-img' />
                            <div className="branding-center">
                                <h1 className="company-name">{compName}</h1>
                                <p className="company-address">{compAddress}</p>
                            </div>
                            <img src={brickImage} alt="Brick" className="brick-logo" />
                        </div>

                        <hr className="doc-divider mt-2 mb-2 w-full" style={{ border: 'none', borderTop: '1px solid #000000', margin: '0.2rem 0' }} />

                        <div className="contact-info-grid">
                            <div>
                                <p><strong>Contact No. :</strong> {compPhone}</p>
                                <p><strong>WhatsApp No. :</strong> {compWhatsapp}</p>
                            </div>
                            <div className="contact-right">
                                <p><strong>Email ID :</strong> {compEmail}</p>
                                <p style={{ marginTop: '0.2rem' }}>
                                    <strong>Date : </strong> {new Date(invoice.date).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: '2-digit'
                                    }).replace(/ /g, '-')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Invoice Title */}
                    <h2 className="customer-invoice-title">Customer Invoice</h2>

                    {/* Customer Details */}
                    <div className="customer-details-grid">
                        <div>
                            <p><strong>Name :</strong> {invoice.customerName}</p>
                            {displayPhone && <p><strong>Phone :</strong> {displayPhone}</p>}
                            <p><strong>Site :</strong> {invoice.site}</p>
                            <p><strong>Vehicle No. :</strong> {invoice.vehicleNo}</p>
                        </div>
                        <div className="customer-details-right">
                            <p><strong>Pavati No. :</strong> {invoice.pavatiNo}</p>
                            {invoice.orderNo && <p><strong>Order No. :</strong> {invoice.orderNo}</p>}
                            {invoice.marfat && <p><strong>Marfat (Via) :</strong> {invoice.marfat}</p>}
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
                                    <td>Rs. {Number(item.rate).toFixed(2)}</td>
                                    <td>Rs. {Number(Math.round((item.amount || 0) * 100) / 100).toLocaleString()}</td>
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
                                            <td>Rs. {Number(payment.amount).toLocaleString()}</td>
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
                            <div className="signature-box mt-4">
                                <p><strong>Authorized Signatory</strong></p>
                                <p>{compName}</p>
                            </div>
                        </div>

                        <div className="totals-right">
                            <div className="total-row">
                                <div className="total-label"><strong>Total Amount =</strong></div>
                                <div className="total-value"><strong>Rs. {Number(totalAmount).toLocaleString()}</strong></div>
                            </div>
                            <div className="total-row">
                                <div className="total-label"><strong>Total Received =</strong></div>
                                <div className="total-value"><strong>Rs. {Number(totalAdvance).toLocaleString()}</strong></div>
                            </div>
                            <div className="total-row">
                                <div className="total-label"><strong>Balance Due =</strong></div>
                                <div className="total-value"><strong>Rs. {Number(balance).toLocaleString()}</strong></div>
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
