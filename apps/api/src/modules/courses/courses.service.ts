import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseDocument> {
    const course = new this.courseModel(createCourseDto);
    return course.save();
  }

  async findAll(): Promise<CourseDocument[]> {
    return this.courseModel
      .find()
      .populate('department')
      .sort({ code: 1 })
      .exec();
  }

  async findByDepartment(departmentId: string): Promise<CourseDocument[]> {
    if (!Types.ObjectId.isValid(departmentId)) {
      return [];
    }
    return this.courseModel
      .find({ department: new Types.ObjectId(departmentId), isActive: true })
      .populate('department')
      .sort({ code: 1 })
      .exec();
  }

  async findOne(id: string): Promise<CourseDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid course ID');
    }
    const course = await this.courseModel
      .findById(id)
      .populate('department')
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<CourseDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid course ID');
    }
    const course = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .populate('department')
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid course ID');
    }
    const result = await this.courseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Course not found');
    }
  }
}
