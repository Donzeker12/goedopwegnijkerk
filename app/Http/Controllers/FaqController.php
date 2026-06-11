<?php

namespace App\Http\Controllers;

use App\Support\SiteSettings;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('faq', [
            'siteSettings' => SiteSettings::many([
                'faq-hero',
                'faq-questions',
                'faq-cta',
            ]),
        ]);
    }
}
