import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatalogTypeDto } from './dto/create-catalog-type.dto';
import { UpdateCatalogTypeDto } from './dto/update-catalog-type.dto';
import { QueryCatalogTypeDto } from './dto/query-catalog-type.dto';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { QueryCatalogItemDto } from './dto/query-catalog-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CatalogTypeService {
  constructor(private readonly prisma: PrismaService) {}

  // ───────────────────────────────────────────────────────────────────────────
  // CATALOG (Master) CRUD
  // ───────────────────────────────────────────────────────────────────────────
  async createCatalog(createCatalogTypeDto: CreateCatalogTypeDto) {
    const { key, name, description, status } = createCatalogTypeDto;

    const existCatalog = await this.prisma.catalog.findUnique({
      where: { key },
    });

    if (existCatalog) {
      throw new BadRequestException('Ya existe un catálogo con esta clave.');
    }

    const catalog = await this.prisma.catalog.create({
      data: {
        key,
        name,
        description: description ?? null,
        status: (status as any) || 'ACTIVE',
      },
    });

    return catalog;
  }

  async findAllCatalogs(query: QueryCatalogTypeDto) {
    const { page = 1, limit = 10, searchTerm } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: {
        not: 'DELETED',
      },
    };

    if (searchTerm) {
      where.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          key: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.catalog.count({ where }),
      this.prisma.catalog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneCatalog(id: string) {
    const catalog = await this.prisma.catalog.findUnique({
      where: { id },
    });

    if (!catalog) {
      throw new NotFoundException('Catálogo no encontrado.');
    }

    return catalog;
  }

  async updateCatalog(id: string, updateCatalogTypeDto: UpdateCatalogTypeDto) {
    const existingCatalog = await this.prisma.catalog.findUnique({
      where: { id },
    });

    if (!existingCatalog) {
      throw new NotFoundException('Catálogo no encontrado.');
    }

    if (updateCatalogTypeDto.key && updateCatalogTypeDto.key !== existingCatalog.key) {
      const duplicate = await this.prisma.catalog.findUnique({
        where: { key: updateCatalogTypeDto.key },
      });

      if (duplicate) {
        throw new BadRequestException('Ya existe otro catálogo con esa clave.');
      }
    }

    const updated = await this.prisma.catalog.update({
      where: { id },
      data: {
        key: updateCatalogTypeDto.key,
        name: updateCatalogTypeDto.name,
        description: updateCatalogTypeDto.description,
        status: updateCatalogTypeDto.status as any,
      },
    });

    return updated;
  }

  async removeCatalog(id: string) {
    const existingCatalog = await this.prisma.catalog.findUnique({
      where: { id },
    });

    if (!existingCatalog) {
      throw new NotFoundException('Catálogo no encontrado.');
    }

    const deleted = await this.prisma.catalog.delete({
      where: { id },
    });

    return deleted;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CATALOG ITEM (Child/Detail) CRUD
  // ───────────────────────────────────────────────────────────────────────────
  async createCatalogItem(createCatalogItemDto: CreateCatalogItemDto) {
    const { catalogId, key, name, description, status } = createCatalogItemDto;

    // Verificar que el catálogo existe
    const catalog = await this.prisma.catalog.findUnique({
      where: { id: catalogId },
    });

    if (!catalog) {
      throw new NotFoundException('El catálogo padre no existe.');
    }

    // Validar clave única dentro de este catálogo
    const existItem = await this.prisma.catalogItem.findUnique({
      where: {
        catalogId_key: {
          catalogId,
          key,
        },
      },
    });

    if (existItem) {
      throw new BadRequestException('El elemento con esta clave ya existe en este catálogo.');
    }

    const item = await this.prisma.catalogItem.create({
      data: {
        catalogId,
        key,
        name,
        description: description ?? null,
        status: (status as any) || 'ACTIVE',
      },
    });

    return item;
  }

  async findAllCatalogItems(catalogId: string, query: QueryCatalogItemDto) {
    const { page = 1, limit = 10, searchTerm } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      catalogId,
      status: {
        not: 'DELETED',
      },
    };

    if (searchTerm) {
      where.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          key: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.catalogItem.count({ where }),
      this.prisma.catalogItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneCatalogItem(id: string) {
    const item = await this.prisma.catalogItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Elemento de catálogo no encontrado.');
    }

    return item;
  }

  async updateCatalogItem(id: string, updateCatalogItemDto: UpdateCatalogItemDto) {
    const existingItem = await this.prisma.catalogItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new NotFoundException('Elemento de catálogo no encontrado.');
    }

    if (updateCatalogItemDto.key && updateCatalogItemDto.key !== existingItem.key) {
      const duplicate = await this.prisma.catalogItem.findUnique({
        where: {
          catalogId_key: {
            catalogId: existingItem.catalogId,
            key: updateCatalogItemDto.key,
          },
        },
      });

      if (duplicate) {
        throw new BadRequestException('Ya existe un elemento con esa clave en este catálogo.');
      }
    }

    const updated = await this.prisma.catalogItem.update({
      where: { id },
      data: {
        key: updateCatalogItemDto.key,
        name: updateCatalogItemDto.name,
        description: updateCatalogItemDto.description,
        status: updateCatalogItemDto.status as any,
      },
    });

    return updated;
  }

  async removeCatalogItem(id: string) {
    const existingItem = await this.prisma.catalogItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new NotFoundException('Elemento de catálogo no encontrado.');
    }

    const deleted = await this.prisma.catalogItem.delete({
      where: { id },
    });

    return deleted;
  }
}
