<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\Scooter;
use App\Support\WebPushNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    private function greetingByTime(): string
    {
        $hour = (int) now()->format('H');

        if ($hour >= 6 && $hour < 12) {
            return 'Goedemorgen';
        }

        if ($hour >= 12 && $hour < 18) {
            return 'Goedemiddag';
        }

        return 'Goedeavond';
    }

    private function welcomeMessage(string $name): string
    {
        $greeting = $this->greetingByTime();

        return sprintf(
            "%s %s! Welkom bij Goed Op Weg Nijkerk. Dankjewel voor je chatbericht. We reageren zo snel mogelijk. Laat gerust alvast weten waarmee we je kunnen helpen. Krijg je een bevestigingsmail niet direct binnen? Check dan ook even je map Ongewenst/Spam.",
            $greeting,
            trim($name)
        );
    }

    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'bron' => ['nullable', 'string', 'max:120'],
            'scooter_id' => ['nullable', 'integer', 'exists:scooters,id'],
        ]);

        $selectedScooterId = isset($validated['scooter_id']) ? (int) $validated['scooter_id'] : null;

        $scooters = Scooter::with(['brand', 'scooterModel'])
            ->where('ready_for_sale', true)
            ->where('status', 'te_koop')
            ->latest()
            ->take(80)
            ->get()
            ->map(fn (Scooter $scooter) => [
                'id' => $scooter->id,
                'naam' => $scooter->display_name,
            ])
            ->values();

        return Inertia::render('chat/index', [
            'source' => (string) ($validated['bron'] ?? 'website'),
            'selected_scooter_id' => $selectedScooterId,
            'scooters' => $scooters,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:50'],
            'preferred_channel' => ['nullable', 'in:whatsapp,email,telefoon'],
            'best_time' => ['nullable', 'string', 'max:120'],
            'message' => ['nullable', 'string', 'max:1000'],
            'source' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'string', 'max:500'],
            'scooter_id' => ['nullable', 'integer', 'exists:scooters,id'],
        ]);

        $adminEmail = (string) (config('seo.business.email') ?: config('mail.from.address'));
        $appName = (string) config('app.name', 'Goed Op Weg Nijkerk');
        $source = $validated['source'] ?? 'website';

        $session = ChatSession::create([
            'token' => Str::random(40),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'preferred_channel' => $validated['preferred_channel'] ?? 'whatsapp',
            'best_time' => $validated['best_time'] ?? null,
            'source' => $source,
            'page' => $validated['page'] ?? URL::current(),
            'scooter_id' => $validated['scooter_id'] ?? null,
            'status' => 'nieuw',
            'last_message_at' => now(),
        ]);

        $selectedScooter = null;
        if (!empty($validated['scooter_id'])) {
            $selectedScooter = Scooter::with(['brand', 'scooterModel'])->find($validated['scooter_id']);
        }

        $session->messages()->create([
            'sender_type' => 'admin',
            'sender_name' => 'Goed Op Weg Nijkerk',
            'message' => $this->welcomeMessage($validated['name']),
        ]);

        if (!empty($validated['message'])) {
            $session->messages()->create([
                'sender_type' => 'visitor',
                'sender_name' => $validated['name'],
                'message' => trim((string) $validated['message']),
            ]);
        }

        $adminLink = url('/admin/chat/' . $session->id);
        $visitorLink = url('/chat/' . $session->token);

        $bodyLines = [
            'Nieuw chatverzoek via website',
            '',
            'Sessie ID: ' . $session->id,
            'Naam: ' . $validated['name'],
            'E-mail: ' . $validated['email'],
            'Telefoon: ' . ($validated['phone'] ?? '-'),
            'Kanaal: Website chat',
            'Beste tijdstip: ' . ($validated['best_time'] ?? '-'),
            'Scooter: ' . ($selectedScooter?->display_name ?? 'Algemene vraag'),
            'Bron: ' . $source,
            'Pagina: ' . ($validated['page'] ?? URL::current()),
            'Bericht: ' . ($validated['message'] ?? '-'),
            '',
            'Open admin chat: ' . $adminLink,
            'Publieke chatlink klant: ' . $visitorLink,
            '',
            'Tip: reageer in de admin chat om het gesprek direct te starten.',
        ];

        Mail::raw(implode("\n", $bodyLines), function ($mail) use ($adminEmail, $validated, $appName) {
            $mail->to($adminEmail)
                ->replyTo($validated['email'], $validated['name'])
            ->subject('Chat begonnen door ' . $validated['name'] . ' - ' . $appName);
        });

        WebPushNotifier::broadcastToAdmins([
            'title' => 'Nieuwe chat gestart',
            'body' => $validated['name'] . ' heeft een chat gestart' . ($selectedScooter?->display_name ? ' over ' . $selectedScooter->display_name : '.') ,
            'url' => '/admin/chat/' . $session->id,
            'tag' => 'new-chat-' . $session->id,
            'debounce_key' => 'new-chat',
            'cooldown_seconds' => (int) config('push.cooldowns.new_chat', 30),
        ]);

        return redirect('/chat/' . $session->token)->with('success', 'Top! Je chatverzoek is verzonden. Je kunt hieronder direct verder chatten.');
    }

    public function room(string $token): Response
    {
        ChatSession::autoCloseInactive();

        $session = ChatSession::query()->where('token', $token)->firstOrFail();
        $session->load(['messages', 'scooter.brand', 'scooter.scooterModel']);

        return Inertia::render('chat/room', [
            'session' => [
                'token' => $session->token,
                'name' => $session->name,
                'status' => $session->status,
                'scooter' => $session->scooter?->display_name,
                'created_at' => $session->created_at?->toDateTimeString(),
            ],
            'messages' => $session->messages->map(fn ($message) => [
                'id' => $message->id,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->sender_name,
                'message' => $message->message,
                'created_at' => $message->created_at?->toDateTimeString(),
            ]),
        ]);
    }

    public function storeRoomMessage(Request $request, string $token): RedirectResponse
    {
        ChatSession::autoCloseInactive();

        $session = ChatSession::query()->where('token', $token)->firstOrFail();

        if ($session->status === 'gesloten') {
            return back()->with('error', 'Deze chat is gesloten. Start een nieuwe chataanvraag.');
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $session->messages()->create([
            'sender_type' => 'visitor',
            'sender_name' => $session->name,
            'message' => trim($validated['message']),
        ]);

        if ($session->status === 'nieuw') {
            $session->status = 'open';
        }

        $session->last_message_at = now();
        $session->save();

        WebPushNotifier::broadcastToAdmins([
            'title' => 'Nieuw klantbericht in chat',
            'body' => $session->name . ' heeft een nieuw bericht gestuurd.',
            'url' => '/admin/chat/' . $session->id,
            'tag' => 'chat-reply-' . $session->id,
            'debounce_key' => 'chat-reply',
            'cooldown_seconds' => (int) config('push.cooldowns.chat_reply', 20),
        ]);

        return back();
    }
}
