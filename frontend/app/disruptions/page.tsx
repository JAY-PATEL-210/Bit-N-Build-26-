'use client';

// Owner: Member B (Frontend Systems / Interaction & Demo)
// Sections 13, 33, 35, 52: Disruptions index page defaulting to active disruption DISRUPT-001
import DisruptionPage from './[id]/page';

export default function DisruptionsIndexPage() {
  return <DisruptionPage params={{ id: 'DISRUPT-001' }} />;
}
