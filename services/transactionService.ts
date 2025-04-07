import { firestore } from "@/config/firebase";
import { TransactionType, WalletType } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { uploadFileCloudinary } from "./imageServices";
import { createOrUpdateBasket } from "./basketServices";
import { getLast12Months, getLast7Days, getYearsRange } from "@/utils/common";

// If you're not importing these, mock them:
const scale = (num: number) => num;
const colors = {
  primary: "#4CAF50",
  rose: "#F44336",
};

interface ResponseType {
  success: boolean;
  msg?: string;
  data?: any;
}

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const { id, type, basketId, amount, image } = transactionData;
    if (!amount || amount <= 0 || !basketId || !type) {
      return { success: false, msg: "Invalid transaction data!" };
    }

    if (id) {
      const oldTransactionSnapshot = await getDoc(
        doc(firestore, "transactions", id)
      );

      const oldTransaction = oldTransactionSnapshot.data() as TransactionType;
      const shouldRevertOriginal =
        oldTransaction.type != type ||
        oldTransaction.amount != amount ||
        oldTransaction.basketId != basketId;

      if (shouldRevertOriginal) {
        let res = await revertAndUpdateWallets(
          oldTransaction,
          Number(amount),
          type,
          basketId
        );
        if (!res.success) return res;
      }
    } else {
      let res = await updatebasketForNewTransaction(
        basketId!,
        Number(amount),
        type
      );
      if (!res.success) {
        return res;
      }
    }

    if (image) {
      const imageUploadRes = await uploadFileCloudinary(image, "transaction");
      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload recipt",
        };
      }
      transactionData.image = imageUploadRes.data;
    }

    const transactionRef = id
      ? doc(firestore, "transactions", id)
      : doc(collection(firestore, "transactions"));
    await setDoc(transactionRef, transactionData, { merge: true });
    return { success: true, data: { ...transactionData, id: transactionRef.id } };
  } catch (err: any) {
    console.log("error creating or updating transaction: ", err);
    return { success: false, msg: err.message };
  }
};

const updatebasketForNewTransaction = async (
  basketId: string,
  amount: number,
  type: string
) => {
  try {
    const basketRef = doc(firestore, "wallets", basketId);
    const basketSnapshot = await getDoc(basketRef);
    if (!basketSnapshot.exists()) {
      console.log("error updating basket for new transaction");
      return { success: false, msg: "basket not found" };
    }

    const basketData = basketSnapshot.data() as WalletType;

    if (type == "expense" && basketData.amount! - amount < 0) {
      return { success: false, msg: "Insufficient funds" };
    }

    const updateType = type == "income" ? "totalIncome" : "totalExpenses";
    const updatedbasketAmount =
      type == "income"
        ? Number(basketData.amount || 0) + amount
        : Number(basketData.amount || 0) - amount;

    const updatedTotals =
      type == "income"
        ? Number(basketData.totalIncome || 0) + amount
        : Number(basketData.totalExpenses || 0) + amount;

    await updateDoc(basketRef, {
      amount: updatedbasketAmount,
      [updateType]: updatedTotals,
    });

    return { success: true };
  } catch (err: any) {
    console.log("error updating basket for new transaction: ", err);
    return { success: false, msg: err.message };
  }
};

const revertAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newBasketId: string
) => {
  try {
    const originalBasketSnapshot = await getDoc(
      doc(firestore, "wallets", oldTransaction.basketId)
    );

    const originalBasket = originalBasketSnapshot.data() as WalletType;

    let newBasketSnapshot = await getDoc(
      doc(firestore, "wallets", newBasketId)
    );
    let newBasket = newBasketSnapshot.data() as WalletType;

    const revertType =
      oldTransaction.type == "income" ? "totalIncome" : "totalExpenses";

    const revertIncomeExpense: number =
      oldTransaction.type == "income"
        ? -Number(oldTransaction.amount)
        : Number(oldTransaction.amount);

    const revertedWalletAmount =
      Number(originalBasket.amount || 0) + revertIncomeExpense;

    const revertedIncomeExpenseAmount =
      Number(originalBasket[revertType] || 0) - Number(oldTransaction.amount);

    if (newTransactionType == "expense") {
      if (
        oldTransaction.basketId == newBasketId &&
        revertedWalletAmount < newTransactionAmount
      ) {
        return {
          success: false,
          msg: "The selected wallet don't have enough balance",
        };
      }

      if ((newBasket.amount || 0) < newTransactionAmount) {
        return { success: false, msg: "Insufficient funds" };
      }
    }

    await createOrUpdateBasket({
      id: oldTransaction.basketId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount,
    });

    newBasketSnapshot = await getDoc(doc(firestore, "wallets", newBasketId));
    newBasket = newBasketSnapshot.data() as WalletType;

    const updateType =
      newTransactionType == "income" ? "totalIncome" : "totalExpenses";

    const updatedTransactionAmount: number =
      newTransactionType == "income"
        ? Number(newTransactionAmount)
        : -Number(newTransactionAmount);

    const newBasketAmount = Number(newBasket.amount || 0) + updatedTransactionAmount;

    const newIncomeExpenseAmount =
      Number(newBasket[updateType] || 0) + Number(newTransactionAmount);

    await createOrUpdateBasket({
      id: newBasketId,
      amount: newBasketAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    return { success: true };
  } catch (err: any) {
    console.log("error updating basket for new transaction: ", err);
    return { success: false, msg: err.message };
  }
};

export const deleteTransaction = async (
  transactionId: string,
  basketId: string
) => {
  try {
    const transactionRef = doc(firestore, "transactions", transactionId);
    const transactionSnapshot = await getDoc(transactionRef);

    if (!transactionSnapshot.exists()) {
      return { success: false, msg: "Transaction not found" };
    }

    const transactionData = transactionSnapshot.data() as TransactionType;
    const transactionType = transactionData?.type;
    const transactionAmount = transactionData?.amount;

    const basketSnapshot = await getDoc(doc(firestore, "wallets", basketId));
    const basketData = basketSnapshot.data() as WalletType;

    const updateType =
      transactionType == "income" ? "totalIncome" : "totalExpenses";

    const newBasketAmount =
      (basketData?.amount || 0) -
      (transactionType == "income" ? transactionAmount : -transactionAmount);

    const newIncomeExpenseAmount =
      (basketData[updateType] || 0) - transactionAmount;

    if (transactionType == "expense" && newBasketAmount < 0) {
      return { success: false, msg: "You cannot delete this transaction" };
    }

    await createOrUpdateBasket({
      id: basketId,
      amount: newBasketAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    await deleteDoc(transactionRef);

    return { success: true };
  } catch (err: any) {
    console.log("error updating basket for new transaction: ", err);
    return { success: false, msg: err.message };
  }
};

export const fetchWeeklyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(transactionsQuery);
    const weeklyData = getLast7Days();
    const transactions: TransactionType[] = [];

    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp)
        .toDate()
        .toISOString()
        .split("T")[0];

      const dayData = weeklyData.find((day) => day.date === transactionDate);

      if (dayData) {
        if (transaction.type === "income") {
          dayData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          dayData.expense += transaction.amount;
        }
      }
    });

    const stats = weeklyData.flatMap((day) => [
      {
        value: day.income,
        label: day.day,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary,
      },
      { value: day.expense, frontColor: colors.rose },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions,
      },
    };
  } catch (err: any) {
    console.log("error fetching weekly stats: ", err);
    return { success: false, msg: err.message };
  }
};




export const fetchMonthlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();

    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);
    twelveMonthsAgo.setDate(1); // Normalize to the 1st of the month to avoid date overflows

    // Define query to fetch transactions in the last 12 months
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("date", ">=", Timestamp.fromDate(twelveMonthsAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(transactionsQuery);
    const monthlyData = getLast12Months();
    const transactions: TransactionType[] = [];

    // Process transactions to calculate income and expense for each month
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id; // Include document ID in transaction data
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp).toDate();
      const monthName = transactionDate.toLocaleString("default", { month: "short" });
      const shortYear = transactionDate.getFullYear().toString().slice(-2);
      const monthData = monthlyData.find(
        (month) => month.month === `${monthName} ${shortYear}`
      );

      if (monthData) {
        if (transaction.type === "income") {
          monthData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          monthData.expense += transaction.amount;
        }
      }
    });

    // Reformat monthlyData for the bar chart with income and expense entries
    const stats = monthlyData.flatMap((month) => [
      {
        value: month.income,
        label: month.month,
        spacing: scale(4),
        labelWidth: scale(46),
        frontColor: colors.primary, // Income bar color
      },
      {
        value: month.expense,
        frontColor: colors.rose, // Expense bar color
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (error) {
    console.error("Error fetching monthly transactions:", error);
    return {
      success: false,
      msg: "Failed to fetch monthly transactions",
    };
  }
};


export const fetchYearlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
   

    // Define query to fetch transactions in the last 12 months
    const transactionsQuery = query(
      collection(db, "transactions"),
    
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(transactionsQuery);
    
    const transactions: TransactionType[] = [];

    const firstTransaction = querySnapshot.docs.reduce((earliest, doc) => {
        const transactionDate = doc.data().date.toDate();
        return transactionDate < earliest ? transactionDate : earliest;

    },new Date());

    const firstYea = firstTransaction.getFullYear();
    const currentYear = new Date().getFullYear();  
    const yearlyData= getYearsRange(firstYea, currentYear);
    
    
    // Process transactions to calculate income and expense for each month
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id; // Include document ID in transaction data
      transactions.push(transaction);

      const transactionYear = (transaction.date as Timestamp).toDate().getFullYear();
       
      const yearData = yearlyData.find(
        (item:any) => item.year === transactionYear.toString()
      );

      if (yearData) {
        if (transaction.type === "income") {
          yearData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          yearData.expense += transaction.amount;
        }
      }
    });

    // Reformat monthlyData for the bar chart with income and expense entries
    const stats = yearlyData.flatMap((year:any) => [
      {
        value: year.income,
        label: year.year,
        spacing: scale(4),
        labelWidth: scale(35),
        frontColor: colors.primary, // Income bar color
      },
      {
        value: year.expense,
        frontColor: colors.rose, // Expense bar color
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (error) {
    console.error("Error fetching yearly transactions:", error);
    return {
      success: false,
      msg: "Failed to fetch yearly transactions",
    };
  }
};