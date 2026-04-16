import { fontFamilies } from "./fontFamilies";

export default function getFontFamily(weight = "normal") {
  return fontFamilies.MONTSERRAT[weight] || fontFamilies.MONTSERRAT.normal;
}
