// ============================================================================
// SISTEMA DE GESTIÓN DE ALMACÉN - WAREHOUSE MANAGEMENT SYSTEM
// ============================================================================

/**
 * Clase principal que maneja toda la lógica del almacén
 * Gestiona productos, filtros, búsqueda y persistencia de datos
 */
class Almacen {
    constructor() {
        this.productos = [];              // Array principal con todos los productos
        this.productosFiltrados = [];     // Array con productos después de aplicar filtros
        this.storageKey = 'almacen';      // Clave para localStorage
        
        // Configuración inicial de filtros
        this.filtrosActivos = {
            busqueda: '',
            ordenar: 'nombre-asc',
            precioMin: 0,
            precioMax: 1000,
            cantidadMin: 0,
            cantidadMax: 500,
            enStock: true,
            sinStock: true,
            stockCritico: true
        };
    }

    // ========================================================================
    // MÉTODOS DE GESTIÓN DE PRODUCTOS (CRUD)
    // ========================================================================

    /**
     * Agrega un nuevo producto al almacén
     * @param {string} nombre - Nombre del producto
     * @param {number} precio - Precio unitario
     * @param {number} cantidad - Cantidad en stock
     * @returns {Object} El producto creado
     */
    agregarProducto(nombre, precio, cantidad) {
        const nuevoProducto = {
            id: Date.now(),                       // ID único basado en timestamp
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
     * Actualiza todos los campos de un producto existente
     * @param {number} id - ID del producto a actualizar
     * @param {Object} nuevosDatos - Objeto con nombre, cantidad y precio
     * @returns {Object|boolean} El producto actualizado o false si no existe
     */
    actualizarProducto(id, nuevosDatos) {
        const index = this.productos.findIndex(p => p.id === id);
        
        if (index === -1) {
            console.error('Product not found');
            return false;
        }
        
        // Mantiene el ID y fechaCreacion originales, actualiza el resto
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
     * Elimina un producto del almacén
     * @param {number} id - ID del producto a eliminar
     * @returns {Object|boolean} El producto eliminado o false si no existe
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

    // ========================================================================
    // MÉTODOS DE AJUSTE RÁPIDO (BOTONES +/-)
    // ========================================================================

    /**
     * Incrementa o decrementa la cantidad de un producto
     * @param {number} id - ID del producto
     * @param {number} ajuste - Cantidad a sumar (positivo) o restar (negativo)
     * @returns {Object|boolean} El producto actualizado o false si no existe
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
     * Incrementa o decrementa el precio de un producto
     * Nunca permite precios negativos (mínimo 0)
     * @param {number} id - ID del producto
     * @param {number} ajuste - Cantidad a sumar o restar al precio
     * @returns {Object|boolean} El producto actualizado o false si no existe
     */
    ajustarPrecio(id, ajuste) {
        const producto = this.productos.find(p => p.id === id);
        
        if (!producto) {
            console.error('Product not found');
            return false;
        }
        
        // Math.max asegura que el precio nunca sea negativo
        producto.precio = Math.max(0, producto.precio + ajuste);
        producto.fechaModificacion = new Date().toISOString();
        
        this.guardarEnLocalStorage();
        this.mostrarProductos();
        
        return producto;
    }

    // ========================================================================
    // MÉTODOS DE PERSISTENCIA (LOCALSTORAGE Y JSON)
    // ========================================================================

    /**
     * Guarda el array de productos en localStorage
     * @returns {boolean} true si se guardó correctamente, false en caso de error
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
     * Carga productos desde localStorage o desde el archivo JSON inicial
     * @returns {Promise} Promesa que se resuelve cuando se cargan los datos
     */
    async cargarDesdeLocalStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            
            if (data) {
                this.productos = JSON.parse(data);
                console.log('Products loaded from localStorage');
            } else {
                // Si no hay datos en localStorage, intenta cargar desde JSON
                await this.cargarDesdeJSON();
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            await this.cargarDesdeJSON();
        }
    }

    /**
     * Carga productos desde el archivo almacen.json
     * Se usa como fallback si localStorage está vacío
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
            // Si falla, inicializa con array vacío
            this.productos = [];
        }
    }

    /**
     * Exporta el inventario completo a un archivo JSON descargable
     * El archivo incluye metadatos como fecha de exportación y versión
     * @returns {boolean} true si la exportación fue exitosa
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
        
        // Crea un link temporal para descargar el archivo
        const link = document.createElement('a');
        link.href = url;
        link.download = `almacen_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Libera memoria
        
        console.log('Inventory exported successfully');
        return true;
    }

    /**
     * Importa productos desde un archivo JSON
     * Valida la estructura y los datos antes de importar
     * @param {File} file - Archivo JSON a importar
     * @returns {Promise<number>} Número de productos importados
     */
    async importarJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Valida que el JSON tenga la estructura correcta
                    if (!data.productos || !Array.isArray(data.productos)) {
                        throw new Error('Formato JSON inválido. Debe contener un array "productos".');
                    }
                    
                    // Filtra solo productos con datos válidos
                    const productosValidos = data.productos.filter(p => {
                        return p.nombre && 
                               typeof p.cantidad === 'number' && 
                               typeof p.precio === 'number';
                    });
                    
                    if (productosValidos.length === 0) {
                        throw new Error('No se encontraron productos válidos en el archivo.');
                    }
                    
                    // Asigna IDs únicos si no existen
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
     * Elimina todos los productos del inventario
     * @returns {boolean} true si se limpió correctamente
     */
    limpiarInventario() {
        this.productos = [];
        this.guardarEnLocalStorage();
        this.mostrarProductos();
        console.log('Inventory cleared');
        return true;
    }

    // ========================================================================
    // MÉTODOS DE BÚSQUEDA Y FILTRADO
    // ========================================================================

    /**
     * Aplica todos los filtros activos sobre el array de productos
     * Actualiza this.productosFiltrados con los resultados
     */
    aplicarFiltros() {
        let resultados = [...this.productos];
        
        // FILTRO 1: Búsqueda por nombre (case-insensitive)
        if (this.filtrosActivos.busqueda) {
            const busqueda = this.filtrosActivos.busqueda.toLowerCase();
            resultados = resultados.filter(p => 
                p.nombre.toLowerCase().includes(busqueda)
            );
        }
        
        // FILTRO 2: Rango de precios
        resultados = resultados.filter(p => 
            p.precio >= this.filtrosActivos.precioMin && 
            p.precio <= this.filtrosActivos.precioMax
        );
        
        // FILTRO 3: Rango de cantidades
        resultados = resultados.filter(p => 
            p.cantidad >= this.filtrosActivos.cantidadMin && 
            p.cantidad <= this.filtrosActivos.cantidadMax
        );
        
        // FILTRO 4: Estado del stock (checkboxes)
        resultados = resultados.filter(p => {
            const enStock = p.cantidad > 0;
            const sinStock = p.cantidad === 0;
            const stockCritico = p.cantidad > 0 && p.cantidad < 10;
            
            // Si el producto está en stock pero el filtro está desactivado
            if (enStock && !stockCritico && !this.filtrosActivos.enStock) return false;
            // Si el producto no tiene stock pero el filtro está desactivado
            if (sinStock && !this.filtrosActivos.sinStock) return false;
            // Si el producto tiene stock crítico pero el filtro está desactivado
            if (stockCritico && !this.filtrosActivos.stockCritico) return false;
            
            return true;
        });
        
        // Aplica el ordenamiento seleccionado
        this.ordenarProductos(resultados);
        
        this.productosFiltrados = resultados;
    }

    /**
     * Ordena un array de productos según el criterio seleccionado
     * @param {Array} productos - Array a ordenar (se modifica in-place)
     */
    ordenarProductos(productos) {
        const [campo, direccion] = this.filtrosActivos.ordenar.split('-');
        
        productos.sort((a, b) => {
            let valorA, valorB;
            
            if (campo === 'nombre') {
                // Ordenamiento alfabético (case-insensitive)
                valorA = a.nombre.toLowerCase();
                valorB = b.nombre.toLowerCase();
                return direccion === 'asc' 
                    ? valorA.localeCompare(valorB)
                    : valorB.localeCompare(valorA);
            } else {
                // Ordenamiento numérico (precio o cantidad)
                valorA = a[campo];
                valorB = b[campo];
                return direccion === 'asc'
                    ? valorA - valorB
                    : valorB - valorA;
            }
        });
    }

    /**
     * Actualiza un filtro específico y refresca la vista
     * @param {string} filtro - Nombre del filtro a actualizar
     * @param {*} valor - Nuevo valor del filtro
     */
    actualizarFiltro(filtro, valor) {
        this.filtrosActivos[filtro] = valor;
        this.mostrarProductos();
    }

    /**
     * Resetea todos los filtros a sus valores por defecto
     */
    resetearFiltros() {
        this.filtrosActivos = {
            busqueda: '',
            ordenar: 'nombre-asc',
            precioMin: 0,
            precioMax: 1000,
            cantidadMin: 0,
            cantidadMax: 500,
            enStock: true,
            sinStock: true,
            stockCritico: true
        };
        this.mostrarProductos();
    }

    // ========================================================================
    // MÉTODOS DE RENDERIZADO DE LA INTERFAZ
    // ========================================================================

    /**
     * Renderiza la tabla completa de productos
     * Aplica filtros, limpia la tabla y vuelve a llenarla con los productos filtrados
     */
    mostrarProductos() {
        const tbody = document.querySelector('#productosTable tbody');
        
        if (!tbody) {
            console.error('Table body not found');
            return;
        }

        // Aplica todos los filtros activos
        this.aplicarFiltros();

        // Limpia todas las filas existentes
        tbody.innerHTML = '';

        // Crea y agrega una fila por cada producto filtrado
        this.productosFiltrados.forEach(producto => {
            const row = this.crearFilaProducto(producto);
            tbody.appendChild(row);
        });
        
        // Actualiza las estadísticas del resumen
        this.actualizarResumen();
        
        // Actualiza el contador de resultados de búsqueda
        this.actualizarContador();
    }

    /**
     * Crea un elemento <tr> con todos los datos y controles de un producto
     * @param {Object} producto - Objeto producto con sus propiedades
     * @returns {HTMLElement} Elemento <tr> listo para insertar en la tabla
     */
    crearFilaProducto(producto) {
        const row = document.createElement('tr');
        
        // Estructura HTML de la fila con controles de cantidad, precio y acciones
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
        
        // Almacena el ID en un data attribute para acceso rápido
        row.dataset.productId = producto.id;
        
        // Añade los event listeners a todos los botones de la fila
        this.agregarEventListenersAFila(row, producto);
        
        return row;
    }

    /**
     * Añade event listeners a todos los botones de una fila de producto
     * @param {HTMLElement} row - Elemento <tr> de la fila
     * @param {Object} producto - Objeto producto asociado a la fila
     */
    agregarEventListenersAFila(row, producto) {
        // Botón de editar
        const editBtn = row.querySelector('.btn-edit');
        editBtn?.addEventListener('click', () => this.manejarEdicion(producto, row));
        
        // Botón de eliminar
        const deleteBtn = row.querySelector('.btn-delete');
        deleteBtn?.addEventListener('click', () => this.manejarEliminacion(producto));
        
        // Botones de ajuste rápido (+/- en cantidad y precio)
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
     * Maneja los clics en los botones de ajuste rápido (+/-)
     * @param {number} id - ID del producto a ajustar
     * @param {string} action - Tipo de acción (cantidad-mas, cantidad-menos, precio-mas, precio-menos)
     * @param {HTMLElement} row - Fila del producto para animar el cambio
     */
    manejarAjusteRapido(id, action, row) {
        let resultado;
        let elemento;
        
        switch(action) {
            case 'cantidad-mas':
                resultado = this.ajustarCantidad(id, 1);
                elemento = row.querySelector('.quantity-cell .value-display');
                break;
            case 'cantidad-menos':
                resultado = this.ajustarCantidad(id, -1);
                elemento = row.querySelector('.quantity-cell .value-display');
                break;
            case 'precio-mas':
                resultado = this.ajustarPrecio(id, 1);
                elemento = row.querySelector('.price-cell .value-display');
                break;
            case 'precio-menos':
                resultado = this.ajustarPrecio(id, -1);
                elemento = row.querySelector('.price-cell .value-display');
                break;
        }
        
        if (resultado && elemento) {
            this.animarCambio(elemento);
            console.log(`Quick adjustment applied: ${action}`);
        }
    }

    /**
     * Aplica una animación de resaltado a un elemento
     * @param {HTMLElement} element - Elemento a animar
     */
    animarCambio(element) {
        if (element) {
            element.classList.remove('value-updated');
            void element.offsetWidth; // Fuerza un reflow para reiniciar la animación
            element.classList.add('value-updated');
        }
    }

    /**
     * Activa el modo de edición para un producto
     * Reemplaza la fila normal por una fila con inputs editables
     * @param {Object} producto - Producto a editar
     * @param {HTMLElement} row - Fila actual que será reemplazada
     */
    manejarEdicion(producto, row) {
        // Previene múltiples ediciones simultáneas
        if (document.querySelector('.edit-row')) {
            alert('Ya hay un producto en edición. Guarde o cancele primero.');
            return;
        }
        
        const template = document.getElementById('editRowTemplate');
        if (!template) {
            console.error('Edit template not found');
            return;
        }
        
        // Clona la plantilla de edición
        const editRow = template.content.cloneNode(true).querySelector('tr');
        
        // Rellena los inputs con los valores actuales
        editRow.querySelector('.edit-nombre').value = producto.nombre;
        editRow.querySelector('.edit-cantidad').value = producto.cantidad;
        editRow.querySelector('.edit-precio').value = producto.precio;
        
        // Guarda información necesaria para cancelar o guardar
        editRow.dataset.productId = producto.id;
        
        // Event listeners para los botones de guardar y cancelar
        const saveBtn = editRow.querySelector('.btn-save');
        const cancelBtn = editRow.querySelector('.btn-cancel');
        
        saveBtn.addEventListener('click', () => this.guardarEdicion(editRow));
        cancelBtn.addEventListener('click', () => this.cancelarEdicion());
        
        // Permite guardar con Enter y cancelar con Escape
        editRow.querySelectorAll('input').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.guardarEdicion(editRow);
                } else if (e.key === 'Escape') {
                    this.cancelarEdicion();
                }
            });
        });
        
        // Reemplaza la fila normal por la fila de edición
        row.replaceWith(editRow);
        
        // Hace foco en el primer input
        editRow.querySelector('.edit-nombre').focus();
    }

    /**
     * Guarda los cambios realizados en modo edición
     * Valida los datos antes de actualizar el producto
     * @param {HTMLElement} editRow - Fila en modo edición
     */
    guardarEdicion(editRow) {
        const id = parseInt(editRow.dataset.productId, 10);
        const nombre = editRow.querySelector('.edit-nombre').value.trim();
        const cantidad = editRow.querySelector('.edit-cantidad').value;
        const precio = editRow.querySelector('.edit-precio').value;
        
        // Validaciones
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
        
        // Verifica que el nombre no esté duplicado (excepto el producto actual)
        const producto = this.obtenerProducto(id);
        if (nombre.toLowerCase() !== producto.nombre.toLowerCase()) {
            if (this.productoExiste(nombre)) {
                alert(`El producto "${nombre}" ya existe en el almacén.`);
                editRow.querySelector('.edit-nombre').focus();
                return;
            }
        }
        
        // Actualiza el producto
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
     * Cancela el modo de edición y vuelve a mostrar la tabla normal
     */
    cancelarEdicion() {
        this.mostrarProductos();
    }

    /**
     * Maneja la eliminación de un producto con confirmación
     * @param {Object} producto - Producto a eliminar
     */
    manejarEliminacion(producto) {
        const confirmacion = confirm(
            `¿Está seguro de que desea eliminar el producto "${producto.nombre}"?\n\n` +
            `Cantidad: ${producto.cantidad}\n` +
            `Precio: ${this.formatearPrecio(producto.precio)}`
        );
        
        if (confirmacion) {
            // Busca la fila en el DOM y le aplica animación de salida
            const row = document.querySelector(`tr[data-product-id="${producto.id}"]`);
            
            if (row) {
                row.classList.add('deleting');
                
                // Espera a que termine la animación antes de eliminar
                setTimeout(() => {
                    const productoEliminado = this.eliminarProducto(producto.id);
                    
                    if (productoEliminado) {
                        console.log(`Product "${productoEliminado.nombre}" deleted successfully`);
                    }
                }, 300);
            } else {
                // Si no se encuentra la fila, elimina inmediatamente
                this.eliminarProducto(producto.id);
            }
        }
    }

    // ========================================================================
    // MÉTODOS DE ESTADÍSTICAS Y RESUMEN
    // ========================================================================

    /**
     * Calcula y actualiza las estadísticas del inventario
     * Muestra: total de productos, unidades totales y valor total
     */
    actualizarResumen() {
        // Total de productos diferentes
        const totalProductos = this.productos.length;
        
        // Suma de todas las cantidades
        const unidadesTotales = this.productos.reduce((sum, p) => sum + p.cantidad, 0);
        
        // Valor total del inventario (precio × cantidad para cada producto)
        const valorTotal = this.productos.reduce((sum, p) => {
            return sum + (p.precio * p.cantidad);
        }, 0);
        
        // Actualiza los elementos del DOM
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
     * Actualiza el contador de resultados de búsqueda
     * Muestra "X de Y productos"
     */
    actualizarContador() {
        const shownCount = document.getElementById('shownCount');
        const totalCount = document.getElementById('totalCount');
        
        if (shownCount) shownCount.textContent = this.productosFiltrados.length;
        if (totalCount) totalCount.textContent = this.productos.length;
    }

    // ========================================================================
    // MÉTODOS AUXILIARES
    // ========================================================================

    /**
     * Obtiene un producto por su ID
     * @param {number} id - ID del producto a buscar
     * @returns {Object|undefined} El producto encontrado o undefined
     */
    obtenerProducto(id) {
        return this.productos.find(p => p.id === id);
    }

    /**
     * Verifica si ya existe un producto con un nombre dado (case-insensitive)
     * @param {string} nombre - Nombre a buscar
     * @returns {boolean} true si existe, false si no
     */
    productoExiste(nombre) {
        return this.productos.some(p => 
            p.nombre.toLowerCase() === nombre.toLowerCase()
        );
    }

    /**
     * Escapa caracteres HTML para prevenir inyección XSS
     * @param {string} texto - Texto a escapar
     * @returns {string} Texto seguro para insertar en HTML
     */
    escaparHTML(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    /**
     * Formatea un número como precio en euros
     * @param {number} precio - Precio a formatear
     * @returns {string} Precio formateado (ej: "12,50 €")
     */
    formatearPrecio(precio) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(precio);
    }
}

// ============================================================================
// CLASE DE MANEJO DEL FORMULARIO
// ============================================================================

/**
 * Maneja la validación y envío del formulario de agregar productos
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

    /**
     * Configura todos los event listeners del formulario
     */
    inicializarEventos() {
        if (!this.form) {
            console.error('Form not found');
            return;
        }

        // Maneja el envío del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validarYEnviar();
        });

        // Validación en tiempo real del nombre del producto
        this.productInput?.addEventListener('input', () => {
            this.validarProducto();
        });

        // Validación en tiempo real del precio
        this.priceInput?.addEventListener('input', () => {
            this.validarPrecio();
        });
    }

    /**
     * Valida el campo de nombre del producto
     * @returns {boolean} true si es válido, false si no
     */
    validarProducto() {
        const value = this.productInput.value.trim();
        
        if (value.length > 0 && value.length < 3) {
            this.productInput.setCustomValidity('El producto debe tener al menos 3 caracteres');
            return false;
        }
        
        this.productInput.setCustomValidity('');
        return true;
    }

    /**
     * Valida el campo de precio
     * @returns {boolean} true si es válido, false si no
     */
    validarPrecio() {
        const value = parseFloat(this.priceInput.value);
        
        if (!isNaN(value) && value < 0) {
            this.priceInput.setCustomValidity('El precio no puede ser negativo');
            return false;
        }
        
        this.priceInput.setCustomValidity('');
        return true;
    }

    /**
     * Valida todos los campos y agrega el producto si todo es correcto
     * @returns {boolean} true si se agregó correctamente, false si hubo errores
     */
    validarYEnviar() {
        const product = this.productInput.value.trim();
        const quantity = this.quantityInput.value;
        const price = this.priceInput.value;

        // Valida que todos los campos estén completos
        if (!product || !quantity || !price) {
            this.mostrarAlerta('Por favor, complete todos los campos.', 'error');
            return false;
        }

        // Valida longitud mínima del nombre
        if (product.length < 3) {
            this.mostrarAlerta('El nombre del producto debe tener al menos 3 caracteres.', 'error');
            this.productInput.focus();
            return false;
        }

        // Convierte a números
        const cantidadNum = parseInt(quantity, 10);
        const precioNum = parseFloat(price);

        // Valida que sean números válidos
        if (isNaN(cantidadNum) || isNaN(precioNum)) {
            this.mostrarAlerta('Cantidad y precio deben ser números válidos.', 'error');
            return false;
        }

        // Valida que el precio no sea negativo
        if (precioNum < 0) {
            this.mostrarAlerta('El precio no puede ser negativo.', 'error');
            this.priceInput.focus();
            return false;
        }

        // Verifica que el producto no esté duplicado
        if (this.almacen.productoExiste(product)) {
            this.mostrarAlerta(`El producto "${product}" ya existe en el almacén.`, 'warning');
            this.productInput.focus();
            return false;
        }

        // Confirmación si la cantidad es negativa
        if (cantidadNum < 0) {
            if (!confirm('¿Está seguro de que desea agregar una cantidad negativa?')) {
                return false;
            }
        }

        // Agrega el producto
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

    /**
     * Muestra un mensaje de alerta al usuario
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de alerta (success, error, warning, info)
     */
    mostrarAlerta(mensaje, tipo = 'info') {
        const iconos = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        const icono = iconos[tipo] || iconos.info;
        alert(`${icono} ${mensaje}`);
    }
}

