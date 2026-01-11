type WinnerModalProps = {
	winner: string;
	headerColor: string;
	headerTextColor: string;
	onRemove: () => void;
	onClose: () => void;
};

export function WinnerModal(props: WinnerModalProps) {
	return (
		<div class="modal-backdrop" role="presentation">
			<div class="modal" role="dialog" aria-modal="true">
				<div
					class="modal-header"
					style={{
						"background-color": props.headerColor,
						color: props.headerTextColor,
					}}
				>
					<h2>We have a winner!</h2>
				</div>
				<div class="modal-body">
					<p>{props.winner}</p>
				</div>
				<div class="modal-actions">
					<button type="button" onClick={props.onClose}>
						Close
					</button>
					<button
						type="button"
						style={{
							"background-color": props.headerColor,
							color: props.headerTextColor,
						}}
						onClick={props.onRemove}
					>
						Remove
					</button>
				</div>
			</div>
		</div>
	);
}
