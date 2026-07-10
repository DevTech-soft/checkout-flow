import { StyleSheet, Text, View } from 'react-native';

type PlaceholderScreenProps = {
  label: string;
};

function PlaceholderScreen({ label }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PlaceholderScreen;
