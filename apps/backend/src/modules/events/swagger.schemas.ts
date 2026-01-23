/**
 * @file Events Swagger Schemas
 * @description OpenAPI/Swagger schemas for Events module
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EventModality:
 *       type: string
 *       enum:
 *         - VIRTUAL
 *         - IN_PERSON
 *         - HYBRID
 *       description: Modalidad del evento
 *
 *     EventPaymentOption:
 *       type: string
 *       enum:
 *         - FREE
 *         - ONLINE_PAYMENT
 *         - ON_SITE_CASH
 *         - IN_KIND_DONATION
 *       description: Opciones de pago para el evento
 *
 *     RegistrationPaymentStatus:
 *       type: string
 *       enum:
 *         - NA
 *         - PENDING
 *         - PAID
 *         - VERIFIED_ON_SITE
 *       description: Estado del pago de la inscripción
 *
 *     EventTranslation:
 *       type: object
 *       required:
 *         - language
 *         - title
 *       properties:
 *         language:
 *           $ref: '#/components/schemas/LanguageCode'
 *         title:
 *           type: string
 *           description: Título del evento
 *           example: "Caminata Solidaria por los Animales"
 *         description:
 *           type: string
 *           description: Descripción del evento
 *           example: "Únete a nuestra caminata mensual para recaudar fondos"
 *
 *     Event:
 *       type: object
 *       required:
 *         - eventId
 *         - creatorId
 *         - eventDate
 *         - modality
 *         - isFree
 *         - translations
 *       properties:
 *         eventId:
 *           type: string
 *           format: uuid
 *           description: Identificador único del evento
 *         creatorId:
 *           type: string
 *           format: uuid
 *           description: ID del usuario que creó el evento
 *         eventDate:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del evento
 *         virtualLink:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: Link de Zoom/Google Meet para eventos virtuales
 *         modality:
 *           $ref: '#/components/schemas/EventModality'
 *         isFree:
 *           type: boolean
 *           description: Indica si el evento es gratuito
 *         acceptsOnlinePayment:
 *           type: boolean
 *           description: Acepta pagos en línea
 *         onlinePrice:
 *           type: number
 *           nullable: true
 *           description: Precio para pago en línea
 *         acceptsOnSitePayment:
 *           type: boolean
 *           description: Acepta pagos en el lugar
 *         onSitePrice:
 *           type: number
 *           nullable: true
 *           description: Precio para pago en el lugar
 *         acceptsInKind:
 *           type: boolean
 *           description: Acepta donaciones en especie
 *         inKindDescription:
 *           type: string
 *           nullable: true
 *           description: Descripción de donaciones en especie aceptadas
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EventTranslation'
 *
 *     CreateEventDTO:
 *       type: object
 *       required:
 *         - eventDate
 *         - modality
 *         - isFree
 *         - translations
 *       properties:
 *         eventDate:
 *           type: string
 *           format: date-time
 *           description: Fecha del evento en formato ISO 8601
 *         modality:
 *           $ref: '#/components/schemas/EventModality'
 *         virtualLink:
 *           type: string
 *           format: uri
 *         isFree:
 *           type: boolean
 *         acceptsOnlinePayment:
 *           type: boolean
 *         onlinePrice:
 *           type: number
 *         acceptsOnSitePayment:
 *           type: boolean
 *         onSitePrice:
 *           type: number
 *         acceptsInKind:
 *           type: boolean
 *         inKindDescription:
 *           type: string
 *         translations:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/EventTranslation'
 *
 *     UpdateEventDTO:
 *       type: object
 *       properties:
 *         eventDate:
 *           type: string
 *           format: date-time
 *         modality:
 *           $ref: '#/components/schemas/EventModality'
 *         virtualLink:
 *           type: string
 *           format: uri
 *         isFree:
 *           type: boolean
 *         acceptsOnlinePayment:
 *           type: boolean
 *         onlinePrice:
 *           type: number
 *         acceptsOnSitePayment:
 *           type: boolean
 *         onSitePrice:
 *           type: number
 *         acceptsInKind:
 *           type: boolean
 *         inKindDescription:
 *           type: string
 *
 *     EventRegistration:
 *       type: object
 *       required:
 *         - userId
 *         - eventId
 *         - selectedPaymentOption
 *         - paymentStatus
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         eventId:
 *           type: string
 *           format: uuid
 *         registeredAt:
 *           type: string
 *           format: date-time
 *         selectedPaymentOption:
 *           $ref: '#/components/schemas/EventPaymentOption'
 *         paymentStatus:
 *           $ref: '#/components/schemas/RegistrationPaymentStatus'
 *         agreedPriceSnapshot:
 *           type: number
 *           nullable: true
 *           description: Precio acordado al momento del registro
 *         agreedInKindSnapshot:
 *           type: string
 *           nullable: true
 *           description: Descripción de donación en especie acordada
 *
 *     RegisterForEventDTO:
 *       type: object
 *       required:
 *         - selectedPaymentOption
 *       properties:
 *         selectedPaymentOption:
 *           $ref: '#/components/schemas/EventPaymentOption'
 *
 *     Attendance:
 *       type: object
 *       required:
 *         - attendanceId
 *         - userId
 *         - entityType
 *         - entityId
 *         - checkInTime
 *       properties:
 *         attendanceId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *           description: Usuario que asistió
 *         checkedInBy:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Voluntario que registró la asistencia
 *         entityType:
 *           type: string
 *           description: Tipo de entidad (event, activity)
 *         entityId:
 *           type: string
 *           format: uuid
 *           description: ID del evento
 *         checkInTime:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *           nullable: true
 *
 *     CheckInDTO:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID del usuario a registrar asistencia
 *         notes:
 *           type: string
 *           description: Notas adicionales sobre la asistencia
 */

// This file only contains JSDoc comments for Swagger - no executable code needed
export {};
