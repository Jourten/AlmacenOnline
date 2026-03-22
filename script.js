// script.js — Modern warehouse management system

class Almacen {
    constructor() {
        this.productos = [];
        this.storageKey = 'almacen';
    }

    /**
     * Add a new product to the warehouse
     */
    agregarProducto(nombre, precio, cantidad) {
        const nuevoProducto = {
            id: Date.now(), // Unique ID
            nombre,
            precio: parseFloat(precio),
            cantidad: parseInt(cantidad, 10),
            fechaCreacion: new Date().toISOString()
        };
        
        this.productos.push(nuevoProducto);
        this.guardarEnLocalStorage();
        this.mostrarProductos();
        return nuevoProducto;
    }

    /**
     * Delete a product by ID
     */
    eliminarProducto(id) {
        const index = this.productos.findIndex(p => p.id === id);
        
        if (index === -1) {
            console.error('Product not found');
            return false;
        }
        
        const productoEliminado = this.productos[index];
        this.productos.splice(index, 1);
        this.guardarEnLocalStorage();
        this.mostrarProductos();
        
        return productoEliminado;
    }

    /**
     * Update a product by ID
     */
    actualizarProducto(id, nuevosDatos) {
        const index = this.productos.findIndex(p => p.id === id);
        
        if (index === -1) {
            console.error('Product not found');
            return false;
        }
        
        // Update product data
        this.productos[index] = {
            ...this.productos[index],
            nombre: nuevosDatos.nombre,
            cantidad: parseInt(nuevosDatos.cantidad, 10),
            precio: parseFloat(nuevosDatos.precio),
            fechaModificacion: new Date().toISOString()
        };
        
        this.guardarEnLocalStorage();
        this.mostrarProductos();
        
        return this.productos[index];
    }

    /**
     * Adjust product quantity (increase or decrease)
     */
    ajustarCantidad(id, ajuste) {
        const producto = this.productos.find(p => p.id === id);
        
        if (!producto) {
            console.error('Product not found');
            return false;
        }
        
        producto.cantidad += ajuste;
        producto.fechaModificacion = new Date().toISOString();
        
        this.guardarEnLocalStorage();
        this.mostrarProductos();
        
        return producto;
    }

    /**
     * Adjust product price (increase or decrease)
     */
    ajustarPrecio(id, ajuste) {
        const producto = this.productos.find(p => p.id === id);
        
        if (!producto) {
            console.error('Product not found');
            return false;
        }
        
        producto.precio = Math.max(0, producto.precio + ajuste);
        producto.fechaModificacion = new Date().toISOString();
        
        this.guardarEnLocalStorage();
        this.mostrarProductos();
        
        return producto;
    }

    /**
     * Get product by ID
     */
    obtenerProducto(id) {
        return this.productos.find(p => p.id === id);
    }

