import { View, Platform, TouchableOpacity, StyleSheet } from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { Text, PlatformPressable } from "@react-navigation/elements";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { colors, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native"
export default function CustomTabs({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
    const tabbarIcons: any = {
        index: (isFocused: boolean) => (
          <Icons.House
            size={verticalScale(30)}
            weight={isFocused ? "fill" : "regular"}
            color={isFocused ? colors.primary : colors.neutral400}
          />
        ),
        statistics: (isFocused: boolean) => (
          <Icons.ChartBar
            size={verticalScale(30)}
            weight={isFocused ? "fill" : "regular"}
            color={isFocused ? colors.primary : colors.neutral400}
          />
        ),
        basket: (isFocused: boolean) => (
          <Icons.Basket
            size={verticalScale(30)}
            weight={isFocused ? "fill" : "regular"}
            color={isFocused ? colors.primary : colors.neutral400}
          />
        ),
        profile: (isFocused: boolean) => (
          <Icons.User
            size={verticalScale(30)}
            weight={isFocused ? "fill" : "regular"}
            color={isFocused ? colors.primary : colors.neutral400}
          />
        ),
      };
      
  //   const { colors } = useTheme();
  //   const { buildHref } = useLinkBuilder();

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label: any =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name}
            // href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          >
            {
                tabbarIcons[route.name] && tabbarIcons[route.name](isFocused)
            }
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  tabbar: {
    flexDirection: "row",
    width: "100%",
    height: Platform.OS === "ios" ? verticalScale(73) : verticalScale(55),
    backgroundColor: colors.neutral800,
    justifyContent: "space-around",
    alignItems: "center",
    borderTopColor: colors.neutral900,
    borderTopWidth: 1,
  },
  tabbarItem: {
    marginBottom: Platform.OS === "ios" ? spacingY._10 : spacingY._5,
    justifyContent: "center",
    alignItems: "center",
  },
});
