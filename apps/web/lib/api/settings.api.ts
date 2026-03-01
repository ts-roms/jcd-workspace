import axiosInstance, { ApiResponse } from './axios';

export interface Settings {
  _id: string;
  siteName: string;
  siteDescription?: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailVerificationRequired: boolean;
  defaultUserRole?: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsDto {
  siteName?: string;
  siteDescription?: string;
  maintenanceMode?: boolean;
  allowRegistration?: boolean;
  emailVerificationRequired?: boolean;
  defaultUserRole?: string;
  sessionTimeout?: number;
  maxLoginAttempts?: number;
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSpecialChars?: boolean;
}

export const settingsApi = {
  /**
   * Get application settings
   */
  get: async (): Promise<{ settings: Settings }> => {
    const response = await axiosInstance.get<ApiResponse<{ settings: Settings }>>('/settings');
    return response.data as unknown as { settings: Settings };
  },

  /**
   * Update application settings
   */
  update: async (data: UpdateSettingsDto): Promise<{ settings: Settings }> => {
    const response = await axiosInstance.put<ApiResponse<{ settings: Settings }>>('/settings', data);
    return response.data as unknown as { settings: Settings };
  },
};
