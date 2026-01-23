/**
 * @file Finance Swagger Schemas
 * @description OpenAPI/Swagger schemas for Finance module
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TransactionStatus:
 *       type: string
 *       enum:
 *         - PENDING
 *         - APPROVED
 *         - REJECTED
 *         - REFUNDED
 *         - PROCESSING
 *       description: Estado de la transacción financiera
 *
 *     PaymentProvider:
 *       type: string
 *       enum:
 *         - MERCADOPAGO
 *         - STRIPE
 *         - PAYPAL
 *         - BANK_TRANSFER
 *         - CASH_REGISTER
 *       description: Proveedor de pago
 *
 *     PaymentMethodType:
 *       type: string
 *       enum:
 *         - CREDIT_CARD
 *         - DEBIT_CARD
 *         - ACCOUNT_MONEY
 *         - CASH_TICKET
 *         - TRANSFER
 *         - OTHER
 *       description: Tipo de método de pago
 *
 *     Transaction:
 *       type: object
 *       required:
 *         - transactionId
 *         - amountTotal
 *         - currency
 *         - provider
 *         - status
 *         - originType
 *         - originId
 *       properties:
 *         transactionId:
 *           type: string
 *           format: uuid
 *           description: Identificador único de la transacción
 *         userId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID del usuario que realizó la transacción
 *         amountTotal:
 *           type: number
 *           description: Monto total de la transacción
 *           example: 5000
 *         currency:
 *           type: string
 *           description: Código de moneda ISO 4217
 *           example: "ARS"
 *         provider:
 *           $ref: '#/components/schemas/PaymentProvider'
 *         externalTransactionId:
 *           type: string
 *           nullable: true
 *           description: ID de la transacción en el proveedor externo
 *         externalReferenceId:
 *           type: string
 *           nullable: true
 *           description: Referencia externa personalizada
 *         method:
 *           $ref: '#/components/schemas/PaymentMethodType'
 *         methodDetail:
 *           type: string
 *           nullable: true
 *           description: Detalle del método de pago (ej. "Visa terminada en 1234")
 *         status:
 *           $ref: '#/components/schemas/TransactionStatus'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         processedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         originType:
 *           type: string
 *           description: Tipo de origen de la transacción
 *           example: "monetary_donation"
 *         originId:
 *           type: string
 *           format: uuid
 *           description: ID del registro origen (donación, adopción, etc.)
 *
 *     MonetaryDonation:
 *       type: object
 *       required:
 *         - donationId
 *         - targetAmount
 *         - currency
 *       properties:
 *         donationId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID del usuario donante (null si es anónimo)
 *         targetAmount:
 *           type: number
 *           description: Monto objetivo de la donación
 *         currency:
 *           type: string
 *           example: "ARS"
 *         thankYouMessage:
 *           type: string
 *           nullable: true
 *           description: Mensaje de agradecimiento del donante
 *         isAnonymous:
 *           type: boolean
 *           description: Si la donación es anónima
 *         isConfirmed:
 *           type: boolean
 *           nullable: true
 *           description: Si la donación fue confirmada por el equipo
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateMonetaryDonationDTO:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           description: Monto de la donación
 *           minimum: 100
 *           example: 5000
 *         currency:
 *           type: string
 *           description: Código de moneda (por defecto ARS)
 *           example: "ARS"
 *         isAnonymous:
 *           type: boolean
 *           description: Si desea permanecer anónimo
 *           default: false
 *         thankYouMessage:
 *           type: string
 *           description: Mensaje de agradecimiento opcional
 *
 *     InKindDonation:
 *       type: object
 *       required:
 *         - donationId
 *         - description
 *         - receivedById
 *         - receivedAt
 *       properties:
 *         donationId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID del usuario donante
 *         manualDonorName:
 *           type: string
 *           nullable: true
 *           description: Nombre del donante si no está registrado
 *         manualDonorContact:
 *           type: string
 *           nullable: true
 *           description: Contacto del donante no registrado
 *         description:
 *           type: string
 *           description: Descripción de los items donados
 *           example: "20kg de alimento balanceado para perros"
 *         estimatedValue:
 *           type: number
 *           nullable: true
 *           description: Valor estimado de la donación en especie
 *         receivedById:
 *           type: string
 *           format: uuid
 *           description: ID del voluntario que recibió la donación
 *         receivedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateInKindDonationDTO:
 *       type: object
 *       required:
 *         - description
 *       properties:
 *         description:
 *           type: string
 *           description: Descripción detallada de la donación
 *         estimatedValue:
 *           type: number
 *           description: Valor estimado en ARS
 *         manualDonorName:
 *           type: string
 *           description: Nombre del donante (si no está autenticado)
 *         manualDonorContact:
 *           type: string
 *           description: Email o teléfono del donante
 *
 *     MercadoPagoPreferenceResponse:
 *       type: object
 *       properties:
 *         preferenceId:
 *           type: string
 *           description: ID de la preferencia de Mercado Pago
 *         initPoint:
 *           type: string
 *           format: uri
 *           description: URL de checkout en producción
 *         sandboxInitPoint:
 *           type: string
 *           format: uri
 *           description: URL de checkout en sandbox
 *
 *     FinancialSummary:
 *       type: object
 *       properties:
 *         totalDonations:
 *           type: integer
 *           description: Número total de donaciones
 *         totalAmount:
 *           type: number
 *           description: Monto total de todas las donaciones
 *         pendingAmount:
 *           type: number
 *           description: Monto en estado PENDING
 *         approvedAmount:
 *           type: number
 *           description: Monto en estado APPROVED
 *         currency:
 *           type: string
 *           example: "ARS"
 */

// This file only contains JSDoc comments for Swagger - no executable code needed
export {};
