import { ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import theme from "./theme";
import GlobalStyles from "./styles/GlobalStyles";
import Router from "./router/Router";

const App = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <Router />
    <ToastContainer
      position="top-center"
      autoClose={3000}
      newestOnTop={false}
      closeOnClick
      pauseOnHover
      toastStyle={{ fontSize: "15px", fontFamily: "inherit" }}
    />
  </ThemeProvider>
);

export default App;
