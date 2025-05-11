export class User {
    id?: string;
    email: string;
    password: string;
    name?: string;
    roles: string[]; // ['user', 'admin', superadmin']
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  
    constructor(partial: Partial<User>) {
      Object.assign(this, partial);
      this.roles = partial.roles || ['user'];
      this.isActive = partial.isActive !== undefined ? partial.isActive : true;
      this.createdAt = partial.createdAt || new Date();
      this.updatedAt = partial.updatedAt || new Date();
    }
  }

  export class Permission {
    id: string;
    name: string;
    description: string;
  }

  export class Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
  }
  