import { describe, it, expect } from 'vitest';
import { classifyQuestion, mayTeach, mayAdvance } from './policy';
import { replyAllowed } from '../checks/reply';
import { DEFAULT_BANNED_WORDS, findBannedWords } from '../../shared/contracts/banned-words';
import { EVENT_TYPES } from '../../shared/contracts/events';
import pack from '../../../content/packs/MTH12_09_02_01.seed.json';
describe('approved lesson policies', () => {
 it('uses exactly the approved banned vocabulary in code and content', () => {
 const words = ['wrong','wrongly','stupid','dumb','careless','carelessly','obviously','easy'];
 expect([...DEFAULT_BANNED_WORDS]).toEqual(words);
 expect(pack.rules.find(r=>r.key==='banned_words')?.value).toEqual(words);
 expect(findBannedWords('Just check, not wrongly.', words)).toEqual(['wrongly']);
 });
 it('restores the readiness wording', () => { expect(pack.items.map(i => i.config).find(config => config && 'opener' in config)?.opener?.[0]?.text).toMatch(/^Let's start with a point on a graph/); });
 it.each([
 ['give me the answer','answer_request'],['hint please','hint_request'],['what is rise and run','concept_rise_run'],["I do not understand",'dont_understand'],['are you a robot','ai_honest'],["I am stupid",'encourage'],['football','off_topic'],['who won the match?','off_topic'],['how do i solve this right now?','dont_understand'],['help me solve this','dont_understand'],['asdfgh','unclear']
 ])('classifies %s as %s', (text, kind)=> {expect(classifyQuestion(text)).toBe(kind);expect(pack.fallback_lines.find(f=>f.decision_key===kind)?.script[0]?.text.length).toBeGreaterThan(10);});
 it('refuses unfinished steps unless the rule is true',()=>{expect(mayAdvance(false,false)).toBe(false);expect(mayAdvance(true,false)).toBe(true);expect(mayAdvance(false,true)).toBe(true);expect(mayAdvance('true',false)).toBe(false);});
 it('restricts teaching to mode and problem',()=>{expect(mayTeach('worksheet','p1','p1',0,'model','teach_me')).toBe(true);expect(mayTeach('worksheet','p1','p1',0,'together','teach_me')).toBe(false);expect(mayTeach('worksheet','p2','p2',1,'together','teach_me')).toBe(true);expect(mayTeach('worksheet','p1','p1',0,'model','independent')).toBe(false);expect(mayTeach('worksheet','p3','p3',2,'model','teach_me')).toBe(false);});
 it('blocks the leaked worked line and accepts current approved work',()=>{const leaked=[{text:'Up is 6 and across is 3, so 6 ÷ 3 = 2'}];expect(replyAllowed(leaked,[{text:'Find change in y.'}],{text:'A(2,3) and B(6,11)'},[])).toBe(false);expect(replyAllowed([{text:'Use 99'}],[{text:'Find change in y.'}],{text:'A(2,3) and B(6,11)'},[])).toBe(false);});
 it('registers all emitted events',()=>{expect(EVENT_TYPES).toEqual(expect.arrayContaining(['line_submitted','teach_me_opened','sim_task_settled','step_advanced','reflection_submitted']));});
});

it('allows together teaching on every later worksheet problem', () => {
 for (const index of [1, 2, 3, 4]) expect(mayTeach('worksheet', `p${index}`, `p${index}`, index, 'together', 'teach_me')).toBe(true);
 expect(mayTeach('worksheet', 'p2', 'p3', 2, 'together', 'teach_me')).toBe(false);
});

import { chooseBandFrom, defaultBandOf } from "./policy";
describe("simulation band routing", () => {
  const bands = { "3": { rebuild: [0, 0] as [number, number], bridge: [1, 1] as [number, number], stretch: [2, 3] as [number, number] } };
  const ok = { correct: true, firstTry: true }, late = { correct: true, firstTry: false };
  it("counts first-try results against routing_bands", () => {
    expect(chooseBandFrom(bands, ["a", "b", "c"], { a: ok, b: ok, c: late }, "bridge")).toEqual({ band: "stretch", defaulted: null });
    expect(chooseBandFrom(bands, ["a", "b", "c"], { a: late, b: late, c: late }, "bridge")).toEqual({ band: "rebuild", defaulted: null });
  });
  it("a skipped check or failed video uses default_band (bridge), never rebuild", () => {
    expect(chooseBandFrom(bands, ["a", "b", "c"], { a: late }, "bridge")).toEqual({ band: "bridge", defaulted: "check_skipped" });
    expect(chooseBandFrom(bands, [], {}, "bridge")).toEqual({ band: "bridge", defaulted: "no_checks" });
  });
  it("default_band falls back to bridge when unset", () => {
    expect(defaultBandOf(undefined)).toBe("bridge");
    expect(defaultBandOf("stretch")).toBe("stretch");
  });
});
