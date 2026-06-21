export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  fatherId?: string;
  motherId?: string;
  gender: Gender;
  birthDate: Date;
  deathDate?: Date;
  profileUrl?: string;
}

export type UpsertPersonRequest = Omit<Person, 'id'>;

export interface PersonWithParents extends Omit<Person, 'fatherId' | 'motherId'> {
  father?: Person;
  mother?: Person;
  descendants: Person[];
}

export interface PersonFilter {
  gender?: Gender;
  name?: string;
  birthDateFrom?: Date;
  birthDateTo?: Date;
}