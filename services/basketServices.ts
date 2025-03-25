import { ResponseType, WalletType } from "@/types";
import { uploadFileCloudinary } from "./imageServices";
import { collection, doc, setDoc } from "firebase/firestore";
import { firestore } from "@/config/firebase";

export const createOrUpdateBasket = async (
  basketData: Partial<WalletType>
): Promise<ResponseType> => {
  try {
    let basketToSave = { ...basketData };

    if (basketData.image) {
      const imageUploadRes = await uploadFileCloudinary(
        basketData.image,
        "wallets"
      );

      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload basket icon",
        };
      }

      basketToSave.image = imageUploadRes.data;
    }
    if (!basketData?.id) {
      basketToSave.amount = 0;
      basketToSave.totalIncome = 0;
      basketToSave.totalExpenses = 0;
      basketToSave.created = new Date();
    }
    const walletRef = basketData?.id
      ? doc(firestore, "wallets", basketData.id)
      : doc(collection(firestore, "wallets"));
    await setDoc(walletRef, basketToSave, { merge: true }); // updates the provided fields only
    return {
      success: true,
      data: {
        ...basketToSave,
        id: walletRef.id,
      },
    };
  } catch (error: any) {
    console.log("Error creating or updating wallet: ", error);
    return { success: false, msg: error.message };
  }
};
