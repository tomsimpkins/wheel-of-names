import { createMemo, createSignal } from "solid-js";
import "./App.css";
import { NamesPanel } from "./components/NamesPanel";
import { WheelCanvas } from "./components/WheelCanvas";
import { WinnerModal } from "./components/WinnerModal";
import { getContrastText, wheelColors } from "./utils/colors";

function App() {
	const [namesText, setNamesText] = createSignal(
		"Ada\nLinus\nGrace\nKen\nMargaret\nDonald\nBarbara\nAlan",
	);
	const [modalWinner, setModalWinner] = createSignal<string | null>(null);
	const [tab, setTab] = createSignal<"entries" | "results">("entries");
	const [results, setResults] = createSignal<string[]>([]);
	const forceLastRaw = new URLSearchParams(window.location.search).get("last");
	const forceLastIncludes = forceLastRaw?.trim()
		? forceLastRaw.trim().toLowerCase()
		: null;
	const names = createMemo(() =>
		namesText()
			.split("\n")
			.map((name) => name.trim())
			.filter((name) => name.length > 0),
	);
	const winnerColor = createMemo(() => {
		const winner = modalWinner();
		if (!winner) return null;
		const index = names().indexOf(winner);
		if (index === -1) return null;
		return wheelColors[index % wheelColors.length];
	});
	const winnerTextColor = createMemo(() => {
		const color = winnerColor();
		return color ? getContrastText(color) : "#fff";
	});

	return (
		<div class="layout">
			<div />
			<div class="column-center">
				<WheelCanvas
					names={names()}
					onWinner={(name) => {
						setModalWinner(name);
						setResults((current) => [name, ...current]);
					}}
					forceLastIncludes={forceLastIncludes}
				/>
			</div>
			<NamesPanel
				activeTab={tab()}
				namesText={namesText()}
				results={results()}
				onTabChange={setTab}
				onNamesTextChange={setNamesText}
				onSortNames={() => {
					const sorted = [...names()].sort((a, b) => a.localeCompare(b));
					setNamesText(sorted.join("\n"));
				}}
				onClearNames={() => setNamesText("")}
			/>
			{modalWinner() && (
				<WinnerModal
					winner={modalWinner()}
					headerColor={winnerColor() ?? "#111"}
					headerTextColor={winnerTextColor()}
					onRemove={() => {
						const winner = modalWinner();
						if (!winner) return;
						const updated = names()
							.filter((name) => name !== winner)
							.join("\n");
						setNamesText(updated);
						setModalWinner(null);
					}}
					onClose={() => setModalWinner(null)}
				/>
			)}
		</div>
	);
}

export default App;
