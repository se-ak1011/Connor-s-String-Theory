import { StyleSheet, View } from 'react-native';

import { MascotCluster } from '@/components/mascot-cluster';
import { Screen } from '@/components/screen';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.center}>
        <MascotCluster mascotSource={require('@/assets/images/mascot/pickles-default.png')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
