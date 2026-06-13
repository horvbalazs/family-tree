import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Gender, Person, PersonFilter, PersonWithParents, UpsertPersonRequest } from './person.types';
import { GremlinService } from '@org/graph';
import { v4 as uuid } from 'uuid';
import { process as gremlinProcess } from 'gremlin';

@Injectable()
export class PersonService {
  constructor(private readonly gremlin: GremlinService) { }

  async createPerson(person: UpsertPersonRequest) {
    const g = this.gremlin.g;
    const id = uuid();

    await g
      .addV('Person')
      .property('id', id)
      .property('firstName', person.firstName)
      .property('lastName', person.lastName)
      .property('gender', person.gender)
      .property('birthDate', person.birthDate)
      .property('deathDate', person.deathDate ?? null)
      .property('profileUrl', person.profileUrl ?? null)
      .property('searchName', `${person.firstName} ${person.lastName}`.toLowerCase())
      .iterate();

    if (person.motherId) {
      this.linkMother(id, person.motherId)
    }

    if (person.fatherId) {
      this.linkFather(id, person.fatherId)
    }

    return this.findById(id);
  }

  async updatePerson(person: Person) {
    const prev = await this.findById(person.id);

    if (prev.motherId !== person.motherId) {
      this.linkMother(person.id, person.motherId);
    }

    if (prev.fatherId !== person.fatherId) {
      this.linkFather(person.id, person.fatherId);
    }

    await this.gremlin.g
      .V()
      .has('Person', 'id', person.id)
      .property('firstName', person.firstName)
      .property('lastName', person.lastName)
      .property('gender', person.gender)
      .property('birthDate', person.birthDate)
      .property('deathDate', person.deathDate ?? null)
      .property('profileUrl', person.profileUrl ?? null)
      .property('searchName', `${person.firstName} ${person.lastName}`.toLowerCase())
      .iterate();

    return this.findById(person.id);
  }

  async deletePerson(personId: string): Promise<void> {
    const exists = await this.gremlin.g
      .V()
      .has('Person', 'id', personId)
      .hasNext();

    if (!exists) {
      throw new NotFoundException(
        `Person ${personId} not found`,
      );
    }

    await this.gremlin.g
      .V()
      .has('Person', 'id', personId)
      .drop()
      .iterate();
  }

  async findPeople(filters: PersonFilter) {
    let traversal = this.gremlin.g.V().hasLabel('Person');

    if (filters.gender) {
      traversal = traversal.has('gender', filters.gender);
    }

    if (filters.birthDateFrom) {
      traversal = traversal.has(
        'birthDate',
        gremlinProcess.P.gte(filters.birthDateFrom.toISOString()),
      );
    }

    if (filters.birthDateTo) {
      traversal = traversal.has(
        'birthDate',
        gremlinProcess.P.lte(filters.birthDateTo.toISOString()),
      );
    }

    if (filters.name) {
      traversal = traversal.has(
        'searchName',
        gremlinProcess.TextP.containing(
          filters.name.toLowerCase(),
        ),
      );
    }

    const result = await traversal
      .valueMap(
        'id',
        'firstName',
        'lastName',
        'gender',
        'birthDate',
        'deathDate',
        'profileUrl',
      )
      .toList();

    return result.map((v: unknown) => this.mapVertexToPerson(v as Map<unknown, unknown>));
  }

  async findByIdWithParents(
    personId: string,
    depth = 5,
  ): Promise<PersonWithParents> {
    const person = await this.findById(personId);

    const [father, mother, descendants] = await Promise.all([
      this.findParent(personId, 'FATHER_OF'),
      this.findParent(personId, 'MOTHER_OF'),
      this.findDescendants(personId, depth),
    ]);

    return {
      ...person,
      father,
      mother,
      descendants,
    };
  }

  private async findById(id: string) {
    const v = await this.gremlin.g
      .V()
      .has('Person', 'id', id)
      .valueMap(true)
      .next();

    return this.mapVertexToPerson(v.value);
  }

