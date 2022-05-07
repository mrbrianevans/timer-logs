import type { SqlColourPalette } from "../../../types/dataStructures/SqlColourPalette";
import { colourTable, rgb } from "./ColourConverters.js";

export const defaultSqlColourPalette: SqlColourPalette = {
  keywords: colourTable.orange,
  numbers: colourTable.blue,
  strings: colourTable.green,
  punctuation: colourTable.yellow,
};
export const altSqlColourPalette: SqlColourPalette = {
  keywords: rgb(250, 130, 49),
  numbers: rgb(15, 185, 177),
  strings: rgb(32, 191, 107),
  punctuation: rgb(119, 140, 163),
};
