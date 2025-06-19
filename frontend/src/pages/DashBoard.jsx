import { Link } from "react-router-dom";
import PqrsList from "../pqrs/PqrsList";
import Navbar from "../components/Navbar/Navbar";

export const DashBoard = () => {
  return (
    <div>
      <div>
        <Navbar />
        <PqrsList />
      </div>
    </div>
  );
};