    /**
     * Export inventory to JSON file
     */
    exportarJSON() {
        const data = {
            productos: this.productos,
            fechaExportacion: new Date().toISOString(),
            version: '1.0'
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `almacen_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Inventory exported successfully');
        return true;
    }

    /**
     * Import inventory from JSON file
     */
    async importarJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate JSON structure
                    if (!data.productos || !Array.isArray(data.productos)) {
                        throw new Error('Formato JSON inválido. Debe contener un array "productos".');
                    }
                    
                    // Validate each product
                    const productosValidos = data.productos.filter(p => {
                        return p.nombre && 
                               typeof p.cantidad === 'number' && 
                               typeof p.precio === 'number';
                    });
                    
                    if (productosValidos.length === 0) {
                        throw new Error('No se encontraron productos válidos en el archivo.');
                    }
                    
                    // Add IDs if missing
                    this.productos = productosValidos.map((p, index) => ({
                        id: p.id || Date.now() + index,
                        nombre: p.nombre,
                        cantidad: parseInt(p.cantidad, 10),
                        precio: parseFloat(p.precio),
                        fechaCreacion: p.fechaCreacion || new Date().toISOString(),
                        fechaModificacion: p.fechaModificacion
                    }));
                    
                    this.guardarEnLocalStorage();
                    this.mostrarProductos();
                    
                    console.log(`Imported ${this.productos.length} products`);
                    resolve(this.productos.length);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Clear entire inventory
     */
    limpiarInventario() {
        this.productos = [];
        this.guardarEnLocalStorage();
        this.mostrarProductos();
        console.log('Inventory cleared');
        return true;
    }

    /**
     * Check if product already exists (case-insensitive)
     */
    productoExiste(nombre) {
        return this.productos.some(p => 
            p.nombre.toLowerCase() === nombre.toLowerCase()
        );
    }

    /**
     * Save products to localStorage
     */
    guardarEnLocalStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.productos));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    /**
     * Load products from localStorage or JSON file
     */
    async cargarDesdeLocalStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            
            if (data) {
                this.productos = JSON.parse(data);
                console.log('Products loaded from localStorage');
            } else {
                // Load from JSON file if localStorage is empty
                await this.cargarDesdeJSON();
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            await this.cargarDesdeJSON();
        }
    }

    /**
     * Load products from JSON file
     */
    async cargarDesdeJSON() {
        try {
            const response = await fetch('almacen.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.productos = data.productos || [];
            this.guardarEnLocalStorage();
            console.log('Products loaded from almacen.json');
        } catch (error) {
            console.error('Error loading almacen.json:', error);
            // Initialize with empty array if file doesn't exist
            this.productos = [];
        }
    }

    /**
     * Display products in the table
     */
    mostrarProductos() {
        const tbody = document.querySelector('#productosTable tbody');
        
        if (!tbody) {
            console.error('Table body not found');
            return;
        }

        // Clear existing rows
        tbody.innerHTML = '';

        // Add each product as a row
        this.productos.forEach(producto => {
            const row = this.crearFilaProducto(producto);
            tbody.appendChild(row);
        });
        
        // Update summary statistics
        this.actualizarResumen();
    }

    /**
     * Calculate and update inventory summary
     */
    actualizarResumen() {
        // Total number of different products
        const totalProductos = this.productos.length;
        
        // Total units in stock (sum of all quantities)
        const unidadesTotales = this.productos.reduce((sum, p) => sum + p.cantidad, 0);
        
        // Total inventory value (sum of price * quantity for each product)
        const valorTotal = this.productos.reduce((sum, p) => {
            return sum + (p.precio * p.cantidad);
        }, 0);
        
        // Update DOM elements
        const totalProductosEl = document.getElementById('totalProductos');
        const unidadesTotalesEl = document.getElementById('unidadesTotales');
        const valorTotalEl = document.getElementById('valorTotal');
        
        if (totalProductosEl) {
            totalProductosEl.textContent = totalProductos;
            this.animarCambio(totalProductosEl);
        }
        
        if (unidadesTotalesEl) {
            unidadesTotalesEl.textContent = unidadesTotales.toLocaleString('es-ES');
            this.animarCambio(unidadesTotalesEl);
        }
        
        if (valorTotalEl) {
            valorTotalEl.textContent = this.formatearPrecio(valorTotal);
            this.animarCambio(valorTotalEl);
        }
    }

    /**
     * Create a table row for a product
     */
    crearFilaProducto(producto) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${this.escaparHTML(producto.nombre)}</td>
            <td>
                <div class="quantity-cell">
                    <span class="value-display">${producto.cantidad}</span>
                    <div class="quick-controls">
                        <button class="btn-quick decrease" data-id="${producto.id}" data-action="cantidad-menos" title="Reducir cantidad" aria-label="Reducir cantidad">-</button>
                        <button class="btn-quick increase" data-id="${producto.id}" data-action="cantidad-mas" title="Aumentar cantidad" aria-label="Aumentar cantidad">+</button>
                    </div>
                </div>
            </td>
            <td>
                <div class="price-cell">
                    <span class="value-display">${this.formatearPrecio(producto.precio)}</span>
                    <div class="quick-controls">
                        <button class="btn-quick decrease" data-id="${producto.id}" data-action="precio-menos" title="Reducir precio €1" aria-label="Reducir precio">-</button>
                        <button class="btn-quick increase" data-id="${producto.id}" data-action="precio-mas" title="Aumentar precio €1" aria-label="Aumentar precio">+</button>
                    </div>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" data-id="${producto.id}" aria-label="Editar ${this.escaparHTML(producto.nombre)}">
                        ✏️ Editar
                    </button>
                    <button class="btn-delete" data-id="${producto.id}" aria-label="Eliminar ${this.escaparHTML(producto.nombre)}">
                        🗑️ Eliminar
                    </button>
                </div>
            </td>
        `;
        
        // Add data attribute for potential future use
        row.dataset.productId = producto.id;
        
        // Add event listeners for all buttons
        this.agregarEventListenersAFila(row, producto);
        
        return row;
    }

    /**
     * Add event listeners to row buttons
     */
    agregarEventListenersAFila(row, producto) {
        // Edit button
        const editBtn = row.querySelector('.btn-edit');
        editBtn?.addEventListener('click', () => this.manejarEdicion(producto, row));
        
        // Delete button
        const deleteBtn = row.querySelector('.btn-delete');
        deleteBtn?.addEventListener('click', () => this.manejarEliminacion(producto));
        
        // Quick control buttons
        const quickBtns = row.querySelectorAll('.btn-quick');
        quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = parseInt(btn.dataset.id, 10);
                this.manejarAjusteRapido(id, action, row);
            });
        });
    }

    /**
     * Handle quick adjustments (stock and price)
     */
    manejarAjusteRapido(id, action, row) {
        let resultado;
        
        switch(action) {
            case 'cantidad-mas':
                resultado = this.ajustarCantidad(id, 1);
                this.animarCambio(row.querySelector('.quantity-cell .value-display'));
                break;
            case 'cantidad-menos':
                resultado = this.ajustarCantidad(id, -1);
                this.animarCambio(row.querySelector('.quantity-cell .value-display'));
                break;
            case 'precio-mas':
                resultado = this.ajustarPrecio(id, 1);
                this.animarCambio(row.querySelector('.price-cell .value-display'));
                break;
            case 'precio-menos':
                resultado = this.ajustarPrecio(id, -1);
                this.animarCambio(row.querySelector('.price-cell .value-display'));
                break;
        }
        
        if (resultado) {
            console.log(`Quick adjustment applied: ${action}`);
        }
    }

    /**
     * Animate value change
     */
    animarCambio(element) {
        if (element) {
            element.classList.remove('value-updated');
            // Force reflow
            void element.offsetWidth;
            element.classList.add('value-updated');
        }
    }

    /**
     * Handle product editing
     */
    manejarEdicion(producto, row) {
        // Check if already editing
        if (document.querySelector('.edit-row')) {
            alert('Ya hay un producto en edición. Guarde o cancele primero.');
            return;
        }
        
        // Get edit row template
        const template = document.getElementById('editRowTemplate');
        if (!template) {
            console.error('Edit template not found');
            return;
        }
        
        // Clone template
        const editRow = template.content.cloneNode(true).querySelector('tr');
        
        // Fill with current values
        editRow.querySelector('.edit-nombre').value = producto.nombre;
        editRow.querySelector('.edit-cantidad').value = producto.cantidad;
        editRow.querySelector('.edit-precio').value = producto.precio;
        
        // Store original row and product ID
        editRow.dataset.productId = producto.id;
        editRow.dataset.originalRowIndex = Array.from(row.parentNode.children).indexOf(row);
        
        // Add event listeners
        const saveBtn = editRow.querySelector('.btn-save');
        const cancelBtn = editRow.querySelector('.btn-cancel');
        
        saveBtn.addEventListener('click', () => this.guardarEdicion(editRow, row));
        cancelBtn.addEventListener('click', () => this.cancelarEdicion(editRow, row));
        
        // Handle Enter key to save
        editRow.querySelectorAll('input').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.guardarEdicion(editRow, row);
                } else if (e.key === 'Escape') {
                    this.cancelarEdicion(editRow, row);
                }
            });
        });
        
        // Replace row with edit row
        row.replaceWith(editRow);
        
        // Focus first input
        editRow.querySelector('.edit-nombre').focus();
    }

    /**
     * Save product edit
     */
    guardarEdicion(editRow, originalRow) {
        const id = parseInt(editRow.dataset.productId, 10);
        const nombre = editRow.querySelector('.edit-nombre').value.trim();
        const cantidad = editRow.querySelector('.edit-cantidad').value;
        const precio = editRow.querySelector('.edit-precio').value;
        
        // Validate
        if (!nombre || nombre.length < 3) {
            alert('El nombre del producto debe tener al menos 3 caracteres.');
            editRow.querySelector('.edit-nombre').focus();
            return;
        }
        
        if (!cantidad || !precio) {
            alert('Cantidad y precio son obligatorios.');
            return;
        }
        
        const cantidadNum = parseInt(cantidad, 10);
        const precioNum = parseFloat(precio);
        
        if (isNaN(cantidadNum) || isNaN(precioNum)) {
            alert('Cantidad y precio deben ser números válidos.');
            return;
        }
        
        if (precioNum < 0) {
            alert('El precio no puede ser negativo.');
            editRow.querySelector('.edit-precio').focus();
            return;
        }
        
        // Check if name already exists (excluding current product)
        const producto = this.obtenerProducto(id);
        if (nombre.toLowerCase() !== producto.nombre.toLowerCase()) {
            if (this.productoExiste(nombre)) {
                alert(`El producto "${nombre}" ya existe en el almacén.`);
                editRow.querySelector('.edit-nombre').focus();
                return;
            }
        }
        
        // Update product
        const resultado = this.actualizarProducto(id, {
            nombre,
            cantidad: cantidadNum,
            precio: precioNum
        });
        
        if (resultado) {
            console.log(`Product "${nombre}" updated successfully`);
        }
    }

    /**
     * Cancel product edit
     */
    cancelarEdicion(editRow, originalRow) {
        // Simply refresh the table
        this.mostrarProductos();
    }

    /**
     * Handle product deletion with confirmation
     */
    manejarEliminacion(producto) {
        const confirmacion = confirm(
            `¿Está seguro de que desea eliminar el producto "${producto.nombre}"?\n\n` +
            `Cantidad: ${producto.cantidad}\n` +
            `Precio: ${this.formatearPrecio(producto.precio)}`
        );
        
        if (confirmacion) {
            // Find the row and add animation
            const row = document.querySelector(`tr[data-product-id="${producto.id}"]`);
            
            if (row) {
                row.classList.add('deleting');
                
                // Wait for animation to complete before removing
                setTimeout(() => {
                    const productoEliminado = this.eliminarProducto(producto.id);
                    
                    if (productoEliminado) {
                        console.log(`Product "${productoEliminado.nombre}" deleted successfully`);
                    }
                }, 300); // Match animation duration
            } else {
                // If row not found, delete immediately
                this.eliminarProducto(producto.id);
            }
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escaparHTML(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    /**
     * Format price with currency symbol
     */
    formatearPrecio(precio) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(precio);
    }
}

/**
 * Form validation and submission handler
 */
class FormularioProducto {
    constructor(almacen) {
        this.almacen = almacen;
        this.form = document.getElementById('productForm');
        this.productInput = document.getElementById('product');
        this.quantityInput = document.getElementById('quantity');
        this.priceInput = document.getElementById('price');
        
        this.inicializarEventos();
    }

    inicializarEventos() {
        if (!this.form) {
            console.error('Form not found');
            return;
        }

        // Handle form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validarYEnviar();
        });

        // Real-time validation
        this.productInput?.addEventListener('input', () => {
            this.validarProducto();
        });

        this.priceInput?.addEventListener('input', () => {
            this.validarPrecio();
        });
    }

    validarProducto() {
        const value = this.productInput.value.trim();
        
        if (value.length > 0 && value.length < 3) {
            this.productInput.setCustomValidity('El producto debe tener al menos 3 caracteres');
            return false;
        }
        
        this.productInput.setCustomValidity('');
        return true;
    }

    validarPrecio() {
        const value = parseFloat(this.priceInput.value);
        
        if (!isNaN(value) && value < 0) {
            this.priceInput.setCustomValidity('El precio no puede ser negativo');
            return false;
        }
        
        this.priceInput.setCustomValidity('');
        return true;
    }

    validarYEnviar() {
        // Get values
        const product = this.productInput.value.trim();
        const quantity = this.quantityInput.value;
        const price = this.priceInput.value;

        // Validate all fields are filled
        if (!product || !quantity || !price) {
            this.mostrarAlerta('Por favor, complete todos los campos.', 'error');
            return false;
        }

        // Validate product name length
        if (product.length < 3) {
            this.mostrarAlerta('El nombre del producto debe tener al menos 3 caracteres.', 'error');
            this.productInput.focus();
            return false;
        }

        // Parse numeric values
        const cantidadNum = parseInt(quantity, 10);
        const precioNum = parseFloat(price);

        // Validate numeric values
        if (isNaN(cantidadNum) || isNaN(precioNum)) {
            this.mostrarAlerta('Cantidad y precio deben ser números válidos.', 'error');
            return false;
        }

        // Validate price is not negative
        if (precioNum < 0) {
            this.mostrarAlerta('El precio no puede ser negativo.', 'error');
            this.priceInput.focus();
            return false;
        }

        // Check if product already exists
        if (this.almacen.productoExiste(product)) {
            this.mostrarAlerta(`El producto "${product}" ya existe en el almacén.`, 'warning');
            this.productInput.focus();
            return false;
        }

        // Confirm if quantity is negative
        if (cantidadNum < 0) {
            if (!confirm('¿Está seguro de que desea agregar una cantidad negativa?')) {
                return false;
            }
        }

        // Add product
        try {
            this.almacen.agregarProducto(product, precioNum, cantidadNum);
            this.mostrarAlerta(`Producto "${product}" agregado exitosamente.`, 'success');
            this.form.reset();
            this.productInput.focus();
        } catch (error) {
            console.error('Error adding product:', error);
            this.mostrarAlerta('Error al agregar el producto. Inténtelo de nuevo.', 'error');
        }

        return false;
    }

    mostrarAlerta(mensaje, tipo = 'info') {
        // You can replace this with a custom alert/toast component
        const estilos = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        const icono = estilos[tipo] || estilos.info;
        alert(`${icono} ${mensaje}`);
    }
}

