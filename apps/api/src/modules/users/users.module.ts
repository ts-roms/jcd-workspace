import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { Subject, SubjectSchema } from '../subjects/schemas/subject.schema';
import { Personnel, PersonnelSchema } from '../personnel/schemas/personnel.schema';
import { Department, DepartmentSchema } from '../departments/schemas/department.schema';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Personnel.name, schema: PersonnelSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
