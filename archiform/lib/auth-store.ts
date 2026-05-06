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
}