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


export const getGoodContrastColor = (cssColor: string) => {
    // Create a temporary element to apply the style
    const tempDiv = document.createElement('div');
    tempDiv.style.color = cssColor;
    document.body.appendChild(tempDiv);

    // Get computed color
    const style = window.getComputedStyle(tempDiv);
    const rgbColor = style.color;

    // Clean up
    document.body.removeChild(tempDiv);

    // Convert to RGB values
    const rgbValues = rgbColor.match(/\d+/g)!.map(Number);
    const [r, g, b] = rgbValues;

    // Calculate luminance
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 128) ? '#000000' : '#ffffff';
}


export const randomColor = (lightFactor = 150) => {
    const red = Math.floor(Math.random() * (256 - lightFactor) + lightFactor);
    const green = Math.floor(Math.random() * (256 - lightFactor) + lightFactor);
    const blue = Math.floor(Math.random() * (256 - lightFactor) + lightFactor);

    return "#" + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
}
