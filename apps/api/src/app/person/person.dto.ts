// person.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, PersonFilter, UpsertPersonRequest } from '@org/shared-types';

export class CreatePersonDto {
  @ApiProperty({ enum: Gender })
  gender: Gender = Gender.Male;

  @ApiProperty({ example: 'John' })
  firstName = 'John';

  @ApiProperty({ example: 'Doe' })
  lastName = 'Doe';

  @ApiProperty({ example: '1993-01-01' })
  birthDate = '1993-01-01';

  @ApiPropertyOptional({ example: '2020-01-01' })
  deathDate?: string;

  @ApiPropertyOptional()
  profileUrl?: string;

  @ApiPropertyOptional()
  fatherId?: string;

  @ApiPropertyOptional()
  motherId?: string;
}

export class UpdatePersonDto extends CreatePersonDto { }

export class FindPeopleQueryDto {
  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender;

  @ApiPropertyOptional({ example: 'John Doe' })
  name?: string;

  @ApiPropertyOptional({ example: '1900-01-01' })
  birthDateFrom?: string;

  @ApiPropertyOptional({ example: '2000-12-31' })
  birthDateTo?: string;
}

export function mapDtoToPerson(dto: CreatePersonDto | UpdatePersonDto): UpsertPersonRequest {
  return {
    ...dto,
    birthDate: new Date(dto.birthDate),
    deathDate: dto.deathDate ? new Date(dto.deathDate) : undefined,
  }
}

export function mapDtoToQuery(dto: FindPeopleQueryDto): PersonFilter {
  return {
    ...dto,
    birthDateFrom: dto.birthDateFrom ? new Date(dto.birthDateFrom) : undefined,
    birthDateTo: dto.birthDateTo ? new Date(dto.birthDateTo) : undefined,
  }
}