// ============================================================================
// CLASE DE BÚSQUEDA Y FILTROS
// ============================================================================

/**
 * Maneja la barra de búsqueda y el panel lateral de filtros
 */
class SearchAndFilterHandler {
    constructor(almacen) {
        this.almacen = almacen;
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.toggleFiltersBtn = document.getElementById('toggleFilters');
        this.filterSidebar = document.getElementById('filterSidebar');
        this.resetFiltersBtn = document.getElementById('resetFilters');
        
        this.inicializarEventos();
    }

    /**
     * Configura todos los event listeners de búsqueda y filtros
     */
    inicializarEventos() {
        // Búsqueda en tiempo real
        this.searchInput?.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            this.almacen.actualizarFiltro('busqueda', value);
            
            // Muestra/oculta el botón de limpiar búsqueda
            if (value) {
                this.clearSearchBtn?.classList.add('visible');
            } else {
                this.clearSearchBtn?.classList.remove('visible');
            }
        });
        
        // Botón de limpiar búsqueda
        this.clearSearchBtn?.addEventListener('click', () => {
            this.searchInput.value = '';
            this.almacen.actualizarFiltro('busqueda', '');
            this.clearSearchBtn.classList.remove('visible');
            this.searchInput.focus();
        });
        
        // Toggle del panel de filtros
        this.toggleFiltersBtn?.addEventListener('click', () => {
            this.filterSidebar?.classList.toggle('active');
            this.toggleFiltersBtn?.classList.toggle('active');
        });
        
        // Selector de ordenamiento
        document.getElementById('sortSelect')?.addEventListener('change', (e) => {
            this.almacen.actualizarFiltro('ordenar', e.target.value);
        });
        
        // Inicializa los controles de rango
        this.inicializarRangoPrecio();
        this.inicializarRangoCantidad();
        
        // Checkboxes de estado del stock
        document.getElementById('filterEnStock')?.addEventListener('change', (e) => {
            this.almacen.actualizarFiltro('enStock', e.target.checked);
        });
        
        document.getElementById('filterSinStock')?.addEventListener('change', (e) => {
            this.almacen.actualizarFiltro('sinStock', e.target.checked);
        });
        
        document.getElementById('filterStockCritico')?.addEventListener('change', (e) => {
            this.almacen.actualizarFiltro('stockCritico', e.target.checked);
        });
        
        // Botón de resetear filtros
        this.resetFiltersBtn?.addEventListener('click', () => {
            this.resetearTodosFiltros();
        });
    }

    /**
     * Sincroniza inputs de texto y sliders para el filtro de precio
     * Permite que cambios en los inputs numéricos muevan los sliders y viceversa
     */
    inicializarRangoPrecio() {
        const precioMin = document.getElementById('precioMin');
        const precioMax = document.getElementById('precioMax');
        const precioRangeMin = document.getElementById('precioRangeMin');
        const precioRangeMax = document.getElementById('precioRangeMax');
        const precioMinValue = document.getElementById('precioMinValue');
        const precioMaxValue = document.getElementById('precioMaxValue');
        
        // Cambios en inputs numéricos actualizan sliders y filtros
        precioMin?.addEventListener('change', (e) => {
            const value = parseFloat(e.target.value) || 0;
            this.almacen.actualizarFiltro('precioMin', value);
            if (precioRangeMin) precioRangeMin.value = value;
            if (precioMinValue) precioMinValue.textContent = `€${value}`;
        });
        
        precioMax?.addEventListener('change', (e) => {
            const value = parseFloat(e.target.value) || 1000;
            this.almacen.actualizarFiltro('precioMax', value);
            if (precioRangeMax) precioRangeMax.value = value;
            if (precioMaxValue) precioMaxValue.textContent = `€${value}`;
        });
        
        // Cambios en sliders actualizan inputs y filtros
        precioRangeMin?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (precioMin) precioMin.value = value;
            if (precioMinValue) precioMinValue.textContent = `€${value}`;
            this.almacen.actualizarFiltro('precioMin', value);
        });
        
        precioRangeMax?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (precioMax) precioMax.value = value;
            if (precioMaxValue) precioMaxValue.textContent = `€${value}`;
            this.almacen.actualizarFiltro('precioMax', value);
        });
    }

    /**
     * Sincroniza inputs de texto y sliders para el filtro de cantidad
     */
    inicializarRangoCantidad() {
        const cantidadMin = document.getElementById('cantidadMin');
        const cantidadMax = document.getElementById('cantidadMax');
        const cantidadRangeMin = document.getElementById('cantidadRangeMin');
        const cantidadRangeMax = document.getElementById('cantidadRangeMax');
        const cantidadMinValue = document.getElementById('cantidadMinValue');
        const cantidadMaxValue = document.getElementById('cantidadMaxValue');
        
        cantidadMin?.addEventListener('change', (e) => {
            const value = parseInt(e.target.value, 10) || 0;
            this.almacen.actualizarFiltro('cantidadMin', value);
            if (cantidadRangeMin) cantidadRangeMin.value = value;
            if (cantidadMinValue) cantidadMinValue.textContent = value;
        });
        
        cantidadMax?.addEventListener('change', (e) => {
            const value = parseInt(e.target.value, 10) || 500;
            this.almacen.actualizarFiltro('cantidadMax', value);
            if (cantidadRangeMax) cantidadRangeMax.value = value;
            if (cantidadMaxValue) cantidadMaxValue.textContent = value;
        });
        
        cantidadRangeMin?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10);
            if (cantidadMin) cantidadMin.value = value;
            if (cantidadMinValue) cantidadMinValue.textContent = value;
            this.almacen.actualizarFiltro('cantidadMin', value);
        });
        
        cantidadRangeMax?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10);
            if (cantidadMax) cantidadMax.value = value;
            if (cantidadMaxValue) cantidadMaxValue.textContent = value;
            this.almacen.actualizarFiltro('cantidadMax', value);
        });
    }

    /**
     * Resetea todos los controles de filtro a sus valores por defecto
     * Sincroniza con el método resetearFiltros() de la clase Almacen
     */
    resetearTodosFiltros() {
        // Limpia la búsqueda
        if (this.searchInput) this.searchInput.value = '';
        this.clearSearchBtn?.classList.remove('visible');
        
        // Resetea ordenamiento
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) sortSelect.value = 'nombre-asc';
        
        // Resetea rango de precios
        this.resetearRango('precio', 0, 1000);
        
        // Resetea rango de cantidades
        this.resetearRango('cantidad', 0, 500);
        
        // Marca todos los checkboxes
        ['filterEnStock', 'filterSinStock', 'filterStockCritico'].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = true;
        });
        
        // Resetea los filtros en el almacén
        this.almacen.resetearFiltros();
    }

    /**
     * Función auxiliar para resetear controles de rango
     * @param {string} tipo - 'precio' o 'cantidad'
     * @param {number} min - Valor mínimo por defecto
     * @param {number} max - Valor máximo por defecto
     */
    resetearRango(tipo, min, max) {
        const minInput = document.getElementById(`${tipo}Min`);
        const maxInput = document.getElementById(`${tipo}Max`);
        const minSlider = document.getElementById(`${tipo}RangeMin`);
        const maxSlider = document.getElementById(`${tipo}RangeMax`);
        const minLabel = document.getElementById(`${tipo}MinValue`);
        const maxLabel = document.getElementById(`${tipo}MaxValue`);
        
        if (minInput) minInput.value = '';
        if (maxInput) maxInput.value = '';
        if (minSlider) minSlider.value = min;
        if (maxSlider) maxSlider.value = max;
        
        if (minLabel) {
            minLabel.textContent = tipo === 'precio' ? `€${min}` : min;
        }
        if (maxLabel) {
            maxLabel.textContent = tipo === 'precio' ? `€${max}` : max;
        }
    }
}

