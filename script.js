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
    }

    /**
     * Create a table row for a product
     */
    crearFilaProducto(producto) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${this.escaparHTML(producto.nombre)}</td>
            <td>${producto.cantidad}</td>
            <td>${this.formatearPrecio(producto.precio)}</td>
        `;
        
        // Add data attribute for potential future use
        row.dataset.productId = producto.id;
        
        return row;
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
        
        console.log('Warehouse application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});
