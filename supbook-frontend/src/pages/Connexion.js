import { useState, useEffect } from "react";
import { connecter } from "../services/api";


function Connexion({ allerVers }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
   const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

 
  useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function handleConnexion(e) {
  e.preventDefault();
    setChargement(true);
    setErreur("");
    try {

     
     
      const data = await connecter(email, motDePasse);
       
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
         
        localStorage.setItem("userId", data.user.id);
        allerVers("bibliotheque");
     
      } else {
        setErreur("Email ou mot de passe incorrect");
      }
    } catch (err) {
      setErreur("Erreur de connexion, réessaye plus tard");
    }
    setChargement(false);

  }

   
  return (
      
        <div style={{ minHeight: "100vh", background: "#f9f6f2", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "16px" : "0" }}>
      <div style={{ background: "white", padding: isMobile ? "28px 20px" : "48px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", width: "100%", maxWidth: "420px" }}>
        
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: "800", color: "#1a1a2e", marginBottom: "8px", textAlign: "center" }}>SupBook</h1>
        <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", marginBottom: "32px" }}>Connectez-vous à votre bibliothèque</p>

        {erreur && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
            {erreur}
          </div>
        )}

          
          <form onSubmit={handleConnexion}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" }}
            />
        
        
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" }}
            />
        
        
          </div>
          <button
            type="submit"
              disabled={chargement}
            style={{ width: "100%", background: "#1a1a2e", color: "white", padding: "12px", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer", border: "none" }}
          >
            {chargement ? "Connexion..." : "Se connecter"}
          </button>
        </form>

      
      
        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#6b7280" }}>
          Pas encore de compte ?{" "}
          <span
            onClick={() => allerVers("inscription")}
            style={{ color: "#1a1a2e", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
          >
            S'inscrire
          </span>
        </p>
       </div>
    </div>
  );
}

export default Connexion;