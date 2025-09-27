import type { KnowledgeBaseItem } from '@/lib/types/supabase';

const knowledgeBaseItems: KnowledgeBaseItem[] = [
  {
    id: 'kb-001',
    title: 'Swimming Pool Hours',
    category: 'Operating Hours',
    content:
      'The main swimming pool is open daily from 6:00 AM to 10:00 PM. The rooftop infinity pool is open from 8:00 AM to 8:00 PM.',
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: '2024-03-01T12:00:00Z',
  },
  {
    id: 'kb-002',
    title: 'Spa Services',
    category: 'Hotel Facilities',
    content:
      'The spa is open daily from 9:00 AM to 9:00 PM. Please book appointments at least 24 hours in advance.',
    lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: '2024-02-15T11:00:00Z',
  },
];

export const getKnowledgeBaseFixture = () => structuredClone(knowledgeBaseItems);
