// Master Data Seeder
// This script seeds essential reference data required for the system to function
import { eq } from "drizzle-orm";
import { logger } from "../../config/logger.js";
import { db, pool } from "../index.js";
import * as schema from "../schema/index.js";

/**
 * Seeds master/reference data required for system operation
 * @param closePool - Whether to close the DB pool after seeding (default: false when imported)
 */
async function seedMasterData(closePool = false) {
  try {
    logger.info("🌱 Starting master data seeding...");

    // 1. Seed Roles
    logger.info("→ Seeding roles...");
    await db
      .insert(schema.roles)
      .values([{ name: "ADMIN" }, { name: "CLIENT" }, { name: "VOLUNTEER" }])
      .onConflictDoNothing();
    logger.info("✓ Roles seeded");

    // 2. Seed Countries (already seeded in init.sql, but ensuring they exist)
    logger.info("→ Seeding countries...");
    await db
      .insert(schema.countries)
      .values([
        { isoCode: "AR", name: "Argentina", phonePrefix: "+54" },
        { isoCode: "BR", name: "Brazil", phonePrefix: "+55" },
        { isoCode: "UY", name: "Uruguay", phonePrefix: "+598" },
        { isoCode: "PY", name: "Paraguay", phonePrefix: "+595" },
        { isoCode: "CL", name: "Chile", phonePrefix: "+56" },
        { isoCode: "US", name: "United States", phonePrefix: "+1" },
      ])
      .onConflictDoNothing();
    logger.info("✓ Countries seeded");

    // 3. Seed Currencies
    logger.info("→ Seeding currencies...");
    await db
      .insert(schema.currencies)
      .values([
        { isoCode: "ARS", name: "Argentine Peso", symbol: "$" },
        { isoCode: "USD", name: "US Dollar", symbol: "US$" },
        { isoCode: "BRL", name: "Brazilian Real", symbol: "R$" },
      ])
      .onConflictDoNothing();
    logger.info("✓ Currencies seeded");

    // 4. Seed Species
    logger.info("→ Seeding species...");
    const speciesResult = await db
      .insert(schema.species)
      .values([{ name: "Dog" }, { name: "Cat" }])
      .onConflictDoNothing()
      .returning();

    const dogSpecies =
      speciesResult.find((s) => s.name === "Dog") ||
      (
        await db
          .select()
          .from(schema.species)
          .where(eq(schema.species.name, "Dog"))
      )[0];
    const catSpecies =
      speciesResult.find((s) => s.name === "Cat") ||
      (
        await db
          .select()
          .from(schema.species)
          .where(eq(schema.species.name, "Cat"))
      )[0];
    logger.info("✓ Species seeded");

    // 5. Seed Breeds
    logger.info("→ Seeding breeds...");
    const dogBreeds = [
      "Mestizo",
      "Labrador Retriever",
      "Golden Retriever",
      "German Shepherd",
      "Beagle",
      "Bulldog",
      "Poodle",
      "Rottweiler",
      "Yorkshire Terrier",
      "Boxer",
      "Dachshund",
      "Siberian Husky",
      "Shih Tzu",
      "Doberman",
      "Great Dane",
      "Chihuahua",
      "Pug",
      "Pomeranian",
      "Border Collie",
      "Cocker Spaniel",
      "Maltese",
      "Pit Bull",
      "Schnauzer",
      "Dalmatian",
    ].map((name) => ({ speciesId: dogSpecies.speciesId, name }));

    const catBreeds = [
      "Mestizo",
      "Persian",
      "Maine Coon",
      "Siamese",
      "Ragdoll",
      "British Shorthair",
      "Bengal",
      "Abyssinian",
      "Birman",
      "Sphynx",
      "Scottish Fold",
      "American Shorthair",
      "Russian Blue",
      "Norwegian Forest",
    ].map((name) => ({ speciesId: catSpecies.speciesId, name }));

    await db
      .insert(schema.breeds)
      .values([...dogBreeds, ...catBreeds])
      .onConflictDoNothing();
    logger.info(`✓ ${dogBreeds.length + catBreeds.length} breeds seeded`);

    // 6. Seed Vaccines Catalog
    logger.info("→ Seeding vaccines catalog...");
    const vaccines = [
      "Rabies",
      "Parvovirus",
      "Distemper",
      "Hepatitis",
      "Leptospirosis",
      "Parainfluenza",
      "Bordetella",
      "Coronavirus",
      "Feline Leukemia (FeLV)",
      "Feline Immunodeficiency Virus (FIV)",
      "Feline Panleukopenia",
      "Feline Calicivirus",
      "Feline Herpesvirus",
    ];

    await db
      .insert(schema.vaccinesCatalog)
      .values(vaccines.map((name) => ({ name })))
      .onConflictDoNothing();
    logger.info(`✓ ${vaccines.length} vaccines seeded`);

    // 7. Seed Volunteer Roles
    logger.info("→ Seeding volunteer roles...");
    const volunteerRoles = [
      {
        name: "Dog Walker",
        description: "Responsible for walking and exercising dogs",
      },
      {
        name: "Foster Caretaker",
        description: "Provides temporary home for pets",
      },
      {
        name: "Event Coordinator",
        description: "Organizes and manages adoption events",
      },
      {
        name: "Social Media Manager",
        description: "Manages social media presence",
      },
      {
        name: "Veterinary Assistant",
        description: "Assists with medical care",
      },
      {
        name: "Transport Volunteer",
        description: "Helps with pet transportation",
      },
      {
        name: "Photographer",
        description: "Takes photos of pets for adoption",
      },
      {
        name: "General Volunteer",
        description: "Helps with various tasks as needed",
      },
    ];

    await db
      .insert(schema.volunteerRoles)
      .values(volunteerRoles)
      .onConflictDoNothing();
    logger.info(`✓ ${volunteerRoles.length} volunteer roles seeded`);

    // 8. Seed Geographic Data (Provinces and Cities for Argentina)
    logger.info("→ Seeding geographic data...");
    const provinces = [
      "Buenos Aires",
      "Ciudad Autónoma de Buenos Aires",
      "Córdoba",
      "Santa Fe",
      "Mendoza",
      "Tucumán",
      "Entre Ríos",
      "Salta",
      "Chaco",
      "Corrientes",
      "Misiones",
      "Santiago del Estero",
      "San Juan",
      "Jujuy",
      "Río Negro",
      "Neuquén",
      "Formosa",
      "Chubut",
      "San Luis",
      "Catamarca",
      "La Rioja",
      "La Pampa",
      "Santa Cruz",
      "Tierra del Fuego",
    ];

    const provinceResults = await db
      .insert(schema.provinces)
      .values(provinces.map((name) => ({ name })))
      .onConflictDoNothing()
      .returning();

    // Seed major cities for Buenos Aires and CABA
    const buenosAires =
      provinceResults.find((p) => p.name === "Buenos Aires") ||
      (
        await db
          .select()
          .from(schema.provinces)
          .where(eq(schema.provinces.name, "Buenos Aires"))
      )[0];
    const caba =
      provinceResults.find(
        (p) => p.name === "Ciudad Autónoma de Buenos Aires",
      ) ||
      (
        await db
          .select()
          .from(schema.provinces)
          .where(eq(schema.provinces.name, "Ciudad Autónoma de Buenos Aires"))
      )[0];
    const corrientes =
      provinceResults.find((p) => p.name === "Corrientes") ||
      (
        await db
          .select()
          .from(schema.provinces)
          .where(eq(schema.provinces.name, "Corrientes"))
      )[0];

    const cities = [
      // CABA neighborhoods
      { provinceId: caba.provinceId, name: "Palermo" },
      { provinceId: caba.provinceId, name: "Belgrano" },
      { provinceId: caba.provinceId, name: "Recoleta" },
      { provinceId: caba.provinceId, name: "Caballito" },
      { provinceId: caba.provinceId, name: "Villa Crespo" },
      // Buenos Aires major cities
      { provinceId: buenosAires.provinceId, name: "La Plata" },
      { provinceId: buenosAires.provinceId, name: "Mar del Plata" },
      { provinceId: buenosAires.provinceId, name: "Bahía Blanca" },
      { provinceId: buenosAires.provinceId, name: "San Isidro" },
      { provinceId: buenosAires.provinceId, name: "Vicente López" },
      { provinceId: buenosAires.provinceId, name: "Quilmes" },
      { provinceId: buenosAires.provinceId, name: "Lanús" },
      { provinceId: buenosAires.provinceId, name: "Avellaneda" },
      { provinceId: buenosAires.provinceId, name: "Tigre" },
      { provinceId: buenosAires.provinceId, name: "San Miguel" },
      // Corrientes cities
      { provinceId: corrientes.provinceId, name: "Corrientes" },
      { provinceId: corrientes.provinceId, name: "Goya" },
      { provinceId: corrientes.provinceId, name: "Paso de los Libres" },
    ];

    await db.insert(schema.cities).values(cities).onConflictDoNothing();
    logger.info(
      `✓ ${provinces.length} provinces and ${cities.length} cities seeded`,
    );

    logger.info("✅ Master data seeding completed successfully!");
  } catch (error) {
    logger.error({ error }, "❌ Error seeding master data");
    throw error;
  } finally {
    // Only close pool if running standalone (not imported)
    if (closePool) {
      await pool.end();
    }
  }
}

// Run seeder if executed directly
if (import.meta.url.includes("master-data.seed")) {
  seedMasterData(true) // Close pool when running directly
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeder error:", error);
      process.exit(1);
    });
}

export { seedMasterData };
