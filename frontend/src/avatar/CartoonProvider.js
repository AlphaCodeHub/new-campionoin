export class CartoonProvider {
  async generateAvatar() { throw new Error('No cartoon provider is configured.'); }
  async getStatus() { return { status: 'idle' }; }
  async cancelJob() { return { cancelled: true }; }
}
