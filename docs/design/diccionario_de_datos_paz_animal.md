# Diccionario de Datos: Plataforma de Paz Animal

| Campo | Descripción |
| :---- | :---- |
| Título del Documento | Diccionario de Datos \- Plataforma Web Interactiva Paz Animal |
| Versión | 1.0 (Basado en Definición de BD V23) |
| Fecha de Creación | 04/12/2025 |
| Autor(es) | Facundo Nicolás González |
| Base de Datos | paz\_animal\_db (PostgreSQL 15+) |
| Tipo de Base de Datos | Transaccional / OLTP (Online Transaction Processing) |

# 1\. Introducción y objetivo

El presente documento constituye el Diccionario de Datos para la base de datos transaccional del sistema Plataforma de Paz Animal.

**Objetivo**: Detallar la estructura lógica de la base de datos, proporcionando una definición precisa y unificada de cada entidad (tabla), atributo (campo), tipo de dato, restricción y relación. Su propósito es servir como la fuente autorizada de información para desarrolladores, analistas de datos y administradores de bases de datos.

# 2\. Vista General del Modelo

**Propósito Principal**: Centralizar la gestión operativa pública de la fundación, incluyendo la identidad de usuarios, el flujo de adopciones, el registro de mascotas, la recaudación de fondos (trazable), la gestión de contenidos (CMS) y la coordinación de voluntarios.

**Alcance**: Abarca desde el registro de usuarios con roles específicos hasta la auditoría forense de transacciones, utilizando una arquitectura multi-esquema (auth, public) y relaciones polimórficas para maximizar la flexibilidad y la normalización.

# 2\. Detalle de entidades y campos

#### **ENTIDAD: auth.roles**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | auth.roles |
| Función/Descripción de la Entidad | Catálogo maestro de los roles de sistema que definen los permisos de acceso. Los roles son: 'ADMIN', 'CLIENT', 'VOLUNTEER'. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| role\_id | SERIAL | N/A | NOT NULL | AUTO\_INCREMENT | PK | Llave primaria de la tabla. Identificador numérico auto-generado para cada rol. |
| name | VARCHAR | 50 | NOT NULL | UNIQUE |  | Nombre del rol en el sistema. Debe ser uno de los valores predefinidos y es único para evitar duplicados. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users\_roles | role\_id | 1:N | CASCADE / CASCADE | Un rol puede estar asignado a múltiples usuarios. Si un rol se elimina, todas sus asignaciones en users\_roles se eliminan en cascada. |

#### **ENTIDAD: auth.users**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | auth.users |
| Función/Descripción de la Entidad | Almacena la identidad única de todos los actores del sistema (Administradores, Clientes, Voluntarios). Gestiona la autenticación híbrida (Password/OAuth), la seguridad (2FA) y las preferencias del usuario. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| user\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Llave primaria de la tabla. Identificador único universal del usuario. |
| first\_name | VARCHAR | 100 | NOT NULL | N/A |  | Nombre de pila del usuario. |
| last\_name | VARCHAR | 100 | NOT NULL | N/A |  | Apellido del usuario. |
| email | VARCHAR | 255 | NOT NULL | UNIQUE |  | Correo electrónico principal. Es la credencial de acceso y debe ser único en el sistema. |
| password\_hash | VARCHAR | 60 | NULL | CHECK (chk\_users\_auth\_method) |  | Hash de la contraseña (usando Bcrypt). Puede ser NULL si el usuario se autentica exclusivamente vía Google OAuth. |
| google\_id | VARCHAR | 255 | NULL | UNIQUE |  | Identificador único (subject) de la cuenta de Google del usuario. Permite el inicio de sesión social. |
| avatar\_url | VARCHAR | 500 | NULL | N/A |  | URL a la foto de perfil del usuario, proveniente de Google u otro proveedor OAuth. |
| tfa\_enabled | BOOLEAN | N/A | NOT NULL | DEFAULT false |  | Indica si el Doble Factor de Autenticación (2FA) está activado para este usuario. |
| tfa\_secret | VARCHAR | 255 | NULL | N/A |  | Secreto TOTP para generar códigos 2FA (por ejemplo, con Google Authenticator). |
| doc\_type | ENUM (document\_type) | N/A | NOT NULL | DEFAULT 'DNI' |  | Tipo de documento de identidad legal (DNI, Pasaporte, etc.). |
| doc\_number | VARCHAR | 50 | NOT NULL | UNIQUE (con doc\_type) |  | Número del documento de identidad. La combinación de tipo y número debe ser única. |
| nationality\_iso | CHAR | 2 | NOT NULL | DEFAULT 'AR', FK a public.countries | FK | Código ISO de 2 letras del país de nacionalidad del usuario. |
| birth\_date | DATE | N/A | NULL | N/A |  | Fecha de nacimiento del usuario. |
| phone | VARCHAR | 20 | NULL | N/A |  | Número de teléfono de contacto. |
| secondary\_email | VARCHAR | 255 | NULL | N/A |  | Correo electrónico secundario o de contacto alternativo. |
| notification\_preferences | JSONB | N/A | NOT NULL | DEFAULT {"news": true, "events": true} |  | Objeto JSON que permite al usuario configurar granularmente qué tipo de notificaciones desea recibir. |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora en que se creó el registro del usuario. |
| deleted\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha y hora de la baja lógica (Soft Delete). Si este campo no es NULL, el usuario y su perfil están desactivados. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.countries | nationality\_iso | N:1 | RESTRICT / CASCADE | Un usuario tiene una nacionalidad. Si se intenta borrar un país que tiene usuarios asociados, la operación se restringe. |
| auth.users\_roles | user\_id | 1:N | CASCADE / CASCADE | La relación entre usuarios y roles se gestiona en la tabla users\_roles. Si un usuario se elimina (lógicamente no aplica, pero si se hiciera físico), sus asignaciones de roles se borrarían. |
| public.pets | owner\_id | 1:N | SET NULL / CASCADE | Un usuario puede ser dueño de múltiples mascotas. Si el usuario se marca como eliminado, las mascotas pierden su owner\_id pero no se borran. |
| public.volunteers | user\_id | 1:1 | CASCADE / CASCADE | Un usuario puede tener un perfil de voluntario asociado. Si el usuario se elimina, su perfil de voluntario también se elimina. |

#### **ENTIDAD: auth.users\_roles**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | auth.users\_roles |
| Función/Descripción de la Entidad | Tabla pivote que implementa la relación de muchos-a-muchos (N:M) entre usuarios y roles, permitiendo que un usuario tenga múltiples roles simultáneamente (por ejemplo, ser ADMIN y VOLUNTEER a la vez). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| user\_id | UUID | N/A | NOT NULL | FK a auth.users | PK, FK | Llave foránea que referencia al usuario. Parte de la clave primaria compuesta. |
| role\_id | INT | N/A | NOT NULL | FK a auth.roles | PK, FK | Llave foránea que referencia al rol asignado. Parte de la clave primaria compuesta. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | user\_id | N:1 | CASCADE / CASCADE | Si un usuario se elimina (físicamente), todas sus asignaciones de roles se eliminan. |
| auth.roles | role\_id | N:1 | CASCADE / CASCADE | Si un rol se elimina, todas las asignaciones de ese rol a usuarios se eliminan. |

