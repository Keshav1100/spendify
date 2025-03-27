import { Platform, StyleSheet, Text, View } from "react-native";
import React from "react";
import { ModalWrapperProps } from "@/types";
import { colors, spacingY } from "@/constants/theme";

const ModalWrapper = ({
  style,
  children,
  bg = colors.neutral800,
}: ModalWrapperProps) => {
  return (
    <View style={[styles.container, { backgroundColor: bg }, style && style]}>
      {children}
    </View>
  );
};

export default ModalWrapper;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? spacingY._15 : 20,
    paddingBottom: Platform.OS === "ios" ? spacingY._20 : spacingY._10,
  },
});
