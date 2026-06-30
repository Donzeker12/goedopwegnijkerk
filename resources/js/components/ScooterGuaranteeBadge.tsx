interface Props {
    variant?: 'compact' | 'block';
    className?: string;
}

export default function ScooterGuaranteeBadge({ variant = 'compact', className = '' }: Props) {
    if (variant === 'block') {
        return (
            <div className={`rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ${className}`.trim()}>
                <span className="mr-2">✅</span>
                Inclusief Garantie &amp; Service
            </div>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ${className}`.trim()}>
            <span>✅</span>
            Inclusief Garantie &amp; Service
        </span>
    );
}
