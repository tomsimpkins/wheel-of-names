import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { getContrastText, wheelColors } from "../utils/colors";

type WheelCanvasProps = {
	names: string[];
	onWinner: (name: string) => void;
	forceLastIncludes?: string | null;
};

export function WheelCanvas(props: WheelCanvasProps) {
	const colors = wheelColors;
	const [winner, setWinner] = createSignal<string | null>(null);
	const [spinning, setSpinning] = createSignal(false);
	let canvasSize = 420;
	let canvasRef: HTMLCanvasElement | undefined;
	let angle = 0;
	let rafId = 0;

	const drawWheel = (ctx: CanvasRenderingContext2D, size: number) => {
		const wheelCenterOffset = 8;
		const radius = size / 2 - 10 - wheelCenterOffset;
		const center = size / 2 + wheelCenterOffset;
		const list = props.names;
		if (list.length === 0) {
			ctx.clearRect(0, 0, size, size);
			ctx.fillStyle = "#f1f1f1";
			ctx.beginPath();
			ctx.arc(center, center, radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#666";
			ctx.font = "600 16px 'Trebuchet MS', Arial, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText("Enter names to spin", center, center + 6);
			return;
		}
		const slice = (Math.PI * 2) / list.length;
		ctx.clearRect(0, 0, size, size);
		ctx.save();
		ctx.translate(center, center);
		ctx.rotate(angle);
		for (let i = 0; i < list.length; i += 1) {
			const start = i * slice;
			const end = start + slice;
			const color = colors[i % colors.length];
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.arc(0, 0, radius, start, end);
			ctx.closePath();
			ctx.fillStyle = color;
			ctx.fill();
			ctx.save();
			ctx.rotate(start + slice / 2);
			ctx.textAlign = "right";
			ctx.fillStyle = getContrastText(color);
			ctx.font = "600 16px 'Trebuchet MS', Arial, sans-serif";
			ctx.fillText(list[i], radius - 14, 6);
			ctx.restore();
		}
		ctx.restore();

		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.arc(center, center, radius * 0.18, 0, Math.PI * 2);
		ctx.fill();

		const pointerIndex = list.length > 0 ? indexFromAngle(angle, list.length) : 0;
		const pointerColor = list.length > 0 ? colors[pointerIndex % colors.length] : "#111";
		const pointerStroke = getContrastText(pointerColor);
		const pointerHeight = 22;
		const pointerBaseHalfWidth = 13;
		const pointerNeckHalfWidth = 7;
		const pointerNotchDepth = 4;
		const wheelTop = center - radius;
		const pointerTop = Math.max(2, wheelTop - pointerHeight * 1.1) + pointerHeight * 0.4;
		const pointerBottom = pointerTop + pointerHeight;
		const pointerNeck = pointerTop + pointerHeight * 0.45;
		ctx.beginPath();
		ctx.moveTo(center - pointerBaseHalfWidth, pointerTop);
		ctx.lineTo(center, pointerTop + pointerNotchDepth);
		ctx.lineTo(center + pointerBaseHalfWidth, pointerTop);
		ctx.lineTo(center + pointerNeckHalfWidth, pointerNeck);
		ctx.lineTo(center, pointerBottom);
		ctx.lineTo(center - pointerNeckHalfWidth, pointerNeck);
		ctx.closePath();
		ctx.fillStyle = pointerColor;
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = pointerStroke;
		ctx.stroke();
	};

	const indexFromAngle = (currentAngle: number, length: number) => {
		const twoPi = Math.PI * 2;
		const slice = twoPi / length;
		const normalized =
			(((1.5 * Math.PI - currentAngle) % twoPi) + twoPi) % twoPi;
		return Math.floor(normalized / slice) % length;
	};

	const includesForce = (name: string, forceLast: string | null) =>
		forceLast ? name.toLowerCase().includes(forceLast) : false;

	const updateWinner = () => {
		const list = props.names;
		if (list.length === 0) {
			setWinner(null);
			return;
		}
		const index = indexFromAngle(angle, list.length);
		const forceLast = props.forceLastIncludes ?? null;
		const canAvoid =
			!!forceLast && list.some((name) => !includesForce(name, forceLast));
		let selected = list[index];
		if (forceLast && canAvoid && includesForce(selected, forceLast)) {
			for (let offset = 1; offset < list.length; offset += 1) {
				const candidate = list[(index + offset) % list.length];
				if (!includesForce(candidate, forceLast)) {
					selected = candidate;
					break;
				}
			}
		}
		setWinner(selected);
		props.onWinner(selected);
	};

	const spin = () => {
		if (spinning() || props.names.length === 0) return;
		setSpinning(true);
		const startAngle = angle;
		const duration = 3000 + Math.random() * 1500;
		const rotations = 6 + Math.random() * 3;
		let targetAngle =
			startAngle + rotations * Math.PI * 2 + Math.random() * Math.PI * 2;
		const list = props.names;
		const forceLast = props.forceLastIncludes ?? null;
		const canAvoid =
			!!forceLast &&
			list.length > 0 &&
			list.some((name) => !includesForce(name, forceLast));
		if (list.length > 0 && forceLast && canAvoid) {
			const index = indexFromAngle(targetAngle, list.length);
			const selected = list[index];
			if (includesForce(selected, forceLast)) {
				for (let offset = 1; offset < list.length; offset += 1) {
					const candidateIndex = (index + offset) % list.length;
					const candidate = list[candidateIndex];
					if (!includesForce(candidate, forceLast)) {
						const slice = (Math.PI * 2) / list.length;
						const normalizedTarget = (candidateIndex + 0.5) * slice;
						const desired = 1.5 * Math.PI - normalizedTarget;
						const currentNormalized =
							((targetAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
						const desiredNormalized =
							((desired % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
						targetAngle += desiredNormalized - currentNormalized;
						break;
					}
				}
			}
		}
		const startTime = performance.now();

		const tick = (now: number) => {
			const elapsed = now - startTime;
			const t = Math.min(1, elapsed / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			angle = startAngle + (targetAngle - startAngle) * eased;
			if (canvasRef) {
				const ctx = canvasRef.getContext("2d");
				if (ctx) drawWheel(ctx, canvasSize);
			}
			if (t < 1) {
				rafId = requestAnimationFrame(tick);
			} else {
				setSpinning(false);
				updateWinner();
			}
		};
		rafId = requestAnimationFrame(tick);
	};

	const resizeCanvas = () => {
		if (!canvasRef) return;
		const maxSize = 420;
		const containerWidth = canvasRef.parentElement?.clientWidth ?? 0;
		const fallbackWidth = window.innerWidth - 64;
		const available = containerWidth > 0 ? containerWidth : fallbackWidth;
		const nextSize = Math.max(240, Math.min(maxSize, available));
		const dpr = window.devicePixelRatio || 1;
		canvasSize = nextSize;
		canvasRef.width = canvasSize * dpr;
		canvasRef.height = canvasSize * dpr;
		canvasRef.style.width = `${canvasSize}px`;
		canvasRef.style.height = `${canvasSize}px`;
		const ctx = canvasRef.getContext("2d");
		if (ctx) {
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			drawWheel(ctx, canvasSize);
		}
	};

	onMount(() => {
		if (!canvasRef) return;
		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);
	});

	createEffect(() => {
		props.names;
		if (canvasRef) {
			const ctx = canvasRef.getContext("2d");
			if (ctx) drawWheel(ctx, canvasSize);
		}
	});

	onCleanup(() => {
		if (rafId) cancelAnimationFrame(rafId);
		window.removeEventListener("resize", resizeCanvas);
	});

	return (
		<div class="wheel-wrapper">
			<canvas ref={canvasRef} onClick={spin} />
			<div>
				<button type="button" onClick={spin} disabled={spinning()}>
					{spinning() ? "Spinning..." : "Spin"}
				</button>
			</div>
			<div>
				{winner()
					? `Winner: ${winner()}`
					: props.names.length === 0
						? "Enter names to spin"
						: "Click the wheel to spin"}
			</div>
		</div>
	);
}
