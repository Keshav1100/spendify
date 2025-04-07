import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Typo from "@/components/Typo";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacingY } from "@/constants/theme";
import { analyzeTransactionsAndHolidays } from "@/services/aiPredictionService";

interface PredictionDetails {
  expense: number;
  income: number;
}

interface Predictions {
  predictions: {
    daily: PredictionDetails;
    monthly: PredictionDetails;
    yearly: PredictionDetails;
  };
  advice: string[];
}

interface AnalysisCardProps {
  transactions: { type: string; amount: number; date: string }[];
  holidays: { name: string; date: string }[];
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ transactions, holidays }) => {
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const data = await analyzeTransactionsAndHolidays(transactions, holidays);
        setPredictions(data);
      } catch (error) {
        console.error("Error fetching predictions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [transactions, holidays]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!predictions) {
    return (
      <View style={styles.errorContainer}>
        <Typo size={16} fontWeight="500" color={colors.neutral200}>
          Unable to fetch predictions. Please try again later.
        </Typo>
      </View>
    );
  }

  return (
    <LinearGradient colors={[colors.green, colors.neutral800]} style={styles.container}>
      <Typo size={20} fontWeight="bold" color={colors.white}>
        AI Analysis & Prediction
      </Typo>

      {/* Predictions Section */}
      <View style={styles.section}>
        <Typo size={18} fontWeight="bold" color={colors.white}>
          Predictions
        </Typo>
        {["daily", "monthly", "yearly"].map((key) => {
          const prediction = predictions.predictions[key as keyof Predictions["predictions"]];
          return (
            <View key={key} style={styles.predictionItem}>
              <Typo size={16} fontWeight="500" color={colors.neutral200}>
                {key.charAt(0).toUpperCase() + key.slice(1)} Predictions:
              </Typo>
              <Typo size={14} color={colors.white}>
                Expense: ₹{prediction.expense}
              </Typo>
              <Typo size={14} color={colors.white}>
                Income: ₹{prediction.income}
              </Typo>
            </View>
          );
        })}
      </View>

      {/* Advice Section */}
      <View style={styles.section}>
        <Typo size={18} fontWeight="bold" color={colors.white}>
          Advice
        </Typo>
        {predictions.advice.length > 0 ? (
          predictions.advice.map((advice, index) => (
            <Typo key={index} size={14} color={colors.neutral300} style={styles.adviceItem}>
              {index + 1}. {advice}
            </Typo>
          ))
        ) : (
          <Typo size={14} color={colors.neutral300}>
            No advice available at the moment.
          </Typo>
        )}
      </View>
    </LinearGradient>
  );
};

export default AnalysisCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: spacingY._15,
    marginVertical: spacingY._10,
  },
  section: {
    marginTop: spacingY._10,
  },
  predictionItem: {
    marginTop: spacingY._10,
  },
  adviceItem: {
    marginTop: spacingY._5,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 150,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 150,
  },
});