  private async findParent(
    childId: string,
    edgeLabel: 'FATHER_OF' | 'MOTHER_OF',
  ): Promise<Person | undefined> {
    const result = await this.gremlin.g
      .V()
      .has('Person', 'id', childId)
      .in_(edgeLabel)
      .elementMap()
      .next();

    if (!result.value) {
      return undefined;
    }

    return this.mapVertexToPerson(result.value);
  }

  private async findDescendants(
    personId: string,
    depth: number,
  ): Promise<Person[]> {
    const results = await this.gremlin.g
      .V()
      .has('Person', 'id', personId)
      .repeat(this.gremlin.statics.out('FATHER_OF', 'MOTHER_OF'))
      .emit()
      .times(depth)
      .dedup()
      .elementMap()
      .toList();

    return results.map((vertex: unknown) => this.mapVertexToPerson(vertex as Map<unknown, unknown>));
  }

  private async linkMother(childId: string, motherId?: string) {
    await this.linkTypedParent(childId, motherId, Gender.Female, 'MOTHER_OF');
  }

  private async linkFather(childId: string, fatherId?: string) {
    await this.linkTypedParent(childId, fatherId, Gender.Male, 'FATHER_OF');
  }

  private async linkTypedParent(
    childId: string,
    parentId: string | undefined,
    expectedGender: Gender,
    edgeLabel: 'MOTHER_OF' | 'FATHER_OF',
  ) {
    const g = this.gremlin.g;

    // Always remove existing parent of this type first.
    await g
      .V()
      .has('Person', 'id', childId)
      .inE(edgeLabel)
      .drop()
      .iterate();

    // Undefined means unlink only this parent type.
    if (!parentId) {
      return;
    }

    await this.validateParent(parentId, childId, expectedGender);

    await g
      .V()
      .has('Person', 'id', parentId)
      .as('parent')
      .V()
      .has('Person', 'id', childId)
      .addE(edgeLabel)
      .from_('parent')
      .iterate();
  }

  private mapVertexToPerson(vertex: Map<unknown, unknown>): Person {
    return {
      id: this.getMapValue<string>(vertex, 'id'),
      firstName: this.getMapValue<string>(vertex, 'firstName'),
      lastName: this.getMapValue<string>(vertex, 'lastName'),
      gender: this.getMapValue<Gender>(vertex, 'gender'),
      birthDate: new Date(this.getMapValue<string>(vertex, 'birthDate')),
      deathDate: this.getOptionalMapValue<string>(vertex, 'deathDate')
        ? new Date(this.getOptionalMapValue<string>(vertex, 'deathDate')!)
        : undefined,
      profileUrl: this.getOptionalMapValue<string>(vertex, 'profileUrl'),
    };
  }

  private getMapValue<T>(map: Map<unknown, unknown>, key: string): T {
    const value = this.getOptionalMapValue<T>(map, key);

    if (value === undefined || value === null) {
      throw new Error(`Missing required Person field: ${key}`);
    }

    return value;
  }

  private getOptionalMapValue<T>(
    map: Map<unknown, unknown>,
    key: string,
  ): T | undefined {
    const value = map.get(key);

    // elementMap() usually returns scalar values
    if (!Array.isArray(value)) {
      return value as T | undefined;
    }

    // valueMap() returns arrays like { id: ['abc'] }
    return value[0] as T | undefined;
  }

  private async validateParent(parentId: string, childId: string, expectedGender: Gender) {
    // Validate if the person is eligible to be the parent of the child
    const parent = await this.findById(parentId);
    const child = await this.findById(childId);

    if (!parent) {
      throw new Error(`Parent not found: ${parentId}`);
    }

    if (!child) {
      throw new Error(`Child not found: ${childId}`);
    }

    if (parent.birthDate >= child.birthDate) {
      throw new InternalServerErrorException('Parent\'s birth date cannot be later than the child\'s.');
    }

    if (parent.gender !== expectedGender) {
      throw new Error(
        `Invalid parent gender. Expected ${expectedGender}, got ${parent.gender}`,
      );
    }
  }
}