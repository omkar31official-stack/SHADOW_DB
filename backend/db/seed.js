const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { getDb } = require('./connection');

const criminals = [
  { first_name: 'Marcus', last_name: 'Blackwood', alias: 'The Shadow', date_of_birth: '1985-03-15', gender: 'Male', height_cm: 185.5, weight_kg: 88.0, eye_color: 'Brown', hair_color: 'Black', nationality: 'American', address: '742 Dark Alley, Gotham District', fingerprint_id: 'FP-2024-001', status: 'wanted', danger_level: 'critical', description: 'Known mastermind behind multiple high-profile heists. Extremely intelligent and resourceful.' },
  { first_name: 'Elena', last_name: 'Vasquez', alias: 'La Serpiente', date_of_birth: '1990-07-22', gender: 'Female', height_cm: 170.0, weight_kg: 62.0, eye_color: 'Green', hair_color: 'Red', nationality: 'Colombian', address: 'Unknown', fingerprint_id: 'FP-2024-002', status: 'wanted', danger_level: 'high', description: 'International drug trafficking suspect. Multiple identities confirmed.' },
  { first_name: 'Viktor', last_name: 'Petrov', alias: 'The Ghost', date_of_birth: '1978-11-03', gender: 'Male', height_cm: 190.0, weight_kg: 95.0, eye_color: 'Blue', hair_color: 'Grey', nationality: 'Russian', address: 'Last seen in Eastern Europe', fingerprint_id: 'FP-2024-003', status: 'wanted', danger_level: 'critical', description: 'Former intelligence operative. Suspected in multiple international incidents.' },
  { first_name: 'Sarah', last_name: 'Chen', alias: 'Cipher', date_of_birth: '1995-01-18', gender: 'Female', height_cm: 163.0, weight_kg: 55.0, eye_color: 'Brown', hair_color: 'Black', nationality: 'Chinese', address: '888 Digital Lane, Silicon Valley', fingerprint_id: 'FP-2024-004', status: 'arrested', danger_level: 'high', description: 'Elite hacker responsible for breaching multiple government databases.' },
  { first_name: 'James', last_name: 'Morrison', alias: 'Bullseye', date_of_birth: '1982-09-30', gender: 'Male', height_cm: 178.0, weight_kg: 82.0, eye_color: 'Hazel', hair_color: 'Brown', nationality: 'British', address: '221B Shadow Street, London', fingerprint_id: 'FP-2024-005', status: 'arrested', danger_level: 'medium', description: 'Professional con artist with a network spanning 12 countries.' },
  { first_name: 'Amara', last_name: 'Okafor', alias: 'Phoenix', date_of_birth: '1992-06-14', gender: 'Female', height_cm: 175.0, weight_kg: 68.0, eye_color: 'Brown', hair_color: 'Black', nationality: 'Nigerian', address: 'Lagos, Nigeria', fingerprint_id: 'FP-2024-006', status: 'wanted', danger_level: 'high', description: 'Financial fraud specialist. Over $50M in estimated damages globally.' },
  { first_name: 'Diego', last_name: 'Ramirez', alias: 'El Lobo', date_of_birth: '1980-12-05', gender: 'Male', height_cm: 172.0, weight_kg: 78.0, eye_color: 'Brown', hair_color: 'Black', nationality: 'Mexican', address: 'Somewhere in Sinaloa', fingerprint_id: 'FP-2024-007', status: 'wanted', danger_level: 'critical', description: 'Cartel lieutenant. Connected to multiple violent incidents.' },
  { first_name: 'Yuki', last_name: 'Tanaka', alias: 'Neon', date_of_birth: '1998-04-20', gender: 'Female', height_cm: 160.0, weight_kg: 50.0, eye_color: 'Brown', hair_color: 'Blue', nationality: 'Japanese', address: 'Akihabara District, Tokyo', fingerprint_id: 'FP-2024-008', status: 'released', danger_level: 'low', description: 'Graffiti artist turned cybercriminal. Released on good behavior.' },
  { first_name: 'Aleksandr', last_name: 'Volkov', alias: 'The Bear', date_of_birth: '1975-08-11', gender: 'Male', height_cm: 195.0, weight_kg: 110.0, eye_color: 'Grey', hair_color: 'Bald', nationality: 'Russian', address: 'Moscow, Russia', fingerprint_id: 'FP-2024-009', status: 'wanted', danger_level: 'critical', description: 'Arms dealer with connections to multiple underground organizations.' },
  { first_name: 'Isabella', last_name: 'Romano', alias: 'Black Widow', date_of_birth: '1988-02-28', gender: 'Female', height_cm: 168.0, weight_kg: 58.0, eye_color: 'Brown', hair_color: 'Black', nationality: 'Italian', address: 'Naples, Italy', fingerprint_id: 'FP-2024-010', status: 'arrested', danger_level: 'high', description: 'Mafia family enforcer. Connected to multiple organized crime rings.' },
  { first_name: 'Kwame', last_name: 'Asante', alias: 'Specter', date_of_birth: '1991-10-07', gender: 'Male', height_cm: 183.0, weight_kg: 80.0, eye_color: 'Brown', hair_color: 'Black', nationality: 'Ghanaian', address: 'Accra, Ghana', fingerprint_id: 'FP-2024-011', status: 'wanted', danger_level: 'medium', description: 'Identity theft specialist operating across West Africa.' },
  { first_name: 'Natasha', last_name: 'Kowalski', alias: 'Ice Queen', date_of_birth: '1987-05-19', gender: 'Female', height_cm: 173.0, weight_kg: 63.0, eye_color: 'Blue', hair_color: 'Blonde', nationality: 'Polish', address: 'Warsaw, Poland', fingerprint_id: 'FP-2024-012', status: 'deceased', danger_level: 'low', description: 'Former smuggling network operator. Deceased during attempted arrest.' }
];

