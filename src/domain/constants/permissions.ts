// src/domain/constants/permissions.ts
export const PERMISSIONS = {
    CREATE_USER: 'create:user',
    UPDATE_USER: 'update:user',
    DELETE_USER: 'delete:user',
    VIEW_USERS: 'view:users',
    ADMIN_ACCESS: 'admin:access'
  };
  
  export const ROLE_PERMISSIONS = {
    'super-admin': Object.values(PERMISSIONS),
    'admin': [
      PERMISSIONS.CREATE_USER, 
      PERMISSIONS.UPDATE_USER, 
      PERMISSIONS.VIEW_USERS
    ],
    'user': [PERMISSIONS.VIEW_USERS]
  };
  
  // Función helper para verificar permisos (parte del dominio)
  export const hasPermission = (userRoles: string[], requiredPermission: string): boolean => {
    if (!userRoles || userRoles.length === 0) return false;
    
    // Si el usuario tiene el rol super-admin, tiene todos los permisos
    if (userRoles.includes('super-admin')) return true;
    
    // Verifica si alguno de los roles del usuario tiene el permiso requerido
    return userRoles.some(role => 
      ROLE_PERMISSIONS[role]?.includes(requiredPermission)
    );
  };
  