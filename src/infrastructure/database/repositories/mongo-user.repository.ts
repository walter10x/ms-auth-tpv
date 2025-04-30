import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { User as UserEntity } from '../../../domain/entities/user.entity';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) return null;
    
    return this.mapToDomain(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) return null;
    
    return this.mapToDomain(user);
  }

  async create(userData: UserEntity): Promise<UserEntity> {
    const newUser = new this.userModel(userData);
    const savedUser = await newUser.save();
    
    return this.mapToDomain(savedUser);
  }

  async update(id: string, userData: Partial<UserEntity>): Promise<UserEntity | null> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, userData, { new: true })
      .exec();
    
    if (!updatedUser) return null;
    
    return this.mapToDomain(updatedUser);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private mapToDomain(userDoc: UserDocument): UserEntity {
    const user = userDoc.toObject();
    return new UserEntity({
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
