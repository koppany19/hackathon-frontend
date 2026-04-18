import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { FlatList } from "react-native";
import { DAY_NAMES, PAGE_WIDTH } from "../constants";
import DayTimeline from "./DayTimeline";

const DayPager = forwardRef(function DayPager(
  { dates, initialIndex, onIndexChange, scheduleItems },
  ref,
) {
  const listRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToIndex(index) {
      listRef.current?.scrollToIndex({ index, animated: true });
    },
  }));

  const getItemLayout = useCallback(
    (_, index) => ({
      length: PAGE_WIDTH,
      offset: PAGE_WIDTH * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item: date }) => {
      const dayName = DAY_NAMES[date.getDay()];
      const items = scheduleItems.filter((e) => e.day_of_week === dayName);
      return <DayTimeline scheduleItems={items} />;
    },
    [scheduleItems],
  );

  const onMomentumScrollEnd = useCallback(
    (e) => {
      const index = Math.round(
        e.nativeEvent.contentOffset.x / PAGE_WIDTH,
      );
      onIndexChange(index);
    },
    [onIndexChange],
  );

  return (
    <FlatList
      ref={listRef}
      data={dates}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={renderItem}
      keyExtractor={(_, i) => String(i)}
      getItemLayout={getItemLayout}
      initialScrollIndex={initialIndex}
      onMomentumScrollEnd={onMomentumScrollEnd}
      initialNumToRender={3}
      windowSize={5}
      removeClippedSubviews
    />
  );
});

export default DayPager;