#### **ENTIDAD: public.pets**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.pets |
| Función/Descripción de la Entidad | Almacena el registro de todas las mascotas gestionadas por la plataforma. Puede representar tanto animales disponibles para adopción (gestionados por la fundación) como mascotas de clientes registrados (con QR para identificación). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| pet\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Llave primaria de la tabla. Identificador único universal para cada mascota. |
| name | VARCHAR | 100 | NOT NULL | N/A |  | Nombre de la mascota. |
| status | ENUM (pet\_status) | N/A | NOT NULL | N/A |  | Estado actual de la mascota. Puede ser 'ADOPTION\_AVAILABLE', 'OWNED', 'LOST', etc. |
| sex | ENUM (pet\_sex) | N/A | NOT NULL | DEFAULT 'UNKNOWN' |  | Sexo de la mascota. |
| breed\_id | INT | N/A | NULL | FK a public.breeds | FK | Raza específica de la mascota. Relación con el catálogo de razas. |
| birth\_date\_approx | DATE | N/A | NULL | N/A |  | Fecha de nacimiento aproximada del animal. |
| qr\_code | UUID | N/A | NULL | UNIQUE |  | Código QR único y público para la identificación física de la mascota (ej. en un collar). |
| owner\_id | UUID | N/A | NULL | FK a auth.users | FK | Dueño de la mascota. Debe ser NULL si el estado es 'ADOPTION\_AVAILABLE'. |
| neuter\_date | DATE | N/A | NULL | N/A |  | Fecha en la que la mascota fue castrada/esterilizada. |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora de creación del registro. |
| deleted\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha de eliminación lógica (soft delete). |
| chk\_pet\_logic | CONSTRAINT | N/A | N/A | CHECK |  | Regla de Negocio: Asegura la coherencia entre el estado y el dueño. Por ejemplo, una mascota en adopción no puede tener un owner\_id. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | owner\_id | N:1 | SET NULL / CASCADE | Un usuario puede ser dueño de muchas mascotas. Si el usuario se marca como eliminado, la mascota pierde su owner\_id pero no se borra. |
| public.breeds | breed\_id | N:1 | SET NULL / CASCADE | Una raza puede estar asignada a muchas mascotas. Si la raza se elimina, el campo se pone a NULL. |
| public.adoption\_applications | pet\_id | 1:N | CASCADE / CASCADE | Una mascota puede ser el objeto de múltiples solicitudes de adopción a lo largo del tiempo. |

#### **ENTIDAD: public.adoption\_applications**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.adoption\_applications |
| Función/Descripción de la Entidad | Representa una solicitud formal de adopción. Es el núcleo del flujo de negocio principal, gestionando todo el proceso desde la postulación hasta la aprobación y el seguimiento posterior. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| application\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Llave primaria de la tabla. Identificador único de la solicitud. |
| client\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | El usuario que realiza la solicitud de adopción (potencial adoptante). |
| pet\_id | UUID | N/A | NOT NULL | FK a public.pets | FK | La mascota por la que se solicita la adopción. |
| status | ENUM (adoption\_status) | N/A | NOT NULL | DEFAULT 'REQUESTED' |  | Estado actual del trámite. Controla el flujo (Entrevista, Aprobada, en Seguimiento, etc.). |
| space\_description | TEXT | N/A | NOT NULL | N/A |  | Descripción del espacio disponible en el hogar del solicitante para la mascota. |
| income\_description | TEXT | N/A | NOT NULL | N/A |  | Descripción de la situación económica o de ingresos del solicitante. |
| other\_pets\_description | TEXT | N/A | NOT NULL | N/A |  | Descripción de otras mascotas en el hogar. |
| motivation | TEXT | N/A | NOT NULL | N/A |  | Motivación personal del solicitante para adoptar. |
| evidence\_urls | JSONB | N/A | NULL | N/A |  | Almacena URLs de fotos o videos del hogar, subidos a un servicio de Object Storage. |
| admin\_notes | TEXT | N/A | NULL | N/A |  | Campo para que el administrador registre observaciones, decisiones o el resultado de la entrevista. |
| applied\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora en que se creó la solicitud. |
| decided\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha y hora en que se tomó la decisión final (Aprobada/Rechazada). |
| uq\_client\_active\_app | CONSTRAINT | N/A | N/A | UNIQUE (parcial) |  | Regla de Negocio: Un cliente no puede tener más de una solicitud de adopción activa al mismo tiempo. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | client\_id | N:1 | CASCADE / CASCADE | La solicitud pertenece a un único cliente. Si el cliente se elimina, la solicitud también se elimina. |
| public.pets | pet\_id | N:1 | CASCADE / CASCADE | La solicitud está vinculada a una única mascota. Si la mascota se elimina, la solicitud también se elimina. |
| public.adoption\_followups | application\_id | 1:N | CASCADE / CASCADE | Una solicitud aprobada genera una serie de 6 seguimientos mensuales obligatorios. |

#### **ENTIDAD: public.volunteers**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.volunteers |
| Función/Descripción de la Entidad | Almacena el perfil operativo de los voluntarios activos. Cada registro está vinculado 1:1 a un usuario del sistema y contiene información específica para la gestión interna de la fundación, como su rol y disponibilidad. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| volunteer\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Llave primaria de la tabla. Identificador único del perfil de voluntario. |
| user\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Vinculación 1:1 con la identidad del usuario en el sistema. |
| volunteer\_role\_id | INT | N/A | NULL | FK a public.volunteer\_roles | FK | Rol operativo específico del voluntario (ej. 'Paseador', 'Encargado de Redes'). |
| bio | TEXT | N/A | NULL | N/A |  | Biografía o descripción corta del voluntario, visible en la sección "Sobre Nosotros". |
| availability | JSONB | N/A | NOT NULL | DEFAULT '{}' |  | Matriz de disponibilidad horaria del voluntario (días y turnos). |
| qr\_code | UUID | N/A | NULL | UNIQUE |  | Código QR único para la credencial física del voluntario. |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha de creación del perfil de voluntario. |
| deleted\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha de eliminación lógica (soft delete) del perfil. |
| uq\_volunteers\_user | CONSTRAINT | N/A | N/A | UNIQUE |  | Regla de Negocio: Un usuario solo puede tener un perfil de voluntario activo. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | user\_id | 1:1 | CASCADE / CASCADE | Cada perfil de voluntario está vinculado a un único usuario. Si el usuario se elimina, el perfil de voluntario también se elimina. |
| public.volunteer\_roles | volunteer\_role\_id | N:1 | SET NULL / CASCADE | Un rol de voluntario puede estar asignado a muchos voluntarios. Si el rol se elimina, el campo se pone a NULL. |

#### **ENTIDAD: public.media**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.media |
| Función/Descripción de la Entidad | Tabla centralizada que gestiona todos los archivos multimedia (imágenes, videos, documentos) del sistema mediante una relación polimórfica. Permite adjuntar contenido a cualquier entidad (usuarios, mascotas, artículos, etc.). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| media\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Llave primaria de la tabla. Identificador único del archivo multimedia. |
| storage\_url | VARCHAR | 255 | NOT NULL | N/A |  | URL pública o firmada del archivo en el Object Storage (Cloudflare R2). |
| type | ENUM (media\_type) | N/A | NOT NULL | N/A |  | Tipo de medio: 'IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'. |
| alt\_text | VARCHAR | 255 | NULL | N/A |  | Texto alternativo para accesibilidad (WCAG 2.1). Obligatorio para imágenes informativas. |
| entity\_type | VARCHAR | 50 | NOT NULL | N/A |  | Tipo de la entidad propietaria (ej. 'USER', 'PET', 'NEWS'). Parte de la relación polimórfica. |
| entity\_id | UUID | N/A | NOT NULL | N/A |  | ID de la entidad propietaria. Parte de la relación polimórfica. |
| is\_main | BOOLEAN | N/A | NOT NULL | DEFAULT false |  | Indica si este es el archivo principal de la entidad (ej. foto de perfil). |
| uploaded\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora en que se subió el archivo. |

Relaciones y Políticas Referenciales

Esta tabla no tiene Foreign Keys físicas tradicionales. Su relación con otras entidades es polimórfica lógica, gestionada por la aplicación mediante los campos entity\_type y entity\_id.

