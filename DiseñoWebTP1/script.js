// Configuración de la API
const API_BASE_URL = 'uri_proporcionada_por_el_docente';

// Elementos del DOM
const sections = {
    home: document.getElementById('home-section'),
    list: document.getElementById('list-section'),
    form: document.getElementById('form-section')
};

const navLinks = {
    home: document.getElementById('nav-home'),
    list: document.getElementById('nav-list'),
    add: document.getElementById('nav-add')
};

const form = document.getElementById('item-form');
const itemsContainer = document.getElementById('items-container');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');

// Variables de estado
let currentItemId = null;
let isEditMode = false;

// Funciones para manejar la navegación
function showSection(sectionId) {
    // Ocultar todas las secciones
    Object.values(sections).forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    sections[sectionId].classList.add('active');
}

// Event listeners para navegación
navLinks.home.addEventListener('click', () => {
    showSection('home');
});

navLinks.list.addEventListener('click', async () => {
    showSection('list');
    await loadItems();
});

navLinks.add.addEventListener('click', () => {
    isEditMode = false;
    formTitle.textContent = 'Agregar Nuevo Registro';
    form.reset();
    currentItemId = null;
    document.getElementById('item-id').value = '';
    showSection('form');
});

cancelBtn.addEventListener('click', () => {
    showSection('list');
});

// Funciones para interactuar con la API
async function getAllItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/getAll`);
        if (!response.ok) throw new Error('Error al obtener los registros');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al cargar los registros', 'error');
        return [];
    }
}

async function addItem(itemData) {
    try {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData)
        });
        
        if (!response.ok) throw new Error('Error al agregar el registro');
        
        const data = await response.json();
        showMessage('Registro agregado correctamente', 'success');
        return data;
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al agregar el registro', 'error');
        throw error;
    }
}

async function updateItem(id, itemData) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData)
        });
        
        if (!response.ok) throw new Error('Error al actualizar el registro');
        
        const data = await response.json();
        showMessage('Registro actualizado correctamente', 'success');
        return data;
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al actualizar el registro', 'error');
        throw error;
    }
}

async function deleteItem(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}/delete`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Error al eliminar el registro');
        
        showMessage('Registro eliminado correctamente', 'success');
        return true;
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al eliminar el registro', 'error');
        return false;
    }
}

// Funciones para manejar la interfaz
async function loadItems() {
    itemsContainer.innerHTML = '<p>Cargando registros...</p>';
    const items = await getAllItems();
    
    if (items.length === 0) {
        itemsContainer.innerHTML = '<p>No hay registros disponibles</p>';
        return;
    }
    
    itemsContainer.innerHTML = '';
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item-card';
        itemElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p>Precio: $${item.price}</p>
            <div class="item-actions">
                <button class="btn btn-edit" data-id="${item.id}">Editar</button>
                <button class="btn btn-delete" data-id="${item.id}">Eliminar</button>
            </div>
        `;
        itemsContainer.appendChild(itemElement);
    });
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editItem(btn.dataset.id));
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => confirmDelete(btn.dataset.id));
    });
}

async function editItem(id) {
    const items = await getAllItems();
    const item = items.find(item => item.id == id);
    
    if (!item) {
        showMessage('No se encontró el registro a editar', 'error');
        return;
    }
    
    isEditMode = true;
    currentItemId = id;
    formTitle.textContent = 'Editar Registro';
    document.getElementById('item-id').value = id;
    document.getElementById('name').value = item.name;
    document.getElementById('description').value = item.description;
    document.getElementById('price').value = item.price;
    showSection('form');
}

async function confirmDelete(id) {
    if (confirm('¿Está seguro que desea eliminar este registro?')) {
        const success = await deleteItem(id);
        if (success) {
            await loadItems();
        }
    }
}

function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    const currentSection = document.querySelector('.section.active');
    currentSection.insertBefore(messageElement, currentSection.firstChild);
    
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Manejo del formulario
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value)
    };
    
    try {
        if (isEditMode) {
            await updateItem(currentItemId, formData);
        } else {
            await addItem(formData);
        }
        
        form.reset();
        showSection('list');
        await loadItems();
    } catch (error) {
        console.error('Error al procesar el formulario:', error);
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    showSection('home');
});