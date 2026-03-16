import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema({ timestamps: true })
export class Setting extends Document {
  @Prop({ default: 'RBAC App' })
  siteName: string;

  @Prop({ default: '' })
  siteDescription: string;

  @Prop({ default: '' })
  metaKeywords: string;

  @Prop({ default: '' })
  ogImage: string;

  @Prop({ default: '' })
  appLogo: string;

  @Prop({ default: 'My Company' })
  companyName: string;

  @Prop({ default: '' })
  companyLogo: string;

  @Prop({ default: false })
  maintenanceMode: boolean;

  @Prop({ default: true })
  allowRegistration: boolean;

  @Prop({ default: false })
  emailVerificationRequired: boolean;

  @Prop({ default: '' })
  defaultUserRole: string;

  @Prop({ required: true })
  jwt_access_token_secret: string;

  @Prop({ required: true })
  jwt_access_token_expires_in: string;

  @Prop({ required: true })
  jwt_refresh_token_secret: string;

  @Prop({ required: true })
  jwt_refresh_token_expires_in: string;

  @Prop({ default: 5 })
  maxLoginAttempts: number;

  @Prop({ default: 15 })
  lockoutDuration: number;

  @Prop({ default: 5 })
  sessionTimeout: number; // Idle timeout in minutes

  @Prop({ default: 8 })
  passwordMinLength: number;

  @Prop({ default: true })
  passwordRequireUppercase: boolean;

  @Prop({ default: true })
  passwordRequireLowercase: boolean;

  @Prop({ default: true })
  passwordRequireNumbers: boolean;

  @Prop({ default: false })
  passwordRequireSpecialChars: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
