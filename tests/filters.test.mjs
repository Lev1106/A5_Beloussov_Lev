import test from 'node:test';
import assert from 'node:assert/strict';
import { filterRooms, resolveSelectedRoomId, getBookingsForRoom } from '../src/utils/roomFilters.ts';
import { sampleRooms, sampleBookings } from '../src/data/sampleData.ts';
import { checkAvailability } from '../src/utils/time.ts';
const ids = (attendees, equipment=[])=>filterRooms(sampleRooms,attendees,equipment).map(r=>r.id);
test('catalog has 5 fictional rooms with required fields',()=>{
  assert.equal(sampleRooms.length,5);
  sampleRooms.forEach(r=>{assert.ok(r.id && r.name && Number.isInteger(r.capacity));assert.ok(Array.isArray(r.equipment));assert.equal(typeof r.blocked,'boolean');});
});
test('F1: exact 40 capacity accepted',()=>assert.deepEqual(ids(40),['r1']));
test('F1: capacity 41 gives empty list',()=>assert.deepEqual(ids(41),[]));
test('F1: capacity 30 gives r1 and r4 (blocked still visible)',()=>assert.deepEqual(ids(30),['r1','r4']));
test('F1: invalid attendees 0 is empty',()=>assert.deepEqual(ids(0),[]));
test('F1: invalid fractional attendees is empty',()=>assert.deepEqual(ids(1.5),[]));
test('F1: invalid NaN is empty',()=>assert.deepEqual(ids(NaN),[]));
test('F2: Projector matches all projector rooms',()=>assert.deepEqual(ids(1,['Projector']),['r1','r2','r4']));
test('F2: all selected items required (Projector + Whiteboard)',()=>assert.deepEqual(ids(1,['Projector','Whiteboard']),['r1','r4']));
test('F2: exact capacity with combined equipment',()=>assert.deepEqual(ids(40,['Projector','Whiteboard']),['r1']));
test('F2/F4: unmatched equipment shows empty result',()=>assert.deepEqual(ids(1,['Space telescope']),[]));
test('F2: without equipment filter, all five rooms match',()=>assert.deepEqual(ids(1),['r1','r2','r3','r4','r5']));
test('F3: matching blocked room still unavailable',()=>{
  const room=filterRooms(sampleRooms,30,['Projector','Whiteboard']).find(r=>r.id==='r4');
  assert.equal(checkAvailability(room,780,840,615,sampleBookings).status,'unavailable');
});
test('F5: preserves selected room when still matching',()=>{
  const matches=filterRooms(sampleRooms,1,['Projector']);
  assert.equal(resolveSelectedRoomId(matches,'r2'),'r2');
});
test('F5: switches to valid match when prior selected filtered away',()=>{
  const matches=filterRooms(sampleRooms,40,[]);
  assert.equal(resolveSelectedRoomId(matches,'r2'),'r1');
});
test('F4: empty matching list has null selected room',()=>assert.equal(resolveSelectedRoomId([], 'r1'),null));
test('room bookings use room-specific data',()=>{
  assert.deepEqual(getBookingsForRoom(sampleBookings,'r2').map(b=>b.id),['b4','b5']);
});
test('room bookings empty when no room matches',()=>assert.deepEqual(getBookingsForRoom(sampleBookings,null),[]));
test('filter does not mutate catalog or equipment requirements',()=>{
  const before=JSON.stringify(sampleRooms),req=Object.freeze(['Wi-Fi']);
  ids(1,req);assert.equal(JSON.stringify(sampleRooms),before);assert.deepEqual(req,['Wi-Fi']);
});
test('AC5: room bookings return separate list',()=>{
  const got=getBookingsForRoom(sampleBookings,'r1');got.reverse();
  assert.equal(sampleBookings[0].id,'b1');
});
test('integration: switching room changes booking conflict decision',()=>{
  const matches=filterRooms(sampleRooms,1,[]);
  const first=matches.find(r=>r.id===resolveSelectedRoomId(matches,'r1'));
  const second=matches.find(r=>r.id===resolveSelectedRoomId(matches,'r2'));
  assert.equal(checkAvailability(first,630,690,615,sampleBookings).status,'available');
  assert.equal(checkAvailability(second,630,690,615,sampleBookings).status,'unavailable');
  assert.equal(getBookingsForRoom(sampleBookings,second.id)[0].roomId,second.id);
});
test('integration: filter change reconciles selection and booking list',()=>{
  const before=filterRooms(sampleRooms,1,[]);
  assert.equal(resolveSelectedRoomId(before,'r2'),'r2');
  const after=filterRooms(sampleRooms,40,['Whiteboard']);
  const id=resolveSelectedRoomId(after,'r2');
  assert.equal(id,'r1');
  assert.equal(getBookingsForRoom(sampleBookings,id).length,3);
});
