/**
 * @file Finance Swagger Routes Documentation
 * @description OpenAPI/Swagger documentation for Finance endpoints
 */

/**
 * @swagger
 * /api/finance/donations/monetary:
 *   post:
 *     tags:
 *       - Donations
 *     summary: Crear donación monetaria
 *     description: |
 *       Crea una donación monetaria y retorna la preferencia de pago de Mercado Pago.
 *       El usuario será redirigido al checkout de Mercado Pago para completar el pago.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMonetaryDonationDTO'
 *           example:
 *             amount: 5000
 *             currency: "ARS"
 *             isAnonymous: false
 *             thankYouMessage: "Gracias por el increíble trabajo que hacen!"
 *     responses:
 *       201:
 *         description: Donación creada y preferencia de pago generada
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
 *                     donation:
 *                       $ref: '#/components/schemas/MonetaryDonation'
 *                     mercadoPagoPreference:
 *                       $ref: '#/components/schemas/MercadoPagoPreferenceResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/finance/donations/in-kind:
 *   post:
 *     tags:
 *       - Donations
 *     summary: Registrar donación en especie
 *     description: Registra una donación de bienes materiales (alimento, medicamentos, etc.)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInKindDonationDTO'
 *           example:
 *             description: "20kg alimento balanceado + 10 mantas"
 *             estimatedValue: 15000
 *             manualDonorName: "Juan Pérez"
 *             manualDonorContact: "juan@example.com"
 *     responses:
 *       201:
 *         description: Donación en especie registrada exitosamente
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
 *                     donation:
 *                       $ref: '#/components/schemas/InKindDonation'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/finance/donations/monetary:
 *   get:
 *     tags:
 *       - Donations
 *     summary: Obtener todas las donaciones monetarias
 *     description: Lista todas las donaciones monetarias (requiere rol ADMIN o VOLUNTEER con permisos)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de donaciones monetarias
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
 *                     donations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MonetaryDonation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/finance/donations/in-kind:
 *   get:
 *     tags:
 *       - Donations
 *     summary: Obtener todas las donaciones en especie
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de donaciones en especie
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
 *                     donations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/InKindDonation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/finance/transactions:
 *   get:
 *     tags:
 *       - Donations
 *     summary: Obtener todas las transacciones
 *     description: Lista todas las transacciones financieras del sistema
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transacciones
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
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/finance/summary:
 *   get:
 *     tags:
 *       - Donations
 *     summary: Obtener resumen financiero
 *     description: Retorna estadísticas agregadas de donaciones y transacciones
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen financiero
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
 *                     summary:
 *                       $ref: '#/components/schemas/FinancialSummary'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/finance/webhooks/mercadopago:
 *   post:
 *     tags:
 *       - Donations
 *     summary: Webhook de Mercado Pago
 *     description: |
 *       Endpoint para recibir notificaciones de Mercado Pago sobre el estado de los pagos.
 *       Este endpoint no requiere autenticación ya que es llamado por Mercado Pago.
 *
 *       **Seguridad**: Se valida la firma digital usando el secret de Mercado Pago.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               live_mode:
 *                 type: boolean
 *               type:
 *                 type: string
 *                 example: "payment"
 *               date_created:
 *                 type: string
 *                 format: date-time
 *               user_id:
 *                 type: integer
 *               api_version:
 *                 type: string
 *               action:
 *                 type: string
 *                 example: "payment.updated"
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID del pago en Mercado Pago
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *       400:
 *         description: Webhook inválido o datos incorrectos
 */

// This file only contains JSDoc comments for Swagger - no executable code needed
export {};
