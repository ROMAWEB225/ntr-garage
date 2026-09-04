// ============================================================
// SCRIPT DE MIGRATION DES DONNÉES
// ============================================================
// Ce script ajoute le champ "garage" à toutes les demandes existantes
// qui n'en ont pas encore.
// 
// 🚀 Comment l'utiliser :
// 1. Copie ce code dans la console Firebase (Firestore > Shell)
// 2. Exécute-le
// 3. Vérifie que toutes les demandes ont maintenant un champ "garage"
// ============================================================

console.log('🚀 Début de la migration des données...');

// Récupérer toutes les demandes
db.collection('demandes').get()
    .then((snapshot) => {
        console.log(`📦 ${snapshot.size} demandes trouvées`);
        
        let compteur = 0;
        let erreurs = 0;
        const batch = db.batch();
        const updates = [];
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // ✅ Si la demande n'a PAS de champ "garage"
            if (!data.garage) {
                compteur++;
                
                // Déterminer le garage par défaut
                // Option 1: Utiliser "Standard" (par défaut)
                const garageParDefaut = 'Standard';
                
                // Option 2: Utiliser le "garageId" si présent
                // const garageParDefaut = data.garageId || 'Standard';
                
                // Option 3: Utiliser le nom du garage depuis une autre collection
                // (plus avancé)
                
                console.log(`   📝 Demande ${doc.id} : ajout du champ "garage" = "${garageParDefaut}"`);
                
                // Ajouter la mise à jour au batch
                const ref = db.collection('demandes').doc(doc.id);
                updates.push({ ref, garage: garageParDefaut });
            }
        });
        
        if (updates.length === 0) {
            console.log('✅ Aucune demande à migrer. Tout est déjà à jour !');
            return;
        }
        
        // Exécuter les mises à jour par lots de 500 (limite Firebase)
        const lots = [];
        for (let i = 0; i < updates.length; i += 500) {
            lots.push(updates.slice(i, i + 500));
        }
        
        console.log(`📦 ${lots.length} lots à exécuter`);
        
        // Exécuter chaque lot
        lots.forEach((lot, index) => {
            const batch = db.batch();
            lot.forEach(({ ref, garage }) => {
                batch.update(ref, { garage: garage });
            });
            
            batch.commit()
                .then(() => {
                    console.log(`✅ Lot ${index + 1}/${lots.length} terminé (${lot.length} documents)`);
                })
                .catch((error) => {
                    console.error(`❌ Erreur lot ${index + 1}:`, error);
                    erreurs++;
                });
        });
        
        console.log(`✅ Migration terminée ! ${compteur} demandes mises à jour, ${erreurs} erreurs`);
    })
    .catch((error) => {
        console.error('❌ Erreur lors de la récupération des demandes:', error);
    });
