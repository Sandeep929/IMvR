import React, { useState, useEffect, useRef } from 'react';
import { Download, Search, Printer, FileText } from 'lucide-react';
import { reportAPI, customerAPI } from '../../../services/api';
import { SearchableDropdown } from '../ui/SearchableDropdown';
import brickImage from '../../../assets/print-logo.jpg';
import logo from "../../../assets/Gemini_Generated_Image_98lfx498lfx498lf.png";
import './customerStatement.css';

export function CustomerStatement() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [statementData, setStatementData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const printRef = useRef(null);

    // Fetch customer list for dropdown
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await customerAPI.getAll();
                setCustomers(res.data);
            } catch (err) {
                console.error('Failed to load customers', err);
            }
        };
        fetchCustomers();
    }, []);

    const handleGenerate = async () => {
        if (!selectedCustomer) {
            setError('Please select a customer first.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const params = { customerName: selectedCustomer };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await reportAPI.getStatement(params);
            setStatementData(res.data);
        } catch (err) {
            setError('Failed to generate statement: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {
        // Our CSS @media print block and @page rules automatically hide the sidebar/header and format the document for A4 PDF standards.
        if (window.windowControls && window.windowControls.printToPdf) {
            const customerPrefix = selectedCustomer ? selectedCustomer.replace(/\s+/g, '_') + '_' : '';
            const defaultFilename = `${customerPrefix}Statement_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;
            
            try {
                setLoading(true);
                const result = await window.windowControls.printToPdf(defaultFilename);
                if (!result.success && result.error !== 'Canceled') {
                    setError('Failed to save PDF: ' + result.error);
                }
            } catch (err) {
                setError('Failed to generate PDF: ' + err.message);
            } finally {
                setLoading(false);
            }
        } else {
            // Fallback for standard browsers
            window.print();
        }
    };

    const handleExportMaster = async () => {
        try {
            const params = {};
            if (selectedCustomer) params.customerName = selectedCustomer;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const res = await reportAPI.getMasterData(params);
            
            // Generate Master Data CSV according to requested format
            const headers = [
                'S. No.', 'Date', 'Product', 'Quantity', 'Rate', 'Amount', 
                'Advance', 'Balance', 'Pavati N.', 'Customer Name', 'Contact No.', 'Site', 
                'Vehicle No.', 'Marfat', 'Remarks'
            ];
            const rows = [headers.join(',')];
            
            res.data.forEach((inv, index) => {
                const dateStr = inv.date 
                    ? new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-') 
                    : '';
                
                const product = inv.items && inv.items.length > 0 ? inv.items[0].product : '';
                const quantity = inv.items && inv.items.length > 0 ? inv.items[0].quantity : '';
                const rate = inv.items && inv.items.length > 0 ? inv.items[0].rate : '';

                const amountStr = `₹ ${Number(inv.totalAmount || 0).toLocaleString('en-IN')}`;
                const advanceStr = `₹ ${Number(inv.totalAdvance || 0).toLocaleString('en-IN')}`;
                const balanceStr = `₹ ${Number(inv.balance || 0).toLocaleString('en-IN')}`;

                rows.push([
                    index + 1,
                    `${dateStr}`,
                    `"${product}"`,
                    quantity,
                    rate,
                    `"${amountStr}"`,
                    `"${advanceStr}"`,
                    `"${balanceStr}"`,
                    `"${inv.pavatiNo || ''}"`,
                    `"${inv.customerName || ''}"`,
                    `"${inv.customerPhone || ''}"`,
                    `"${inv.site || ''}"`,
                    `"${inv.vehicleNo || ''}"`,
                    `"${inv.marfat || ''}"`,
                    `"${inv.remarks || ''}"`
                ].join(','));
            });

            const csvContent = rows.join('\n');
            // Prepend BOM so Excel recognizes the UTF-8 encoding correctly for the ₹ symbol
            const bom = '\uFEFF';
            const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            const customerPrefix = selectedCustomer ? selectedCustomer.replace(/\s+/g, '_') + '_' : '';
            link.setAttribute('download', `${customerPrefix}MasterData_${startDate || 'all'}_to_${endDate || 'all'}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch(err) {
             setError('Failed to export master data: ' + err.message);
        }
    };

    // Find the currently selected customer object to get their details (phone, address, etc)
    const currentCustomerObj = customers.find(c => c.name === selectedCustomer) || {};

    const companyInfo = JSON.parse(localStorage.getItem('companySettings') || '{}');
    const compName = companyInfo.name || 'JC Bricks Manufacturing';
    const compAddress = companyInfo.address || 'Village Bisnawda Dhar Road Indore-453001 (M.P.) India';
    const compPhone = companyInfo.phone || '9826305085, 9926777485';
    const compWhatsapp = companyInfo.whatsapp || '9977175856';
    const compEmail = companyInfo.email || 'jcbricksmanufacturing@gmail.com';

    const statementLines = statementData?.lines || [];

    return (
        <div className="statement-container">
            <div className="statement-controls panel">
                <div className="control-group">
                    <label>Customer</label>
                    <SearchableDropdown
                        options={customers.map((c, i) => {
                            const hasPhone = c.phone && c.phone.replace(/[-\s]/g, '') !== '';
                            return { 
                                label: hasPhone ? `${c.name} - ${c.phone}` : c.name, 
                                value: c.name, 
                                searchKey: c.name,
                                id: c._id || c.id || i 
                            };
                        })}
                        value={selectedCustomer} 
                        onChange={(val) => setSelectedCustomer(val)}
                        placeholder="Select Customer..."
                    />
                </div>
                <div className="control-group">
                    <label>Start Date</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="control-input"
                    />
                </div>
                <div className="control-group">
                    <label>End Date</label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="control-input"
                    />
                </div>
                
                <div className="action-buttons">
                    <button onClick={handleGenerate} className="btn-primary" disabled={loading}>
                        {loading ? 'Loading...' : <><Search size={16} /> Generate Statement</>}
                    </button>
                    <button onClick={handleExportMaster} className="btn-secondary">
                        <Download size={16} /> Master Data
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {statementData && (
                <div className="statement-preview-wrapper">
                    <div className="preview-toolbar">
                        <h3>Statement Preview</h3>
                        <button onClick={handlePrint} className="btn-secondary">
                            <Printer size={16} /> Print / PDF
                        </button>
                    </div>

                    <div className="statement-document" ref={printRef}>
                        {/* HEADER - Designed matches the reference image */}
                        <div className="doc-header">
                            <div className="flex justify-between items-center mb-2" style={{ padding: '0 10px' }}>
                                {/* Left Logo */}
                                <div style={{ width: '25%', display: 'flex', justifyContent: 'flex-start' }}>
                                    <img src={logo} alt="logo" style={{ maxHeight: '85px', width: 'auto', objectFit: 'contain' }} />
                                </div>
                                
                                {/* Center Title & Address */}
                                <div style={{ width: '50%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <h1 className="doc-title font-bold" style={{ fontSize: '26px', marginBottom: '6px', letterSpacing: '0.5px' }}>{compName}</h1>
                                    <p style={{ fontSize: '13px', color: '#111', margin: 0, fontWeight: 500 }}>{compAddress}</p>
                                </div>

                                {/* Right Logo */}
                                <div style={{ width: '25%', display: 'flex', justifyContent: 'flex-end' }}>
                                    <img src={brickImage} alt="Brick" style={{ maxHeight: '85px', width: 'auto', objectFit: 'contain' }} />
                                </div>
                            </div>
                            
                            <hr className="doc-divider mt-2 mb-2 w-full" style={{ borderTopWidth: '3px', borderColor: '#dc2626' }} />
                            
                            <div className="contact-block flex justify-between mt-4">
                                <div>
                                    <p><strong>Contact No. :</strong> {compPhone}</p>
                                    <p><strong>WhatsApp No. :</strong> {compWhatsapp}</p>
                                </div>
                                <div className="text-right">
                                    <p><strong>Email ID :</strong> {compEmail}</p>
                                    <p className="mt-1">
                                        <strong>Date : </strong> 
                                        {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CUSTOMER INFO */}
                        <div className="doc-customer-info text-center mt-3">
                            <h2 className="underline font-bold text-xl inline-block">Customer Invoice</h2>
                            <div className="text-left mt-2 flex justify-between">
                                <div>
                                    <p><strong>Name :</strong> {selectedCustomer} Ji</p>
                                    <p><strong>Address :</strong> {currentCustomerObj.address || ''}</p>
                                    <div className="flex">
                                        <strong className="mr-1">Contact No. :</strong>
                                        <div className="flex flex-col">
                                            {(currentCustomerObj.phone || '').split(',').map((num, i) => (
                                                <span key={i}>{num.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <p><strong>Email ID :</strong> {currentCustomerObj.email || ''}</p>
                                </div>
                            </div>
                        </div>

                        {/* DATA TABLE */}
                        <table className="doc-table mt-4 w-full">
                            <thead>
                                <tr>
                                    <th>S. N.</th>
                                    <th style={{ minWidth: '85px', whiteSpace: 'nowrap' }}>Date</th>
                                    <th>Product Detail</th>
                                    <th>Quantity</th>
                                    <th>Pavti No.</th>
                                    <th style={{ maxWidth: '150px' }}>Site</th>
                                    <th>Rate</th>
                                    <th>Total Amount</th>
                                    <th>Advance Amount</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statementLines.map((line, idx) => (
                                    <tr key={idx}>
                                        <td className="text-center">{idx + 1}</td>
                                        <td className="text-center" style={{ whiteSpace: 'nowrap' }}>{new Date(line.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</td>
                                        <td>{line.productDetail}</td>
                                        <td className="text-center">{line.quantity}</td>
                                        <td className="text-center">{line.pavtiNo}</td>
                                        <td className="text-center" style={{ maxWidth: '150px', wordWrap: 'break-word', whiteSpace: 'normal' }}>{line.site || '-'}</td>
                                        <td className="text-center">{line.rate}</td>
                                        <td className="text-right">₹ {line.totalAmount.toLocaleString()}</td>
                                        <td className="text-right">₹ {line.advanceAmount.toLocaleString()}</td>
                                        <td className="text-right">₹ {line.balance.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {statementLines.length === 0 && (
                                    <tr>
                                        <td colSpan="10" className="text-center italic py-4">No records found for this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* FOOTER TOTALS */}
                        {statementData.lines && statementData.lines.length > 0 && (
                            <div className="doc-footer mt-4 flex flex-col items-end">
                                <div className="totals-grid grid grid-cols-2 gap-x-8 gap-y-2 w-full">
                                    <div className="text-center flex items-center justify-center border font-bold h-full">
                                        Total Bricks = {statementData.summary.totalBricks.toLocaleString()}
                                    </div>
                                    <div className="totals-right border">
                                        <div className="flex justify-between p-1 border-b font-bold"><span className="mr-8 w-32 border-r text-right pr-2 block">Total Amount =</span> <span>₹ {statementData.summary.totalAmount.toLocaleString()}</span></div>
                                        <div className="flex justify-between p-1 border-b font-bold"><span className="mr-8 w-32 border-r text-right pr-2 block">Deposit =</span> <span>₹ {statementData.summary.deposit.toLocaleString()}</span></div>
                                        <div className="flex justify-between p-1 font-bold"><span className="mr-8 w-32 border-r text-right pr-2 block">Total Balance =</span> <span>₹ {statementData.summary.totalBalance.toLocaleString()}</span></div>
                                    </div>
                                </div>
                                <div className="signatory w-full flex justify-between mt-8">
                                    <div className="text-center ml-12">
                                        <p>Authorized Signatory</p>
                                        <p>{compName}</p>
                                    </div>
                                    <div className="mr-12 opacity-0">
                                        <p>Placeholder</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
