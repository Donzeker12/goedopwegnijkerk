<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('profile/index', [
            'user' => [
                'name' => $request->user()?->name,
                'email' => $request->user()?->email,
            ],
        ]);
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'current_password.required' => 'Huidig wachtwoord is verplicht.',
            'current_password.current_password' => 'Huidig wachtwoord klopt niet.',
            'password.required' => 'Nieuw wachtwoord is verplicht.',
            'password.confirmed' => 'Wachtwoord bevestiging komt niet overeen.',
            'password.min' => 'Wachtwoord moet minimaal 8 tekens bevatten.',
        ]);

        $request->user()->update([
            'password' => $validated['password'],
        ]);

        return back()->with('success', 'Wachtwoord is succesvol gewijzigd.');
    }
}
