import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./routes/AppRouter";
import Navbar from "./components/Navbar/Navbar";
import AutoLogout from "./components/autoLogout/AutoLogout";
import 'animate.css';

function App() {
  return (
    <BrowserRouter>
    <AutoLogout/>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
