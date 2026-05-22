import { Injectable } from '@nestjs/common';
import { CreateInfoExternalDto } from './dto/create-info-external.dto';
import { UpdateInfoExternalDto } from './dto/update-info-external.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InfoExternalService {
  constructor(private prisma: PrismaService) { }

  async getCategoriesJibby() {
    const jibbyCategory = await this.prisma.jibbyCategory.findMany({
      include: {
        _count: true,
      },
    });
    return jibbyCategory;
  }

  async getStaffRh() {
    const staff = await this.prisma.rhStaff.findMany({
      include: {
        _count: true,
      },
    });
    return staff;
  }

  async getAreasRh() {
    const areas = await this.prisma.rhArea.findMany({
      include: {
        _count: true,
      },
    });
    return areas;
  }



}