### **ENTIDAD: public.countries**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.countries |
| Función/Descripción de la Entidad | Catálogo maestro de países, identificados por su código ISO de 2 letras. Sirve como referencia normalizada para la nacionalidad de usuarios y otras localizaciones. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| iso\_code | CHAR | 2 | NOT NULL | PRIMARY KEY | PK | Código ISO 3166-1 alfa-2 del país (ej. 'AR', 'BR'). Es la clave primaria y debe ser único. |
| name | VARCHAR | 100 | NOT NULL | N/A |  | Nombre completo del país en español (ej. 'Argentina'). |
| phone\_prefix | VARCHAR | 10 | NULL | N/A |  | Prefijo telefónico internacional del país (ej. '+54'). |
| is\_active | BOOLEAN | N/A | NOT NULL | DEFAULT true |  | Indica si el país está activo en la plataforma. Permite deshabilitar países sin borrarlos. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | nationality\_iso | 1:N | RESTRICT / CASCADE | Un país puede estar asignado a múltiples usuarios como nacionalidad. No se permite eliminar un país si tiene usuarios asociados. |

### **ENTIDAD: public.currencies**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.currencies |
| Función/Descripción de la Entidad | Catálogo maestro de monedas soportadas, identificadas por su código ISO de 3 letras. Se utiliza para normalizar montos en transacciones y donaciones. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| iso\_code | CHAR | 3 | NOT NULL | PRIMARY KEY | PK | Código ISO 4217 de la moneda (ej. 'ARS', 'USD'). Es la clave primaria y debe ser único. |
| name | VARCHAR | 50 | NOT NULL | N/A |  | Nombre completo de la moneda (ej. 'Argentine Peso'). |
| symbol | VARCHAR | 5 | NOT NULL | N/A |  | Símbolo gráfico para visualización (ej. ' ′,′US ′ , ′ *US*'). |
| decimals | SMALLINT | N/A | NOT NULL | DEFAULT 2 |  | Número de dígitos decimales usados en la moneda (ej. 2 para pesos, 0 para yenes). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.transactions | currency | 1:N | RESTRICT / CASCADE | Una moneda puede estar asociada a múltiples transacciones. No se permite eliminar una moneda si hay transacciones registradas con ella. |
| public.monetary\_donations | currency | 1:N | RESTRICT / CASCADE | Misma lógica que en transacciones. |

### **ENTIDAD: public.tags**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.tags |
| Función/Descripción de la Entidad | Almacena etiquetas transversales para clasificar y filtrar contenido (noticias, mascotas, eventos, etc.) de forma flexible y multi-idioma. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| tag\_id | SERIAL | N/A | NOT NULL | PRIMARY KEY | PK | Identificador auto-incremental único de la etiqueta. |
| slug | VARCHAR | 50 | NOT NULL | UNIQUE |  | Identificador único en formato URL-friendly (ej. 'emergencia'). Usado en rutas y filtros. |
| name | JSONB | N/A | NOT NULL | N/A |  | Nombre traducido de la etiqueta en múltiples idiomas (ej. {"es": "Urgente", "en": "Urgent"}). |
| color\_hex | VARCHAR | 7 | NOT NULL | DEFAULT '\#00AA00' |  | Color representativo para la UI en formato hexadecimal (ej. '\#FF0000'). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.taggables | tag\_id | 1:N | CASCADE / CASCADE | Una etiqueta puede aplicarse a múltiples entidades. Si se elimina la etiqueta, todas sus asignaciones se eliminan. |

### **ENTIDAD: public.taggables**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.taggables |
| Función/Descripción de la Entidad | Tabla de relación polimórfica que vincula una etiqueta con cualquier tipo de entidad del sistema (mascota, noticia, evento, etc.). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| tag\_id | INT | N/A | NOT NULL | FK a public.tags | PK, FK | Identificador de la etiqueta asignada. |
| entity\_type | VARCHAR | 50 | NOT NULL | N/A | PK | Tipo de la entidad etiquetada (ej. 'PET', 'NEWS', 'EVENT'). |
| entity\_id | UUID | N/A | NOT NULL | N/A | PK | Identificador único de la entidad etiquetada. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.tags | tag\_id | N:1 | CASCADE / CASCADE | Si se elimina una etiqueta, todas las filas en taggables asociadas a ella se eliminan. |
| *(Polimórfica)* | entity\_type, entity\_id | N:1 (lógica) | N/A | Relación lógica gestionada por la aplicación. No hay FK física. |

### **ENTIDAD: public.provinces**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.provinces |
| Función/Descripción de la Entidad | Catálogo de provincias o estados. Se usa para normalizar la geolocalización de direcciones. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| province\_id | SERIAL | N/A | NOT NULL | PRIMARY KEY | PK | Identificador único auto-incremental de la provincia. |
| name | VARCHAR | 100 | NOT NULL | UNIQUE |  | Nombre de la provincia (ej. 'Buenos Aires'). Debe ser único. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.cities | province\_id | 1:N | CASCADE / CASCADE | Una provincia puede tener múltiples ciudades. Si se elimina la provincia, las ciudades asociadas también se eliminan. |

### **ENTIDAD: public.cities**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.cities |
| Función/Descripción de la Entidad | Catálogo de ciudades o localidades, vinculadas a una provincia. Se usa en direcciones físicas. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| city\_id | SERIAL | N/A | NOT NULL | PRIMARY KEY | PK | Identificador único auto-incremental de la ciudad. |
| province\_id | INT | N/A | NOT NULL | FK a public.provinces | FK | Provincia a la que pertenece la ciudad. |
| name | VARCHAR | 100 | NOT NULL | N/A |  | Nombre de la ciudad (ej. 'La Plata'). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.provinces | province\_id | N:1 | RESTRICT / CASCADE | Una ciudad pertenece a una única provincia. No se permite eliminar una provincia si tiene ciudades. |

### **ENTIDAD: public.addresses**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.addresses |
| Función/Descripción de la Entidad | Almacena direcciones físicas de forma polimórfica, permitiendo asociar una dirección a cualquier tipo de entidad (usuario, patrocinador, evento, etc.). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| address\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid(), PK | PK | Identificador único universal de la dirección. |
| entity\_type | VARCHAR | 50 | NOT NULL | N/A |  | Tipo de entidad propietaria (ej. 'USER', 'SPONSOR', 'EVENT'). |
| entity\_id | UUID | N/A | NOT NULL | N/A |  | ID de la entidad propietaria. |
| city\_id | INT | N/A | NOT NULL | FK a public.cities | FK | Ciudad a la que pertenece la dirección. |
| street | VARCHAR | 255 | NOT NULL | N/A |  | Nombre de la calle. |
| number | VARCHAR | 20 | NOT NULL | N/A |  | Número de la dirección. |
| unit | VARCHAR | 50 | NULL | N/A |  | Unidad adicional (departamento, piso, etc.). |
| zip\_code | VARCHAR | 10 | NOT NULL | N/A |  | Código postal. |
| alias | VARCHAR | 100 | NOT NULL | DEFAULT 'Main' |  | Nombre amigable para la dirección (ej. 'Casa', 'Oficina'). |
| coordinates | POINT | N/A | NULL | N/A |  | Coordenadas geográficas (latitud, longitud) para mapas. |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha de creación del registro. |
| deleted\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha de eliminación lógica (soft delete). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.cities | city\_id | N:1 | RESTRICT / CASCADE | Una dirección pertenece a una única ciudad. No se permite eliminar una ciudad si tiene direcciones asociadas. |
| *(Polimórfica)* | entity\_type, entity\_id | N:1 (lógica) | N/A | Relación gestionada por la aplicación. No hay FK física. |

