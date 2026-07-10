import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@theme';

type ScreenContainerProps = PropsWithChildren<{
  scrollable?: boolean;
}>;

function ScreenContainer({ children, scrollable = true }: ScreenContainerProps) {
  if (!scrollable) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.fixedContent}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fixedContent: {
    flex: 1,
    padding: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
});

export default ScreenContainer;
