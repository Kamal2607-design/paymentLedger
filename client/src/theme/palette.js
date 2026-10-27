const white = "#FFFFFF";

const purple = {
  5: "#EFE0FE",
  10: "#F8F0FF",
  15: "#8E33FF",
  25: "#E2C7FC",
  50: "#BC7CF9",
  100: "#9631F5",
  300: "#460683",
  400: "#6E0ACE",
};
const green = {
  5: "#E8FFF3",
  100: "#D1FAE5",
  200: "#118D57",
  600: "#059669",
};
const red = {
  25: "#FFE0E0",
  50: "#FEE2E2",
  100: "#FF3030",
  600: "#DC2626",
};
const blueGrey = {
  25: "#F9FAFB",
  50: "#AFBACA",
  75: "#D7DFE9",
  100: "#64748B",
  200: "#455468",
  300: "#14181D",
};
const yellow = {
  100: "#FEF3C7",
  200: "#F59E0B",
  600: "#D97706",
};

export default {
  primaryTextColor: "#0F172A",
  lightGrey: "#f0f3f9",
  searchBarBorder: "#CBD5E1",
  historyBorder: "#E9EFF6",
  white,
  primary: {
    contrastText: white,
    dark: purple[300],
    medium: purple[400],
    main: purple[100],
    shadow: purple[50],
    light: purple[25],
    lightest: purple[15],
    lightPurple: purple[10],
    border: purple[5],
  },
  error: {
    contrastText: white,
    dark: red[600],
    main: red[100],
    medium: red[50],
    light: red[25],
  },
  success: {
    contrastText: white,
    main: green[200],
    light: green[100],
    dark: green[600],
  },
  green: {
    lightest: green[5],
    light: green[100],
    medium: green[200],
    dark: green[600],
  },
  yellow: {
    light: yellow[100],
    medium: yellow[200],
    dark: yellow[600],
  },
  text: {
    primary: blueGrey[300],
    secondary: blueGrey[200],
    medium: blueGrey[100],
    border: blueGrey[75],
    light: blueGrey[50],
    lightest: blueGrey[25],
  },
  background: {
    default: "#F1F5F9",
    paper: white,
  },
};