### **ENTIDAD: public.species**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.species |
| Función/Descripción de la Entidad | Catálogo maestro de especies de animales (perro, gato, etc.). Sirve como base para el catálogo de razas. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| species\_id | SERIAL | N/A | NOT NULL | PRIMARY KEY | PK | Identificador único auto-incremental de la especie. |
| name | VARCHAR | 50 | NOT NULL | UNIQUE |  | Nombre de la especie (ej. 'Perro'). Debe ser único. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.breeds | species\_id | 1:N | CASCADE / CASCADE | Una especie puede tener múltiples razas. Si se elimina la especie, las razas asociadas también se eliminan. |

### **ENTIDAD: public.breeds**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.breeds |
| Función/Descripción de la Entidad | Catálogo de razas, vinculadas a una especie específica. Se utiliza en los perfiles de mascotas. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| breed\_id | SERIAL | N/A | NOT NULL | PRIMARY KEY | PK | Identificador único auto-incremental de la raza. |
| species\_id | INT | N/A | NOT NULL | FK a public.species | FK | Especie a la que pertenece la raza. |
| name | VARCHAR | 100 | NOT NULL | N/A |  | Nombre de la raza (ej. 'Labrador Retriever'). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.species | species\_id | N:1 | RESTRICT / CASCADE | Una raza pertenece a una única especie. No se permite eliminar una especie si tiene razas asociadas. |
| public.pets | breed\_id | N:1 | SET NULL / CASCADE | Una raza puede estar asignada a múltiples mascotas. Si se elimina la raza, el campo breed\_id en las mascotas se pone a NULL. |

### **ENTIDAD: public.lost\_pet\_alerts**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.lost\_pet\_alerts |
| Función/Descripción de la Entidad | Registra alertas activas de extravío para mascotas. Permite a los dueños reportar la desaparición de su mascota y proporcionar información clave para su búsqueda. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| alert\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único de la alerta de extravío. |
| pet\_id | UUID | N/A | NOT NULL | FK a public.pets, UNIQUE (parcial) | FK | Mascota reportada como extraviada. Solo puede existir una alerta activa por mascota. |
| lost\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora en que se reportó la desaparición. |
| last\_seen\_zone | VARCHAR | 255 | NOT NULL | N/A |  | Descripción textual de la última ubicación conocida. |
| coordinates | POINT | N/A | NULL | N/A |  | Coordenadas geográficas aproximadas del lugar de extravío. |
| contact\_phone | VARCHAR | 50 | NOT NULL | N/A |  | Número de teléfono de contacto para reportar avistamientos. |
| message | TEXT | N/A | NULL | N/A |  | Mensaje adicional del dueño para la comunidad. |
| is\_active | BOOLEAN | N/A | NOT NULL | DEFAULT true |  | Indica si la alerta está activa. Se desactiva al resolverla. |
| resolved\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha en que se resolvió la alerta (mascota encontrada o cancelada). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.pets | pet\_id | 1:1 | CASCADE / CASCADE | Una mascota puede tener a lo sumo una alerta activa. Si la mascota se elimina, la alerta también se elimina. |

### **ENTIDAD: public.vaccines\_catalog**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.vaccines\_catalog |
| Función/Descripción de la Entidad | Catálogo maestro de vacunas veterinarias disponibles. Sirve para estandarizar y gestionar el historial de vacunación de las mascotas. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| vaccine\_id | SERIAL | N/A | NOT NULL | PRIMARY KEY | PK | Identificador auto-incremental único de la vacuna. |
| name | VARCHAR | 100 | NOT NULL | UNIQUE |  | Nombre de la vacuna (ej. 'Rabia', 'Parvovirus'). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.pets\_vaccines | vaccine\_id | 1:N | CASCADE / CASCADE | Una vacuna puede estar aplicada a múltiples mascotas. Si se elimina del catálogo, se borran sus registros históricos. |

### **ENTIDAD: public.pets\_vaccines**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.pets\_vaccines |
| Función/Descripción de la Entidad | Tabla de relación muchos-a-muchos que registra el historial de vacunación de cada mascota, incluyendo la fecha de aplicación. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| pet\_id | UUID | N/A | NOT NULL | FK a public.pets | PK, FK | Mascota a la que se le aplicó la vacuna. |
| vaccine\_id | INT | N/A | NOT NULL | FK a public.vaccines\_catalog | PK, FK | Vacuna aplicada. |
| applied\_at | DATE | N/A | NOT NULL | DEFAULT CURRENT\_DATE | PK | Fecha en que se aplicó la vacuna. Parte de la clave primaria compuesta para permitir múltiples aplicaciones de la misma vacuna en diferentes fechas. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.pets | pet\_id | N:1 | CASCADE / CASCADE | Un registro de vacunación pertenece a una única mascota. Si la mascota se elimina, su historial de vacunas también se elimina. |
| public.vaccines\_catalog | vaccine\_id | N:1 | CASCADE / CASCADE | Un registro de vacunación pertenece a una única vacuna del catálogo. |

### **ENTIDAD: public.volunteer\_applications**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.volunteer\_applications |
| Función/Descripción de la Entidad | Almacena las solicitudes iniciales de personas interesadas en ser voluntarios. Actúa como una "zona de staging" antes de crear un perfil formal en la plataforma. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| application\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único de la solicitud de voluntariado. |
| first\_name | VARCHAR | 100 | NOT NULL | N/A |  | Nombre de pila del solicitante. |
| last\_name | VARCHAR | 100 | NOT NULL | N/A |  | Apellido del solicitante. |
| email | VARCHAR | 255 | NOT NULL | N/A |  | Correo electrónico de contacto. |
| doc\_number | VARCHAR | 50 | NOT NULL | N/A |  | Número de documento de identidad (clave para evitar reingresos duplicados). |
| phone | VARCHAR | 20 | NOT NULL | N/A |  | Número de teléfono de contacto. |
| birth\_date | DATE | N/A | NOT NULL | N/A |  | Fecha de nacimiento del solicitante. |
| instagram\_handle | VARCHAR | 100 | NULL | N/A |  | Usuario de Instagram (opcional). |
| has\_experience | BOOLEAN | N/A | NOT NULL | DEFAULT false |  | Indica si el solicitante tiene experiencia previa en rescate o cuidado animal. |
| experience\_details | TEXT | N/A | NULL | N/A |  | Descripción detallada de la experiencia previa (si aplica). |
| was\_volunteer\_before | BOOLEAN | N/A | NOT NULL | DEFAULT false |  | Indica si ya fue voluntario en otra fundación. |
| motivation | TEXT | N/A | NOT NULL | N/A |  | Motivación personal para unirse como voluntario. |
| availability | JSONB | N/A | NOT NULL | N/A |  | Disponibilidad horaria (días y turnos) en formato estructurado. |
| status | ENUM (volunteer\_app\_status) | N/A | NOT NULL | DEFAULT 'PENDING' |  | Estado actual de la solicitud: 'PENDING', 'INTERVIEW\_SCHEDULED', 'APPROVED', 'REJECTED'. |
| admin\_notes | TEXT | N/A | NULL | N/A |  | Observaciones internas del administrador (ej. resultado de entrevista). |
| applied\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora de envío de la solicitud. |
| decided\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha en que se tomó la decisión final (aprobación o rechazo). |

Relaciones y Políticas Referenciales

Esta tabla es independiente y no tiene llaves foráneas, ya que representa datos de personas externas aún no registradas en el sistema.

