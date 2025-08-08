import { Link } from "react-router-dom";
import PqrsList from "../pqrs/PqrsList";
import Navbar from "../components/Navbar/Navbar";
import { Version } from "../components/Footer/Version";

export const Pqr = () => {
  return (
    <div>
      <div>
        <Navbar />
        <PqrsList />
      </div>
    </div>
  );
};
