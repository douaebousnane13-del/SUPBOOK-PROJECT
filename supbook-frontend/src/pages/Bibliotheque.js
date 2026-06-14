import { useState, useEffect } from "react";
import { getLivres, ajouterLivre, supprimerLivre, getAuteurs, getCollections, retirerLivreCollection, modifierLivre } from "../services/api";

const SERIF = "'Playfair Display', serif";

function Bibliotheque({ allerVers }) {
   const [livres, setLivres] = useState([]);
   const [chargement, setChargement] = useState(true);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreAuteur, setFiltreAuteur] = useState("");
  const [filtreCollection, setFiltreCollection] = useState("");
  const [tri, setTri] = useState("default")
  const [succes, setSucces] = useState("");
  const [erreur, setErreur] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  
  const [titreEdit, setTitreEdit] = useState("");
    const [descriptionEdit, setDescriptionEdit] = useState("");
  const [couvertureEdit, setCouvertureEdit] = useState("");
  const [statutEdit, setStatutEdit] = useState("");
   const [noteEdit, setNoteEdit] = useState("");
  const [avisEdit, setAvisEdit] = useState("");
  const [auteurEditSelectionne, setAuteurEditSelectionne] = useState("");
    const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [couverture, setCouverture] = useState("");
  const [statut, setStatut] = useState("a_lire");
  const [note, setNote] = useState("");
  const [avis, setAvis] = useState("");
  const [auteurs, setAuteurs] = useState([]);
  const [collections, setCollections] = useState([]);
  const [auteurSelectionne, setAuteurSelectionne] = useState("");
  const [collectionsSelectionnees, setCollectionsSelectionnees] = useState([]);
  const [collectionsEditSelectionnees, setCollectionsEditSelectionnees] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  function afficherSucces(msg) {
    setSucces(msg);
    setTimeout(() => setSucces(""), 2000);
  }

  function afficherErreur(msg) {
    setErreur(msg);
    setTimeout(() => setErreur(""), 3500);
  }

  useEffect(() => {
    chargerLivres();
    chargerAuteurs();
    chargerCollections();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  
  
  async function chargerLivres() {
     setChargement(true);
  const data = await getLivres();
  if (data.data) setLivres(data.data);
    setChargement(false);
  }

  
  
  
  async function chargerAuteurs() {
     const data = await getAuteurs();
  if (data.data) setAuteurs(data.data);
  }

  async function chargerCollections() {
      const data = await getCollections();
   if (data.data) setCollections(data.data);
  }

  
  async function handleAjouterLivre(e) {
    e.preventDefault();
  const nouveauLivre = {
      titre,
      description,
      couverture,
       statut,
       note: note ? parseInt(note) : null,
      avis,
      auteur: auteurSelectionne || null,
      collections: collectionsSelectionnees,
    };
  
    const data = await ajouterLivre(nouveauLivre);
    
    if (data.data) {
     
     afficherSucces("Livre ajouté !");
      setAfficherFormulaire(false);
      setTitre("");
      setDescription("");
       setCouverture("");
      setStatut("a_lire");
      setNote("");
      setAvis("");
      setAuteurSelectionne("");
      setCollectionsSelectionnees([]);
       await chargerLivres();
     
    } else {
     
      afficherErreur("Erreur lors de l'ajout du livre");
     
    }
  }

 async function handleSupprimerLivre(documentId) {
if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) return;
  const data = await supprimerLivre(documentId);
  if (data.erreur) {
     afficherErreur("Impossible de supprimer le livre");
  } else {
    afficherSucces("Livre supprimé !");
    chargerLivres();
  }
}

   
  async function handleRetirerCollection(livreDocumentId, nouvellesCollections) {
      await retirerLivreCollection(livreDocumentId, nouvellesCollections);
     chargerLivres();
  }

     
  
  
  function ouvrirEdition(livre) {
    setEditingBook(livre);
    setTitreEdit(livre.titre);
    setDescriptionEdit(livre.description || "");
    setCouvertureEdit(livre.couverture || "");
     setStatutEdit(livre.statut);
    setNoteEdit(livre.note || "");
    setAvisEdit(livre.avis || "");
    setAuteurEditSelectionne(livre.auteur ? livre.auteur.documentId : "");
    setCollectionsEditSelectionnees(
      livre.collections ? livre.collections.map((c) => c.documentId) : []
    );
  }

  
  
  async function handleModifierLivre(e) {
 e.preventDefault();
      const data = await modifierLivre(editingBook.documentId, {
     titre: titreEdit,
         description: descriptionEdit,
      couverture: couvertureEdit,
      statut: statutEdit,
      note: noteEdit ? parseInt(noteEdit) : null,
      avis: avisEdit,
       auteur: auteurEditSelectionne || null,
      collections: collectionsEditSelectionnees,
    });

    
    if (data.data) {
     afficherSucces("Livre modifié !");
      setEditingBook(null);
      chargerLivres();
      
    } else {
       afficherErreur("Erreur lors de la modification");
    
    }
  }

 
  function handleDeconnexion() {
     localStorage.removeItem("token");
    localStorage.removeItem("userId");
    allerVers("connexion");
  }

  
  
  
  // todo: voir si je peux faire ça coté API avec les filters Strapi plus efficace et bien 


  const livresFiltres = livres


    .filter((livre) => {

      const matchRecherche = livre.titre.includes(recherche);
       const matchStatut = filtreStatut === "tous" || livre.statut === filtreStatut;
      const matchAuteur = filtreAuteur === "" || (livre.auteur && livre.auteur.id === filtreAuteur);
      const matchCollection = filtreCollection === "" || (livre.collections && livre.collections.some(c => c.id === filtreCollection));
      return matchRecherche && matchStatut && matchAuteur && matchCollection;
    })
    
    .sort((a, b) => {
      if (tri === "titre") return a.titre.localeCompare(b.titre);
      if (tri === "note") return (b.note || 0) - (a.note || 0);
      if (tri === "statut") return a.statut.localeCompare(b.statut);
      return 0;
    });

  
    const statutLabel = (s) => {
    if (s === "a_lire") return "À lire";
     if (s === "en_cours") return "En cours";
    return "Terminé";
  };

  const statutStyle = (s) => {
    if (s === "a_lire") return { background: "#dbeafe", color: "#1d4ed8" };
     if (s === "en_cours") return { background: "#fef9c3", color: "#a16207" };
    return { background: "#dcfce7", color: "#15803d" };
  };

  
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

  const radioStyle = (actif) => ({
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    border: `2px solid ${actif ? "#1a1a2e" : "#d1d5db"}`,
    background: actif ? "#1a1a2e" : "white",
    flexShrink: 0,
  });

  const filtreLabelStyle = (actif) => ({
    fontFamily: SERIF,
    fontSize: "13px",
    color: actif ? "#1a1a2e" : "#6b7280",
    fontWeight: actif ? "700" : "400",
    cursor: "pointer",
  });

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
     border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: SERIF,
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontFamily: SERIF,
    fontSize: "13px",
    fontWeight: "700",
     color: "#374151",
    display: "block",
    marginBottom: "6px",
  };

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

      {afficherFormulaire && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setAfficherFormulaire(false); }}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
         
         
              <div style={{ background: "white", borderRadius: "14px", padding: "32px", width: "100%", maxWidth: "580px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontFamily: SERIF, fontSize: "22px", fontWeight: "800", color: "#1a1a2e", margin: 0 }}>Nouveau livre</h3>
              <button onClick={() => setAfficherFormulaire(false)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}>×</button>
            </div>
            
            <form onSubmit={handleAjouterLivre}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                <div>
                  <label style={labelStyle}>Titre *</label>
                  <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} required style={inputStyle} />
                </div>
                <div>
                
                 <label style={labelStyle}>URL de la couverture</label>
                  <input type="text" value={couverture} onChange={(e) => setCouverture(e.target.value)} placeholder="https://..." style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
               
                <label style={labelStyle}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                 
                  <label style={labelStyle}>Statut</label>
                  <select value={statut} onChange={(e) => setStatut(e.target.value)} style={inputStyle}>
                    <option value="a_lire">À lire</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
                <div>
                 
                
           <label style={labelStyle}>Note (1-5)</label>
                  <input type="number" min="1" max="5" value={note} onChange={(e) => setNote(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Avis personnel</label>
                <textarea value={avis} onChange={(e) => setAvis(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
                <div>

               
                  <label style={labelStyle}>Auteur</label>
                  <select value={auteurSelectionne} onChange={(e) => setAuteurSelectionne(e.target.value)} style={inputStyle}>
                    <option value="">-- Choisir un auteur --</option>
                    {auteurs.map((a) => (
                      <option key={a.id} value={a.documentId}>{a.prenom} {a.nom}</option>
                    ))}
                  </select>
              </div>
               
 <div>
                 
                  <label style={labelStyle}>Collections</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px", maxHeight: "120px", overflowY: "auto", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px" }}>
                    {collections.map((c) => (
                      <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontFamily: SERIF, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                          checked={collectionsSelectionnees.includes(c.documentId)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...collectionsSelectionnees, c.documentId]
                              : collectionsSelectionnees.filter((id) => id !== c.documentId);
                            setCollectionsSelectionnees(updated);
                          }}
                        />
                        <span>{c.nom}</span>
             </label>
                    ))}
                  </div>
                </div>
              </div>

             
             
             
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{ flex: 1, background: "#1a1a2e", color: "white", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", fontFamily: SERIF, border: "none", cursor: "pointer" }}>
                  Ajouter le livre
                </button>
                <button type="button" onClick={() => setAfficherFormulaire(false)} style={{ background: "white", color: "#6b7280", border: "1px solid #e5e7eb", padding: "12px 20px", borderRadius: "8px", fontSize: "14px", fontFamily: SERIF, cursor: "pointer" }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {editingBook && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setEditingBook(null); }}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
             <div style={{ background: "white", borderRadius: "14px", padding: "32px", width: "100%", maxWidth: "520px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontFamily: SERIF, fontSize: "22px", fontWeight: "800", color: "#1a1a2e", margin: 0 }}>Modifier le livre</h3>
              <button onClick={() => setEditingBook(null)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}>×</button>
     </div>
            
            <form onSubmit={handleModifierLivre}>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Titre *</label>
                <input value={titreEdit} onChange={(e) => setTitreEdit(e.target.value)} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: "14px" }}>
               
                <label style={labelStyle}>URL de la couverture</label>
                <input value={couvertureEdit} onChange={(e) => setCouvertureEdit(e.target.value)} placeholder="https://..." style={inputStyle} />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Description</label>
                <textarea value={descriptionEdit} onChange={(e) => setDescriptionEdit(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              
               <div>
                  <label style={labelStyle}>Statut</label>
                  <select value={statutEdit} onChange={(e) => setStatutEdit(e.target.value)} style={inputStyle}>
                    <option value="a_lire">À lire</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>

                <div>

                  <label style={labelStyle}>Note (1-5)</label>
                  <input type="number" min="1" max="5" value={noteEdit} onChange={(e) => setNoteEdit(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Avis personnel</label>
                <textarea value={avisEdit} onChange={(e) => setAvisEdit(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
                <div>
                  <label style={labelStyle}>Auteur</label>
                  <select value={auteurEditSelectionne} onChange={(e) => setAuteurEditSelectionne(e.target.value)} style={inputStyle}>
                    <option value="">-- Aucun --</option>
                    {auteurs.map((a) => (<option key={a.id} value={a.documentId}>{a.prenom} {a.nom}</option>))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Collections</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px", maxHeight: "120px", minHeight: "40px", overflowY: "auto", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px" }}>
                    {collections.map((c) => (
                      <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontFamily: SERIF, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                          checked={collectionsEditSelectionnees.includes(c.documentId)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...collectionsEditSelectionnees, c.documentId]
                              : collectionsEditSelectionnees.filter((id) => id !== c.documentId);
                            setCollectionsEditSelectionnees(updated);
                          }}
                        />
                        <span>{c.nom}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{ flex: 1, background: "#1a1a2e", color: "white", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", fontFamily: SERIF, border: "none", cursor: "pointer" }}>
                  Sauvegarder
                </button>
                <button type="button" onClick={() => setEditingBook(null)} style={{ background: "white", color: "#6b7280", border: "1px solid #e5e7eb", padding: "12px 20px", borderRadius: "8px", fontSize: "14px", fontFamily: SERIF, cursor: "pointer" }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      
     
      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ padding: isMobile ? "14px 16px" : "0 40px", height: isMobile ? "auto" : "60px", display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "space-between" }}>
            <span style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e", fontFamily: SERIF, letterSpacing: "0.5px" }}>SupBook</span>
          {!isMobile && (
          <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => allerVers("auteurs")} style={btnStyle(false)}>Auteurs</button>
              <button onClick={() => allerVers("collections")} style={btnStyle(false)}>Collections</button>
              <button onClick={handleDeconnexion} style={btnStyle(true)}>Se déconnecter</button>
            </div>
          )}
        </div>
        {isMobile && (
          <div style={{ background: "#1a1a2e", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "10px 12px", gap: "8px" }}>
            <button onClick={() => allerVers("auteurs")} style={{ background: "transparent", color: "white", border: "none", fontFamily: SERIF, fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>Auteurs</button>
            <button onClick={() => allerVers("collections")} style={{ background: "transparent", color: "white", border: "none", fontFamily: SERIF, fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>Collections</button>
            <button onClick={handleDeconnexion} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.5)", borderRadius: "6px", fontFamily: SERIF, fontWeight: "700", fontSize: "13px", padding: "6px 12px", cursor: "pointer" }}>Se déconnecter</button>
          </div>
        )}
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "20px 14px" : "32px 24px" }}>

        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "14px", textAlign: isMobile ? "center" : "left" }}>
          <div>
            <h2 style={{ fontSize: isMobile ? "32px" : "28px", fontWeight: "800", color: "#1a1a2e", fontFamily: SERIF, marginBottom: "6px" }}>Ma Bibliothèque</h2>
            <p style={{ fontFamily: SERIF, fontSize: "13px", color: "#9ca3af" }}>
              {livres.length} livre{livres.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
              {livres.filter(l => l.statut === "a_lire").length} à lire &nbsp;·&nbsp;
              {livres.filter(l => l.statut === "en_cours").length} en cours &nbsp;·&nbsp;
              {livres.filter(l => l.statut === "termine").length} terminé{livres.filter(l => l.statut === "termine").length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={() => setAfficherFormulaire(true)} style={{ ...btnStyle(true), padding: "12px 22px", width: isMobile ? "100%" : "auto" }}>
            + Ajouter un livre
             </button>
        </div>

        <div style={{ display: "flex", gap: isMobile ? "14px" : "28px", alignItems: "flex-start" }}>
          <div style={{ width: isMobile ? "140px" : "190px", flexShrink: 0, background: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: isMobile ? "14px" : "20px" }}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", fontFamily: SERIF, marginBottom: "20px", boxSizing: "border-box" }}
            />

               <p style={{ fontFamily: SERIF, fontWeight: "700", fontSize: "11px", color: "#9ca3af", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Statut</p>
            {[
              { val: "tous", label: "Tous" },
              { val: "a_lire", label: "À lire" },
              { val: "en_cours", label: "En cours" },
              { val: "termine", label: "Terminé" },
            ].map((item) => (
              <div key={item.val} onClick={() => setFiltreStatut(item.val)} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer" }}>
                <div style={radioStyle(filtreStatut === item.val)} />
                <span style={filtreLabelStyle(filtreStatut === item.val)}>{item.label}</span>
              </div>
            ))}

                <div style={{ borderTop: "1px solid #e5e7eb", marginTop: "16px", paddingTop: "16px" }}>
           <p style={{ fontFamily: SERIF, fontWeight: "700", fontSize: "11px", color: "#9ca3af", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Auteur</p>
                 <div onClick={() => setFiltreAuteur("")} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer" }}>
                  <div style={radioStyle(filtreAuteur === "")} />
            <span style={filtreLabelStyle(filtreAuteur === "")}>Tous</span>
              </div>
              {auteurs.map((a) => (
                <div key={a.id} onClick={() => setFiltreAuteur(a.id)} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer" }}>
                  <div style={radioStyle(filtreAuteur === a.id)} />
                  <span style={filtreLabelStyle(filtreAuteur === a.id)}>{a.prenom} {a.nom}</span>
                </div>
              ))}
            </div>

                  <div style={{ borderTop: "1px solid #e5e7eb", marginTop: "16px", paddingTop: "16px" }}>
          <p style={{ fontFamily: SERIF, fontWeight: "700", fontSize: "11px", color: "#9ca3af", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Collection</p>
                 <div onClick={() => setFiltreCollection("")} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer" }}>
                   <div style={radioStyle(filtreCollection === "")} />
                   <span style={filtreLabelStyle(filtreCollection === "")}>Toutes</span>
              </div>
              {collections.map((c) => (
                <div key={c.id} onClick={() => setFiltreCollection(c.id)} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer" }}>
                  <div style={radioStyle(filtreCollection === c.id)} />
                  <span style={filtreLabelStyle(filtreCollection === c.id)}>{c.nom}</span>
                </div>
              ))}
            </div>

               
               <div style={{ borderTop: "1px solid #e5e7eb", marginTop: "16px", paddingTop: "16px" }}>
              <p style={{ fontFamily: SERIF, fontWeight: "700", fontSize: "11px", color: "#9ca3af", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Trier par</p>
              {[
                { val: "default", label: "Par défaut" },
                { val: "titre", label: "Titre A→Z" },
                { val: "note", label: "Meilleure note" },
                { val: "statut", label: "Statut" },
              ].map((item) => (
                   <div key={item.val} onClick={() => setTri(item.val)} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer" }}>
                  <div style={radioStyle(tri === item.val)} />
                  <span style={filtreLabelStyle(tri === item.val)}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>



               <div style={{ flex: 1 }}>
            {chargement && (
              <div style={{ textAlign: "center", padding: "80px", color: "#9ca3af", fontSize: "15px", fontFamily: SERIF }}>
                Chargement...
              </div>
            )}

               {!chargement && livres.length === 0 && (
              <div style={{ textAlign: "center", padding: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
                <p style={{ fontSize: "22px", color: "#6b7280", marginBottom: "10px", fontFamily: SERIF, fontWeight: "700" }}>Votre bibliothèque est vide</p>
                <p style={{ color: "#9ca3af", fontSize: "15px", fontFamily: SERIF }}>Ajoutez votre premier livre pour commencer</p>
              </div>
            )}

             
             
               <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(160px, 1fr))", gap: isMobile ? "12px" : "20px" }}>
              {livresFiltres.map((livre) => (
                <div key={livre.id}
                  style={{ background: "white", borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"}
                >
                     {livre.couverture ? (
                  
                  
                  
                  <img src={livre.couverture} alt={livre.titre} style={{ width: "100%", height: isMobile ? "180px" : "220px", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ width: "100%", height: isMobile ? "180px" : "220px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#d1d5db", fontSize: "12px", fontFamily: SERIF }}>Pas de couverture</span>
                    </div>
                  )}

                     <div style={{ padding: "12px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px", lineHeight: "1.3", fontFamily: SERIF }}>{livre.titre}</h3>

                    {livre.auteur && (
                      <p style={{ color: "#6b7280", fontSize: "12px", marginBottom: "6px", fontFamily: SERIF }}>par {livre.auteur.prenom} {livre.auteur.nom}</p>
                    )}

                    <span style={{ ...statutStyle(livre.statut), padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "inline-block", marginBottom: "6px", fontFamily: SERIF }}>
                      {statutLabel(livre.statut)}
                    </span>

                    {livre.note && (
                      <p style={{ fontSize: "12px", color: "#f59e0b", marginBottom: "4px", letterSpacing: "1px" }}>
                        {"★".repeat(livre.note)}<span style={{ color: "#d1d5db" }}>{"★".repeat(5 - livre.note)}</span>
                      </p>
                    )}
  

                    {livre.avis && (
                      <p style={{ color: "#6b7280", fontSize: "11px", fontStyle: "italic", marginBottom: "8px", lineHeight: "1.4", fontFamily: SERIF }}>"{livre.avis}"</p>
                    )}

                      {livre.collections && livre.collections.length > 0 && (
                      <div style={{ marginBottom: "8px" }}>
                        {livre.collections.map((c) => (
                          <span key={c.id} style={{ display: "inline-flex", alignItems: "center", background: "#f3f4f6", color: "#374151", padding: "2px 6px", borderRadius: "12px", fontSize: "11px", marginRight: "4px", marginBottom: "4px", fontFamily: SERIF }}>
                            {c.nom}
                            <button onClick={() => handleRetirerCollection(livre.documentId, livre.collections.filter(col => col.documentId !== c.documentId).map(col => col.documentId))} style={{ background: "none", color: "#9ca3af", marginLeft: "4px", padding: "0", fontSize: "11px", border: "none", cursor: "pointer" }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                     <button onClick={() => ouvrirEdition(livre)} style={{ flex: 1, background: "#1a1a2e", color: "white", padding: "6px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", fontFamily: SERIF, border: "none", cursor: "pointer" }}>Modifier</button>
                      <button onClick={() => handleSupprimerLivre(livre.documentId)} style={{ background: "white", color: "#9ca3af", border: "1px solid #e5e7eb", padding: "6px 8px", borderRadius: "6px", fontSize: "11px", fontFamily: SERIF, cursor: "pointer" }}>Supprimer</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bibliotheque;