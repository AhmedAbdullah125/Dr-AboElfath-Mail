import { Suspense } from 'react';
import LoginPage from './page';

export default function LoginLayout() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#545e72', fontSize: 14 }}>Loading…</div>
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}
