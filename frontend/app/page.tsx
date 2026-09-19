// Route: / (Entry point)
// Per requirement: First page displayed on website start is the 3D Login Page
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/login');
}
