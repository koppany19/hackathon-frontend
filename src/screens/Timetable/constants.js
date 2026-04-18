import { Dimensions } from "react-native";
import { horizontalScale, verticalScale } from "../../theme/sizing";

export const HOUR_START = 7;
export const HOUR_END = 22;
export const TOTAL_HOURS = HOUR_END - HOUR_START;
export const HOUR_HEIGHT = verticalScale(64);
export const TIME_COL_WIDTH = horizontalScale(58);
export const EVENT_LEFT = TIME_COL_WIDTH + horizontalScale(8);
export const EVENT_RIGHT = horizontalScale(16);
export const PAGE_WIDTH = Dimensions.get("window").width;

export const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const DAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
