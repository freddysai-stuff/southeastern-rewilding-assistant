import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { theme } from '../design-system/theme';
import type { ModuleId } from '../modules';

interface ModuleScreenProps {
  moduleId: ModuleId;
}

const CONTENT: Record<ModuleId, { icon: string; title: string; description: string; features: string[] }> = {
  soil: {
    icon: '🌱',
    title: 'Lawn & Soil Rebuilding',
    description: 'Core rebuilding, remediation, and soil health tracking.',
    features: ['Soil test wizard', 'Amendment recommendations', 'Amendment calculator'],
  },
  specs: {
    icon: '📋',
    title: 'Project Specifications',
    description: 'Project metadata, goals, and planning docs.',
    features: ['Project metadata & goals', 'Site photos & permit checklist', 'Project templates'],
  },
  plants: {
    icon: '🌿',
    title: 'Plant Library & Placement',
    description: 'Browse native plants and plan placement.',
    features: ['Filterable plant library', 'Plant detail view', 'Placement planning'],
  },
  fertilizer: {
    icon: '🧪',
    title: 'Fertilizer & Feeding System',
    description: 'Feeding schedules and dosage guidance.',
    features: ['Schedule builder', 'Dosage calculator', 'Feeding reminders'],
  },
  harvesting: {
    icon: '🌾',
    title: 'Harvesting & Propagation',
    description: 'Track harvests and propagation tasks.',
    features: ['Harvest log', 'Propagation tasks', 'Yield summaries'],
  },
  seasonal: {
    icon: '📅',
    title: 'Calendars & Seasonal Timing',
    description: 'Zone-based seasonal guidance.',
    features: ['Seasonal calendar', "What's blooming", 'Zone-based rules'],
  },
  ai: {
    icon: '💬',
    title: 'AI Chat Assistant',
    description: 'Project-scoped assistant (coming in a later phase).',
    features: ['Conversation history', 'Suggested quick actions', 'Source citations'],
  },
  pdf: {
    icon: '🖨️',
    title: 'Printable & PDF Generator',
    description: 'Export project summaries and plans.',
    features: ['Planting plan export', 'Seasonal checklists', 'Soil reports'],
  },
};

export function ModuleScreen({ moduleId }: ModuleScreenProps) {
  const content = CONTENT[moduleId];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.icon}>{content.icon}</Text>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.description}>{content.description}</Text>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Planned in this module</Text>
        {content.features.map((f) => (
          <Text key={f} style={styles.feature}>
            • {f}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.deepForestGreen,
    marginTop: theme.spacing.sm,
  },
  description: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  feature: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
});