const cases_data = [
  { case_number: 'SDB-2024-001', title: 'Operation Dark Eclipse', description: 'Multi-city heist operation targeting high-security vaults. Estimated $200M in stolen goods.', crime_type: 'Robbery', status: 'investigating', priority: 'critical', location: 'New York, NY', occurred_at: '2024-01-15 03:30:00' },
  { case_number: 'SDB-2024-002', title: 'The Serpent Network', description: 'International drug trafficking pipeline from South America to Europe.', crime_type: 'Drug Trafficking', status: 'open', priority: 'high', location: 'Miami, FL', occurred_at: '2024-02-20 14:00:00' },
  { case_number: 'SDB-2024-003', title: 'Ghost Protocol Breach', description: 'Classified government systems breached. Sensitive data exfiltrated.', crime_type: 'Cybercrime', status: 'investigating', priority: 'critical', location: 'Washington, DC', occurred_at: '2024-03-10 22:15:00' },
  { case_number: 'SDB-2024-004', title: 'Digital Phantom', description: 'Series of coordinated cyberattacks on financial institutions.', crime_type: 'Cybercrime', status: 'closed', priority: 'high', location: 'San Francisco, CA', occurred_at: '2024-04-05 11:00:00' },
  { case_number: 'SDB-2024-005', title: 'The Long Con', description: 'International fraud scheme targeting wealthy individuals across 12 countries.', crime_type: 'Fraud', status: 'investigating', priority: 'medium', location: 'London, UK', occurred_at: '2024-05-18 09:30:00' },
  { case_number: 'SDB-2024-006', title: 'Phoenix Rising', description: 'Massive cryptocurrency fraud scheme draining wallets globally.', crime_type: 'Fraud', status: 'open', priority: 'high', location: 'Lagos, Nigeria', occurred_at: '2024-06-01 16:45:00' },
  { case_number: 'SDB-2024-007', title: 'Cartel Crackdown', description: 'Joint operation to dismantle drug cartel operations along the border.', crime_type: 'Drug Trafficking', status: 'investigating', priority: 'critical', location: 'El Paso, TX', occurred_at: '2024-07-12 05:00:00' },
  { case_number: 'SDB-2024-008', title: 'Neon Vandal', description: 'Series of cyber-vandalism attacks on corporate infrastructure.', crime_type: 'Cybercrime', status: 'closed', priority: 'low', location: 'Tokyo, Japan', occurred_at: '2024-03-25 20:00:00' },
  { case_number: 'SDB-2024-009', title: 'Arms of the Bear', description: 'International arms trafficking network supplying conflict zones.', crime_type: 'Other', status: 'open', priority: 'critical', location: 'Berlin, Germany', occurred_at: '2024-08-03 12:00:00' },
  { case_number: 'SDB-2024-010', title: 'Black Widow Web', description: 'Organized crime network controlling narcotics distribution in Southern Europe.', crime_type: 'Drug Trafficking', status: 'investigating', priority: 'high', location: 'Naples, Italy', occurred_at: '2024-09-15 23:30:00' }
];

