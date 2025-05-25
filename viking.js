const localStorageKey = 'to-do-list-viking';
import { recipesViking } from './RecipesViking.js';
import { ingredientCosts } from './IngredientCostsViking.js'; // novo

function validateIfExistsNewTask()
{
    let values     = JSON.parse(localStorage.getItem(localStorageKey) || "[]")
    let inputValue = document.getElementById('input-new-task').value
    let exists     = values.find(x => x.name == inputValue)
    return !exists ? false : true
}

function newTask()
{
    let input = document.getElementById('input-new-task')
    input.style.border = ''

    // validation
    if(!input.value)
    {   
        input.style.border = '1px solid red'
        alert('Digite algo para inserir em sua lista')
    }
    else if(validateIfExistsNewTask())
    {
        alert('Já existe uma tarefa igual a essa na lista!')
    }
    else
    {
        // increment to localStorage
        let values = JSON.parse(localStorage.getItem(localStorageKey) || "[]")
        values.push({
            name: input.value,
            checked: false
        })
        localStorage.setItem(localStorageKey,JSON.stringify(values))
        showValues()
    }
    input.value = ''
}

function showValues() {
    let values = JSON.parse(localStorage.getItem(localStorageKey) || "[]");
    let list = document.getElementById('to-do-list');
    list.innerHTML = '';

    for (let i = 0; i < values.length; i++) {
        const task = values[i];
        const isChecked = task.checked ? "checked" : "";

        list.innerHTML += `
            <li class="${isChecked}" onclick="toggleChecked(${i})">
                ${task.name}
                 <button id='btn-ok' onclick='event.stopPropagation(); removeItem("${task.name}")'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg>
                </button>
            </li>
        `;
    }
}


function removeItem(data)
{
    let values = JSON.parse(localStorage.getItem(localStorageKey) || "[]")
    let index = values.findIndex(x => x.name == data)
    values.splice(index,1)
    localStorage.setItem(localStorageKey,JSON.stringify(values))
    showValues()
}

function toggleChecked(index) {
    let values = JSON.parse(localStorage.getItem(localStorageKey) || "[]");
    values[index].checked = !values[index].checked;
    localStorage.setItem(localStorageKey, JSON.stringify(values));
    showValues();
}

showValues()

window.newTask = newTask;
window.removeItem = removeItem;
window.toggleChecked = toggleChecked;

// Popula o seletor com as receitas da Fazenda
function populateRecipeSelect() {
    const select = document.getElementById("recipe-select");
    select.innerHTML = ''; // limpa o conteúdo anterior
    Object.keys(recipesViking).forEach(recipeName => {
        const option = document.createElement("option");
        option.value = recipeName;
        option.textContent = recipeName;
        select.appendChild(option);
    });
}

// Emojis para ingredientes
function getEmoji(ingredientName) {
    const map = {
        "Junco": "🌿",
        "Maçã": "🍎",
        "Maçã Inglesa": "🍎",  
        "Banana": "🍌", 
        "Uva": "🍇", 
        "Milho": "🌽", 
        "Trigo": "🌾",
        "Água": "💧", 
        "Cana de Açúcar": "🎋", 
        "Melado de Cana": "🍯", 
        "Leite": "🥛",
        "Cogumelo Bay Bulete": "🍄",
        "Papoula": "🌺",
        "Orégano": "🌿",
        "Oleander": "🌸",
        "Ginseng": "🌱",
        "Alaskan Ginseng": "🌱",
        "Caixa Rustica": "📦",
        "Pessêgo": "🍑",
        "Crina de Galo": "🐓",
        "Taurina": "🐂",
        "Leite de Cabra": "🐐",
        "Lã de Ovelha": "🐑",
        "Buchada de Bode": "🐐",
        "Leite de Porca": "🐖" ,
        "Carne de Porco": "🍖",
        "Embalagem": "🥡",
        "Garrafa de Água": "💧",
        "Cogumelo Guarda Sol": "🍄",
        "Açúcar": "🍚",
        "Embalagem de Leite": "🥛",
        "Fardo de Garrafa de Vidro": "🍶", 
        "Tampa de Garrafa": "🧫",
        "Favo de Mel": "🍯",
        "Madeira": "🍀" ,
        "Animal": "🐄",
        "Moedor": "🎡",
    };
    return map[ingredientName] || "💢";
}

// Cálculo da receita
function calculateRecipe() {
    const recipeName = document.getElementById("recipe-select").value;
    const quantity = parseInt(document.getElementById("recipe-quantity").value);
    const resultEl = document.getElementById("calculation-result");

    if (!recipeName || isNaN(quantity) || quantity <= 0) {
        resultEl.innerHTML = "Por favor, selecione uma receita e insira uma quantidade válida.";
        return;
    }

    const recipe = recipesViking[recipeName];
    const totalYield = recipe.yield * quantity;

    const minUnit = recipe.minPrice;
    const maxUnit = recipe.maxPrice;
    
    const minTotal = minUnit * totalYield;
    const maxTotal = maxUnit * totalYield;

    // Calcular custo total
    let totalCost = 0;
    let ingredientsHTML = '<ul class="ingredients-list">';
    recipe.ingredients.forEach(ingredient => {
        const emoji = getEmoji(ingredient.name);
        const totalQty = ingredient.quantity * quantity;
        const unitCost = ingredientCosts[ingredient.name] || 0;
        const ingredientCost = unitCost * totalQty;
        totalCost += ingredientCost;
        ingredientsHTML += `<li class='ingredient-item'>${emoji} ${ingredient.name}: ${totalQty} (U$ ${ingredientCost.toFixed(2)})</li>`;
    });
    ingredientsHTML += "</ul>";

    const lucroMin = minTotal - totalCost;
    const lucroMax = maxTotal - totalCost;

    resultEl.innerHTML = `
        <strong>${recipeName}</strong><br>
        <strong>Quantidade total:</strong> ${totalYield}<br>
        <strong>Preço unitário:</strong> U$ ${minUnit.toFixed(2)} - U$ ${maxUnit.toFixed(2)}<br>
        <strong>Faixa de preço total:</strong> U$ ${minTotal.toFixed(2)} - U$ ${maxTotal.toFixed(2)}<br>
        <strong><span style="color:darkred">Custo de produção:</span></strong> U$ ${totalCost.toFixed(2)}<br>
        <strong><span style="color:darkgreen">Lucro estimado:</span></strong> U$ ${lucroMin.toFixed(2)} - U$ ${lucroMax.toFixed(2)}<br><br>
        <strong>Ingredientes:</strong><br>
        ${ingredientsHTML}
    `;
}

// Inicializa tudo
function init() {
    showValues();
    populateRecipeSelect();
    document.getElementById("calculate-btn").addEventListener("click", calculateRecipe);
}

init();

window.newTask = newTask;
window.removeItem = removeItem;