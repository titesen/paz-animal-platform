/**
 * @file CMS Swagger Routes Documentation
 * @description OpenAPI/Swagger documentation for CMS endpoints
 */

/**
 * @swagger
 * /api/cms/news:
 *   get:
 *     tags:
 *       - CMS
 *     summary: Obtener noticias publicadas
 *     description: Retorna todas las noticias con estado PUBLISHED (público)
 *     responses:
 *       200:
 *         description: Lista de noticias publicadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     news:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/News'
 */

/**
 * @swagger
 * /api/cms/news/all:
 *   get:
 *     tags:
 *       - CMS
 *     summary: Obtener todas las noticias (admin)
 *     description: Retorna todas las noticias incluyendo borradores y archivadas
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de noticias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     news:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/News'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/cms/news/{newsId}:
 *   get:
 *     tags:
 *       - CMS
 *     summary: Obtener noticia por ID
 *     parameters:
 *       - in: path
 *         name: newsId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la noticia
 *     responses:
 *       200:
 *         description: Noticia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     news:
 *                       $ref: '#/components/schemas/News'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   put:
 *     tags:
 *       - CMS
 *     summary: Actualizar noticia
 *     description: Actualiza metadatos de la noticia (estado, fecha publicación)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: newsId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNewsDTO'
 *     responses:
 *       200:
 *         description: Noticia actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     news:
 *                       $ref: '#/components/schemas/News'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   delete:
 *     tags:
 *       - CMS
 *     summary: Eliminar noticia (soft delete)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: newsId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Noticia eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Noticia eliminada exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/cms/news/slug/{slug}:
 *   get:
 *     tags:
 *       - CMS
 *     summary: Obtener noticia por slug
 *     description: Busca una noticia por su slug URL-friendly
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug de la noticia
 *         example: "campana-adopcion-febrero-2024"
 *       - in: query
 *         name: lang
 *         schema:
 *           $ref: '#/components/schemas/LanguageCode'
 *         description: Idioma de la traducción
 *     responses:
 *       200:
 *         description: Noticia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     news:
 *                       $ref: '#/components/schemas/News'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/cms/news:
 *   post:
 *     tags:
 *       - CMS
 *     summary: Crear noticia
 *     description: Crea una nueva noticia con traducciones
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNewsDTO'
 *           example:
 *             status: "PUBLISHED"
 *             publishedAt: "2024-02-01T10:00:00Z"
 *             translations:
 *               - language: "es"
 *                 title: "Nueva campaña de adopción"
 *                 content: "Estamos emocionados de anunciar..."
 *                 metaTitle: "Adopción de mascotas - Febrero 2024"
 *                 metaDescription: "Únete a nuestra campaña de adopción"
 *     responses:
 *       201:
 *         description: Noticia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     news:
 *                       $ref: '#/components/schemas/News'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/cms/news/{newsId}/translations/{language}:
 *   put:
 *     tags:
 *       - CMS
 *     summary: Actualizar traducción de noticia
 *     description: Actualiza o crea una traducción específica de una noticia
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: newsId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/LanguageCode'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: Traducción actualizada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/cms/resources:
 *   get:
 *     tags:
 *       - CMS
 *     summary: Obtener recursos publicados
 *     description: Retorna todos los recursos educativos con estado PUBLISHED
 *     responses:
 *       200:
 *         description: Lista de recursos publicados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     resources:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Resource'
 *
 *   post:
 *     tags:
 *       - CMS
 *     summary: Crear recurso educativo
 *     description: Crea un nuevo recurso (guías, PDFs, videos)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - translations
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/PublicationStatus'
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *               translations:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ResourceTranslation'
 *     responses:
 *       201:
 *         description: Recurso creado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/cms/sponsors:
 *   get:
 *     tags:
 *       - CMS
 *     summary: Obtener sponsors activos
 *     description: Retorna todos los patrocinadores ordenados por sortOrder
 *     responses:
 *       200:
 *         description: Lista de sponsors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     sponsors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Sponsor'
 *
 *   post:
 *     tags:
 *       - CMS
 *     summary: Crear sponsor
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSponsorDTO'
 *     responses:
 *       201:
 *         description: Sponsor creado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/cms/fragments/{fragmentKey}:
 *   get:
 *     tags:
 *       - CMS
 *     summary: Obtener fragmento de UI por clave
 *     description: Retorna un fragmento de UI para renderizar contenido dinámico
 *     parameters:
 *       - in: path
 *         name: fragmentKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave del fragmento
 *         example: "hero.title"
 *       - in: query
 *         name: lang
 *         schema:
 *           $ref: '#/components/schemas/LanguageCode'
 *         description: Idioma del fragmento
 *     responses:
 *       200:
 *         description: Fragmento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     fragment:
 *                       $ref: '#/components/schemas/UIFragment'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   put:
 *     tags:
 *       - CMS
 *     summary: Upsert fragmento de UI
 *     description: Crea o actualiza un fragmento de UI (hot-swap)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fragmentKey
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUIFragmentDTO'
 *           example:
 *             fragmentKey: "hero.title"
 *             language: "es"
 *             type: "TEXT"
 *             section: "HOME"
 *             content:
 *               text: "Bienvenido a Fundación Paz Animal"
 *     responses:
 *       200:
 *         description: Fragmento actualizado/creado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/cms/fragments/{fragmentKey}/content:
 *   patch:
 *     tags:
 *       - CMS
 *     summary: Actualizar contenido de fragmento (hot-swap)
 *     description: Permite actualizar solo el contenido de un fragmento sin cambiar metadatos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fragmentKey
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: lang
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/LanguageCode'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Nuevo contenido del fragmento
 *     responses:
 *       200:
 *         description: Contenido actualizado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/cms/fragments/section/{section}:
 *   get:
 *     tags:
 *       - CMS
 *     summary: Obtener fragmentos por sección
 *     description: Retorna todos los fragmentos de UI de una sección específica
 *     parameters:
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/UISection'
 *         description: Sección de la UI
 *         example: "HOME"
 *       - in: query
 *         name: lang
 *         schema:
 *           $ref: '#/components/schemas/LanguageCode'
 *         description: Idioma de los fragmentos
 *     responses:
 *       200:
 *         description: Fragmentos de la sección
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     fragments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UIFragment'
 */

// This file only contains JSDoc comments for Swagger - no executable code needed
export {};
