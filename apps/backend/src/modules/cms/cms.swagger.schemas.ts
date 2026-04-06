/**
 * @file CMS Swagger Schemas
 * @description OpenAPI/Swagger schemas for CMS module
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PublicationStatus:
 *       type: string
 *       enum:
 *         - DRAFT
 *         - PUBLISHED
 *         - ARCHIVED
 *       description: Estado de publicación del contenido
 *
 *     LanguageCode:
 *       type: string
 *       enum:
 *         - es
 *         - en
 *         - pt
 *       description: Código de idioma ISO 639-1
 *
 *     NewsTranslation:
 *       type: object
 *       required:
 *         - language
 *         - title
 *         - content
 *       properties:
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *         title:
 *           type: string
 *           description: Título de la noticia
 *           example: "Campaña de Adopción Febrero 2024"
 *         content:
 *           type: string
 *           description: Contenido completo en formato Markdown o HTML
 *           example: "Durante el mes de febrero, Fundación Paz Animal..."
 *         metaTitle:
 *           type: string
 *           description: Título SEO (máx. 60 caracteres)
 *           example: "Adopción de Mascotas - Febrero 2024"
 *         metaDescription:
 *           type: string
 *           description: Descripción SEO (máx. 160 caracteres)
 *           example: "Únete a nuestra campaña de adopción y da hogar a una mascota"
 *
 *     News:
 *       type: object
 *       required:
 *         - newsId
 *         - slug
 *         - status
 *         - authorId
 *         - createdAt
 *         - translations
 *       properties:
 *         newsId:
 *           type: string
 *           format: uuid
 *           description: Identificador único de la noticia
 *         slug:
 *           type: string
 *           description: URL-friendly identifier (auto-generado del título)
 *           example: "campana-adopcion-febrero-2024"
 *         status:
 *           $ref: '#/components/schemas/PublicationStatus'
 *         authorId:
 *           type: string
 *           format: uuid
 *           description: ID del usuario que creó la noticia
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha de publicación (null si es borrador)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NewsTranslation'
 *
 *     CreateNewsDTO:
 *       type: object
 *       required:
 *         - status
 *         - translations
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/PublicationStatus'
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de publicación (requerido si status es PUBLISHED)
 *         translations:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/NewsTranslation'
 *
 *     UpdateNewsDTO:
 *       type: object
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/PublicationStatus'
 *         publishedAt:
 *           type: string
 *           format: date-time
 *
 *     ResourceTranslation:
 *       type: object
 *       required:
 *         - language
 *         - title
 *         - content
 *       properties:
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *         title:
 *           type: string
 *           description: Título del recurso
 *           example: "Guía de Cuidados para Perros"
 *         content:
 *           type: string
 *           description: Contenido del recurso en Markdown/HTML
 *         downloadUrl:
 *           type: string
 *           format: uri
 *           description: URL de descarga del recurso (PDF, video, etc.)
 *         metaTitle:
 *           type: string
 *         metaDescription:
 *           type: string
 *
 *     Resource:
 *       type: object
 *       required:
 *         - resourceId
 *         - slug
 *         - status
 *         - authorId
 *         - translations
 *       properties:
 *         resourceId:
 *           type: string
 *           format: uuid
 *         slug:
 *           type: string
 *         status:
 *           $ref: '#/components/schemas/PublicationStatus'
 *         authorId:
 *           type: string
 *           format: uuid
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ResourceTranslation'
 *
 *     Sponsor:
 *       type: object
 *       required:
 *         - sponsorId
 *         - name
 *       properties:
 *         sponsorId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           description: Nombre del patrocinador/sponsor
 *           example: "Veterinaria Corrientes S.A."
 *         logoUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL del logo del sponsor
 *         websiteUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: Sitio web del sponsor
 *         contactEmail:
 *           type: string
 *           format: email
 *           nullable: true
 *         contactPhone:
 *           type: string
 *           nullable: true
 *         sortOrder:
 *           type: integer
 *           description: Orden de visualización (menor = primero)
 *           default: 0
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     CreateSponsorDTO:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         logoUrl:
 *           type: string
 *           format: uri
 *         websiteUrl:
 *           type: string
 *           format: uri
 *         contactEmail:
 *           type: string
 *           format: email
 *         contactPhone:
 *           type: string
 *         sortOrder:
 *           type: integer
 *
 *     UIComponentType:
 *       type: string
 *       enum:
 *         - TEXT
 *         - RICH_TEXT
 *         - IMAGE_URL
 *         - CAROUSEL_LIST
 *         - CONFIG
 *         - LINK
 *       description: Tipo de componente de interfaz
 *
 *     UISection:
 *       type: string
 *       enum:
 *         - GLOBAL
 *         - HOME
 *         - FOOTER
 *         - NAVBAR
 *         - ADOPTIONS
 *         - VOLUNTEERS
 *         - DONATIONS
 *         - CONTACT
 *         - ABOUT_US
 *       description: Sección de la UI donde se usa el fragmento
 *
 *     UIFragment:
 *       type: object
 *       required:
 *         - fragmentKey
 *         - language
 *         - type
 *         - section
 *       properties:
 *         fragmentKey:
 *           type: string
 *           description: Clave única del fragmento (ej. "hero.title", "footer.copyright")
 *           example: "hero.title"
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *         type:
 *           $ref: '#/components/schemas/UIComponentType'
 *         section:
 *           $ref: '#/components/schemas/UISection'
 *         content:
 *           type: object
 *           description: Contenido del fragmento (estructura depende del tipo)
 *           additionalProperties: true
 *           example:
 *             text: "Bienvenido a Paz Animal"
 *             url: "https://example.com/image.jpg"
 *         updatedBy:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     CreateUIFragmentDTO:
 *       type: object
 *       required:
 *         - fragmentKey
 *         - language
 *         - type
 *         - section
 *         - content
 *       properties:
 *         fragmentKey:
 *           type: string
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *         type:
 *           $ref: '#/components/schemas/UIComponentType'
 *         section:
 *           $ref: '#/components/schemas/UISection'
 *         content:
 *           type: object
 *           additionalProperties: true
 */

// This file only contains JSDoc comments for Swagger - no executable code needed
export {};