### **ENTIDAD: public.volunteer\_roles**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.volunteer\_roles |
| Función/Descripción de la Entidad | Catálogo de roles operativos que pueden asignarse a los voluntarios activos (ej. "Rescatista", "Encargado de Redes Sociales"). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| role\_id | SERIAL | N/A | NOT NULL | PRIMARY KEY | PK | Identificador auto-incremental del rol de voluntario. |
| name | VARCHAR | 100 | NOT NULL | UNIQUE |  | Nombre del rol (ej. "Paseador", "Fotógrafo"). |
| description | TEXT | N/A | NULL | N/A |  | Descripción detallada de las responsabilidades asociadas al rol. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.volunteers | volunteer\_role\_id | 1:N | SET NULL / CASCADE | Un rol puede estar asignado a múltiples voluntarios. Si se elimina el rol, el campo en volunteers se pone a NULL. |

### **ENTIDAD: public.interviews**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.interviews |
| Función/Descripción de la Entidad | Registra entrevistas realizadas como parte de procesos de selección, tanto para adopciones como para voluntariado, usando una relación polimórfica. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| interview\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único de la entrevista. |
| interviewer\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Usuario administrador que realiza la entrevista. |
| entity\_type | VARCHAR | 50 | NOT NULL | N/A |  | Tipo de entidad entrevistada: 'ADOPTION\_APPLICATION' o 'VOLUNTEER\_APPLICATION'. |
| entity\_id | UUID | N/A | NOT NULL | N/A |  | ID de la solicitud (de adopción o voluntariado) asociada. |
| scheduled\_at | TIMESTAMPTZ | N/A | NOT NULL | N/A |  | Fecha y hora programada para la entrevista. |
| duration\_minutes | SMALLINT | N/A | NOT NULL | DEFAULT 30 |  | Duración estimada en minutos. |
| modality | ENUM (interview\_modality) | N/A | NOT NULL | N/A |  | Modalidad: 'IN\_PERSON', 'VIRTUAL', 'PHONE'. |
| location\_details | VARCHAR | 255 | NULL | N/A |  | Detalles de ubicación (física o enlace virtual). |
| result | ENUM (interview\_result) | N/A | NOT NULL | DEFAULT 'PENDING' |  | Resultado: 'PENDING', 'POSITIVE', 'NEGATIVE', 'ABSENT', 'RESCHEDULED'. |
| observations | TEXT | N/A | NULL | N/A |  | Notas del entrevistador sobre la sesión. |
| occurred\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha y hora real en que se realizó la entrevista. |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha de creación del registro. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | interviewer\_id | N:1 | RESTRICT / CASCADE | Una entrevista es conducida por un único administrador. No se permite eliminar un admin si tiene entrevistas registradas. |
| *(Polimórfica)* | entity\_type, entity\_id | N:1 (lógica) | N/A | Relación lógica. No hay FK física; la aplicación gestiona la coherencia. |

### **ENTIDAD: public.news**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.news |
| Función/Descripción de la Entidad | Gestiona la publicación de noticias o artículos informativos en la plataforma. Actúa como cabecera para sus traducciones multilingües. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| news\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único de la noticia. |
| author\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Usuario administrador que escribe la noticia. |
| status | ENUM (publication\_status) | N/A | NOT NULL | DEFAULT 'DRAFT' |  | Estado de publicación: 'DRAFT', 'PUBLISHED', 'ARCHIVED'. |
| published\_at | TIMESTAMPTZ | N/A | NULL | DEFAULT NOW() |  | Fecha y hora oficial de publicación (cuando el estado pasa a 'PUBLISHED'). |
| deleted\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha de eliminación lógica (soft delete). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | author\_id | N:1 | SET NULL / CASCADE | Una noticia es escrita por un único autor. Si el autor se elimina, la noticia pierde su autor pero no se borra. |
| public.news\_translations | news\_id | 1:N | CASCADE / CASCADE | Una noticia puede tener múltiples traducciones (una por idioma soportado). |

### **ENTIDAD: public.news\_translations**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.news\_translations |
| Función/Descripción de la Entidad | Almacena el contenido traducido de una noticia para cada idioma soportado, incluyendo metadatos SEO. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| news\_id | UUID | N/A | NOT NULL | FK a public.news | PK, FK | Noticia a la que pertenece la traducción. |
| language | ENUM (language\_code) | N/A | NOT NULL | N/A | PK | Código del idioma ('es', 'en', 'pt'). Parte de la clave primaria. |
| title | VARCHAR | 255 | NOT NULL | N/A |  | Título de la noticia en el idioma correspondiente. |
| excerpt | VARCHAR | 500 | NULL | N/A |  | Resumen corto de la noticia para vistas de listado. |
| content | TEXT | N/A | NOT NULL | N/A |  | Contenido completo del artículo. |
| slug | VARCHAR | 255 | NOT NULL | UNIQUE (parcial) |  | Identificador único amigable para URL (ej. 'rescate-perro-2024'). |
| meta\_title | VARCHAR | 255 | NULL | N/A |  | Título para SEO (etiqueta \<title\>). |
| meta\_description | VARCHAR | 500 | NULL | N/A |  | Descripción para SEO (metadato description). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.news | news\_id | N:1 | CASCADE / CASCADE | Una traducción pertenece a una única noticia. Si la noticia se elimina, todas sus traducciones se eliminan. |

### **ENTIDAD: public.resources**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.resources |
| Función/Descripción de la Entidad | Gestiona recursos estáticos como guías, manuales o artículos de ayuda. Es análogo a news pero para contenido evergreen (perenne). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| resource\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único del recurso. |
| author\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Autor administrador del recurso. |
| status | ENUM (publication\_status) | N/A | NOT NULL | DEFAULT 'DRAFT' |  | Estado de publicación. |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha de creación del recurso. |
| last\_updated\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha de la última actualización. |
| sort\_order | SMALLINT | N/A | NOT NULL | DEFAULT 0 |  | Orden de visualización en listas (ej. menú de ayuda). |
| deleted\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha de eliminación lógica. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | author\_id | N:1 | SET NULL / CASCADE | Un recurso tiene un autor. Si se elimina, el recurso pierde su autor. |
| public.resources\_translations | resource\_id | 1:N | CASCADE / CASCADE | Cada recurso puede estar traducido a múltiples idiomas. |

### **ENTIDAD: public.resources\_translations**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.resources\_translations |
| Función/Descripción de la Entidad | Almacena la traducción de un recurso para un idioma específico, con su propio contenido y metadatos SEO. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| resource\_id | UUID | N/A | NOT NULL | FK a public.resources | PK, FK | Recurso al que pertenece la traducción. |
| language | ENUM (language\_code) | N/A | NOT NULL | N/A | PK | Idioma de la traducción. |
| title | VARCHAR | 255 | NOT NULL | N/A |  | Título del recurso en el idioma dado. |
| content | TEXT | N/A | NOT NULL | N/A |  | Contenido completo del recurso. |
| slug | VARCHAR | 255 | NOT NULL | UNIQUE (parcial) |  | Slug amigable para la URL. |
| meta\_title | VARCHAR | 255 | NULL | N/A |  | Título para SEO. |
| meta\_description | VARCHAR | 500 | NULL | N/A |  | Descripción para SEO. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| public.resources | resource\_id | N:1 | CASCADE / CASCADE | Si se elimina un recurso, todas sus traducciones se eliminan. |

### **ENTIDAD: public.ui\_fragments**

