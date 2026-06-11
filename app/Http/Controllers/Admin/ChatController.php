<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    private function defaultVisitLocation(): string
    {
        $street = trim((string) config('seo.business.street', ''));
        $postalCode = trim((string) config('seo.business.postal_code', ''));
        $city = trim((string) config('seo.business.city', 'Nijkerk'));

        $address = trim(implode(' ', array_filter([$street, $postalCode, $city])));

        return $address !== '' ? $address : 'Onze winkel in Nijkerk';
    }

    private function formatSource(?string $source): string
    {
        if (!$source) {
            return '-';
        }

        return match ($source) {
            'floating-home' => 'Chatknop Home',
            'floating-scooters' => 'Chatknop Scooters overzicht',
            'floating-scooter' => 'Chatknop Scooter detail',
            'floating-faq' => 'Chatknop FAQ',
            'floating-over-ons' => 'Chatknop Over ons',
            'floating-blog' => 'Chatknop Blog',
            default => str_replace('-', ' ', $source),
        };
    }

    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'status' => ['nullable', 'in:nieuw,open,gesloten,alle'],
        ]);

        $selectedStatus = (string) ($validated['status'] ?? 'alle');

        $autoClosedCount = ChatSession::autoCloseInactive();

        $sessions = ChatSession::query()
            ->with(['scooter.brand', 'scooter.scooterModel'])
            ->withCount('messages')
            ->when($selectedStatus !== 'alle', fn ($query) => $query->where('status', $selectedStatus))
            ->latest('last_message_at')
            ->latest('created_at')
            ->get()
            ->map(fn (ChatSession $session) => [
                'id' => $session->id,
                'name' => $session->name,
                'email' => $session->email,
                'status' => $session->status,
                'source' => $this->formatSource($session->source),
                'scooter' => $session->scooter?->display_name,
                'messages_count' => $session->messages_count,
                'last_message_at' => $session->last_message_at?->toDateTimeString(),
                'created_at' => $session->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('admin/chat/index', [
            'sessions' => $sessions,
            'filters' => [
                'status' => $selectedStatus,
            ],
            'auto_closed_count' => $autoClosedCount,
        ]);
    }

    public function show(ChatSession $session): Response
    {
        $session->load(['messages', 'scooter.brand', 'scooter.scooterModel']);

        return Inertia::render('admin/chat/show', [
            'session' => [
                'id' => $session->id,
                'name' => $session->name,
                'email' => $session->email,
                'phone' => $session->phone,
                'best_time' => $session->best_time,
                'status' => $session->status,
                'source' => $this->formatSource($session->source),
                'scooter' => $session->scooter?->display_name,
                'scooter_id' => $session->scooter_id,
                'page' => $session->page,
                'token' => $session->token,
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

    public function storeMessage(Request $request, ChatSession $session): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $adminName = (string) optional($request->user())->name;

        $session->messages()->create([
            'sender_type' => 'admin',
            'sender_name' => $adminName !== '' ? $adminName : 'Admin',
            'message' => trim($validated['message']),
        ]);

        if ($session->status === 'nieuw') {
            $session->status = 'open';
        }

        $session->last_message_at = now();
        $session->save();

        return back()->with('success', 'Bericht verzonden naar bezoeker.');
    }

    public function updateStatus(Request $request, ChatSession $session): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:nieuw,open,gesloten'],
        ]);

        $session->status = $validated['status'];

        if ($validated['status'] === 'gesloten') {
            $session->closed_at = now();
        } else {
            $session->closed_at = null;
        }

        $session->save();

        return back()->with('success', 'Chatstatus bijgewerkt.');
    }

    public function sendAppointmentConfirmation(Request $request, ChatSession $session): RedirectResponse
    {
        $validated = $request->validate([
            'appointment_at' => ['required', 'date', 'after:now'],
            'location' => ['nullable', 'string', 'max:190'],
            'note' => ['nullable', 'string', 'max:700'],
        ]);

        $appointmentAt = Carbon::parse($validated['appointment_at'])
            ->timezone(config('app.timezone', 'Europe/Amsterdam'))
            ->locale('nl');
        $location = trim((string) ($validated['location'] ?? ''));
        $note = trim((string) ($validated['note'] ?? ''));
        $resolvedLocation = $location !== '' ? $location : $this->defaultVisitLocation();
        $businessName = (string) config('seo.business.name', config('app.name'));
        $adminReplyEmail = (string) (config('seo.business.email') ?: config('mail.from.address'));
        $dateLabel = ucfirst($appointmentAt->translatedFormat('l d F Y'));
        $timeLabel = $appointmentAt->format('H:i') . ' uur';

        Mail::send([
            'html' => 'emails.appointment-confirmation',
            'text' => 'emails.appointment-confirmation-text',
        ], [
            'customerName' => $session->name,
            'businessName' => $businessName,
            'dateLabel' => $dateLabel,
            'timeLabel' => $timeLabel,
            'location' => $resolvedLocation,
            'note' => $note,
            'chatUrl' => url('/chat/' . $session->token),
            'logoUrl' => url('/mail-logo.png?v=20260611-2'),
        ], function ($mail) use ($session, $businessName, $adminReplyEmail, $appointmentAt) {
            $mail->to($session->email, $session->name)
                ->from($adminReplyEmail, $businessName)
                ->replyTo($adminReplyEmail, $businessName)
                ->subject('Afspraakbevestiging - ' . $appointmentAt->format('d-m-Y H:i'));
        });

        $chatConfirmation = [
            'Afspraak bevestigd:',
            '- Datum: ' . $dateLabel,
            '- Tijd: ' . $timeLabel,
            '- Locatie: ' . $resolvedLocation,
            '- Tip: geen mail gezien? Check je map Ongewenst/Spam.',
        ];

        if ($note !== '') {
            $chatConfirmation[] = '- Opmerking: ' . $note;
        }

        $session->messages()->create([
            'sender_type' => 'admin',
            'sender_name' => optional($request->user())->name ?: 'Admin',
            'message' => implode("\n", $chatConfirmation),
        ]);

        if ($session->status === 'nieuw') {
            $session->status = 'open';
        }

        $session->last_message_at = now();
        $session->save();

        return back()->with('success', 'Afspraakbevestiging is per e-mail verstuurd naar de klant.');
    }
}
