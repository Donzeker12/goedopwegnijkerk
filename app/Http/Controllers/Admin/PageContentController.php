<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageContentController extends Controller
{
    public function edit(string $slug): Response
    {
        $page = PageContent::firstOrCreate(
            ['slug' => $slug],
            ['title' => $this->defaultTitle($slug), 'content' => $this->defaultContent($slug)]
        );

        return Inertia::render('admin/pages/edit', [
            'page' => [
                'slug' => $page->slug,
                'title' => $page->title,
                'content' => $page->content ?? '',
            ],
        ]);
    }

    public function update(Request $request, string $slug): RedirectResponse
    {
        $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
        ]);

        PageContent::updateOrCreate(
            ['slug' => $slug],
            [
                'title' => $request->input('title'),
                'content' => $request->input('content'),
            ]
        );

        return back()->with('success', 'Pagina opgeslagen!');
    }

    private function defaultTitle(string $slug): string
    {
        return match ($slug) {
            'over-ons' => 'Over Goed Op Weg Nijkerk',
            default => ucfirst(str_replace('-', ' ', $slug)),
        };
    }

    private function defaultContent(string $slug): string
    {
        return match ($slug) {
            'over-ons' => '<h2>Hallo, ik ben het gezicht achter Goed Op Weg!</h2><p>Sleutelen aan scooters is mijn passie. Wat begon als een hobby — een kapotte scooter opknappen in de garage — is uitgegroeid tot een kleine onderneming in Nijkerk.</p><p>Elke scooter die ik in handen krijg, krijgt de aandacht die hij verdient. Van grondige inspectie tot het vervangen van versleten onderdelen: ik zorg ervoor dat de scooter weer in topconditie is voordat hij een nieuwe eigenaar vindt.</p><p>Ik werk voornamelijk met populaire merken zoals <strong>BTC</strong>, <strong>La Souris</strong> en <strong>Killerbee</strong>, maar ook andere merken zijn welkom in mijn garage.</p><p>Heb je interesse in een van mijn scooters, of wil je er gewoon eens over komen praten? Stuur me een bericht!</p>',
            default => '<p>Voeg hier je tekst toe.</p>',
        };
    }
}
