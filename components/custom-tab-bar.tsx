import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function CustomTabBar(props: BottomTabBarProps) {
  const tabBarWidth = SCREEN_WIDTH * 0.7;

  return (
    <View style={styles.container}>
      <View style={[styles.tabBarWrapper, { width: tabBarWidth }]}>
        <BottomTabBar {...props} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBarWrapper: {
    overflow: 'hidden',
    borderRadius: 50,
  },
});

