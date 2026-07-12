import { View, Text, Image, StyleSheet } from 'react-native';
import { theme } from '../design-system/theme';

export function HeaderArtwork() {
  return (
    <View style={styles.header}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.tagline}>Guiding native restoration across the South</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.skyBlue,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logo: {
    width: 200,
    height: 100,
  },
  tagline: {
    marginTop: theme.spacing.xs,
    color: theme.colors.deepForestGreen,
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
