type NamesPanelProps = {
	activeTab: "entries" | "results";
	namesText: string;
	results: string[];
	onTabChange: (tab: "entries" | "results") => void;
	onNamesTextChange: (value: string) => void;
	onSortNames: () => void;
	onShuffleNames: () => void;
};

export function NamesPanel(props: NamesPanelProps) {
	return (
		<div class="column-right">
			<div class="tabs">
				<button
					type="button"
					class={props.activeTab === "entries" ? "active" : ""}
					onClick={() => props.onTabChange("entries")}
				>
					Entries
				</button>
				<button
					type="button"
					class={props.activeTab === "results" ? "active" : ""}
					onClick={() => props.onTabChange("results")}
				>
					Results
				</button>
			</div>
			{props.activeTab === "entries" ? (
				<div class="panel">
					<div class="panel-actions">
						<button type="button" onClick={props.onShuffleNames}>
							Shuffle
						</button>
						<button type="button" onClick={props.onSortNames}>
							Sort names
						</button>
					</div>
					<textarea
						id="names"
						value={props.namesText}
						onInput={(event) =>
							props.onNamesTextChange(event.currentTarget.value)
						}
						rows={16}
					/>
				</div>
			) : (
				<div class="panel results">
					{props.results.length === 0 ? (
						<p>No results yet.</p>
					) : (
						<ul>
							{props.results.map((name) => (
								<li>{name}</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
