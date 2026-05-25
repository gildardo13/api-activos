import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post("/create-project")
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  

  @Get("/find-all")
  findAll(@Query() query: QueryProjectsDto) {
    return this.projectsService.findAll(query);
  }

  @Get('/find-one/:id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
