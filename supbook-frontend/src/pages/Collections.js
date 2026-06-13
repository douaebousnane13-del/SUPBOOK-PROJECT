import { useState, useEffect } from "react";
import { getCollections, ajouterCollection, supprimerCollection } from "../services/api";

const SERIF = "'Playfair Display', serif";

const COULEURS = ["#dbeafe", "#dcfce7", "#fef9c3", "#fce7f3", "#ede9fe", "#ffedd5"];
const COULEURS_TEXTE = ["#1d4ed8", "#15803d", "#a16207", "#be185d", "#7c3aed", "#c2410c"];

function Collections({ allerVers }) {
  const [collections, setCollections] = useState([]);
  const [nom, setNom] = useState("");
   const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [succes, setSucces] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  function afficherSucces(msg) {
    setSucces(msg);
    setTimeout(() => setSucces(""), 3000);
  }

  function afficherErreur(msg) {
    setErreur(msg);
    setTimeout(() => setErreur(""), 3000);
  }

  useEffect(() => {
    chargerCollections();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  async function chargerCollections() {
     setChargement(true);
const data = await getCollections();
   if (data.data) setCollections(data.data);
     setChargement(false);
}
 
async function handleAjouterCollection(e) {
    e.preventDefault();
    if (!nom.trim()) {
      afficherErreur("Donne un nom à la collection");
      return;
    }
    const data = await ajouterCollection(nom);
    if (data.data) {
      afficherSucces("Collection créée !");
       setNom("");
      setAfficherFormulaire(false);
       chargerCollections();
    } else {
      afficherErreur("Erreur lors de la création");
    }
  }

  async function handleSupprimerCollection(documentId) {
  if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette collection ?")) return;
  const data = await supprimerCollection(documentId);
  if (data.erreur) {
      afficherErreur("Impossible de supprimer la collection");
  } else {
    afficherSucces("Collection supprimée !");
    chargerCollections();
  }
}

  const btnStyle = (primary) => ({
    fontFamily: SERIF,
    fontWeight: "700",
    fontSize: "14px",
      borderRadius: "6px",
    cursor: "pointer",
    padding: "7px 16px",
    border: primary ? "none" : "1px solid #d1d5db",
    background: primary ? "#1a1a2e" : "transparent",
    color: primary ? "white" : "#374151",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f9f6f2" }}>
      {succes && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 2000, background: "white", border: "1px solid #e5e7eb", borderLeft: "4px solid #1a1a2e", color: "#1a1a2e", padding: "14px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", fontFamily: SERIF, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", minWidth: "220px" }}>
          {succes}
        </div>
      )}
      {erreur && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 2000, background: "white", border: "1px solid #e5e7eb", borderLeft: "4px solid #991b1b", color: "#991b1b", padding: "14px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", fontFamily: SERIF, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", minWidth: "220px" }}>
          {erreur}
        </div>
      )}

      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ padding: isMobile ? "12px 16px" : "0 40px", height: isMobile ? "auto" : "60px", display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "space-between", paddingTop: isMobile ? "12px" : "0", paddingBottom: isMobile ? "12px" : "0" }}>
          <span style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e", fontFamily: SERIF }}>SupBook</span>
          {!isMobile && (
            <button onClick={() => allerVers("bibliotheque")} style={btnStyle(false)}>Retour à la bibliothèque</button>
          )}
        </div>
        {isMobile && (
          <div style={{ background: "#1a1a2e", display: "flex", justifyContent: "center", padding: "10px 16px" }}>
            <button onClick={() => allerVers("bibliotheque")} style={{ ...btnStyle(false), color: "white", border: "none", background: "transparent" }}>← Retour à la bibliothèque</button>
          </div>
        )}
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: isMobile ? "20px 16px" : "32px 24px" }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", gap: "12px", textAlign: isMobile ? "center" : "left" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a2e", fontFamily: SERIF, marginBottom: "6px" }}>Collections</h2>
            <p style={{ fontFamily: SERIF, fontSize: "13px", color: "#9ca3af" }}>{collections.length} collection{collections.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => setAfficherFormulaire(!afficherFormulaire)} style={{ ...btnStyle(true), padding: "10px 22px", width: isMobile ? "100%" : "auto" }}>
            {afficherFormulaire ? "Annuler" : "+ Créer une collection"}
          </button>
        </div>

        {afficherFormulaire && (
          <div style={{ background: "white", padding: "28px", marginBottom: "28px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginBottom: "20px", fontSize: "20px", color: "#1a1a2e", fontFamily: SERIF }}>Nouvelle collection</h3>
            <form onSubmit={handleAjouterCollection}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "6px", fontFamily: SERIF }}>Nom *</label>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: SERIF, boxSizing: "border-box" }} />
              </div>
              <button type="submit" style={{ ...btnStyle(true), marginTop: "20px", padding: "11px 28px" }}>
                Créer
              </button>
            </form>
          </div>
        )}


        {chargement && (
  <div style={{ textAlign: "center", padding: "80px", color: "#9ca3af", fontSize: "15px", fontFamily: SERIF }}>
    Chargement...
  </div>
)}

        {collections.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <p style={{ color: "#6b7280", fontSize: "15px", fontFamily: SERIF }}>Aucune collection pour l'instant</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
          {collections.map((collection, index) => {
            const couleur = COULEURS[index % COULEURS.length];
            const couleurTexte = COULEURS_TEXTE[index % COULEURS_TEXTE.length];
            return (
              <div
                key={collection.id}
                style={{ background: "white", borderRadius: "10px", padding: "20px", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "box-shadow 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: couleur, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: couleurTexte, fontSize: "16px", fontWeight: "700", fontFamily: SERIF }}>
                      {collection.nom[0].toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a2e", fontFamily: SERIF }}>{collection.nom}</p>
                </div>
                <button
                  onClick={() => handleSupprimerCollection(collection.documentId)}
                  style={{ background: "white", color: "#9ca3af", border: "1px solid #e5e7eb", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontFamily: SERIF, cursor: "pointer" }}
                >
                  Supprimer
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Collections;