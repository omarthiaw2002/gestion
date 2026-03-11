
// --- CONFIGURATION SUPABASE ---
const supabaseUrl = "https://oosedarmjrdizwxxzbpr.supabase.co";
const supabaseKey = "sb_publishable_q7QhDVsfPwy1woYGDIUi7A_Pdsy-BT-";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
// --- AJOUTER UN BIEN ---
async function ajouterBien() {
  const btn = event.target; // le bouton qui a déclenché l'événement
  btn.disabled = true;
  btn.textContent = "Ajout...";
  const prix = document.getElementById("prix").value.trim();
const statut = document.getElementById("statut").value;
const files = document.getElementById("photos").files;
const date = document.getElementById("date").value || new Date().toISOString().split("T")[0];

  try {
    // Récupération des valeurs du formulaire
const gestion = document.getElementById("gestion").value;
const reference = document.getElementById("reference").value;
const ville = document.getElementById("ville").value;
const quartier = document.getElementById("quartier").value;
const type_bien = document.getElementById("type_bien").value;
const type_papier = document.getElementById("type_papier").value;
const meuble = document.getElementById("meuble").value;
const chambres = document.getElementById("chambres").value;
const surface = document.getElementById("surface").value;
const description = document.getElementById("description").value;
const lien_dossier = document.getElementById("lien_dossier").value;
const geolocalisation = document.getElementById("geolocalisation").value;
const infos_commentaire = document.getElementById("infos_commentaire").value;
const contact = document.getElementById("contact").value;
const reference_par = document.getElementById("reference_par").value;


    // --- Validations ---
   if (!prix || !ville || !quartier) {
  throw new Error("Veuillez remplir les champs obligatoires.");
}
if (isNaN(prix)) {
  throw new Error("Le prix doit être un nombre.");
}

    // --- Upload d'une image (premier fichier seulement) ---
  let imagesUrls = [];

if (files.length > 0) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");
    const fileName = `${Date.now()}_${i}_${safeName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseClient.storage
      .from("images")
      .getPublicUrl(fileName);

    imagesUrls.push(urlData.publicUrl);
  }
}

    // --- Insertion dans la table "biens" ---
   if (bienEnModification) {

const { error } = await supabaseClient
.from("biens")
.update({
gestion,
reference,
ville,
quartier,
type_bien,
type_papier,
meuble,
chambres,
surface,
description,
prix:Number(prix),
lien_dossier,
geolocalisation,
infos_commentaire,
contact,
reference_par,
date_stockage:date,
statut
})
.eq("id", bienEnModification);

if (error) throw error;

alert("Bien modifié avec succès");

bienEnModification = null;

document.querySelector(".ajouter").textContent = "Ajouter";

}

else {

const { error } = await supabaseClient.from("biens").insert([{
gestion,
reference,
ville,
quartier,
type_bien,
type_papier,
meuble,
chambres,
surface,
description,
prix:Number(prix),
lien_dossier,
geolocalisation,
infos_commentaire,
contact,
reference_par,
date_stockage:date,
statut,
images:imagesUrls
}]);

if (error) throw error;

alert("Bien ajouté");

}
    // --- Réinitialisation du formulaire ---
    document.getElementById("prix").value = "";

    document.getElementById("date").value = "";
    document.getElementById("statut").value = "disponible";
    document.getElementById("photos").value = "";

    alert("Bien ajouté avec succès !");
    afficherBiens(); // Rafraîchir l'affichage
  } catch (error) {
    alert("Erreur : " + error.message);
    console.error(error);
  } finally {
    // Réactiver le bouton dans tous les cas
    btn.disabled = false;
    btn.textContent = "Ajouter";
  }
}
// --- AFFICHER TOUS LES BIENS ---
// --- AFFICHER TOUS LES BIENS ---
async function afficherBiens() {
  try {
    const { data, error } = await supabaseClient
      .from("biens")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    window.biensData = data; // <-- Ajoute cette ligne

    const tbody = document.getElementById("tableBiens");
    tbody.innerHTML = "";

    (data || []).forEach((bien) => {
      // ... reste de ton code pour générer le tableau ...
   let imagesHTML = "";

if (bien.images) {
  const imgs = Array.isArray(bien.images) ? bien.images : JSON.parse(bien.images || "[]");
  
  // Affiche les 2 premières images
  imgs.slice(0, 2).forEach(url => {
    if (url) {
      imagesHTML += `
        <img src="${url}" style="width:90px;height:70px;object-fit:cover;border-radius:6px;margin-right:4px;">
      `;
    }
  });
  
  // Si plus de 2 images, ajoute un bouton +X
  if (imgs.length > 2) {
    const reste = imgs.length - 2;
    imagesHTML += `<button onclick="voirImages(${bien.id})">+${reste}</button>`;
  }
} else {
  imagesHTML = "Aucune image";
}

      // Création de la ligne
      const row = document.createElement("tr");
      row.className = bien.statut;
      row.setAttribute("data-lieu", (bien.ville || "").toLowerCase());
row.innerHTML = `
<td>${imagesHTML}</td>
<td>${bien.gestion || ""}</td>
<td>${bien.reference || ""}</td>
<td>${bien.ville || ""}</td>
<td>${bien.quartier || ""}</td>
<td>${bien.type_bien || ""}</td>
<td>${bien.type_papier || ""}</td>
<td>${bien.meuble || ""}</td>
<td>${bien.chambres || ""}</td>
<td>${bien.surface || ""}</td>
<td>${bien.description || ""}</td>
<td>${bien.prix || ""}</td>
<td>${bien.lien_dossier || ""}</td>
<td>${bien.geolocalisation || ""}</td>
<td>${bien.infos_commentaire || ""}</td>

<td>
${bien.contact || ""} 
</td>
<td>${bien.reference_par || ""}</td>

<td>${bien.date_stockage || ""}</td>
<td>
  <button 
    onclick="modifier(${bien.id})" 
    style="
      background-color: #4CAF50; 
      color: white; 
      border: none; 
      padding: 5px 10px; 
      border-radius: 4px; 
      cursor: pointer; 
      margin-right: 4px;
    ">
    Modifier
  </button>
  <button 
    onclick="supprimer(${bien.id})" 
    style="
      background-color: #f44336; 
      color: white; 
      border: none; 
      padding: 5px 10px; 
      border-radius: 4px; 
      cursor: pointer;
    ">
    Supprimer
  </button>
</td>
`;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Erreur affichage :", error);
    document.getElementById("tableBiens").innerHTML =
      '<tr><td colspan="7">Erreur de chargement des données</td></tr>';
  }
}
async function supprimer(id) {
  if (!confirm("Supprimer ce bien ?")) return;
  try {
    const { error } = await supabaseClient.from("biens").delete().eq("id", id);
    if (error) throw error;
    afficherBiens();
  } catch (error) {
    alert("Erreur suppression : " + error.message);
  }
}

// --- MODIFIER (exemple simple : changer le prix) ---
let bienEnModification = null;
function modifier(id) {

const bien = window.biensData.find(b => b.id === id);

if (!bien) return;

bienEnModification = id;
document.getElementById("gestion").value = bien.gestion || "";
document.getElementById("reference").value = bien.reference || "";
document.getElementById("ville").value = bien.ville || "";
document.getElementById("quartier").value = bien.quartier || "";
document.getElementById("type_bien").value = bien.type_bien || "";
document.getElementById("type_papier").value = bien.type_papier || "";
document.getElementById("meuble").value = bien.meuble || "";
document.getElementById("chambres").value = bien.chambres || "";
document.getElementById("surface").value = bien.surface || "";
document.getElementById("description").value = bien.description || "";
document.getElementById("prix").value = bien.prix || "";
document.getElementById("lien_dossier").value = bien.lien_dossier || "";
document.getElementById("geolocalisation").value = bien.geolocalisation || "";
document.getElementById("infos_commentaire").value = bien.infos_commentaire || "";
document.getElementById("reference_par").value = bien.reference_par || "";
document.getElementById("contact").value = bien.contact || "";
document.getElementById("date").value = bien.date_stockage || "";
document.getElementById("statut").value = bien.statut || "";

document.querySelector(".ajouter").textContent = "Mettre à jour";

window.scrollTo({top:0, behavior:"smooth"});

}

// --- RECHERCHE PAR ville ---
function rechercherVille() {

const ville = document.getElementById("rechercheVille").value.toLowerCase();
const rows = document.querySelectorAll("#tableBiens tr");

rows.forEach(row => {

const villeBien = row.children[4].textContent.toLowerCase();

if (villeBien.includes(ville)) {
row.style.display = "";
} else {
row.style.display = "none";
}

});

}

// --- RECHERCHE PAR prix ---
function rechercherPrix() {

const prixMax = document.getElementById("recherchePrix").value;
const rows = document.querySelectorAll("#tableBiens tr");

rows.forEach(row => {

const prixBien = parseFloat(row.children[11].textContent) || 0;

if (!prixMax || prixBien <= prixMax) {
row.style.display = "";
} else {
row.style.display = "none";
}

});
}
function voirImages(bienId) {
  const bien = window.biensData.find(b => b.id === bienId);
  if (!bien || !bien.images) return;
  
  const imgs = Array.isArray(bien.images) ? bien.images : JSON.parse(bien.images || "[]");

  // Crée le popup
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = 0;
  popup.style.left = 0;
  popup.style.width = "100%";
  popup.style.height = "100%";
  popup.style.background = "rgba(0,0,0,0.8)";
  popup.style.display = "flex";
  popup.style.alignItems = "center";
  popup.style.justifyContent = "center";
  popup.style.flexWrap = "wrap";
  popup.style.zIndex = 1000;
  popup.style.overflow = "auto";
  popup.onclick = () => document.body.removeChild(popup);

  imgs.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.style.width = "200px";
    img.style.height = "150px";
    img.style.objectFit = "cover";
    img.style.margin = "5px";
    popup.appendChild(img);
  });

  document.body.appendChild(popup);
}
// --- CHARGEMENT INITIAL ---
afficherBiens();