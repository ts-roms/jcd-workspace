import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFiltersDto } from './dto/user-filters.dto';
import { UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(data: CreateUserDto): Promise<UserDocument> {
    return this.usersRepository.create(data);
  }

  async findById(id: string, populateSubjects = false): Promise<UserDocument | null> {
    return this.usersRepository.findById(id, populateSubjects);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmailWithPassword(email);
  }

  async findAll(filters: UserFiltersDto): Promise<{
    users: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.usersRepository.findAll(filters);
  }

  async update(id: string, data: UpdateUserDto): Promise<UserDocument | null> {
    return this.usersRepository.update(id, data);
  }

  async updateRoles(
    userId: string,
    roleIds: string[],
  ): Promise<UserDocument | null> {
    return this.usersRepository.updateRoles(userId, roleIds);
  }

  async delete(id: string): Promise<boolean> {
    return this.usersRepository.delete(id);
  }

  async updateLastLogin(id: string, ip: string): Promise<void> {
    return this.usersRepository.updateLastLogin(id, ip);
  }

  async updateCurrentSessionId(id: string, sessionId: string): Promise<void> {
    return this.usersRepository.updateCurrentSessionId(id, sessionId);
  }

  async count(filters: UserFiltersDto): Promise<number> {
    return this.usersRepository.count(filters);
  }

  async promoteSingleStudent(studentId: string) {
    return this.usersRepository.promoteSingleStudent(studentId);
  }

  async promoteStudents(
    studentRoleId: string,
    departmentId?: string,
  ): Promise<{ promoted: number; graduated: number }> {
    return this.usersRepository.promoteStudents(studentRoleId, departmentId);
  }
}
