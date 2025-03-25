import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/authContext";
import Typo from "@/components/Typo";
import { Image } from "expo-image";
import { getProfileImage } from "@/services/imageServices";
import { accountOptionType } from "@/types";
import * as Icons from "phosphor-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
const profile = () => {
  const router = useRouter();
  const { user } = useAuth();
  const accountOptions: accountOptionType[] = [
    {
      title: "Edit Profile",
      icon: <Icons.User size={24} color={colors.white} weight="fill" />,
      routeName: "/(modals)/profileModal",
      bgColor: "#6366f1",
    },

    {
      title: "Settings",
      icon: <Icons.GearSix size={24} color={colors.white} weight="fill" />,
      //   routeName: "/(modals)/profileModal",
      bgColor: "#6366f1",
    },
    {
      title: "Privacy Policy",
      icon: <Icons.User size={24} color={colors.white} weight="fill" />,
      //   routeName: "/(modals)/profileModal",
      bgColor: colors.neutral600,
    },
    {
      title: "Logout",
      icon: <Icons.Power size={24} color={colors.white} weight="fill" />,
      //   routeName: "/(modals)/profileModal",
      bgColor: "e11d48",
    },
  ];
  const handleLogout = async () => {
    await signOut(auth);
  };
  const showLogoutAlert = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Yes",
        style: "destructive",
        onPress: () => handleLogout(),
      },
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => console.log("no"),
      },
    ]);
  };
  const handlePress = async (item: accountOptionType) => {
    if (item.title === "Logout") {
      showLogoutAlert();
    }
    if (item.routeName) {
      router.push(item.routeName);
    }
  };
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title={"Profile"} style={{ marginVertical: spacingY._10 }} />
        {/* User info */}
        <View style={styles.userInfo}>
          {/* Avatar */}
          <View>
            <Image
              source={getProfileImage(user?.image)+`?new=${Math.random()}`}
              style={styles.avatar}
              contentFit="cover"
              transition={100}
            />
          </View>
          {/* name and email */}
          <View style={styles.nameContainer}>
            <Typo size={24} fontWeight={"600"} color={colors.neutral100}>
              {user?.name}
            </Typo>
            <Typo size={15} color={colors.neutral400}>
              {user?.email}
            </Typo>
          </View>
        </View>
        {/* Account options */}
        <View style={styles.accountOptions}>
          {accountOptions.map((option, index) => (
            <Animated.View
              entering={FadeInDown.delay(index * 50)
                .springify()
                .damping(14)}
              style={styles.listItem}
              key={index}
            >
              <TouchableOpacity
                style={styles.flexRow}
                onPress={() => handlePress(option)}
              >
                <View
                  style={[
                    styles.listIcon,
                    { backgroundColor: option?.bgColor },
                  ]}
                >
                  {option.icon && option.icon}
                </View>
                <Typo size={16} style={{ flex: 1 }} fontWeight={"500"}>
                  {option.title}
                </Typo>
                <Icons.CaretRight
                  size={verticalScale(20)}
                  weight="bold"
                  color={colors.white}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: "center",
    gap: spacingY._15,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    // overflow: "hidden", 
    // // position: "relative",
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 8,
    borderRadius: 50,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: 5,
  },
  nameContainer: {
    gap: verticalScale(4),
    alignItems: "center",
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    backgroundColor: colors.neutral500,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  listItem: {
    marginBottom: verticalScale(17),
  },
  accountOptions: {
    marginTop: spacingY._35,
  },
  flexRow: {
    flexDirection: "row",
    // justifyContent:"space-between",
    alignItems: "center",
    gap: spacingX._10,
  },
});
