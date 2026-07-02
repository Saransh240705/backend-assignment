import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    const { title, description, status, priority, dueDate, userId } = req.body;

    // Determine target user
    let targetUserId = req.user.id;
    if (req.user.role === 'ADMIN' && userId) {
      // Admin can assign to any user, verify user exists
      const targetUserExists = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!targetUserExists) {
        return next(new NotFoundError(`User with ID ${userId} does not exist`));
      }
      targetUserId = userId;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: targetUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Task created: "${task.title}" for user: ${task.userId}`);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    const { status, priority, userId } = req.query;

    const whereClause: any = {};

    // Filter by ownership: normal user only gets their own. Admin gets all unless they filter.
    if (req.user.role !== 'ADMIN') {
      whereClause.userId = req.user.id;
    } else if (userId) {
      whereClause.userId = String(userId);
    }

    if (status) {
      whereClause.status = String(status);
    }

    if (priority) {
      whereClause.priority = String(priority);
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return next(new NotFoundError(`Task with ID ${id} not found`));
    }

    // Role-based auth check: User must be owner or admin
    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      return next(new ForbiddenError('You do not have permission to access this task'));
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    const { id } = req.params;
    const { title, description, status, priority, dueDate, userId } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return next(new NotFoundError(`Task with ID ${id} not found`));
    }

    // Auth check: User must be owner or admin
    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      return next(new ForbiddenError('You do not have permission to modify this task'));
    }

    // Prevent non-admin user from reassigning the task to someone else
    if (userId && userId !== task.userId && req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('Only admins can reassign tasks to other users'));
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (userId !== undefined && req.user.role === 'ADMIN') {
      // Admin updating assignee: check if user exists
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        return next(new NotFoundError(`Target user with ID ${userId} does not exist`));
      }
      updateData.userId = userId;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Task updated: "${updatedTask.title}" (${updatedTask.id})`);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return next(new NotFoundError(`Task with ID ${id} not found`));
    }

    // Auth check: User must be owner or admin
    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      return next(new ForbiddenError('You do not have permission to delete this task'));
    }

    await prisma.task.delete({
      where: { id },
    });

    logger.info(`Task deleted: "${task.title}" (${task.id})`);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
