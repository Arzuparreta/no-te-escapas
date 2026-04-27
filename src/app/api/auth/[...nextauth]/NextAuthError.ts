export class NextAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NextAuthError'
  }
}