/**
 * Menu handler for import/export/clear operations
 */
class MenuHandler {
    constructor(almacen) {
        this.almacen = almacen;
        this.menuToggle = document.getElementById('menuToggle');
        this.menuDropdown = document.getElementById('menuDropdown');
        this.fileInput = document.getElementById('fileInput');
        
        this.inicializarEventos();
    }

    inicializarEventos() {
        // Toggle menu
        this.menuToggle?.addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('header')) {
                this.closeMenu();
            }
        });
        
        // Import JSON
        document.getElementById('importarJson')?.addEventListener('click', () => {
            this.closeMenu();
            this.importarJSON();
        });
        
        // Export JSON
        document.getElementById('exportarJson')?.addEventListener('click', () => {
            this.closeMenu();
            this.exportarJSON();
        });
        
        // Clear inventory
        document.getElementById('limpiarInventario')?.addEventListener('click', () => {
            this.closeMenu();
            this.limpiarInventario();
        });
        
        // File input change
        this.fileInput?.addEventListener('change', (e) => {
            this.procesarArchivoImportado(e);
        });
    }

    toggleMenu() {
        const isActive = this.menuDropdown.classList.toggle('active');
        this.menuToggle.classList.toggle('active');
        this.menuToggle.setAttribute('aria-expanded', isActive);
    }

    closeMenu() {
        this.menuDropdown.classList.remove('active');
        this.menuToggle.classList.remove('active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
    }

    importarJSON() {
        this.fileInput.click();
    }

    async procesarArchivoImportado(e) {
        const file = e.target.files[0];
        
        if (!file) return;
        
        if (!file.name.endsWith('.json')) {
            alert('Por favor, seleccione un archivo JSON válido.');
            return;
        }
        
        try {
            const count = await this.almacen.importarJSON(file);
            alert(`✓ Importación exitosa!\n\n${count} productos importados correctamente.`);
        } catch (error) {
            console.error('Import error:', error);
            alert(`✗ Error al importar:\n\n${error.message}`);
        } finally {
            // Reset file input
            this.fileInput.value = '';
        }
    }

    exportarJSON() {
        if (this.almacen.productos.length === 0) {
            alert('No hay productos para exportar.');
            return;
        }
        
        try {
            this.almacen.exportarJSON();
            alert(`✓ Exportación exitosa!\n\n${this.almacen.productos.length} productos exportados.`);
        } catch (error) {
            console.error('Export error:', error);
            alert(`✗ Error al exportar:\n\n${error.message}`);
        }
    }

    limpiarInventario() {
        if (this.almacen.productos.length === 0) {
            alert('El inventario ya está vacío.');
            return;
        }
        
        const count = this.almacen.productos.length;
        const confirmacion = confirm(
            `⚠️ ADVERTENCIA\n\n` +
            `Está a punto de eliminar TODOS los productos del inventario.\n\n` +
            `Total de productos: ${count}\n\n` +
            `Esta acción NO se puede deshacer.\n\n` +
            `¿Desea continuar?`
        );
        
        if (confirmacion) {
            // Double confirmation for safety
            const doubleCheck = confirm(
                `¿Está COMPLETAMENTE seguro?\n\n` +
                `Se eliminarán ${count} productos permanentemente.`
            );
            
            if (doubleCheck) {
                this.almacen.limpiarInventario();
                alert(`✓ Inventario limpiado correctamente.\n\n${count} productos eliminados.`);
            }
        }
    }
}

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create warehouse instance
        const almacen = new Almacen();
        
        // Load products
        await almacen.cargarDesdeLocalStorage();
        
        // Display products
        almacen.mostrarProductos();
        
        // Initialize form
        const formulario = new FormularioProducto(almacen);
        
        // Initialize menu
        const menu = new MenuHandler(almacen);
        
        console.log('Warehouse application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});
