import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/jc-bricks.webp';
import brickLogo from '../assets/print-logo.png';

// Helper to scale down and compress logo images to lightweight JPEGs
const getBase64ImageFromUrl = (url, maxDim = 250) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
            const w = Math.max(1, Math.round(img.width * scale));
            const h = Math.max(1, Math.round(img.height * scale));
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            const dataURL = canvas.toDataURL('image/jpeg', 0.75);
            resolve(dataURL);
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
};

// Helper to right-align a "Label : Value" pair flush against the right margin
const drawRightAlignedPair = (doc, label, value, rightEdge, y) => {
    if (!value && value !== 0) return;
    const valStr = String(value);
    doc.setFont('helvetica', 'normal');
    doc.text(valStr, rightEdge, y, { align: 'right' });
    const valWidth = doc.getTextWidth(valStr);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ' ', rightEdge - valWidth, y, { align: 'right' });
};

/**
 * Generate Customer Statement PDF
 */
export const generateCustomerStatementPDF = async (statementData, customerInfo, companyInfo, options = {}) => {
    // Turn on stream compression
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    
    // Dynamic Margin Calculations
    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const margin = options.margin !== undefined ? options.margin : 8;
    const rightEdge = pageWidth - margin;
    const pw = pageWidth - (margin * 2); // Printable width

    // Load and compress logos
    let logoBase64 = null;
    let brickLogoBase64 = null;
    try {
        logoBase64 = await getBase64ImageFromUrl(logo);
    } catch (e) {}
    try {
        brickLogoBase64 = await getBase64ImageFromUrl(brickLogo);
    } catch (e) {}

    const compName = companyInfo.name || 'JC Bricks Manufacturing';
    const compAddress = companyInfo.address || 'Village Bisnawda Dhar Road Indore-453001 (M.P.) India';
    const compPhone = companyInfo.phone || '9826305085, 9926777485';
    const compWhatsapp = companyInfo.whatsapp || '9977175856';
    const compEmail = companyInfo.email || 'jcbricksmanufacturing@gmail.com';
    const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');

    // 1. BRANDING HEADER
    let yPos = Math.max(5, margin);
    if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', margin, yPos, 28, 20, undefined, 'FAST');
    }
    if (brickLogoBase64) {
        doc.addImage(brickLogoBase64, 'JPEG', rightEdge - 26, yPos, 26, 20, undefined, 'FAST');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38); // Primary red title
    doc.text(compName, pageWidth / 2, yPos + 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text(compAddress, pageWidth / 2, yPos + 13, { align: 'center' });

    yPos += 22;

    // Thin Black Divider Line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(margin, yPos, rightEdge, yPos);

    yPos += 5;

    // Contact Info Grid
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);

    // Left side contact info
    doc.setFont('helvetica', 'bold');
    doc.text('Contact No. :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(compPhone, margin + 24, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('WhatsApp No. :', margin, yPos + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(compWhatsapp, margin + 27, yPos + 5);

    // Right side contact info
    drawRightAlignedPair(doc, 'Email ID :', compEmail, rightEdge, yPos);
    drawRightAlignedPair(doc, 'Date :', currentDate, rightEdge, yPos + 5);

    yPos += 13;

    // 2. DOCUMENT TITLE & CUSTOMER DETAILS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0);
    doc.text('Customer Statement', pageWidth / 2, yPos, { align: 'center' });
    
    // Underline document title
    const titleWidth = doc.getTextWidth('Customer Statement');
    doc.setLineWidth(0.4);
    doc.setDrawColor(0, 0, 0);
    doc.line((pageWidth - titleWidth) / 2, yPos + 1, (pageWidth + titleWidth) / 2, yPos + 1);

    yPos += 8;

    doc.setFontSize(10);
    // Left side customer info
    doc.setFont('helvetica', 'bold');
    doc.text('Name :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const customerName = customerInfo.name || '';
    const formattedCustomerName = customerName ? (/^Mr\.?\s/i.test(customerName) ? customerName : `Mr. ${customerName}`) : '';
    doc.text(`${formattedCustomerName} Ji`, margin + 15, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Address :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(customerInfo.address || '', margin + 20, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Contact No. :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(customerInfo.phone || '', margin + 24, yPos);

    // Right side customer info
    if (customerInfo.email) {
        drawRightAlignedPair(doc, 'Email ID :', customerInfo.email, rightEdge, yPos);
    }

    yPos += 8;

    // 3. TABLE DATA
    const statementLines = statementData?.lines || [];
    const tableData = statementLines.map((line, idx) => [
        idx + 1,
        line.date ? new Date(line.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-') : '',
        line.productDetail || '',
        line.quantity || 0,
        line.pavtiNo || '',
        line.site || '-',
        line.rate || 0,
        `Rs. ${Number(line.totalAmount || 0).toLocaleString('en-IN')}`,
        `Rs. ${Number(line.advanceAmount || 0).toLocaleString('en-IN')}`,
        `Rs. ${Number(line.balance || 0).toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
        startY: yPos,
        margin: { left: margin, right: margin },
        head: [['S. N.', 'Date', 'Product Detail', 'Quantity', 'Pavti No.', 'Site', 'Rate', 'Total Amount', 'Advance', 'Balance']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9.5,
            cellPadding: 1.8,
            halign: 'center',
            lineWidth: 0.2,
            lineColor: [200, 200, 200]
        },
        bodyStyles: {
            textColor: [30, 30, 30],
            fontSize: 9.5,
            cellPadding: 1.5,
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [220, 220, 220]
        },
        columnStyles: {
            0: { cellWidth: Math.round(pw * 0.05) },
            1: { cellWidth: Math.round(pw * 0.10) },
            2: { cellWidth: Math.round(pw * 0.16), halign: 'center' }, // Centered Product Detail
            3: { cellWidth: Math.round(pw * 0.08) },
            4: { cellWidth: Math.round(pw * 0.09) },
            5: { cellWidth: Math.round(pw * 0.14), halign: 'center' },
            6: { cellWidth: Math.round(pw * 0.06) },
            7: { cellWidth: Math.round(pw * 0.10) },
            8: { cellWidth: Math.round(pw * 0.10) },
            9: { cellWidth: Math.round(pw * 0.12) }
        }
    });

    let finalY = doc.lastAutoTable.finalY + 8;

    // Ensure footer doesn't get pushed off page
    if (finalY > doc.internal.pageSize.getHeight() - 35) {
        doc.addPage();
        finalY = 15;
    }

    // 4. FOOTER TOTALS & SIGNATORY
    if (statementData.summary) {
        const totalBricks = Number(statementData.summary.totalBricks || 0).toLocaleString('en-IN');
        const totalAmount = Number(statementData.summary.totalAmount || 0).toLocaleString('en-IN');
        const deposit = Number(statementData.summary.deposit || 0).toLocaleString('en-IN');
        const totalBalance = Number(statementData.summary.totalBalance || 0).toLocaleString('en-IN');

        const boxWidth = Math.min(100, Math.round(pw * 0.5));
        const boxX = rightEdge - boxWidth;

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');

        // Thin Black Borders for Summary Boxes
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);

        // Total Bricks Left Box
        const leftBoxWidth = Math.min(75, Math.round(pw * 0.38));
        doc.rect(margin, finalY, leftBoxWidth, 12);
        doc.text(`Total Bricks = ${totalBricks}`, margin + (leftBoxWidth / 2), finalY + 7.5, { align: 'center' });

        // Totals Summary Right Box
        doc.rect(boxX, finalY, boxWidth, 20);
        doc.line(boxX, finalY + 6.6, boxX + boxWidth, finalY + 6.6);
        doc.line(boxX, finalY + 13.3, boxX + boxWidth, finalY + 13.3);
        doc.line(boxX + (boxWidth / 2), finalY, boxX + (boxWidth / 2), finalY + 20);

        doc.text('Total Amount =', boxX + (boxWidth / 2) - 3, finalY + 5, { align: 'right' });
        doc.text(`Rs. ${totalAmount}`, boxX + (boxWidth / 2) + 3, finalY + 5);

        doc.text('Deposit =', boxX + (boxWidth / 2) - 3, finalY + 11.5, { align: 'right' });
        doc.text(`Rs. ${deposit}`, boxX + (boxWidth / 2) + 3, finalY + 11.5);

        doc.text('Total Balance =', boxX + (boxWidth / 2) - 3, finalY + 18, { align: 'right' });
        doc.text(`Rs. ${totalBalance}`, boxX + (boxWidth / 2) + 3, finalY + 18);

        // Authorized Signatory (Left side, directly below count)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Authorized Signatory', margin, finalY + 20);
        doc.setFont('helvetica', 'normal');
        doc.text(compName, margin, finalY + 25.5);
    }

    return doc;
};

/**
 * Generate Single Invoice PDF
 */
export const generateInvoicePDF = async (invoice, customers, companyInfo, options = {}) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    
    // Dynamic Margin Calculations
    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const margin = options.margin !== undefined ? options.margin : 8;
    const rightEdge = pageWidth - margin;
    const pw = pageWidth - (margin * 2); // Printable width

    let logoBase64 = null;
    let brickLogoBase64 = null;
    try {
        logoBase64 = await getBase64ImageFromUrl(logo);
    } catch (e) {}
    try {
        brickLogoBase64 = await getBase64ImageFromUrl(brickLogo);
    } catch (e) {}

    const compName = companyInfo.name || 'JC Bricks Manufacturing';
    const compAddress = companyInfo.address || 'Village Bisnawda Dhar Road Indore-453001 (M.P.) India';
    const compPhone = companyInfo.phone || '9826305085, 9926777485';
    const compWhatsapp = companyInfo.whatsapp || '9977175856';
    const compEmail = companyInfo.email || 'jcbricksmanufacturing@gmail.com';
    const invoiceDate = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-') : '';

    const customer = customers.find(c => c.name === invoice.customerName);
    const displayPhone = invoice.customerPhone || (customer ? (customer.phone || customer.mobile || '') : '');

    // 1. BRANDING HEADER
    let yPos = Math.max(5, margin);
    if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', margin, yPos, 28, 20, undefined, 'FAST');
    }
    if (brickLogoBase64) {
        doc.addImage(brickLogoBase64, 'JPEG', rightEdge - 26, yPos, 26, 20, undefined, 'FAST');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38);
    doc.text(compName, pageWidth / 2, yPos + 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text(compAddress, pageWidth / 2, yPos + 13, { align: 'center' });

    yPos += 22;

    // Thin Black Divider Line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(margin, yPos, rightEdge, yPos);

    yPos += 5;

    // Contact Info Grid
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);

    // Left side contact info
    doc.setFont('helvetica', 'bold');
    doc.text('Contact No. :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(compPhone, margin + 24, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('WhatsApp No. :', margin, yPos + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(compWhatsapp, margin + 27, yPos + 5);

    // Right side contact info
    drawRightAlignedPair(doc, 'Email ID :', compEmail, rightEdge, yPos);
    drawRightAlignedPair(doc, 'Date :', invoiceDate, rightEdge, yPos + 5);

    yPos += 13;

    // 2. DOCUMENT TITLE & CUSTOMER DETAILS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0);
    doc.text('Customer Invoice', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;

    doc.setFontSize(10);
    // Row 1: Name (Left) | Pavati No. (Right aligned)
    doc.setFont('helvetica', 'bold');
    doc.text('Name :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customerName || '', margin + 15, yPos);

    drawRightAlignedPair(doc, 'Pavati No. :', invoice.pavatiNo, rightEdge, yPos);

    yPos += 5;
    // Row 2: Phone (Left) | Order No. (Right aligned)
    if (displayPhone) {
        doc.setFont('helvetica', 'bold');
        doc.text('Phone :', margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(displayPhone, margin + 16, yPos);
    }

    if (invoice.orderNo) {
        drawRightAlignedPair(doc, 'Order No. :', invoice.orderNo, rightEdge, yPos);
    }

    yPos += 5;
    // Row 3: Site (Left) | Marfat (Right aligned)
    doc.setFont('helvetica', 'bold');
    doc.text('Site :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.site || '', margin + 13, yPos);

    if (invoice.marfat) {
        drawRightAlignedPair(doc, 'Marfat (Via) :', invoice.marfat, rightEdge, yPos);
    }

    yPos += 5;
    // Row 4: Vehicle No. (Left)
    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle No. :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.vehicleNo || '', margin + 24, yPos);

    yPos += 8;

    // 3. INVOICE ITEMS TABLE
    const items = invoice.items && invoice.items.length > 0
        ? invoice.items
        : (invoice.product ? [{ product: invoice.product, quantity: invoice.quantity, rate: invoice.rate, amount: invoice.amount }] : []);

    const itemData = items.map((item, idx) => [
        idx + 1,
        item.product || '',
        item.quantity || 0,
        `Rs. ${Number(item.rate || 0).toFixed(2)}`,
        `Rs. ${Number(Math.round((item.amount || 0) * 100) / 100).toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
        startY: yPos,
        margin: { left: margin, right: margin },
        head: [['S. N.', 'Product Detail', 'Quantity', 'Rate', 'Total Amount']],
        body: itemData,
        theme: 'grid',
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9.5,
            cellPadding: 2,
            halign: 'center',
            lineWidth: 0.2,
            lineColor: [200, 200, 200]
        },
        bodyStyles: {
            textColor: [30, 30, 30],
            fontSize: 9.5,
            cellPadding: 1.8,
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [220, 220, 220]
        },
        columnStyles: {
            0: { cellWidth: Math.round(pw * 0.08) },
            1: { cellWidth: Math.round(pw * 0.38), halign: 'center' }, // Centered Product Detail
            2: { cellWidth: Math.round(pw * 0.16) },
            3: { cellWidth: Math.round(pw * 0.18) },
            4: { cellWidth: Math.round(pw * 0.20) }
        }
    });

    let finalY = doc.lastAutoTable.finalY + 7;

    // 4. PAYMENT HISTORY TABLE IF ANY
    const payments = invoice.payments && invoice.payments.length > 0
        ? invoice.payments
        : (invoice.advance > 0 ? [{ date: invoice.date, amount: invoice.advance, method: 'Cash', remarks: 'Advance' }] : []);

    if (payments.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('Payment History', margin, finalY);
        finalY += 4;

        const paymentData = payments.map((p, idx) => [
            idx + 1,
            p.date ? new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '',
            p.method || 'Cash',
            p.remarks || '-',
            `Rs. ${Number(p.amount || 0).toLocaleString('en-IN')}`
        ]);

        autoTable(doc, {
            startY: finalY,
            margin: { left: margin, right: margin },
            head: [['#', 'Date', 'Method', 'Remarks', 'Amount']],
            body: paymentData,
            theme: 'grid',
            headStyles: {
                fillColor: [245, 245, 245],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: 1.8,
                halign: 'center',
                lineWidth: 0.2
            },
            bodyStyles: {
                fontSize: 9,
                cellPadding: 1.5,
                halign: 'center',
                lineWidth: 0.1
            }
        });

        finalY = doc.lastAutoTable.finalY + 8;
    }

    if (finalY > doc.internal.pageSize.getHeight() - 35) {
        doc.addPage();
        finalY = 15;
    }

    // 5. TOTALS SUMMARY & SIGNATORY
    const totalAmount = Math.round((invoice.totalAmount ?? invoice.amount ?? 0) * 100) / 100;
    const totalAdvance = Math.round((invoice.totalAdvance ?? invoice.advance ?? 0) * 100) / 100;
    const rawBalance = Math.round((invoice.balance ?? 0) * 100) / 100;
    const balance = rawBalance === 0 ? 0 : rawBalance;
    const totalQty = items.reduce((s, i) => s + Number(i.quantity || 0), 0);

    const boxWidth = Math.min(100, Math.round(pw * 0.5));
    const boxX = rightEdge - boxWidth;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');

    // Total Quantity Left Text
    doc.text(`Total Quantity = ${totalQty.toLocaleString('en-IN')}`, margin, finalY + 6);

    // Totals Summary Box (Thin Black Border)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);

    doc.rect(boxX, finalY, boxWidth, 20);
    doc.line(boxX, finalY + 6.6, boxX + boxWidth, finalY + 6.6);
    doc.line(boxX, finalY + 13.3, boxX + boxWidth, finalY + 13.3);
    doc.line(boxX + (boxWidth / 2), finalY, boxX + (boxWidth / 2), finalY + 20);

    doc.text('Total Amount =', boxX + (boxWidth / 2) - 3, finalY + 5, { align: 'right' });
    doc.text(`Rs. ${Number(totalAmount).toLocaleString('en-IN')}`, boxX + (boxWidth / 2) + 3, finalY + 5);

    doc.text('Total Received =', boxX + (boxWidth / 2) - 3, finalY + 11.5, { align: 'right' });
    doc.text(`Rs. ${Number(totalAdvance).toLocaleString('en-IN')}`, boxX + (boxWidth / 2) + 3, finalY + 11.5);

    doc.text('Balance Due =', boxX + (boxWidth / 2) - 3, finalY + 18, { align: 'right' });
    doc.text(`Rs. ${Number(balance).toLocaleString('en-IN')}`, boxX + (boxWidth / 2) + 3, finalY + 18);

    // Authorized Signatory (Left side, directly below count)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Authorized Signatory', margin, finalY + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(compName, margin, finalY + 21.5);

    if (invoice.remarks) {
        finalY += 25;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text(`Remarks: ${invoice.remarks}`, margin, finalY);
    }

    return doc;
};
