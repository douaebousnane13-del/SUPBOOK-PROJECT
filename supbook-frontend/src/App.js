import { useState } from "react";
import Inscription from "./pages/Inscription";
import Connexion from "./pages/Connexion";
import Bibliotheque from "./pages/Bibliotheque";
import Auteurs from "./pages/Auteurs";
import Collections from "./pages/Collections";




function App() {
        const [page, setPage] = useState(
       localStorage.getItem("token") ? "bibliotheque" : "connexion"
  );

 
 
  function allerVers(nouvellePage) {
    if (nouvellePage === "connexion") {
      localStorage.removeItem("token");
       localStorage.removeItem("userId");
    }
  setPage(nouvellePage);
  }

 
  if (page === "inscription") {
    return <Inscription allerVers={allerVers} />;
  }

    if (page === "auteurs" && localStorage.getItem("token")) {
return <Auteurs allerVers={allerVers} />;
  }

  if (page === "collections" && localStorage.getItem("token")) {
       return <Collections allerVers={allerVers} />;
  }

  if (page === "bibliotheque" && localStorage.getItem("token")) {
return <Bibliotheque allerVers={allerVers} />;
  }

  
  return <Connexion allerVers={allerVers} />;
}

export default App;