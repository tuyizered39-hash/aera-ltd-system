const prisma = require('../config/database')();
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const dayjs = require('dayjs');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const reportController = {
  // ============================================
  // ✅ SEND DAILY REPORT (Worker to Admin)
  // ============================================
  async sendDailyReport(req, res, next) {
    try {
      const userId = req.user.id;
      const { serviceType, startDate, endDate, notes } = req.body;

      console.log('Sending daily report from user:', userId);
      console.log('Request body:', req.body);

      // Fetch services for the worker
      const where = {
        createdById: userId,
        createdAt: {
          gte: startDate ? new Date(startDate) : dayjs().startOf('day').toDate(),
          lte: endDate ? new Date(endDate) : dayjs().endOf('day').toDate(),
        },
      };

      if (serviceType) where.serviceType = serviceType;

      const services = await prisma.service.findMany({
        where,
        include: {
          createdBy: {
            select: {
              fullName: true,
              username: true,
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      console.log('Found services:', services.length);

      // Calculate totals
      const totalAmount = services.reduce((sum, s) => sum + s.amount, 0);
      const totalPaid = services.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
      const totalUnpaid = totalAmount - totalPaid;

      // Create report data
      const reportData = {
        services,
        summary: {
          totalServices: services.length,
          totalAmount,
          totalPaid,
          totalUnpaid,
          totalClients: new Set(services.map(s => s.clientName)).size,
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

      // Save report
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

      // Find admin users
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, fullName: true },
      });

      console.log('Found admins:', admins.length);

      // Create notifications for all admins
      const notifications = [];
      for (const admin of admins) {
        const notification = await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Daily Report Received',
            message: `${req.user.fullName} has submitted a daily report with ${services.length} services. Total: RWF ${totalAmount.toLocaleString()}`,
            type: 'REPORT',
            data: {
              reportId: report.id,
              workerId: req.user.id,
              workerName: req.user.fullName,
              totalServices: services.length,
              totalAmount: totalAmount,
              reportDate: new Date(),
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
        where: {
          userId,
          type: 'REPORT',
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: {
            select: {
              fullName: true,
              username: true,
            },
          },
        },
      });

      // Get report details for each notification
      const notificationsWithDetails = await Promise.all(
        notifications.map(async (notification) => {
          const reportId = notification.data?.reportId;
          let report = null;
          if (reportId) {
            report = await prisma.report.findUnique({
              where: { id: reportId },
              include: {
                user: {
                  select: {
                    fullName: true,
                    username: true,
                  },
                },
              },
            });
          }
          return {
            ...notification,
            report,
          };
        })
      );

      res.json({
        success: true,
        data: notificationsWithDetails,
      });
    } catch (error) {
      console.error('Get report notifications error:', error);
      next(error);
    }
  },

  // ============================================
  // ✅ MARK REPORT NOTIFICATION AS READ (Admin)
  // ============================================
  async markReportNotificationRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId,
          type: 'REPORT',
        },
      });

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

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
  // ✅ MARK ALL REPORT NOTIFICATIONS AS READ (Admin)
  // ============================================
  async markAllReportNotificationsRead(req, res, next) {
    try {
      const userId = req.user.id;

      await prisma.notification.updateMany({
        where: {
          userId,
          type: 'REPORT',
          isRead: false,
        },
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
  // GENERATE REPORT
  // ============================================
  async generateReport(req, res, next) {
    try {
      const { type, serviceType, startDate, endDate, format = 'pdf' } = req.body;
      const userId = req.user.id;

      // Build query filters
      const where = {};
      if (serviceType) where.serviceType = serviceType;
      if (startDate) where.createdAt = { gte: new Date(startDate) };
      if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

      // Fetch data
      const services = await prisma.service.findMany({
        where,
        include: {
          createdBy: {
            select: {
              fullName: true,
              username: true,
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate totals
      const totalAmount = services.reduce((sum, s) => sum + s.amount, 0);
      const totalPaid = services.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
      const totalUnpaid = totalAmount - totalPaid;

      // Generate file based on format
      let fileUrl = null;
      if (format === 'pdf') {
        fileUrl = await generatePDF(services, { totalAmount, totalPaid, totalUnpaid });
      } else if (format === 'excel') {
        fileUrl = await generateExcel(services, { totalAmount, totalPaid, totalUnpaid });
      }

      // Save report to database
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
      console.error('Generate report error:', error);
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
      console.error('Get reports error:', error);
      next(error);
    }
  },

  // ============================================
  // GET REPORT BY ID
  // ============================================
  async getReportById(req, res, next) {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({
        where: { id },
      });

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      if (report.userId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new AppError('You do not have permission to view this report', 403);
      }

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error('Get report by ID error:', error);
      next(error);
    }
  },

  // ============================================
  // DOWNLOAD REPORT
  // ============================================
  async downloadReport(req, res, next) {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({
        where: { id },
      });

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      if (report.userId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new AppError('You do not have permission to download this report', 403);
      }

      if (!report.fileUrl) {
        throw new AppError('No file attached to this report', 404);
      }

      const filePath = path.join(__dirname, '../../', report.fileUrl);
      if (!fs.existsSync(filePath)) {
        throw new AppError('File not found on server', 404);
      }

      res.download(filePath);
    } catch (error) {
      console.error('Download report error:', error);
      next(error);
    }
  },

  // ============================================
  // DELETE REPORT
  // ============================================
  async deleteReport(req, res, next) {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({
        where: { id },
      });

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      if (report.userId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new AppError('You do not have permission to delete this report', 403);
      }

      if (report.fileUrl) {
        const filePath = path.join(__dirname, '../../', report.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await prisma.report.delete({
        where: { id },
      });

      logger.info(`Report ${id} deleted by ${req.user.username}`);

      res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      console.error('Delete report error:', error);
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
            user: {
              select: {
                fullName: true,
                username: true,
              },
            },
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
      console.error('Get all reports error:', error);
      next(error);
    }
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// PDF Generation
async function generatePDF(services, summary) {
  const doc = new PDFDocument();
  const fileName = `report-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '../../uploads/reports/', fileName);

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(20).text('AERA LTD - Service Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(16).text('Summary', { underline: true });
  doc.fontSize(12);
  doc.text(`Total Services: ${services.length}`);
  doc.text(`Total Amount: RWF ${summary.totalAmount.toFixed(2)}`);
  doc.text(`Total Paid: RWF ${summary.totalPaid.toFixed(2)}`);
  doc.text(`Total Unpaid: RWF ${summary.totalUnpaid.toFixed(2)}`);
  doc.moveDown();

  doc.fontSize(14).text('Service Details', { underline: true });
  doc.moveDown();

  const tableTop = doc.y;
  const tableLeft = 50;
  const colWidths = [80, 100, 80, 80, 80];

  doc.fontSize(10);
  doc.text('Client', tableLeft, tableTop);
  doc.text('Type', tableLeft + colWidths[0], tableTop);
  doc.text('Amount', tableLeft + colWidths[0] + colWidths[1], tableTop);
  doc.text('Status', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
  doc.text('Date', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop);

  doc.moveDown();

  let rowY = doc.y;
  services.slice(0, 30).forEach((service) => {
    doc.text(service.clientName, tableLeft, rowY);
    doc.text(service.serviceType.replace('_', ' '), tableLeft + colWidths[0], rowY);
    doc.text(`RWF ${service.amount.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1], rowY);
    doc.text(service.paymentStatus, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowY);
    doc.text(new Date(service.createdAt).toLocaleDateString(), tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], rowY);
    rowY += 20;
  });

  if (services.length > 30) {
    doc.text(`... and ${services.length - 30} more services`, tableLeft, rowY);
  }

  doc.end();

  return `/uploads/reports/${fileName}`;
}

// Excel Generation
async function generateExcel(services, summary) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Service Report');

  worksheet.addRow(['AERA LTD - Service Report']);
  worksheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
  worksheet.addRow([]);
  worksheet.addRow(['Summary']);
  worksheet.addRow([`Total Services: ${services.length}`]);
  worksheet.addRow([`Total Amount: RWF ${summary.totalAmount.toFixed(2)}`]);
  worksheet.addRow([`Total Paid: RWF ${summary.totalPaid.toFixed(2)}`]);
  worksheet.addRow([`Total Unpaid: RWF ${summary.totalUnpaid.toFixed(2)}`]);
  worksheet.addRow([]);

  const headers = ['Client', 'Service Type', 'Amount', 'Payment Status', 'Location', 'Date', 'Created By'];
  worksheet.addRow(headers);

  services.forEach((service) => {
    worksheet.addRow([
      service.clientName,
      service.serviceType.replace('_', ' '),
      service.amount,
      service.paymentStatus,
      service.district,
      new Date(service.createdAt).toLocaleDateString(),
      service.createdBy?.fullName || 'N/A',
    ]);
  });

  const fileName = `report-${Date.now()}.xlsx`;
  const filePath = path.join(__dirname, '../../uploads/reports/', fileName);

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await workbook.xlsx.writeFile(filePath);

  return `/uploads/reports/${fileName}`;
}

module.exports = reportController;