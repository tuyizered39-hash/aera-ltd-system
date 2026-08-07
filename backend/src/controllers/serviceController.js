const prisma = require('../config/database')();
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const dayjs = require('dayjs');

const serviceController = {
  // Create service
  async createService(req, res, next) {
    try {
      const data = {
        ...req.body,
        createdById: req.user.id,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      };

      // Validate dates
      if (isNaN(data.startDate.getTime())) {
        throw new AppError('Invalid start date format', 400);
      }
      if (data.endDate && isNaN(data.endDate.getTime())) {
        throw new AppError('Invalid end date format', 400);
      }

      const service = await prisma.service.create({ data });

      // Create notification for admin
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'New Service Created',
          message: `New ${req.body.serviceType} service for ${req.body.clientName}`,
          type: 'SERVICE',
          data: { serviceId: service.id },
        },
      });

      logger.info(`Service created by ${req.user.username}`);

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service,
      });
    } catch (error) {
      console.error('❌ Create service error:', error);
      next(error);
    }
  },

  // Get services with filters
  async getServices(req, res, next) {
    try {
      const {
        serviceType,
        status,
        paymentStatus,
        clientName,
        district,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = req.query;

      const where = {};

      if (serviceType) where.serviceType = serviceType;
      if (status) where.status = status;
      if (paymentStatus) where.paymentStatus = paymentStatus;
      if (clientName) where.clientName = { contains: clientName, mode: 'insensitive' };
      if (district) where.district = { contains: district, mode: 'insensitive' };
      
      // ✅ Handle date filters properly
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          where.startDate = { gte: start };
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          where.endDate = { lte: end };
        }
      }

      const skip = (page - 1) * limit;

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          include: {
            createdBy: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
            deliveries: true,
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: parseInt(skip),
          take: parseInt(limit),
        }),
        prisma.service.count({ where }),
      ]);

      res.json({
        success: true,
        data: services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error(' Get services error:', error);
      next(error);
    }
  },

  // Get service by ID
  async getServiceById(req, res, next) {
    try {
      const { id } = req.params;

      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
          deliveries: true,
          payments: true,
        },
      });

      if (!service) {
        throw new AppError('Service not found', 404);
      }

      res.json({
        success: true,
        data: service,
      });
    } catch (error) {
      console.error(' Get service by ID error:', error);
      next(error);
    }
  },

  // ✅ FIXED: Update service with date conversion
  async updateService(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      console.log('🔍 Updating service:', { id, data });

      // Check if service exists
      const service = await prisma.service.findUnique({
        where: { id },
      });

      if (!service) {
        throw new AppError('Service not found', 404);
      }

      // ✅ Convert date strings to Date objects
      if (data.startDate) {
        data.startDate = new Date(data.startDate);
        if (isNaN(data.startDate.getTime())) {
          throw new AppError('Invalid start date format', 400);
        }
      }

      if (data.endDate) {
        data.endDate = new Date(data.endDate);
        if (isNaN(data.endDate.getTime())) {
          throw new AppError('Invalid end date format', 400);
        }
      }

      // ✅ Remove fields that shouldn't be updated
      delete data.id;
      delete data.createdAt;
      delete data.updatedAt;
      delete data.createdBy;
      delete data.deliveries;
      delete data.payments;

      // ✅ Ensure numeric fields are numbers
      if (data.amount) data.amount = parseFloat(data.amount);
      if (data.amountPaid !== undefined && data.amountPaid !== null) {
        data.amountPaid = parseFloat(data.amountPaid);
      }
      if (data.tentQuantity !== undefined && data.tentQuantity !== null) {
        data.tentQuantity = parseInt(data.tentQuantity);
      }

      // ✅ Clean up empty strings
      Object.keys(data).forEach(key => {
        if (data[key] === '') {
          data[key] = null;
        }
      });

      const updatedService = await prisma.service.update({
        where: { id },
        data,
      });

      logger.info(`Service ${id} updated by ${req.user.username}`);

      res.json({
        success: true,
        message: 'Service updated successfully',
        data: updatedService,
      });
    } catch (error) {
      console.error(' Update service error:', error);
      next(error);
    }
  },

  // Delete service
  async deleteService(req, res, next) {
    try {
      const { id } = req.params;

      const service = await prisma.service.findUnique({
        where: { id },
      });

      if (!service) {
        throw new AppError('Service not found', 404);
      }

      await prisma.service.delete({
        where: { id },
      });

      logger.info(`Service ${id} deleted by ${req.user.username}`);

      res.json({
        success: true,
        message: 'Service deleted successfully',
      });
    } catch (error) {
      console.error(' Delete service error:', error);
      next(error);
    }
  },

  // Get dashboard stats
  async getDashboardStats(req, res, next) {
    try {
      const today = dayjs().startOf('day').toDate();
      const tomorrow = dayjs().endOf('day').toDate();
      const startOfMonth = dayjs().startOf('month').toDate();

      const [todayServices, monthlyIncome, activeClients, pendingTasks] = await Promise.all([
        prisma.service.count({
          where: {
            createdAt: {
              gte: today,
              lte: tomorrow,
            },
          },
        }),
        prisma.service.aggregate({
          where: {
            createdAt: {
              gte: startOfMonth,
            },
            paymentStatus: 'PAID',
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.service.groupBy({
          by: ['clientName'],
          where: {
            status: 'ONGOING',
          },
          _count: {
            clientName: true,
          },
        }),
        prisma.service.count({
          where: {
            status: 'ONGOING',
            paymentStatus: 'UNPAID',
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          todayServices,
          monthlyIncome: monthlyIncome._sum.amount || 0,
          activeClients: activeClients.length,
          pendingTasks,
        },
      });
    } catch (error) {
      console.error(' Get dashboard stats error:', error);
      next(error);
    }
  },
};

module.exports = serviceController;