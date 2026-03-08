/**
 * Formats and opens a WhatsApp message for an invoice.
 * @param {Object} invoice - The invoice data.
 * @param {string} phone - The customer's phone number.
 */
export const shareInvoiceOnWhatsApp = (invoice, phone) => {
    if (!phone) {
        alert("Customer phone number not found.");
        return;
    }

    // Sanitize phone number (remove non-digits, ensuring it starts with country code)
    // For India, we assume +91 if length is 10.
    let sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone.length === 10) {
        sanitizedPhone = '91' + sanitizedPhone;
    }

    const itemsSummary = (invoice.items || []).map(item =>
        `• ${item.product}: ${item.quantity} units @ ₹${item.rate}`
    ).join('\n');

    const message = `*JC Bricks Manufacturing - Invoice Summary*\n\n` +
        `*Pavati No:* ${invoice.pavatiNo}\n` +
        `*Date:* ${new Date(invoice.date).toLocaleDateString('en-IN')}\n` +
        `--------------------------\n` +
        `*Customer:* ${invoice.customerName}\n` +
        `*Site:* ${invoice.site}\n` +
        `*Vehicle:* ${invoice.vehicleNo}\n\n` +
        `*Products:*\n${itemsSummary}\n` +
        `--------------------------\n` +
        `*Total Amount:* ₹${invoice.totalAmount.toLocaleString()}\n` +
        `*Total Paid:* ₹${invoice.totalAdvance.toLocaleString()}\n` +
        `*Balance Due:* ₹${invoice.balance.toLocaleString()}\n\n` +
        `Thank you for your business!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${sanitizedPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
};
