import { eq } from "drizzle-orm";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { hashPassword } from "../../shared/utils/password.util";
import { db, pool } from "../index";
import * as schema from "../schema";

/**
 * Development Data Seeder
 * Creates sample data for testing and development
 * 100% Idempotent: Safe to run multiple times without creating duplicates
 */
async function seedDevData() {
  try {
    logger.info("🌱 Starting development data seeding...");

    // ==========================================
    // 1. CREATE ADMIN USER
    // ==========================================
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

    logger.info(`✅ Admin user: ${adminUser.email}`);

    // ==========================================
    // 2. CREATE CLIENT USERS
    // ==========================================
    logger.info("→ Creating client users...");
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

    // Assign CLIENT role to newly created users
    if (clientRole && createdClients.length > 0) {
      const userRoles = createdClients.map((user) => ({
        userId: user.userId,
        roleId: clientRole.roleId,
      }));
      await db
        .insert(schema.usersRoles)
        .values(userRoles)
        .onConflictDoNothing();
    }

    // Get ALL client users (for idempotency)
    const allClients = await db
      .select({ user: schema.users })
      .from(schema.users)
      .innerJoin(
        schema.usersRoles,
        eq(schema.users.userId, schema.usersRoles.userId),
      )
      .where(eq(schema.usersRoles.roleId, clientRole!.roleId))
      .limit(5)
      .then((rows) => rows.map((r) => r.user));

    logger.info(
      `✅ ${createdClients.length} new clients, ${allClients.length} total`,
    );

    // ==========================================
    // 3. CREATE SAMPLE PETS (Only if none exist)
    // ==========================================
    logger.info("→ Creating sample pets...");
    const allUsers = [adminUser, ...allClients];

    const existingPetsCount = await db
      .select()
      .from(schema.pets)
      .then((rows) => rows.length);

    let pets = [];
    if (existingPetsCount === 0) {
      // Get breeds
      const [golden, labrador, mixed, persian, siamese] = await Promise.all([
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

      const defaultBreed = mixed?.breedId || 1;

      const petData = [
        {
          name: "Max",
          status: "ADOPTION_AVAILABLE" as const,
          sex: "MALE" as const,
          breedId: golden?.breedId || defaultBreed,
          birthDateApprox: "2020-03-15",
          description: "Perro golden muy cariñoso y juguetón.",
        },
        {
          name: "Luna",
          status: "ADOPTION_AVAILABLE" as const,
          sex: "FEMALE" as const,
          breedId: labrador?.breedId || defaultBreed,
          birthDateApprox: "2021-06-20",
          description: "Labrador adorable, muy activa.",
          neuterDate: "2022-01-10",
        },
        {
          name: "Rocky",
          status: "ADOPTION_AVAILABLE" as const,
          sex: "MALE" as const,
          breedId: defaultBreed,
          birthDateApprox: "2019-08-05",
          description: "Mestizo mediano, tranquilo.",
          neuterDate: "2020-12-15",
        },
        {
          name: "Bella",
          status: "ADOPTION_AVAILABLE" as const,
          sex: "FEMALE" as const,
          breedId: persian?.breedId || defaultBreed,
          birthDateApprox: "2022-02-14",
          description: "Gata persa elegante.",
        },
        {
          name: "Toby",
          status: "IN_PROCESS" as const,
          sex: "MALE" as const,
          breedId: defaultBreed,
          birthDateApprox: "2021-11-30",
          description: "Cachorro en adopción.",
        },
        {
          name: "Mía",
          status: "IN_PROCESS" as const,
          sex: "FEMALE" as const,
          breedId: siamese?.breedId || defaultBreed,
          birthDateApprox: "2020-05-18",
          description: "Gata siamesa vocal.",
          neuterDate: "2021-03-22",
        },
        {
          name: "Coco",
          status: "OWNED" as const,
          sex: "MALE" as const,
          breedId: defaultBreed,
          birthDateApprox: "2018-09-12",
          ownerId: allUsers[0]?.userId,
          description: "Perro adoptado.",
          neuterDate: "2019-06-01",
        },
        {
          name: "Nina",
          status: "OWNED" as const,
          sex: "FEMALE" as const,
          breedId: defaultBreed,
          birthDateApprox: "2019-12-03",
          ownerId: allUsers[1]?.userId,
          description: "Gata mestiza.",
          neuterDate: "2020-08-15",
        },
        {
          name: "Thor",
          status: "OWNED" as const,
          sex: "MALE" as const,
          breedId: golden?.breedId || defaultBreed,
          birthDateApprox: "2017-04-25",
          ownerId: allUsers[2]?.userId,
          description: "Golden adulto.",
          neuterDate: "2018-02-10",
        },
        {
          name: "Lola",
          status: "ADOPTION_AVAILABLE" as const,
          sex: "FEMALE" as const,
          breedId: labrador?.breedId || defaultBreed,
          birthDateApprox: "2022-07-08",
          description: "Cachorra labrador juguetona.",
        },
      ];

      pets = await db.insert(schema.pets).values(petData).returning();

      logger.info(`✅ ${pets.length} pets created`);
    } else {
      pets = await db.select().from(schema.pets).limit(10);
      logger.info(`✅ ${pets.length} pets already exist`);
    }

    // ==========================================
    // 4. ADOPTIONS (Only if none exist)
    // ==========================================
    logger.info("→ Creating adoptions...");
    const existingAdoptions = await db
      .select()
      .from(schema.adoptionApplications)
      .then((r) => r.length);

    if (existingAdoptions === 0) {
      const available = pets.filter((p) => p.status === "ADOPTION_AVAILABLE");
      const inProcess = pets.filter((p) => p.status === "IN_PROCESS");

      const adoptionData = [
        {
          petId: available[0]?.petId || pets[0].petId,
          clientId: allUsers[3]?.userId || adminUser.userId,
          status: "UNDER_REVIEW" as const,
          spaceDescription: "Casa con jardín 200m2",
          incomeDescription: "Ingresos estables",
          otherPetsDescription: "Sin mascotas",
          motivation: "Compañero para niños",
        },
        {
          petId: available[1]?.petId || pets[1].petId,
          clientId: allUsers[4]?.userId || adminUser.userId,
          status: "INTERVIEW_SCHEDULED" as const,
          spaceDescription: "Depto 2 ambientes con balcón",
          incomeDescription: "Trabajo independiente",
          otherPetsDescription: "Un perro castrado",
          motivation: "Compañía para mi perro",
          interviewDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
        {
          petId: inProcess[0]?.petId || pets[4].petId,
          clientId: allUsers[1]?.userId || adminUser.userId,
          status: "APPROVED" as const,
          spaceDescription: "Casa con patio 150m2",
          incomeDescription: "Empleado multinacional",
          otherPetsDescription: "Sin mascotas",
          motivation: "Vivo solo, busco compañía",
          approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          petId: inProcess[1]?.petId || pets[5].petId,
          clientId: allUsers[2]?.userId || adminUser.userId,
          status: "APPROVED" as const,
          spaceDescription: "Depto con balcón",
          incomeDescription: "Consultorio propio",
          otherPetsDescription: "Una gata de 3 años",
          motivation: "Experiencia con gatos",
          approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          petId: available[2]?.petId || pets[2].petId,
          clientId: allClients[0]?.userId || adminUser.userId,
          status: "REQUESTED" as const,
          spaceDescription: "Casa quinta",
          incomeDescription: "Jubilado",
          otherPetsDescription: "Experiencia con perros",
          motivation: "Tengo tiempo para él",
        },
      ];

      const adoptions = await db
        .insert(schema.adoptionApplications)
        .values(adoptionData)
        .returning();

      logger.info(`✅ ${adoptions.length} adoptions created`);
    } else {
      logger.info(`✅ ${existingAdoptions} adoptions already exist`);
    }

    // ==========================================
    // 5. DONATIONS (Only if none exist)
    // ==========================================
    logger.info("→ Creating donations...");
    const existingDonations = await db
      .select()
      .from(schema.monetaryDonations)
      .then((r) => r.length);

    let donations = [];
    if (existingDonations === 0) {
      donations = await db
        .insert(schema.monetaryDonations)
        .values([
          {
            userId: allUsers[0]?.userId,
            targetAmount: "5000.00",
            currency: "ARS",
            isAnonymous: false,
            isConfirmed: true,
            thankYouMessage: "Gracias! 🐾",
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
        ])
        .returning();

      logger.info(`✅ ${donations.length} donations created`);
    } else {
      donations = await db.select().from(schema.monetaryDonations).limit(5);
      logger.info(`✅ ${existingDonations} donations already exist`);
    }

    // ==========================================
    // 6. TRANSACTIONS (Only if none exist)
    // ==========================================
    logger.info("→ Creating transactions...");
    const existingTransactions = await db
      .select()
      .from(schema.transactions)
      .then((r) => r.length);

    if (existingTransactions === 0) {
      const confirmed = donations.filter((d) => d.isConfirmed);
      const providers = [
        "MERCADOPAGO",
        "STRIPE",
        "BANK_TRANSFER",
        "CASH_REGISTER",
      ] as const;

      const txs = confirmed.map((d, i) => ({
        userId: d.userId,
        amountTotal: d.targetAmount,
        currency: d.currency,
        status: "APPROVED" as const,
        provider: providers[i % 4],
        externalTransactionId: `EXT-${d.donationId.substring(0, 8)}`,
        originType: "monetary_donation",
        originId: d.donationId,
        processedAt: new Date(),
      }));

      await db.insert(schema.transactions).values(txs);
      logger.info(`✅ ${txs.length} transactions created`);
    } else {
      logger.info(`✅ ${existingTransactions} transactions already exist`);
    }

    // ==========================================
    // 7. EVENTS (Only if none exist)
    // ==========================================
    logger.info("→ Creating events...");
    const existingEvents = await db
      .select()
      .from(schema.events)
      .then((r) => r.length);

    let events = [];
    if (existingEvents === 0) {
      const d1 = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      const d2 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const d3 = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

      events = await db
        .insert(schema.events)
        .values([
          {
            creatorId: adminUser.userId,
            eventDate: d1,
            modality: "IN_PERSON" as const,
            isFree: true,
            acceptsOnlinePayment: false,
            acceptsOnSitePayment: false,
            acceptsInKind: false,
          },
          {
            creatorId: adminUser.userId,
            eventDate: d2,
            modality: "HYBRID" as const,
            virtualLink: "https://meet.google.com/abc",
            isFree: false,
            acceptsOnlinePayment: true,
            onlinePrice: "500.00",
            acceptsOnSitePayment: true,
            onSitePrice: "600.00",
            acceptsInKind: false,
          },
          {
            creatorId: adminUser.userId,
            eventDate: d3,
            modality: "IN_PERSON" as const,
            isFree: false,
            acceptsOnlinePayment: false,
            acceptsOnSitePayment: true,
            onSitePrice: "300.00",
            acceptsInKind: true,
            inKindDescription: "Alimento, mantas",
          },
        ])
        .returning();

      // Event translations
      await db.insert(schema.eventsTranslations).values([
        {
          eventId: events[0].eventId,
          language: "es" as const,
          title: "Feria de Adopción",
          description: "Conoce a nuestros peluditos disponibles.",
        },
        {
          eventId: events[1].eventId,
          language: "es" as const,
          title: "Taller de Tenencia Responsable",
          description: "Aprende sobre cuidados y nutrición.",
        },
        {
          eventId: events[2].eventId,
          language: "es" as const,
          title: "Campaña de Castración",
          description: "Castración gratuita o a bajo costo.",
        },
      ]);

      logger.info(`✅ ${events.length} events created`);
    } else {
      logger.info(`✅ ${existingEvents} events already exist`);
    }

    // ==========================================
    // 8. NEWS (Only if none exist)
    // ==========================================
    logger.info("→ Creating news...");
    const existingNews = await db
      .select()
      .from(schema.news)
      .then((r) => r.length);

    if (existingNews === 0) {
      const news = await db
        .insert(schema.news)
        .values([
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
          { authorId: adminUser.userId, status: "DRAFT" as const },
        ])
        .returning();

      // News translations
      await db.insert(schema.newsTranslations).values([
        {
          newsId: news[0].newsId,
          language: "es" as const,
          title: "Exitosa Feria de Adopción",
          excerpt: "20 mascotas encontraron hogar",
          content: "Nuestra feria fue un éxito rotundo.",
          slug: "exitosa-feria-enero-2024",
        },
        {
          newsId: news[1].newsId,
          language: "es" as const,
          title: "Nuevos Programas de Voluntariado",
          excerpt: "Inscripciones abiertas",
          content: "Roles disponibles: paseadores, asistentes.",
          slug: "voluntariado-2024",
        },
        {
          newsId: news[2].newsId,
          language: "es" as const,
          title: "Campaña de Vacunación Marzo",
          excerpt: "Reserva tu turno",
          content: "Vacunación antirrábica gratuita.",
          slug: "vacunacion-marzo-2024",
        },
      ]);

      logger.info(`✅ ${news.length} news created`);
    } else {
      logger.info(`✅ ${existingNews} news already exist`);
    }

    // ==========================================
    // 9. VOLUNTEERS (Only if none exist)
    // ==========================================
    logger.info("→ Creating volunteers...");
    const existingVolApps = await db
      .select()
      .from(schema.volunteerApplications)
      .then((r) => r.length);

    if (existingVolApps === 0) {
      const apps = await db
        .insert(schema.volunteerApplications)
        .values([
          {
            firstName: "Valentina",
            lastName: "Silva",
            email: "valentina.silva@example.com",
            docNumber: "35123456",
            phone: "+54 11 5555-1234",
            birthDate: "1995-06-12",
            hasExperience: true,
            experienceDetails: "2 años en refugio",
            wasVolunteerBefore: false,
            motivation: "Ayudar animales",
            availability: { days: ["martes", "jueves"] },
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
            motivation: "Aprender cuidado animal",
            availability: { days: ["sábado", "domingo"] },
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
            experienceDetails: "Campañas de castración",
            wasVolunteerBefore: true,
            motivation: "Formalizar colaboración",
            availability: { days: ["lunes", "viernes"] },
            status: "INTERVIEW_SCHEDULED" as const,
          },
        ])
        .returning();

      // Create active volunteer from approved app
      const approved = apps.find((a) => a.status === "APPROVED");
      if (approved) {
        const volHash = await hashPassword("Volunteer123!");
        const [volUser] = await db
          .insert(schema.users)
          .values({
            firstName: approved.firstName,
            lastName: approved.lastName,
            email: approved.email,
            passwordHash: volHash,
            docType: "DNI",
            docNumber: approved.docNumber,
            nationalityIso: "AR",
            phone: approved.phone,
            birthDate: approved.birthDate,
          })
          .onConflictDoNothing()
          .returning();

        if (volUser) {
          const volRole = await db
            .select()
            .from(schema.roles)
            .where(eq(schema.roles.name, "VOLUNTEER"))
            .limit(1)
            .then((r) => r[0]);
          if (volRole) {
            await db
              .insert(schema.usersRoles)
              .values({ userId: volUser.userId, roleId: volRole.roleId })
              .onConflictDoNothing();
          }

          const dogWalker = await db
            .select()
            .from(schema.volunteerRoles)
            .where(eq(schema.volunteerRoles.name, "Paseador de Perros"))
            .limit(1)
            .then((r) => r[0]);
          await db
            .insert(schema.volunteers)
            .values({
              userId: volUser.userId,
              volunteerRoleId: dogWalker?.roleId,
              bio: "Paseo perros y ayudo en adopciones",
              availability: approved.availability,
            })
            .onConflictDoNothing();
        }
      }

      logger.info(`✅ ${apps.length} volunteer applications created`);
    } else {
      logger.info(`✅ ${existingVolApps} volunteer applications already exist`);
    }

    logger.info("✨ Development data seeding completed!");
  } catch (error) {
    logger.error({ error }, "❌ Error seeding development data");
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Auto-execute
seedDevData();

export { seedDevData };
