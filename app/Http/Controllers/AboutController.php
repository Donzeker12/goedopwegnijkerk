<?php

namespace App\Http\Controllers;

use App\Models\PageContent;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function index(): Response
    {
        $page = PageContent::forSlug('over-ons');

        return Inertia::render('about', [
            'content' => $page?->content ?? '',
            'title' => $page?->title ?? 'Over Goed Op Weg Nijkerk',
        ]);
    }
}
