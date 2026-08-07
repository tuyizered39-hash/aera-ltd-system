const prisma = require('../config/database')();
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

const notificationController = {
  // Get notifications for current user
  async getNotifications(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: parseInt(limit),
        }),
        prisma.notification.count({ where: { userId } }),
      ]);

      res.json({
        success: true,
        data: notifications,
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

  // Get unread count
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;

      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      res.json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark notification as read
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId,
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

  // Mark all notifications as read
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;

      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete notification
  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      await prisma.notification.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Create notification (internal use)
  async createNotification(userId, title, message, type, data = null) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          data,
        },
      });
    } catch (error) {
      logger.error('Failed to create notification:', error);
      return null;
    }
  },
};

module.exports = notificationController;