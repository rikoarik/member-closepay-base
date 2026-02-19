/**
 * Merchant Closepay V2 App
 * Root component - loads merchant-base app
 * In a multi-tenant setup, this could dynamically load different apps based on tenant ID
 */
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MemberbaseApp from './apps/member-base';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MemberbaseApp />
    </GestureHandlerRootView>
  );
}