| Propiedad | Valor |
| :---- | :---- |
| **Nombre de la Entidad** | public.ui\_fragments |
| **Función/Descripción** | Almacena fragmentos de interfaz dinámicos (textos, imágenes, configuraciones) que permiten al administrador gestionar el contenido visual del Frontend sin necesidad de despliegues de código (Content-Driven UI). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud | Nulabilidad | Restricciones | PK/FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **fragment\_key** | VARCHAR | 100 | NOT NULL |  | PK | Identificador lógico único del fragmento (ej. 'home\_hero\_title'). Parte de la clave primaria compuesta. |
| **language** | ENUM (language\_code) | N/A | NOT NULL | DEFAULT 'es' | PK | Idioma del contenido. Parte de la clave primaria compuesta. |
| **description** | VARCHAR | 255 | NULL | N/A |  | Descripción interna para ayudar al administrador a identificar qué está editando. |
| **type** | ENUM (ui\_component\_type) | N/A | NOT NULL | N/A |  | Tipo de componente visual: 'TEXT', 'RICH\_TEXT', 'IMAGE\_URL', 'CAROUSEL\_LIST', 'CONFIG', 'LINK'. |
| **section** | ENUM (ui\_section) | N/A | NOT NULL | N/A |  | Sección de la aplicación donde se renderiza: 'HOME', 'FOOTER', 'NAVBAR', 'ADOPTIONS', etc. |
| **content** | JSONB | N/A | NOT NULL | N/A |  | El contenido real del fragmento. Su estructura depende del type (ej. un string simple o un array de objetos para carrusel). |
| **last\_updated\_at** | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora de la última modificación. |
| **updated\_by** | UUID | N/A | NULL | FK a auth.users | FK | Usuario administrador que realizó la última modificación. |

Relaciones y Políticas Referenciales

