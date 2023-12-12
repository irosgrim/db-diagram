export const generateCssClass = (...args: any): string => {
  const k = args.map((a: any) => {
    if(a instanceof Array) {
      return generateCssClass(...a);
    }
    if(typeof a === "string") {
      return a.trim();
    }
    if (typeof a === "object") {
      return Object.keys(a).filter(x => !!a[x]).join(" ");
    }
    return a;
  })
  return k.join(" ");
}