'use client';

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

export default function ProgressBar({ step, totalSteps }: ProgressBarProps) {
	const pct = Math.round((step / totalSteps) * 100);
	return (
		<div className="progress-track">
			<div className="progress-fill" style={{ width: `${pct}%` }} />
		</div>
	);
}
