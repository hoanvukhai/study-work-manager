import { parseMentions } from './mentions';

describe('parseMentions (tách [[Tiêu đề]])', () => {
  it('lấy các tiêu đề trong [[ ]], giữ thứ tự xuất hiện', () => {
    expect(parseMentions('Xem [[Lý thuyết JWT]] và [[Docs NestJS]] nhé')).toEqual(['Lý thuyết JWT', 'Docs NestJS']);
  });

  it('cắt khoảng trắng hai đầu và bỏ trùng không phân biệt hoa thường', () => {
    expect(parseMentions('[[  JWT ]] rồi [[jwt]] rồi [[JWT]]')).toEqual(['JWT']);
  });

  it('bỏ qua [[]] rỗng, chỉ có khoảng trắng và ngoặc không đóng', () => {
    expect(parseMentions('[[]] [[   ]] [[chưa đóng')).toEqual([]);
  });

  it('không bắt qua nhiều dòng và không bắt ngoặc lồng', () => {
    expect(parseMentions('[[dòng 1\ndòng 2]]')).toEqual([]);
    expect(parseMentions('[[a [[b]] c]]')).toEqual(['b']);
  });

  it('null / rỗng trả mảng rỗng; tiêu đề quá dài bị bỏ', () => {
    expect(parseMentions(null)).toEqual([]);
    expect(parseMentions('')).toEqual([]);
    expect(parseMentions(`[[${'x'.repeat(300)}]]`)).toEqual([]);
  });
});
