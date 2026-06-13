import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreatePersonDto, FindPeopleQueryDto, mapDtoToPerson, mapDtoToQuery, UpdatePersonDto } from './person.dto';
import { PersonService } from './person.service';

@Controller({ path: 'person' })
export class PersonController {
  constructor(private readonly personService: PersonService) { }

  @Post()
  createPerson(@Body() person: CreatePersonDto) {
    return this.personService.createPerson(mapDtoToPerson(person));
  }

  @Get()
  getAllPeople(@Query() query: FindPeopleQueryDto) {
    return this.personService.findPeople(mapDtoToQuery(query));
  }

  @Get(':id')
  getPersonById(@Param('id') id: string) {
    return this.personService.findByIdWithParents(id);
  }

  @Put(':id')
  updatePerson(@Param('id') id: string, @Body() person: UpdatePersonDto) {
    return this.personService.updatePerson({ id, ...mapDtoToPerson(person) });
  }

  @Delete(':id')
  deletePerson(@Param('id') id: string) {
    return this.personService.deletePerson(id);
  }
}