| Entidad Relacionada | Campo FK | Cardinalidad | Políticas (DELETE/UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | updated\_by | N:1 | SET NULL / CASCADE | Registra quién modificó el contenido. Si el usuario se elimina, se mantiene el registro histórico (anónimo). |

### **ENTIDAD: public.sponsors**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.sponsors |
| Función/Descripción de la Entidad | Registra a los patrocinadores o aliados corporativos de la fundación, cuyos logos y datos se muestran en la web. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| sponsor\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único del patrocinador. |
| name | VARCHAR | 100 | NOT NULL | N/A |  | Nombre comercial del patrocinador. |
| website\_url | VARCHAR | 255 | NULL | N/A |  | Sitio web oficial del patrocinador. |
| contact\_name | VARCHAR | 100 | NULL | UNIQUE |  | Nombre de la persona de contacto. |
| contact\_email | VARCHAR | 255 | NULL | UNIQUE |  | Email de contacto. |
| contact\_phone | VARCHAR | 20 | NULL | UNIQUE |  | Teléfono de contacto. |
| sort\_order | SMALLINT | N/A | NOT NULL | DEFAULT 0 |  | Orden de visualización en el frontend. |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha de registro. |
| deleted\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha de eliminación lógica. |

Relaciones y Políticas Referenciales

Esta entidad no tiene FKs físicas. Su logo se almacena en public.media (con entity\_type \= 'SPONSOR') y su dirección en public.addresses (con entity\_type \= 'SPONSOR'), siguiendo el patrón polimórfico.

### **ENTIDAD: public.event\_registrations**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.event\_registrations |
| Función/Descripción de la Entidad | Registra la inscripción de un usuario a un evento, incluyendo la opción de pago seleccionada y el estado del pago (si aplica). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| user\_id | UUID | N/A | NOT NULL | FK a auth.users | PK, FK | Usuario que se inscribe al evento. |
| event\_id | UUID | N/A | NOT NULL | FK a public.events | PK, FK | Evento al que se inscribe el usuario. |
| registered\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora de la inscripción. |
| selected\_payment\_option | ENUM (event\_payment\_option) | N/A | NOT NULL | N/A |  | Opción de pago elegida: 'FREE', 'ONLINE\_PAYMENT', 'ON\_SITE\_CASH', 'IN\_KIND\_DONATION'. |
| payment\_status | ENUM (registration\_payment\_status) | N/A | NOT NULL | DEFAULT 'NA' |  | Estado del pago. 'NA' si el evento es gratuito. |
| agreed\_price\_snapshot | NUMERIC(12, 2\) | N/A | NULL | N/A |  | Precio acordado al momento de la inscripción (para auditoría). |
| agreed\_in\_kind\_snapshot | TEXT | N/A | NULL | N/A |  | Descripción de la donación en especie acordada (si aplica). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | user\_id | N:1 | CASCADE / CASCADE | Una inscripción pertenece a un único usuario. |
| public.events | event\_id | N:1 | CASCADE / CASCADE | Una inscripción está vinculada a un único evento. |

### **ENTIDAD: public.attendances**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.attendances |
| Función/Descripción de la Entidad | Registra la asistencia física de un usuario a una entidad comprobable (evento, capacitación, etc.) mediante un sistema polimórfico. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| attendance\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único del registro de asistencia. |
| user\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Usuario que asiste. |
| checked\_in\_by | UUID | N/A | NULL | FK a auth.users | FK | Administrador que registra la asistencia (puede ser NULL si es auto-check-in). |
| entity\_type | VARCHAR | 50 | NOT NULL | N/A |  | Tipo de entidad a la que asiste (ej. 'EVENT', 'TRAINING'). |
| entity\_id | UUID | N/A | NOT NULL | N/A |  | ID de la entidad a la que asiste. |
| check\_in\_time | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora del registro de asistencia. |
| notes | TEXT | N/A | NULL | N/A |  | Observaciones adicionales (ej. "Llegó con donación"). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users (asistente) | user\_id | N:1 | CASCADE / CASCADE | La asistencia pertenece a un usuario. |
| auth.users (registrador) | checked\_in\_by | N:1 | SET NULL / CASCADE | El registrador puede ser eliminado sin afectar la asistencia. |
| *(Polimórfica)* | entity\_type, entity\_id | N:1 (lógica) | N/A | Relación lógica gestionada por la aplicación. |

### **ENTIDAD: public.comments**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.comments |
| Función/Descripción de la Entidad | Almacena comentarios publicados por usuarios en cualquier entidad del sistema (noticias, eventos, mascotas, etc.) mediante una relación polimórfica. Soporta respuestas anidadas (comentarios multinivel). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| comment\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único del comentario. |
| author\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Usuario que publicó el comentario. |
| entity\_type | VARCHAR | 50 | NOT NULL | N/A |  | Tipo de entidad comentada (ej. 'NEWS', 'EVENT', 'PET'). |
| entity\_id | UUID | N/A | NOT NULL | N/A |  | ID de la entidad comentada. |
| content | TEXT | N/A | NOT NULL | N/A |  | Contenido del comentario. |
| moderation\_status | ENUM (moderation\_status) | N/A | NOT NULL | DEFAULT 'PUBLISHED' |  | Estado de moderación: determina si el comentario es visible o no. |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora de creación. |
| last\_updated\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Última fecha de edición (para transparencia). |
| parent\_comment\_id | UUID | N/A | NULL | FK a public.comments | FK | Comentario padre (para respuestas anidadas). Puede ser NULL. |
| deleted\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha de eliminación lógica (soft delete). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | author\_id | N:1 | CASCADE / CASCADE | Si el autor se elimina, sus comentarios se eliminan. |
| public.comments | parent\_comment\_id | N:1 | CASCADE / CASCADE | Si un comentario padre se elimina, todas sus respuestas también se eliminan. |
| *(Polimórfica)* | entity\_type, entity\_id | N:1 (lógica) | N/A | Relación gestionada por la aplicación. |

### **ENTIDAD: public.likes**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.likes |
| Función/Descripción de la Entidad | Registra "me gusta" de usuarios sobre cualquier entidad del sistema (noticias, comentarios, eventos, etc.) mediante una relación polimórfica, garantizando unicidad por usuario y entidad. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| like\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único del "like". |
| user\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Usuario que dio "me gusta". |
| entity\_type | VARCHAR | 50 | NOT NULL | N/A |  | Tipo de entidad a la que se dio like. |
| entity\_id | UUID | N/A | NOT NULL | N/A |  | ID de la entidad a la que se dio like. |
| liked\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora del like. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | user\_id | N:1 | CASCADE / CASCADE | Si el usuario se elimina, sus likes también se eliminan. |
| *(Polimórfica)* | entity\_type, entity\_id | N:1 (lógica) | N/A | Relación lógica. |

Nota: La restricción UNIQUE (user\_id, entity\_type, entity\_id) garantiza que un usuario no pueda dar más de un like a la misma entidad.

### **ENTIDAD: public.reports**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.reports |
| Función/Descripción de la Entidad | Registra denuncias de usuarios sobre contenido inapropiado (comentarios, perfiles, etc.), permitiendo a los administradores tomar acciones de moderación. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| report\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único del reporte. |
| reporter\_id | UUID | N/A | NULL | FK a auth.users | FK | Usuario que realizó la denuncia. Puede ser NULL (denuncia anónima). |
| entity\_type | VARCHAR | 50 | NOT NULL | N/A |  | Tipo de entidad denunciada. |
| entity\_id | UUID | N/A | NOT NULL | N/A |  | ID de la entidad denunciada. |
| reason | ENUM (report\_reason) | N/A | NOT NULL | N/A |  | Motivo de la denuncia: 'SPAM', 'OFFENSIVE', etc. |
| description | TEXT | N/A | NULL | N/A |  | Descripción adicional del reporte. |
| is\_resolved | BOOLEAN | N/A | NOT NULL | DEFAULT false |  | Indica si el reporte ya fue revisado y resuelto por un admin. |
| reported\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora de la denuncia. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | reporter\_id | N:1 | SET NULL / CASCADE | Si el denunciante se elimina, el reporte se mantiene (como anónimo). |
| *(Polimórfica)* | entity\_type, entity\_id | N:1 (lógica) | N/A | Relación lógica. |

Nota: La restricción UNIQUE (reporter\_id, entity\_type, entity\_id) evita reportes duplicados del mismo usuario sobre la misma entidad.

### **ENTIDAD: public.transactions**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.transactions |
| Función/Descripción de la Entidad | Registra todas las transacciones monetarias procesadas por proveedores externos (Mercado Pago, etc.). Actúa como bitácora de pagos para auditoría financiera. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| transaction\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único de la transacción. |
| user\_id | UUID | N/A | NULL | FK a auth.users | FK | Usuario que realizó el pago. Puede ser NULL en donaciones anónimas. |
| amount\_total | NUMERIC(12, 2\) | N/A | NOT NULL | CHECK (\> 0\) |  | Monto total cobrado, en la moneda especificada. |
| currency | CHAR | 3 | NOT NULL | DEFAULT 'ARS', FK a public.currencies | FK | Código ISO 4217 de la moneda (ej. 'ARS', 'USD'). |
| provider | ENUM (payment\_provider) | N/A | NOT NULL | N/A |  | Proveedor de pago: 'MERCADOPAGO', 'STRIPE', etc. |
| external\_transaction\_id | VARCHAR | 255 | NULL | UNIQUE |  | ID de la transacción en el sistema del proveedor (ej. Mercado Pago). |
| external\_reference\_id | VARCHAR | 255 | NULL | N/A |  | Referencia adicional del proveedor. |
| method | ENUM (payment\_method\_type) | N/A | NULL | N/A |  | Tipo de método: 'CREDIT\_CARD', 'TRANSFER', etc. |
| method\_detail | VARCHAR | 100 | NULL | N/A |  | Detalle adicional (ej. tipo de cuenta, marca de tarjeta). |
| status | ENUM (transaction\_status) | N/A | NOT NULL | DEFAULT 'PENDING' |  | Estado actual: 'PENDING', 'APPROVED', 'REJECTED', etc. |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora de creación del registro. |
| processed\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha en que se confirmó el pago (cuando status \= 'APPROVED'). |
| origin\_type | VARCHAR | 50 | NOT NULL | N/A |  | Tipo de entidad que originó la transacción: 'MONETARY\_DONATION', 'EVENT\_REGISTRATION'. |
| origin\_id | UUID | N/A | NOT NULL | N/A |  | ID de la entidad origen (ej. donation\_id). |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | user\_id | N:1 | SET NULL / CASCADE | Una transacción puede estar asociada a un usuario o ser anónima. |
| public.currencies | currency | N:1 | RESTRICT / CASCADE | La moneda debe existir y no se puede eliminar si hay transacciones. |

### **ENTIDAD: public.monetary\_donations**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.monetary\_donations |
| Función/Descripción de la Entidad | Registra donaciones monetarias de usuarios, desacopladas del procesamiento del pago (que ocurre en transactions). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| donation\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único de la donación. |
| user\_id | UUID | N/A | NULL | FK a auth.users | FK | Donante registrado. Puede ser NULL (anónimo). |
| target\_amount | NUMERIC(12, 2\) | N/A | NOT NULL | N/A |  | Monto objetivo de la donación. |
| currency | CHAR | 3 | NOT NULL | DEFAULT 'ARS', FK a public.currencies | FK | Moneda de la donación. |
| thank\_you\_message | TEXT | N/A | NULL | N/A |  | Mensaje opcional del donante. |
| is\_anonymous | BOOLEAN | N/A | NOT NULL | DEFAULT false |  | Indica si el donante desea permanecer anónimo. |
| is\_confirmed | BOOLEAN | N/A | NOT NULL | DEFAULT false |  | Indica si la donación fue confirmada (tras webhook de pago). |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha de creación de la solicitud de donación. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | user\_id | N:1 | SET NULL / CASCADE | Una donación puede ser anónima o asociada a un usuario. |
| public.currencies | currency | N:1 | RESTRICT / CASCADE | La moneda debe existir. |

### **ENTIDAD: public.in\_kind\_donations**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.in\_kind\_donations |
| Función/Descripción de la Entidad | Registra donaciones en especie (alimentos, materiales, etc.), con identificación manual o vinculada a un usuario. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| donation\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único de la donación en especie. |
| user\_id | UUID | N/A | NULL | FK a auth.users | FK | Donante registrado (si aplica). |
| manual\_donor\_name | VARCHAR | 100 | NULL | N/A |  | Nombre del donante si no está registrado. |
| manual\_donor\_contact | VARCHAR | 100 | NULL | N/A |  | Contacto del donante no registrado. |
| description | TEXT | N/A | NOT NULL | N/A |  | Descripción detallada de los ítems donados. |
| estimated\_value | NUMERIC(12, 2\) | N/A | NOT NULL | DEFAULT 0 |  | Valor estimado en ARS o USD para reportes. |
| received\_by\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Voluntario o admin que recibió la donación. |
| received\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora de recepción física. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users (donante) | user\_id | N:1 | SET NULL / CASCADE | El donante puede no estar registrado. |
| auth.users (receptor) | received\_by\_id | N:1 | RESTRICT / CASCADE | Quien recibe la donación debe ser un usuario activo. |

Nota: La restricción CHECK (user\_id IS NOT NULL OR manual\_donor\_name IS NOT NULL) garantiza que siempre haya una forma de identificar al donante.

### **ENTIDAD: public.on\_site\_collections**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.on\_site\_collections |
| Función/Descripción de la Entidad | Registra contribuciones recibidas en eventos presenciales: efectivo en puerta o insumos físicos. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| collection\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único de la recolección. |
| user\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Usuario que realizó la contribución. |
| entity\_type | VARCHAR | 50 | NOT NULL | N/A |  | Tipo de evento o actividad: 'EVENT'. |
| entity\_id | UUID | N/A | NOT NULL | N/A |  | ID del evento asociado. |
| type | ENUM (physical\_contribution\_type) | N/A | NOT NULL | N/A |  | Tipo: 'CASH\_ON\_SITE', 'MATERIAL\_SUPPLY', 'FOOD\_SUPPLY'. |
| description | TEXT | N/A | NOT NULL | N/A |  | Descripción de lo recibido. |
| estimated\_value | NUMERIC(12, 2\) | N/A | NOT NULL | DEFAULT 0 |  | Valor estimado (para caja o estadísticas). |
| currency | CHAR | 3 | NOT NULL | DEFAULT 'ARS', FK a public.currencies | FK | Moneda de estimación. |
| received\_by\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Usuario que registró la contribución. |
| received\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora de registro. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users (contribuyente) | user\_id | N:1 | RESTRICT / CASCADE | El contribuyente debe existir. |
| auth.users (registrador) | received\_by\_id | N:1 | RESTRICT / CASCADE | El registrador debe existir. |
| public.currencies | currency | N:1 | RESTRICT / CASCADE | La moneda debe existir. |

### **ENTIDAD: public.payment\_methods**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.payment\_methods |
| Función/Descripción de la Entidad | Almacena métodos de pago tokenizados de usuarios (ej. tarjetas guardadas en Mercado Pago). |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| method\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único del método de pago. |
| user\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Usuario propietario del método. |
| provider | ENUM (payment\_provider) | N/A | NOT NULL | DEFAULT 'MERCADOPAGO' |  | Proveedor de pago (Mercado Pago, etc.). |
| external\_token | VARCHAR | 255 | NOT NULL | N/A |  | Token seguro del proveedor (ej. customer\_card\_id). |
| card\_brand | VARCHAR | 50 | NULL | N/A |  | Marca de la tarjeta: 'visa', 'master', etc. |
| last\_four | VARCHAR | 4 | NULL | N/A |  | Últimos 4 dígitos para identificación visual. |
| description | VARCHAR | 100 | NULL | N/A |  | Nombre amigable: "Visa terminada en 4242". |
| is\_default | BOOLEAN | N/A | NOT NULL | DEFAULT false |  | Indica si es el método predeterminado del usuario. |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha de registro del método. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | user\_id | N:1 | CASCADE / CASCADE | Si se elimina un usuario, sus métodos de pago también se eliminan. |

### **ENTIDAD: public.notifications**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.notifications |
| Función/Descripción de la Entidad | Almacena notificaciones dirigidas a usuarios, ya sean por email o dentro del sistema (in-app), con seguimiento de estado y reintentos para garantizar entrega. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| notification\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único de la notificación. |
| user\_id | UUID | N/A | NOT NULL | FK a auth.users | FK | Usuario destinatario de la notificación. |
| type | ENUM (notification\_type) | N/A | NOT NULL | N/A |  | Tipo: 'EMAIL' o 'SYSTEM'. |
| subject | VARCHAR | 255 | NULL | N/A |  | Asunto del mensaje (usado en emails). |
| body | TEXT | N/A | NOT NULL | N/A |  | Contenido completo del mensaje. |
| status | ENUM (notification\_status) | N/A | NOT NULL | DEFAULT 'PENDING' |  | Estado actual: 'PENDING', 'SENT', 'FAILED'. |
| retry\_count | SMALLINT | N/A | NOT NULL | DEFAULT 0 |  | Número de reintentos realizados tras fallo. |
| error\_detail | TEXT | N/A | NULL | N/A |  | Mensaje de error del último intento fallido. |
| created\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha de creación de la notificación. |
| sent\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha en que se confirmó el envío exitoso. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | user\_id | N:1 | CASCADE / CASCADE | Una notificación pertenece a un único usuario. Si el usuario se elimina, la notificación también se elimina. |

### **ENTIDAD: public.incoming\_webhooks**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.incoming\_webhooks |
| Función/Descripción de la Entidad | Registra todos los webhooks entrantes (ej. de Mercado Pago, Cloudflare) para su procesamiento asíncrono y auditoría, evitando pérdida de eventos. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| webhook\_id | UUID | N/A | NOT NULL | DEFAULT gen\_random\_uuid() | PK | Identificador único del webhook recibido. |
| source | VARCHAR | 50 | NOT NULL | N/A |  | Origen del webhook: 'MERCADOPAGO', 'CLOUDFLARE', etc. |
| payload | JSONB | N/A | NOT NULL | N/A |  | Cuerpo completo del webhook en formato JSON. |
| is\_processed | BOOLEAN | N/A | NOT NULL | DEFAULT false |  | Indica si el webhook ya fue procesado por un worker. |
| received\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora de recepción. |
| processing\_error | TEXT | N/A | NULL | N/A |  | Detalle del error si el procesamiento falló. |

Relaciones y Políticas Referenciales

Esta tabla no tiene llaves foráneas. Es una cola de entrada independiente.

### **ENTIDAD: public.job\_history**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.job\_history |
| Función/Descripción de la Entidad | Registra el historial de ejecución de tareas programadas (jobs) como backups, generación de sitemaps o envío de reportes. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| job\_id | BIGSERIAL | N/A | NOT NULL | PRIMARY KEY | PK | Identificador auto-incremental del registro de job. |
| job\_name | VARCHAR | 100 | NOT NULL | N/A |  | Nombre descriptivo del job (ej. 'daily\_backup'). |
| started\_at | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora de inicio de la ejecución. |
| ended\_at | TIMESTAMPTZ | N/A | NULL | N/A |  | Fecha y hora de finalización. |
| status | VARCHAR | 50 | NULL | N/A |  | Estado final: 'SUCCESS', 'FAILURE', 'TIMEOUT'. |
| details | JSONB | N/A | NULL | N/A |  | Información adicional: logs, duración, errores, etc. |

Relaciones y Políticas Referenciales

Esta tabla es autónoma y no tiene relaciones con otras entidades.

### **ENTIDAD: public.audit\_logs**

| Propiedad | Valor |
| :---- | :---- |
| Nombre de la Entidad | public.audit\_logs |
| Función/Descripción de la Entidad | Bitácora forense de todas las acciones críticas en el sistema, incluyendo quién hizo qué, desde dónde y cuándo. Esencial para cumplimiento y diagnóstico. |

Estructura de Campos (Atributos)

| Nombre del Campo | Tipo de Dato | Longitud (si aplica) | Nulabilidad (NULL/NOT NULL) | Restricciones Adicionales | PK / FK | Descripción y Regla de Negocio |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| log\_id | BIGSERIAL | N/A | NOT NULL | PRIMARY KEY | PK | Identificador auto-incremental del log. |
| timestamp | TIMESTAMPTZ | N/A | NOT NULL | DEFAULT NOW() |  | Fecha y hora exacta de la acción. |
| action | VARCHAR | 100 | NOT NULL | N/A |  | Descripción de la acción: 'LOGIN', 'ADOPTION\_APPROVED', 'USER\_DELETED'. |
| user\_id | UUID | N/A | NULL | FK a auth.users | FK | Usuario que realizó la acción. Puede ser NULL para acciones del sistema. |
| ip\_address | VARCHAR | 45 | NULL | N/A |  | Dirección IP del cliente (IPv4/IPv6). |
| user\_agent | TEXT | N/A | NULL | N/A |  | Cadena del navegador/dispositivo. |
| entity\_type | VARCHAR | 50 | NULL | N/A |  | Tipo de entidad afectada (ej. 'PET', 'DONATION'). |
| entity\_id | UUID | N/A | NULL | N/A |  | ID de la entidad afectada. |
| details | JSONB | N/A | NULL | N/A |  | Información contextual: datos antiguos/nuevos, razones, etc. |

Relaciones y Políticas Referenciales

| Entidad Relacionada (Referencia) | Campo FK en la Tabla Actual | Cardinalidad | Políticas Referenciales (ON DELETE/ON UPDATE) | Explicación |
| :---- | :---- | :---- | :---- | :---- |
| auth.users | user\_id | N:1 | SET NULL / CASCADE | Un log puede estar asociado a un usuario o a una acción del sistema. |

