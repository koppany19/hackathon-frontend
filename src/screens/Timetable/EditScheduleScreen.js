import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import { useAuth } from "../../context/AuthContext";
import { createSchedule, updateSchedule } from "../../api/endpoints/schedules";
import ScheduleFormSheet from "./components/ScheduleFormSheet";

const ORDERED_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_FULL = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export default function EditScheduleScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, updateScheduleItems } = useAuth();

  const [items, setItems] = useState(user?.scheduleItems ?? []);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [defaultDay, setDefaultDay] = useState("monday");

  const grouped = useMemo(() => {
    return ORDERED_DAYS.map((day) => ({
      day,
      items: [...items]
        .filter((i) => i.day_of_week === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    })).filter((g) => g.items.length > 0 || true);
  }, [items]);

  const openAdd = (day = "monday") => {
    setEditingItem(null);
    setDefaultDay(day);
    setSheetVisible(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setDefaultDay(item.day_of_week);
    setSheetVisible(true);
  };

  const handleSave = async ({
    id,
    day_of_week,
    subject_name,
    start_time,
    end_time,
  }) => {
    try {
      if (id) {
        const updated = await updateSchedule(id, {
          day_of_week,
          subject_name,
          start_time,
          end_time,
        });
        const next = items.map((i) => (i.id === id ? updated : i));
        setItems(next);
        updateScheduleItems(next);
        Toast.show({ type: "Success", text1: "Class updated" });
      } else {
        const created = await createSchedule({
          day_of_week,
          subject_name,
          start_time,
          end_time,
        });
        const next = [...items, created];
        setItems(next);
        updateScheduleItems(next);
        Toast.show({ type: "Success", text1: "Class added" });
      }
      setSheetVisible(false);
    } catch (e) {
      Toast.show({
        type: "Error",
        text1: "Something went wrong",
        text2: e.message,
      });
      throw e;
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        style={styles.topGlow}
        colors={[
          "rgba(170, 204, 0, 0.30)",
          "rgba(86, 121, 20, 0.12)",
          "rgba(0, 0, 0, 0)",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={16}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.screenTitle}>Edit Schedule</Text>
        <Pressable
          onPress={() => openAdd()}
          hitSlop={12}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ORDERED_DAYS.map((day) => {
          const dayItems = grouped.find((g) => g.day === day)?.items ?? [];
          return (
            <View key={day} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionDot} />
                  <Text style={styles.sectionTitle}>{DAY_FULL[day]}</Text>
                  {dayItems.length > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{dayItems.length}</Text>
                    </View>
                  )}
                </View>
                <Pressable
                  onPress={() => openAdd(day)}
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.sectionAdd,
                    pressed && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.sectionAddText}>+ Add</Text>
                </Pressable>
              </View>

              {dayItems.length === 0 ? (
                <Pressable
                  onPress={() => openAdd(day)}
                  style={({ pressed }) => [
                    styles.emptySlot,
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Text style={styles.emptySlotText}>
                    No classes — tap to add
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.itemsList}>
                  {dayItems.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => openEdit(item)}
                      style={({ pressed }) => [
                        styles.itemCard,
                        pressed && styles.itemCardPressed,
                      ]}
                    >
                      <View style={styles.itemAccent} />
                      <View style={styles.itemBody}>
                        <Text style={styles.itemSubject} numberOfLines={1}>
                          {item.subject_name}
                        </Text>
                        <Text style={styles.itemTime}>
                          {item.start_time.slice(0, 5)} –{" "}
                          {item.end_time.slice(0, 5)}
                        </Text>
                      </View>
                      <View style={styles.editChip}>
                        <Text style={styles.editChipText}>Edit</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: verticalScale(32) }} />
      </ScrollView>

      <ScheduleFormSheet
        visible={sheetVisible}
        item={editingItem}
        defaultDay={defaultDay}
        existingItems={items}
        onSave={handleSave}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050706",
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(230),
    zIndex: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(14),
  },
  backBtn: {
    width: horizontalScale(36),
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(26),
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: horizontalScale(30),
  },
  screenTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(17),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.2,
  },
  addBtn: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: horizontalScale(20),
    backgroundColor: "rgba(170,204,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(170,204,0,0.3)",
  },
  addBtnText: {
    color: theme.colors.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.semiBold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(4),
    gap: verticalScale(6),
  },
  section: {
    gap: verticalScale(6),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(6),
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },
  sectionDot: {
    width: horizontalScale(6),
    height: horizontalScale(6),
    borderRadius: 99,
    backgroundColor: theme.colors.secondary,
    opacity: 0.7,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(14),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.1,
  },
  countBadge: {
    backgroundColor: "rgba(170,204,0,0.12)",
    borderRadius: 99,
    paddingHorizontal: horizontalScale(7),
    paddingVertical: verticalScale(1),
  },
  countText: {
    color: theme.colors.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.semiBold,
  },
  sectionAdd: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
  },
  sectionAddText: {
    color: "rgba(255,255,255,0.25)",
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.medium,
  },
  emptySlot: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderStyle: "dashed",
    borderRadius: horizontalScale(12),
    paddingVertical: verticalScale(14),
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  emptySlotText: {
    color: "rgba(255,255,255,0.18)",
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.normal,
  },
  itemsList: {
    gap: verticalScale(6),
    marginBottom: verticalScale(4),
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: horizontalScale(12),
    overflow: "hidden",
  },
  itemCardPressed: {
    backgroundColor: "rgba(170,204,0,0.05)",
    borderColor: "rgba(170,204,0,0.18)",
  },
  itemAccent: {
    width: horizontalScale(3),
    alignSelf: "stretch",
    backgroundColor: theme.colors.secondary,
    opacity: 0.7,
  },
  itemBody: {
    flex: 1,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(12),
    gap: verticalScale(2),
  },
  itemSubject: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.semiBold,
  },
  itemTime: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.normal,
  },
  editChip: {
    marginRight: horizontalScale(12),
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(5),
    borderRadius: horizontalScale(8),
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  editChipText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.medium,
  },
});