const officers_data = [
  { badge_number: 'SDB-OFF-001', first_name: 'John', last_name: 'Mitchell', rank_title: 'Detective Sergeant', department: 'Major Crimes', phone: '+1-555-0101', email: 'j.mitchell@shadowdb.gov', status: 'active' },
  { badge_number: 'SDB-OFF-002', first_name: 'Maria', last_name: 'Santos', rank_title: 'Lieutenant', department: 'Organized Crime', phone: '+1-555-0102', email: 'm.santos@shadowdb.gov', status: 'active' },
  { badge_number: 'SDB-OFF-003', first_name: 'David', last_name: 'Kim', rank_title: 'Detective', department: 'Cybercrime Unit', phone: '+1-555-0103', email: 'd.kim@shadowdb.gov', status: 'active' },
  { badge_number: 'SDB-OFF-004', first_name: 'Rachel', last_name: 'Thompson', rank_title: 'Captain', department: 'Internal Affairs', phone: '+1-555-0104', email: 'r.thompson@shadowdb.gov', status: 'active' },
  { badge_number: 'SDB-OFF-005', first_name: 'Ahmed', last_name: 'Hassan', rank_title: 'Detective', department: 'Narcotics', phone: '+1-555-0105', email: 'a.hassan@shadowdb.gov', status: 'active' },
  { badge_number: 'SDB-OFF-006', first_name: 'Lisa', last_name: 'Park', rank_title: 'Forensic Analyst', department: 'Crime Lab', phone: '+1-555-0106', email: 'l.park@shadowdb.gov', status: 'active' },
  { badge_number: 'SDB-OFF-007', first_name: 'Robert', last_name: 'O\'Brien', rank_title: 'Sergeant', department: 'Special Operations', phone: '+1-555-0107', email: 'r.obrien@shadowdb.gov', status: 'active' },
  { badge_number: 'SDB-OFF-008', first_name: 'Priya', last_name: 'Sharma', rank_title: 'Intelligence Analyst', department: 'Counter Intelligence', phone: '+1-555-0108', email: 'p.sharma@shadowdb.gov', status: 'active' }
];

const evidence_data = [
  { case_id: 1, type: 'physical', description: 'Custom lock-picking toolset found at the vault entrance', location_found: 'First National Bank Vault', collected_by: 1, chain_of_custody: 'Scene → Evidence Locker A-14 → Lab Analysis' },
  { case_id: 1, type: 'digital', description: 'Security camera footage showing suspect entering building', location_found: 'Bank security office', collected_by: 3, chain_of_custody: 'Security Server → Digital Evidence Unit' },
  { case_id: 2, type: 'physical', description: '50kg of unprocessed narcotics seized during raid', location_found: 'Warehouse District, Dock 7', collected_by: 5, chain_of_custody: 'Scene → Narcotics Evidence Vault → Lab Testing' },
  { case_id: 3, type: 'digital', description: 'Malware samples recovered from compromised servers', location_found: 'DoD Server Farm', collected_by: 3, chain_of_custody: 'Server Image → Cyber Lab → Classified Storage' },
  { case_id: 3, type: 'digital', description: 'IP trace logs indicating origin of attack', location_found: 'Network Operations Center', collected_by: 8, chain_of_custody: 'NOC → Intelligence Analysis' },
  { case_id: 4, type: 'digital', description: 'Decrypted hard drive containing stolen financial data', location_found: 'Suspect residence', collected_by: 3, chain_of_custody: 'Residence → Cyber Lab → Evidence Storage' },
  { case_id: 5, type: 'documentary', description: 'Forged identity documents from 8 different countries', location_found: 'Hotel room safe', collected_by: 1, chain_of_custody: 'Hotel → Document Analysis → Evidence Locker B-22' },
  { case_id: 6, type: 'digital', description: 'Blockchain transaction records showing fund movements', location_found: 'Financial analysis', collected_by: 8, chain_of_custody: 'Blockchain Analysis → Financial Crimes Unit' },
  { case_id: 7, type: 'physical', description: 'Seized automatic weapons and ammunition cache', location_found: 'Border crossing tunnel', collected_by: 7, chain_of_custody: 'Border → ATF → Evidence Vault C-01' },
  { case_id: 9, type: 'physical', description: 'Intercepted weapons shipment manifest documents', location_found: 'Cargo container at Hamburg Port', collected_by: 2, chain_of_custody: 'Port Authority → Interpol → Evidence Vault' },
  { case_id: 10, type: 'testimonial', description: 'Witness testimony from informant inside the organization', location_found: 'Safe house debriefing', collected_by: 2, chain_of_custody: 'Debriefing → Transcription → Classified Records' },
  { case_id: 10, type: 'physical', description: 'Financial ledgers documenting distribution network', location_found: 'Raid on Naples warehouse', collected_by: 5, chain_of_custody: 'Warehouse → Financial Analysis → Evidence Locker' }
];

