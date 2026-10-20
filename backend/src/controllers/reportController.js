const prisma = require('../config/database')();
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const dayjs = require('dayjs');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// ============================================
// BRAND COLORS
// ============================================
const COLORS = {
  blue: '#0E5CA8',
  yellow: '#F5B400',
  lightBlue: '#F2F6FC',
  green: '#16A34A',
  red: '#DC2626',
  gray: '#666666',
  darkGray: '#333333',
};

const reportController = {
  // ============================================
  // ✅ SEND DAILY REPORT (Worker → Admin)
  // ============================================
  async sendDailyReport(req, res, next) {
    try {
      const userId = req.user.id;
      const { serviceType, startDate, endDate, notes } = req.body;

      console.log('Sending daily report from user:', userId);

      const where = { createdById: userId };

   if (startDate) {
    where.createdAt = {
      gte: dayjs(startDate).startOf('day').toDate(),
     lte: dayjs(endDate || startDate).endOf('day').toDate(),
   };
  } else {
  where.createdAt = {
    gte: dayjs().startOf('day').toDate(),
    lte: dayjs().endOf('day').toDate(),
  };
}


      if (serviceType) where.serviceType = serviceType;

      const services = await prisma.service.findMany({
        where,
        include: {
          createdBy: { select: { fullName: true, username: true } },
          payments: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      console.log('Found services:', services.length);

      // ✅ FIX: Parse amounts as numbers
      const totalAmount = services.reduce(
        (sum, s) => sum + (parseFloat(s.amount) || 0),
        0
      );
      const totalPaid = services.reduce(
        (sum, s) => sum + (parseFloat(s.amountPaid) || 0),
        0
      );
      const totalUnpaid = totalAmount - totalPaid;
      const totalClients = new Set(services.map(s => s.clientName)).size;

      const reportData = {
        services,
        summary: {
          totalServices: services.length,
          totalAmount,
          totalPaid,
          totalUnpaid,
          totalClients,
        },
        worker: {
          name: req.user.fullName,
          username: req.user.username,
        },
        notes: notes || '',
        reportDate: new Date(),
        startDate: startDate || dayjs().startOf('day').toDate(),
        endDate: endDate || dayjs().endOf('day').toDate(),
      };

      const report = await prisma.report.create({
        data: {
          userId: req.user.id,
          reportType: 'DAILY',
          serviceType: serviceType || null,
          data: reportData,
          isDaily: true,
          reportDate: new Date(),
          sentToAdmin: false,
        },
      });

      console.log('Report saved:', report.id);

      // Find admins
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, fullName: true },
      });

      // Create notifications WITH full amount data
      const notifications = [];
      for (const admin of admins) {
        const notification = await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Daily Report Received',
            message: `${req.user.fullName} submitted ${services.length} services. Total: RWF ${totalAmount.toLocaleString()}`,
            type: 'REPORT',
            data: {
              reportId: report.id,
              workerId: req.user.id,
              workerName: req.user.fullName,
              totalServices: services.length,
              totalAmount: totalAmount,       // ✅ Number
              totalPaid: totalPaid,           // ✅ Added
              totalUnpaid: totalUnpaid,       // ✅ Added
              totalClients: totalClients,     // ✅ Added
              reportDate: new Date(),
              notes: notes || '',
            },
            isRead: false,
          },
        });
        notifications.push(notification);
      }

      console.log('Notifications created:', notifications.length);

      res.json({
        success: true,
        message: 'Daily report sent to admin successfully',
        data: {
          report,
          services: services.slice(0, 20),
          summary: reportData.summary,
          notifications: notifications.length,
        },
      });
    } catch (error) {
      console.error('Send daily report error:', error);
      next(error);
    }
  },

  // ============================================
  // ✅ GET REPORT NOTIFICATIONS (Admin)
  // ============================================
  async getReportNotifications(req, res, next) {
    try {
      const userId = req.user.id;

      const notifications = await prisma.notification.findMany({
        where: { userId, type: 'REPORT' },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: { select: { fullName: true, username: true } },
        },
      });

      const notificationsWithDetails = await Promise.all(
        notifications.map(async (notification) => {
          const reportId = notification.data?.reportId;
          let report = null;
          if (reportId) {
            report = await prisma.report.findUnique({
              where: { id: reportId },
              include: {
                user: { select: { fullName: true, username: true } },
              },
            });
          }
          return { ...notification, report };
        })
      );

      res.json({ success: true, data: notificationsWithDetails });
    } catch (error) {
      console.error('Get report notifications error:', error);
      next(error);
    }
  },

  // ============================================
  // ✅ MARK REPORT NOTIFICATION AS READ
  // ============================================
  async markReportNotificationRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await prisma.notification.findFirst({
        where: { id, userId, type: 'REPORT' },
      });

      if (!notification) throw new AppError('Notification not found', 404);

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // ✅ MARK ALL REPORT NOTIFICATIONS AS READ
  // ============================================
  async markAllReportNotificationsRead(req, res, next) {
    try {
      const userId = req.user.id;

      await prisma.notification.updateMany({
        where: { userId, type: 'REPORT', isRead: false },
        data: { isRead: true },
      });

      res.json({
        success: true,
        message: 'All report notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // GENERATE REPORT (PDF / Excel)
  // ============================================
  async generateReport(req, res, next) {
    try {
      const { type, serviceType, startDate, endDate, format = 'pdf' } = req.body;
      const userId = req.user.id;

      const where = {};
      if (serviceType) where.serviceType = serviceType;
      if (startDate) where.createdAt = { gte: new Date(startDate) };
      if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

      const services = await prisma.service.findMany({
        where,
        include: {
          createdBy: { select: { fullName: true, username: true } },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // ✅ FIX: Parse amounts
      const totalAmount = services.reduce(
        (sum, s) => sum + (parseFloat(s.amount) || 0),
        0
      );
      const totalPaid = services.reduce(
        (sum, s) => sum + (parseFloat(s.amountPaid) || 0),
        0
      );
      const totalUnpaid = totalAmount - totalPaid;

      let fileUrl = null;
      if (format === 'pdf') {
        fileUrl = await generatePDF(services, { totalAmount, totalPaid, totalUnpaid }, {
          type,
          serviceType,
          startDate,
          endDate,
        });
      } else if (format === 'excel') {
        fileUrl = await generateExcel(services, { totalAmount, totalPaid, totalUnpaid }, {
          type,
          serviceType,
          startDate,
          endDate,
        });
      }

      const report = await prisma.report.create({
        data: {
          userId,
          reportType: type === 'monthly' ? 'MONTHLY' : 'DAILY',
          serviceType: serviceType || null,
          data: {
            services,
            summary: { totalAmount, totalPaid, totalUnpaid },
            filters: { startDate, endDate, serviceType },
          },
          fileUrl,
          isMonthly: type === 'monthly',
          month: type === 'monthly' ? dayjs().format('YYYY-MM') : null,
          year: type === 'monthly' ? dayjs().year() : null,
        },
      });

      logger.info(`Report generated by ${req.user.username}`);

      res.json({
        success: true,
        message: 'Report generated successfully',
        data: {
          report,
          summary: { totalAmount, totalPaid, totalUnpaid },
          services: services.slice(0, 20),
        },
      });
    } catch (error) {
      console.error(' Generate report error:', error);
      next(error);
    }
  },

  // ============================================
  // GET REPORTS
  // ============================================
  async getReports(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.id;

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where: { userId },
          orderBy: { generatedAt: 'desc' },
          skip: (page - 1) * limit,
          take: parseInt(limit),
        }),
        prisma.report.count({ where: { userId } }),
      ]);

      res.json({
        success: true,
        data: reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error(' Get reports error:', error);
      next(error);
    }
  },

  // ============================================
  // GET REPORT BY ID
  // ============================================
  async getReportById(req, res, next) {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({ where: { id } });

      if (!report) throw new AppError('Report not found', 404);

      if (report.userId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new AppError('You do not have permission to view this report', 403);
      }

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // DOWNLOAD REPORT
  // ============================================
  async downloadReport(req, res, next) {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({ where: { id } });

      if (!report) throw new AppError('Report not found', 404);

      if (report.userId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new AppError('You do not have permission to download this report', 403);
      }

      if (!report.fileUrl) throw new AppError('No file attached to this report', 404);

      const filePath = path.join(__dirname, '../../', report.fileUrl);
      if (!fs.existsSync(filePath)) throw new AppError('File not found on server', 404);

      res.download(filePath);
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // DELETE REPORT
  // ============================================
  async deleteReport(req, res, next) {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({ where: { id } });

      if (!report) throw new AppError('Report not found', 404);

      if (report.userId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new AppError('You do not have permission to delete this report', 403);
      }

      if (report.fileUrl) {
        const filePath = path.join(__dirname, '../../', report.fileUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await prisma.report.delete({ where: { id } });

      logger.info(`Report ${id} deleted by ${req.user.username}`);

      res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // ADMIN - GET ALL REPORTS
  // ============================================
  async getAllReports(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          include: {
            user: { select: { fullName: true, username: true } },
          },
          orderBy: { generatedAt: 'desc' },
          skip: (page - 1) * limit,
          take: parseInt(limit),
        }),
        prisma.report.count(),
      ]);

      res.json({
        success: true,
        data: reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

// ============================================
// PDF GENERATOR — MODERN INVOICE STYLE
// ============================================
async function generatePDF(services, summary, filters = {}) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const fileName = `report-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '../../uploads/reports/', fileName);

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // ============================================
  // HEADER BANNER
  // ============================================
  doc.rect(0, 0, doc.page.width, 110).fill(COLORS.blue);

  doc.font('Helvetica-Bold').fontSize(30).fillColor('#FFFFFF')
    .text('AERA', 40, 30, { continued: true });
  doc.fillColor(COLORS.yellow).text(' LTD');

  doc.font('Helvetica').fontSize(10).fillColor('#CCE0FF')
    .text('Gakenke District, Northern Province, Rwanda', 40, 70);

  doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFFFFF')
    .text('SERVICE REPORT', 400, 35, { width: 160, align: 'right' });
  doc.font('Helvetica').fontSize(10).fillColor('#CCE0FF')
    .text(`Generated: ${new Date().toLocaleDateString()}`, 400, 55, { width: 160, align: 'right' });
  doc.text(`Time: ${new Date().toLocaleTimeString()}`, 400, 70, { width: 160, align: 'right' });

  // ============================================
  // SUMMARY SECTION
  // ============================================
  let y = 140;

  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.blue)
    .text('REPORT SUMMARY', 40, y);
  doc.moveTo(40, y + 20).lineTo(555, y + 20).stroke(COLORS.blue);

  y += 35;

  // Summary cards
  const cardWidth = 125;
  const cardGap = 5;
  const cards = [
    { label: 'Total Services', value: services.length, color: COLORS.blue },
    { label: 'Total Amount', value: `RWF ${summary.totalAmount.toLocaleString()}`, color: COLORS.blue },
    { label: 'Total Paid', value: `RWF ${summary.totalPaid.toLocaleString()}`, color: COLORS.green },
    { label: 'Unpaid', value: `RWF ${summary.totalUnpaid.toLocaleString()}`, color: COLORS.red },
  ];

  cards.forEach((card, idx) => {
    const x = 40 + idx * (cardWidth + cardGap);
    doc.rect(x, y, cardWidth, 50).fill(COLORS.lightBlue);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.gray)
      .text(card.label, x + 8, y + 8, { width: cardWidth - 16 });
    doc.font('Helvetica-Bold').fontSize(11).fillColor(card.color)
      .text(String(card.value), x + 8, y + 24, { width: cardWidth - 16 });
  });

  y += 75;

  // ============================================
  // SERVICES TABLE
  // ============================================
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.blue)
    .text('SERVICE DETAILS', 40, y);
  doc.moveTo(40, y + 20).lineTo(555, y + 20).stroke(COLORS.blue);

  y += 30;

  // Table header
  doc.rect(40, y, 515, 26).fill(COLORS.blue);
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
  doc.text('#', 50, y + 8, { width: 20 });
  doc.text('Client', 75, y + 8, { width: 130 });
  doc.text('Service Type', 210, y + 8, { width: 100 });
  doc.text('Amount', 315, y + 8, { width: 75, align: 'right' });
  doc.text('Paid', 395, y + 8, { width: 75, align: 'right' });
  doc.text('Status', 475, y + 8, { width: 70, align: 'center' });

  y += 26;

  // Table rows
  services.slice(0, 40).forEach((service, idx) => {
    if (y > 730) {
      doc.addPage();
      y = 40;
    }

    if (idx % 2 === 1) {
      doc.rect(40, y, 515, 22).fill(COLORS.lightBlue);
    }

    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.darkGray)
      .text(String(idx + 1), 50, y + 6, { width: 20 });
    doc.font('Helvetica').fontSize(8).fillColor('#000000')
      .text(service.clientName || '-', 75, y + 6, { width: 130 });
    doc.text((service.serviceType || '').replace(/_/g, ' '), 210, y + 6, { width: 100 });
    doc.font('Helvetica-Bold')
      .text(`RWF ${(parseFloat(service.amount) || 0).toLocaleString()}`, 315, y + 6, { width: 75, align: 'right' });
    doc.text(`RWF ${(parseFloat(service.amountPaid) || 0).toLocaleString()}`, 395, y + 6, { width: 75, align: 'right' });
    doc.font('Helvetica')
      .text(service.paymentStatus || 'UNPAID', 475, y + 6, { width: 70, align: 'center' });

    y += 22;
  });

  if (services.length > 40) {
    doc.font('Helvetica-Oblique').fontSize(8).fillColor(COLORS.gray)
      .text(`... and ${services.length - 40} more services`, 40, y + 6);
  }

  // ============================================
  // GRAND TOTAL BLOCK
  // ============================================
  y += 30;

  doc.rect(340, y, 215, 40).fill(COLORS.blue);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF')
    .text('GRAND TOTAL:', 350, y + 12, { width: 100, align: 'right' });
  doc.fontSize(14).fillColor(COLORS.yellow)
    .text(`RWF ${summary.totalAmount.toLocaleString()}`, 450, y + 10, { width: 95, align: 'right' });

  // ============================================
  // FOOTER
  // ============================================
  y += 60;
  doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.gray)
    .text('This is a computer-generated report from AERA LTD', 40, y, { width: 515, align: 'center' });
  doc.text('Gakenke District • Northern Province • Rwanda', 40, y + 15, { width: 515, align: 'center' });

  doc.end();

  return `/uploads/reports/${fileName}`;
}

// ============================================
// EXCEL GENERATOR — MODERN STYLE
// ============================================
async function generateExcel(services, summary, filters = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AERA LTD';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Service Report', {
    views: [{ state: 'frozen', ySplit: 4 }],
  });

  // ============================================
  // HEADER
  // ============================================
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'AERA LTD - Service Report';
  titleCell.font = { bold: true, size: 18, color: { argb: 'FF0E5CA8' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells('A2:G2');
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = `Generated: ${new Date().toLocaleString()} • Gakenke District, Rwanda`;
  subtitleCell.font = { italic: true, size: 10, color: { argb: 'FF666666' } };
  subtitleCell.alignment = { horizontal: 'center' };

  // ============================================
  // SUMMARY
  // ============================================
  worksheet.addRow([]);
  worksheet.addRow([' SUMMARY']);
  worksheet.getRow(4).font = { bold: true, size: 12, color: { argb: 'FF0E5CA8' } };

  worksheet.addRow(['Total Services:', services.length]);
  worksheet.addRow(['Total Amount:', summary.totalAmount]);
  worksheet.addRow(['Total Paid:', summary.totalPaid]);
  worksheet.addRow(['Total Unpaid:', summary.totalUnpaid]);

  // Format summary rows
  [5, 6, 7, 8].forEach(rowNum => {
    worksheet.getRow(rowNum).getCell(1).font = { bold: true };
  });

  // Currency format for summary
  ['B6', 'B7', 'B8'].forEach(cell => {
    worksheet.getCell(cell).numFmt = '"RWF "#,##0';
    worksheet.getCell(cell).font = { bold: true };
  });

  worksheet.addRow([]);

  // ============================================
  // TABLE
  // ============================================
  const headerRow = worksheet.addRow([
    '#',
    'Client',
    'Service Type',
    'Amount (RWF)',
    'Paid (RWF)',
    'Status',
    'Date',
  ]);

  // Header styling
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0E5CA8' },
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
  headerRow.height = 25;

  // Data rows
  services.forEach((service, idx) => {
    const row = worksheet.addRow([
      idx + 1,
      service.clientName || '-',
      (service.serviceType || '').replace(/_/g, ' '),
      parseFloat(service.amount) || 0,
      parseFloat(service.amountPaid) || 0,
      service.paymentStatus || 'UNPAID',
      new Date(service.createdAt).toLocaleDateString(),
    ]);

    // Alternating background
    if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F6FC' },
        };
      });
    }

    // Currency format
    row.getCell(4).numFmt = '"RWF "#,##0';
    row.getCell(5).numFmt = '"RWF "#,##0';

    // Status colors
    const statusCell = row.getCell(6);
    if (service.paymentStatus === 'PAID') {
      statusCell.font = { bold: true, color: { argb: 'FF16A34A' } };
    } else if (service.paymentStatus === 'PARTIAL') {
      statusCell.font = { bold: true, color: { argb: 'FFCA8A04' } };
    } else {
      statusCell.font = { bold: true, color: { argb: 'FFDC2626' } };
    }

    // Borders
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      };
    });
  });

  // ============================================
  // GRAND TOTAL ROW
  // ============================================
  const totalRow = worksheet.addRow([
    '',
    '',
    'GRAND TOTAL:',
    summary.totalAmount,
    summary.totalPaid,
    '',
    '',
  ]);

  totalRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12, color: { argb: 'FF0E5CA8' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF3CD' },
    };
  });
  totalRow.getCell(4).numFmt = '"RWF "#,##0';
  totalRow.getCell(5).numFmt = '"RWF "#,##0';

  // ============================================
  // COLUMN WIDTHS
  // ============================================
  worksheet.columns.forEach((column, idx) => {
    const widths = [6, 25, 22, 18, 18, 14, 15];
    column.width = widths[idx] || 15;
  });

  const fileName = `report-${Date.now()}.xlsx`;
  const filePath = path.join(__dirname, '../../uploads/reports/', fileName);

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await workbook.xlsx.writeFile(filePath);

  return `/uploads/reports/${fileName}`;
}

module.exports = reportController;