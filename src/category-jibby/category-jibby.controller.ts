import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { CategoryJibbyService } from './category-jibby.service';
import { CreateCategoryJibbyDto } from './dto/create-category-jibby.dto';
import { UpdateCategoryJibbyDto } from './dto/update-category-jibby.dto';
import { QueryCategoryJibbyDto } from './dto/query-category-jibby.dto';

@Controller('category-jibby')
export class CategoryJibbyController {
  constructor(private readonly categoryJibbyService: CategoryJibbyService) {}

  @Post('/create-category-jibby')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryJibbyDto: CreateCategoryJibbyDto) {
    return this.categoryJibbyService.create(createCategoryJibbyDto);
  }

  @Get('/find-all')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: QueryCategoryJibbyDto) {
    return this.categoryJibbyService.findAll(query);
  }

  @Get('/find-one/:id')
  @HttpCode(HttpStatus.OK)  
  findOne(@Param('id') id: string) {
    return this.categoryJibbyService.findOne(id);
  }

  @Patch('/update-category/:id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateCategoryJibbyDto: UpdateCategoryJibbyDto) {
    return this.categoryJibbyService.update(id, updateCategoryJibbyDto);
  }

  @Delete('/delete-category/:id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.categoryJibbyService.remove(id);
  }
}
