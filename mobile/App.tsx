import { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HeaderArtwork } from './src/components/HeaderArtwork';
import { BottomTabBar } from './src/components/BottomTabBar';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ModuleScreen } from './src/screens/ModuleScreen';
import type { ModuleId } from './src/modules';
import { theme } from './src/design-system/theme';

type Route = 'dashboard' | ModuleId;

export default function App() {
  const [route, setRoute] = useState<Route>('dashboard');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <HeaderArtwork />
      <View style={styles.content}>
        {route === 'dashboard' ? (
          <DashboardScreen onSelectModule={setRoute} />
        ) : (
          <ModuleScreen moduleId={route} />
        )}
      </View>
      <BottomTabBar active={route} onSelect={setRoute} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.cream,
  },
  content: {
    flex: 1,
  },
});
