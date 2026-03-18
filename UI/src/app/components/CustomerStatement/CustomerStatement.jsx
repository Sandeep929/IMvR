import React, { useState, useEffect, useRef } from 'react';
import { Download, Search, Printer, FileText } from 'lucide-react';
import { reportAPI, customerAPI } from '../../../services/api';
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

    const handlePrint = () => {
        // Our CSS @media print block automatically hides the sidebar/header and formats the document cleanly.
        window.print();
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
                'Advance', 'Balance', 'Pavati N.', 'Customer Name', 'Site', 
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

    return (
        <div className="statement-container">
            <div className="statement-controls panel">
                <div className="control-group">
                    <label>Customer</label>
                    <select 
                        value={selectedCustomer} 
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="control-input"
                    >
                        <option value="">Select Customer...</option>
                        {customers.map(c => (
                            <option key={c.uuid} value={c.name}>{c.name}</option>
                        ))}
                    </select>
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
                            <h1 className="doc-title text-center">JC Bricks Manufacturing</h1>
                            
                            <div className="doc-subheader flex justify-between items-center mt-4">
                                <div className="logo-placeholder">
                                    <h2 className="text-red-600 font-bold mb-0">JC Bricks</h2>
                                </div>
                                <div className="address-block text-center flex-grow">
                                    <p>Village Bisnawda Dhar Road Indore-453001 (M.P.) India</p>
                                </div>
                                <div className="brick-img-placeholder">
                                    {/* Usually an image goes here, placeholder div for now */}
                                    <div className="bg-orange-600 w-16 h-8 inline-block shadow-md"></div>
                                </div>
                            </div>
                            
                            <hr className="doc-divider mt-2 mb-2 border-red-500" />
                            
                            <div className="contact-block flex justify-between mt-4">
                                <div>
                                    <p><strong>Contact No. :</strong> 9826305085, 9926777485</p>
                                    <p><strong>WhatsApp No. :</strong> 9977175856</p>
                                </div>
                                <div className="text-right">
                                    <p><strong>Email ID :</strong> jcbricksmanufacturing@gmail.com</p>
                                    <p className="mt-4">
                                        <strong>Date : </strong> 
                                        {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CUSTOMER INFO */}
                        <div className="doc-customer-info text-center mt-6">
                            <h2 className="underline font-bold text-xl inline-block">Customer Invoice</h2>
                            <div className="text-left mt-4 flex justify-between">
                                <div>
                                    <p><strong>Name :</strong> {selectedCustomer} Ji</p>
                                    <p><strong>Address :</strong> {currentCustomerObj.address || ''}</p>
                                    <p><strong>Contact No. :</strong> {currentCustomerObj.phone || ''}</p>
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
                                    <th>Date</th>
                                    <th>Product Detail</th>
                                    <th>Quantity</th>
                                    <th>Pavti No.</th>
                                    <th>Rate</th>
                                    <th>Total Amount</th>
                                    <th>Advance Amount</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statementData.lines.map((line, idx) => (
                                    <tr key={idx}>
                                        <td className="text-center">{idx + 1}</td>
                                        <td className="text-center">{new Date(line.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</td>
                                        <td>{line.productDetail}</td>
                                        <td className="text-center">{line.quantity}</td>
                                        <td className="text-center">{line.pavtiNo}</td>
                                        <td className="text-center">{line.rate}</td>
                                        <td className="text-right">₹ {line.totalAmount.toLocaleString()}</td>
                                        <td className="text-right">₹ {line.advanceAmount.toLocaleString()}</td>
                                        <td className="text-right">₹ {line.balance.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {statementData.lines.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="text-center italic py-4">No records found for this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* FOOTER TOTALS */}
                        {statementData.lines.length > 0 && (
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
                                        <p>JC Bricks Manufacturing</p>
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
