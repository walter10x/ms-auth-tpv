import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { User as UserEntity } from '../../../domain/entities/user.entity';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  private readonly logger = new Logger(MongoUserRepository.name);
  
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        this.logger.debug(`User with id ${id} not found`);
        return null;
      }
      return this.mapToDomain(user);
    } catch (error) {
      this.logger.error(`Error finding user by id: ${error.message}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        this.logger.debug(`User with email ${email} not found`);
        return null;
      }
      return this.mapToDomain(user);
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`);
      throw error;
    }
  }

  async create(userData: UserEntity): Promise<UserEntity> {
    try {
      const newUser = new this.userModel(userData);
      const savedUser = await newUser.save();
      this.logger.log(`User created with id: ${savedUser._id}`);
      return this.mapToDomain(savedUser);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, userData: Partial<UserEntity>): Promise<UserEntity | null> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, userData, { new: true })
        .exec();
      
      if (!updatedUser) {
        this.logger.debug(`User with id ${id} not found for update`);
        return null;
      }
      
      this.logger.log(`User updated with id: ${id}`);
      return this.mapToDomain(updatedUser);
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.userModel.findByIdAndDelete(id).exec();
      const deleted = !!result;
      
      if (deleted) {
        this.logger.log(`User deleted with id: ${id}`);
      } else {
        this.logger.debug(`User with id ${id} not found for deletion`);
      }
      
      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      throw error;
    }
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
