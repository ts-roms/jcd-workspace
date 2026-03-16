import { IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsBoolean()
  allowRegistration?: boolean;

  @IsOptional()
  @IsBoolean()
  emailVerificationRequired?: boolean;

  @IsOptional()
  @IsString()
  defaultUserRole?: string;

  @IsOptional()
  @IsString()
  appLogo?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyLogo?: string;

  @IsOptional()
  @IsString()
  jwt_access_token_secret?: string;

  @IsOptional()
  @IsString()
  jwt_access_token_expires_in?: string;

  @IsOptional()
  @IsString()
  jwt_refresh_token_secret?: string;

  @IsOptional()
  @IsString()
  jwt_refresh_token_expires_in?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxLoginAttempts?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  lockoutDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  sessionTimeout?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  passwordMinLength?: number;

  @IsOptional()
  @IsBoolean()
  passwordRequireUppercase?: boolean;

  @IsOptional()
  @IsBoolean()
  passwordRequireLowercase?: boolean;

  @IsOptional()
  @IsBoolean()
  passwordRequireNumbers?: boolean;

  @IsOptional()
  @IsBoolean()
  passwordRequireSpecialChars?: boolean;
}
