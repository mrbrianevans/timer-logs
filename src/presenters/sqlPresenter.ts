import type { SqlColourPalette } from "../../types/dataStructures/SqlColourPalette";
import {
  altSqlColourPalette,
  defaultSqlColourPalette,
} from "./colours/SqlColourPalettes.js";
import { wrap } from "./colours/ColourConverters.js";

/**
 * Get a formatted string version of a value of any type.
 * @param value a value to get the string representation of.
 */
export function valueToString(value: any, lengthLimit?: number): string {
  if (typeof value === "number") return value.toString();
  else if (typeof value === "undefined") return "null";
  else if (typeof value === "string") return `'${value.slice(0, lengthLimit)}'`;
  else if (value instanceof Date) return `'${value.toUTCString()}'`;
  else if (value instanceof Array) return "'{" + value.join(",") + "}'";
  else if (typeof value === "object") return "'" + JSON.stringify(value) + "'";
  else return value?.toString();
}
// this should be inside the valueToString method above, and differ depending on the value type
export function limitLength(str: string, len: number): string {
  if (str.length < len) return str;
  const cappedString = str.slice(0, len);
  return `${cappedString}...${str.length - len} more characters.`;
}
/**
 * Substitute values into a parameterised SQL query containing $1 $2 placeholders for values.
 * @param query the parameterised query containing dollar sign placeholders.
 * @param values the array of values to substitute into the query to replace the placeholders.
 */
function subParameterisedQuery(query: string, values: any[]): string {
  return query.replace(/\$[0-9]+/gm, (dollarN) => {
    const value = values[Number(dollarN.slice(1)) - 1];
    return valueToString(value);
  });
}

/**
 * Get a regular expression to match any value in an array any surrounding space.
 * Requires at least 1 space on either side.
 * @param arr array of strings to match
 */
const isIn = (arr: string[]) =>
  new RegExp("(\\s+|^)((" + arr.join(")|(") + "))\\s+", "ig");
/**
 * Format a SQL query by changing the spacing and capitalising keywords.
 * @param query string sql query to format
 */
function formatSql(query: string): string {
  const newlineKeywords = ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE"];
  const indentKeywords = [
    "FULL OUTER JOIN",
    "LEFT OUTER JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "RIGHT OUTER JOIN",
    "INNER JOIN",
    "NATURAL JOIN",
    "JOIN",
    "AND",
    "OR",
  ];
  const doubleIndentKeywords = ["ON"];

  const oneSpaceSymbol = new RegExp(/\s*[<=>]+\s*/, "g");
  const formattedQuery = query
    .replace(
      isIn(newlineKeywords),
      (keyword) => "\n" + keyword.trim().toUpperCase() + " "
    )
    .replace(oneSpaceSymbol, (keyword) => " " + keyword.trim() + " ")
    .replace(
      isIn(indentKeywords),
      (keyword) => "\n  " + keyword.trim().toUpperCase() + " "
    )
    .replace(
      isIn(doubleIndentKeywords),
      (keyword) => "\n    " + keyword.trim().toUpperCase() + " "
    )
    .trim();
  return formattedQuery;
}

/**
 * Syntax highlighting for a SQL query to be printed to console.
 * @param query
 * @param palette
 */
function highlightSql(query: string, palette?: SqlColourPalette): string {
  const cPalette = palette ?? defaultSqlColourPalette;
  const sqlKeywords = [
    "SELECT",
    "AS",
    "FROM",
    "WHERE",
    "OR",
    "AND",
    "JOIN",
    "RIGHT",
    "OUTER",
    "INNER",
    "FULL",
    "NATURAL",
    "LEFT",
    "ON",
    "LIKE",
    "ILIKE",
    "IN",
    "ANY",
    "INSERT",
    "INTO",
    "UPDATE",
    "SET",
    "DO",
    "CONFLICT",
    "EXCLUDED",
  ];
  const isString = new RegExp(/('.*?')|(".*?")|(`.*?`)/, "g");
  const isNumber = new RegExp(/[0-9]+/, "g");
  const isPunctuation = new RegExp(/[,<=\-~>*]|(;$)/, "g");
  const highlightedQuery = query
    .replace(isNumber, (num) => wrap(num, cPalette.numbers))
    .replace(isIn(sqlKeywords), (keyword) =>
      wrap(keyword.toUpperCase(), cPalette.keywords)
    )
    .replace(isString, (str) => wrap(str, cPalette.strings))
    .replace(isPunctuation, (punc) =>
      wrap(punc, cPalette?.punctuation ?? cPalette.keywords)
    );
  return highlightedQuery;
}

/**
 * Substitutes values, formats spacing and colourises a SQL query to be printed to console.
 * @param query a SQL query with or without placeholder values
 * @param values if the SQL query has placeholder values, then an array of the values to substitute.
 */
export function PresentSql(query: string, values?: any[]): string {
  let sql = query;
  if (values) sql = subParameterisedQuery(query, values);
  sql = formatSql(sql);
  sql = highlightSql(sql, altSqlColourPalette);
  return sql;
}
