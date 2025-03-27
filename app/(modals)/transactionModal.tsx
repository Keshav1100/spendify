import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import ModalWrapper from "@/components/ModalWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
// import { ScrollView } from "react-native-reanimated";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { TransactionType, UserDataType, WalletType } from "@/types";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import ImageUpload from "@/components/ImageUpload";
import { createOrUpdateBasket, deleteBasket } from "@/services/basketServices";
import * as Icons from "phosphor-react-native";
import { Dropdown } from "react-native-element-dropdown";
import { expenseCategories, transactionTypes } from "@/constants/data";
import useFetchData from "@/hooks/useFetchData";
import { orderBy, where } from "firebase/firestore";
// import DateTimePicker from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNDateTimePicker from "@react-native-community/datetimepicker";

const TransactionsModal = () => {
  const { user, updateUserData } = useAuth();
  const [transaction, setTransaction] = useState<TransactionType>({
    type: "expense",
    amount: 0,
    description: "",
    category: "",
    date: new Date(),
    basketId: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || transaction.date;
    setTransaction({ ...transaction, date: currentDate });
    setShowDatePicker(Platform.OS === "ios" ? true : false);
  };
  const {
    data: baskets,
    loading: basketLoading,
    error: basketError,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);
  const oldTransaction: { name: string; image: string; id: string } =
    useLocalSearchParams();
  useEffect(() => {
    if (oldTransaction?.id) {
      setTransaction({ ...transaction, image: oldTransaction.image });
    }
  }, []);

  // console.log("oldTransaction: ", oldTransaction);
  const onSubmit = async () => {
    // let { , image } = transaction;
    // if (!name.trim() || !image) {
    //   Alert.alert("Transaction", "Please fill all the fields");
    //   return;
    // }
    // const data: WalletType = {
    //   name,
    //   image,
    //   uid: user?.uid,
    // };
    // if (oldTransaction?.id) data.id = oldTransaction.id;
    // setLoading(true);
    // // console.log("on submit: userData::::", Transaction);
    // const res = await createOrUpdateTransaction(data);
    // setLoading(false);
    // console.log("res for Transaction creation: ", res);
    // if (res.success) {
    //   // update user
    //   // updateUserData(user?.uid as string);
    //   router.back();
    // } else {
    //   Alert.alert("Transaction", res.msg);
    // }
  };

  const onDelete = async () => {
    if (!oldTransaction?.id) return;
    setLoading(true);
    const res = await deleteBasket(oldTransaction?.id);
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
          title={oldTransaction?.id ? "Update Transaction" : "New Transaction"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />
        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          {/* Transaction type dropdown */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Transaction Type</Typo>
            {/* Dropdown here */}

            <Dropdown
              style={styles.dropdownContainer}
              //   placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              activeColor={colors.neutral700}
              iconStyle={styles.dropdownIcon}
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              data={transactionTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              //   placeholder={!isFocus ? "Select item" : "..."}
              value={transaction.type}
              //   onFocus={() => setIsFocus(true)}
              //   onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                setTransaction({ ...transaction, type: item.value });
              }}
            />
          </View>
          {/* Basket dropdown */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Basket</Typo>
            {/* Dropdown here */}

            <Dropdown
              style={styles.dropdownContainer}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              activeColor={colors.neutral700}
              iconStyle={styles.dropdownIcon}
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              data={baskets.map((item) => ({
                label: `${item?.name} (${item?.amount})`,
                value: item?.id,
              }))}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select basket"
              value={transaction.basketId}
              //   onFocus={() => setIsFocus(true)}
              //   onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                setTransaction({ ...transaction, basketId: item.value || "" });
              }}
            />
          </View>
          {/* Expense categories */}
          {transaction.type === "expense" && (
            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Expense Category</Typo>
              {/* Dropdown here */}

              <Dropdown
                style={styles.dropdownContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                activeColor={colors.neutral700}
                iconStyle={styles.dropdownIcon}
                itemTextStyle={styles.dropdownItemText}
                itemContainerStyle={styles.dropdownItemContainer}
                containerStyle={styles.dropdownListContainer}
                data={Object.values(expenseCategories)}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Category"
                value={transaction.category}
                //   onFocus={() => setIsFocus(true)}
                //   onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                  setTransaction({
                    ...transaction,
                    category: item.value || "",
                  });
                }}
              />
            </View>
          )}
          {/* Date picker */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Date</Typo>
            {!showDatePicker && (
              <Pressable
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Typo size={14}>
                  {(transaction.date as Date).toLocaleDateString()}
                </Typo>
              </Pressable>
            )}
            {showDatePicker && (
              <View style={Platform.OS == "ios" && styles.iosDatePicker}>
                <DateTimePicker
                  themeVariant="dark"
                  value={transaction.date as Date}
                  textColor={colors.white}
                  mode="date"
                  display={Platform.OS == "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                />
                {Platform.OS == "ios" && (
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Typo size={15} fontWeight={"500"}>
                      Ok
                    </Typo>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Transaction Icon</Typo>
            <ImageUpload
              //   file={Transaction.image}
              onClear={() => setTransaction({ ...transaction, image: null })}
              onSelect={(file) =>
                setTransaction({ ...transaction, image: file })
              }
              placeholder="Upload Image"
            />
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        {oldTransaction.id && !loading && (
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
            {oldTransaction?.id ? "Update Transaction" : "Add Transaction"}
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default TransactionsModal;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
  },
  form: {
    gap: spacingY._20,
    paddingVertical: spacingY._15,
    paddingBottom: spacingY._40,
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
  inputContainer: {
    gap: spacingY._10,
  },
  iosDropDown: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
  androidDropDown: {
    // flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    fontSize: verticalScale(14),
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    // paddingHorizontal: spacingX._15,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  dateInput: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },

  iosDatePicker: {
    // backgroundColor: "red",
  },
  datePickerButton: {
    backgroundColor: colors.neutral700,
    alignSelf: "flex-end",
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._10,
  },
  dropdownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  dropdownItemText: {
    color: colors.white,
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14),
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: "continuous",
    paddingVertical: spacingY._7,
    top: 5,
    borderColor: colors.neutral500,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  dropdownPlaceholder: {
    color: colors.white,
  },
  dropdownItemContainer: {
    borderRadius: radius._15,
    marginHorizontal: spacingX._7,
  },
  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300,
  },
});
