import { describe, expect, it } from 'vitest';
import { checkItemLine } from '../evaluate';
import pack from '../../../../content/packs/MTH12_09_02_01.seed.json';
const worksheet = pack.items.filter(i => i.step === 'worksheet');
function mark(id: string, line: string) {
  const key = worksheet.find(i => i.id === id)!.key;
  return checkItemLine(line, null, key.final!, [...(key.worked_solution ?? []), ...(key.accepted_methods ?? []).flat()]);
}
describe('worksheet lines must follow the item method', () => {
  it.each([['6/3','check'],['3/6','ok'],['1/2','ok']])('marks problem 4 %s as %s', (line, status) => {
    expect(mark('GRAD_WS4', line).status).toBe(status);
  });
  it('keeps the missing negative amber', () => expect(mark('GRAD_WS3', '15/5').status).toBe('check'));
  it.each([['GRAD_WS1','2/4'],['GRAD_WS2','2/6'],['GRAD_WS3','5/-15'],['GRAD_WS4','6/3'],['GRAD_WS5','8/-6']])('rejects the flipped gradient on %s', (id, line) => {
    expect(mark(id, line).status).toBe('check');
  });
  it('accepts every approved worked solution line', () => {
    for (const item of worksheet) for (const line of item.key.worked_solution ?? []) expect(mark(item.id, line).status).toBe('ok');
  });
});
