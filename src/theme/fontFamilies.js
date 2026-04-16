import { Platform } from "react-native";

const isIOS = Platform.OS === "ios";

const montserrat = {
  thin: isIOS ? "Montserrat-Thin" : "MontserratThin",
  extraLight: isIOS ? "Montserrat-ExtraLight" : "MontserratExtraLight",
  light: isIOS ? "Montserrat-Light" : "MontserratLight",
  normal: isIOS ? "Montserrat-Regular" : "MontserratRegular",
  medium: isIOS ? "Montserrat-Medium" : "MontserratMedium",
  semiBold: isIOS ? "Montserrat-SemiBold" : "MontserratSemiBold",
  bold: isIOS ? "Montserrat-Bold" : "MontserratBold",
  extra: isIOS ? "Montserrat-ExtraBold" : "MontserratExtraBold",
  black: isIOS ? "Montserrat-Black" : "MontserratBlack",
  italicThin: isIOS ? "Montserrat-ThinItalic" : "MontserratThinItalic",
  italicExtraLight: isIOS
    ? "Montserrat-ExtraLightItalic"
    : "MontserratExtraLightItalic",
  italicLight: isIOS ? "Montserrat-LightItalic" : "MontserratLightItalic",
  italicNormal: isIOS ? "Montserrat-Italic" : "MontserratItalic",
  italicMedium: isIOS ? "Montserrat-MediumItalic" : "MontserratMediumItalic",
  italicSemiBold: isIOS
    ? "Montserrat-SemiBoldItalic"
    : "MontserratSemiBoldItalic",
  italicBold: isIOS ? "Montserrat-BoldItalic" : "MontserratBoldItalic",
  italicExtra: isIOS
    ? "Montserrat-ExtraBoldItalic"
    : "MontserratExtraBoldItalic",
  italicBlack: isIOS ? "Montserrat-BlackItalic" : "MontserratBlackItalic",
};

export const fontFamilies = {
  MONTSERRAT: montserrat,
};

export default montserrat;
