import { eq } from "drizzle-orm";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { hashPassword } from "../../shared/utils/password.util";
import { db, pool } from "../index";
import * as schema from "../schema";

/**
 * Seed development data: admin user, sample clients, pets, adoptions, donations, events, news, volunteers
 * Idempotent: can be run multiple times without duplicating data
 */
async function seedDevData() {
  try {
    logger.info("🌱 Starting development data seeding...");

    // 1. Create Admin User
    logger.info("→ Creating admin user...");
    const adminPasswordHash = await hashPassword(
      env.ADMIN_DEFAULT_PASSWORD || "Admin123!",
    );

    const [adminUser] = await db
      .insert(schema.users)
      .values({
        firstName: "Admin",
        lastName: "Sistema",
        email: env.ADMIN_DEFAULT_EMAIL,
        passwordHash: adminPasswordHash,
        docType: "DNI",
        docNumber: "99999999",
        nationalityIso: "AR",
        phone: "+54 11 4444-5555",
        birthDate: "1990-01-01",
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: { passwordHash: adminPasswordHash },
      })
      .returning();

    // Assign ADMIN role
    const adminRole = await db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.name, "ADMIN"))
      .limit(1)
      .then((r) => r[0]);

    if (adminRole) {
      await db
        .insert(schema.usersRoles)
        .values({ userId: adminUser.userId, roleId: adminRole.roleId })
        .onConflictDoNothing();
    }

    logger.info(`✅ Admin user created/updated: ${adminUser.email}`);

    // 2. Create Sample Client Users
    logger.info("→ Creating sample client users...");
    const clientPasswordHash = await hashPassword("Password123!");
    const clientRole = await db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.name, "CLIENT"))
      .limit(1)
      .then((r) => r[0]);

    const sampleClients = [
      {
        firstName: "María",
        lastName: "García",
        email: "maria.garcia@example.com",
        passwordHash: clientPasswordHash,
        docType: "DNI" as const,
        docNumber: "30123456",
        nationalityIso: "AR",
        phone: "+54 11 4567-8901",
        birthDate: "1985-03-15",
      },
      {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        passwordHash: clientPasswordHash,
        docType: "DNI" as const,
        docNumber: "28234567",
        nationalityIso: "AR",
        phone: "+54 11 4567-8902",
        birthDate: "1988-07-22",
      },
      {
        firstName: "Ana",
        lastName: "Rodríguez",
        email: "ana.rodriguez@example.com",
        passwordHash: clientPasswordHash,
        docType: "DNI" as const,
        docNumber: "32345678",
        nationalityIso: "AR",
        phone: "+54 11 4567-8903",
        birthDate: "1992-11-08",
      },
      {
        firstName: "Carlos",
        lastName: "López",
        email: "carlos.lopez@example.com",
        passwordHash: clientPasswordHash,
        docType: "DNI" as const,
        docNumber: "27456789",
        nationalityIso: "AR",
        phone: "+54 11 4567-8904",
        birthDate: "1986-05-30",
      },
      {
        firstName: "Laura",
        lastName: "Martínez",
        email: "laura.martinez@example.com",
        passwordHash: clientPasswordHash,
        docType: "DNI" as const,
        docNumber: "31567890",
        nationalityIso: "AR",
        phone: "+54 11 4567-8905",
        birthDate: "1990-09-14",
      },
    ];

    const createdClients = await db
      .insert(schema.users)
      .values(sampleClients)
      .onConflictDoNothing()
      .returning();

    // Assign CLIENT role to all
    if (clientRole && createdClients.length > 0) {
      const userRoleInserts = createdClients.map((user) => ({
        userId: user.userId,
        roleId: clientRole.roleId,
      }));
      await db
        .insert(schema.usersRoles)
        .values(userRoleInserts)
        .onConflictDoNothing();
    }

    logger.info(`✅ ${createdClients.length} client users created`);

    // 3. Create Sample Pets
    logger.info("→ Creating sample pets...");
    const allUsers = [adminUser, ...createdClients];

    // Get breeds
    const [
      goldenBreed,
      labradorBreed,
      mixedDogBreed,
      persianBreed,
      siameseBreed,
    ] = await Promise.all([
      db
        .select()
        .from(schema.breeds)
        .where(eq(schema.breeds.name, "Golden Retriever"))
        .limit(1)
        .then((r) => r[0]),
      db
        .select()
        .from(schema.breeds)
        .where(eq(schema.breeds.name, "Labrador Retriever"))
        .limit(1)
        .then((r) => r[0]),
      db
        .select()
        .from(schema.breeds)
        .where(eq(schema.breeds.name, "Mestizo"))
        .limit(1)
        .then((r) => r[0]),
      db
        .select()
        .from(schema.breeds)
        .where(eq(schema.breeds.name, "Persa"))
        .limit(1)
        .then((r) => r[0]),
      db
        .select()
        .from(schema.breeds)
        .where(eq(schema.breeds.name, "Siamés"))
        .limit(1)
        .then((r) => r[0]),
    ]);

    const defaultBreedId = mixedDogBreed?.breedId || 1;

    const samplePets = [
      {
        name: "Max",
        status: "ADOPTION_AVAILABLE" as const,
        sex: "MALE" as const,
        breedId: goldenBreed?.breedId || defaultBreedId,
        birthDateApprox: "2020-03-15",
        description:
          "Perro golden muy cariñoso y juguetón, ideal para familias con niños.",
      },
      {
        name: "Luna",
        status: "ADOPTION_AVAILABLE" as const,
        sex: "FEMALE" as const,
        breedId: labradorBreed?.breedId || defaultBreedId,
        birthDateApprox: "2021-06-20",
        description: "Labrador adorable, muy activa y le encanta el agua.",
        neuterDate: "2022-01-10",
      },
      {
        name: "Rocky",
        status: "ADOPTION_AVAILABLE" as const,
        sex: "MALE" as const,
        breedId: defaultBreedId,
        birthDateApprox: "2019-08-05",
        description: "Mestizo mediano, tranquilo y muy obediente.",
        neuterDate: "2020-12-15",
      },
      {
        name: "Bella",
        status: "ADOPTION_AVAILABLE" as const,
        sex: "FEMALE" as const,
        breedId: persianBreed?.breedId || defaultBreedId,
        birthDateApprox: "2022-02-14",
        description: "Gata persa de pelaje largo, muy elegante y cariñosa.",
      },
      {
        name: "Toby",
        status: "IN_PROCESS" as const,
        sex: "MALE" as const,
        breedId: defaultBreedId,
        birthDateApprox: "2021-11-30",
        description: "Cachorro en proceso de adopción, muy energético.",
      },
      {
        name: "Mía",
        status: "IN_PROCESS" as const,
        sex: "FEMALE" as const,
        breedId: siameseBreed?.breedId || defaultBreedId,
        birthDateApprox: "2020-05-18",
        description:
          "Gata siamesa muy vocal y juguetona, en proceso de adopción.",
        neuterDate: "2021-03-22",
      },
      {
        name: "Coco",
        status: "OWNED" as const,
        sex: "MALE" as const,
        breedId: defaultBreedId,
        birthDateApprox: "2018-09-12",
        ownerId: allUsers[0]?.userId,
        description: "Perro adoptado, vive feliz con su familia.",
        neuterDate: "2019-06-01",
      },
      {
        name: "Nina",
        status: "OWNED" as const,
        sex: "FEMALE" as const,
        breedId: defaultBreedId,
        birthDateApprox: "2019-12-03",
        ownerId: allUsers[1]?.userId,
        description: "Gata mestiza adoptada, muy independiente.",
        neuterDate: "2020-08-15",
      },
      {
        name: "Thor",
        status: "OWNED" as const,
        sex: "MALE" as const,
        breedId: goldenBreed?.breedId || defaultBreedId,
        birthDateApprox: "2017-04-25",
        ownerId: allUsers[2]?.userId,
        description: "Golden retriever adulto, adoptado hace 3 años.",
        neuterDate: "2018-02-10",
      },
      {
        name: "Lola",
        status: "ADOPTION_AVAILABLE" as const,
        sex: "FEMALE" as const,
        breedId: labradorBreed?.breedId || defaultBreedId,
        birthDateApprox: "2022-07-08",
        description: "Cachorra labrador muy juguetona, busca familia activa.",
      },
    ];

    const createdPets = await db
      .insert(schema.pets)
      .values(samplePets)
      .onConflictDoNothing()
      .returning();
    logger.info(`✅ ${createdPets.length} pets created`);

    // 4. Create Sample Adoption Applications
    logger.info("→ Creating sample adoption applications...");
    const availablePets = createdPets.filter(
      (p) => p.status === "ADOPTION_AVAILABLE",
    );
    const inProcessPets = createdPets.filter((p) => p.status === "IN_PROCESS");

    const adoptionApplications = [
      {
        petId: availablePets[0]?.petId || createdPets[0].petId,
        clientId: allUsers[3]?.userId || adminUser.userId,
        status: "UNDER_REVIEW" as const,
        spaceDescription: "Casa con patio grande",
        incomeDescription: "Ingresos estables mensuales",
        otherPetsDescription: "No tenemos otras mascotas",
        motivation:
          "Queremos un compañero para nuestros hijos que les enseñe responsabilidad y les brinde amor.",
      },
      {
        petId: availablePets[1]?.petId || createdPets[1].petId,
        clientId: allUsers[4]?.userId || adminUser.userId,
        status: "INTERVIEW_SCHEDULED" as const,
        spaceDescription: "Apartamento de 2 ambientes",
        incomeDescription: "Empleado en relación de dependencia",
        otherPetsDescription: "Tengo un perro labrador de 3 años",
        motivation:
          "Tengo otro perro en casa y creo que Luna sería una gran compañera para él.",
        interviewDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días adelante
      },
      {
        petId: inProcessPets[0]?.petId || createdPets[4].petId,
        clientId: allUsers[1]?.userId || adminUser.userId,
        status: "APPROVED" as const,
        spaceDescription: "Casa amplia con jardín",
        incomeDescription: "Trabajo remoto con ingresos fijos",
        otherPetsDescription: "Sin otras mascotas",
        motivation:
          "Vivo solo y busco compañía. Tengo mucho tiempo y espacio para dedicarle a Toby.",
        approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
      },
      {
        petId: inProcessPets[1]?.petId || createdPets[5].petId,
        clientId: allUsers[2]?.userId || adminUser.userId,
        status: "APPROVED" as const,
        spaceDescription: "Apartamento de 3 ambientes",
        incomeDescription: "Familia con dos ingresos estables",
        otherPetsDescription: "Tenemos un gato persa",
        motivation:
          "Tenemos experiencia con gatos y buscamos una nueva integrante para nuestra familia.",
        approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
      },
      {
        petId: availablePets[2]?.petId || createdPets[2].petId,
        clientId: createdClients[0]?.userId || adminUser.userId,
        status: "REQUESTED" as const,
        spaceDescription: "Casa con patio trasero amplio",
        incomeDescription: "Profesional independiente",
        otherPetsDescription: "Sin otras mascotas actualmente",
        motivation:
          "Me encantaría darle un hogar a Rocky, tengo experiencia con perros adultos.",
      },
    ];

    const createdAdoptions = await db
      .insert(schema.adoptionApplications)
      .values(adoptionApplications)
      .onConflictDoNothing()
      .returning();

    logger.info(`✅ ${createdAdoptions.length} adoption applications created`);

    // 5. Create Sample Monetary Donations
    logger.info("→ Creating sample monetary donations...");

    const donations = [
      {
        userId: allUsers[0]?.userId,
        targetAmount: "5000.00",
        currency: "ARS",
        isAnonymous: false,
        isConfirmed: true,
        thankYouMessage: "Gracias por ayudar a los animalitos! 🐾",
      },
      {
        userId: allUsers[1]?.userId,
        targetAmount: "10000.00",
        currency: "ARS",
        isAnonymous: false,
        isConfirmed: true,
      },
      {
        userId: allUsers[2]?.userId,
        targetAmount: "2500.00",
        currency: "ARS",
        isAnonymous: true,
        isConfirmed: true,
      },
      {
        userId: null,
        targetAmount: "50.00",
        currency: "USD",
        isAnonymous: true,
        isConfirmed: true,
      },
      {
        userId: allUsers[3]?.userId,
        targetAmount: "7500.00",
        currency: "ARS",
        isAnonymous: false,
        isConfirmed: false,
      },
    ];

    const createdDonations = await db
      .insert(schema.monetaryDonations)
      .values(donations)
      .onConflictDoNothing()
      .returning();
    logger.info(`✅ ${createdDonations.length} monetary donations created`);

    // 6. Create Sample Transactions for confirmed donations
    logger.info("→ Creating sample transactions...");
    const confirmedDonations = createdDonations.filter((d) => d.isConfirmed);

    const transactions = confirmedDonations.map((donation, idx) => {
      const providers = [
        "MERCADOPAGO",
        "STRIPE",
        "BANK_TRANSFER",
        "CASH_REGISTER",
        "MERCADOPAGO",
      ] as const;
      const statuses = [
        "APPROVED",
        "APPROVED",
        "APPROVED",
        "APPROVED",
        "PENDING",
      ] as const;

      return {
        userId: donation.userId,
        amountTotal: donation.targetAmount,
        currency: donation.currency,
        status: statuses[idx],
        provider: providers[idx],
        externalTransactionId: `EXT-${donation.donationId.substring(0, 8)}-${idx}`,
        originType: "monetary_donation",
        originId: donation.donationId,
        processedAt: statuses[idx] === "APPROVED" ? new Date() : undefined,
      };
    });

    await db
      .insert(schema.transactions)
      .values(transactions)
      .onConflictDoNothing();
    logger.info(`✅ ${transactions.length} transactions created`);

    // 7. Create Sample Events
    logger.info("→ Creating sample events...");
    const futureDate1 = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 días adelante
    const futureDate2 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días adelante
    const futureDate3 = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000); // 45 días adelante

    const events = [
      {
        creatorId: adminUser.userId,
        eventDate: futureDate1,
        modality: "IN_PERSON" as const,
        isFree: true,
        acceptsOnlinePayment: false,
        acceptsOnSitePayment: false,
        acceptsInKind: false,
      },
      {
        creatorId: adminUser.userId,
        eventDate: futureDate2,
        modality: "HYBRID" as const,
        virtualLink: "https://meet.google.com/abc-defg-hij",
        isFree: false,
        acceptsOnlinePayment: true,
        onlinePrice: "500.00",
        acceptsOnSitePayment: true,
        onSitePrice: "600.00",
        acceptsInKind: false,
      },
      {
        creatorId: adminUser.userId,
        eventDate: futureDate3,
        modality: "IN_PERSON" as const,
        isFree: false,
        acceptsOnlinePayment: false,
        acceptsOnSitePayment: true,
        onSitePrice: "300.00",
        acceptsInKind: true,
        inKindDescription: "Alimento balanceado, mantas, juguetes",
      },
    ];

    const createdEvents = await db
      .insert(schema.events)
      .values(events)
      .onConflictDoNothing()
      .returning();
    logger.info(`✅ ${createdEvents.length} events created`);

    // 8. Create Event Translations
    logger.info("→ Creating event translations...");
    const eventTranslations = [
      {
        eventId: createdEvents[0]?.eventId,
        language: "es" as const,
        title: "Feria de Adopción - Parque Centenario",
        description:
          "Únete a nuestra feria de adopción mensual donde podrás conocer a nuestros peluditos disponibles para adopción. Habrá actividades para toda la familia, veterinarios disponibles para consultas, y mucho más.",
      },
      {
        eventId: createdEvents[1]?.eventId,
        language: "es" as const,
        title: "Taller de Tenencia Responsable (Online/Presencial)",
        description:
          "Aprende sobre cuidados básicos, nutrición, salud preventiva y comportamiento animal. Incluye certificado de asistencia. Modalidad híbrida: puedes asistir presencialmente o conectarte online.",
      },
      {
        eventId: createdEvents[2]?.eventId,
        language: "es" as const,
        title: "Campaña de Castración Comunitaria",
        description:
          "Campaña de castración gratuita o a bajo costo para la comunidad. Cupos limitados. También aceptamos donaciones en especie (alimento balanceado, mantas, juguetes) como forma de pago.",
      },
    ];

    const filteredEventTranslations = eventTranslations.filter(
      (et) => et.eventId,
    );
    if (filteredEventTranslations.length > 0) {
      await db
        .insert(schema.eventsTranslations)
        .values(filteredEventTranslations)
        .onConflictDoNothing();
      logger.info(
        `✅ ${filteredEventTranslations.length} event translations created`,
      );
    }

    // 9. Create Sample News Articles
    logger.info("→ Creating sample news articles...");
    const newsArticles = [
      {
        authorId: adminUser.userId,
        status: "PUBLISHED" as const,
        publishedAt: new Date("2024-01-15"),
      },
      {
        authorId: adminUser.userId,
        status: "PUBLISHED" as const,
        publishedAt: new Date("2024-01-10"),
      },
      {
        authorId: adminUser.userId,
        status: "DRAFT" as const,
      },
    ];

    const createdNews = await db
      .insert(schema.news)
      .values(newsArticles)
      .onConflictDoNothing()
      .returning();
    logger.info(`✅ ${createdNews.length} news articles created`);

    // 10. Create News Translations
    logger.info("→ Creating news translations...");
    const newsTranslations = [
      {
        newsId: createdNews[0]?.newsId,
        language: "es" as const,
        slug: "exitosa-feria-de-adopcion-en-enero",
        title: "¡Exitosa Feria de Adopción en Enero!",
        summary:
          "Más de 20 mascotas encontraron su hogar definitivo en nuestra feria del mes pasado.",
        content:
          "Estamos emocionados de compartir que nuestra feria de adopción de enero fue un éxito rotundo. Gracias a la colaboración de voluntarios, veterinarios y la comunidad, más de 20 perros y gatos encontraron familias amorosas. Además, se realizaron más de 50 castraciones gratuitas.",
      },
      {
        newsId: createdNews[1]?.newsId,
        language: "es" as const,
        slug: "nuevos-programas-de-voluntariado-disponibles",
        title: "Nuevos Programas de Voluntariado Disponibles",
        summary:
          "Inscripciones abiertas para roles de paseadores, asistentes veterinarios y más.",
        content:
          "¡Buscamos nuevos voluntarios! Si te apasionan los animales y quieres hacer la diferencia, tenemos roles disponibles: paseadores de perros, asistentes en eventos, ayudantes en el refugio, y más. Completa el formulario de postulación en nuestro sitio web.",
      },
      {
        newsId: createdNews[2]?.newsId,
        language: "es" as const,
        slug: "proxima-campana-de-vacunacion-marzo-2024",
        title: "Próxima Campaña de Vacunación - Marzo 2024",
        summary:
          "Reserva tu turno para la campaña de vacunación antirrábica gratuita.",
        content:
          "En marzo estaremos realizando nuestra campaña de vacunación antirrábica gratuita. Los turnos son limitados y se asignan por orden de llegada. Mantente atento a nuestras redes sociales para conocer la fecha exacta de apertura de inscripciones.",
      },
    ];

    const filteredNewsTranslations = newsTranslations.filter((nt) => nt.newsId);
    if (filteredNewsTranslations.length > 0) {
      await db
        .insert(schema.newsTranslations)
        .values(filteredNewsTranslations)
        .onConflictDoNothing();
      logger.info(
        `✅ ${filteredNewsTranslations.length} news translations created`,
      );
    }

    // 11. Create Sample Volunteer Applications
    logger.info("→ Creating sample volunteer applications...");
    const volunteerApps = [
      {
        firstName: "Valentina",
        lastName: "Silva",
        email: "valentina.silva@example.com",
        docNumber: "35123456",
        phone: "+54 11 5555-1234",
        birthDate: "1995-06-12",
        hasExperience: true,
        experienceDetails:
          "Trabajé 2 años en un refugio de animales en Buenos Aires.",
        wasVolunteerBefore: false,
        motivation:
          "Me encantaría contribuir con mi experiencia y tiempo para ayudar a los animales en situación de calle.",
        availability: { weekdays: ["martes", "jueves"], hours: "tarde" },
        status: "APPROVED" as const,
        decidedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        firstName: "Sebastián",
        lastName: "Gómez",
        email: "sebastian.gomez@example.com",
        docNumber: "33234567",
        phone: "+54 11 5555-2345",
        birthDate: "1998-09-20",
        hasExperience: false,
        wasVolunteerBefore: false,
        motivation:
          "Quiero aprender sobre cuidado animal y ayudar a la comunidad.",
        availability: { weekdays: ["sábado", "domingo"], hours: "mañana" },
        status: "PENDING" as const,
      },
      {
        firstName: "Camila",
        lastName: "Fernández",
        email: "camila.fernandez@example.com",
        docNumber: "34345678",
        phone: "+54 11 5555-3456",
        birthDate: "1997-03-08",
        hasExperience: true,
        experienceDetails:
          "Ayudé en campañas de castración y adopciones en mi barrio.",
        wasVolunteerBefore: true,
        motivation:
          "Quiero formalizar mi colaboración y ayudar de manera más estructurada.",
        availability: {
          weekdays: ["lunes", "miércoles", "viernes"],
          hours: "noche",
        },
        status: "INTERVIEW_SCHEDULED" as const,
      },
    ];

    const createdVolunteerApps = await db
      .insert(schema.volunteerApplications)
      .values(volunteerApps)
      .onConflictDoNothing()
      .returning();
    logger.info(
      `✅ ${createdVolunteerApps.length} volunteer applications created`,
    );

    // 12. Create Active Volunteer from approved application
    logger.info("→ Creating active volunteer...");
    const approvedApp = createdVolunteerApps.find(
      (app) => app.status === "APPROVED",
    );
    if (approvedApp) {
      // Create user for the approved volunteer
      const volunteerPasswordHash = await hashPassword("Volunteer123!");
      const [volunteerUser] = await db
        .insert(schema.users)
        .values({
          firstName: approvedApp.firstName,
          lastName: approvedApp.lastName,
          email: approvedApp.email,
          passwordHash: volunteerPasswordHash,
          docType: "DNI",
          docNumber: approvedApp.docNumber,
          nationalityIso: "AR",
          phone: approvedApp.phone,
          birthDate: approvedApp.birthDate,
        })
        .onConflictDoNothing()
        .returning();

      if (volunteerUser) {
        // Assign VOLUNTEER role
        const volunteerRole = await db
          .select()
          .from(schema.roles)
          .where(eq(schema.roles.name, "VOLUNTEER"))
          .limit(1)
          .then((r) => r[0]);

        if (volunteerRole) {
          await db
            .insert(schema.usersRoles)
            .values({
              userId: volunteerUser.userId,
              roleId: volunteerRole.roleId,
            })
            .onConflictDoNothing();
        }

        // Create volunteer record
        const dogWalkerRole = await db
          .select()
          .from(schema.volunteerRoles)
          .where(eq(schema.volunteerRoles.name, "Paseador de Perros"))
          .limit(1)
          .then((r) => r[0]);

        await db
          .insert(schema.volunteers)
          .values({
            userId: volunteerUser.userId,
            volunteerRoleId: dogWalkerRole?.roleId,
            bio: "Me encanta pasear perros y ayudarlos a encontrar un hogar.",
            availability: approvedApp.availability,
          })
          .onConflictDoNothing();

        logger.info(`✅ Active volunteer created: ${volunteerUser.email}`);
      }
    }

    logger.info("✨ Development data seeding completed successfully!");
  } catch (error) {
    logger.error({ error }, "❌ Error seeding development data");
    throw error;
  } finally {
    await pool.end();
    // Force exit to prevent hanging due to logger or pool issues
    process.exit(0);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDevData();
}

export { seedDevData };
