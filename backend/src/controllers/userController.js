const bcrypt = require('bcryptjs');
const prisma = require('../config/database')();
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

const userController = {
  // Create worker (Admin only)
  async createWorker(req, res, next) {
    try {
      const { username, email, password, fullName, phone } = req.body;

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        throw new AppError('Username or email already exists', 409);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          fullName,
          phone,
          role: 'WORKER',
        },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      logger.info(`New worker ${username} created by ${req.user.username}`);

      res.status(201).json({
        success: true,
        message: 'Worker created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all workers (Admin only)
  async getWorkers(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;

      const where = {
        role: 'WORKER',
        isActive: true,
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };

      const [workers, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            profilePicture: true,
            isActive: true,
            lastLogin: true,
            lastPasswordUpdate: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: parseInt(limit),
        }),
        prisma.user.count({ where }),
      ]);

      // Get today's attendance for each worker
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const workersWithAttendance = await Promise.all(
        workers.map(async (worker) => {
          const attendance = await prisma.attendance.findFirst({
            where: {
              userId: worker.id,
              date: {
                gte: today,
                lt: tomorrow,
              },
            },
          });

          return {
            ...worker,
            isPresentToday: !!attendance,
            attendanceStatus: attendance?.status || 'ABSENT',
          };
        })
      );

      res.json({
        success: true,
        data: workersWithAttendance,
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

  // Update worker with password support (Admin only)
  async updateWorker(req, res, next) {
    try {
      const { id } = req.params;
      const { fullName, email, phone, isActive, password } = req.body;

      const worker = await prisma.user.findUnique({
        where: { id },
      });

      if (!worker) {
        throw new AppError('Worker not found', 404);
      }

      if (worker.role === 'ADMIN') {
        throw new AppError('Cannot modify admin user', 403);
      }

      // Prepare update data
      const updateData = {
        fullName,
        email,
        phone,
        isActive,
      };

      // If password is provided, hash it and update lastPasswordUpdate
      if (password) {
        if (password.length < 6) {
          throw new AppError('Password must be at least 6 characters', 400);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
        updateData.lastPasswordUpdate = new Date();
      }

      const updatedWorker = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastPasswordUpdate: true,
        },
      });

      const logMessage = password 
        ? `Worker ${worker.username} updated and password changed by ${req.user.username}`
        : `Worker ${worker.username} updated by ${req.user.username}`;
      logger.info(logMessage);

      res.json({
        success: true,
        message: password ? 'Worker updated and password changed successfully' : 'Worker updated successfully',
        data: updatedWorker,
      });
    } catch (error) {
      next(error);
    }
  },

  // ✅ FIXED: Delete worker (Admin only) - Deactivates instead of deleting if there are related records
  // Delete worker (Admin only)
async deleteWorker(req, res, next) {
  try {
    const { id } = req.params;

    console.log('🔍 Deleting worker with ID:', id);

    // ✅ Check if worker exists
    const worker = await prisma.user.findUnique({
      where: { id },
      include: {
        // ✅ Use correct field names from your schema
        createdServices: {  // ✅ This is the correct field name (not "services")
          select: { id: true },
          take: 1,
        },
        attendance: {
          select: { id: true },
          take: 1,
        },
        notifications: {
          select: { id: true },
          take: 1,
        },
        reports: {
          select: { id: true },
          take: 1,
        },
        deliveries: {
          select: { id: true },
          take: 1,
        },
        payments: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!worker) {
      throw new AppError('Worker not found', 404);
    }

    if (worker.role === 'ADMIN') {
      throw new AppError('Cannot delete admin user', 403);
    }

    // ✅ Check if worker has any related records
    const hasRelations = 
      worker.createdServices.length > 0 ||
      worker.attendance.length > 0 ||
      worker.notifications.length > 0 ||
      worker.reports.length > 0 ||
      worker.deliveries.length > 0 ||
      worker.payments.length > 0;

    if (hasRelations) {
      console.log('⚠️ Worker has related records - deactivating instead of deleting');
      
      // ✅ Deactivate instead of delete
      await prisma.user.update({
        where: { id },
        data: { 
          isActive: false,
          // Optional: Mark username to indicate deactivated
          username: `${worker.username}_deactivated_${Date.now()}`,
        },
      });
      
      logger.info(`Worker ${worker.username} deactivated (has related records) by ${req.user.username}`);
      
      return res.status(200).json({
        success: true,
        message: 'Worker deactivated successfully (has related records)',
        data: { 
          deactivated: true,
          workerId: worker.id,
        },
      });
    }

    // ✅ Only hard delete if no related records
    await prisma.user.delete({
      where: { id },
    });

    logger.info(`Worker ${worker.username} deleted by ${req.user.username}`);

    res.json({
      success: true,
      message: 'Worker deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete worker error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete worker because they have related records. The worker has been deactivated instead.',
        code: 'RELATED_RECORDS_EXIST',
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
        code: 'NOT_FOUND',
      });
    }
    
    next(error);
  }
},
  // Change worker password (Admin only)
  async changeWorkerPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
      }

      const worker = await prisma.user.findUnique({
        where: { id },
      });

      if (!worker) {
        throw new AppError('Worker not found', 404);
      }

      if (worker.role === 'ADMIN') {
        throw new AppError('Cannot change password for admin user', 403);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id },
        data: { 
          password: hashedPassword,
          lastPasswordUpdate: new Date(),
        },
      });

      logger.info(`Password for worker ${worker.username} changed by ${req.user.username}`);

      res.json({
        success: true,
        message: `Password updated for ${worker.fullName}`,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update profile (Authenticated user)
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { fullName, email, phone, username } = req.body;

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email },
          ],
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new AppError('Username or email already exists', 409);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          fullName,
          email,
          phone,
          username,
        },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          profilePicture: true,
          isActive: true,
        },
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  // Upload profile picture
  async uploadProfilePicture(req, res, next) {
    try {
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        throw new AppError('No file uploaded', 400);
      }

      const fileUrl = `/uploads/profiles/${file.filename}`;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: fileUrl },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          profilePicture: true,
        },
      });

      res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;