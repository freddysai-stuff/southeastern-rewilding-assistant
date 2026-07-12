import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MODULES, PRIMARY_MODULE_IDS, type ModuleId } from '../modules';
import { theme } from '../design-system/theme';

interface BottomTabBarProps {
  active: ModuleId | 'dashboard';
  onSelect: (id: ModuleId) => void;
}

// Custom lightweight bottom nav (no @react-navigation dependency) mirroring
// the mobile bottom nav bar shown in the provided mockups.
export function BottomTabBar({ active, onSelect }: BottomTabBarProps) {
  const items = MODULES.filter((m) => PRIMARY_MODULE_IDS.includes(m.id));

  return (
    <View style={styles.bar}>
      {items.map((m) => {
        const isActive = active === m.id;
        return (
          <TouchableOpacity key={m.id} style={styles.item} onPress={() => onSelect(m.id)}>
            <Text style={styles.icon}>{m.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{m.label.split(' ')[0]}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
  },
  item: {
    alignItems: 'center',
    gap: 2,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  labelActive: {
    color: theme.colors.deepForestGreen,
  },
});
