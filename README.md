## OPCIÓN DE TRABAJO ESCOGIDA: C (Inventario de Productos)
________________________________________________________

## FUNCIONALIDADES IMPLEMENTADAS:

- Altas y bajas de productos
- Precio producto
- Cantidad producto
- Cálculo de los totales
- Título y descripción breve
- Formulario
- Listado de productos (utilizando una tabla)
- Mensajes claros
- Diseño limpio
- Manipulación del DOM
- Eventos bien usados
- Validación obligatoria
- Datos en array
- id de producto único
- Edición y actualización de producto
- Búsqueda y filtrado
- Guardado en localStrage
- Exportar e importar datos
- Resetear aplicación
________________________________________________________

## INSTRUCCIONES DE USO:

## Inicio Rápido

1. Descarga los archivos del proyecto
2. Abre `index.html` en tu navegador
3. ¡Empieza a gestionar tu inventario!

## Instrucciones de Uso

### Agregar Productos

1. Rellena el formulario en el panel izquierdo:
   - **Producto**: Nombre del artículo (mínimo 3 caracteres)
   - **Cantidad**: Unidades en stock (puede ser negativo)
   - **Precio**: Precio unitario en euros (debe ser positivo)

2. Haz clic en **"Dar de alta"**
3. El producto aparecerá en la tabla automáticamente

### Buscar Productos

1. Usa la barra de búsqueda bajo el título "Productos en el Almacén"
2. Escribe el nombre del producto que buscas
3. Los resultados se filtran automáticamente mientras escribes
4. Haz clic en **✕** para limpiar la búsqueda

### Filtrar Productos

1. Haz clic en el botón **"🎯 Filtros"**
2. Configura los filtros que necesites:
   - **Ordenar por**: Nombre, precio o cantidad (ascendente/descendente)
   - **Rango de Precio**: Usa los sliders o escribe valores mínimo/máximo
   - **Rango de Cantidad**: Define límites de stock
   - **Estado del Stock**: 
     - ✓ En stock (cantidad > 0)
     - ✓ Sin stock (cantidad = 0)
     - ✓ Stock crítico (cantidad < 10)

3. Haz clic en **"Limpiar filtros"** para resetear

### Ajustes Rápidos

Cada producto tiene botones **+** y **-** para ajustar:
- **Cantidad**: Incrementa o reduce el stock de 1 en 1
- **Precio**: Aumenta o disminuye el precio en €1

### ✏️ Editar Productos

1. Haz clic en el botón **"✏️ Editar"** del producto
2. Modifica los campos que necesites
3. Opciones:
   - **💾 Guardar**: Confirma los cambios
   - **❌ Cancelar**: Descarta los cambios
   - **Enter**: Atajo para guardar
   - **Escape**: Atajo para cancelar

### 🗑️ Eliminar Productos

1. Haz clic en el botón **"🗑️ Eliminar"**
2. Confirma la eliminación en el diálogo
3. El producto se eliminará con una animación

### Ver Estadísticas

En la parte inferior de la tabla verás 3 tarjetas con:
- **📦 Total Productos**: Número de productos diferentes
- **💰 Valor Total Inventario**: Suma del valor (precio × cantidad) de todos los productos
- **📊 Unidades Totales**: Suma de todas las cantidades

### Importar/Exportar Datos

Haz clic en el **menú hamburguesa** (☰) en la esquina superior derecha:

#### Exportar JSON
1. Clic en **"📤 Exportar JSON"**
2. Se descargará un archivo con todos tus productos
3. El archivo se llama `almacen_YYYY-MM-DD.json`

#### Importar JSON
1. Clic en **"📥 Importar JSON"**
2. Selecciona un archivo JSON válido
3. Los productos se cargarán automáticamente

#### Limpiar Inventario
1. Clic en **"🗑️ Limpiar Inventario"**
2. Confirma **dos veces** (seguridad extra)
3. Todos los productos se eliminarán

## Consejos

- **Búsqueda rápida**: Empieza a escribir el nombre del producto para filtrar al instante
- **Cantidades negativas**: Útil para representar productos pendientes de recibir
- **Datos persistentes**: Tus productos se guardan automáticamente en el navegador
- **Filtros combinados**: Puedes usar búsqueda y filtros simultáneamente
- **Exporta regularmente**: Guarda copias de seguridad de tu inventario

## 🔧 Requisitos Técnicos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- JavaScript activado
- No requiere instalación
- No requiere servidor
- Funciona sin conexión a internet (después de la primera carga)

## 📁 Estructura de Archivos

```
almacen-online/
│
├── index.html          # Página principal
├── styles.css          # Estilos de la interfaz
├── script.js           # Lógica de la aplicación
└── almacen.json        # Archivo de datos inicial (vacío)
```

## 🌐 Formato del Archivo JSON

Si quieres crear manualmente un archivo JSON para importar:

```json
{
  "productos": [
    {
      "nombre": "Producto 1",
      "cantidad": 10,
      "precio": 25.50
    },
    {
      "nombre": "Producto 2",
      "cantidad": 5,
      "precio": 15.00
    }
  ]
}
```

## ⚠️ Notas Importantes

- Los datos se guardan en el **navegador** (localStorage)
- Si limpias el caché del navegador, perderás los datos
- **Exporta regularmente** para tener copias de seguridad
- Los precios se muestran en formato español (€)
- Las cantidades pueden ser negativas (útil para pedidos pendientes)

## 🎨 Características

✅ Interfaz moderna y responsive  
✅ Búsqueda en tiempo real  
✅ Filtros avanzados con sliders  
✅ Edición inline de productos  
✅ Ajustes rápidos de stock y precio  
✅ Estadísticas del inventario  
✅ Importar/Exportar JSON  
✅ Animaciones suaves  
✅ Accesibilidad (ARIA labels)  
✅ Compatible con móviles  

## 📱 Uso en Móvil

La aplicación está optimizada para dispositivos móviles:
- Los filtros se adaptan a pantalla pequeña
- La tabla es desplazable horizontalmente
- Los botones tienen tamaño táctil adecuado
- El menú hamburguesa es fácil de usar con el pulgar

________________________________________________________

## Imágenes de la aplicación

![Captura1AlmacenOnline.png](ImagenesMuestraAPP\Captura1AlmacenOnline.png)
![Captura2AlmacenOnline.png](ImagenesMuestraAPP\Captura2AlmacenOnline.png)
![Captura3AlmacenOnline.png](ImagenesMuestraAPP\Captura3AlmacenOnline.png)
