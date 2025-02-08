
import { Json } from './json';
import { ProfilesTable } from './profiles';
import { ServiceTypesTable } from './service-types';
import { RolesTable } from './user-roles';
import { DatabaseEnums } from './enums';

export type Database = {
  public: {
    Tables: {
      profiles: ProfilesTable
      service_types: ServiceTypesTable
      roles: RolesTable
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          user_id: string
          role: DatabaseEnums["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: DatabaseEnums
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
