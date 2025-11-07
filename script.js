// === Ajouter / Supprimer ligne ===
    function addRow() {
      const table = document.querySelector('#ingredients-table tbody');
      const row = table.insertRow();
      for (let i = 0; i < 11; i++) {
        const cell = row.insertCell();
        const input = document.createElement('input');
        input.type = i === 0 ? 'text' : 'number';
        input.step = i >= 2 ? '0.1' : 'any';
        input.value = i === 0 ? '' : '0';
        if (i === 10) {
          const btn = document.createElement('button');
          btn.className = 'btn btn-remove';
          btn.textContent = 'Supprimer';
          btn.onclick = () => row.remove();
          cell.appendChild(btn);
        } else {
          cell.appendChild(input);
        }
      }
    }

    function removeRow(btn) {
      btn.closest('tr').remove();
    }

    // === CALCUL CORRIGÉ ===
    function calculate() {
      const totalVolume = parseFloat(document.getElementById('total-volume').value) || 1000;
      const rows = document.querySelectorAll('#ingredients-table tbody tr');
      let hasNutritionData = false;

      let totals = {
        energy: 0, proteins: 0, carbs: 0, sugars: 0, fats: 0, satFats: 0, sodium: 0, fibers: 0
      };

      rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const qty = parseFloat(inputs[1].value) || 0;

        // Vérifie si au moins un ingrédient a des données nutritionnelles
        if (parseFloat(inputs[3].value) > 0 || parseFloat(inputs[4].value) > 0) hasNutritionData = true;

        totals.energy += (qty * parseFloat(inputs[3].value || 0)) / 100;
        totals.proteins += (qty * parseFloat(inputs[4].value || 0)) / 100;
        totals.carbs += (qty * parseFloat(inputs[5].value || 0)) / 100;
        totals.sugars += (qty * parseFloat(inputs[6].value || 0)) / 100;
        totals.fats += (qty * parseFloat(inputs[7].value || 0)) / 100;
        totals.satFats += (qty * parseFloat(inputs[8].value || 0)) / 100;  // CORRIGÉ ICI
        totals.sodium += (qty * parseFloat(inputs[8].value || 0)) / 100;
        totals.fibers += (qty * parseFloat(inputs[9].value || 0)) / 100;
      });

      const factor = 100 / totalVolume;

      // === Estimation via Brix si pas de données ===
      if (!hasNutritionData) {
        const brix = parseFloat(document.getElementById('final-brix').value) || 0;
        const estimatedKcal = brix * 3.8;
        totals.energy = estimatedKcal * (totalVolume / 100);
        totals.carbs = totals.energy / 4;
        totals.sugars = totals.carbs * 0.95;
        document.getElementById('brix-estimate').textContent = `Estimation via Brix : ${estimatedKcal.toFixed(0)} kcal/100ml`;
      } else {
        document.getElementById('brix-estimate').textContent = '';
      }

      // === Calculs par 100ml ===
      const per100 = {
        energy: (totals.energy * factor).toFixed(1),
        proteins: (totals.proteins * factor).toFixed(1),
        carbs: (totals.carbs * factor).toFixed(1),
        sugars: (totals.sugars * factor).toFixed(1),
        fats: (totals.fats * factor).toFixed(1),
        satFats: (totals.satFats * factor).toFixed(1),
        sodium: (totals.sodium * factor).toFixed(1),
        fibers: (totals.fibers * factor).toFixed(1)
      };

      const energyKj = (per100.energy * 4.184).toFixed(0);
      const salt = (per100.sodium / 1000 * 2.5).toFixed(2);

      // === Affichage ===
      document.getElementById('energy').textContent = `${per100.energy} kcal / ${energyKj} kJ`;
      document.getElementById('fats').textContent = `${per100.fats} g`;
      document.getElementById('satFats').textContent = `${per100.satFats} g`;
      document.getElementById('carbs').textContent = `${per100.carbs} g`;
      document.getElementById('sugars').textContent = `${per100.sugars} g`;
      document.getElementById('proteins').textContent = `${per100.proteins} g`;
      document.getElementById('salt').textContent = `${salt} g`;
      document.getElementById('fibers').textContent = `${per100.fibers} g`;

      document.getElementById('results').classList.remove('hidden');

      // Sauvegarde
      saveRecipe();
    }

    // === Sauvegarde locale ===
    function saveRecipe() {
      const data = {
        volume: document.getElementById('total-volume').value,
        type: document.getElementById('product-type').value,
        brix: document.getElementById('final-brix').value,
        acidite: document.getElementById('final-acidite').value,
        ph: document.getElementById('final-ph').value,
        densite: document.getElementById('final-densite').value,
        ingredients: []
      };
      document.querySelectorAll('#ingredients-table tbody tr').forEach(row => {
        const inputs = row.querySelectorAll('input');
        data.ingredients.push(Array.from(inputs).slice(0, 10).map(i => i.value));
      });
      localStorage.setItem('boisson_recipe', JSON.stringify(data));
    }


 // === Charger sauvegarde ===
window.onload = () => {
  const saved = localStorage.getItem('boisson_recipe');
  if (saved) {
    const data = JSON.parse(saved);
    document.getElementById('total-volume').value = data.volume;
    document.getElementById('product-type').value = data.type;
    document.getElementById('final-brix').value = data.brix;
    document.getElementById('final-acidite').value = data.acidite;
    document.getElementById('final-ph').value = data.ph;
    document.getElementById('final-densite').value = data.densite;

    const tbody = document.querySelector('#ingredients-table tbody');
    tbody.innerHTML = ''; // Vide le tableau

    data.ingredients.forEach(ing => {
      const row = tbody.insertRow();
      // Recrée les 10 inputs + 1 bouton
      for (let i = 0; i < 11; i++) {
        const cell = row.insertCell();
        if (i < 10) {
          const input = document.createElement('input');
          input.type = i === 0 ? 'text' : 'number';
          input.step = i >= 2 ? '0.1' : 'any';
          input.value = ing[i] || (i === 0 ? '' : '0');
          cell.appendChild(input);
        } else {
          // Bouton Supprimer
          const btn = document.createElement('button');
          btn.className = 'btn btn-remove';
          btn.textContent = 'Supprimer';
          btn.onclick = () => row.remove();
          cell.appendChild(btn);
        }
      }
    });
  }
};