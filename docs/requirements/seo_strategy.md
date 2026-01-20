# **Estrategia SEO (Search Engine Optimization)**

## **1\. Objetivos de la Estrategia**

1. **Visibilidad Transaccional:** Aparecer primeros cuando alguien busca "Adoptar perro", "Donar a refugio", "Voluntariado animales".  
2. **Rich Snippets:** Que las fichas de las mascotas aparezcan con foto y detalles directamente en los resultados de Google.  
3. **Social Sharing:** Que al compartir un link en WhatsApp/Instagram, se vea la foto de la mascota (Open Graph), no el logo genérico.

---

## **2\. Investigación de Palabras Clave (Keywords)**

Nos enfocamos en la intención del usuario.

### **🎯 Keywords Primarias (Transaccionales)**

*El usuario quiere realizar una acción ya.*

* "Adopción de perros en \[Ciudad\]"  
* "Gatos en adopción cachorros"  
* "Donar alimento para perros"  
* "Refugio de animales \[Ciudad\]"

### **🧠 Keywords Secundarias (Informacionales)**

*El usuario tiene dudas o quiere aprender. (Para el Blog/Noticias).*

* "Requisitos para adoptar una mascota"  
* "Cómo ser hogar de tránsito"  
* "Calendario de vacunación perros"

---

## **3\. SEO Técnico (Technical SEO)**

Dado que usamos **React (Client-Side Rendering)**, debemos facilitar el trabajo a los robots de búsqueda.

### **🏎️ Core Web Vitals (Rendimiento)**

Google penaliza sitios lentos.

* **LCP (Largest Contentful Paint):** La imagen principal de la mascota debe cargar en \< 2.5s.  
  * *Acción:* Usar formatos **WebP** servidos desde Cloudflare R2. Implementar lazy-loading solo en imágenes "below the fold" (abajo de la pantalla).  
* **CLS (Cumulative Layout Shift):** Evitar que el contenido "salte" mientras carga.  
  * *Acción:* Definir width y height fijos en los contenedores de las tarjetas de mascotas (Skeletons).

### **🤖 Indexación y Rastreo**

* **Gestión de Metadatos:** Usaremos la librería **react-helmet-async** para inyectar dinámicamente el \<title\> y \<meta name="description"\> en cada ruta.  
* **Canonical URLs:** Para evitar contenido duplicado si accedemos por pazanimal.org y www.pazanimal.org.  
* **Sitemap:** Generación automática de sitemap.xml usando un script post-build que lea los IDs de las mascotas activas en la base de datos.  
* **Robots.txt:**  
* Plaintext

User-agent: \*  
Allow: /  
Disallow: /admin/  \# No indexar el panel de administración  
Disallow: /perfil/ \# No indexar perfiles de usuarios privados  
Sitemap: https://pazanimal.org/sitemap.xml

*   
* 

---

## **4\. SEO On-Page**

### **Estructura de URLs**

Deben ser semánticas y legibles.

* ❌ /pet?id=123  
* ✅ /adopciones/perros/firulais-123 (Categoría \+ Nombre \+ ID único)

### **Jerarquía de Encabezados (H-Tags)**

* **H1:** Uno solo por página. (Ej: "Conocé a Firulais").  
* **H2:** Secciones principales (Ej: "Mi Historia", "Datos Médicos").  
* **Texto Alternativo (Alt Text):** Vital para accesibilidad y SEO de imágenes.  
  * ✅ alt="Perro mestizo negro jugando con una pelota"

---

## **5\. Datos Estructurados (Schema Markup)**

Implementaremos **JSON-LD** para que Google entienda que una página es sobre un "Animal" y una "Organización".

### **🏢 Schema de Organización (En Home)**

JSON

{  
  "@context": "https://schema.org",  
  "@type": "NGO",  
  "name": "Fundación Paz Animal",  
  "url": "https://pazanimal.org",  
  "logo": "https://pazanimal.org/logo.png",  
  "sameAs": \[  
    "https://facebook.com/pazanimal",  
    "https://instagram.com/pazanimal"  
  \]  
}

### **🐶 Schema de Producto/Mascota (En Ficha de Detalle)**

Aunque Schema.org tiene tipos específicos, Google a veces prefiere Product para mostrar rich snippets visuales, o simplemente una estructura genérica bien definida.

JSON

{  
  "@context": "https://schema.org",  
  "@type": "Product",   
  "name": "Firulais",  
  "image": "https://pazanimal.org/pets/firulais.webp",  
  "description": "Perro macho de 2 años, muy juguetón y castrado.",  
  "offers": {  
    "@type": "Offer",  
    "price": "0",  
    "priceCurrency": "ARS",  
    "availability": "https://schema.org/InStock"  
  }  
}

*(Nota: Usamos "price: 0" simbólicamente para indicar adopción gratuita o gestionar el tipo según la evolución de Schema.org).*

---

## **6\. Social SEO (Open Graph & Twitter Cards)**

Fundamental para compartir en WhatsApp.

* og:title: "Adoptá a Firulais \- Paz Animal"  
* og:description: "Firulais tiene 2 años y busca hogar. ¡Hacé click para conocerlo\!"  
* og:image: URL de la foto principal (recortada a 1200x630px).  
* og:type: website.

---

## **7\. SEO Local (Google My Business)**

* Crear/Reclamar la ficha de "Paz Animal" en Google Maps.  
* Mantener actualizados los horarios de atención y dirección (si es pública).  
* Solicitar a adoptantes felices que dejen **Reseñas** en Google. Esto aumenta drásticamente la autoridad local.

