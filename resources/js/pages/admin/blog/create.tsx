import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent, useMemo, useState } from 'react';
import TipTapEditor from '../../../components/TipTapEditor';
import AdminLayout from '../../../layouts/AdminLayout';

type QuickBlogInput = {
    scooter_model: string;
    mileage: string;
    complaint: string;
    diagnosis: string;
    work_done: string;
    replaced_parts: string;
    turnaround: string;
    result: string;
    call_to_action: string;
};

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function splitToList(value: string): string[] {
    return value
        .split(/\n|,|;/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function stripHtml(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|h1|h2|h3|li|ul|ol|blockquote)>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getContentMetrics(html: string): { words: number; readingMinutes: number } {
    const text = stripHtml(html);
    if (!text) {
        return { words: 0, readingMinutes: 1 };
    }

    const words = text.split(/\s+/).filter(Boolean).length;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, readingMinutes };
}

function getWordTargetStatus(words: number): { label: string; chipClass: string; textClass: string; guidance: string } {
    if (words <= 0) {
        return {
            label: 'Nog leeg',
            chipClass: 'bg-gray-100 text-gray-700',
            textClass: 'text-gray-500',
            guidance: 'Begin met schrijven. Richting 250-500 woorden is meestal prettig voor een snelle, sterke blog.',
        };
    }

    if (words < 180) {
        return {
            label: 'Te kort',
            chipClass: 'bg-red-100 text-red-700',
            textClass: 'text-red-700',
            guidance: 'Waarschijnlijk te kort. Voeg meer context toe zodat het verhaal vollediger voelt.',
        };
    }

    if (words < 250) {
        return {
            label: 'Net kort',
            chipClass: 'bg-amber-100 text-amber-800',
            textClass: 'text-amber-700',
            guidance: 'Bijna goed. Voeg nog 1 korte alinea toe om op ideale lengte te komen.',
        };
    }

    if (words <= 500) {
        return {
            label: 'Goede lengte',
            chipClass: 'bg-emerald-100 text-emerald-800',
            textClass: 'text-emerald-700',
            guidance: 'Toplengte voor online lezen. Dit zit in de aanbevolen zone.',
        };
    }

    if (words <= 700) {
        return {
            label: 'Aan de lange kant',
            chipClass: 'bg-amber-100 text-amber-800',
            textClass: 'text-amber-700',
            guidance: 'Iets lang. Overweeg inkorten van herhalingen of lange zinnen.',
        };
    }

    return {
        label: 'Waarschijnlijk te lang',
        chipClass: 'bg-red-100 text-red-700',
        textClass: 'text-red-700',
        guidance: 'Voor web vaak te lang. Gebruik "Maak alinea korter" om kernachtiger te maken.',
    };
}

function buildWritingSuggestions(html: string): string[] {
    const text = stripHtml(html);
    const suggestions: string[] = [];

    if (text.length < 120) {
        suggestions.push('Tekst is nog erg kort. Voeg minimaal 3-4 zinnen toe voor een prettige blogflow.');
    }

    if (/\s{2,}/.test(text)) {
        suggestions.push('Er staan dubbele spaties in de tekst.');
    }

    const repeatedWordMatch = text.match(/\b([a-zA-ZÀ-ÿ]+)\s+\1\b/i);
    if (repeatedWordMatch) {
        suggestions.push(`Mogelijk dubbel woord gevonden: "${repeatedWordMatch[0]}".`);
    }

    const sentences = text
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

    const longSentence = sentences.find((sentence) => sentence.split(/\s+/).length > 26);
    if (longSentence) {
        suggestions.push(`Lange zin gevonden. Maak deze korter voor betere leesbaarheid: "${longSentence.slice(0, 100)}..."`);
    }

    const noPunctuation = sentences.find((sentence) => !/[.!?]$/.test(sentence));
    if (noPunctuation) {
        suggestions.push(`Controleer leestekens aan het eind van zinnen, bijvoorbeeld: "${noPunctuation.slice(0, 80)}".`);
    }

    return suggestions;
}

function extractFirstParagraphText(html: string): string {
    const firstParagraph = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (firstParagraph?.[1]) {
        return stripHtml(firstParagraph[1]);
    }

    return stripHtml(html).split(/(?<=[.!?])\s+/).find(Boolean) ?? '';
}

function firstWords(text: string, count: number): string {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.slice(0, count).join(' ');
}

function buildParagraphRewriteSuggestions(paragraph: string, mode: 'smooth' | 'short' | 'warm'): string[] {
    const base = paragraph.trim();
    if (base.length < 20) {
        return [];
    }

    if (mode === 'short') {
        const compact = firstWords(base, 14);
        return [
            `${compact}${compact.endsWith('.') ? '' : '.'}`,
            `Kort gezegd: ${compact.toLowerCase()}${compact.endsWith('.') ? '' : '.'}`,
            `In het kort: ${compact.toLowerCase()}${compact.endsWith('.') ? '' : '.'}`,
        ];
    }

    if (mode === 'warm') {
        return [
            `Eerlijk is eerlijk, dit voelde voor mij best spannend: ${base}`,
            `Ik merkte meteen dat er iemand echt naar mij luisterde: ${base}`,
            `Voor mij betekende dit meer dan alleen techniek: ${base}`,
        ];
    }

    return [
        `Ik zal eerlijk zijn: ${base}`,
        `Zo begon mijn verhaal die dag: ${base}`,
        `Dit voelde ik op dat moment: ${base}`,
    ];
}

function replaceFirstParagraph(html: string, nextParagraphText: string): string {
    const nextParagraph = `<p>${escapeHtml(nextParagraphText)}</p>`;

    if (/<p[^>]*>[\s\S]*?<\/p>/i.test(html)) {
        return html.replace(/<p[^>]*>[\s\S]*?<\/p>/i, nextParagraph);
    }

    return `${nextParagraph}${html}`;
}

export default function BlogCreate({ mode = 'quick' }: { mode?: 'quick' | 'normal' }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        excerpt: '',
        content: '<p></p>',
        is_published: false,
    });

    const [quickInput, setQuickInput] = useState<QuickBlogInput>({
        scooter_model: '',
        mileage: '',
        complaint: '',
        diagnosis: '',
        work_done: '',
        replaced_parts: '',
        turnaround: '',
        result: '',
        call_to_action: 'Gun jouw scooter ook zo\'n tweede kans. Dan krijgt hij net als ik weer een frisse start.',
    });
    const [writingSuggestions, setWritingSuggestions] = useState<string[]>([]);
    const [rewriteSuggestions, setRewriteSuggestions] = useState<string[]>([]);
    const [rewriteModeLabel, setRewriteModeLabel] = useState('vloeiender');
    const contentMetrics = useMemo(() => getContentMetrics(data.content), [data.content]);
    const wordTargetStatus = useMemo(() => getWordTargetStatus(contentMetrics.words), [contentMetrics.words]);

    function setQuickField<K extends keyof QuickBlogInput>(field: K, value: QuickBlogInput[K]) {
        setQuickInput((prev) => ({ ...prev, [field]: value }));
    }

    function generateDraftFromQuickInput(mode: 'short' | 'long' = 'long') {
        const model = quickInput.scooter_model.trim();
        const complaint = quickInput.complaint.trim();

        if (!model || !complaint) {
            return;
        }

        const title = mode === 'short'
            ? `${model} vertelt: mijn tweede kans in het kort`
            : `Ik ben ${model} en dit is mijn tweede kans`;
        const excerpt = mode === 'short'
            ? `Ik ben ${model} en ik kwam binnen met ${complaint.toLowerCase()}. Kort verhaal, groot verschil.`
            : `Ik ben ${model} en ik kwam binnen met ${complaint.toLowerCase()}. Dit is mijn verhaal van twijfel naar vertrouwen.`;

        const workItems = splitToList(quickInput.work_done).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
        const partItems = splitToList(quickInput.replaced_parts).map((item) => `<li>${escapeHtml(item)}</li>`).join('');

        const longContent = [
            `<h2>Ik kwam binnen met een verhaal</h2>`,
            `<p>Ik ben ${escapeHtml(model)}. Mijn vorige tijd was niet altijd makkelijk, en op een gegeven moment liep ik vast met: <strong>${escapeHtml(complaint)}</strong>.</p>`,
            quickInput.mileage.trim() !== '' ? `<p>Toen ik binnenreed stond mijn teller op <strong>${escapeHtml(quickInput.mileage)}</strong>, met alles wat ik onderweg had meegemaakt.</p>` : '',
            `<h2>De eerste blik in de werkplaats</h2>`,
            `<p>${escapeHtml(quickInput.diagnosis || 'In de werkplaats werd ik rustig bekeken, getest en stap voor stap nagegaan om te snappen wat ik nodig had.')}</p>`,
            `<h2>Wat ik heb meegemaakt op de brug</h2>`,
            workItems !== '' ? `<p>Dit waren de momenten die voor mij het verschil maakten:</p><ul>${workItems}</ul>` : `<p>Ik kreeg de aandacht die ik lang had gemist: zorgvuldig nagekeken, afgesteld en aangepakt waar dat nodig was.</p>`,
            `<h2>Wat ik nieuw heb gekregen</h2>`,
            partItems !== '' ? `<p>Onderweg naar herstel kreeg ik dit mee:</p><ul>${partItems}</ul>` : `<p>Waar nodig kreeg ik nieuwe onderdelen om weer zeker en soepel te kunnen rijden.</p>`,
            `<h2>Mijn tweede kans</h2>`,
            `<p>${escapeHtml(quickInput.result || 'Ik voel me weer sterk, rustig en klaar voor nieuwe kilometers.')}</p>`,
            quickInput.turnaround.trim() !== '' ? `<p>Van binnenkomst tot frisse start duurde het voor mij <strong>${escapeHtml(quickInput.turnaround)}</strong>.</p>` : '',
            `<h2>Van mij aan jou</h2>`,
            `<p>${escapeHtml(quickInput.call_to_action)}</p>`,
        ].filter(Boolean).join('');

        const shortContent = [
            `<h2>Mijn korte verhaal</h2>`,
            `<p>Ik ben ${escapeHtml(model)} en ik kwam binnen met <strong>${escapeHtml(complaint)}</strong>.</p>`,
            `<p>${escapeHtml(quickInput.diagnosis || 'Ze keken me rustig na en vonden snel wat ik nodig had om weer goed te rijden.')}</p>`,
            quickInput.work_done.trim() !== ''
                ? `<p><strong>Wat ze bij mij deden:</strong> ${escapeHtml(splitToList(quickInput.work_done).join(', '))}.</p>`
                : '',
            quickInput.result.trim() !== ''
                ? `<p><strong>Resultaat:</strong> ${escapeHtml(quickInput.result)}</p>`
                : `<p><strong>Resultaat:</strong> ik rijd weer soepel en met vertrouwen.</p>`,
            `<p>${escapeHtml(quickInput.call_to_action)}</p>`,
        ].filter(Boolean).join('');

        setData('title', title);
        setData('excerpt', excerpt);
        setData('content', mode === 'short' ? shortContent : longContent);
    }

    function resetQuickInput() {
        setQuickInput({
            scooter_model: '',
            mileage: '',
            complaint: '',
            diagnosis: '',
            work_done: '',
            replaced_parts: '',
            turnaround: '',
            result: '',
            call_to_action: 'Gun jouw scooter ook zo\'n tweede kans. Dan krijgt hij net als ik weer een frisse start.',
        });
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/admin/blog');
    }

    function runTextCheck() {
        setWritingSuggestions(buildWritingSuggestions(data.content));
    }

    function runRewriteCheck(mode: 'smooth' | 'short' | 'warm') {
        const paragraph = extractFirstParagraphText(data.content);
        setRewriteSuggestions(buildParagraphRewriteSuggestions(paragraph, mode));
        setRewriteModeLabel(mode === 'short' ? 'korter' : mode === 'warm' ? 'warmer' : 'vloeiender');
    }

    function applyRewriteSuggestion(suggestion: string) {
        setData('content', replaceFirstParagraph(data.content, suggestion));
    }

    return (
        <AdminLayout title="Blog toevoegen">
            <Head title="Blog toevoegen" />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <form onSubmit={submit} className="xl:col-span-2 space-y-5">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-orange-100">
                        <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Stap 1</div>
                        <h2 className="text-lg font-bold text-gray-900">Kies je blogtype</h2>
                        <p className="text-sm text-gray-500 mt-1">Kies eerst Snelle blog of Normale blog. Daarna werk je direct in die stijl verder.</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                href="/admin/blog/nieuw?mode=quick"
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                                    mode === 'quick'
                                        ? 'bg-orange-500 text-white'
                                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Snelle blog
                            </Link>
                            <Link
                                href="/admin/blog/nieuw?mode=normal"
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                                    mode === 'normal'
                                        ? 'bg-gray-900 text-white'
                                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Normale blog
                            </Link>
                        </div>
                    </div>

                    {mode === 'quick' && <div className="bg-white rounded-2xl shadow-sm p-6 border border-blue-100 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Snelle blog invoer</div>
                                <h2 className="text-lg font-bold text-gray-900">In 2 minuten een concept</h2>
                                <p className="text-sm text-gray-500 mt-1">Vul korte punten in. De titel, intro en volledige blogtekst worden automatisch gegenereerd als een echt ik-verhaal van de brommer.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input value={quickInput.scooter_model} onChange={(e) => setQuickField('scooter_model', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" placeholder="Scootermodel (bijv. Piaggio Zip)" />
                            <input value={quickInput.mileage} onChange={(e) => setQuickField('mileage', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" placeholder="Km-stand bij binnenkomst" />
                            <input value={quickInput.complaint} onChange={(e) => setQuickField('complaint', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm md:col-span-2" placeholder="Klantklacht / probleem" />
                            <textarea value={quickInput.diagnosis} onChange={(e) => setQuickField('diagnosis', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm md:col-span-2" placeholder="Wat zagen ze als eerste bij mij" />
                            <textarea value={quickInput.work_done} onChange={(e) => setQuickField('work_done', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" placeholder="Belangrijke momenten in de werkplaats (1 per regel of komma)" />
                            <textarea value={quickInput.replaced_parts} onChange={(e) => setQuickField('replaced_parts', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" placeholder="Wat kreeg ik nieuw (1 per regel of komma)" />
                            <input value={quickInput.turnaround} onChange={(e) => setQuickField('turnaround', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" placeholder="Doorlooptijd (bijv. 2 werkdagen)" />
                            <input value={quickInput.result} onChange={(e) => setQuickField('result', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" placeholder="Hoe ik nu rijd / voel in 1 zin" />
                            <textarea value={quickInput.call_to_action} onChange={(e) => setQuickField('call_to_action', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm md:col-span-2" placeholder="Mijn afsluitende boodschap aan andere rijders" />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => generateDraftFromQuickInput('short')}
                                disabled={!quickInput.scooter_model.trim() || !quickInput.complaint.trim()}
                                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                            >
                                Kort verhaal
                            </button>
                            <button
                                type="button"
                                onClick={() => generateDraftFromQuickInput('long')}
                                disabled={!quickInput.scooter_model.trim() || !quickInput.complaint.trim()}
                                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Uitgebreid verhaal
                            </button>
                            <button
                                type="button"
                                onClick={resetQuickInput}
                                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Velden legen
                            </button>
                        </div>
                    </div>}

                    {mode === 'normal' && <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Titel *</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Bijv. 5 onderhoudstips voor je scooter"
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Korte intro</label>
                        <textarea
                            value={data.excerpt}
                            onChange={(e) => setData('excerpt', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Korte samenvatting voor de blog-overzichtspagina"
                        />
                        {errors.excerpt && <p className="mt-1 text-xs text-red-600">{errors.excerpt}</p>}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={data.is_published}
                            onChange={(e) => setData('is_published', e.target.checked)}
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        Direct publiceren
                    </label>
                </div>}

                    {mode === 'quick' && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.is_published}
                                    onChange={(e) => setData('is_published', e.target.checked)}
                                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                />
                                Direct publiceren
                            </label>
                            <p className="mt-2 text-xs text-gray-500">Titel en intro worden bij Snelle blog automatisch gegenereerd.</p>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Bloginhoud *</label>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={runTextCheck}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Controleer tekst
                            </button>
                            <button
                                type="button"
                                onClick={() => runRewriteCheck('smooth')}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Herschrijf alinea vloeiender
                            </button>
                            <button
                                type="button"
                                onClick={() => runRewriteCheck('short')}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Maak alinea korter
                            </button>
                            <button
                                type="button"
                                onClick={() => runRewriteCheck('warm')}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Maak alinea warmer
                            </button>
                            <span className="text-xs text-gray-500">Spellingscontrole staat aan in de editor (Nederlandse taal).</span>
                        </div>
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            <span className="rounded-full bg-gray-100 px-2 py-1 font-medium">Woorden: {contentMetrics.words}</span>
                            <span className="rounded-full bg-gray-100 px-2 py-1 font-medium">Leestijd: ± {contentMetrics.readingMinutes} min</span>
                            <span className={`rounded-full px-2 py-1 font-semibold ${wordTargetStatus.chipClass}`}>Doelstatus: {wordTargetStatus.label}</span>
                        </div>
                        <p className={`mb-3 text-xs ${wordTargetStatus.textClass}`}>{wordTargetStatus.guidance}</p>
                        {writingSuggestions.length > 0 && (
                            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                                <div className="font-semibold mb-1">Tekstcheck suggesties</div>
                                <ul className="list-disc pl-4 space-y-1">
                                    {writingSuggestions.map((suggestion, idx) => (
                                        <li key={idx}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {rewriteSuggestions.length > 0 && (
                            <div className="mb-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
                                <div className="font-semibold mb-1">Herschrijf suggesties ({rewriteModeLabel}) voor openingsalinea</div>
                                <div className="space-y-2">
                                    {rewriteSuggestions.map((suggestion, idx) => (
                                        <div key={idx} className="rounded border border-sky-100 bg-white px-2 py-2">
                                            <p className="text-xs text-sky-900">{suggestion}</p>
                                            <button
                                                type="button"
                                                onClick={() => applyRewriteSuggestion(suggestion)}
                                                className="mt-2 rounded-md border border-sky-300 bg-sky-100 px-2 py-1 text-[11px] font-semibold text-sky-800 hover:bg-sky-200"
                                            >
                                                Gebruik als openingsalinea
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <style>{`
                            .tiptap-content .prose h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827; }
                            .tiptap-content .prose h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 0.5rem; color: #111827; }
                            .tiptap-content .prose h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.4rem; color: #111827; }
                            .tiptap-content .prose p { margin-bottom: 0.75rem; color: #374151; line-height: 1.75; }
                            .tiptap-content .prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                            .tiptap-content .prose ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                            .tiptap-content .prose li { margin-bottom: 0.25rem; color: #374151; }
                            .tiptap-content .prose blockquote { border-left: 3px solid #f97316; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 1rem 0; }
                            .tiptap-content .prose hr { border-color: #e5e7eb; margin: 1.5rem 0; }
                        `}</style>
                        <div className="tiptap-content">
                            <TipTapEditor
                                value={data.content}
                                onChange={(html) => setData('content', html)}
                                placeholder="Schrijf hier je blogtekst..."
                                spellCheck
                                language="nl"
                                imageUploadUrl="/admin/blog/editor/afbeelding"
                            />
                        </div>
                        {errors.content && <p className="mt-2 text-xs text-red-600">{errors.content}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                        >
                            {processing ? 'Opslaan...' : 'Blog opslaan en verder naar foto\'s'}
                        </button>
                    </div>
                </form>

                <aside className="bg-white rounded-2xl shadow-sm p-6 xl:sticky xl:top-24">
                    <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Stap 2</div>
                    <h2 className="text-lg font-bold text-gray-900">Foto's uploaden</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Na opslaan kom je op de bewerkpagina waar de foto-upload direct naast de editor staat.
                    </p>

                    <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Wat je daarna kunt doen</div>
                        <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                            <li>Meerdere foto's tegelijk uploaden</li>
                            <li>Een coverfoto selecteren</li>
                            <li>Foto's verwijderen en opnieuw kiezen</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </AdminLayout>
    );
}
