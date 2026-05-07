export const authStore = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('archiform_token')
  },

  setToken: (token: string): void => {
    localStorage.setItem('archiform_token', token)
  },

  removeToken: (): void => {
    localStorage.removeItem('archiform_token')
  },

  isLoggedIn: (): boolean => {
    return !!authStore.getToken()
  },

  getRole: (): string | null => {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem('archiform_token')
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.role || null
    } catch {
      return null
    }
  },

  isOwner: (): boolean => authStore.getRole() === 'OWNER',
  isAdmin: (): boolean => ['OWNER', 'ADMIN'].includes(authStore.getRole() || ''),
  isMember: (): boolean => authStore.getRole() === 'MEMBER',

  canManageStaff: (): boolean => authStore.isAdmin(),
  canManageProjects: (): boolean => authStore.isAdmin(),
  canManageInvoices: (): boolean => authStore.isAdmin(),
  canManageBilling: (): boolean => authStore.isOwner(),
  canDeleteFirm: (): boolean => authStore.isOwner(),
}