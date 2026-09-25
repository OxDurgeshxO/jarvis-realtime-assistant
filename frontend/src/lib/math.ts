/**
 * Safely parse and calculate an arithmetic expression using recursive descent.
 * Zero dynamic code execution (no eval, no new Function).
 */
export function tryCalculate(input: string): number | null {
  const cleaned = input
    .toLowerCase()
    .replace(/plus/g, "+")
    .replace(/minus/g, "-")
    .replace(/(multiplied by|times|x)/g, "*")
    .replace(/(divided by|over)/g, "/")
    .replace(/[^0-9+\-*/().\s]/g, "")
    .trim();

  if (!cleaned || !/[0-9]/.test(cleaned) || !/[+\-*/]/.test(cleaned)) {
    return null;
  }

  try {
    const tokens: string[] = [];
    const regex = /\d+(?:\.\d+)?|[+\-*/()]/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(cleaned)) !== null) {
      tokens.push(match[0]);
    }

    let pos = 0;
    const peek = () => tokens[pos];
    const consume = () => tokens[pos++];

    const parsePrimary = (): number => {
      const token = consume();
      if (!token) throw new Error("Unexpected end");
      if (token === "(") {
        const val = parseExpression();
        if (consume() !== ")") throw new Error("Mismatched parens");
        return val;
      }
      if (token === "-") {
        return -parsePrimary();
      }
      if (token === "+") {
        return parsePrimary();
      }
      const num = Number(token);
      if (isNaN(num)) throw new Error("Invalid number: " + token);
      return num;
    };

    const parseFactor = (): number => {
      let left = parsePrimary();
      while (peek() === "*" || peek() === "/") {
        const op = consume();
        const right = parsePrimary();
        if (op === "*") left *= right;
        else {
          if (right === 0) throw new Error("Division by zero");
          left /= right;
        }
      }
      return left;
    };

    const parseExpression = (): number => {
      let left = parseFactor();
      while (peek() === "+" || peek() === "-") {
        const op = consume();
        const right = parseFactor();
        if (op === "+") left += right;
        else left -= right;
      }
      return left;
    };

    const result = parseExpression();
    if (pos !== tokens.length) return null;
    if (typeof result === "number" && Number.isFinite(result)) {
      return Math.round(result * 1e6) / 1e6;
    }
  } catch {
    return null;
  }
  return null;
}

/** Format a number nicely for speech (e.g. 4.5 -> "4.5", 1000000 -> "1,000,000"). */
export function formatNumber(n: number): string {
  if (Number.isInteger(n)) {
    return n.toLocaleString("en-US");
  }
  return String(n);
}