// ============================================================================
// CLASE DE MENÚ (IMPORTAR/EXPORTAR/LIMPIAR)
// ============================================================================

/**
 * Maneja el menú hamburguesa y las operaciones de importar, exportar y limpiar
 */
class MenuHandler {
    constructor(almacen) {
        this.almacen = almacen;
        this.menuToggle = document.getElementById('menuToggle');
        this.menuDropdown = document.getElementById('menuDropdown');
        this.fileInput = document.getElementById('fileInput');
        
        this.inicializarEventos();
    }

    /**
     * Configura event listeners del menú
     */
    inicializarEventos() {
        // Toggle del menú hamburguesa
        this.menuToggle?.addEventListener('click', () => this.toggleMenu());
        
        // Cierra el menú al hacer clic fuera del header
        document.addEventListener('click', (e) => {
            if (!e.target.closest('header')) {
                this.closeMenu();
            }
        });
        
        // Opciones del menú
        document.getElementById('importarJson')?.addEventListener('click', () => {
            this.closeMenu();
            this.importarJSON();
        });
        
        document.getElementById('exportarJson')?.addEventListener('click', () => {
            this.closeMenu();
            this.exportarJSON();
        });
        
        document.getElementById('limpiarInventario')?.addEventListener('click', () => {
            this.closeMenu();
            this.limpiarInventario();
        });
        
        // Listener del input de archivo
        this.fileInput?.addEventListener('change', (e) => {
            this.procesarArchivoImportado(e);
        });
    }

