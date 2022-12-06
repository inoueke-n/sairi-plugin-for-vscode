export function insertString(
  index: number,
  substr: string,
  str: string
): string {
  if (index < 0 || index > str.length) {
    const args = `index=${index}, substr=${substr}, str=${str}`;
    throw new Error(
      `function@insertString failed. IndexOutOfRange. args=${args}`
    );
  }

  return [str.slice(0, index), substr, str.slice(index)].join("");
}

/**
 * 文字列sからi1~i2の範囲を切り取った残りの文字列を返す
 * @param s 切り取られる文字列
 * @param i1 インデックス1
 * @param i2 インデックス2
 */
export function substringRes(s: string, i1: number, i2: number): string {
  if (i1 < 0 || i2 < 0) {
    const args = `s=${s}, i1=${i1}, i2=${i2}`;
    throw new Error(
      `function@substringRes failed. substringRes failed. Invalid argument. args=${args}`
    );
  }

  return s.substring(0, i1) + s.substring(i2);
}
