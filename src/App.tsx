/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PermissionProvider } from './components/PermissionGuard';
import { ThemeProvider } from './contexts/ThemeContext';
import { MainLayout } from './components/MainLayout';

export default function App() {
  return (
    <ThemeProvider>
      <PermissionProvider>
        <MainLayout />
      </PermissionProvider>
    </ThemeProvider>
  );
}
