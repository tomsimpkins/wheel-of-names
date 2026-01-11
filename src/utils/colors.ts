export const wheelColors = [
	"#ff595e",
	"#ffca3a",
	"#8ac926",
	"#1982c4",
	"#6a4c93",
	"#f77f00",
	"#4ecdc4",
	"#8338ec",
];

export const getContrastText = (hex: string) => {
	const value = hex.replace("#", "");
	const r = Number.parseInt(value.slice(0, 2), 16);
	const g = Number.parseInt(value.slice(2, 4), 16);
	const b = Number.parseInt(value.slice(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.6 ? "#111" : "#fff";
};