    /**
     * Abre o cierra el menú dropdown
     */
    toggleMenu() {
        const isActive = this.menuDropdown.classList.toggle('active');
        this.menuToggle.classList.toggle('active');
        this.menuToggle.setAttribute('aria-expanded', isActive);
    }

    /**
     * Cierra el menú dropdown
     */
    closeMenu() {
        this.menuDropdown.classList.remove('active');
        this.menuToggle.classList.remove('active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
    }

    /**
     * Activa el selector de archivos para importar JSON
     */
    importarJSON() {
        this.fileInput.click();
    }

    /**
     * Procesa el archivo JSON seleccionado
     * @param {Event} e - Evento change del input file
     */
    async procesarArchivoImportado(e) {
        const file = e.target.files[0];
        
        if (!file) return;
        
        // Valida que sea un archivo JSON
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
            // Resetea el input para permitir importar el mismo archivo de nuevo
            this.fileInput.value = '';
        }
    }

    /**
     * Exporta el inventario a un archivo JSON
     */
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

    /**
     * Limpia todo el inventario con doble confirmación
     */
    limpiarInventario() {
        if (this.almacen.productos.length === 0) {
            alert('El inventario ya está vacío.');
            return;
        }
        
        const count = this.almacen.productos.length;
        
        // Primera confirmación
        const confirmacion = confirm(
            `⚠️ ADVERTENCIA\n\n` +
            `Está a punto de eliminar TODOS los productos del inventario.\n\n` +
            `Total de productos: ${count}\n\n` +
            `Esta acción NO se puede deshacer.\n\n` +
            `¿Desea continuar?`
        );
        
        if (confirmacion) {
            // Segunda confirmación para seguridad extra
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

// ============================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================================

/**
 * Punto de entrada principal de la aplicación
 * Se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Crea la instancia principal del almacén
        const almacen = new Almacen();
        
        // Carga datos desde localStorage o archivo JSON
        await almacen.cargarDesdeLocalStorage();
        
        // Renderiza la tabla inicial
        almacen.mostrarProductos();
        
        // Inicializa todos los módulos de la interfaz
        const formulario = new FormularioProducto(almacen);
        const searchFilter = new SearchAndFilterHandler(almacen);
        const menu = new MenuHandler(almacen);
        
        console.log('✓ Warehouse application initialized successfully');
    } catch (error) {
        console.error('✗ Error initializing application:', error);
    }
});
