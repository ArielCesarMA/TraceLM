import { PushHistoryStore } from '../PushHistoryStore';

class InMemoryMemento {
  private readonly state = new Map<string, unknown>();

  get<T>(key: string, defaultValue: T): T {
    return (this.state.has(key) ? (this.state.get(key) as T) : defaultValue) as T;
  }

  async update(key: string, value: unknown): Promise<void> {
    this.state.set(key, value);
  }
}

describe('PushHistoryStore', () => {
  it('stores and retrieves records by fingerprint', async () => {
    const store = new PushHistoryStore(new InMemoryMemento() as never);

    await store.put('fp-1', {
      fingerprint: 'fp-1',
      key: 'XRAY-1',
      url: 'https://example/browse/XRAY-1',
      pushedAt: '2026-01-01T00:00:00.000Z'
    });

    const item = store.get('fp-1');
    expect(item?.key).toBe('XRAY-1');
  });

  it('stores records in batch and reports stats', async () => {
    const store = new PushHistoryStore(new InMemoryMemento() as never);

    await store.putBatch([
      [
        'fp-1',
        {
          fingerprint: 'fp-1',
          key: 'XRAY-1',
          url: 'https://example/browse/XRAY-1',
          pushedAt: '2026-01-01T00:00:00.000Z'
        }
      ],
      [
        'fp-2',
        {
          fingerprint: 'fp-2',
          key: 'XRAY-2',
          url: 'https://example/browse/XRAY-2',
          pushedAt: '2026-01-02T00:00:00.000Z'
        }
      ]
    ]);

    const stats = store.getStats();
    expect(stats.totalRecords).toBe(2);
    expect(stats.oldestPush).toBe('2026-01-01T00:00:00.000Z');
    expect(stats.newestPush).toBe('2026-01-02T00:00:00.000Z');
  });

  it('clears push history', async () => {
    const store = new PushHistoryStore(new InMemoryMemento() as never);

    await store.put('fp-1', {
      fingerprint: 'fp-1',
      key: 'XRAY-1',
      url: 'https://example/browse/XRAY-1',
      pushedAt: '2026-01-01T00:00:00.000Z'
    });

    await store.clear();

    expect(store.getAll()).toEqual({});
  });
});
