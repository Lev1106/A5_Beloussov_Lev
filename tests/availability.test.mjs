import test from 'node:test';
import assert from 'node:assert/strict';
import { checkAvailability, timeStringToMinutes } from '../src/utils/time.ts';
import { sampleRooms, sampleBookings } from '../src/data/sampleData.ts';
const check=(s,e,id='r1',bookings=sampleBookings)=>checkAvailability(sampleRooms.find(r=>r.id===id),s,e,615,bookings);
const tests=[
 ['AC1: start equals now rejects',()=>assert.equal(check(615,650).status,'unavailable')],
 ['AC1: reversed rejects',()=>assert.equal(check(720,690).status,'unavailable')],
 ['AC1: fractional rejects',()=>assert.equal(check(720.5,780).status,'unavailable')],
 ['AC1: negative start rejects',()=>assert.equal(check(-1,90).status,'unavailable')],
 ['AC1: end beyond 1440 rejects',()=>assert.equal(check(1439,1441).status,'unavailable')],
 ['AC1: time parser 13:00 -> 780',()=>assert.equal(timeStringToMinutes('13:00'),780)],
 ['AC2: exactly 120 minutes allowed',()=>assert.equal(check(780,900).status,'available')],
 ['AC2: 121 minutes rejected',()=>assert.equal(check(780,901).status,'unavailable')],
 ['AC3: blocked room rejects',()=>assert.equal(check(780,840,'r4').status,'unavailable')],
 ['AC4: touching after booking allowed',()=>assert.equal(check(780,840).status,'available')],
 ['AC4: touching before booking allowed',()=>assert.equal(check(660,720).status,'available')],
 ['AC4: overlap rejects',()=>assert.equal(check(750,810).status,'unavailable')],
 ['AC4: another room booking ignored',()=>assert.equal(check(780,840,'r2').status,'available')],
 ['AC5: original booking order preserved',()=>{const ids=sampleBookings.map(b=>b.id);check(780,840);assert.deepEqual(sampleBookings.map(b=>b.id),ids)}],
 ['AC5: does not modify frozen input array',()=>{const frozen=Object.freeze([{id:'x',roomId:'r1',start:720,end:780,title:'Test',bookedBy:'Test'}]);assert.equal(check(780,840,'r1',frozen).status,'available')}],
];
for(const [title,fn] of tests)test(title,fn);

test('A5: parser rejects non-clock and out-of-range times', () => {
  for (const bad of ['13:99', '25:00', '12:3', '24:01', 'abc', '', '13:00:00', ' 13:00']) {
    assert.equal(Number.isNaN(timeStringToMinutes(bad)), true, `${bad} must be rejected`);
  }
});
test('A5: parser accepts valid boundaries', () => {
  assert.equal(timeStringToMinutes('00:00'), 0);
  assert.equal(timeStringToMinutes('23:59'), 1439);
  assert.equal(timeStringToMinutes('24:00'), 1440);
});
test('A5: invalid string never yields a bookable interval', () => {
  const badStart = timeStringToMinutes('13:99');
  assert.equal(check(badStart, 900).status, 'unavailable');
});
