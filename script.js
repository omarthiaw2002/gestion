

// --- CONFIGURATION SUPABASE ---
const supabaseUrl = "https://oosedarmjrdizwxxzbpr.supabase.co";
const supabaseKey = "sb_publishable_q7QhDVsfPwy1woYGDIUi7A_Pdsy-BT-";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
// --- AJOUTER UN BIEN ---
async function ajouterBien() {
  const btn = event.target; // le bouton qui a déclenché l'événement
  btn.disabled = true;
  btn.textContent = "Ajout...";

  try {
    // Récupération des valeurs du formulaire
    const prix = document.getElementById("prix").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const lieu = document.getElementById("lieu").value.trim();
    const date = document.getElementById("date").value;
    const statut = document.getElementById("statut").value;
    const files = document.getElementById("photos").files;

    // --- Validations ---
    if (!prix || !nombre || !lieu || !date) {
      throw new Error("Tous les champs sont obligatoires.");
    }
    if (isNaN(prix) || isNaN(nombre)) {
      throw new Error("Prix et Nombre doivent être des nombres.");
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
    // Attention : le nom de la colonne contient un tiret → guillemets obligatoires
    const { error: insertError } = await supabaseClient.from("biens").insert([
      {
        prix: Number(prix),
        nombre: Number(nombre),
        lieu,
        "date-stockage": date,
        statut,
        images: imagesUrls,
      },
    ]);
    if (insertError) throw insertError;

    // --- Réinitialisation du formulaire ---
    document.getElementById("prix").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("lieu").value = "";
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
      row.setAttribute("data-lieu", (bien.lieu || "").toLowerCase());

      row.innerHTML = `
        <td>${imagesHTML}</td>
        <td>${bien.prix}</td>
        <td>${bien.nombre}</td>
        <td>${bien.lieu}</td>
        <td>${bien["date-stockage"] || ""}</td>
        <td>${bien.statut}</td>
        <td>
          <button class="btn-edit" onclick="modifier(${bien.id})">Modifier</button>
          <button class="btn-delete" onclick="supprimer(${bien.id})">Supprimer</button>
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
async function modifier(id) {
  const nouveauPrix = prompt("Nouveau prix ?");
  if (nouveauPrix === null) return;
  if (isNaN(nouveauPrix) || nouveauPrix.trim() === "") {
    alert("Veuillez entrer un nombre valide.");
    return;
  }
  try {
    const { error } = await supabaseClient
      .from("biens")
      .update({ prix: Number(nouveauPrix) })
      .eq("id", id);
    if (error) throw error;
    afficherBiens();
  } catch (error) {
    alert("Erreur modification : " + error.message);
  }
}

// --- RECHERCHE PAR LIEU ---
function rechercher() {
  const input = document.getElementById("recherche").value.toLowerCase();
  const rows = document.querySelectorAll("#tableBiens tr");
  rows.forEach((row) => {
    const lieu = row.getAttribute("data-lieu") || "";
    row.style.display = lieu.includes(input) ? "" : "none";
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
