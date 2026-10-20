const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = require('docx');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Calculate total from products
function calculateTotal(products) {
  return (products || []).reduce(
    (sum, p) => sum + (parseFloat(p.unitPrice) || 0) * (parseInt(p.quantity) || 0),
    0
  );
}

// ============================================
// Generate DOCX
// ============================================
async function generateServiceDOCX(service, filePath) {
  const products = service.products || [];
  const total = calculateTotal(products);

  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ children: [new Paragraph({ text: '#', alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph('Product / Service')] }),
        new TableCell({ children: [new Paragraph({ text: 'Unit Price (RWF)', alignment: AlignmentType.RIGHT })] }),
        new TableCell({ children: [new Paragraph({ text: 'Qty', alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: 'Total (RWF)', alignment: AlignmentType.RIGHT })] }),
      ],
    }),
  ];

  products.forEach((p, idx) => {
    const lineTotal = (parseFloat(p.unitPrice) || 0) * (parseInt(p.quantity) || 0);
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: String(idx + 1), alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph(p.name || '')] }),
          new TableCell({ children: [new Paragraph({ text: (parseFloat(p.unitPrice) || 0).toLocaleString(), alignment: AlignmentType.RIGHT })] }),
          new TableCell({ children: [new Paragraph({ text: String(p.quantity || 0), alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: lineTotal.toLocaleString(), alignment: AlignmentType.RIGHT })] }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [{
      children: [
        // ✅ Header — AERA LTD in blue, LTD in yellow
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'AERA ', bold: true, size: 48, color: '0E5CA8' }),
            new TextRun({ text: 'LTD', bold: true, size: 48, color: 'F5B400' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'SERVICE INVOICE', bold: true, size: 28, color: '0E5CA8' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Gakenke District, Northern Province, Rwanda', size: 20, italics: true })],
        }),
        new Paragraph({ text: '' }),

        // ✅ Client block — Name and Date only
        new Paragraph({
          children: [
            new TextRun({ text: 'Client: ', bold: true }),
            new TextRun({ text: service.clientName || 'N/A', bold: true }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Date: ', bold: true }),
            new TextRun({ text: new Date(service.startDate).toLocaleDateString(), bold: true }),
          ],
        }),
        new Paragraph({ text: '' }),

        // Products table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        }),

        new Paragraph({ text: '' }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: 'TOTAL: ', bold: true, size: 28, color: '0E5CA8' }),
            new TextRun({ text: `RWF ${total.toLocaleString()}`, bold: true, size: 32, color: '0E5CA8' }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

// ============================================
// Generate PDF — Modern Invoice Style
// ============================================
async function generateServicePDF(service, filePath) {
  return new Promise((resolve, reject) => {
    const products = service.products || [];
    const total = calculateTotal(products);
    const invoiceNumber = `INV-${new Date(service.createdAt || Date.now()).getFullYear()}-${String(service.id || '').slice(-4).toUpperCase()}`;

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ============================================
    // HEADER BANNER (blue background)
    // ============================================
    doc.rect(0, 0, doc.page.width, 110).fill('#0E5CA8');

    // AERA LTD logo — white & yellow on blue banner
    doc.font('Helvetica-Bold').fontSize(30).fillColor('#FFFFFF')
      .text('AERA', 40, 30, { continued: true });
    doc.fillColor('#F5B400').text(' LTD');

    // Tagline
    doc.font('Helvetica').fontSize(10).fillColor('#CCE0FF')
      .text('Gakenke District, Northern Province, Rwanda', 40, 70);

    // Invoice label on the right
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#CCE0FF')
      .text('INVOICE', 400, 35, { width: 160, align: 'right' });
    doc.fontSize(14).fillColor('#FFFFFF')
      .text(invoiceNumber, 400, 50, { width: 160, align: 'right' });

    // ============================================
    // CLIENT BLOCK
    // ============================================
    let y = 140;

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#0E5CA8')
      .text('BILLED TO', 40, y);

    doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000')
      .text(service.clientName || 'N/A', 40, y + 20);

    doc.font('Helvetica').fontSize(11).fillColor('#333333')
      .text(`Date: ${new Date(service.startDate).toLocaleDateString()}`, 40, y + 42);

    // ============================================
    // PRODUCTS TABLE
    // ============================================
    y += 90;

    // Table header (blue)
    doc.rect(40, y, 515, 28).fill('#0E5CA8');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF');
    doc.text('#', 50, y + 8);
    doc.text('Product / Service', 75, y + 8);
    doc.text('Unit Price', 300, y + 8, { width: 90, align: 'right' });
    doc.text('Qty', 400, y + 8, { width: 40, align: 'center' });
    doc.text('Total', 460, y + 8, { width: 90, align: 'right' });

    y += 28;

    // Table rows
    doc.font('Helvetica').fontSize(10).fillColor('#000000');

    products.forEach((p, idx) => {
      const lineTotal = (parseFloat(p.unitPrice) || 0) * (parseInt(p.quantity) || 0);

      // Alternating row background
      if (idx % 2 === 1) {
        doc.rect(40, y, 515, 24).fill('#F2F6FC');
        doc.fillColor('#000000');
      }

      doc.font('Helvetica-Bold').text(String(idx + 1), 50, y + 6);
      doc.font('Helvetica').text(p.name || '', 75, y + 6, { width: 220 });
      doc.text((parseFloat(p.unitPrice) || 0).toLocaleString(), 300, y + 6, { width: 90, align: 'right' });
      doc.text(String(p.quantity || 0), 400, y + 6, { width: 40, align: 'center' });
      doc.font('Helvetica-Bold').text(lineTotal.toLocaleString(), 460, y + 6, { width: 90, align: 'right' });
      doc.font('Helvetica');

      y += 24;
    });

    // Bottom border of table
    doc.moveTo(40, y).lineTo(555, y).stroke('#0E5CA8');

    // ============================================
    // TOTALS BLOCK
    // ============================================
    y += 20;

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#333333')
      .text('Subtotal:', 350, y, { width: 100, align: 'right' });
    doc.text(`RWF ${total.toLocaleString()}`, 460, y, { width: 90, align: 'right' });

    y += 24;
    doc.rect(340, y - 4, 215, 34).fill('#0E5CA8');

    doc.font('Helvetica-Bold').fontSize(13).fillColor('#FFFFFF')
      .text('GRAND TOTAL:', 350, y + 4, { width: 100, align: 'right' });
    doc.fontSize(16).fillColor('#F5B400')
      .text(`RWF ${total.toLocaleString()}`, 450, y + 2, { width: 100, align: 'right' });

    // ============================================
    // FOOTER
    // ============================================
    y += 60;
    doc.font('Helvetica').fontSize(9).fillColor('#666666');
    if (service.notes) {
      doc.text(`Notes: ${service.notes}`, 40, y);
      y += 20;
    }
    doc.font('Helvetica-Oblique').fontSize(9)
      .text('Thank you for your business!', 40, y, { width: 515, align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { calculateTotal, generateServiceDOCX, generateServicePDF };