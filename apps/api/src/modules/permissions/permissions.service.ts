import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import { PermissionDocument } from './schemas/permission.schema';
import { PERMISSIONS as PERMISSION_DEFINITIONS } from '../../common/constants/permissions';

@Injectable()
export class PermissionsService implements OnModuleInit {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async onModuleInit() {
    try {
      await this.syncPermissions();
    } catch (error) {
      this.logger.warn(
        `Permission sync failed: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  private async syncPermissions() {
    let created = 0;
    for (const perm of PERMISSION_DEFINITIONS) {
      try {
        const existing = await this.permissionsRepository.findByName(perm.name);
        if (!existing) {
          await this.permissionsRepository.create(perm);
          created++;
        }
      } catch {
        // Skip duplicates or other errors per permission
      }
    }
    if (created > 0) {
      this.logger.log(`Synced ${created} new permission(s) to database.`);
    }
  }

  async findAll(): Promise<PermissionDocument[]> {
    return this.permissionsRepository.findAll();
  }

  async findById(id: string): Promise<PermissionDocument | null> {
    return this.permissionsRepository.findById(id);
  }

  async findByName(name: string): Promise<PermissionDocument | null> {
    return this.permissionsRepository.findByName(name);
  }

  async findByCategory(category: string): Promise<PermissionDocument[]> {
    return this.permissionsRepository.findByCategory(category);
  }

  async count(): Promise<number> {
    return this.permissionsRepository.count();
  }

  async getGroupedByCategory(): Promise<Record<string, PermissionDocument[]>> {
    const permissions = await this.findAll();
    const grouped: Record<string, PermissionDocument[]> = {};

    permissions.forEach((permission) => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });

    return grouped;
  }

  async create(permission: {
    name: string;
    displayName: string;
    description: string;
    resource: string;
    action: string;
    category: string;
    isSystemPermission?: boolean;
  }): Promise<PermissionDocument> {
    return this.permissionsRepository.create(permission);
  }
}
