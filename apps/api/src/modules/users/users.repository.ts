import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFiltersDto } from './dto/user-filters.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async create(data: CreateUserDto): Promise<UserDocument> {
    let roleIds = data.roles;
    if (!roleIds || roleIds.length === 0) {
      const defaultRole = await this.roleModel.findOne({ name: 'user' });
      roleIds = defaultRole ? [defaultRole._id.toString()] : [];
    }

    const user = new this.userModel({
      ...data,
      roles: roleIds.map((id) => new Types.ObjectId(id)),
    });

    await user.save();
    await user.populate('roles');
    return user;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .populate({
        path: 'roles',
        populate: { path: 'permissions' },
      })
      .populate('department')
      .populate('enrolledSubjects')
      .exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .populate({
        path: 'roles',
        populate: { path: 'permissions' },
      })
      .exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .select('+password')
      .populate('roles')
      .exec();
  }

  async findAll(filters: UserFiltersDto = {}): Promise<{
    users: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      role,
      department,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = filters;

    const query: FilterQuery<UserDocument> = {};

    if (search) {
      const escapedSearch = this.escapeRegex(search);
      query.$or = [
        { firstName: { $regex: escapedSearch, $options: 'i' } },
        { lastName: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    // Apply role filter at database level
    if (role) {
      const roleDoc = await this.roleModel.findOne({ name: role }).exec();
      if (roleDoc) {
        query.roles = roleDoc._id;
      } else {
        // If role doesn't exist, return empty results
        return {
          users: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
    }

    // Apply department filter
    if (department && Types.ObjectId.isValid(department)) {
      query.department = new Types.ObjectId(department);
    }

    const users = await this.userModel
      .find(query)
      .populate({
        path: 'roles',
        populate: { path: 'permissions' },
      })
      .populate('department')
      .populate('enrolledSubjects')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.userModel.countDocuments(query);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: UpdateUserDto): Promise<UserDocument | null> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.enrolledSubjects) {
      updateData.enrolledSubjects = data.enrolledSubjects.map(
        (id) => new Types.ObjectId(id),
      );
    }
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate({
        path: 'roles',
        populate: { path: 'permissions' },
      })
      .populate('enrolledSubjects')
      .exec();
  }

  async updateRoles(
    userId: string,
    roleIds: string[],
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { roles: roleIds.map((id) => new Types.ObjectId(id)) } },
        { new: true },
      )
      .populate('roles')
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async updateLastLogin(id: string, ip: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });
  }

  async updateCurrentSessionId(id: string, sessionId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      currentSessionId: sessionId,
    });
  }

  /**
   * Promote all students to the next semester/year.
   * 1st Sem → 2nd Sem (same year)
   * 2nd Sem → 1st Sem (next year level)
   * 4th Year 2nd Sem → graduated (marked inactive)
   */
  async promoteStudents(
    studentRoleId: string,
    departmentId?: string,
  ): Promise<{ promoted: number; graduated: number }> {
    const filter: FilterQuery<UserDocument> = {
      roles: studentRoleId,
      isActive: true,
    };
    if (departmentId) {
      filter.department = new Types.ObjectId(departmentId);
    }

    const students = await this.userModel.find(filter).exec();

    const yearOrder = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    let promoted = 0;
    let graduated = 0;

    for (const student of students) {
      const currentSem = student.semester || '1st Sem';
      const currentYear = student.gradeLevel || '1st Year';
      const yearIndex = yearOrder.indexOf(currentYear);

      if (currentSem === '1st Sem') {
        // Move to 2nd Sem, same year
        student.semester = '2nd Sem';
        // Clear enrolled subjects for the new semester
        student.enrolledSubjects = [];
        await student.save();
        promoted++;
      } else {
        // 2nd Sem → next year, 1st Sem
        if (yearIndex >= 0 && yearIndex < yearOrder.length - 1) {
          student.gradeLevel = yearOrder[yearIndex + 1];
          student.semester = '1st Sem';
          student.enrolledSubjects = [];
          await student.save();
          promoted++;
        } else {
          // 4th Year 2nd Sem → graduated
          student.isActive = false;
          student.enrolledSubjects = [];
          await student.save();
          graduated++;
        }
      }
    }

    return { promoted, graduated };
  }

  /**
   * Promote a single student to the next semester/year.
   */
  async promoteSingleStudent(
    studentId: string,
  ): Promise<{ status: 'promoted' | 'graduated'; gradeLevel: string; semester: string }> {
    const student = await this.userModel.findById(studentId).exec();
    if (!student) throw new Error('Student not found');

    const yearOrder = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const currentSem = student.semester || '1st Sem';
    const currentYear = student.gradeLevel || '1st Year';
    const yearIndex = yearOrder.indexOf(currentYear);

    if (currentSem === '1st Sem') {
      student.semester = '2nd Sem';
      student.enrolledSubjects = [];
      await student.save();
      return { status: 'promoted', gradeLevel: student.gradeLevel || '1st Year', semester: '2nd Sem' };
    } else {
      if (yearIndex >= 0 && yearIndex < yearOrder.length - 1) {
        student.gradeLevel = yearOrder[yearIndex + 1];
        student.semester = '1st Sem';
        student.enrolledSubjects = [];
        await student.save();
        return { status: 'promoted', gradeLevel: student.gradeLevel || '1st Year', semester: '1st Sem' };
      } else {
        student.isActive = false;
        student.enrolledSubjects = [];
        await student.save();
        return { status: 'graduated', gradeLevel: currentYear, semester: currentSem };
      }
    }
  }

  async count(filters: UserFiltersDto = {}): Promise<number> {
    const query: FilterQuery<UserDocument> = {};

    if (filters.search) {
      const escapedSearch = this.escapeRegex(filters.search);
      query.$or = [
        { firstName: { $regex: escapedSearch, $options: 'i' } },
        { lastName: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    if (typeof filters.isActive === 'boolean') {
      query.isActive = filters.isActive;
    }

    return this.userModel.countDocuments(query);
  }
}
