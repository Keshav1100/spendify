import { ResponseType, WalletType } from "@/types";
import { uploadFileCloudinary } from "./imageServices";
import { collection, deleteDoc, doc, getDocs, query, setDoc, where, writeBatch } from "firebase/firestore";
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
export const deleteBasket = async (basketId: string): Promise<ResponseType> => {
  try {
    const basketRef = doc(firestore, "wallets", basketId);
    await deleteDoc(basketRef);
    // todo: delete all transactions related to this wallet

    deleteTransactionsByBasketId(basketId)
    return { success: true, msg: "Wallet deleted successfully" };
  } catch (err: any) {
    console.log("error deleting wallet: ", err);
    return { success: false, msg: err.message };
  }
};



export const deleteTransactionsByBasketId = async (
  basketId: string
): Promise<ResponseType> => {
  try {
    let hasMoreTransactions = true;

    while (hasMoreTransactions) {
      const transactionsQuery = query(
        collection(firestore, "transactions"),
        where("basketId", "==", basketId)
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      if (transactionsSnapshot.size == 0) {
        hasMoreTransactions = false;
        break;
      }

      const batch = writeBatch(firestore);

      transactionsSnapshot.forEach((transactionDoc) => {
        batch.delete(transactionDoc.ref);
      })

      await batch.commit();
      console.log("Deleted transactions in batch: ", transactionsSnapshot.size);
    }

    return {
      success: true,
      msg: "All transactions deleted successfully",
    };
  } 
  
  
  
  
  
  
  catch (err: any) {
    return {
      success: false,
      msg: err.message,
    };
  }
}