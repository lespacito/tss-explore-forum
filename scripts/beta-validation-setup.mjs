import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { parse } from 'dotenv';
import pg from 'pg';
import { hashPassword } from 'better-auth/crypto';
const settings = parse(await readFile('.env.local'));
const schema = `beta_validation_${Date.now()}`;
const client = new pg.Client({host: settings.DB_HOST,port:Number(settings.DB_PORT ?? 5432),user:settings.DB_USER,password:settings.DB_PASSWORD,database:settings.DB_NAME});
await client.connect();
try {
 await client.query(`CREATE SCHEMA "${schema}"`);
 await client.query(`SET search_path TO "${schema}"`);
 const journal=JSON.parse(await readFile('src/db/migrations/meta/_journal.json','utf8'));
 for (const entry of journal.entries) {
  const source=await readFile(`src/db/migrations/${entry.tag}.sql`,'utf8');
  await client.query('BEGIN');
  for(const statement of source.replaceAll('"public".',`"${schema}".`).split('--> statement-breakpoint')) if(statement.trim()) await client.query(statement);
  await client.query('COMMIT');
 }
 const invitation = randomBytes(32).toString('base64url');
 const password = randomBytes(24).toString('base64url');
 await client.query(`INSERT INTO "user" (id,name,email,email_verified,username,display_username,role) VALUES ('beta-validation-moderator','Modérateur de test','moderator@beta-test.invalid',true,'beta_moderator','Modérateur de test','MODERATOR')`);
 await client.query(`INSERT INTO account (id,account_id,provider_id,user_id,password) VALUES ('beta-validation-credential','beta-validation-moderator','credential','beta-validation-moderator',$1)`,[await hashPassword(password)]);
 const variables={...settings,DB_SCHEMA:schema,BETTER_AUTH_SECRET:randomBytes(32).toString('base64url'),BETTER_AUTH_URL:'http://127.0.0.1:3001',VITE_BETTER_AUTH_URL:'http://127.0.0.1:3001',BETA_INVITATION_CODES:invitation,BETA_SUBMISSIONS_OPEN:'true',BETA_MODERATION_SCHEDULE:'Environnement local de validation : modération pendant le test.',BETA_VALIDATION_PASSWORD:password,LOG_LEVEL:'error'};
 await writeFile('.env.beta-validation.local',Object.entries(variables).map(([k,v])=>`${k}=${JSON.stringify(v)}`).join('\n')+'\n',{mode:0o600});
 console.log(`Migrations applied to isolated empty schema ${schema}. Test credentials saved to ignored .env.beta-validation.local.`);
} finally { await client.end(); }
