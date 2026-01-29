const PDFDocument = require("pdfkit");

const generateOrderHistoryPDF = (orders, res) => {
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=order-history.pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Order History", { align: "center" });
    doc.moveDown();

    orders.forEach((order, index) => {
        doc.fontSize(14).text(`Order ${index + 1}:`, { underline: true });
        doc.text(`Order ID: ${order._id}`);
        doc.text(`Date: ${order.createdAt}`);
        doc.text(`Total: ${order.total}`);
        doc.text("Items:");
        order.items.forEach(item => {
            doc.text(`- ${item.name} x ${item.quantity}`);
        });
        doc.moveDown();
    });

    doc.end();
};

module.exports = { generateOrderHistoryPDF };