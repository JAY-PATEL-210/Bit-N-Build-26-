'use client';

// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 13, 14, 52: Alternatives index page defaulting to active disruption DISRUPT-001
import AlternativesPage from './[id]/page';

export default function AlternativesIndexPage() {
  return <AlternativesPage params={{ id: 'DISRUPT-001' }} />;
}
