import { ColourConverter } from "../../../types/interfaces/ColourConverter";

export const red: ColourConverter = (message) => {
  return wrap(message, colourTable["red"]);
};
export const pink: ColourConverter = (message) => {
  return wrap(message, colourTable["pink"]);
};
export const orange: ColourConverter = (message) => {
  return wrap(message, colourTable["orange"]);
};
export const purple: ColourConverter = (message) => {
  return wrap(message, colourTable["purple"]);
};
export const blue: ColourConverter = (message) => {
  return wrap(message, colourTable["blue"]);
};
export const green: ColourConverter = (message) => {
  return wrap(message, colourTable["green"]);
};
export const yellow: ColourConverter = (message) => {
  return wrap(message, colourTable["yellow"]);
};
export const lightBlue: ColourConverter = (message) => {
  return wrap(message, colourTable["lightBlue"]);
};

export function wrap(message: string, colour: string) {
  return `${colour}${message}\x1b[0m`;
}

export function rgb(r: number, g: number, b: number) {
  return `\x1b[38;2;${r};${g};${b}m`;
}

export const colourTable = {
  red: rgb(235, 77, 75),
  pink: rgb(255, 121, 121),
  orange: rgb(255, 190, 118),
  purple: rgb(190, 46, 221),
  blue: rgb(104, 109, 224),
  green: rgb(106, 176, 76),
  yellow: rgb(249, 202, 36),
  lightBlue: rgb(126, 214, 223),
};