const assignments_data = [
  { case_id: 1, criminal_id: 1, officer_id: 1, role: 'suspect', notes: 'Primary suspect - matches security footage' },
  { case_id: 1, criminal_id: null, officer_id: 1, role: 'investigator', notes: 'Lead investigator' },
  { case_id: 2, criminal_id: 2, officer_id: 5, role: 'suspect', notes: 'Identified through DEA intelligence' },
  { case_id: 2, criminal_id: 7, officer_id: 5, role: 'suspect', notes: 'Connected through intercepted communications' },
  { case_id: 2, criminal_id: null, officer_id: 2, role: 'investigator', notes: 'Operation commander' },
  { case_id: 3, criminal_id: 3, officer_id: 3, role: 'suspect', notes: 'Digital fingerprint matches known operative' },
  { case_id: 3, criminal_id: null, officer_id: 8, role: 'investigator', notes: 'Intelligence analyst lead' },
  { case_id: 4, criminal_id: 4, officer_id: 3, role: 'suspect', notes: 'Arrested at residence with evidence' },
  { case_id: 5, criminal_id: 5, officer_id: 1, role: 'suspect', notes: 'Multiple aliases confirmed' },
  { case_id: 6, criminal_id: 6, officer_id: 8, role: 'suspect', notes: 'Crypto wallet traced to suspect' },
  { case_id: 7, criminal_id: 7, officer_id: 7, role: 'suspect', notes: 'Under surveillance for 6 months' },
  { case_id: 8, criminal_id: 8, officer_id: 3, role: 'suspect', notes: 'Confessed to charges, cooperating' },
  { case_id: 9, criminal_id: 9, officer_id: 2, role: 'suspect', notes: 'Interpol red notice active' },
  { case_id: 10, criminal_id: 10, officer_id: 2, role: 'suspect', notes: 'Under active investigation' },
  { case_id: 10, criminal_id: null, officer_id: 5, role: 'investigator', notes: 'Narcotics specialist assigned' }
];

async function seed() {
  const db = await getDb();
  
  try {
    console.log('🌱 Seeding ShadowDB database...\n');
    
    // Clear existing data in reverse FK order
    await db.exec('PRAGMA foreign_keys = OFF;');
    await db.run('DELETE FROM case_assignments');
    await db.run('DELETE FROM evidence');
    await db.run('DELETE FROM officers');
    await db.run('DELETE FROM cases');
    await db.run('DELETE FROM criminals');
    
    // Reset auto-increment counters if needed (optional)
    try {
      await db.run("DELETE FROM sqlite_sequence WHERE name IN ('case_assignments', 'evidence', 'officers', 'cases', 'criminals')");
    } catch(e) {}
    
    await db.exec('PRAGMA foreign_keys = ON;');
    console.log('  ✓ Cleared existing data');

    // Insert criminals
    for (const c of criminals) {
      await db.run(
        `INSERT INTO criminals (first_name, last_name, alias, date_of_birth, gender, height_cm, weight_kg, eye_color, hair_color, nationality, address, fingerprint_id, status, danger_level, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.first_name, c.last_name, c.alias, c.date_of_birth, c.gender, c.height_cm, c.weight_kg, c.eye_color, c.hair_color, c.nationality, c.address, c.fingerprint_id, c.status, c.danger_level, c.description]
      );
    }
    console.log(`  ✓ Inserted ${criminals.length} criminals`);

    // Insert cases
    for (const c of cases_data) {
      await db.run(
        `INSERT INTO cases (case_number, title, description, crime_type, status, priority, location, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.case_number, c.title, c.description, c.crime_type, c.status, c.priority, c.location, c.occurred_at]
      );
    }
    console.log(`  ✓ Inserted ${cases_data.length} cases`);

    // Insert officers
    for (const o of officers_data) {
      await db.run(
        `INSERT INTO officers (badge_number, first_name, last_name, rank_title, department, phone, email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [o.badge_number, o.first_name, o.last_name, o.rank_title, o.department, o.phone, o.email, o.status]
      );
    }
    console.log(`  ✓ Inserted ${officers_data.length} officers`);

    // Insert evidence
    for (const e of evidence_data) {
      await db.run(
        `INSERT INTO evidence (case_id, type, description, location_found, collected_by, chain_of_custody) VALUES (?, ?, ?, ?, ?, ?)`,
        [e.case_id, e.type, e.description, e.location_found, e.collected_by, e.chain_of_custody]
      );
    }
    console.log(`  ✓ Inserted ${evidence_data.length} evidence records`);

    // Insert case assignments
    for (const a of assignments_data) {
      await db.run(
        `INSERT INTO case_assignments (case_id, criminal_id, officer_id, role, notes) VALUES (?, ?, ?, ?, ?)`,
        [a.case_id, a.criminal_id, a.officer_id, a.role, a.notes]
      );
    }
    console.log(`  ✓ Inserted ${assignments_data.length} case assignments`);

    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    process.exit(0);
  }
}

seed();
