import { Alert, ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import ModalWrapper from "@/components/ModalWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
// import { ScrollView } from "react-native-reanimated";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { UserDataType, WalletType } from "@/types";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import ImageUpload from "@/components/ImageUpload";
import { createOrUpdateBasket, deleteBasket } from "@/services/basketServices";
import * as Icons from "phosphor-react-native";
const basketsModal = () => {
  const { user, updateUserData } = useAuth();
  const [basket, setBasket] = useState<WalletType>({
    name: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const oldBasket: { name: string; image: string; id: string } =
    useLocalSearchParams();
  useEffect(() => {
    if (oldBasket?.id) {
      setBasket({
        name: oldBasket.name,
        image: oldBasket.image,
      });
    }
  }, []);

  // console.log("oldBasket: ", oldBasket);
  const onSubmit = async () => {
    let { name, image } = basket;
    if (!name.trim() || !image) {
      Alert.alert("Basket", "Please fill all the fields");
      return;
    }
    const data: WalletType = {
      name,
      image,
      uid: user?.uid,
    };
    if (oldBasket?.id) data.id = oldBasket.id;
    setLoading(true);
    // console.log("on submit: userData::::", basket);
    const res = await createOrUpdateBasket(data);
    setLoading(false);
    console.log("res for basket creation: ", res);
    if (res.success) {
      // update user
      // updateUserData(user?.uid as string);
      router.back();
    } else {
      Alert.alert("Basket", res.msg);
    }
  };

  const onDelete = async () => {
    if (!oldBasket?.id) return;
    setLoading(true);
    const res = await deleteBasket(oldBasket?.id);
    setLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Wallet", res.msg);
    }
  };
  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to do this? \nThis action will remove all the transactions related to this wallet.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("cancel delete"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => onDelete(),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldBasket?.id ? "Update Basket" : "New Basket"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Basket Name</Typo>
            <Input
              placeholder="Salary"
              value={basket.name}
              onChangeText={(value) => setBasket({ ...basket, name: value })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Basket Icon</Typo>
            <ImageUpload
              file={basket.image}
              onClear={() => setBasket({ ...basket, image: null })}
              onSelect={(file) => setBasket({ ...basket, image: file })}
              placeholder="Upload Image"
            />
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        {oldBasket.id && !loading && (
          <Button
            onPress={showDeleteAlert}
            style={{
              backgroundColor: colors.rose,
              paddingHorizontal: spacingX._15,
            }}
          >
            <Icons.Trash
              color={colors.white}
              size={verticalScale(24)}
              weight="bold"
            />
          </Button>
        )}

        <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }}>
          <Typo color={colors.black} fontWeight={"700"}>
            {oldBasket?.id ? "Update Basket" : "Add Basket"}
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default basketsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacingY._20,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
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
    borderWidth: 1,
    borderColor: colors.neutral500,
    // overflow: "hidden", // Uncomment if needed
    // position: "relative", // Uncomment if needed
  },
  editIcon: {
    position: "absolute",
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },

  inputContainer: {
    gap: spacingY._10,
  },
});
