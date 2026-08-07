const prisma = require('../config/database')();
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const dayjs = require('dayjs');

const dashboardController = {
  // Get dashboard stats
  async getStats(req, res, next) {
    try {
      const userId = req.user.id;
      const today = dayjs().startOf('day').toDate();
      const startOfMonth = dayjs().startOf('month').toDate();
      const startOfWeek = dayjs().startOf('week').toDate();

      // For workers - get their services
      const whereClause = req.user.role === 'ADMIN' 
        ? {} 
        : { createdById: userId };

      const [todayServices, monthlyIncome, activeClients, pendingTasks, totalServices] = await Promise.all([
        prisma.service.count({
          where: {
            ...whereClause,
            createdAt: { gte: today },
          },
        }),
        prisma.service.aggregate({
          where: {
            ...whereClause,
            createdAt: { gte: startOfMonth },
            paymentStatus: 'PAID',
          },
          _sum: { amount: true },
        }),
        prisma.service.groupBy({
          by: ['clientName'],
          where: {
            ...whereClause,
            status: 'ONGOING',
          },
          _count: { clientName: true },
        }),
        prisma.service.count({
          where: {
            ...whereClause,
            status: 'ONGOING',
            paymentStatus: 'UNPAID',
          },
        }),
        prisma.service.count({
          where: whereClause,
        }),
      ]);

      res.json({
        success: true,
        data: {
          todayServices,
          monthlyIncome: monthlyIncome._sum.amount || 0,
          activeClients: activeClients.length,
          pendingTasks,
          totalServices,
          weeklyServices: await getWeeklyStats(whereClause),
          recentActivities: await getRecentActivities(whereClause),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get monthly report
  async getMonthlyReport(req, res, next) {
    try {
      const { month, year } = req.query;
      const targetMonth = month ? parseInt(month) : dayjs().month();
      const targetYear = year ? parseInt(year) : dayjs().year();

      const startDate = dayjs().year(targetYear).month(targetMonth).startOf('month').toDate();
      const endDate = dayjs().year(targetYear).month(targetMonth).endOf('month').toDate();

      const whereClause = req.user.role === 'ADMIN' 
        ? { createdAt: { gte: startDate, lte: endDate } }
        : { createdById: req.user.id, createdAt: { gte: startDate, lte: endDate } };

      const services = await prisma.service.findMany({
        where: whereClause,
        include: {
          createdBy: {
            select: { fullName: true },
          },
          payments: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      // Calculate daily breakdown
      const dailyBreakdown = {};
      services.forEach(service => {
        const date = dayjs(service.createdAt).format('YYYY-MM-DD');
        if (!dailyBreakdown[date]) {
          dailyBreakdown[date] = { count: 0, total: 0 };
        }
        dailyBreakdown[date].count++;
        dailyBreakdown[date].total += service.amount;
      });

      const totalAmount = services.reduce((sum, s) => sum + s.amount, 0);
      const totalPaid = services.reduce((sum, s) => sum + (s.amountPaid || 0), 0);

      res.json({
        success: true,
        data: {
          month: targetMonth + 1,
          year: targetYear,
          totalServices: services.length,
          totalAmount,
          totalPaid,
          totalUnpaid: totalAmount - totalPaid,
          dailyBreakdown,
          services: services.slice(0, 50), // Limit for performance
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get daily report
  async getDailyReport(req, res, next) {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date) : new Date();
      const startDate = dayjs(targetDate).startOf('day').toDate();
      const endDate = dayjs(targetDate).endOf('day').toDate();

      const whereClause = req.user.role === 'ADMIN' 
        ? { createdAt: { gte: startDate, lte: endDate } }
        : { createdById: req.user.id, createdAt: { gte: startDate, lte: endDate } };

      const services = await prisma.service.findMany({
        where: whereClause,
        include: {
          createdBy: {
            select: { fullName: true },
          },
          payments: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      const totalAmount = services.reduce((sum, s) => sum + s.amount, 0);
      const totalPaid = services.reduce((sum, s) => sum + (s.amountPaid || 0), 0);

      res.json({
        success: true,
        data: {
          date: targetDate,
          totalServices: services.length,
          totalAmount,
          totalPaid,
          totalUnpaid: totalAmount - totalPaid,
          services,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin overview
  async getAdminOverview(req, res, next) {
    try {
      if (req.user.role !== 'ADMIN') {
        throw new AppError('Admin access required', 403);
      }

      const today = dayjs().startOf('day').toDate();
      const startOfMonth = dayjs().startOf('month').toDate();

      const [
        totalWorkers,
        activeWorkersToday,
        totalServices,
        monthlyRevenue,
        pendingPayments,
        servicesByType,
      ] = await Promise.all([
        prisma.user.count({
          where: { role: 'WORKER' },
        }),
        prisma.attendance.count({
          where: {
            date: { gte: today },
            status: 'PRESENT',
          },
        }),
        prisma.service.count(),
        prisma.service.aggregate({
          where: {
            createdAt: { gte: startOfMonth },
            paymentStatus: 'PAID',
          },
          _sum: { amount: true },
        }),
        prisma.service.count({
          where: {
            paymentStatus: 'UNPAID',
          },
        }),
        prisma.service.groupBy({
          by: ['serviceType'],
          _count: { id: true },
          _sum: { amount: true },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalWorkers,
          activeWorkersToday,
          totalServices,
          monthlyRevenue: monthlyRevenue._sum.amount || 0,
          pendingPayments,
          servicesByType: servicesByType.map(s => ({
            type: s.serviceType,
            count: s._count.id,
            total: s._sum.amount || 0,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

// Helper functions
async function getWeeklyStats(whereClause) {
  const startOfWeek = dayjs().startOf('week').toDate();
  const weekDays = [];
  
  for (let i = 0; i < 7; i++) {
    const date = dayjs().startOf('week').add(i, 'day');
    const nextDate = date.add(1, 'day');
    
    const count = await prisma.service.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: date.toDate(),
          lt: nextDate.toDate(),
        },
      },
    });
    
    weekDays.push({
      day: date.format('ddd'),
      date: date.format('YYYY-MM-DD'),
      count,
    });
  }
  
  return weekDays;
}

async function getRecentActivities(whereClause) {
  const activities = await prisma.service.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      createdBy: {
        select: { fullName: true },
      },
    },
  });

  return activities.map(activity => ({
    id: activity.id,
    type: 'service',
    message: `${activity.clientName} - ${activity.serviceType.replace('_', ' ')}`,
    amount: activity.amount,
    status: activity.paymentStatus,
    createdAt: activity.createdAt,
    createdBy: activity.createdBy?.fullName || 'Unknown',
  }));
}

module.exports = dashboardController;