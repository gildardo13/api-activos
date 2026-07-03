import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaginationService {
  constructor(private readonly prisma: PrismaService) {}

  async paginate<T>(
    model: any,
    paginationDto: { page: number; pageSize: number },
    filters: any = {},
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize } = paginationDto;
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClause(filters);
    const [data, total] = await Promise.all([
      model.findMany({
        skip,
        take: +pageSize,
        where,
        orderBy: {
          createdAt: 'desc', // Orden descendente para que los más recientes aparezcan primero
        },
      }),
      model.count({ where }),
    ]);

    return {
      data,
      total,
      page: +page,
      pageSize: +pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  buildWhereClause<T extends Record<string, any>>(
    filters?: T,
  ): Record<string, any> {
    const where: Record<string, any> = {}; // Inicializa como un objeto
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        // Verifica que el valor no sea undefined o null
        if (value !== undefined && value !== null) {
          where[key] = value; // Asigna el filtro si no es undefined o null
        }
      });
    }

    return where;
  }
}
