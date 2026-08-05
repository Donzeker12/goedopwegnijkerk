<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="description" content="Alles voor tweewielers in Nijkerk: verkoop, reparatie, onderhoud en service voor fietsen, e-bikes en scooters.">
        <meta property="og:title" content="Alles voor tweewielers | Goed Op Weg Nijkerk">
        <meta property="og:site_name" content="Goed Op Weg Nijkerk">
        <meta property="og:description" content="Alles voor tweewielers in Nijkerk: verkoop, reparatie, onderhoud en service voor fietsen, e-bikes en scooters.">
        <meta name="theme-color" content="#111827">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="Goed Op Weg Admin">

        <link rel="icon" href="/apple-touch-icon.png" type="image/png" sizes="180x180">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="manifest" href="/manifest.webmanifest">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>Alles voor tweewielers | Goed Op Weg Nijkerk</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
