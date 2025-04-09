import { StyleSheet, Text, View, ScrollView, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { scale, verticalScale } from "@/utils/styling";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { BarChart } from "react-native-gifted-charts";
import Loading from "@/components/Loading";
import { useAuth } from "@/contexts/authContext";
import TransactionList from "@/components/TransactionList";
import {
  fetchMonthlyStats,
  fetchWeeklyStats,
  fetchYearlyStats,
} from "@/services/transactionService";
import Header from "@/components/Header";
import AnalysisCard from "@/components/AnalysisCard";
const Statistics = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const holidays = [
    { name: "New Year's Day", date: "2025-01-01" },
    { name: "Lohri", date: "2025-01-13" },
    { name: "Makar Sankranti / Pongal", date: "2025-01-14" },
    { name: "Republic Day", date: "2025-01-26" },
    { name: "Vasant Panchami", date: "2025-02-02" },
    { name: "Maha Shivaratri", date: "2025-02-26" },
    { name: "Holi", date: "2025-03-14" },
    { name: "Chaitra Navratri (Start)", date: "2025-03-30" },
    { name: "Ram Navami", date: "2025-04-06" },
    { name: "Good Friday", date: "2025-04-18" },
    { name: "Mahavir Jayanti", date: "2025-04-10" },
    { name: "Ambedkar Jayanti", date: "2025-04-14" },
    { name: "Baisakhi", date: "2025-04-13" },
    { name: "Eid al-Fitr (Ramzan Eid)", date: "2025-03-30" },
    { name: "Buddha Purnima", date: "2025-05-12" },
    { name: "Bakrid (Eid al-Adha)", date: "2025-06-06" },
    { name: "Rath Yatra", date: "2025-06-28" },
    { name: "Muharram", date: "2025-07-06" },
    { name: "Nag Panchami", date: "2025-08-04" },
    { name: "Raksha Bandhan", date: "2025-08-09" },
    { name: "Independence Day", date: "2025-08-15" },
    { name: "Janmashtami", date: "2025-08-16" },
    { name: "Ganesh Chaturthi (Start)", date: "2025-08-28" },
    { name: "Ganesh Visarjan (End)", date: "2025-09-06" },
    { name: "Onam (Thiruvonam)", date: "2025-09-05" },
    { name: "Pitru Paksha (Start)", date: "2025-09-09" },
    { name: "Pitru Paksha (End)", date: "2025-09-24" },
    { name: "Navratri (Start)", date: "2025-09-25" },
    { name: "Dussehra / Vijayadashami", date: "2025-10-02" },
    { name: "Durga Puja (Start)", date: "2025-09-30" },
    { name: "Durga Puja (Dashami)", date: "2025-10-02" },
    { name: "Gandhi Jayanti", date: "2025-10-02" },
    { name: "Karva Chauth", date: "2025-10-15" },
    { name: "Dhanteras", date: "2025-10-18" },
    { name: "Diwali", date: "2025-10-20" },
    { name: "Govardhan Puja", date: "2025-10-21" },
    { name: "Bhai Dooj", date: "2025-10-22" },
    { name: "Chhath Puja (Start)", date: "2025-10-31" },
    { name: "Chhath Puja (Main Day)", date: "2025-11-02" },
    { name: "Guru Nanak Jayanti", date: "2025-11-05" },
    { name: "Christmas", date: "2025-12-25" }
  ];
  
  
  useEffect(() => {
    if (activeIndex == 0) {
      getWeeklyStats();
    }
    if (activeIndex == 1) {
      getMonthlyStats();
    }
    if (activeIndex == 2) {
      getYearlyStats();
    }
  }, [activeIndex]);

  const getWeeklyStats = async () => {
    setChartLoading(true);
    let res = await fetchWeeklyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const getMonthlyStats = async () => {
    setChartLoading(true);
    let res = await fetchMonthlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const getYearlyStats = async () => {
    setChartLoading(true);
    let res = await fetchYearlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Header title={"Statistics"} />
        </View>

        <ScrollView
          contentContainerStyle={{
            gap: spacingY._20,
            paddingTop: spacingY._5,
            // display: "flex",
            // flexDirection: "column",
            // justifyContent: "center",
            // alignItems: "center",
            // rowGap: spacingY._20,
            // columnGap: spacingY._20,
            paddingBottom: verticalScale(100),
          }}
          showsVerticalScrollIndicator={false}
        >
          <SegmentedControl
            values={["Weekly", "Monthly", "Yearly"]}
            selectedIndex={activeIndex}
            onChange={(event) => {
              setActiveIndex(event.nativeEvent.selectedSegmentIndex);
            }}
            tintColor={colors.neutral200}
            backgroundColor={colors.neutral800}
            appearance="dark"
            activeFontStyle={styles.segmentFontStyle}
            style={styles.segmentStyle}
            fontStyle={{ ...styles.segmentFontStyle, color: colors.white }}
          />

          <View
            style={styles.chartContainer}
          >
            {chartData.length > 0 ? (
              <BarChart
                data={chartData}
                barWidth={scale(12)}
                spacing={[1, 2].includes(activeIndex) ? scale(25) : scale(16)}
                roundedTop
                roundedBottom
                hideRules
                yAxisLabelPrefix="$"
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisLabelWidth={
                  [1, 2].includes(activeIndex) ? scale(38) : scale(35)
                }
                yAxisTextStyle={{ color: colors.neutral350 }}
                xAxisLabelTextStyle={{
                  color: colors.neutral350,
                  fontSize: verticalScale(12),
                }}
                noOfSections={3}
                minHeight={5}
              />
            ) : (
              <View style={styles.noChart} />
            )}

            {chartLoading && (
              <View style={styles.chartLoadingContainer}>
                <Loading color={colors.white} />
              </View>
            )}
            {/* </View> */}
          </View>
          <AnalysisCard transactions={transactions} holidays={holidays}/>
          <View>
            <TransactionList
              title="Transactions"
              emptyListMessage="No transactions found"
              data={transactions}
            />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    // margin
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: verticalScale(10),
    marginTop: verticalScale(10), // Add margin to avoid overlap
  },
  chartLoadingContainer: {
    position: "absolute",
    // top:"-20%",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
    backgroundColor: "rgba(0,0,0, 0.6)",
  },
  header: {},
  noChart: {
    backgroundColor: "rgba(0,0,0, 0.6)",
    height: verticalScale(210),
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    height: verticalScale(35),
    width: verticalScale(35),
    borderCurve: "continuous",
  },
  segmentStyle: {
    height: scale(37),
    // zIndex: 10,
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "bold",
    color: colors.black,
  },
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10,
  },
});
