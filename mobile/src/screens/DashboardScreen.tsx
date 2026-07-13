import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MODULES, type ModuleId } from '../modules';
import { theme } from '../design-system/theme';

interface DashboardScreenProps {
  onSelectModule: (id: ModuleId) => void;
}

export function DashboardScreen({ onSelectModule }: DashboardScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.grid}>
      {MODULES.map((m) => (
        <TouchableOpacity key={m.id} style={styles.card} onPress={() => onSelectModule(m.id)}>
          <Text style={styles.icon}>{m.icon}</Text>
          <Text style={styles.title}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.deepForestGreen,
  },
});
