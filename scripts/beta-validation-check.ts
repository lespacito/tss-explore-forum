import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {eq} from 'drizzle-orm';
import {db} from '../src/db';
import {user, session, account, alias, threads} from '../src/db/schema';
import {eraseAccountRecords} from '../src/features/beta/server/erase-account-records';
assert.match(process.env.DB_SCHEMA ?? '', /^beta_validation_\d+$/, 'Requires isolated validation schema');
const id = `erase-test-${randomUUID()}`;
const neighbor = `neighbor-${randomUUID()}`;
await db.insert(user).values([
 {id, name:'Fictional erasure fixture',email:`${id}@beta-test.invalid`,isAnonymous:true,secretCode:`test-${randomUUID()}`},
 {id:neighbor,name:'Control fixture',email:`${neighbor}@beta-test.invalid`,isAnonymous:true},
]);
const [identity] = await db.insert(alias).values({userId:id,alias:id,isPrimary:true}).returning();
await db.insert(session).values([1,2].map(n => ({id:`${id}-${n}`,token:`${id}-${n}`,userId:id,expiresAt:new Date(Date.now()+86400000)})));
await db.insert(account).values({id,accountId:id,userId:id,providerId:'secret-code'});
const [publication] = await db.insert(threads).values({aliasId:identity.id,title:id,body:'Fictional disposable fixture',slug:id,category:'AUTRE'}).returning();
assert.equal(publication.status,'pending');
await eraseAccountRecords(id);
for(const [table,column] of [[user,user.id],[session,session.userId],[account,account.userId],[alias,alias.userId]] as const) {
 assert.equal((await db.select().from(table).where(eq(column,id))).length,0);
}
assert.equal((await db.select().from(threads).where(eq(threads.id,publication.id))).length,0);
assert.equal((await db.select().from(user).where(eq(user.id,neighbor))).length,1);
await assert.rejects(()=>eraseAccountRecords(id));
await eraseAccountRecords(neighbor);
console.log('PASS: atomic erasure removes account, secret, two sessions, alias and publication; another account is preserved.');
process.exit(0);
